const { contextBridge, ipcRenderer } = require('electron');

// 暴露安全的 API 给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // Playwright 相关
  playwright: {
    getBrowserPath: () => ipcRenderer.invoke('playwright:getBrowserPath')
  },

  // 浏览器窗口管理
  browser: {
    createVisual: (url, options) => ipcRenderer.invoke('browser:createVisual', url, options),
    closeVisual: (windowId) => ipcRenderer.invoke('browser:closeVisual', windowId)
  },

  // 会话管理
  session: {
    setCookies: (partition, cookies) => ipcRenderer.invoke('session:setCookies', partition, cookies)
  },

  // 应用信息
  app: {
    getInfo: () => ipcRenderer.invoke('app:getInfo')
  }
});

// 日志输出（开发模式）
console.log('🔧 Preload script loaded');
