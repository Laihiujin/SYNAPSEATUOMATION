"use strict";
const electron = require("electron");
const api = {
  window: {
    minimize: () => {
      electron.ipcRenderer.send("windowsTitleBar:minimize");
    },
    toggleMaximize: () => {
      electron.ipcRenderer.send("windowsTitleBar:toggleMaximize");
    },
    close: () => {
      electron.ipcRenderer.send("windowsTitleBar:close");
    },
    getWindowState: async () => {
      return await electron.ipcRenderer.invoke("windowsTitleBar:getState");
    },
    onWindowStateChanged: (callback) => {
      const listener = (_e, state) => {
        callback(state);
      };
      electron.ipcRenderer.on("windowsTitleBar:stateChanged", listener);
      return () => electron.ipcRenderer.removeListener("windowsTitleBar:stateChanged", listener);
    }
  },
  navigation: {
    getNavState: async () => {
      return await electron.ipcRenderer.invoke("windowsTitleBar:getNavState");
    },
    onNavStateChanged: (callback) => {
      const listener = (_e, state) => {
        callback(state);
      };
      electron.ipcRenderer.on("windowsTitleBar:navStateChanged", listener);
      return () => electron.ipcRenderer.removeListener("windowsTitleBar:navStateChanged", listener);
    },
    navigateBack: () => {
      electron.ipcRenderer.send("windowsTitleBar:navigateBack");
    },
    navigateForward: () => {
      electron.ipcRenderer.send("windowsTitleBar:navigateForward");
    },
    reload: () => {
      electron.ipcRenderer.send("windowsTitleBar:reload");
    },
    navigateTo: (url) => {
      electron.ipcRenderer.send("windowsTitleBar:navigateTo", url);
    }
  },
  task: {
    getCurrentTabTask: async () => {
      return await electron.ipcRenderer.invoke("windowsTitleBar:getCurrentTabTask");
    },
    onCurrentTabTaskChanged: (callback) => {
      const listener = (_e, task) => {
        callback(task);
      };
      electron.ipcRenderer.on("windowsTitleBar:currentTabTaskChanged", listener);
      return () => electron.ipcRenderer.removeListener("windowsTitleBar:currentTabTaskChanged", listener);
    },
    setCurrentTabTaskStatus: (status) => {
      electron.ipcRenderer.send("windowsTitleBar:setCurrentTabTaskStatus", status);
    }
  }
};
electron.contextBridge.exposeInMainWorld("windowsTitleBar", api);
const themeAPI = {
  getMode: () => electron.ipcRenderer.invoke("theme:getMode"),
  setMode: (mode) => electron.ipcRenderer.send("theme:setMode", mode),
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
