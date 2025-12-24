# 🚀 SynapseAutomation 服务器部署指南

## 📋 目录
- [方案对比](#方案对比)
- [方案1：Git部署（推荐）](#方案1git部署推荐)
- [方案2：压缩包部署](#方案2压缩包部署)
- [生产环境配置](#生产环境配置)
- [性能优化](#性能优化)

---

## 方案对比

| 方案 | 传输大小 | 优点 | 缺点 |
|------|---------|------|------|
| Git克隆 | ~50MB | 自动排除缓存，支持版本控制 | 需要Git访问权限 |
| 压缩包 | ~50-100MB | 无需Git，离线部署 | 需手动清理缓存 |
| 完整拷贝 | ~5-10GB | 包含所有依赖 | **不推荐**（体积太大） |

---

## 方案1：Git部署（推荐）

### 📦 步骤1：克隆代码

```bash
# SSH方式（推荐）
git clone git@github.com:your-username/SynapseAutomation.git

# HTTPS方式
git clone https://github.com/your-username/SynapseAutomation.git

cd SynapseAutomation
```

### 🐍 步骤2：后端环境配置

```bash
# 创建Conda环境
conda create -n syn python=3.11 -y
conda activate syn

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp syn_backend/config/conf_template.py syn_backend/config/conf.py
# 编辑 conf.py 填入生产环境配置
```

### ⚛️ 步骤3：前端构建

```bash
cd syn_frontend_react

# 安装依赖
npm install

# 生产构建
npm run build

# 启动（PM2管理）
npm install -g pm2
pm2 start npm --name "synapse-frontend" -- start
```

### 🎭 步骤4：安装浏览器（重要）

**推荐方案：Chrome for Testing**（完整版 Chrome，支持所有平台）

```bash
# 运行安装脚本
chmod +x scripts/install_chrome_for_testing_linux.sh
./scripts/install_chrome_for_testing_linux.sh

# 脚本会自动：
# 1. 下载 Chrome for Testing (约 150MB)
# 2. 安装必要的系统依赖
# 3. 配置 .env 中的 LOCAL_CHROME_PATH
```

**为什么选择 Chrome for Testing？**
- ✅ 完整版 Chrome（非 Chromium）
- ✅ 支持 H.265 编码（视频号必需）
- ✅ 支持所有商业编解码器
- ✅ 无需安装到系统，绿色便携
- ✅ 版本固定，避免自动更新

**❌ 不推荐 Playwright Chromium**
```bash
# Chromium 缺少商业编解码器，无法发布到视频号等平台
playwright install chromium  # 不推荐！
```

### 🚀 步骤5：启动服务

```bash
# 启动Redis
redis-server --daemonize yes

# 启动Celery Worker
cd syn_backend
celery -A fastapi_app.celery_app worker -l info -P threads

# 启动FastAPI（Uvicorn）
cd syn_backend
uvicorn fastapi_app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

---

## 方案2：压缩包部署

### 📋 本地准备

```cmd
REM 1. 清理缓存
prepare_deploy.bat

REM 2. 打包（7z压缩）
7z a -mx=9 SynapseAutomation-deploy.7z E:\SynapseAutomation ^
  -xr!syn-env -xr!.git -xr!*.pyc

REM 或使用tar（Linux兼容）
tar -czf SynapseAutomation-deploy.tar.gz ^
  --exclude=syn-env ^
  --exclude=.git ^
  --exclude=__pycache__ ^
  E:\SynapseAutomation
```

### 📤 服务器部署

```bash
# 1. 上传到服务器
scp SynapseAutomation-deploy.7z user@server:/opt/

# 2. 解压
cd /opt
7z x SynapseAutomation-deploy.7z
# 或 tar -xzf SynapseAutomation-deploy.tar.gz

# 3. 按方案1的步骤2-5执行
```

---

## 生产环境配置

### 1️⃣ Nginx 反向代理

```nginx
# /etc/nginx/sites-available/synapse
server {
    listen 80;
    server_name your-domain.com;

    # 前端（Next.js）
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # 后端 API
    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 静态资源
    location /_next/static/ {
        proxy_pass http://localhost:3000/_next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 2️⃣ PM2 进程管理

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'synapse-frontend',
      cwd: './syn_frontend_react',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'synapse-backend',
      cwd: './syn_backend',
      script: 'uvicorn',
      args: 'fastapi_app.main:app --host 0.0.0.0 --port 8000 --workers 4',
      interpreter: '/opt/conda/envs/syn/bin/python'
    },
    {
      name: 'synapse-celery',
      cwd: './syn_backend',
      script: 'celery',
      args: '-A fastapi_app.celery_app worker -l info -P threads',
      interpreter: '/opt/conda/envs/syn/bin/python'
    }
  ]
}
```

启动：
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # 开机自启
```

### 3️⃣ 环境变量配置

```bash
# .env（生产环境）
NODE_ENV=production
REDIS_HOST=localhost
REDIS_PORT=6379
DATABASE_URL=sqlite:///./data.db
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# Chrome路径（如果使用系统Chrome）
LOCAL_CHROME_PATH=/usr/bin/google-chrome
```

---

## 性能优化

### 🔧 后端优化

```python
# syn_backend/fastapi_app/main.py
import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        workers=4,  # CPU核心数
        log_level="warning",  # 生产环境减少日志
        access_log=False,  # 关闭访问日志
    )
```

### ⚡ 前端优化

```json
// syn_frontend_react/next.config.js
{
  "experimental": {
    "optimizeCss": true,
    "scrollRestoration": true
  },
  "compress": true,
  "poweredByHeader": false
}
```

### 🗄️ Redis优化

```bash
# /etc/redis/redis.conf
maxmemory 2gb
maxmemory-policy allkeys-lru
save ""  # 关闭RDB持久化（缓存模式）
```

### 📊 监控

```bash
# 安装监控工具
npm install -g pm2
pm2 install pm2-logrotate  # 日志轮转

# 查看状态
pm2 status
pm2 monit
pm2 logs
```

---

## 🛡️ 安全检查清单

- [ ] 修改默认密码和密钥
- [ ] 配置防火墙（只开放80/443端口）
- [ ] 启用HTTPS（Let's Encrypt）
- [ ] 禁用调试模式
- [ ] 定期备份数据库
- [ ] 配置日志轮转
- [ ] 限制API请求速率

---

## 📞 故障排查

### 前端无法访问
```bash
pm2 logs synapse-frontend
# 检查端口占用
netstat -tulnp | grep 3000
```

### 后端500错误
```bash
pm2 logs synapse-backend
# 检查数据库连接
sqlite3 syn_backend/data.db ".tables"
```

### Celery任务失败
```bash
pm2 logs synapse-celery
# 检查Redis连接
redis-cli ping
```

---

## 🎯 快速启动命令

```bash
# 一键启动所有服务
pm2 start ecosystem.config.js

# 查看运行状态
pm2 status

# 重启服务
pm2 restart all

# 停止服务
pm2 stop all
```

---

**部署完成后访问**：
- 前端：http://your-domain.com
- 后端API：http://your-domain.com/api/docs

需要帮助？查看日志：`pm2 logs`
