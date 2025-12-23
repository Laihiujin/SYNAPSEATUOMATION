"""
Douyin Platform Adapter - 抖音平台适配器

Playwright扫码实现
复制自: syn_backend/fastapi_app/api/v1/auth/services.py::DouyinLoginService
"""
import asyncio
import uuid
from typing import Dict, Any

from loguru import logger
from playwright.async_api import async_playwright, Page
from myUtils.playwright_context_factory import create_context_with_policy

from .base import PlatformAdapter, QRCodeData, UserInfo, LoginResult, LoginStatus


# 全局Playwright会话存储
_DOUYIN_SESSIONS: Dict[str, Dict[str, Any]] = {}


class DouyinAdapter(PlatformAdapter):
    """抖音登录适配器 (Playwright扫码)"""

    def __init__(self, config: Dict[str, Any] = None):
        super().__init__(config)
        self.platform_name = "douyin"
        self.headless = config.get("headless", True) if config else True
        self.account_id = config.get("account_id") if config else None

    async def get_qrcode(self) -> QRCodeData:
        """
        生成抖音登录二维码

        访问: https://creator.douyin.com/creator-micro/login?enter_from=qr
        提取二维码图片
        """
        session_id = str(uuid.uuid4())

        try:
            # 创建浏览器会话
            playwright = await async_playwright().start()
            browser, context, _, _ = await create_context_with_policy(
                playwright,
                platform=self.platform_name,
                account_id=self.account_id,
                headless=self.headless,
                base_context_opts={"viewport": {"width": 1280, "height": 800}},
                launch_kwargs={"args": ["--no-sandbox", "--disable-blink-features=AutomationControlled"]},
            )
            page = await context.new_page()

            # 存储会话
            _DOUYIN_SESSIONS[session_id] = {
                "playwright": playwright,
                "browser": browser,
                "context": context,
                "page": page
            }

            # 访问登录页
            try:
                await page.goto(
                    "https://creator.douyin.com/creator-micro/login?enter_from=qr",
                    timeout=20000,
                    wait_until="domcontentloaded"
                )
            except Exception:
                # 降级: 访问主页
                await page.goto("https://creator.douyin.com/", timeout=20000, wait_until="domcontentloaded")

            # 等待二维码加载
            await asyncio.sleep(2)

            # 尝试多个选择器提取二维码
            qr_xpath = "//div[@id='animate_qrcode_container']//img[contains(@class,'qrcode_img')]"
            try:
                h = await page.wait_for_selector(f"xpath={qr_xpath}", timeout=15000)
                if h:
                    src = await h.get_attribute("src")
                    if src:
                        logger.info(f"[Douyin] QR code extracted: session={session_id[:8]}")
                        return QRCodeData(
                            session_id=session_id,
                            qr_url="https://creator.douyin.com/",
                            qr_image=src,
                            expires_in=300
                        )
            except Exception as e:
                logger.warning(f"[Douyin] XPath selector failed: {e}")

            # 备用选择器
            selectors = [
                "img.qrcode_img-NPVTJs",
                "div.qrcode-vz0gH7 img",
                "img[alt*='二维码']",
                "img[src*='qrcode']",
                ".qrcode img",
            ]

            for sel in selectors:
                try:
                    h = await page.query_selector(sel)
                    if h:
                        src = await h.get_attribute("src")
                        if src:
                            logger.info(f"[Douyin] QR code extracted: session={session_id[:8]}")
                            return QRCodeData(
                                session_id=session_id,
                                qr_url="https://creator.douyin.com/",
                                qr_image=src,
                                expires_in=300
                            )
                except Exception:
                    continue

            # 最后兜底: 截图整页
            try:
                shot = await page.screenshot(full_page=False)
                if shot:
                    import base64
                    b64 = base64.b64encode(shot).decode("utf-8")
                    logger.warning(f"[Douyin] QR not found, using screenshot: session={session_id[:8]}")
                    return QRCodeData(
                        session_id=session_id,
                        qr_url="https://creator.douyin.com/",
                        qr_image=f"data:image/png;base64,{b64}",
                        expires_in=300
                    )
            except Exception:
                pass

            raise Exception("No QR code found for Douyin")

        except Exception as e:
            await self.cleanup_session(session_id)
            logger.error(f"[Douyin] QR generation failed: {e}")
            raise

    async def poll_status(self, session_id: str) -> LoginResult:
        """
        轮询抖音登录状态

        判断标准:
        - URL不包含 'login'
        - 关键Cookie存在 (sessionid, sid_guard等)
        - 可提取用户信息
        """
        if session_id not in _DOUYIN_SESSIONS:
            return LoginResult(status=LoginStatus.EXPIRED, message="Session expired")

        session = _DOUYIN_SESSIONS[session_id]
        page = session["page"]
        context = session["context"]

        try:
            cookies_list = await context.cookies()
            cookies_dict = {c["name"]: c["value"] for c in cookies_list}

            # 检查关键Cookie
            auth_cookies = {
                k: v for k, v in cookies_dict.items()
                if k in ["sessionid", "sessionid_ss", "sid_guard", "sid_tt", "passport_auth_id", "odin_tt"]
                and v
            }

            # 检查URL状态
            is_on_creator = "creator.douyin.com" in page.url
            on_login_page = "login" in page.url.lower()

            # 提取用户信息
            user_info = await self._extract_user_info(page, cookies_list)
            has_user = bool(user_info.user_id)

            # 判断登录成功
            if is_on_creator and not on_login_page and (auth_cookies or has_user):
                try:
                    full_state = await context.storage_state()
                except Exception as e:
                    logger.error(f"[Douyin] storage_state failed: {e}")
                    full_state = None

                await self.cleanup_session(session_id)

                logger.info(f"[Douyin] Login confirmed: uid={user_info.user_id}")

                return LoginResult(
                    status=LoginStatus.CONFIRMED,
                    message="Login successful",
                    cookies=cookies_dict,
                    user_info=user_info,
                    full_state=full_state
                )

            return LoginResult(status=LoginStatus.WAITING, message="Waiting for scan")

        except Exception as e:
            logger.error(f"[Douyin] Poll failed: {e}")
            return LoginResult(status=LoginStatus.FAILED, message=str(e))

    async def cleanup_session(self, session_id: str):
        """清理Playwright会话"""
        session = _DOUYIN_SESSIONS.pop(session_id, None)
        if not session:
            return

        try:
            await session["browser"].close()
            await session["playwright"].stop()
        except Exception as e:
            logger.warning(f"[Douyin] Cleanup failed: {e}")

    async def supports_api_login(self) -> bool:
        return False  # 需要Playwright

    # ========== Helper Methods ==========

    async def _extract_user_info(self, page: Page, cookies_list: list) -> UserInfo:
        """从页面提取用户信息（参考fetch_user_info_service的逻辑）"""
        try:
            await asyncio.sleep(1)
            user_info = UserInfo()

            # ⚠️ 方法1: 优先从DOM文本提取抖音号（最可靠！）
            try:
                import re
                # text=/抖音号[:：]?\s*\d+/
                elem = await page.wait_for_selector('text=/抖音号[:：]?\\s*\\d+/', timeout=3000)
                if elem:
                    text = await elem.inner_text()
                    match = re.search(r'抖音号[:：]?\s*(\d+)', text)
                    if match:
                        user_info.user_id = match.group(1)
                        logger.info(f"[Douyin] Extracted user_id from DOM text: {user_info.user_id}")
            except Exception as e:
                logger.warning(f"[Douyin] DOM text extraction failed: {e}")

            # 方法2: 从JS全局变量提取（兜底）
            if not user_info.user_id:
                try:
                    js_info = await page.evaluate("""() => {
                        if (window._ROUTER_DATA?.loaderData) {
                            for (let key in window._ROUTER_DATA.loaderData) {
                                const data = window._ROUTER_DATA.loaderData[key];
                                if (data?.user) return data.user;
                            }
                        }
                        if (window.userData) return window.userData;
                        return null;
                    }""")

                    if js_info and isinstance(js_info, dict):
                        # ⚠️ 与旧版 services.py 保持一致：JS 仅兜底拿 userId，不用 uid（加密），
                        # name/avatar 交给 DOM 选择器（更稳定，避免拿到空/错误字段）
                        user_info.user_id = js_info.get("userId", "")
                        logger.info(f"[Douyin] Fallback to JS userId: {user_info.user_id}")
                except Exception as e:
                    logger.warning(f"[Douyin] JS user info failed: {e}")

            # ⚠️ 抖音不从cookie提取user_id（所有cookie字段都是加密的，如odin_tt/uid_tt等）

            # 提取name（DOM兜底）
            if not user_info.name:
                try:
                    name_selectors = ['xpath=//div[@class="name-_lSSDc"]', 'div[class*="name-_lSSDc"]', 'div[class*="header-right-name"]', '.header-right-name']
                    for selector in name_selectors:
                        try:
                            elem = await page.wait_for_selector(selector, timeout=2000)
                            if elem:
                                text = await elem.inner_text()
                                if text:
                                    user_info.name = text.strip().split('\n')[0]
                                    break
                        except:
                            continue
                except Exception as e:
                    logger.warning(f"[Douyin] name extraction failed: {e}")

            # 从DOM提取头像
            if not user_info.avatar:
                try:
                    for sel in ["div[class*='avatar-'] img", ".semi-avatar img", "img[src*='aweme-avatar']"]:
                        h = await page.query_selector(sel)
                        if h:
                            src = await h.get_attribute("src")
                            if src:
                                user_info.avatar = src
                                break
                except Exception:
                    pass

            logger.info(f"[Douyin] Final extracted user_info: user_id={user_info.user_id}, name={user_info.name}")
            return user_info

        except Exception as e:
            logger.error(f"[Douyin] Extract user info failed: {e}")
            return UserInfo()
