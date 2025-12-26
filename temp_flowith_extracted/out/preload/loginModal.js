"use strict";
const electron = require("electron");
const themeAPI = {
  setMode: (mode) => electron.ipcRenderer.send("theme:set", mode),
  onModeChange: (callback) => {
    const handler = (_event, state) => callback(state.mode);
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
electron.contextBridge.exposeInMainWorld("lifecycleAPI", {
  sendReady: () => electron.ipcRenderer.send("login-modal:ready")
});
const loginModalAPI = {
  // 关闭模态窗口
  close: () => {
    return electron.ipcRenderer.send("loginModal:close");
  },
  login: async (params) => {
    return electron.ipcRenderer.invoke("auth:login", { ...params, source: "modal" });
  },
  // 监听重置事件
  onReset: (callback) => {
    const handler = () => callback();
    electron.ipcRenderer.on("loginModal:reset", handler);
    return () => {
      electron.ipcRenderer.removeListener("loginModal:reset", handler);
    };
  },
  // 监听需要显示邀请码输入的事件
  onShowInvitationCode: (callback) => {
    const handler = () => callback();
    electron.ipcRenderer.on("loginModal:show-invitation-code", handler);
    return () => {
      electron.ipcRenderer.removeListener("loginModal:show-invitation-code", handler);
    };
  },
  // 检查用户是否需要输入邀请码
  checkAccess: async () => {
    return electron.ipcRenderer.invoke("os-invitation:check-access");
  },
  // 验证邀请码
  verifyCode: async (code) => {
    return electron.ipcRenderer.invoke("os-invitation:verify-code", code);
  }
};
electron.contextBridge.exposeInMainWorld("loginModalAPI", loginModalAPI);
