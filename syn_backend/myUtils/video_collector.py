"""
Video data auto-collection system.
Collects full video lists for supported platforms using saved cookies.
"""
import asyncio
import os
import sqlite3
import json
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

import httpx
from playwright.async_api import Page, async_playwright, TimeoutError as PlaywrightTimeoutError

from config.conf import PLAYWRIGHT_HEADLESS
import re
from myUtils.analytics_db import ensure_analytics_schema, upsert_video_analytics_by_key

BASE_DIR = Path(__file__).parent.parent
DB_PATH = BASE_DIR / os.getenv("DB_PATH_REL", "db/database.db")
WAIT_TIMEOUT = int(os.getenv("COLLECT_WAIT_MS", "45000"))
HEADLESS = PLAYWRIGHT_HEADLESS
DEFAULT_UA = os.getenv(
    "PLAYWRIGHT_UA",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/120.0.0.0 Safari/537.36",
)


class VideoDataCollector:
    def __init__(self):
        self.init_database()

    def init_database(self):
        """Ensure the analytics table exists."""
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()

            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS video_analytics (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    account_id TEXT NOT NULL,
                    platform TEXT NOT NULL,
                    video_id TEXT NOT NULL,
                    title TEXT,
                    cover_url TEXT,
                    publish_time TEXT,
                    duration INTEGER,
                    views INTEGER DEFAULT 0,
                    likes INTEGER DEFAULT 0,
                    comments INTEGER DEFAULT 0,
                    shares INTEGER DEFAULT 0,
                    favorites INTEGER DEFAULT 0,
                    completion_rate REAL,
                    avg_watch_time INTEGER,
                    status TEXT DEFAULT 'published',
                    collected_at TEXT NOT NULL,
                    UNIQUE(account_id, video_id)
                )
                """
            )

            conn.commit()

        # migrate legacy schema to include missing columns used by collector
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            cursor.execute("PRAGMA table_info(video_analytics)")
            existing_cols = {row[1] for row in cursor.fetchall()}

            def add_column(name: str, ddl: str):
                if name not in existing_cols:
                    cursor.execute(f"ALTER TABLE video_analytics ADD COLUMN {name} {ddl}")

            add_column("cover_url", "TEXT")
            add_column("publish_time", "TEXT")
            add_column("duration", "INTEGER")
            add_column("views", "INTEGER DEFAULT 0")
            add_column("likes", "INTEGER DEFAULT 0")
            add_column("comments", "INTEGER DEFAULT 0")
            add_column("shares", "INTEGER DEFAULT 0")
            add_column("favorites", "INTEGER DEFAULT 0")
            add_column("completion_rate", "REAL")
            add_column("avg_watch_time", "INTEGER")
            add_column("status", "TEXT DEFAULT 'published'")
            add_column("collected_at", "TEXT")
            conn.commit()

        # create indexes after columns are ensured
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                CREATE INDEX IF NOT EXISTS idx_video_analytics_account
                ON video_analytics(account_id)
                """
            )
            cursor.execute(
                """
                CREATE INDEX IF NOT EXISTS idx_video_analytics_platform
                ON video_analytics(platform)
                """
            )
            cursor.execute(
                """
                CREATE INDEX IF NOT EXISTS idx_video_analytics_collected
                ON video_analytics(collected_at)
                """
            )
            conn.commit()
            print("[Collector] Database initialized")

    async def collect_douyin_data_api(self, cookie_file: str, account_id: str) -> Dict[str, Any]:
        """Collect Douyin videos via creator API (faster and layout-independent)."""
        cookies = self._load_cookie_list(cookie_file)
        if not cookies:
            return {"success": False, "error": "Cookie file not found or invalid"}

        cookie_header = self._cookie_header(cookies, domain_filter="douyin.com") or self._cookie_header(cookies)
        if not cookie_header:
            return {"success": False, "error": "No cookie header available"}

        headers = {
            "User-Agent": DEFAULT_UA,
            "Referer": "https://creator.douyin.com/",
            "Cookie": cookie_header,
        }

        url = "https://creator.douyin.com/web/api/media/aweme/list"
        cursor = 0
        has_more = True
        videos: List[Dict[str, Any]] = []
        rounds = 0

        async with httpx.AsyncClient(headers=headers, timeout=30.0) as client:
            while has_more and rounds < 200:
                rounds += 1
                try:
                    resp = await client.get(url, params={"cursor": cursor, "count": 20, "status": 1})
                except httpx.HTTPError as exc:  # noqa: BLE001
                    return {"success": False, "error": f"Request failed: {exc}"}

                if resp.status_code >= 400:
                    detail = ""
                    try:
                        detail = resp.text
                    except Exception:
                        pass
                    return {"success": False, "error": f"HTTP {resp.status_code}: {detail}"}

                data = resp.json()
                payload = data.get("data") or data
                aweme_list = payload.get("aweme_list") or []
                for item in aweme_list:
                    stats = item.get("statistics", {}) if isinstance(item, dict) else {}
                    title = item.get("desc") or item.get("title") or ""
                    cover = None
                    try:
                        cover = item.get("video", {}).get("cover", {}).get("url_list", [None])[0]
                    except Exception:
                        cover = None
                    videos.append(
                        {
                            "video_id": item.get("aweme_id") or "",
                            "title": title,
                            "cover_url": cover,
                            "views": stats.get("play_count") or stats.get("play_count_v2") or 0,
                            "likes": stats.get("digg_count") or 0,
                            "comments": stats.get("comment_count") or 0,
                            "shares": stats.get("share_count") or 0,
                            "publish_time": item.get("create_time"),
                        }
                    )

                has_more_raw = payload.get("has_more")
                has_more = has_more_raw in (1, "1", True)
                cursor = payload.get("cursor", cursor + 20)

        saved_count = 0
        for video in videos:
            if video.get("video_id"):
                self.save_video_data(account_id, "douyin", video)
                saved_count += 1

        return {"success": True, "count": saved_count, "videos": videos}

    def _load_cookie_list(self, cookie_file: str) -> List[Dict[str, Any]]:
        """Load cookies from playwright storage or raw list."""
        path = BASE_DIR / "cookiesFile" / cookie_file
        if not path.exists():
            return []
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except Exception:
            return []

        cookies: List[Dict[str, Any]] = []
        if isinstance(data, dict):
            if isinstance(data.get("cookies"), list):
                cookies = data.get("cookies", [])
            elif isinstance(data.get("origins"), list):
                for origin in data.get("origins", []):
                    cookies.extend(origin.get("cookies", []))
        elif isinstance(data, list):
            cookies = data
        return cookies

    def _cookie_header(self, cookies: List[Dict[str, Any]], domain_filter: Optional[str] = None) -> str:
        """Build Cookie header string from cookie list."""
        pairs = []
        for c in cookies:
            if not c or "name" not in c or "value" not in c:
                continue
            if domain_filter and domain_filter not in (c.get("domain") or ""):
                continue
            pairs.append(f"{c['name']}={c['value']}")
        return "; ".join(pairs)

    async def _collect_with_scroll(
        self,
        page: Page,
        extract_script: str,
        *,
        scroll_script: Optional[str] = None,
        max_rounds: int = 30,
        wait_ms: int = 800,
    ) -> List[Dict[str, Any]]:
        """
        Repeatedly extract items while scrolling to load more results.
        Stops after two rounds with no new items or hitting max_rounds.
        """
        collected: Dict[str, Dict[str, Any]] = {}
        idle_rounds = 0

        for _ in range(max_rounds):
            try:
                items = await page.evaluate(extract_script)
            except Exception as exc:  # noqa: BLE001
                print(f"[Collector] Extract failed: {exc}")
                break

            if not items:
                items = []

            new_items = 0
            for item in items:
                video_id = item.get("video_id") or item.get("id")
                if video_id and video_id not in collected:
                    collected[video_id] = item
                    new_items += 1

            if new_items == 0:
                idle_rounds += 1
            else:
                idle_rounds = 0

            scroll_js = scroll_script or "window.scrollTo(0, document.body.scrollHeight);"
            try:
                await page.evaluate(scroll_js)
            except Exception:
                pass
            await page.wait_for_timeout(wait_ms)

            if idle_rounds >= 2:
                break

        return list(collected.values())

    async def collect_kuaishou_data(self, cookie_file: str, account_id: str) -> Dict[str, Any]:
        """Collect Kuaishou videos for the given account."""
        print("[Kuaishou] Start collecting data...")

        cookie_path = BASE_DIR / "cookiesFile" / cookie_file
        if not cookie_path.exists():
            return {"success": False, "error": "Cookie file not found"}

        async with async_playwright() as p:
            browser = await p.chromium.launch(
                headless=HEADLESS,
                args=["--disable-blink-features=AutomationControlled"],
            )
            context = await browser.new_context(
                storage_state=cookie_path,
                user_agent=DEFAULT_UA,
                viewport={"width": 1366, "height": 768},
            )
            page = await context.new_page()

            try:
                await page.goto("https://cp.kuaishou.com/article/manage/video", timeout=30000)
                await page.wait_for_load_state("networkidle")

                if "login" in page.url:
                    return {"success": False, "error": "Login expired"}

                await page.wait_for_selector(".video-item, .content-item", timeout=WAIT_TIMEOUT)

                videos = await self._collect_with_scroll(
                    page,
                    """
                    () => {
                        const items = document.querySelectorAll('.video-item, .content-item');
                        return Array.from(items).map(item => {
                            const titleEl = item.querySelector('.title, .video-title');
                            return {
                                video_id: item.getAttribute('data-id') || '',
                                title: titleEl ? titleEl.textContent.trim() : '',
                                cover_url: item.querySelector('img')?.src || '',
                                views: parseInt(item.querySelector('[data-type="view"]')?.textContent.replace(/[^0-9]/g, '') || '0'),
                                likes: parseInt(item.querySelector('[data-type="like"]')?.textContent.replace(/[^0-9]/g, '') || '0'),
                                comments: parseInt(item.querySelector('[data-type="comment"]')?.textContent.replace(/[^0-9]/g, '') || '0'),
                                publish_time: item.querySelector('.publish-time, .time')?.textContent.trim() || ''
                            };
                        });
                    }
                    """,
                    max_rounds=40,
                    wait_ms=1200,
                )

                saved_count = 0
                for video in videos:
                    if video.get("video_id"):
                        self.save_video_data(account_id, "kuaishou", video)
                        saved_count += 1

                if saved_count > 0:
                    print(f"[Kuaishou] Collected {saved_count} videos")
                    return {"success": True, "count": saved_count, "videos": videos}
                
                # Fallback to click-to-detail if no IDs found
                print("[Kuaishou] No ids from DOM, trying click-to-detail fallback...")
                click_videos = await self._collect_kuaishou_ids_by_click(page, max_items=30)
                click_saved = 0
                for video in click_videos:
                    if video.get("video_id"):
                        self.save_video_data(account_id, "kuaishou", video)
                        click_saved += 1
                
                if click_saved > 0:
                    return {"success": True, "count": click_saved, "videos": click_videos}

                return {"success": False, "error": "No videos found"}

            except PlaywrightTimeoutError:
                return {"success": False, "error": "Timeout waiting for video list"}
            except Exception as e:  # noqa: BLE001
                print(f"[Kuaishou] Collect failed: {e}")
                return {"success": False, "error": str(e)}
            finally:
                await browser.close()

    async def collect_xiaohongshu_data(self, cookie_file: str, account_id: str) -> Dict[str, Any]:
        """Collect Xiaohongshu videos for the given account."""
        print("[XHS] Start collecting data...")

        cookie_path = BASE_DIR / "cookiesFile" / cookie_file
        if not cookie_path.exists():
            return {"success": False, "error": "Cookie file not found"}

        async with async_playwright() as p:
            browser = await p.chromium.launch(
                headless=HEADLESS,
                args=["--disable-blink-features=AutomationControlled"],
            )
            context = await browser.new_context(
                storage_state=cookie_path,
                user_agent=DEFAULT_UA,
                viewport={"width": 1366, "height": 768},
            )
            page = await context.new_page()

            try:
                await page.goto("https://creator.xiaohongshu.com/new/note-manager", timeout=WAIT_TIMEOUT)
                await page.wait_for_load_state("networkidle")

                if "login" in page.url:
                    return {"success": False, "error": "Login expired"}

                await page.wait_for_selector(
                    ".note-item, .content-card, .note-card, [data-note-id], [data-id]",
                    timeout=WAIT_TIMEOUT,
                )

                videos = await self._collect_with_scroll(
                    page,
                    """
                    () => {
                        const items = document.querySelectorAll('.note-item, .content-card, .note-card, [data-note-id], [data-id]');
                        return Array.from(items).map(item => {
                            const num = (selector) => {
                                const el = item.querySelector(selector);
                                return el ? parseInt(el.textContent.replace(/[^0-9]/g, '') || '0') : 0;
                            };
                            return {
                                video_id: item.getAttribute('data-note-id') || item.getAttribute('data-id') || '',
                                title: item.querySelector('.title, .note-title, .name')?.textContent.trim() || '',
                                cover_url: item.querySelector('img')?.src || '',
                                views: num('.view-count, [class*="view"]'),
                                likes: num('.like-count, [class*="like"]'),
                                comments: num('.comment-count, [class*="comment"]'),
                                favorites: num('.collect-count, [class*="collect"]'),
                                publish_time: item.querySelector('.publish-time, .time, .date, .time-text')?.textContent.trim() || ''
                            };
                        });
                    }
                    """,
                    max_rounds=40,
                    wait_ms=1200,
                )

                saved_count = 0
                for video in videos:
                    if video.get("video_id"):
                        self.save_video_data(account_id, "xiaohongshu", video)
                        saved_count += 1

                print(f"[XHS] Collected {saved_count} videos")
                return {"success": True, "count": saved_count, "videos": videos}

            except PlaywrightTimeoutError:
                return {"success": False, "error": "Timeout waiting for content list (login expired or layout changed)"}
            except Exception as e:  # noqa: BLE001
                print(f"[XHS] Collect failed: {e}")
                return {"success": False, "error": str(e)}
            finally:
                await browser.close()

    async def collect_douyin_data(self, cookie_file: str, account_id: str) -> Dict[str, Any]:
        """Collect Douyin videos for the given account."""
        print("[Douyin] Start collecting data...")

        cookie_path = BASE_DIR / "cookiesFile" / cookie_file
        if not cookie_path.exists():
            return {"success": False, "error": "Cookie file not found"}

        # Prefer API crawling for speed and stability
        api_result = await self.collect_douyin_data_api(cookie_file, account_id)
        if api_result.get("success") and api_result.get("count", 0) > 0:
            return api_result
        else:
            # success=true but count=0 is a common case; still fallback
            print(f"[Douyin] API collect failed, fallback to page: {api_result.get('error')}")

        async with async_playwright() as p:
            browser = await p.chromium.launch(
                headless=HEADLESS,
                args=["--disable-blink-features=AutomationControlled"],
            )
            context = await browser.new_context(
                storage_state=cookie_path,
                user_agent=DEFAULT_UA,
                viewport={"width": 1366, "height": 768},
            )
            page = await context.new_page()

            try:
                await page.goto("https://creator.douyin.com/creator-micro/content/manage", timeout=WAIT_TIMEOUT)
                await page.wait_for_load_state("networkidle")
                await self._close_douyin_popups(page)

                if "login" in page.url or "passport" in page.url:
                    return {"success": False, "error": "Login expired"}

                # Wait for either legacy table rows or new card layout / detail links
                await page.wait_for_selector(
                    "a[href*='/creator-micro/work-management/work-detail/'], "
                    "div[class*='video-card-info'], "
                    ".video-card-info-aglKIQ, "
                    "[data-row-key], [data-id], .semi-table-row, .video-item, .video-card, .video-card-wrapper",
                    timeout=WAIT_TIMEOUT,
                )

                # First try: parse work-detail links directly (stable across class changes)
                videos = await self._collect_with_scroll(
                    page,
                    """
                    () => {
                        const out = [];
                        const re = /\\/creator-micro\\/work-management\\/work-detail\\/(\\d+)/;
                        const links = document.querySelectorAll("a[href*='/creator-micro/work-management/work-detail/']");
                        for (const a of links) {
                            const href = a.getAttribute("href") || "";
                            const m = href.match(re);
                            if (!m) continue;
                            const card = a.closest("div") || a.parentElement;
                            const titleEl = card ? card.querySelector("[class*='title'], .card-title, .video-title") : null;
                            const coverEl = card ? card.querySelector("img") : null;
                            out.push({
                                video_id: m[1],
                                title: titleEl ? titleEl.textContent.trim() : "",
                                cover_url: coverEl ? coverEl.src : "",
                                views: 0,
                                likes: 0,
                                comments: 0,
                                shares: 0,
                                publish_time: ""
                            });
                        }
                        if (out.length) return out;

                        const nodes = document.querySelectorAll('[data-row-key], [data-id], .semi-table-row, .video-item, .video-card, .video-card-wrapper');
                        return Array.from(nodes).map(node => {
                            const id = node.getAttribute('data-row-key') || node.getAttribute('data-id') || node.getAttribute('data-aweme-id') || '';
                            const titleEl = node.querySelector('.title-container, .video-title, [class*="title"], .card-title');
                            const coverEl = node.querySelector('img');
                            const text = (selector) => {
                                const el = node.querySelector(selector);
                                return el ? el.textContent.replace(/[^0-9]/g, '') : '';
                            };
                            return {
                                video_id: id,
                                title: titleEl ? titleEl.textContent.trim() : '',
                                cover_url: coverEl ? coverEl.src : '',
                                views: parseInt(text('[class*="play"], [class*="view"], [data-e2e="play-count"], .play-count, .view-count') || '0'),
                                likes: parseInt(text('[class*="like"], [class*="digg"], [data-e2e="like-count"], .like-count, .digg-count') || '0'),
                                comments: parseInt(text('[class*="comment"], [data-e2e="comment-count"], .comment-count') || '0'),
                                shares: parseInt(text('[class*="share"], [class*="forward"], [data-e2e="share-count"], .share-count') || '0'),
                                publish_time: (node.querySelector('[class*="time"], .publish-time, [data-e2e="publish-time"], .time')?.textContent || '').trim()
                            };
                        }).filter(v => v.video_id);
                    }
                    """,
                    scroll_script="""
                        () => {
                            const tableBody = document.querySelector('.semi-table-body, .semi-table-virtual-list');
                            if (tableBody) {
                                tableBody.scrollTop = tableBody.scrollHeight;
                            }
                            window.scrollTo(0, document.body.scrollHeight);
                        }
                    """,
                    max_rounds=50,
                    wait_ms=1000,
                )

                saved_count = 0
                for video in videos:
                    if video.get("video_id"):
                        self.save_video_data(account_id, "douyin", video)
                        saved_count += 1

                if saved_count > 0:
                    print(f"[Douyin] Collected {saved_count} videos")
                    return {"success": True, "count": saved_count, "videos": videos}

                # Fallback: click each video card to navigate to work-detail page and extract ID from URL.
                print("[Douyin] No ids from DOM, trying click-to-detail fallback...")
                click_videos = await self._collect_douyin_ids_by_click(page, max_items=50)
                click_saved = 0
                for video in click_videos:
                    if video.get("video_id"):
                        self.save_video_data(account_id, "douyin", video)
                        click_saved += 1

                if click_saved > 0:
                    print(f"[Douyin] Collected {click_saved} videos (click fallback)")
                    return {"success": True, "count": click_saved, "videos": click_videos}

                return {"success": False, "error": "No work ids found (layout changed?)"}

            except PlaywrightTimeoutError:
                try:
                    await page.screenshot(path=BASE_DIR / "logs" / f"douyin_timeout_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png")
                except Exception:
                    pass
                return {"success": False, "error": "Timeout waiting for video list (login expired or layout changed)"}
            except Exception as e:  # noqa: BLE001
                print(f"[Douyin] Collect failed: {e}")
                try:
                    await page.screenshot(path=BASE_DIR / "logs" / f"douyin_error_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png")
                except Exception:
                    pass
                return {"success": False, "error": str(e)}
            finally:
                await browser.close()

    async def _close_douyin_popups(self, page: Page) -> None:
        """Best-effort close of Douyin newbie popups that block clicks."""
        selectors = [
            "button:has-text('我知道了')",
            "button:has-text('知道了')",
            "button:has-text('跳过')",
            "[role='dialog'] button:has-text('我知道了')",
            "[aria-label='关闭']",
            "[aria-label='close']",
        ]
        for _ in range(6):
            closed = False
            for sel in selectors:
                try:
                    btn = page.locator(sel).first
                    if await btn.count() > 0 and await btn.is_visible():
                        await btn.click()
                        await page.wait_for_timeout(250)
                        closed = True
                        break
                except Exception:
                    continue
            if not closed:
                return

    async def _collect_douyin_ids_by_click(self, page: Page, max_items: int = 50) -> List[Dict[str, Any]]:
        """
        Extract Douyin work_id by clicking items in content manage list.
        The work detail URL looks like:
          https://creator.douyin.com/creator-micro/work-management/work-detail/<work_id>?...
        """
        manage_url = "https://creator.douyin.com/creator-micro/content/manage"
        work_re = re.compile(r"/creator-micro/work-management/work-detail/(\d+)")

        def parse_work_id(url: str) -> str:
            m = work_re.search(url or "")
            return m.group(1) if m else ""

        # Fast path: if there are links with href, parse directly without navigation.
        ids: List[str] = []
        try:
            link_loc = page.locator("a[href*='/creator-micro/work-management/work-detail/']")
            link_count = await link_loc.count()
            for i in range(min(link_count, max_items)):
                href = await link_loc.nth(i).get_attribute("href")
                work_id = parse_work_id(href or "")
                if work_id:
                    ids.append(work_id)
        except Exception:
            ids = []

        if ids:
            uniq = []
            seen = set()
            for wid in ids:
                if wid in seen:
                    continue
                seen.add(wid)
                uniq.append(wid)
            return [{"video_id": wid, "title": "", "cover_url": ""} for wid in uniq]

        results: List[Dict[str, Any]] = []
        seen_ids = set()

        # UI path: click card info area to open detail page, then parse URL for work_id.
        # User-provided XPath points to `div.video-card-info-*`.
        card_selectors = [
            "div[class*='video-card-info']",
            "div[class*='video-card-content'] div[class*='video-card-info']",
            ".video-card-info-aglKIQ",
        ]

        cards = None
        for sel in card_selectors:
            loc = page.locator(sel)
            try:
                if await loc.count() > 0:
                    cards = loc
                    break
            except Exception:
                continue

        if cards is None:
            return []

        count = await cards.count()
        for idx in range(min(count, max_items)):
            detail_page = page
            try:
                await self._close_douyin_popups(page)
                item = cards.nth(idx)
                await item.scroll_into_view_if_needed()
                # Some layouts open detail in a new tab; handle both.
                try:
                    async with page.expect_popup(timeout=1500) as popup_info:
                        await item.click()
                    detail_page = await popup_info.value
                except PlaywrightTimeoutError:
                    await item.click()

                # Poll URL until it becomes a work-detail page.
                work_id = ""
                for _ in range(20):  # ~10s
                    work_id = parse_work_id(detail_page.url)
                    if work_id:
                        break
                    await detail_page.wait_for_timeout(500)

                if work_id and work_id not in seen_ids:
                    seen_ids.add(work_id)
                    # Try scraping stats on detail page
                    stats = {"video_id": work_id, "title": "", "cover_url": "", "views": 0, "likes": 0, "comments": 0, "shares": 0}
                    try:
                        title_el = await detail_page.locator("h1, .video-title, [class*='title']").first
                        if await title_el.count() > 0:
                            stats["title"] = await title_el.inner_text()
                        
                        # Douyin detail stats often in .work-data-item or similar
                        data_items = await detail_page.locator("[class*='work-data-item'], [class*='data-info-item']").all()
                        for item in data_items:
                            text = await item.inner_text()
                            val_m = re.search(r'(\d+)', text.replace(',', ''))
                            val = int(val_m.group(1)) if val_m else 0
                            if "播放" in text: stats["views"] = val
                            elif "点赞" in text: stats["likes"] = val
                            elif "评论" in text: stats["comments"] = val
                            elif "分享" in text: stats["shares"] = val
                    except: pass
                    results.append(stats)

            except Exception:
                pass
            finally:
                if detail_page is not page:
                    try:
                        await detail_page.close()
                    except Exception:
                        pass
                # Return to manage page for next item
                try:
                    await page.goto(manage_url, timeout=WAIT_TIMEOUT)
                    await page.wait_for_load_state("networkidle")
                    await self._close_douyin_popups(page)
                except Exception:
                    pass

        return results

    async def collect_channels_data(self, cookie_file: str, account_id: str) -> Dict[str, Any]:
        """Collect WeChat Channels videos for the given account."""
        print("[Channels] Start collecting data...")

        cookie_path = BASE_DIR / "cookiesFile" / cookie_file
        if not cookie_path.exists():
            return {"success": False, "error": "Cookie file not found"}

        async with async_playwright() as p:
            browser = await p.chromium.launch(
                headless=HEADLESS,
                args=["--disable-blink-features=AutomationControlled"],
            )
            context = await browser.new_context(
                storage_state=cookie_path,
                user_agent=DEFAULT_UA,
                viewport={"width": 1366, "height": 768},
            )
            page = await context.new_page()

            try:
                await page.goto("https://channels.weixin.qq.com/platform/post/list", timeout=30000)
                await page.wait_for_load_state("networkidle")

                if "login" in page.url:
                    return {"success": False, "error": "Login expired"}

                await page.wait_for_selector(".video-item, .post-item, [data-feedid], [data-id]", timeout=WAIT_TIMEOUT)

                videos = await self._collect_with_scroll(
                    page,
                    """
                    () => {
                        const items = document.querySelectorAll('.video-item, .post-item');
                        return Array.from(items).map(item => {
                            return {
                                video_id: item.getAttribute('data-feedid') || item.getAttribute('data-id') || '',
                                title: item.querySelector('.title, .post-title')?.textContent.trim() || '',
                                cover_url: item.querySelector('img')?.src || '',
                                views: parseInt(item.querySelector('.view-num, [class*="view"]')?.textContent.replace(/[^0-9]/g, '') || '0'),
                                likes: parseInt(item.querySelector('.like-num, [class*="like"]')?.textContent.replace(/[^0-9]/g, '') || '0'),
                                comments: parseInt(item.querySelector('.comment-num, [class*="comment"]')?.textContent.replace(/[^0-9]/g, '') || '0'),
                                shares: parseInt(item.querySelector('.share-num, [class*="share"]')?.textContent.replace(/[^0-9]/g, '') || '0'),
                                publish_time: item.querySelector('.publish-time, .time')?.textContent.trim() || ''
                            };
                        });
                    }
                    """,
                    max_rounds=40,
                    wait_ms=1200,
                )

                saved_count = 0
                for video in videos:
                    if video.get("video_id"):
                        self.save_video_data(account_id, "channels", video)
                        saved_count += 1

                print(f"[Channels] Collected {saved_count} videos")
                return {"success": True, "count": saved_count, "videos": videos}

            except PlaywrightTimeoutError:
                return {"success": False, "error": "Timeout waiting for post list (login expired or layout changed)"}
            except Exception as e:  # noqa: BLE001
                print(f"[Channels] Collect failed: {e}")
                return {"success": False, "error": str(e)}
            finally:
                await browser.close()

    async def _collect_kuaishou_ids_by_click(self, page: Page, max_items: int = 50) -> List[Dict[str, Any]]:
        """
        Extract Kuaishou photoId by clicking items in management list.
        The work detail URL usually matches:
          https://cp.kuaishou.com/article/manage/video/detail/<photoId>
        """
        manage_url = "https://cp.kuaishou.com/article/manage/video"
        photo_re = re.compile(r"/detail/([^/?#]+)")

        def parse_photo_id(url: str) -> str:
            m = photo_re.search(url or "")
            return m.group(1) if m else ""

        results: List[Dict[str, Any]] = []
        seen_ids = set()

        # Selection of work items
        card_selectors = [
            ".video-item",
            ".content-item",
            "[class*='item-wrapper']",
            "[class*='content-card']"
        ]

        cards = None
        for sel in card_selectors:
            loc = page.locator(sel)
            try:
                if await loc.count() > 0:
                    cards = loc
                    break
            except Exception:
                continue

        if cards is None:
            return []

        count = await cards.count()
        for idx in range(min(count, max_items)):
            detail_page = page
            try:
                item = cards.nth(idx)
                await item.scroll_into_view_if_needed()
                
                # Try clicking the item
                try:
                    async with page.expect_popup(timeout=2000) as popup_info:
                        await item.click()
                    detail_page = await popup_info.value
                except PlaywrightTimeoutError:
                    await item.click()

                # Poll URL for photoId
                photo_id = ""
                for _ in range(20):
                    photo_id = parse_photo_id(detail_page.url)
                    if photo_id:
                        break
                    await detail_page.wait_for_timeout(500)

                if photo_id and photo_id not in seen_ids:
                    seen_ids.add(photo_id)
                    # Try to extract title/stats on the detail page if possible
                    stats = {"video_id": photo_id, "title": "", "cover_url": "", "views": 0, "likes": 0, "comments": 0}
                    try:
                        title_el = await detail_page.locator("h1, .video-title, [class*='title']").first
                        if await title_el.count() > 0:
                            stats["title"] = await title_el.inner_text()
                        
                        # Kuaishou detail stats
                        stats_el = await detail_page.locator(".data-num, [class*='data-item']").all()
                        for idx, s_el in enumerate(stats_el):
                            text = await s_el.inner_text()
                            val_m = re.search(r'(\d+)', text.replace(',', ''))
                            val = int(val_m.group(1)) if val_m else 0
                            # Guessing order if no text labels: views, likes, comments
                            if idx == 0: stats["views"] = val
                            elif idx == 1: stats["likes"] = val
                            elif idx == 2: stats["comments"] = val
                    except: pass
                    
                    results.append(stats)

            except Exception:
                pass
            finally:
                if detail_page is not page:
                    try: await detail_page.close()
                    except: pass
                # Navigation back if needed
                if page.url != manage_url:
                    try:
                        await page.goto(manage_url, timeout=WAIT_TIMEOUT)
                        await page.wait_for_load_state("networkidle")
                    except: pass

        return results

    def save_video_data(self, account_id: str, platform: str, video_data: Dict[str, Any]):
        """Insert or update a single video row using analytics_db logic."""
        # Map collector fields to analytics_db fields
        data_to_save = {
            "account_id": account_id,
            "platform": platform,
            "video_id": video_data.get("video_id"),
            "title": video_data.get("title"),
            "thumbnail": video_data.get("cover_url"),
            "publish_date": video_data.get("publish_time"),
            "play_count": video_data.get("views", 0),
            "like_count": video_data.get("likes", 0),
            "comment_count": video_data.get("comments", 0),
            "share_count": video_data.get("shares", 0),
            "collect_count": video_data.get("favorites", 0),
            "raw_data": video_data
        }
        
        try:
            upsert_video_analytics_by_key(
                DB_PATH,
                platform=platform,
                video_id=video_data.get("video_id"),
                data=data_to_save
            )
        except Exception as e:
            print(f"[Collector] Error saving to DB: {e}")

    async def collect_all_accounts(
        self,
        account_ids: Optional[List[str]] = None,
        platform_filter: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Collect videos for all valid accounts, optionally filtered."""
        from myUtils.cookie_manager import cookie_manager

        allowed_ids = set(account_ids) if account_ids else None
        platform_name = platform_filter.lower() if platform_filter else None

        accounts = cookie_manager.list_flat_accounts()
        results: Dict[str, Any] = {"total": 0, "success": 0, "failed": 0, "details": []}

        for account in accounts:
            if account.get("status") != "valid" or not account.get("cookie_file"):
                continue
            if allowed_ids and account.get("account_id") not in allowed_ids:
                continue
            if platform_name and account.get("platform") != platform_name:
                continue

            platform = account["platform"]
            account_id = account["account_id"]
            cookie_file = account["cookie_file"]

            print("\n" + "=" * 50)
            print(f"[Collector] Collect account: {account['name']} ({platform})")
            print("=" * 50)

            result: Optional[Dict[str, Any]] = None
            if platform == "kuaishou":
                result = await self.collect_kuaishou_data(cookie_file, account_id)
            elif platform == "xiaohongshu":
                result = await self.collect_xiaohongshu_data(cookie_file, account_id)
            elif platform == "douyin":
                result = await self.collect_douyin_data(cookie_file, account_id)
            elif platform == "channels":
                result = await self.collect_channels_data(cookie_file, account_id)

            if result:
                results["total"] += 1
                if result.get("success"):
                    results["success"] += 1
                else:
                    results["failed"] += 1

                results["details"].append(
                    {
                        "account": account["name"],
                        "account_id": account_id,
                        "platform": platform,
                        **result,
                    }
                )

        return results


collector = VideoDataCollector()


if __name__ == "__main__":
    print("=" * 50)
    print("Video data auto-collector")
    print("=" * 50)

    results = asyncio.run(collector.collect_all_accounts())

    print("\n" + "=" * 50)
    print("Collection report")
    print("=" * 50)
    print(f"Total accounts: {results['total']}")
    print(f"Success: {results['success']}")
    print(f"Failed: {results['failed']}")

    for detail in results["details"]:
        status = "OK" if detail.get("success") else "FAIL"
        count = detail.get("count", 0)
        error = detail.get("error", "")
        if detail.get("success"):
            print(f"{status} {detail['account']} ({detail['platform']}): {count} videos")
        else:
            print(f"{status} {detail['account']} ({detail['platform']}): {error}")
