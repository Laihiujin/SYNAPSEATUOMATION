#!/bin/bash
# ========================================
# Linux 服务器安装 Chrome for Testing
# Chrome for Testing = 完整版 Chrome (非 Chromium)
# 支持 H.265、视频号等所有平台
# ========================================

set -e

echo "========================================"
echo "  安装 Chrome for Testing (Linux)"
echo "========================================"

# 配置
CHROME_VERSION="131.0.6778.204"  # 可修改为最新版本
INSTALL_DIR="$HOME/.chrome-for-testing"
CHROME_URL="https://storage.googleapis.com/chrome-for-testing-public/${CHROME_VERSION}/linux64/chrome-linux64.zip"

echo "[1/5] 检查系统依赖..."
# 检查必要的命令
command -v wget >/dev/null 2>&1 || { echo "安装 wget..."; sudo apt-get install -y wget || sudo yum install -y wget; }
command -v unzip >/dev/null 2>&1 || { echo "安装 unzip..."; sudo apt-get install -y unzip || sudo yum install -y unzip; }

# 检查并安装 Chrome 依赖库
echo "检查 Chrome 运行依赖..."
if command -v apt-get &> /dev/null; then
    # Ubuntu/Debian
    sudo apt-get update
    sudo apt-get install -y \
        libnss3 \
        libatk1.0-0 \
        libatk-bridge2.0-0 \
        libcups2 \
        libdrm2 \
        libxkbcommon0 \
        libxcomposite1 \
        libxdamage1 \
        libxfixes3 \
        libxrandr2 \
        libgbm1 \
        libasound2 \
        libpango-1.0-0 \
        libcairo2 \
        fonts-liberation \
        xdg-utils
elif command -v yum &> /dev/null; then
    # CentOS/RHEL
    sudo yum install -y \
        nss \
        atk \
        at-spi2-atk \
        cups-libs \
        libdrm \
        libxkbcommon \
        libXcomposite \
        libXdamage \
        libXfixes \
        libXrandr \
        mesa-libgbm \
        alsa-lib \
        pango \
        cairo \
        liberation-fonts \
        xdg-utils
fi

echo "[2/5] 创建安装目录..."
mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"

echo "[3/5] 下载 Chrome for Testing ${CHROME_VERSION}..."
if [ -f "chrome-linux64.zip" ]; then
    echo "⚠️  安装包已存在，跳过下载"
else
    wget "$CHROME_URL" -O chrome-linux64.zip
    echo "✅ 下载完成"
fi

echo "[4/5] 解压安装..."
if [ -d "chrome-linux64" ]; then
    echo "⚠️  删除旧版本..."
    rm -rf chrome-linux64
fi
unzip -q chrome-linux64.zip
chmod +x chrome-linux64/chrome
echo "✅ 解压完成"

echo "[5/5] 配置环境变量..."
CHROME_PATH="$INSTALL_DIR/chrome-linux64/chrome"

# 写入项目 .env 文件
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$PROJECT_ROOT/.env"

if [ -f "$ENV_FILE" ]; then
    if grep -q "LOCAL_CHROME_PATH" "$ENV_FILE"; then
        # 更新现有配置
        sed -i "s|LOCAL_CHROME_PATH=.*|LOCAL_CHROME_PATH=$CHROME_PATH|g" "$ENV_FILE"
        echo "✅ 已更新 .env 中的 LOCAL_CHROME_PATH"
    else
        # 添加新配置
        echo "LOCAL_CHROME_PATH=$CHROME_PATH" >> "$ENV_FILE"
        echo "✅ 已添加 LOCAL_CHROME_PATH 到 .env"
    fi
else
    # 创建 .env
    echo "LOCAL_CHROME_PATH=$CHROME_PATH" > "$ENV_FILE"
    echo "✅ 已创建 .env 文件"
fi

# 测试 Chrome
echo ""
echo "========================================"
echo "✅ Chrome for Testing 安装成功！"
echo "========================================"
echo "安装位置: $CHROME_PATH"
echo "版本信息:"
"$CHROME_PATH" --version

echo ""
echo "测试 Chrome 启动..."
"$CHROME_PATH" --headless --disable-gpu --dump-dom https://www.google.com > /dev/null 2>&1 && \
    echo "✅ Chrome 可以正常运行" || \
    echo "❌ Chrome 启动失败，请检查依赖库"

echo ""
echo "环境变量已配置到: $ENV_FILE"
echo ""
echo "⚠️  如果运行时报错缺少库，执行："
echo "   ldd $CHROME_PATH | grep 'not found'"
echo ""
echo "清理安装包（可选）："
echo "   rm $INSTALL_DIR/chrome-linux64.zip"
