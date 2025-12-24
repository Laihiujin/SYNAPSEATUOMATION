#!/bin/bash
# ========================================
# SynapseAutomation 服务器一键部署脚本
# ========================================

set -e  # 遇到错误立即退出

echo "========================================"
echo "  SynapseAutomation 服务器部署"
echo "========================================"

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查是否为root用户
if [ "$EUID" -eq 0 ]; then
  echo -e "${YELLOW}警告: 不建议使用root用户运行${NC}"
  read -p "是否继续? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# 步骤1：检查依赖
echo -e "\n${GREEN}[1/8] 检查系统依赖...${NC}"
command -v git >/dev/null 2>&1 || { echo -e "${RED}❌ 需要安装 git${NC}"; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo -e "${RED}❌ 需要安装 python3${NC}"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo -e "${RED}❌ 需要安装 Node.js${NC}"; exit 1; }
command -v redis-server >/dev/null 2>&1 || { echo -e "${RED}❌ 需要安装 Redis${NC}"; exit 1; }
echo -e "${GREEN}✅ 系统依赖检查通过${NC}"

# 步骤2：创建Python虚拟环境
echo -e "\n${GREEN}[2/8] 创建Python虚拟环境...${NC}"
if [ ! -d "syn-env" ]; then
  python3 -m venv syn-env
  echo -e "${GREEN}✅ 虚拟环境创建完成${NC}"
else
  echo -e "${YELLOW}⚠️  虚拟环境已存在，跳过创建${NC}"
fi

# 激活虚拟环境
source syn-env/bin/activate

# 步骤3：安装Python依赖
echo -e "\n${GREEN}[3/8] 安装后端依赖...${NC}"
pip install -r requirements.txt
echo -e "${GREEN}✅ 后端依赖安装完成${NC}"

# 步骤4：配置后端环境
echo -e "\n${GREEN}[4/8] 配置后端环境...${NC}"
if [ ! -f "syn_backend/config/conf.py" ]; then
  if [ -f "syn_backend/config/conf_template.py" ]; then
    cp syn_backend/config/conf_template.py syn_backend/config/conf.py
    echo -e "${YELLOW}⚠️  请编辑 syn_backend/config/conf.py 填入配置${NC}"
  else
    echo -e "${RED}❌ 未找到配置模板${NC}"
  fi
else
  echo -e "${GREEN}✅ 配置文件已存在${NC}"
fi

# 步骤5：安装前端依赖
echo -e "\n${GREEN}[5/8] 安装前端依赖...${NC}"
cd syn_frontend_react
npm install
echo -e "${GREEN}✅ 前端依赖安装完成${NC}"

# 步骤6：安装 Chrome for Testing
echo -e "\n${GREEN}[6/9] 安装 Chrome for Testing...${NC}"
if [ -f "scripts/install_chrome_for_testing_linux.sh" ]; then
  chmod +x scripts/install_chrome_for_testing_linux.sh
  ./scripts/install_chrome_for_testing_linux.sh
  echo -e "${GREEN}✅ Chrome for Testing 安装完成${NC}"
else
  echo -e "${YELLOW}⚠️  未找到 Chrome 安装脚本，请手动安装${NC}"
fi

# 步骤7：构建前端
echo -e "\n${GREEN}[7/9] 构建前端应用...${NC}"
npm run build
echo -e "${GREEN}✅ 前端构建完成${NC}"
cd ..

# 步骤8：启动Redis
echo -e "\n${GREEN}[8/9] 启动Redis...${NC}"
if pgrep redis-server > /dev/null; then
  echo -e "${YELLOW}⚠️  Redis已在运行${NC}"
else
  redis-server --daemonize yes
  echo -e "${GREEN}✅ Redis启动成功${NC}"
fi

# 步骤9：使用PM2启动服务
echo -e "\n${GREEN}[9/9] 启动应用服务...${NC}"
if ! command -v pm2 &> /dev/null; then
  echo "安装PM2..."
  npm install -g pm2
fi

# 修改 ecosystem.config.js 中的Python路径
PYTHON_PATH=$(which python)
sed -i "s|interpreter: 'python'|interpreter: '$PYTHON_PATH'|g" ecosystem.config.js

pm2 start ecosystem.config.js
pm2 save
echo -e "${GREEN}✅ 所有服务启动成功${NC}"

# 显示服务状态
echo -e "\n========================================"
echo -e "${GREEN}✅ 部署完成！${NC}"
echo -e "========================================"
pm2 status

echo -e "\n${GREEN}访问地址：${NC}"
echo -e "  前端: http://localhost:3000"
echo -e "  后端API: http://localhost:8000/docs"
echo -e "\n${YELLOW}常用命令：${NC}"
echo -e "  查看状态: pm2 status"
echo -e "  查看日志: pm2 logs"
echo -e "  重启服务: pm2 restart all"
echo -e "  停止服务: pm2 stop all"
echo -e "\n${YELLOW}下一步：${NC}"
echo -e "  1. 配置Nginx反向代理（可选）"
echo -e "  2. 配置域名和SSL证书（可选）"
echo -e "  3. 设置开机自启: pm2 startup"
