"use strict";
const electron = require("electron");
function getViewIdFromArgs() {
  const args = process.argv;
  for (const arg of args) {
    if (arg.startsWith("--view-id=")) {
      return arg.split("=")[1];
    }
  }
  throw new Error("No viewId found in command line arguments");
}
const viewId = getViewIdFromArgs();
electron.contextBridge.exposeInMainWorld("flowithBrowserAPI", {
  // 渲染进程发送消息到主进程（invoke方式，可异步返回）
  sendToMain: (channel, data) => {
    const validChannels = ["hypergpt-frontend-to-flowith-browser"];
    if (validChannels.includes(channel)) {
      data.viewId = viewId;
      return electron.ipcRenderer.invoke(channel, data);
    }
    throw new Error(`Invalid channel: ${channel}`);
  },
  // 渲染进程监听来自主进程的消息
  onFromMain: (channel, callback) => {
    const validChannels = ["flowith-browser-to-hypergpt-frontend"];
    if (validChannels.includes(channel)) {
      electron.ipcRenderer.on(channel, (_event, args) => callback(args));
    }
  }
});
electron.contextBridge.exposeInMainWorld("electronAPI", {
  getTabScreenshot: (tabId) => {
    return electron.ipcRenderer.invoke("tabs:getScreenshot", tabId);
  },
  // Composer API for local markdown file persistence
  getComposerContent: (composerId) => {
    return electron.ipcRenderer.invoke("composer:get-content", composerId);
  },
  saveComposerContent: (composerId, content) => {
    return electron.ipcRenderer.invoke("composer:save-content", composerId, content);
  },
  // Fullscreen API for notifying main process about fullscreen state changes
  notifyFullscreenChange: (isFullscreen) => {
    electron.ipcRenderer.send("tab:fullscreen-changed", isFullscreen);
  }
});
console.log(`flowith os loaded`);
const HYPERGPT_FRONTEND_URL = "https://dev.hypergpt-frontend.pages.dev";
typeof process !== "undefined" && process.env ? process.env.WORKER_URL || "" : "";
"flo.ing,flowith.io".split(",").map((h) => h.trim()).filter(Boolean);
function getOrigin(url) {
  try {
    return new URL(url).origin;
  } catch {
    return url;
  }
}
const targetOrigin = getOrigin(HYPERGPT_FRONTEND_URL);
const currentOrigin = window.location.origin;
if (targetOrigin && currentOrigin === targetOrigin) {
  try {
    window.localStorage.setItem("sidebarHidden", "true");
  } catch {
  }
}
function getTabIdFromArgs() {
  const args = process.argv;
  for (const arg of args) {
    if (arg.startsWith("--view-id=")) {
      return arg.split("=")[1];
    }
  }
  return null;
}
const currentTabId$1 = getTabIdFromArgs();
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
const tabsAPI = {
  create: (url, switchTo) => electron.ipcRenderer.invoke("tabs:create", url, switchTo),
  navigateCurrent: (url) => electron.ipcRenderer.invoke("tabs:navigateCurrent", url),
  getCurrentTabId: () => currentTabId$1
};
const backgroundAPI = {
  uploadImage: (filePath) => electron.ipcRenderer.invoke("background:uploadImage", filePath),
  uploadImageBuffer: (buffer, fileName) => electron.ipcRenderer.invoke("background:uploadImageBuffer", buffer, fileName),
  getImageUrl: (fileName) => electron.ipcRenderer.invoke("background:getImageUrl", fileName),
  deleteImage: (fileName) => electron.ipcRenderer.invoke("background:deleteImage", fileName),
  selectImageFile: () => electron.ipcRenderer.invoke("background:selectImageFile")
};
electron.contextBridge.exposeInMainWorld("historyAPI", historyAPI);
electron.contextBridge.exposeInMainWorld("tabsAPI", tabsAPI);
electron.contextBridge.exposeInMainWorld("backgroundAPI", backgroundAPI);
const downloadAPI = {
  getAll: () => electron.ipcRenderer.invoke("download:getAll"),
  getStats: () => electron.ipcRenderer.invoke("download:getStats"),
  pause: (id) => electron.ipcRenderer.invoke("download:pause", id),
  resume: (id) => electron.ipcRenderer.invoke("download:resume", id),
  cancel: (id) => electron.ipcRenderer.invoke("download:cancel", id),
  remove: (id) => electron.ipcRenderer.invoke("download:remove", id),
  removeBatch: (ids) => electron.ipcRenderer.invoke("download:removeBatch", ids),
  clearAll: () => electron.ipcRenderer.invoke("download:clearAll"),
  openFile: (path) => electron.ipcRenderer.invoke("download:openFile", path),
  showInFolder: (path) => electron.ipcRenderer.invoke("download:showInFolder", path),
  onProgress: (callback) => {
    const handler = (_event, progress) => callback(progress);
    electron.ipcRenderer.on("download:progress", handler);
    return () => electron.ipcRenderer.removeListener("download:progress", handler);
  },
  onStarted: (callback) => {
    const handler = (_event, data) => callback(data);
    electron.ipcRenderer.on("download:started", handler);
    return () => electron.ipcRenderer.removeListener("download:started", handler);
  },
  onCompleted: (callback) => {
    const handler = (_event, data) => callback(data);
    electron.ipcRenderer.on("download:completed", handler);
    return () => electron.ipcRenderer.removeListener("download:completed", handler);
  },
  onFailed: (callback) => {
    const handler = (_event, data) => callback(data);
    electron.ipcRenderer.on("download:failed", handler);
    return () => electron.ipcRenderer.removeListener("download:failed", handler);
  },
  onCancelled: (callback) => {
    const handler = (_event, data) => callback(data);
    electron.ipcRenderer.on("download:cancelled", handler);
    return () => electron.ipcRenderer.removeListener("download:cancelled", handler);
  }
};
electron.contextBridge.exposeInMainWorld("downloadAPI", downloadAPI);
console.log("[DownloadAPI Preload] downloadAPI exposed to window");
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
try {
  electron.contextBridge.exposeInMainWorld("localeAPI", localeAPI);
} catch (error) {
  console.warn("[localePreload] localeAPI already exists, skipping:", error);
}
const browserAgentAPI = {
  startTask: (request) => electron.ipcRenderer.invoke("task:start", request)
};
electron.contextBridge.exposeInMainWorld("browserAgentAPI", browserAgentAPI);
const presetAPI = {
  list: (locale) => electron.ipcRenderer.invoke("agentWidget:presets:list", locale),
  create: (data) => electron.ipcRenderer.invoke("agentWidget:presets:create", data),
  update: (data) => electron.ipcRenderer.invoke("agentWidget:presets:update", data),
  remove: (id) => electron.ipcRenderer.invoke("agentWidget:presets:remove", id),
  selectFiles: () => electron.ipcRenderer.invoke("agentWidget:presets:selectFiles"),
  readFiles: (presetId) => electron.ipcRenderer.invoke("agentWidget:presets:readFiles", presetId),
  onChanged: (callback) => {
    const handler = (_event) => {
      callback();
    };
    electron.ipcRenderer.on("preset:changed", handler);
    return () => {
      electron.ipcRenderer.removeListener("preset:changed", handler);
    };
  }
};
electron.contextBridge.exposeInMainWorld("presetAPI", presetAPI);
const baseViewAPI = {
  callOpenRouter: (data) => {
    console.log("[baseViewApiPreload] callOpenRouter invoked with mode:", data.mode, "model:", data.model, "silent:", data.silent);
    return electron.ipcRenderer.invoke("call-openrouter", data);
  },
  // Preset Dialog API (全局单例)
  presetDialog: {
    show: (config) => {
      return electron.ipcRenderer.invoke("preset-dialog:show", config);
    }
  }
};
electron.contextBridge.exposeInMainWorld("baseViewAPI", baseViewAPI);
const ptyApi = {
  spawn: async (options) => {
    const { processId } = await electron.ipcRenderer.invoke("pty:spawn", options);
    return {
      processId,
      onData: (callback) => {
        const handler = (_event, data) => {
          if (data.processId === processId) {
            callback(data.data);
          }
        };
        electron.ipcRenderer.on("pty:data", handler);
        return () => {
          electron.ipcRenderer.removeListener("pty:data", handler);
        };
      },
      onExit: (callback) => {
        const handler = (_event, data) => {
          if (data.processId === processId) {
            callback(data.exitCode, data.signal);
          }
        };
        electron.ipcRenderer.on("pty:exit", handler);
        return () => {
          electron.ipcRenderer.removeListener("pty:exit", handler);
        };
      },
      write: (data) => {
        electron.ipcRenderer.send("pty:write", { processId, data });
      },
      resize: (cols, rows) => {
        electron.ipcRenderer.send("pty:resize", { processId, cols, rows });
      },
      kill: () => {
        electron.ipcRenderer.send("pty:kill", { processId });
      }
    };
  }
};
electron.contextBridge.exposeInMainWorld("ptyApi", ptyApi);
electron.contextBridge.exposeInMainWorld("electron", {
  ipcRenderer: {
    send: (channel, ...args) => electron.ipcRenderer.send(channel, ...args),
    invoke: (channel, ...args) => electron.ipcRenderer.invoke(channel, ...args),
    on: (channel, func) => {
      const subscription = (_event, ...args) => func(...args);
      electron.ipcRenderer.on(channel, subscription);
      return subscription;
    },
    removeListener: (channel, func) => {
      electron.ipcRenderer.removeListener(channel, func);
    }
  }
});
electron.contextBridge.exposeInMainWorld("terminalAgentStateAPI", {
  onStateUpdate: (callback) => {
    const handler = (_event, state) => callback(state);
    electron.ipcRenderer.on("terminal:agent-state-update", handler);
    return () => electron.ipcRenderer.removeListener("terminal:agent-state-update", handler);
  },
  getCurrentState: () => electron.ipcRenderer.invoke("terminal:get-agent-state")
});
let currentTabId = null;
electron.ipcRenderer.on("set-current-tab-id", (_event, tabId) => {
  currentTabId = tabId;
});
try {
  electron.contextBridge.exposeInMainWorld("tabsAPI", {
    create: (url, switchTo) => electron.ipcRenderer.invoke("tabs:create", url, switchTo),
    navigateCurrent: (url) => electron.ipcRenderer.invoke("tabs:navigateCurrent", url),
    getCurrentTabId: () => currentTabId
  });
} catch (error) {
  console.warn("[ptyApiPreload] tabsAPI already exists, skipping");
}
try {
  electron.contextBridge.exposeInMainWorld("flowsAPI", {
    create: (initialText) => electron.ipcRenderer.invoke("flow:create", initialText)
  });
} catch (error) {
  console.warn("[ptyApiPreload] flowsAPI already exists, skipping");
}
try {
  electron.contextBridge.exposeInMainWorld("themeAPI", {
    getMode: () => electron.ipcRenderer.invoke("theme:getMode"),
    setMode: (mode) => electron.ipcRenderer.send("theme:setMode", mode),
    onModeChange: (listener) => {
      const handler = (_event, state) => listener(state);
      electron.ipcRenderer.on("theme:update", handler);
      return () => electron.ipcRenderer.removeListener("theme:update", handler);
    },
    requestSync: () => electron.ipcRenderer.send("theme:request-sync")
  });
} catch (error) {
  console.warn("[ptyApiPreload] themeAPI already exists, skipping");
}
const rewardPageAPI = {
  show: () => electron.ipcRenderer.invoke("reward-page:show")
};
try {
  electron.contextBridge.exposeInMainWorld("rewardPageAPI", rewardPageAPI);
  console.log("[rewardPageApiPreload] rewardPageAPI exposed successfully");
} catch (error) {
  console.error("[rewardPageApiPreload] Failed to expose rewardPageAPI:", error);
  window.rewardPageAPI = rewardPageAPI;
  console.log("[rewardPageApiPreload] rewardPageAPI exposed directly as fallback");
}
const findInPageAPI = {
  search: (text) => electron.ipcRenderer.send("find-in-page:search", text),
  next: () => electron.ipcRenderer.send("find-in-page:next"),
  previous: () => electron.ipcRenderer.send("find-in-page:previous"),
  stop: () => electron.ipcRenderer.send("find-in-page:stop")
};
try {
  electron.contextBridge.exposeInMainWorld("findInPageAPI", findInPageAPI);
} catch (error) {
  window.findInPageAPI = findInPageAPI;
}
const fileEditorAPI = {
  readFile: (filePath) => electron.ipcRenderer.invoke("file:read-content", filePath),
  saveFile: (filePath, content) => electron.ipcRenderer.invoke("file:save-content", { filePath, content }),
  createPreview: (originalPath, content) => electron.ipcRenderer.invoke("file:create-preview", { originalPath, content }),
  deletePreview: (previewPath) => electron.ipcRenderer.invoke("file:delete-preview", previewPath),
  getFileStats: (filePath) => electron.ipcRenderer.invoke("file:get-stats", filePath)
};
electron.contextBridge.exposeInMainWorld("fileEditorAPI", fileEditorAPI);
const agentWidgetAPI = {
  teachMode: {
    getState: () => electron.ipcRenderer.invoke("teachMode:getState"),
    onState: (callback) => {
      const listener = (_event, state) => callback(state);
      electron.ipcRenderer.on("teach-mode:state", listener);
      return () => electron.ipcRenderer.removeListener("teach-mode:state", listener);
    }
  },
  openSharedFileInComposer: (fileId) => electron.ipcRenderer.invoke("agentWidget:openSharedFileInComposer", fileId)
};
electron.contextBridge.exposeInMainWorld("agentWidgetAPI", agentWidgetAPI);
const adblockAPI = {
  getEnabled: () => {
    return electron.ipcRenderer.invoke("adblock:getEnabled");
  },
  setEnabled: (enabled) => {
    return electron.ipcRenderer.invoke("adblock:setEnabled", enabled);
  },
  getStats: () => {
    return electron.ipcRenderer.invoke("adblock:getStats");
  },
  resetStats: () => {
    return electron.ipcRenderer.invoke("adblock:resetStats");
  }
};
electron.contextBridge.exposeInMainWorld("adblockAPI", adblockAPI);
console.log("[UpdateAPI Preload] Starting to expose settingsUpdateAPI...");
try {
  electron.contextBridge.exposeInMainWorld("settingsUpdateAPI", {
    getAccess: () => {
      console.log("[UpdateAPI] getAccess called");
      return electron.ipcRenderer.invoke("app-update:get-access");
    },
    getChannel: () => {
      console.log("[UpdateAPI] getChannel called");
      return electron.ipcRenderer.invoke("auto-update:get-channel");
    },
    setChannel: (ch) => {
      console.log("[UpdateAPI] setChannel called with:", ch);
      return electron.ipcRenderer.invoke("auto-update:set-channel", ch);
    },
    checkForUpdates: () => {
      console.log("[UpdateAPI] checkForUpdates called");
      return electron.ipcRenderer.invoke("auto-update:check");
    },
    getVersion: () => {
      console.log("[UpdateAPI] getVersion called");
      return electron.ipcRenderer.invoke("auto-update:get-version");
    },
    getUpdateState: () => {
      console.log("[UpdateAPI] getUpdateState called");
      return electron.ipcRenderer.invoke("auto-update:get-state");
    },
    onUpdateStateChanged: (callback) => {
      console.log("[UpdateAPI] onUpdateStateChanged listener registered");
      const handler = (_event, data) => {
        console.log("[UpdateAPI] Update state changed event received:", data.state);
        callback(data);
      };
      electron.ipcRenderer.on("update-state-changed", handler);
      return () => {
        console.log("[UpdateAPI] onUpdateStateChanged listener removed");
        electron.ipcRenderer.removeListener("update-state-changed", handler);
      };
    }
  });
  console.log("[UpdateAPI Preload] ✅ settingsUpdateAPI exposed successfully");
} catch (error) {
  console.error("[UpdateAPI Preload] ❌ Failed to expose settingsUpdateAPI:", error);
}
