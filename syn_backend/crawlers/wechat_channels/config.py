"""
视频号爬虫配置
"""
from pathlib import Path

# 项目根目录
ROOT_DIR = Path(__file__).parent.parent.parent.parent

# 浏览器配置
# 优先使用本地 Chromium（更快，无需下载）
CHROME_PATHS = [
    ROOT_DIR / "browsers/chromium/chromium-1161/chrome-win/chrome.exe",
    ROOT_DIR / "browsers/chromium/chromium_headless_shell-1161/chrome-win/chrome-headless-shell.exe",
]

# 爬虫配置
HEADLESS_MODE = False  # 是否使用无头模式（False = 显示浏览器，方便调试）
PAGE_LOAD_TIMEOUT = 30  # 页面加载超时（秒）
ELEMENT_WAIT_TIMEOUT = 10  # 元素等待超时（秒）
SCROLL_PAUSE_TIME = 2  # 滚动后等待时间（秒）

# User-Agent
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/125.0.0.0 Safari/537.36"
)

# 视频号平台 URL
CHANNELS_BASE_URL = "https://channels.weixin.qq.com"
CHANNELS_PLATFORM_URL = f"{CHANNELS_BASE_URL}/platform/post/list"

# Cookie 和数据目录
COOKIES_DIR = ROOT_DIR / "syn_backend/cookiesFile"
DATABASE_PATH = ROOT_DIR / "syn_backend/db/database.db"
