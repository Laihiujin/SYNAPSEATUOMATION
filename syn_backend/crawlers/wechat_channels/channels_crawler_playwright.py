"""
视频号数据爬虫（使用 Playwright + 持久化浏览器）
"""
import asyncio
import json
import time
from typing import Dict, List, Optional, Any
from pathlib import Path
from datetime import datetime

from loguru import logger
from playwright.async_api import async_playwright, Page, BrowserContext
from bs4 import BeautifulSoup


class WechatChannelsCrawler:
    """微信视频号爬虫（使用 Playwright）"""

    def __init__(self):
        """初始化爬虫"""
        self.context: Optional[BrowserContext] = None
        self.page: Optional[Page] = None
        self.base_url = "https://channels.weixin.qq.com"
        self.platform_url = f"{self.base_url}/platform/post/list"
        self._base_dir = Path(__file__).resolve().parent.parent.parent
        self._cookies_dir = self._base_dir / "cookiesFile"
        self._profiles_dir = self._base_dir / "browser_profiles"
        self.account_info = {}

    async def _get_chrome_path(self) -> str:
        """获取 Chrome 浏览器路径"""
        import os

        # 从环境变量读取
        local_chrome_path = os.getenv("LOCAL_CHROME_PATH")
        if local_chrome_path:
            chrome_path = Path(local_chrome_path)
            if not chrome_path.is_absolute():
                # 相对路径从项目根目录解析
                chrome_path = self._base_dir.parent / chrome_path
            if chrome_path.exists():
                logger.info(f"✅ 使用配置的 Chrome: {chrome_path}")
                return str(chrome_path)

        # 使用默认路径
        default_chrome = self._base_dir.parent / "browsers/chromium/chromium-1161/chrome-win/chrome.exe"
        if default_chrome.exists():
            logger.info(f"✅ 使用默认 Chrome: {default_chrome}")
            return str(default_chrome)

        logger.warning("⚠️  未找到本地 Chrome，将使用 Playwright 默认 Chromium")
        return ""

    async def _init_context(self, account_id: str, cookies: List[Dict]) -> BrowserContext:
        """
        初始化持久化浏览器上下文

        Args:
            account_id: 账号ID
            cookies: Cookie 列表
        """
        # 创建持久化浏览器配置目录
        profile_name = f"wechat_channels_{account_id}"
        user_data_dir = self._profiles_dir / profile_name
        user_data_dir.mkdir(parents=True, exist_ok=True)

        logger.info(f"📁 浏览器配置目录: {user_data_dir}")

        playwright = await async_playwright().start()

        # 获取 Chrome 路径
        chrome_path = await self._get_chrome_path()

        # 启动参数
        launch_args = {
            "headless": False,  # 首次可以看到浏览器，调试用
            "args": [
                "--disable-blink-features=AutomationControlled",
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--no-proxy-server",
            ],
        }

        if chrome_path:
            launch_args["executable_path"] = chrome_path

        # Context 参数
        context_opts = {
            "locale": "zh-CN",
            "timezone_id": "Asia/Shanghai",
            "ignore_https_errors": True,
            "viewport": {"width": 1920, "height": 1080},
        }

        # 启动持久化上下文
        context = await playwright.chromium.launch_persistent_context(
            str(user_data_dir),
            **context_opts,
            **launch_args
        )

        logger.info("✅ 持久化浏览器上下文已启动")

        # 如果有 Cookie，加载它们（首次访问时）
        if cookies:
            await self._load_cookies_to_context(context, cookies)

        return context

    async def _load_cookies_to_context(self, context: BrowserContext, cookies: List[Dict]):
        """将 Cookie 加载到浏览器上下文"""
        # 转换 Cookie 格式
        playwright_cookies = []
        for cookie in cookies:
            pw_cookie = {
                "name": cookie.get("name"),
                "value": cookie.get("value"),
                "domain": cookie.get("domain", "channels.weixin.qq.com"),
                "path": cookie.get("path", "/"),
            }

            # Playwright 需要 expires 为时间戳（秒）
            if "expires" in cookie:
                pw_cookie["expires"] = int(cookie["expires"])
            elif "expirationDate" in cookie:
                pw_cookie["expires"] = int(cookie["expirationDate"])

            if "httpOnly" in cookie:
                pw_cookie["httpOnly"] = cookie["httpOnly"]
            if "secure" in cookie:
                pw_cookie["secure"] = cookie["secure"]
            if "sameSite" in cookie:
                pw_cookie["sameSite"] = cookie["sameSite"]

            playwright_cookies.append(pw_cookie)

        await context.add_cookies(playwright_cookies)
        logger.info(f"✅ 已加载 {len(playwright_cookies)} 个 Cookie")

    async def start(self, account_cookie_file: str, max_pages: int = 3) -> Dict[str, Any]:
        """
        启动爬虫，抓取视频号作品列表

        Args:
            account_cookie_file: Cookie 文件名
            max_pages: 最多抓取多少页

        Returns:
            抓取结果
        """
        try:
            # 加载 Cookie 文件
            cookie_path = self._cookies_dir / account_cookie_file
            if not cookie_path.exists():
                return {
                    "success": False,
                    "error": f"Cookie 文件不存在: {account_cookie_file}",
                    "platform": "wechat_channels"
                }

            with cookie_path.open("r", encoding="utf-8") as fp:
                cookie_data = json.load(fp)
                cookies = cookie_data.get("cookies", [])
                self.account_info = cookie_data.get("user_info", {})

            if not cookies:
                return {
                    "success": False,
                    "error": "Cookie 文件中没有有效的 Cookie",
                    "platform": "wechat_channels"
                }

            account_id = self.account_info.get("user_id", "unknown")

            # 初始化持久化浏览器上下文
            self.context = await self._init_context(account_id, cookies)
            self.page = await self.context.new_page()

            # 访问创作者平台
            logger.info(f"🌐 访问创作者平台: {self.platform_url}")
            await self.page.goto(self.platform_url, wait_until="networkidle")
            await asyncio.sleep(3)

            # 检查登录状态
            if not await self._check_login_status():
                return {
                    "success": False,
                    "error": "Cookie 已失效或未登录",
                    "platform": "wechat_channels"
                }

            # 抓取作品列表
            videos = await self._fetch_video_list(max_pages)

            return {
                "success": True,
                "data": {
                    "account_id": account_id,
                    "account_name": self.account_info.get("name", ""),
                    "videos": videos,
                    "total": len(videos),
                    "crawled_at": datetime.now().isoformat()
                },
                "platform": "wechat_channels"
            }

        except Exception as e:
            logger.error(f"❌ 视频号爬虫异常: {e}")
            import traceback
            logger.error(traceback.format_exc())
            return {
                "success": False,
                "error": str(e),
                "platform": "wechat_channels"
            }
        finally:
            await self._cleanup()

    async def _check_login_status(self) -> bool:
        """检查是否登录成功"""
        try:
            # 检查1: URL 是否正确
            current_url = self.page.url
            if "/platform/post/list" not in current_url:
                logger.error(f"❌ URL 不正确: {current_url}")
                return False

            # 检查2: 等待视频列表或关键元素出现
            try:
                # 尝试多个可能的选择器
                await self.page.wait_for_selector(
                    ".post-item, .weui-desktop-pagination, :text('视频管理')",
                    timeout=10000,
                    state="visible"
                )
            except:
                # 如果都找不到，尝试通过 URL 判断
                if "/platform/post/list" not in current_url:
                    return False

            logger.info("✅ 登录验证成功")
            return True
        except Exception as e:
            logger.error(f"❌ 登录验证失败: {e}")
            # 保存截图用于调试
            try:
                screenshot_path = self._base_dir / "logs" / f"login_failed_{int(time.time())}.png"
                screenshot_path.parent.mkdir(exist_ok=True)
                await self.page.screenshot(path=str(screenshot_path))
                logger.info(f"📸 已保存截图: {screenshot_path}")
            except:
                pass
            return False

    async def _fetch_video_list(self, max_pages: int = 3) -> List[Dict[str, Any]]:
        """抓取视频列表"""
        all_videos = []
        current_page = 1

        while current_page <= max_pages:
            logger.info(f"📄 正在抓取第 {current_page} 页...")

            try:
                # 等待列表加载
                await self.page.wait_for_selector(".post-item", timeout=10000)
                await asyncio.sleep(2)

                # 获取页面 HTML
                page_html = await self.page.content()
                soup = BeautifulSoup(page_html, "html.parser")

                # 解析视频项
                video_items = soup.find_all(class_="post-item")

                for item in video_items:
                    video_data = self._parse_video_item(item)
                    if video_data:
                        all_videos.append(video_data)

                logger.success(f"✅ 第 {current_page} 页抓取完成，获得 {len(video_items)} 个视频")

                # 尝试翻页
                if not await self._go_to_next_page():
                    logger.info("📌 已到达最后一页")
                    break

                current_page += 1
                await asyncio.sleep(2)

            except Exception as e:
                logger.error(f"❌ 抓取第 {current_page} 页时出错: {e}")
                break

        logger.info(f"🎉 总计抓取 {len(all_videos)} 个视频")
        return all_videos

    def _parse_video_item(self, item) -> Optional[Dict[str, Any]]:
        """解析单个视频项"""
        try:
            video_data = {}

            # 提取视频标题
            title_elem = item.select_one('.post-title, .title, [class*="title"]')
            if title_elem:
                video_data["title"] = title_elem.get_text(strip=True)

            # 提取封面图
            cover_elem = item.select_one('img, [class*="cover"] img')
            if cover_elem:
                video_data["cover_url"] = cover_elem.get("src") or cover_elem.get("data-src", "")

            # 提取统计数据
            stats_elem = item.select_one('.stats, [class*="stats"], [class*="count"]')
            if stats_elem:
                video_data["stats"] = stats_elem.get_text(strip=True)

            # 提取视频链接
            link_elem = item.select_one('a[href]')
            if link_elem:
                video_data["video_url"] = link_elem.get("href", "")

            # 提取发布时间
            time_elem = item.select_one('[class*="time"], [class*="date"]')
            if time_elem:
                video_data["publish_time"] = time_elem.get_text(strip=True)

            # 提取视频 ID
            video_id = None
            if link_elem:
                href = link_elem.get("href", "")
                import re
                match = re.search(r'feedId=([a-zA-Z0-9_-]+)', href)
                if match:
                    video_id = match.group(1)

            if not video_id:
                video_id = item.get("data-feedid") or item.get("data-id")

            if video_id:
                video_data["video_id"] = video_id

            video_data["raw_html"] = str(item)
            video_data["crawled_at"] = datetime.now().isoformat()

            return video_data

        except Exception as e:
            logger.warning(f"解析视频项失败: {e}")
            return None

    async def _go_to_next_page(self) -> bool:
        """点击下一页按钮"""
        try:
            # 查找下一页按钮
            next_button = await self.page.query_selector("a.weui-desktop-btn:has-text('下一页')")

            if not next_button:
                return False

            # 检查是否禁用
            class_attr = await next_button.get_attribute("class")
            if "disabled" in (class_attr or ""):
                return False

            # 点击按钮
            await next_button.click()
            await asyncio.sleep(2)
            return True

        except Exception as e:
            logger.warning(f"翻页失败: {e}")
            return False

    async def _cleanup(self):
        """清理资源"""
        if self.page:
            try:
                await self.page.close()
            except Exception:
                pass

        if self.context:
            try:
                await self.context.close()
                logger.info("✅ 浏览器已关闭")
            except Exception as e:
                logger.warning(f"关闭浏览器时出错: {e}")
