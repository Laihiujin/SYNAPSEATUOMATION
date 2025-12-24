#!/bin/bash
# ========================================
# 服务器上安装完整版 Google Chrome
# (Chromium 不支持 H.265 等编解码器)
# ========================================

set -e

echo "========================================"
echo "  安装 Google Chrome 稳定版"
echo "========================================"

# 检测操作系统
if [ -f /etc/os-release ]; then
  . /etc/os-release
  OS=$ID
else
  echo "❌ 无法检测操作系统"
  exit 1
fi

# Ubuntu/Debian 系统
if [[ "$OS" == "ubuntu" ]] || [[ "$OS" == "debian" ]]; then
  echo "[1/4] 添加 Google Chrome 软件源..."
  wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
  echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" | sudo tee /etc/apt/sources.list.d/google-chrome.list

  echo "[2/4] 更新软件包列表..."
  sudo apt-get update

  echo "[3/4] 安装 Google Chrome..."
  sudo apt-get install -y google-chrome-stable

  echo "[4/4] 验证安装..."
  google-chrome --version

  CHROME_PATH=$(which google-chrome)

# CentOS/RHEL 系统
elif [[ "$OS" == "centos" ]] || [[ "$OS" == "rhel" ]]; then
  echo "[1/4] 添加 Google Chrome YUM 源..."
  cat <<EOF | sudo tee /etc/yum.repos.d/google-chrome.repo
[google-chrome]
name=google-chrome
baseurl=http://dl.google.com/linux/chrome/rpm/stable/x86_64
enabled=1
gpgcheck=1
gpgkey=https://dl.google.com/linux/linux_signing_key.pub
EOF

  echo "[2/4] 安装 Google Chrome..."
  sudo yum install -y google-chrome-stable

  echo "[3/4] 验证安装..."
  google-chrome --version

  CHROME_PATH=$(which google-chrome)

else
  echo "❌ 不支持的操作系统: $OS"
  echo "请手动安装 Google Chrome 稳定版"
  exit 1
fi

# 配置环境变量
echo ""
echo "========================================"
echo "✅ Chrome 安装成功！"
echo "========================================"
echo "Chrome 路径: $CHROME_PATH"
echo ""
echo "下一步：在项目 .env 文件中添加以下配置"
echo ""
echo "LOCAL_CHROME_PATH=$CHROME_PATH"
echo ""

# 自动写入 .env
if [ -f ".env" ]; then
  # 检查是否已存在配置
  if grep -q "LOCAL_CHROME_PATH" .env; then
    echo "⚠️  .env 中已存在 LOCAL_CHROME_PATH，请手动更新"
  else
    echo "LOCAL_CHROME_PATH=$CHROME_PATH" >> .env
    echo "✅ 已自动添加到 .env 文件"
  fi
else
  echo "LOCAL_CHROME_PATH=$CHROME_PATH" > .env
  echo "✅ 已创建 .env 文件并添加配置"
fi

echo ""
echo "测试 Chrome 启动："
google-chrome --headless --disable-gpu --dump-dom https://www.google.com > /dev/null 2>&1 && echo "✅ Chrome 可以正常使用" || echo "❌ Chrome 启动失败，检查依赖"
