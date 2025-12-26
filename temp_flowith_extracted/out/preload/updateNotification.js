"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("lifecycleAPI", {
  sendReady: () => electron.ipcRenderer.send("update-notification:ready")
});
electron.contextBridge.exposeInMainWorld("updateNotificationInternal", {
  sendPromptReceived: () => electron.ipcRenderer.send("update-notification:prompt-received")
});
electron.contextBridge.exposeInMainWorld("updateNotification", {
  download: async () => {
    return await electron.ipcRenderer.invoke("update:download");
  },
  install: async () => {
    return await electron.ipcRenderer.invoke("update:install");
  },
  dismiss: async () => {
    return await electron.ipcRenderer.invoke("update:dismiss");
  },
  // 打开已下载的安装包（供手动安装）
  openDownloadedInstaller: async () => {
    return await electron.ipcRenderer.invoke("update:open-downloaded-installer");
  },
  // 新增：触发检查更新（供切换渠道后调用）
  checkForUpdates: async () => {
    try {
      const res = await electron.ipcRenderer.invoke("auto-update:check");
      return res;
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  },
  // 新增：读取/设置当前更新渠道
  getChannel: async () => {
    try {
      return await electron.ipcRenderer.invoke("auto-update:get-channel");
    } catch {
      return { channel: "stable" };
    }
  },
  setChannel: async (ch) => {
    try {
      return await electron.ipcRenderer.invoke("auto-update:set-channel", ch);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  },
  // 新增：获取用户可用渠道
  getAccess: async () => {
    try {
      const access = await electron.ipcRenderer.invoke("app-update:get-access");
      return access;
    } catch {
      return { channels: ["stable"], currentChannel: "stable" };
    }
  }
});
electron.contextBridge.exposeInMainWorld("electron", {
  ipcRenderer: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    on: (channel, func) => {
      const validChannels = ["update-info", "download-progress"];
      if (validChannels.includes(channel)) {
        const subscription = (_event, ...args) => func(...args);
        electron.ipcRenderer.on(channel, subscription);
        return subscription;
      }
      return null;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    removeListener: (channel, func) => {
      const validChannels = ["update-info", "download-progress"];
      if (validChannels.includes(channel)) {
        electron.ipcRenderer.removeListener(channel, func);
      }
    }
  }
});
