"use strict";
const electron = require("electron");
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
  checkForUpdates: () => electron.ipcRenderer.invoke("auto-update:check")
};
electron.contextBridge.exposeInMainWorld("updateToast", updateToastAPI);
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
const localeAPI = {
  setLocale: (locale) => electron.ipcRenderer.send("locale:setLocale", locale),
  getLocale: () => electron.ipcRenderer.invoke("locale:getLocale"),
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
const runtime = {
  platform: process.platform,
  isWindows: process.platform === "win32",
  isMac: process.platform === "darwin",
  isLinux: process.platform === "linux",
  arch: process.arch
};
electron.contextBridge.exposeInMainWorld("runtime", runtime);
const tasksAPI = {
  list: () => electron.ipcRenderer.invoke("taskListItem:getAll"),
  onAdded: (callback) => {
    const listener = (_event, item) => callback(item);
    electron.ipcRenderer.on("taskListItem:added", listener);
    return () => electron.ipcRenderer.removeListener("taskListItem:added", listener);
  },
  onListItemUpdate: (callback) => {
    const listener = (_event, item) => callback(item);
    electron.ipcRenderer.on("taskListItem:updated", listener);
    return () => electron.ipcRenderer.removeListener("taskListItem:updated", listener);
  },
  onDeleted: (callback) => {
    const listener = (_event, taskId) => callback(taskId);
    electron.ipcRenderer.on("taskListItem:deleted", listener);
    return () => electron.ipcRenderer.removeListener("taskListItem:deleted", listener);
  },
  archive: (taskId) => electron.ipcRenderer.invoke("task:archive", taskId),
  delete: (taskId) => electron.ipcRenderer.invoke("task:delete", taskId),
  // Transform to Preset 功能需要完整快照
  get: (taskId) => electron.ipcRenderer.invoke("taskSnapshot:get", taskId)
};
electron.contextBridge.exposeInMainWorld("tasksAPI", tasksAPI);
const sideBarAPI = {
  // flows (conversations)
  flows: {
    fetchList: (pageIndex, pageSize) => electron.ipcRenderer.invoke("flow:fetch-list", pageIndex, pageSize),
    create: (initialText) => electron.ipcRenderer.invoke("flow:create", initialText),
    delete: (flowId) => electron.ipcRenderer.invoke("flow:delete", flowId),
    deleteBatch: (flowIds) => electron.ipcRenderer.invoke("flow:delete-batch", flowIds),
    leaveCooperate: (flowId) => electron.ipcRenderer.invoke("flow:leave-cooperate", flowId),
    togglePin: (flowId, isCooperate, currentTop) => electron.ipcRenderer.invoke("flow:toggle-pin", flowId, isCooperate, currentTop),
    rename: (flowId, title) => electron.ipcRenderer.invoke("flow:rename", flowId, title)
  },
  // bookmarks
  bookmarks: {
    detectBrowsers: () => electron.ipcRenderer.invoke("bookmarks:detectBrowsers"),
    readFromBrowser: (browserType) => electron.ipcRenderer.invoke("bookmarks:readFromBrowser", browserType),
    import: (bookmarks) => electron.ipcRenderer.invoke("bookmarks:import", bookmarks),
    getAll: () => electron.ipcRenderer.invoke("bookmarks:getAll"),
    getAllUrls: () => electron.ipcRenderer.invoke("bookmarks:getAllUrls"),
    search: (keyword) => electron.ipcRenderer.invoke("bookmarks:search", keyword),
    update: (bookmarkId, updates) => electron.ipcRenderer.invoke("bookmarks:update", bookmarkId, updates),
    move: (bookmarkId, targetParentId, newIndex) => electron.ipcRenderer.invoke("bookmarks:move", bookmarkId, targetParentId, newIndex),
    createFolder: (name) => electron.ipcRenderer.invoke("bookmarks:createFolder", name),
    remove: (bookmarkId) => electron.ipcRenderer.invoke("bookmarks:remove", bookmarkId),
    clear: () => electron.ipcRenderer.invoke("bookmarks:clear")
  },
  // 全局确认对话框
  confirmDialog: {
    show: (config) => electron.ipcRenderer.invoke("confirm-dialog:show", config)
  },
  // File info dialog
  infoDialog: {
    show: (fileInfo) => electron.ipcRenderer.invoke("info-dialog:show", fileInfo)
  },
  cookies: {
    importFromBrowser: (browserType) => electron.ipcRenderer.invoke("cookies:importFromBrowser", browserType)
  },
  localStorage: {
    importAuthToken: (browserType) => electron.ipcRenderer.invoke("localStorage:importAuthToken", browserType)
  },
  // 点击侧边栏锁定按钮触发
  ui: {
    setSidebarLocked: (locked) => {
      electron.ipcRenderer.send("sidebar-set-locked", locked);
    },
    setPanelWidth: (width) => {
      electron.ipcRenderer.send("sidebar-panel-set-width", width);
    },
    setBaseWidth: (width) => {
      electron.ipcRenderer.send("sidebar-panel-set-base-width", width);
    },
    setPanelPinned: (pinned) => {
      electron.ipcRenderer.send("sidebar-panel-set-pinned", pinned);
    },
    showUserMenuOverlay: (payload) => {
      electron.ipcRenderer.send("user-menu-overlay:open", payload);
    },
    hideUserMenuOverlay: () => {
      electron.ipcRenderer.send("user-menu-overlay:close");
    },
    onUserMenuOverlayState: (callback) => {
      const listener = (_event, state) => callback(state);
      electron.ipcRenderer.on("user-menu-overlay:state", listener);
      return () => electron.ipcRenderer.removeListener("user-menu-overlay:state", listener);
    },
    onUserMenuOverlayAction: (callback) => {
      const listener = (_event, action) => callback(action);
      electron.ipcRenderer.on("user-menu-overlay:action", listener);
      return () => electron.ipcRenderer.removeListener("user-menu-overlay:action", listener);
    },
    onPanelAnimateShow: (callback) => {
      const listener = () => callback();
      electron.ipcRenderer.on("panel-animate-show", listener);
      return () => electron.ipcRenderer.removeListener("panel-animate-show", listener);
    },
    onPanelAnimateHide: (callback) => {
      const listener = () => callback();
      electron.ipcRenderer.on("panel-animate-hide", listener);
      return () => electron.ipcRenderer.removeListener("panel-animate-hide", listener);
    },
    onFullscreenChanged: (callback) => {
      const listener = (_event, isFullscreen) => callback(isFullscreen);
      electron.ipcRenderer.on("window:fullscreen-changed", listener);
      return () => electron.ipcRenderer.removeListener("window:fullscreen-changed", listener);
    },
    showTabPreviewOverlay: (payload) => {
      electron.ipcRenderer.send("tab-preview-overlay:open", payload);
    },
    hideTabPreviewOverlay: () => {
      electron.ipcRenderer.send("tab-preview-overlay:close");
    },
    onTabPreviewOverlayState: (callback) => {
      const listener = (_event, state) => callback(state);
      electron.ipcRenderer.on("tab-preview-overlay:state", listener);
      return () => electron.ipcRenderer.removeListener("tab-preview-overlay:state", listener);
    },
    onTabPreviewOverlayAction: (callback) => {
      const listener = (_event, action) => callback(action);
      electron.ipcRenderer.on("tab-preview-overlay:action", listener);
      return () => electron.ipcRenderer.removeListener("tab-preview-overlay:action", listener);
    },
    updateTabPreviewOverlay: (payload) => {
      electron.ipcRenderer.send("tab-preview-overlay:update", payload);
    },
    showTeachModeStatusOverlay: (payload) => {
      electron.ipcRenderer.send("teach-mode-status-overlay:open", payload);
    },
    hideTeachModeStatusOverlay: () => {
      electron.ipcRenderer.send("teach-mode-status-overlay:close");
    },
    onTeachModeStatusOverlayState: (callback) => {
      const listener = (_event, state) => callback(state);
      electron.ipcRenderer.on("teach-mode-status-overlay:state", listener);
      return () => electron.ipcRenderer.removeListener("teach-mode-status-overlay:state", listener);
    },
    onTeachModeStatusOverlayAction: (callback) => {
      const listener = (_event, action) => callback(action);
      electron.ipcRenderer.on("teach-mode-status-overlay:action", listener);
      return () => electron.ipcRenderer.removeListener("teach-mode-status-overlay:action", listener);
    },
    updateTeachModeStatusOverlay: (payload) => {
      electron.ipcRenderer.send("teach-mode-status-overlay:update", payload);
    },
    minimizeWindow: () => {
      electron.ipcRenderer.send("window:minimize");
    },
    closeWindow: () => {
      electron.ipcRenderer.send("window:close");
    },
    toggleFullscreen: () => {
      electron.ipcRenderer.send("window:toggle-fullscreen");
    },
    openInvitationCodesModal: () => {
      console.log("[sideBarPanel preload] Sending invitationCodesModal:open IPC");
      electron.ipcRenderer.send("invitationCodesModal:open");
      console.log("[sideBarPanel preload] IPC sent");
    },
    showRewardPage: (options) => {
      electron.ipcRenderer.invoke("reward-page:show", options);
    },
    showAgentGuide: () => {
      electron.ipcRenderer.invoke("agent-guide:show");
    },
    showIntelligencePanel: (autoPin) => {
      electron.ipcRenderer.send("sidebar:show-intelligence-panel", autoPin);
    },
    showTeachModeDialog: (initialState) => {
      electron.ipcRenderer.send("teach-mode-dialog:show", "start", initialState);
    },
    showLanguageDialog: async (position) => {
      const currentLocale = await electron.ipcRenderer.invoke("locale:getLocale");
      electron.ipcRenderer.send("language-dialog:show", currentLocale, position);
    }
  },
  // 自动更新
  update: {
    checkForUpdates: () => electron.ipcRenderer.invoke("auto-update:check"),
    download: () => electron.ipcRenderer.invoke("auto-update:download"),
    install: () => electron.ipcRenderer.invoke("auto-update:install"),
    getVersion: () => electron.ipcRenderer.invoke("auto-update:get-version"),
    setChannel: (ch) => electron.ipcRenderer.invoke("auto-update:set-channel", ch),
    getChannel: () => electron.ipcRenderer.invoke("auto-update:get-channel"),
    clearCache: () => electron.ipcRenderer.invoke("auto-update:clear-cache")
  },
  // tabs
  tabs: {
    create: (url, switchTo) => electron.ipcRenderer.invoke("tabs:create", url, switchTo),
    close: (tabId) => electron.ipcRenderer.invoke("tabs:close", tabId),
    setCurrent: (tabId) => electron.ipcRenderer.invoke("tabs:setCurrent", tabId),
    getCurrent: () => electron.ipcRenderer.invoke("tabs:getCurrent"),
    getAll: () => electron.ipcRenderer.invoke("tabs:getAll"),
    back: () => electron.ipcRenderer.invoke("tabs:backCurrent"),
    forward: () => electron.ipcRenderer.invoke("tabs:forwardCurrent"),
    reload: () => electron.ipcRenderer.invoke("tabs:reloadCurrent"),
    navigate: (url) => electron.ipcRenderer.invoke("tabs:navigateCurrent", url),
    getScreenshot: (tabId) => electron.ipcRenderer.invoke("tabs:getScreenshot", tabId),
    onTabUpdate: (callback) => {
      const listener = (_event, update) => callback(update);
      electron.ipcRenderer.on("tab:updated", listener);
      return () => electron.ipcRenderer.removeListener("tab:updated", listener);
    },
    onTabAdded: (callback) => {
      const listener = (_event, tab) => callback(tab);
      electron.ipcRenderer.on("tabs:added", listener);
      return () => electron.ipcRenderer.removeListener("tabs:added", listener);
    },
    onTabRemoved: (callback) => {
      const listener = (_event, tabId) => callback(tabId);
      electron.ipcRenderer.on("tabs:removed", listener);
      return () => electron.ipcRenderer.removeListener("tabs:removed", listener);
    },
    onCurrentChanged: (callback) => {
      const listener = (_event, data) => callback(data);
      electron.ipcRenderer.on("tabs:currentChanged", listener);
      return () => electron.ipcRenderer.removeListener("tabs:currentChanged", listener);
    },
    onCurrentUpdate: (callback) => {
      const listener = () => callback();
      electron.ipcRenderer.on("tabs:currentUpdate", listener);
      return () => electron.ipcRenderer.removeListener("tabs:currentUpdate", listener);
    }
  },
  teachMode: {
    getState: () => electron.ipcRenderer.invoke("teach-mode:get-state"),
    start: (goal) => electron.ipcRenderer.invoke("teach-mode:start", goal),
    finish: (options) => electron.ipcRenderer.invoke("teach-mode:finish", options),
    cancel: (reason) => electron.ipcRenderer.invoke("teach-mode:cancel", reason),
    reset: () => electron.ipcRenderer.invoke("teach-mode:reset"),
    pause: () => electron.ipcRenderer.invoke("teach-mode:pause"),
    resume: () => electron.ipcRenderer.invoke("teach-mode:resume"),
    onState: (callback) => {
      const listener = (_event, state) => callback(state);
      electron.ipcRenderer.on("teach-mode:state", listener);
      return () => electron.ipcRenderer.removeListener("teach-mode:state", listener);
    }
  },
  auth: {
    login: () => {
      console.log("[sideBarPanel preload] 📤 Sending loginModal:open IPC message");
      electron.ipcRenderer.send("loginModal:open");
    },
    logout: () => electron.ipcRenderer.send("auth:logout"),
    getUserInfo: () => electron.ipcRenderer.invoke("auth:getUserInfo"),
    onUserInfoUpdate: (callback) => {
      const listener = (_event, user) => {
        console.log(
          "[sideBarPanel preload] 📨 Received auth:userInfoUpdate:",
          user ? `${user.email}` : "null"
        );
        callback(user);
      };
      electron.ipcRenderer.on("auth:userInfoUpdate", listener);
      return () => electron.ipcRenderer.removeListener("auth:userInfoUpdate", listener);
    },
    // 同步 session 到主进程
    syncSession: (session) => electron.ipcRenderer.invoke("auth:syncSession", session)
  },
  clipboard: {
    writeText: (text) => electron.ipcRenderer.invoke("clipboard:writeText", text),
    readText: () => electron.ipcRenderer.invoke("clipboard:readText")
  },
  osInvitation: {
    getMyCodes: () => electron.ipcRenderer.invoke("os-invitation:get-my-codes"),
    checkOnboardingStatus: () => electron.ipcRenderer.invoke("os-invitation:check-onboarding-status")
  }
};
electron.contextBridge.exposeInMainWorld("sideBarAPI", sideBarAPI);
console.log("sideBarPanel preload loaded");
const intelligenceAPI = {
  list: (type) => electron.ipcRenderer.invoke("intelligence:list", type),
  create: (type) => electron.ipcRenderer.invoke("intelligence:create", type),
  rename: (id, newName) => electron.ipcRenderer.invoke("intelligence:rename", id, newName),
  delete: (id) => electron.ipcRenderer.invoke("intelligence:delete", id),
  read: (id) => electron.ipcRenderer.invoke("intelligence:read", id),
  openInComposer: (id) => electron.ipcRenderer.invoke("agentWidget:openFileInComposer", { taskId: "__intel__", fileId: id }),
  duplicate: (id) => electron.ipcRenderer.invoke("intelligence:duplicate", id),
  deleteHostname: (hostname) => electron.ipcRenderer.invoke("intelligence:deleteHostname", hostname)
};
electron.contextBridge.exposeInMainWorld("intelligenceAPI", intelligenceAPI);
const agentWidgetAPI = {
  openSharedFileInComposer: (fileId) => electron.ipcRenderer.invoke("agentWidget:openSharedFileInComposer", fileId),
  teachMode: {
    getState: () => electron.ipcRenderer.invoke("teachMode:getState"),
    onState: (callback) => {
      const listener = (_event, state) => callback(state);
      electron.ipcRenderer.on("teach-mode:state", listener);
      return () => electron.ipcRenderer.removeListener("teach-mode:state", listener);
    }
  }
};
electron.contextBridge.exposeInMainWorld("agentWidgetAPI", agentWidgetAPI);
const agentWidgetControlAPI = {
  loadTask: (taskId) => electron.ipcRenderer.send("agentWidget:loadTask", taskId),
  pauseTask: (taskId) => electron.ipcRenderer.invoke("task:pause", taskId),
  resumeTask: (taskId) => electron.ipcRenderer.invoke("task:resume", taskId),
  generatePresetFromTask: (cleanedTaskData) => electron.ipcRenderer.invoke("agentWidget:presets:generateFromTask", cleanedTaskData),
  createPreset: (data) => electron.ipcRenderer.invoke("agentWidget:presets:create", data),
  // 监听从Tray发来的加载任务事件
  onTrayLoadTask: (callback) => {
    const listener = (_event, taskId) => callback(taskId);
    electron.ipcRenderer.on("tray:load-task", listener);
    return () => electron.ipcRenderer.removeListener("tray:load-task", listener);
  }
};
electron.contextBridge.exposeInMainWorld("agentWidgetControlAPI", agentWidgetControlAPI);
const electronBridge = {
  // Composer API for local markdown file persistence
  getComposerContent: (composerId) => electron.ipcRenderer.invoke("composer:get-content", composerId),
  saveComposerContent: (composerId, content) => electron.ipcRenderer.invoke("composer:save-content", composerId, content),
  // IPC event listeners for reward page events
  ipcRenderer: {
    on: (channel, func) => {
      const validChannels = [
        "reward-page:credit-awarded",
        "reward-page:closed",
        "sidebar:trigger-intelligence-panel"
      ];
      if (validChannels.includes(channel)) {
        const subscription = (_event, ...args) => func(...args);
        electron.ipcRenderer.on(channel, subscription);
        return subscription;
      }
      return void 0;
    },
    removeListener: (channel, func) => {
      const validChannels = [
        "reward-page:credit-awarded",
        "reward-page:closed",
        "sidebar:trigger-intelligence-panel"
      ];
      if (validChannels.includes(channel)) {
        electron.ipcRenderer.removeListener(channel, func);
      }
    },
    send: (channel, ...args) => {
      electron.ipcRenderer.send(channel, ...args);
    },
    invoke: (channel, ...args) => {
      return electron.ipcRenderer.invoke(channel, ...args);
    }
  }
};
electron.contextBridge.exposeInMainWorld("electron", electronBridge);
electron.contextBridge.exposeInMainWorld("electronAPI", electronBridge);
window.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("pointerenter", () => {
    electron.ipcRenderer.send("sidebar-panel-mouse-enter");
  });
  document.addEventListener("pointerleave", () => {
    electron.ipcRenderer.send("sidebar-panel-mouse-leave");
  });
  document.addEventListener(
    "dragover",
    (e) => {
      e.preventDefault();
      e.stopPropagation();
    },
    true
  );
  document.addEventListener(
    "dragenter",
    (e) => {
      e.preventDefault();
      e.stopPropagation();
    },
    true
  );
  document.addEventListener(
    "drop",
    async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const files = Array.from(e.dataTransfer?.files || []);
      if (files.length > 0) {
        const filePaths = files.map((file) => {
          try {
            return electron.webUtils.getPathForFile(file);
          } catch (error) {
            console.error("[SideBarPanel] Failed to get file path:", error);
            return null;
          }
        }).filter(Boolean);
        if (filePaths.length > 0) {
          try {
            await electron.ipcRenderer.invoke("mainWindow:openLocalFiles", filePaths);
          } catch (error) {
            console.error("[SideBarPanel] Failed to open files:", error);
          }
        }
      }
    },
    true
  );
});
