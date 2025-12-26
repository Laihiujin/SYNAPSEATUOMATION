const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const log = require('electron-log');
const fs = require('fs');

// 配置日志
log.transports.file.level = 'info';
log.transports.console.level = 'debug';

class SynapseApp {
  constructor() {
    this.mainWindow = null;
    this.backendProcess = null;
    this.playwrightBrowserPath = null;
    this.visualBrowserWindows = new Map();
  }

  async initialize() {
    log.info('🚀 SynapseAutomation 启动中...');

    // 等待 Electron 准备就绪
    await app.whenReady();

    // 1. 设置 Playwright 浏览器路径
    this.setupPlaywrightPath();

    // 2. 启动 FastAPI 后端
    await this.startBackend();

    // 3. 创建主窗口
    this.createMainWindow();

    // 4. 设置 IPC 处理
    this.setupIPC();

    // 5. 设置应用事件
    this.setupAppEvents();

    log.info('✅ SynapseAutomation 启动完成');
  }

  setupPlaywrightPath() {
    // 获取打包后的资源路径
    const isDev = !app.isPackaged;

    if (isDev) {
      // 开发环境：使用项目根目录的浏览器
      this.playwrightBrowserPath = path.join(__dirname, '../../../browsers');
      log.info('🔧 开发模式 - 浏览器路径:', this.playwrightBrowserPath);
    } else {
      // 生产环境：使用打包后的浏览器
      this.playwrightBrowserPath = path.join(process.resourcesPath, 'browsers');
      log.info('📦 生产模式 - 浏览器路径:', this.playwrightBrowserPath);
    }

    // 设置环境变量，让 Playwright 使用指定的浏览器
    process.env.PLAYWRIGHT_BROWSERS_PATH = this.playwrightBrowserPath;

    // 验证浏览器是否存在
    if (fs.existsSync(this.playwrightBrowserPath)) {
      log.info('✅ Playwright 浏览器路径已设置');
    } else {
      log.warn('⚠️ Playwright 浏览器路径不存在，自动化功能可能无法使用');
    }
  }

  async startBackend() {
    const isDev = !app.isPackaged;

    log.info('🔄 启动 FastAPI 后端...');

    return new Promise((resolve, reject) => {
      let pythonPath, mainScript, cwd;

      if (isDev) {
        // 开发环境：使用系统 Python 和源码
        pythonPath = 'python';
        mainScript = path.join(__dirname, '../../../syn_backend/fastapi_app/main.py');
        cwd = path.join(__dirname, '../../../syn_backend/fastapi_app');
      } else {
        // 生产环境：使用打包的后端（需要系统 Python）
        const backendPath = path.join(process.resourcesPath, 'backend');
        pythonPath = 'python';  // 使用系统 Python
        mainScript = path.join(backendPath, 'fastapi_app/main.py');
        cwd = path.join(backendPath, 'fastapi_app');
      }

      log.info('Python 路径:', pythonPath);
      log.info('主脚本:', mainScript);

      // 启动后端进程
      this.backendProcess = spawn(pythonPath, [mainScript], {
        cwd: cwd,
        env: {
          ...process.env,
          PLAYWRIGHT_BROWSERS_PATH: this.playwrightBrowserPath,
          PYTHONPATH: cwd
        }
      });

      // 监听后端输出
      this.backendProcess.stdout.on('data', (data) => {
        const output = data.toString();
        log.info('[Backend]', output);

        // 检测后端是否启动成功
        if (output.includes('Uvicorn running') || output.includes('Application startup complete')) {
          log.info('✅ FastAPI 后端启动成功');
          resolve();
        }
      });

      this.backendProcess.stderr.on('data', (data) => {
        log.error('[Backend Error]', data.toString());
      });

      this.backendProcess.on('error', (error) => {
        log.error('❌ 后端进程启动失败:', error);
        reject(error);
      });

      this.backendProcess.on('exit', (code) => {
        log.warn(`⚠️ 后端进程退出，退出码: ${code}`);
      });

      // 超时保护：10秒后如果还没启动就继续
      setTimeout(() => {
        log.warn('⚠️ 后端启动超时，继续启动应用');
        resolve();
      }, 10000);
    });
  }

