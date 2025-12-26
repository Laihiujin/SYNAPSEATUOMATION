# SynapseAutomation Desktop (Electron)

基于 Electron + Playwright 的智能内容发布与管理平台桌面版

## 📦 架构设计

- **Electron + Chromium**: 提供 UI 容器和可视化浏览器窗口
- **Playwright + 打包浏览器**: 提供无头自动化引擎（Chromium/Firefox）
- **FastAPI 后端**: 运行在本地的业务逻辑服务
- **React 前端**: 用户交互界面

## 🚀 快速开始

### 安装依赖

```bash
cd desktop-electron
npm install
```

### 开发模式

```bash
# 1. 启动前端开发服务器（在 syn_frontend_react 目录）
cd ../syn_frontend_react
npm run dev

# 2. 启动 Electron（在 desktop-electron 目录）
cd ../desktop-electron
npm run dev
```

### 准备浏览器资源

在打包前，需要先下载 Playwright 浏览器：

```bash
npm run prepare-browsers
```

可选：同时安装 Firefox（设置环境变量）：

```bash
set INSTALL_FIREFOX=true
npm run prepare-browsers
```

### 构建应用

```bash
# 构建但不打包（用于测试）
npm run build

# 完整打包（生成安装程序）
npm run dist

# 只打包 Windows 版本
npm run dist:win
```

## 📁 目录结构

```
desktop-electron/
├── src/
│   ├── main/           # Electron 主进程
│   │   └── index.js   # 主进程入口
│   ├── preload/        # 预加载脚本
│   │   └── index.js   # IPC 桥接
│   └── renderer/       # 渲染进程（前端）
│       └── index.html # 默认页面
│
├── build/              # 构建脚本
│   ├── prepare-browsers.js   # 准备浏览器
│   └── prepare-resources.js  # 准备后端
│
├── resources/          # 打包资源（不提交到 Git）
│   ├── browsers/      # Playwright 浏览器
│   └── backend/       # FastAPI 后端文件
│
├── dist-electron/      # 打包输出目录
│
├── package.json
└── electron-builder.yml
```

## 🔧 开发说明

### 主进程 (main/index.js)

负责：
- 启动 FastAPI 后端进程
- 创建主窗口
- 管理可视化浏览器窗口
- 设置 Playwright 浏览器路径
- IPC 通信处理

### 预加载脚本 (preload/index.js)

提供安全的 API 给渲染进程：
- `electronAPI.playwright.getBrowserPath()` - 获取浏览器路径
- `electronAPI.browser.createVisual(url)` - 创建可视化窗口
- `electronAPI.app.getInfo()` - 获取应用信息

### 使用示例（在前端代码中）

```javascript
// 获取应用信息
const appInfo = await window.electronAPI.app.getInfo();
console.log('App version:', appInfo.version);

// 创建可视化浏览器窗口
const windowId = await window.electronAPI.browser.createVisual(
  'https://www.douyin.com',
  { width: 1200, height: 800, title: '抖音创作者平台' }
);

// 获取 Playwright 浏览器路径
const browserPath = await window.electronAPI.playwright.getBrowserPath();
```

## 📦 打包说明

### 打包流程

1. 运行 `prepare-browsers.js` 下载浏览器到 `resources/browsers`
2. 运行 `prepare-resources.js` 复制后端文件到 `resources/backend`
3. 构建前端（如果需要）
4. electron-builder 打包整个应用

### 打包产物

- `dist-electron/SynapseAutomation-Setup-1.0.0.exe` - Windows 安装程序
- 包含所有依赖（Electron、Playwright 浏览器、后端）
- 预计大小：400-500MB

### 浏览器路径配置

应用会自动检测运行环境：

- **开发模式**: 使用 `E:/SynapseAutomation/browsers`
- **生产模式**: 使用 `resources/browsers`（打包后）

后端会通过环境变量 `PLAYWRIGHT_BROWSERS_PATH` 获取路径。

## 🐛 调试

### 查看日志

日志文件位置：
- Windows: `%USERPROFILE%\AppData\Roaming\synapse-automation\logs\main.log`

### 开启 DevTools

在开发模式下会自动打开，或者在主进程中添加：

```javascript
mainWindow.webContents.openDevTools();
```

### 调试主进程

```bash
npm run dev:inspect
```

然后在 Chrome 中访问 `chrome://inspect`

## 📋 TODO

- [ ] 添加自动更新功能（electron-updater）
- [ ] 优化打包体积（按需打包浏览器）
- [ ] 添加应用图标和安装界面
- [ ] 集成代码签名
- [ ] macOS/Linux 版本支持

## 🔗 相关资源

- [Electron 文档](https://www.electronjs.org/docs/latest)
- [electron-builder 文档](https://www.electron.build/)
- [Playwright 文档](https://playwright.dev/)
