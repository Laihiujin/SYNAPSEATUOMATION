# 🚀 快速开始指南

## ✅ 已完成的搭建

desktop-electron 目录已成功创建，包含以下文件：

```
desktop-electron/
├── src/
│   ├── main/
│   │   └── index.js           ✅ 主进程（启动后端、管理窗口）
│   ├── preload/
│   │   └── index.js           ✅ 预加载脚本（IPC 桥接）
│   └── renderer/
│       └── index.html         ✅ 默认 HTML 页面
│
├── build/
│   ├── prepare-browsers.js    ✅ 浏览器准备脚本
│   └── prepare-resources.js   ✅ 后端资源准备脚本
│
├── package.json               ✅ 项目配置
├── electron-builder.yml       ✅ 打包配置
├── .gitignore                 ✅ Git 忽略文件
├── README.md                  ✅ 完整文档
└── start.bat                  ✅ 快速启动脚本
```

## 📋 下一步操作

### 1️⃣ 安装依赖

```bash
cd desktop-electron
npm install
```

依赖包括：
- `electron` - Electron 框架
- `electron-builder` - 打包工具
- `electron-log` - 日志管理
- `playwright-core` - Playwright 核心（生产用）
- `playwright` - Playwright 完整版（开发用）

### 2️⃣ 准备浏览器

```bash
npm run prepare-browsers
```

这会下载 Playwright Chromium 到 `resources/browsers/` 目录（约 280MB）。

可选：安装 Firefox（额外 90MB）：
```bash
set INSTALL_FIREFOX=true
npm run prepare-browsers
```

### 3️⃣ 测试开发模式

#### 方式 A：使用快速启动脚本（推荐）

双击 `start.bat` 即可自动安装依赖、准备浏览器并启动应用。

#### 方式 B：手动启动

```bash
# 直接启动 Electron
npm run dev

# 启动后会：
# 1. 尝试启动 FastAPI 后端（需要先启动）
# 2. 打开 Electron 窗口
# 3. 加载前端页面
```

### 4️⃣ 集成现有前端

当前使用的是简单的 HTML 页面，需要集成 React 前端：

#### 选项 A：开发模式（推荐）

1. 启动 React 开发服务器：
```bash
cd ../syn_frontend_react
npm run dev
```

2. 修改 `src/main/index.js` 中的前端 URL（已配置好）：
```javascript
// 开发环境会自动加载 http://localhost:3000
```

3. 启动 Electron：
```bash
cd ../desktop-electron
npm run dev
```

#### 选项 B：构建模式

1. 构建 React 前端：
```bash
cd ../syn_frontend_react
npm run build
```

2. 复制构建产物到 Electron：
```bash
cp -r build/* ../desktop-electron/src/renderer/
```

3. 启动 Electron：
```bash
cd ../desktop-electron
npm run dev
```

### 5️⃣ 完整打包

```bash
# 准备浏览器（如果还没准备）
npm run prepare-browsers

# 准备后端资源
npm run prepare-resources

# 完整打包
npm run dist
```

打包后会在 `dist-electron/` 目录生成安装程序。

## 🔧 关键配置说明

### Playwright 浏览器路径

应用会自动设置环境变量 `PLAYWRIGHT_BROWSERS_PATH`：

- **开发模式**: `E:/SynapseAutomation/browsers`（如果存在）
- **生产模式**: `resources/browsers`（打包后）

后端 Python 代码会自动读取这个环境变量。

### 后端启动

主进程会自动启动 FastAPI 后端：

- **开发模式**: 使用 `python E:/SynapseAutomation/syn_backend/main.py`
- **生产模式**: 使用打包的 Python 和后端文件

### IPC 通信

前端可以通过 `window.electronAPI` 调用：

```javascript
// 获取应用信息
const info = await window.electronAPI.app.getInfo();

// 创建可视化浏览器窗口
const windowId = await window.electronAPI.browser.createVisual(
  'https://www.douyin.com'
);

// 获取 Playwright 浏览器路径
const browserPath = await window.electronAPI.playwright.getBrowserPath();
```

## 🐛 常见问题

### Q: 浏览器下载太慢？

A: 设置国内镜像：
```bash
set PLAYWRIGHT_DOWNLOAD_HOST=https://playwright.azureedge.net
npm run prepare-browsers
```

### Q: 后端启动失败？

A: 检查：
1. Python 是否已安装
2. `syn_backend/main.py` 是否存在
3. 依赖是否已安装（`pip install -r requirements.txt`）

### Q: 前端页面空白？

A: 开发模式下需要先启动 React 开发服务器：
```bash
cd ../syn_frontend_react
npm run dev
```

### Q: 打包后浏览器找不到？

A: 确保运行了 `npm run prepare-browsers`，并且 `resources/browsers/` 目录存在。

## 📚 更多文档

详细文档请参考 `README.md`。

## ✅ 验证清单

- [ ] `npm install` 成功
- [ ] `npm run prepare-browsers` 完成
- [ ] `resources/browsers/` 目录包含浏览器文件
- [ ] `npm run dev` 能启动应用
- [ ] Electron 窗口正常显示
- [ ] 后端服务正常启动
- [ ] 前端页面能正常加载

全部完成后，就可以开始开发了！🎉