  createMainWindow() {
    log.info('🪟 创建主窗口...');

    this.mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 1200,
      minHeight: 700,
      show: false,
      backgroundColor: '#ffffff',
      titleBarStyle: 'default',
      autoHideMenuBar: true,
      webPreferences: {
        preload: path.join(__dirname, '../preload/index.js'),
        contextIsolation: true,
        nodeIntegration: false,
        webSecurity: true
      }
    });

    // 加载前端页面
    const isDev = !app.isPackaged;

    if (isDev) {
      // 开发环境：加载 React 开发服务器
      const frontendUrl = 'http://localhost:3000';
      log.info('🔧 开发模式 - 加载前端:', frontendUrl);

      this.mainWindow.loadURL(frontendUrl).catch(() => {
        // 如果开发服务器未启动，加载本地 HTML
        log.warn('⚠️ 前端开发服务器未启动，加载本地页面');
        this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
      });

      // 开发模式打开开发者工具
      this.mainWindow.webContents.openDevTools();
    } else {
      // 生产环境：加载构建后的前端
      const indexPath = path.join(__dirname, '../renderer/index.html');
      log.info('📦 生产模式 - 加载前端:', indexPath);
      this.mainWindow.loadFile(indexPath);
    }

    // 窗口准备好后显示
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow.show();
      log.info('✅ 主窗口显示完成');
    });

    // 窗口关闭事件
    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
      log.info('🪟 主窗口已关闭');
    });
  }

  setupIPC() {
    log.info('🔗 设置 IPC 通信...');

    // 获取 Playwright 浏览器路径
    ipcMain.handle('playwright:getBrowserPath', () => {
      return this.playwrightBrowserPath;
    });

    // 创建可视化浏览器窗口（用于调试和预览）
    ipcMain.handle('browser:createVisual', async (event, url, options = {}) => {
      log.info('🌐 创建可视化浏览器窗口:', url);

      const browserWindow = new BrowserWindow({
        width: options.width || 1200,
        height: options.height || 800,
        show: true,
        title: options.title || '浏览器预览',
        webPreferences: {
          contextIsolation: true,
          nodeIntegration: false,
          webSecurity: true
        }
      });

      await browserWindow.loadURL(url);

      const windowId = browserWindow.id;
      this.visualBrowserWindows.set(windowId, browserWindow);

      browserWindow.on('closed', () => {
        this.visualBrowserWindows.delete(windowId);
      });

      return windowId;
    });

    // 关闭可视化浏览器窗口
    ipcMain.handle('browser:closeVisual', (event, windowId) => {
      const win = this.visualBrowserWindows.get(windowId);
      if (win && !win.isDestroyed()) {
        win.close();
        return true;
      }
      return false;
    });

    // 获取应用信息
    ipcMain.handle('app:getInfo', () => {
      return {
        version: app.getVersion(),
        name: app.getName(),
        isPackaged: app.isPackaged,
        resourcesPath: process.resourcesPath,
        playwrightBrowserPath: this.playwrightBrowserPath
      };
    });

    log.info('✅ IPC 通信设置完成');
  }

  setupAppEvents() {
    // 所有窗口关闭时退出应用（macOS 除外）
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        this.cleanup();
        app.quit();
      }
    });

    // macOS 激活应用时重新创建窗口
    app.on('activate', () => {
      if (this.mainWindow === null) {
        this.createMainWindow();
      }
    });

    // 应用退出前清理
    app.on('before-quit', () => {
      log.info('🔄 应用即将退出，清理资源...');
      this.cleanup();
    });
  }

  cleanup() {
    log.info('🧹 清理资源...');

    // 关闭所有可视化浏览器窗口
    for (const [id, win] of this.visualBrowserWindows) {
      if (!win.isDestroyed()) {
        win.close();
      }
    }
    this.visualBrowserWindows.clear();

    // 终止后端进程
    if (this.backendProcess && !this.backendProcess.killed) {
      log.info('🛑 终止后端进程...');
      this.backendProcess.kill();
      this.backendProcess = null;
    }

    log.info('✅ 资源清理完成');
  }
}

// 启动应用
const synapseApp = new SynapseApp();

// 捕获未处理的错误
process.on('uncaughtException', (error) => {
  log.error('❌ 未捕获的异常:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  log.error('❌ 未处理的 Promise 拒绝:', reason);
});

// 初始化应用
synapseApp.initialize().catch((error) => {
  log.error('❌ 应用初始化失败:', error);
  app.quit();
});
