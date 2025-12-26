"use strict";
const electron = require("electron");
const runtime = {
  platform: process.platform,
  isWindows: process.platform === "win32",
  isMac: process.platform === "darwin",
  isLinux: process.platform === "linux",
  arch: process.arch
};
electron.contextBridge.exposeInMainWorld("runtime", runtime);
const sharedAPI = {
  knowledgeBase: {
    getState: () => electron.ipcRenderer.invoke("knowledge-base-get-state"),
    upload: (data) => electron.ipcRenderer.invoke("knowledge-base-upload", data),
    resetUpload: () => electron.ipcRenderer.invoke("knowledge-base-reset"),
    onStateUpdate: (callback) => {
      const listener = (_event, state) => callback(state);
      electron.ipcRenderer.on("knowledge-base-state-update", listener);
      return () => electron.ipcRenderer.removeListener("knowledge-base-state-update", listener);
    }
  }
};
electron.contextBridge.exposeInMainWorld("sharedAPI", sharedAPI);
console.log("sharedAPI preload loaded");
const themeAPI = {
  getMode: () => electron.ipcRenderer.invoke("theme:getMode"),
  setMode: (mode, resolvedMode) => electron.ipcRenderer.send("theme:setMode", mode, resolvedMode),
  getGradientId: () => electron.ipcRenderer.invoke("theme:getGradientId"),
  setGradientId: (gradientId) => electron.ipcRenderer.send("theme:setGradientId", gradientId),
  onModeChange: (listener) => {
    const handler = (_event, state) => {
      listener(state);
    };
    electron.ipcRenderer.on("theme:update", handler);
    return () => electron.ipcRenderer.removeListener("theme:update", handler);
  },
  requestSync: () => electron.ipcRenderer.send("theme:request-sync")
};
electron.contextBridge.exposeInMainWorld("themeAPI", themeAPI);
const localeAPI = {
  getLocale: () => electron.ipcRenderer.invoke("locale:getLocale"),
  setLocale: (locale) => electron.ipcRenderer.send("locale:setLocale", locale),
  onLocaleChange: (listener) => {
    const handler = (_event, state) => {
      listener(state);
    };
    electron.ipcRenderer.on("locale:update", handler);
    return () => electron.ipcRenderer.removeListener("locale:update", handler);
  },
  requestSync: () => electron.ipcRenderer.send("locale:request-sync")
};
electron.contextBridge.exposeInMainWorld("localeAPI", localeAPI);
const updateToastAPI = {
  onUpdateInfo: (callback) => {
    const handler = (_event, info) => callback(info);
    electron.ipcRenderer.on("update-toast:info", handler);
    return () => electron.ipcRenderer.removeListener("update-toast:info", handler);
  },
  onDownloadProgress: (callback) => {
    const handler = (_event, progress) => callback(progress);
    electron.ipcRenderer.on("update-toast:progress", handler);
    return () => electron.ipcRenderer.removeListener("update-toast:progress", handler);
  },
  install: (updateInfo) => electron.ipcRenderer.invoke("update-toast:install", updateInfo),
  dismiss: () => electron.ipcRenderer.invoke("update-toast:dismiss"),
  dismissCompleted: () => electron.ipcRenderer.invoke("update-toast:dismiss-completed"),
  setChannel: (channel) => electron.ipcRenderer.invoke("auto-update:set-channel", channel),
  checkForUpdates: () => electron.ipcRenderer.invoke("auto-update:check"),
  getUserInfo: () => electron.ipcRenderer.invoke("auth:getUserInfo"),
  openDownloadedInstaller: () => electron.ipcRenderer.invoke("update:open-downloaded-installer")
};
electron.contextBridge.exposeInMainWorld("updateToast", updateToastAPI);
const baseViewAPI = {
  // Tab 管理 API - 仅保留 create
  tabs: {
    create: (url) => electron.ipcRenderer.invoke("tabs:create", url)
  },
  callOpenRouter: (data) => electron.ipcRenderer.invoke("call-openrouter", data),
  // Preset API
  preset: {
    list: (locale) => electron.ipcRenderer.invoke("agentWidget:presets:list", locale),
    create: (data) => electron.ipcRenderer.invoke("agentWidget:presets:create", data),
    update: (data) => electron.ipcRenderer.invoke("agentWidget:presets:update", data),
    remove: (id) => electron.ipcRenderer.invoke("agentWidget:presets:remove", id)
  },
  // Preset Dialog API (全局单例)
  presetDialog: {
    show: (config) => electron.ipcRenderer.invoke("preset-dialog:show", config)
  },
  // Browser Agent API
  browserAgent: {
    // 任务管理
    startTask: (request) => electron.ipcRenderer.invoke("task:start", request),
    pauseTask: (taskId) => electron.ipcRenderer.invoke("task:pause", taskId),
    resumeTask: (taskId) => electron.ipcRenderer.invoke("task:resume", taskId),
    submitHumanInput: (request) => electron.ipcRenderer.invoke("browser-agent:submit-human-input", request)
  },
  // Analytics API
  analytics: {
    // 追踪事件
    track: (event, properties) => electron.ipcRenderer.invoke("analytics:track", event, properties),
    // 识别用户
    identify: (properties) => electron.ipcRenderer.invoke("analytics:identify", properties),
    // 获取 distinct ID
    getDistinctId: () => electron.ipcRenderer.invoke("analytics:getDistinctId"),
    // 检查是否启用
    isEnabled: () => electron.ipcRenderer.invoke("analytics:isEnabled"),
    // 获取用户属性
    getUserProperties: () => electron.ipcRenderer.invoke("analytics:getUserProperties"),
    // 设置用户属性
    setUserProperties: (properties) => electron.ipcRenderer.invoke("analytics:setUserProperties", properties),
    // 创建别名
    alias: (userId) => electron.ipcRenderer.invoke("analytics:alias", userId),
    // 立即 flush
    flush: () => electron.ipcRenderer.invoke("analytics:flush")
  }
};
electron.contextBridge.exposeInMainWorld("baseViewAPI", baseViewAPI);
const historyAPI = {
  getAll: () => electron.ipcRenderer.invoke("history:getAll"),
  search: (keyword) => electron.ipcRenderer.invoke("history:search", keyword),
  getByTimeRange: (range, custom) => electron.ipcRenderer.invoke("history:getByTimeRange", range, custom),
  remove: (id) => electron.ipcRenderer.invoke("history:remove", id),
  removeBatch: (ids) => electron.ipcRenderer.invoke("history:removeBatch", ids),
  removeByTimeRange: (range, custom) => electron.ipcRenderer.invoke("history:removeByTimeRange", range, custom),
  clear: () => electron.ipcRenderer.invoke("history:clear"),
  getStats: () => electron.ipcRenderer.invoke("history:getStats"),
  getFrequentUrls: (prefix) => electron.ipcRenderer.invoke("history:getFrequentUrls", prefix)
};
electron.contextBridge.exposeInMainWorld("historyAPI", historyAPI);
const agentWidgetControlAPI = {
  loadTask: (taskId) => electron.ipcRenderer.send("agentWidget:loadTask", taskId)
};
electron.contextBridge.exposeInMainWorld("agentWidgetControlAPI", agentWidgetControlAPI);
const tabsAPI = {
  create: (url, switchTo) => electron.ipcRenderer.invoke("tabs:create", url, switchTo),
  navigateCurrent: (url) => electron.ipcRenderer.invoke("tabs:navigateCurrent", url),
  getCurrentTabId: () => {
    return null;
  },
  getCount: () => electron.ipcRenderer.invoke("tabs:getCount"),
  onCountChanged: (callback) => {
    const handler = (_event, count) => callback(count);
    electron.ipcRenderer.on("tabs:countChanged", handler);
    return () => electron.ipcRenderer.removeListener("tabs:countChanged", handler);
  }
};
electron.contextBridge.exposeInMainWorld("tabsAPI", tabsAPI);
const presetAPI = {
  list: baseViewAPI.preset.list,
  create: baseViewAPI.preset.create,
  update: baseViewAPI.preset.update,
  remove: baseViewAPI.preset.remove,
  onChanged: (callback) => {
    const handler = () => callback();
    electron.ipcRenderer.on("agentWidget:presets:changed", handler);
    return () => electron.ipcRenderer.removeListener("agentWidget:presets:changed", handler);
  }
};
electron.contextBridge.exposeInMainWorld("presetAPI", presetAPI);
const browserAgentAPI = {
  startTask: (request) => baseViewAPI.browserAgent.startTask(request)
};
electron.contextBridge.exposeInMainWorld("browserAgentAPI", browserAgentAPI);
const flowsAPI = {
  create: (initialText) => electron.ipcRenderer.invoke("flow:create", initialText)
};
electron.contextBridge.exposeInMainWorld("flowsAPI", flowsAPI);
const electronBridge = {
  ipcRenderer: {
    on: (channel, callback) => {
      const wrappedCallback = (_event, ...args) => {
        console.log(`[Preload] IPC event received: ${channel}`, args);
        callback(...args);
      };
      electron.ipcRenderer.on(channel, wrappedCallback);
      console.log(`[Preload] IPC listener registered for: ${channel}`);
      callback._wrappedCallback = wrappedCallback;
    },
    removeListener: (channel, callback) => {
      const wrappedCallback = callback._wrappedCallback;
      if (wrappedCallback) {
        electron.ipcRenderer.removeListener(channel, wrappedCallback);
        console.log(`[Preload] IPC listener removed for: ${channel}`);
      }
    },
    send: (channel, ...args) => {
      electron.ipcRenderer.send(channel, ...args);
    },
    invoke: (channel, ...args) => {
      return electron.ipcRenderer.invoke(channel, ...args);
    }
  },
  // Composer API for local markdown file persistence
  getComposerContent: (composerId) => electron.ipcRenderer.invoke("composer:get-content", composerId),
  saveComposerContent: (composerId, content) => electron.ipcRenderer.invoke("composer:save-content", composerId, content),
  // ========== 自动更新 API ==========
  autoUpdate: {
    // 手动检查更新
    check: () => electron.ipcRenderer.invoke("auto-update:check"),
    // 下载更新
    download: () => electron.ipcRenderer.invoke("auto-update:download"),
    // 安装更新并重启
    install: () => electron.ipcRenderer.invoke("auto-update:install"),
    // 获取版本信息
    getVersion: () => electron.ipcRenderer.invoke("auto-update:get-version"),
    // 监听更新可用
    onUpdateAvailable: (callback) => {
      const handler = (_event, info) => callback(info);
      electron.ipcRenderer.on("auto-update:update-available", handler);
      return () => electron.ipcRenderer.removeListener("auto-update:update-available", handler);
    },
    // 监听下载进度
    onDownloadProgress: (callback) => {
      const handler = (_event, progress) => callback(progress);
      electron.ipcRenderer.on("auto-update:download-progress", handler);
      return () => electron.ipcRenderer.removeListener("auto-update:download-progress", handler);
    },
    // 监听下载完成
    onUpdateDownloaded: (callback) => {
      const handler = (_event, info) => callback(info);
      electron.ipcRenderer.on("auto-update:update-downloaded", handler);
      return () => electron.ipcRenderer.removeListener("auto-update:update-downloaded", handler);
    },
    // 监听更新错误
    onUpdateError: (callback) => {
      const handler = (_event, error) => callback(error);
      electron.ipcRenderer.on("auto-update:update-error", handler);
      return () => electron.ipcRenderer.removeListener("auto-update:update-error", handler);
    },
    // 监听显示更新对话框（系统通知点击）
    onShowUpdateDialog: (callback) => {
      const handler = (_event, info) => callback(info);
      electron.ipcRenderer.on("auto-update:show-update-dialog", handler);
      return () => electron.ipcRenderer.removeListener("auto-update:show-update-dialog", handler);
    },
    // 监听显示安装对话框
    onShowInstallDialog: (callback) => {
      const handler = (_event, info) => callback(info);
      electron.ipcRenderer.on("auto-update:show-install-dialog", handler);
      return () => electron.ipcRenderer.removeListener("auto-update:show-install-dialog", handler);
    }
  }
};
electron.contextBridge.exposeInMainWorld("electron", electronBridge);
electron.contextBridge.exposeInMainWorld("electronAPI", electronBridge);
console.log("baseView preload loaded");
