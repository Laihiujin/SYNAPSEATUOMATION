"""
Social Media Copilot client.

This repo vendors the open-source `social-media-copilot` browser extension under
`syn_backend/social-media-copilot/`. The extension runs requests inside the page
world to reuse site JS context and authenticated cookies.

To avoid depending on an external "copilot server", we implement the same idea
in the backend using Playwright:
1) load cookies into a browser context
2) navigate to the target origin (e.g. https://www.douyin.com)
3) execute `fetch()` in the page context and return JSON
"""

from __future__ import annotations

import json
from typing import Any, Dict, List, Optional
from urllib.parse import urlencode, urlparse, urlunparse, parse_qsl

from loguru import logger
from playwright.async_api import async_playwright, Browser, BrowserContext, Page, Playwright

from config.conf import LOCAL_CHROME_PATH, PLAYWRIGHT_HEADLESS


def _douyin_common_params() -> Dict[str, Any]:
    """
    Align with `social-media-copilot/src/entrypoints/dy.content/api/request.ts`.
    These params are commonly required for Douyin web endpoints.
    """
    return {
        "aid": 6383,
        "device_platform": "webapp",
        "channel": "channel_pc_web",
        "version_code": 170400,
        "version_name": "17.4.0",
        "platform": "PC",
        "pc_client_type": 1,
        "cookie_enabled": True,
        "screen_width": 2560,
        "screen_height": 1440,
        "browser_language": "zh-CN",
        "browser_platform": "Linux x86_64",
        "browser_name": "Chrome",
        "browser_version": "124.0.0.0",
        "browser_online": True,
        "engine_name": "Blink",
        "engine_version": "124.0.0.0",
        "os_name": "Linux",
    }


def _merge_query(url: str, params: Optional[Dict[str, Any]]) -> str:
    if not params:
        return url
    u = urlparse(url)
    q = dict(parse_qsl(u.query, keep_blank_values=True))
    for k, v in params.items():
        if v is None:
            continue
        q[str(k)] = str(v)
    return urlunparse(u._replace(query=urlencode(q, doseq=True)))

def _random_hex(n: int) -> str:
    import random
    alphabet = "abcdef0123456789"
    return "".join(random.choice(alphabet) for _ in range(n))


async def _try_xhs_webmsxyw(page: Page, path: str, body: Any) -> Optional[str]:
    """
    Prefer site-provided signer if available.
    Extension code comments this path out but it may exist on some builds.
    """
    js = """
      async ({ path, body }) => {
        try {
          // @ts-ignore
          const fn = window["_webmsxyw"];
          if (!fn) return null;
          // @ts-ignore
          return fn(path, body ?? undefined) || null;
        } catch (e) {
          return null;
        }
      }
    """
    try:
        return await page.evaluate(js, {"path": path, "body": body})
    except Exception:
        return None


