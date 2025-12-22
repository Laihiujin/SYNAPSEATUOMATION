from pathlib import Path

BASE_DIR = Path(__file__).parent.resolve()
XHS_SERVER = "http://127.0.0.1:11901"
# LOCAL_CHROME_PATH = ""   # change me necessary！ for example 
LOCAL_CHROME_PATH = "C:/Program Files/Google/Chrome/Application/chrome.exe"
# LOCAL_CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"


# Playwright Headless Mode - Set to False to show browser for debugging
PLAYWRIGHT_HEADLESS = False  # False可以看到浏览器窗口,方便调试；设置为True隐藏浏览器窗口
