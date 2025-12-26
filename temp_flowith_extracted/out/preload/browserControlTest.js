"use strict";
const electron = require("electron");
function on(channel, handler) {
  const wrapped = (_event, payload) => handler(payload);
  electron.ipcRenderer.on(channel, wrapped);
  return () => electron.ipcRenderer.off(channel, wrapped);
}
const browserControlTestAPI = {
  getInteractiveElements: () => electron.ipcRenderer.invoke("browserControlTest:getInteractiveElements"),
  getSnapshot: (options) => electron.ipcRenderer.invoke("browserControlTest:getSnapshot", options),
  setFileChooserListening: (on2) => electron.ipcRenderer.invoke("browserControlTest:toggleFileChooserListener", on2),
  cancelFileChooser: () => electron.ipcRenderer.invoke("browserControlTest:cancelFileChooser"),
  getFileChooserStatus: () => electron.ipcRenderer.invoke("browserControlTest:getFileChooserStatus"),
  chooseFilesForOpenedChooser: () => electron.ipcRenderer.invoke("browserControlTest:chooseFilesForOpenedChooser"),
  uploadFile: () => electron.ipcRenderer.invoke("browserControlTest:uploadFile"),
  clickButton: () => electron.ipcRenderer.invoke("browserControlTest:clickButton"),
  inputText: () => electron.ipcRenderer.invoke("browserControlTest:inputText"),
  screenshotViewport: () => electron.ipcRenderer.invoke("browserControlTest:screenshotViewport"),
  screenshotFullPage: () => electron.ipcRenderer.invoke("browserControlTest:screenshotFullPage"),
  captureFullPage: () => electron.ipcRenderer.invoke("browserControlTest:captureFullPage"),
  getAllDetail: () => electron.ipcRenderer.invoke("browserControlTest:getAllDetail"),
  invokeElementAction: (args) => electron.ipcRenderer.invoke("browserControlTest:invokeElementAction", args),
  googleSearch: () => electron.ipcRenderer.invoke("browserControlTest:googleSearch"),
  getAllHistory: () => electron.ipcRenderer.invoke("browserControlTest:getAllHistory"),
  getCurrentTabHistory: () => electron.ipcRenderer.invoke("browserControlTest:getCurrentTabHistory"),
  listControllers: () => electron.ipcRenderer.invoke("browserControlTest:listControllers"),
  createNormalController: (id) => electron.ipcRenderer.invoke("browserControlTest:createNormalController", id),
  getTabOwners: () => electron.ipcRenderer.invoke("browserControlTest:getTabOwners"),
  controller: {
    getTabs: (controllerId) => electron.ipcRenderer.invoke("browserControlTest:controller:getTabs", controllerId),
    getRequiredTabs: (controllerId) => electron.ipcRenderer.invoke("browserControlTest:controller:getRequiredTabs", controllerId),
    getHistory: (controllerId) => electron.ipcRenderer.invoke("browserControlTest:controller:getHistory", controllerId),
    clearHistory: (controllerId) => electron.ipcRenderer.invoke("browserControlTest:controller:clearHistory", controllerId),
    getCurrent: (controllerId) => electron.ipcRenderer.invoke("browserControlTest:controller:getCurrent", controllerId),
    setCurrent: (controllerId, tabId) => electron.ipcRenderer.invoke("browserControlTest:controller:setCurrent", controllerId, tabId),
    createTab: (controllerId, url) => electron.ipcRenderer.invoke("browserControlTest:controller:createTab", controllerId, url),
    closeTab: (controllerId, tabId) => electron.ipcRenderer.invoke("browserControlTest:controller:closeTab", controllerId, tabId),
    getTab: (controllerId, tabId) => electron.ipcRenderer.invoke("browserControlTest:controller:getTab", controllerId, tabId),
    setRequired: (controllerId, tabId, required) => electron.ipcRenderer.invoke("browserControlTest:controller:setRequired", controllerId, tabId, required)
  },
  sendEnterKey: () => electron.ipcRenderer.invoke("browserControlTest:sendEnterKey"),
  sendBackspace: () => electron.ipcRenderer.invoke("browserControlTest:sendBackspace"),
  sendCtrlA: () => electron.ipcRenderer.invoke("browserControlTest:sendCtrlA"),
  onFileChooserOpened: (cb) => on("browserControlTest:fileChooserOpened", cb),
  onFileChooserAccepted: (cb) => on("browserControlTest:fileChooserAccepted", cb),
  onFileChooserCancelled: (cb) => on("browserControlTest:fileChooserCancelled", cb),
  onFileChooserListeningChanged: (cb) => on("browserControlTest:fileChooserListeningChanged", cb)
};
electron.contextBridge.exposeInMainWorld("browserControlTestAPI", browserControlTestAPI);
console.log("browserControlTestAPI preload loaded");