class SocialMediaCopilotClient:
    """
    A lightweight Playwright-backed request runner.
    Returned dict format matches the previous HTTP client:
      - {"success": True, "data": <json>}
      - {"success": False, "error": "...", "status_code": 403}
    """

    def __init__(self, *, headless: bool = PLAYWRIGHT_HEADLESS, timeout_ms: int = 20_000):
        self.headless = headless
        self.timeout_ms = timeout_ms
        self._pw: Optional[Playwright] = None
        self._browser: Optional[Browser] = None
        self._context: Optional[BrowserContext] = None
        self._page: Optional[Page] = None
        self._origin: Optional[str] = None

    async def close(self) -> None:
        try:
            if self._context:
                await self._context.close()
        finally:
            self._context = None
            self._page = None
            self._origin = None
            try:
                if self._browser:
                    await self._browser.close()
            finally:
                self._browser = None
                try:
                    if self._pw:
                        await self._pw.stop()
                finally:
                    self._pw = None

    async def _ensure_started(self) -> None:
        if self._pw and self._browser and self._context and self._page:
            return
        self._pw = await async_playwright().start()
        launch_kwargs: Dict[str, Any] = {
            "headless": self.headless,
            "args": [
                "--disable-blink-features=AutomationControlled",
                "--disable-dev-shm-usage",
                "--no-sandbox",
            ],
        }
        try:
            self._browser = await self._pw.chromium.launch(**launch_kwargs)
        except Exception as exc:
            # Common on Windows when Playwright browsers were not installed: spawn ENOENT.
            chrome_path = (
                os.getenv("PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH")
                or os.getenv("CHROME_PATH")
                or LOCAL_CHROME_PATH
            )
            if chrome_path and Path(chrome_path).exists():
                logger.warning(f"Playwright bundled Chromium launch failed, retry with Chrome: {exc}")
                self._browser = await self._pw.chromium.launch(**{**launch_kwargs, "executable_path": chrome_path})
            else:
                raise

        self._context = await self._browser.new_context(
            locale="zh-CN",
            timezone_id="Asia/Shanghai",
            viewport={"width": 1440, "height": 900},
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
            ),
        )
        self._context.set_default_timeout(self.timeout_ms)
        self._page = await self._context.new_page()

        # Best-effort stealth init script (same file used by uploaders).
        try:
            candidates = [
                Path(__file__).resolve().parent.parent.parent / "utils" / "stealth.min.js",
                Path(__file__).resolve().parent.parent.parent / "fastapi_app" / "utils" / "stealth.min.js",
            ]
            for p in candidates:
                if p.exists():
                    await self._context.add_init_script(path=str(p))
                    break
        except Exception:
            pass

    async def _ensure_origin(self, url: str) -> None:
        await self._ensure_started()
        assert self._page is not None
        u = urlparse(url)
        origin = f"{u.scheme}://{u.netloc}"
        if not origin or origin == "://":
            raise ValueError(f"Invalid url: {url}")
        if self._origin != origin:
            self._origin = origin
            try:
                await self._page.goto(origin, wait_until="domcontentloaded")
            except Exception:
                # Some sites may block blank landing; still try to fetch later.
                pass

    async def set_cookies(self, url: str, cookies: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Accepts cookies in Chrome export / storageState-like format:
          - domain/name/value/path/expirationDate/httpOnly/secure/sameSite
        """
        try:
            await self._ensure_origin(url)
            assert self._context is not None
            playwright_cookies: List[Dict[str, Any]] = []
            for c in cookies or []:
                if not isinstance(c, dict):
                    continue
                name = c.get("name")
                value = c.get("value")
                if not name or value is None:
                    continue
                item: Dict[str, Any] = {"name": str(name), "value": str(value)}
                domain = c.get("domain")
                path = c.get("path") or "/"
                exp = c.get("expirationDate")
                if domain:
                    item["domain"] = str(domain)
                    item["path"] = str(path)
                else:
                    item["url"] = url
                if exp:
                    try:
                        item["expires"] = float(exp)
                    except Exception:
                        pass
                for k_src, k_dst in (("httpOnly", "httpOnly"), ("secure", "secure"), ("sameSite", "sameSite")):
                    if c.get(k_src) is not None:
                        item[k_dst] = c.get(k_src)
                playwright_cookies.append(item)
            await self._context.add_cookies(playwright_cookies)
            return {"success": True, "data": {"count": len(playwright_cookies)}}
        except Exception as exc:  # noqa: BLE001
            logger.error(f"Copilot set_cookies failed: {exc}")
            return {"success": False, "error": str(exc), "status_code": 500}

    async def proxy_request(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Run a single request via page `fetch` so site cookies are attached.
        config: {url, method, params?, data?, headers?}
        """
        try:
            url = str(config.get("url") or "").strip()
            if not url:
                return {"success": False, "error": "Missing url", "status_code": 400}
            method = str(config.get("method") or "GET").upper()
            headers = config.get("headers") or {}
            params = config.get("params") or None
            data = config.get("data") if "data" in config else None

            full_url = _merge_query(url, params)
            target = urlparse(full_url)
            target_origin = f"{target.scheme}://{target.netloc}"

            # XHS signing needs xiaohongshu.com page context (mnsv2/_webmsxyw lives there)
            if target.netloc.endswith("xiaohongshu.com") and target.netloc.startswith("edith."):
                await self._ensure_origin("https://www.xiaohongshu.com")
            else:
                await self._ensure_origin(full_url)

            assert self._page is not None

            # Always include cookies; this matches extension behavior expectations.
            init: Dict[str, Any] = {"method": method, "headers": headers, "credentials": "include", "mode": "cors"}
            if method not in {"GET", "HEAD"} and data is not None:
                if isinstance(data, (dict, list)):
                    init["body"] = json.dumps(data, ensure_ascii=False)
                    if isinstance(headers, dict):
                        init["headers"] = {**headers, "content-type": headers.get("content-type", "application/json")}
                else:
                    init["body"] = data

            # Best-effort XHS signing (Phase2-A): try using site signer `_webmsxyw`.
            if target.netloc.endswith("xiaohongshu.com") and target.netloc.startswith("edith."):
                path = full_url.replace(target_origin, "")
                if not path.startswith("/"):
                    path = "/" + path
                sign = await _try_xhs_webmsxyw(self._page, path, data if isinstance(data, (dict, list)) else None)
                if sign:
                    now_ms = int(__import__("time").time() * 1000)
                    xhs_headers = {
                        "x-s": sign,
                        "x-t": str(now_ms),
                        "origin": "https://www.xiaohongshu.com",
                        "referer": "https://www.xiaohongshu.com/",
                        "x-xray-traceid": _random_hex(32),
                        "x-b3-traceid": _random_hex(16),
                    }
                    if isinstance(init.get("headers"), dict):
                        init["headers"] = {**init["headers"], **xhs_headers}
                else:
                    return {
                        "success": False,
                        "status_code": 501,
                        "error": "xiaohongshu 签名不可用：页面未暴露 _webmsxyw（需要实现 mnsv2 + x-s-common 复刻）",
                    }

            js = """
                async ({ url, init }) => {
                  try {
                    const res = await fetch(url, init);
                    const text = await res.text();
                    let parsed = null;
                    try { parsed = JSON.parse(text); } catch (e) { parsed = text; }
                    return { ok: res.ok, status: res.status, data: parsed };
                  } catch (e) {
                    return { ok: false, status: 0, data: String(e) };
                  }
                }
            """
            result = await self._page.evaluate(js, {"url": full_url, "init": init})
            status = int(result.get("status") or 0)
            if result.get("ok"):
                return {"success": True, "data": result.get("data")}
            return {
                "success": False,
                "error": result.get("data"),
                "status_code": status or 500,
            }
        except Exception as exc:  # noqa: BLE001
            logger.error(f"Copilot request failed: {exc}")
            return {"success": False, "error": str(exc), "status_code": 500}

    async def fetch_work(
        self,
        platform: str,
        work_id: str,
        params_override: Optional[Dict[str, Any]] = None,
        data_override: Optional[Any] = None,
        headers: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        payload = self._build_work_request(platform, work_id)
        if params_override:
            payload["params"] = {**(payload.get("params") or {}), **params_override}
        if data_override is not None:
            payload["data"] = data_override
        if headers:
            payload["headers"] = {**(payload.get("headers") or {}), **headers}
        return await self.proxy_request(payload)

    async def fetch_work_comments(
        self,
        platform: str,
        work_id: str,
        *,
        limit: int = 50,
        cursor: int = 0,
        headers: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        payload = self._build_work_comments_request(platform, work_id, limit=limit, cursor=cursor)
        if headers:
            payload["headers"] = {**(payload.get("headers") or {}), **headers}
        return await self.proxy_request(payload)

    async def fetch_user_info(
        self,
        platform: str,
        user_id: str,
        *,
        headers: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        payload = self._build_user_info_request(platform, user_id)
        if headers:
            payload["headers"] = {**(payload.get("headers") or {}), **headers}
        return await self.proxy_request(payload)

    async def fetch_user_works(
        self,
        platform: str,
        user_id: str,
        *,
        limit: int = 20,
        cursor: int = 0,
        headers: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        payload = self._build_user_works_request(platform, user_id, limit=limit, cursor=cursor)
        if headers:
            payload["headers"] = {**(payload.get("headers") or {}), **headers}
        return await self.proxy_request(payload)

    def _build_work_request(self, platform: str, work_id: str) -> Dict[str, Any]:
        code = (platform or "").lower()
        if code == "douyin":
            return {
                "url": "https://www.douyin.com/aweme/v1/web/aweme/detail/",
                "method": "GET",
                "params": {**_douyin_common_params(), "aweme_id": work_id},
            }
        if code == "xiaohongshu":
            return {
                "url": "https://edith.xiaohongshu.com/api/sns/web/v1/feed",
                "method": "POST",
                "data": {
                    "source_note_id": work_id,
                    "image_formats": ["jpg", "webp", "avif"],
                    "extra": {"need_body_topic": "1"},
                    "xsec_source": "pc_feed",
                },
            }
        if code == "kuaishou":
            return {
                "url": "https://www.kuaishou.com/graphql",
                "method": "POST",
                "data": {
                    "operationName": "visionVideoDetail",
                    "query": (
                        "query visionVideoDetail($photoId: String $type: String $page: String "
                        "$webPageArea: String) { visionVideoDetail(photoId: $photoId type: $type "
                        "page: $page webPageArea: $webPageArea) { status type author { id name "
                        "following headerUrl livingInfo } photo { id duration caption likeCount "
                        "realLikeCount coverUrl photoUrl liked timestamp expTag llsid viewCount "
                        "videoRatio stereoType musicBlocked riskTagContent riskTagUrl manifest { "
                        "mediaType businessType version adaptationSet { id duration representation "
                        "{ id defaultSelect backupUrl codecs url height width avgBitrate maxBitrate "
                        "m3u8Slice qualityType qualityLabel frameRate featureP2sp hidden "
                        "disableAdaptive } } } manifestH265 photoH265Url coronaCropManifest "
                        "coronaCropManifestH265 croppedPhotoH265Url croppedPhotoUrl videoResource } "
                        "tags { type name } commentLimit { canAddComment } llsid danmakuSwitch }}"
                    ),
                    "variables": {
                        "page": "detail",
                        "photoId": work_id,
                        "webPageArea": "brilliantxxunknown",
                    },
                },
            }
        raise ValueError(f"Unsupported platform: {platform}")

    def _build_work_comments_request(self, platform: str, work_id: str, *, limit: int, cursor: int) -> Dict[str, Any]:
        code = (platform or "").lower()
        if code == "douyin":
            return {
                "url": "https://www.douyin.com/aweme/v1/web/comment/list/",
                "method": "GET",
                "params": {
                    **_douyin_common_params(),
                    "aweme_id": work_id,
                    "cursor": int(cursor),
                    "count": int(limit),
                    "item_type": 0,
                },
            }
        raise ValueError(f"Unsupported platform for comments: {platform}")

    def _build_user_info_request(self, platform: str, user_id: str) -> Dict[str, Any]:
        code = (platform or "").lower()
        if code == "douyin":
            return {
                "url": "https://www.douyin.com/aweme/v1/web/user/profile/other/",
                "method": "GET",
                "params": {
                    **_douyin_common_params(),
                    # Align with social-media-copilot (sec_user_id)
                    "sec_user_id": user_id,
                    "source": "channel_pc_web",
                    "publish_video_strategy_type": 2,
                    "personal_center_strategy": 1,
                    "profile_other_record_enable": 1,
                    "land_to": 1,
                },
            }
        raise ValueError(f"Unsupported platform for user info: {platform}")

    def _build_user_works_request(self, platform: str, user_id: str, *, limit: int, cursor: int) -> Dict[str, Any]:
        code = (platform or "").lower()
        if code == "douyin":
            return {
                "url": "https://www.douyin.com/aweme/v1/web/aweme/post/",
                "method": "GET",
                "params": {
                    **_douyin_common_params(),
                    # Align with social-media-copilot typings
                    "sec_user_id": user_id,
                    "count": int(limit),
                    "max_cursor": int(cursor),
                    "cut_version": 1,
                },
            }
        raise ValueError(f"Unsupported platform for user works: {platform}")


def get_social_media_copilot_client() -> SocialMediaCopilotClient:
    # Return a fresh client per request to avoid shared Playwright state issues.
    return SocialMediaCopilotClient()
