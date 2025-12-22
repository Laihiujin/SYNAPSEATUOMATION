from pathlib import Path
import os
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

# 兼容两种启动方式：
# - 在 `syn_backend/` 目录启动：读取 `syn_backend/.env`
# - 在项目根目录启动：读取 `./.env`
_root_env = BASE_DIR.parent / ".env"
_local_env = BASE_DIR / ".env"
if _root_env.exists():
    load_dotenv(_root_env, override=True)
if _local_env.exists():
    # 仅作为本地补充配置，不覆盖根目录 .env 中已经存在的变量
    load_dotenv(_local_env, override=False)

XHS_SERVER = "http://127.0.0.1:11901"

# 从 .env 获取配置，如果不存在则使用默认值
LOCAL_CHROME_PATH = (
    os.getenv("LOCAL_CHROME_PATH")
    or os.getenv("LOCAL_CHROME_PATH_WIN")
    or os.getenv("LOCAL_CHROME_PATH_MAC")
    or os.getenv("LOCAL_CHROME_PATH_LINUX")
)

def _env_bool(name: str, default: bool) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    raw = raw.strip().lower()
    if raw in {"1", "true", "yes", "y", "on"}:
        return True
    if raw in {"0", "false", "no", "n", "off"}:
        return False
    return default


# Playwright Headless Mode
# `PLAYWRIGHT_HEADLESS=true` => 无头；`false` => 显示浏览器窗口
PLAYWRIGHT_HEADLESS = _env_bool("PLAYWRIGHT_HEADLESS", True)
