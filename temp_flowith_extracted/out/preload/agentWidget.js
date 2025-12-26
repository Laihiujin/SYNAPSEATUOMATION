"use strict";
const electron = require("electron");
const api = {
  resize(payload) {
    electron.ipcRenderer.send("agentWidget:resize", payload);
  },
  getPinned: () => electron.ipcRenderer.invoke("agentWidget:getPinned"),
  setPinned: (next) => electron.ipcRenderer.send("agentWidget:setPinned", next),
  getVerticalOffset: () => electron.ipcRenderer.invoke("agentWidget:getVerticalOffset"),
  setVerticalOffset: (offset) => electron.ipcRenderer.send("agentWidget:setVerticalOffset", offset),
  setIsDragging: (isDragging) => electron.ipcRenderer.send("agentWidget:setIsDragging", isDragging),
  setIgnoreMouseEvents: (ignore) => electron.ipcRenderer.send("agentWidget:setIgnoreMouseEvents", ignore),
  onSwitchToTask(callback) {
    const listener = (_event, taskId) => callback(taskId);
    electron.ipcRenderer.on("agentWidget:switchToTask", listener);
    return () => electron.ipcRenderer.removeListener("agentWidget:switchToTask", listener);
  },
  browserAgent: {
    startTask(request) {
      return electron.ipcRenderer.invoke("task:start", request);
    },
    pauseTask(taskId) {
      return electron.ipcRenderer.invoke("task:pause", taskId);
    },
    resumeTask(taskId) {
      return electron.ipcRenderer.invoke("task:resume", taskId);
    },
    rerunTask() {
      throw new Error("Not implemented");
    },
    archiveTask(taskId) {
      return electron.ipcRenderer.invoke("task:archive", taskId);
    },
    followUpTask(request) {
      return electron.ipcRenderer.invoke("task:followUp", request);
    },
    onLoadTask(callback) {
      const listener = (_event, taskId) => callback(taskId);
      electron.ipcRenderer.on("agentWidget:loadTask", listener);
      return () => electron.ipcRenderer.removeListener("agentWidget:loadTask", listener);
    },
    // 新增：创建/重命名文件（支持 shared 前缀）
    submitHumanInput(payload) {
      return electron.ipcRenderer.invoke("browser-agent:submit-human-input", payload);
    },
    getHumanInputQueue() {
      return electron.ipcRenderer.invoke("browser-agent:get-human-input-queue");
    },
    onHumanInputQueueUpdate(callback) {
      const handler = (_event, snapshot) => callback(snapshot);
      electron.ipcRenderer.on("human-input:queue-update", handler);
      return () => electron.ipcRenderer.removeListener("human-input:queue-update", handler);
    },
    setHumanInputHeight(height) {
      electron.ipcRenderer.send("human-input:set-height", height);
    }
  },
  tasks: {
    get: (taskId) => electron.ipcRenderer.invoke("taskSnapshot:get", taskId),
    onEvent: (callback) => {
      const listener = (_event, snapshot) => callback(snapshot);
      electron.ipcRenderer.on("taskSnapshot:update", listener);
      return () => electron.ipcRenderer.removeListener("taskSnapshot:update", listener);
    },
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
    }
  },
  preset: {
    list: (locale) => electron.ipcRenderer.invoke("agentWidget:presets:list", locale),
    create: (data) => electron.ipcRenderer.invoke("agentWidget:presets:create", data),
    update: (data) => electron.ipcRenderer.invoke("agentWidget:presets:update", data),
    remove: (id) => electron.ipcRenderer.invoke("agentWidget:presets:remove", id),
    selectFiles: () => electron.ipcRenderer.invoke("agentWidget:presets:selectFiles"),
    readFiles: (presetId) => electron.ipcRenderer.invoke("agentWidget:presets:readFiles", presetId)
  },
  presetDialog: {
    show: (config) => electron.ipcRenderer.invoke("preset-dialog:show", config)
  },
  tabs: {
    setCurrent: (tabId) => electron.ipcRenderer.invoke("tabs:setCurrent", tabId),
    create: (url, switchTo) => electron.ipcRenderer.invoke("tabs:create", url, switchTo),
    findByUrl: (url) => electron.ipcRenderer.invoke("tabs:findByUrl", url)
  },
  openFileInComposer: (params) => electron.ipcRenderer.invoke("agentWidget:openFileInComposer", params),
  openSharedFileInComposer: (fileId) => electron.ipcRenderer.invoke("agentWidget:openSharedFileInComposer", fileId),
  showFileInFolder: (params) => electron.ipcRenderer.invoke("file:showInFolder", params),
  teachMode: {
    getState: () => electron.ipcRenderer.invoke("teachMode:getState"),
    onState(callback) {
      const listener = (_event, state) => callback(state);
      electron.ipcRenderer.on("teachMode:state-update", listener);
      return () => electron.ipcRenderer.removeListener("teachMode:state-update", listener);
    }
  },
  auth: {
    getAccessToken: () => electron.ipcRenderer.invoke("auth:getAccessToken")
  },
  taskCredits: {
    getTaskCredits: (taskId) => electron.ipcRenderer.invoke("agentWidget:getTaskCredits", taskId),
    refundTaskCredits: (taskId, taskSnapshot) => electron.ipcRenderer.invoke("agentWidget:refundTaskCredits", taskId, taskSnapshot),
    validateRefundReason: (reason) => electron.ipcRenderer.invoke("agentWidget:validateRefundReason", reason)
  }
};
const intelligenceAPI = {
  list: (type) => electron.ipcRenderer.invoke("intelligence:list", type),
  create: (type) => electron.ipcRenderer.invoke("intelligence:create", type),
  rename: (id, newName) => electron.ipcRenderer.invoke("intelligence:rename", id, newName),
  delete: (id) => electron.ipcRenderer.invoke("intelligence:delete", id),
  read: (id) => electron.ipcRenderer.invoke("intelligence:read", id),
  openInComposer: (id) => electron.ipcRenderer.invoke("agentWidget:openFileInComposer", { taskId: "__intel__", fileId: id }),
  duplicate: (id) => electron.ipcRenderer.invoke("intelligence:duplicate", id)
};
electron.contextBridge.exposeInMainWorld("intelligenceAPI", intelligenceAPI);
electron.contextBridge.exposeInMainWorld("agentWidgetAPI", api);
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
  console.warn("[agentWidget] localeAPI already exists, skipping:", error);
}
try {
  electron.contextBridge.exposeInMainWorld("lifecycleAPI", {
    sendReady: () => electron.ipcRenderer.send("human-input:ready")
  });
} catch (error) {
  console.warn("[agentWidget] lifecycleAPI already exists, skipping:", error);
}
const electronAPI = {
  ipcRenderer: {
    on: (channel, callback) => {
      electron.ipcRenderer.on(channel, callback);
    },
    removeListener: (channel, callback) => {
      electron.ipcRenderer.removeListener(channel, callback);
    }
  }
};
electron.contextBridge.exposeInMainWorld("electron", electronAPI);
