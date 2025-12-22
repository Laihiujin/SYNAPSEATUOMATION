# ==============================================
# SynapseAutomation 全局配置文件 (.env)
# 请勿将真实密钥提交到仓库（.env 已被默认忽略）
# ==============================================

# ----------------------------------------------
# 浏览器配置 (Browser Configuration)
# ----------------------------------------------
# Chrome 浏览器路径

# LOCAL_CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" 
# LOCAL_CHROME_PATH="C:/Program Files/Google/Chrome/Application/chrome.exe"
#linux版安装位置

# 浏览器是否隐藏 (Headless Mode)
# true = 隐藏浏览器 (后台运行)
# false = 显示浏览器 (调试模式)
PLAYWRIGHT_HEADLESS=false


# ----------------------------------------------
# 后端服务配置 (Backend Configuration)
# ----------------------------------------------
# 后端监听地址
BACKEND_HOST=0.0.0.0
# 后端监听端口
BACKEND_PORT=7000

# ----------------------------------------------
# 前端配置 (Frontend Configuration)
# ----------------------------------------------
# 前端连接后端的 API 地址
# 注意：Next.js 需要以 NEXT_PUBLIC_ 开头才能在浏览器端访问
NEXT_PUBLIC_BACKEND_URL=http://localhost:7000

# ----------------------------------------------
# 路径配置 (Path Configuration)
# ----------------------------------------------
# 视频文件存储目录
VIDEO_DIR_NAME=syn_backend/videoFile
# 数据库文件路径
DB_PATH_REL=syn_backend/db/database.db
# Cookie 文件存储目录
COOKIES_DIR_NAME=syn_backend/cookiesFile
# 浏览器是否隐藏 (Headless Mode)
# true = 隐藏浏览器 (后台运行)|false = 显示浏览器 (调试模式)

SILICONFLOW_API_KEY=your_api_key_here

SOCIAL_COPILOT_BASE_URL=http://localhost:3300
SOCIAL_COPILOT_TIMEOUT=20
