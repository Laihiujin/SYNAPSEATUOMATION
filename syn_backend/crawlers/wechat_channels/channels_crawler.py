"""
视频号数据爬虫
使用 Selenium 访问微信视频号创作者平台，抓取作品列表
"""
import json
import time
from typing import Dict, List, Optional, Any
from pathlib import Path
from datetime import datetime

from loguru import logger
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from bs4 import BeautifulSoup

try:
    from .config import CHROME_PATHS, HEADLESS_MODE, USER_AGENT
except ImportError:
    # 如果配置文件不存在，使用默认值
    CHROME_PATHS = []
    HEADLESS_MODE = True
    USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"


class WechatChannelsCrawler:
    """微信视频号爬虫"""

    def __init__(self, cookies: Optional[List[Dict[str, Any]]] = None):
        """
        初始化爬虫

        Args:
            cookies: 微信视频号的 Cookie 列表
        """
        self.cookies = cookies or []
        self.driver: Optional[webdriver.Chrome] = None
        self.base_url = "https://channels.weixin.qq.com"
        self.platform_url = f"{self.base_url}/platform/post/list"
        self._base_dir = Path(__file__).resolve().parent.parent.parent
        self._cookies_dir = self._base_dir / "cookiesFile"
        self._profiles_dir = self._base_dir / "browser_profiles"  # 持久化浏览器配置目录
        self.account_info = {}

    def _init_driver(self, account_id: str = "default") -> webdriver.Chrome:
        """初始化 Chrome WebDriver（使用持久化配置）"""
        options = webdriver.ChromeOptions()

        # 设置持久化浏览器配置目录（User Data Dir）
        profile_name = f"wechat_channels_{account_id}"
        user_data_dir = self._profiles_dir / profile_name
        user_data_dir.mkdir(parents=True, exist_ok=True)

        logger.info(f"📁 使用持久化配置目录: {user_data_dir}")
        options.add_argument(f"--user-data-dir={user_data_dir}")

        # 尝试使用本地 Chromium 浏览器
        chrome_found = False
        for chrome_path in CHROME_PATHS:
            if chrome_path.exists():
                options.binary_location = str(chrome_path)
                logger.info(f"✅ 使用本地浏览器: {chrome_path.name}")
                chrome_found = True
                break

        if not chrome_found:
            logger.warning(f"⚠️  未找到本地浏览器，使用系统默认浏览器")

        # 配置选项
        if HEADLESS_MODE:
            options.add_argument("--headless=new")  # 新版 Headless 模式
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--disable-blink-features=AutomationControlled")
        options.add_argument("--disable-gpu")
        options.add_argument("--window-size=1920,1080")
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        options.add_experimental_option("useAutomationExtension", False)

        # User-Agent
        options.add_argument(f"user-agent={USER_AGENT}")

        try:
            driver = webdriver.Chrome(options=options)
            driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            logger.info("✅ WebDriver 初始化成功")
            return driver
        except Exception as e:
            logger.error(f"❌ WebDriver 初始化失败: {e}")
            raise

    def _load_cookies(self):
        """加载 Cookie 到浏览器"""
        if not self.driver:
            return

        # 先访问主页，确保域名正确
        self.driver.get(self.base_url)
        time.sleep(2)

        # 添加 Cookie
        for cookie in self.cookies:
            try:
                # Selenium 需要的 Cookie 格式
                cookie_dict = {
                    "name": cookie.get("name"),
                    "value": cookie.get("value"),
                    "domain": cookie.get("domain", ".weixin.qq.com"),
                    "path": cookie.get("path", "/"),
                }
                if cookie.get("expirationDate"):
                    cookie_dict["expiry"] = int(cookie["expirationDate"])

                self.driver.add_cookie(cookie_dict)
            except Exception as e:
                logger.warning(f"添加 Cookie 失败: {e}")

        logger.info(f"✅ 已加载 {len(self.cookies)} 个 Cookie")

    async def start(self, account_cookie_file: str, max_pages: int = 3) -> Dict[str, Any]:
        """
        启动爬虫，抓取视频号作品列表

        Args:
            account_cookie_file: Cookie 文件名（在 cookiesFile 目录下）
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
                self.cookies = cookie_data.get("cookies", [])
                self.account_info = cookie_data.get("user_info", {})

            if not self.cookies:
                return {
                    "success": False,
                    "error": "Cookie 文件中没有有效的 Cookie",
                    "platform": "wechat_channels"
                }

            # 获取账号 ID
            account_id = self.account_info.get("user_id", "unknown")

            # 初始化浏览器（传递账号ID用于持久化配置）
            self.driver = self._init_driver(account_id)
            self._load_cookies()

            # 访问创作者平台
            logger.info(f"🌐 访问创作者平台: {self.platform_url}")
            self.driver.get(self.platform_url)

            # 等待页面加载
            time.sleep(3)

            # 检查是否登录成功
            if not self._check_login_status():
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
                    "account_id": self.account_info.get("user_id", ""),
                    "account_name": self.account_info.get("name", ""),
                    "videos": videos,
                    "total": len(videos),
                    "crawled_at": datetime.now().isoformat()
                },
                "platform": "wechat_channels"
            }

        except Exception as e:
            logger.error(f"❌ 视频号爬虫异常: {e}")
            return {
                "success": False,
                "error": str(e),
                "platform": "wechat_channels"
            }
        finally:
            self._cleanup()

    def _check_login_status(self) -> bool:
        """检查是否登录成功"""
        try:
            # 检查1: URL 是否正确（必须包含 /platform/post/list）
            current_url = self.driver.current_url
            if "/platform/post/list" not in current_url:
                logger.error(f"❌ URL 不正确: {current_url}")
                return False

            # 等待页面完全加载（Vue.js 需要时间渲染）
            logger.info("⏳ 等待页面渲染...")
            time.sleep(5)

            # 检查2: 尝试多个选择器（任意一个存在即可）
            selectors = [
                # 尝试通过 OCR 识别的文本查找
                (By.XPATH, "//*[contains(text(), '视频管理')]"),
                (By.XPATH, "//*[contains(text(), '视频 (')]"),
                # 尝试常见的视频列表容器 class
                (By.CSS_SELECTOR, "[class*='post']"),
                (By.CSS_SELECTOR, "[class*='video']"),
                (By.CSS_SELECTOR, "[class*='content-list']"),
                (By.CSS_SELECTOR, "[class*='list-item']"),
                # 尝试微信常用的 class 前缀
                (By.CSS_SELECTOR, "[class*='weui-desktop']"),
                (By.CSS_SELECTOR, "[class*='finder']"),
            ]

            element_found = False
            for by, value in selectors:
                try:
                    element = WebDriverWait(self.driver, 2).until(
                        EC.presence_of_element_located((by, value))
                    )
                    logger.info(f"✅ 找到关键元素: {value} -> {element.tag_name}")
                    element_found = True
                    break
                except TimeoutException:
                    continue

            if not element_found:
                logger.warning("⚠️  未找到预期的元素选择器")
                # 但如果 URL 正确且页面加载完成，也认为登录成功
                # 检查页面源码中是否包含关键字
                page_source = self.driver.page_source
                if "视频管理" in page_source or "视频号助手" in page_source:
                    logger.info("✅ 通过页面内容验证：登录成功")
                    return True
                else:
                    logger.error("❌ 页面内容不匹配，登录可能失败")
                    # 保存调试信息（HTML + 截图 + OCR）
                    self._save_debug_bundle("login_failed")
                    return False

            logger.info("✅ 登录验证成功")
            return True

        except Exception as e:
            logger.error(f"❌ 登录验证异常: {e}")
            import traceback
            logger.error(traceback.format_exc())
            return False

    def _save_debug_bundle(self, prefix: str):
        """保存调试信息（截图 + HTML + OCR）"""
        try:
            from automation.selenium_dom import capture_debug_bundle
            timestamp = int(time.time())
            out_dir = self._base_dir / "logs"
            result = capture_debug_bundle(
                self.driver,
                str(out_dir),
                f"{prefix}_{timestamp}",
                run_ocr=True
            )
            logger.info(f"📸 已保存截图: {result.screenshot_path}")
            logger.info(f"📄 已保存 HTML: {result.html_path}")
            if result.ocr_text_path:
                logger.info(f"🔍 已保存 OCR 文本: {result.ocr_text_path}")
        except Exception as e:
            logger.warning(f"保存调试信息失败: {e}")

    async def _fetch_video_list(self, max_pages: int = 3) -> List[Dict[str, Any]]:
        """
        抓取视频列表

        Args:
            max_pages: 最多抓取多少页

        Returns:
            视频列表
        """
        all_videos = []
        current_page = 1

        while current_page <= max_pages:
            logger.info(f"📄 正在抓取第 {current_page} 页...")

            try:
                # 额外等待确保页面完全渲染
                time.sleep(3)

                # 获取页面 HTML 和截图用于调试
                page_source = self.driver.page_source

                # 保存当前页面状态用于调试
                debug_path = self._base_dir / "logs" / f"page_{current_page}_{int(time.time())}"
                debug_path.parent.mkdir(exist_ok=True)

                # 保存 HTML
                with open(f"{debug_path}.html", "w", encoding="utf-8") as f:
                    f.write(page_source)

                # 保存截图
                self.driver.save_screenshot(f"{debug_path}.png")
                logger.info(f"📸 已保存调试信息: {debug_path}.png")

                # 使用 JavaScript 获取页面中的所有视频元素
                # 尝试通过 DOM 查询而不是 BeautifulSoup
                video_elements = self.driver.execute_script("""
                    // 尝试多种选择器找到视频列表
                    const selectors = [
                        '[class*="post"]',
                        '[class*="video"]',
                        '[class*="item"]',
                        '[class*="card"]',
                        '[class*="list"]'
                    ];

                    let elements = [];
                    for (const selector of selectors) {
                        const found = document.querySelectorAll(selector);
                        if (found.length > 0) {
                            console.log('Found', found.length, 'elements with selector:', selector);
                            elements = Array.from(found);
                            break;
                        }
                    }

                    // 返回元素的基本信息
                    return elements.slice(0, 20).map(el => ({
                        tagName: el.tagName,
                        className: el.className,
                        innerHTML: el.innerHTML.substring(0, 500),
                        textContent: el.textContent.substring(0, 200)
                    }));
                """)

                logger.info(f"🔍 JavaScript 查询到 {len(video_elements)} 个元素")

                if video_elements:
                    logger.info(f"📋 前 3 个元素示例:")
                    for i, elem in enumerate(video_elements[:3], 1):
                        logger.info(f"  {i}. Tag: {elem.get('tagName')}, Class: {elem.get('className')[:50]}")
                        logger.info(f"     Text: {elem.get('textContent')[:100]}")

                # 使用 BeautifulSoup 解析
                soup = BeautifulSoup(page_source, "html.parser")

                # 根据 OCR 识别的内容，视频应该包含标题、日期、统计数据
                # 尝试查找所有可能的视频容器
                video_items = []

                # 策略1: 查找包含日期模式的元素的父容器
                date_elements = soup.find_all(string=lambda text: text and ("2025年" in text or "2024年" in text))
                logger.info(f"🔍 找到 {len(date_elements)} 个日期元素")

                for date_elem in date_elements:
                    parent = date_elem.parent
                    # 向上查找3层找到视频容器
                    for _ in range(3):
                        if parent and parent.name:
                            parent = parent.parent
                    if parent and parent not in video_items:
                        video_items.append(parent)

                logger.info(f"✅ 第 {current_page} 页找到 {len(video_items)} 个可能的视频容器")

                if len(video_items) == 0:
                    logger.warning(f"⚠️  第 {current_page} 页未找到视频元素，尝试备用方案...")
                    # 备用方案：直接用 OCR 提取的文本重构数据
                    logger.info("💡 使用 OCR 文本解析...")
                    break

                for item in video_items:
                    video_data = self._parse_video_item(item)
                    if video_data:
                        all_videos.append(video_data)

                logger.info(f"✅ 第 {current_page} 页抓取完成，获得 {len(video_items)} 个视频")

                # 尝试翻页
                if not self._go_to_next_page():
                    logger.info("📌 已到达最后一页")
                    break

                current_page += 1
                time.sleep(2)

            except TimeoutException:
                logger.warning(f"⚠️ 第 {current_page} 页加载超时")
                break
            except Exception as e:
                logger.error(f"❌ 抓取第 {current_page} 页时出错: {e}")
                import traceback
                logger.error(traceback.format_exc())
                break

        logger.info(f"🎉 总计抓取 {len(all_videos)} 个视频")
        return all_videos

    def _parse_video_item(self, item) -> Optional[Dict[str, Any]]:
        """
        解析单个视频项（需要根据实际 HTML 结构调整）

        Args:
            item: BeautifulSoup 解析的视频元素

        Returns:
            视频数据字典
        """
        try:
            # 这里需要根据实际页面结构调整选择器
            # 示例：假设有标题、播放量、点赞数等信息
            title_elem = item.find(class_="post-title")
            stats_elem = item.find(class_="post-stats")
            cover_elem = item.find("img")

            video_data = {
                "title": title_elem.get_text(strip=True) if title_elem else "",
                "cover_url": cover_elem.get("src") if cover_elem else "",
                "stats": stats_elem.get_text(strip=True) if stats_elem else "",
                "raw_html": str(item),  # 保留原始 HTML 供后续分析
                "crawled_at": datetime.now().isoformat()
            }

            return video_data

        except Exception as e:
            logger.warning(f"解析视频项失败: {e}")
            return None

    def _go_to_next_page(self) -> bool:
        """
        点击下一页按钮

        Returns:
            是否成功翻页
        """
        try:
            # 根据你提供的 HTML，查找"下一页"按钮
            next_button = self.driver.find_element(
                By.XPATH,
                "//a[contains(@class, 'weui-desktop-btn') and contains(text(), '下一页')]"
            )

            # 检查按钮是否可点击（不是 disabled 状态）
            if "disabled" in next_button.get_attribute("class"):
                return False

            next_button.click()
            time.sleep(2)  # 等待页面加载
            return True

        except NoSuchElementException:
            logger.warning("未找到下一页按钮")
            return False
        except Exception as e:
            logger.error(f"翻页失败: {e}")
            return False

    def _cleanup(self):
        """清理资源"""
        if self.driver:
            try:
                self.driver.quit()
                logger.info("✅ 浏览器已关闭")
            except Exception as e:
                logger.warning(f"关闭浏览器时出错: {e}")

    async def fetch_video_detail(self, video_url: str) -> Dict[str, Any]:
        """
        抓取单个视频详情（待实现）

        Args:
            video_url: 视频详情页 URL

        Returns:
            视频详情数据
        """
        # TODO: 实现视频详情抓取
        return {
            "success": False,
            "error": "视频详情抓取功能待实现",
            "platform": "wechat_channels"
        }
