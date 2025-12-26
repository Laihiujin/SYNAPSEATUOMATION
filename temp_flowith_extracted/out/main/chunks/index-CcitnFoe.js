"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const electron = require("electron"), utils = require("@electron-toolkit/utils"), index$2 = require("./index-vXB5mSwm.js"), AbstractModalViewManager = require("./AbstractModalViewManager-aig2dJrA.js"), path = require("path"), fs = require("fs"), mainEventBus = require("./mainEventBus-D2ZkkKhI.js"), index$3 = require("./index-Bf0u4cvK.js"), index$1 = require("../index.js"), uuid = require("uuid"), cron = require("cron"), quitHandler = require("./quitHandler-DVZxe9rU.js"), index$4 = require("./index-CP7J970o.js"), config = require("./supabaseManager-BAbRVJxx.js"), os = require("os"), child_process = require("child_process");
require("@supabase/supabase-js");
const crypto = require("crypto"), index$5 = require("./TeachModeService-BNgYqdjn.js"), fs$1 = require("fs/promises"), posthogService = require("./posthogService-khJWbAtc.js"), identityManager = require("./identityManager-BCbqUN0U.js"), log = require("electron-log"), client = require("@libsql/client"), dpapi = require("@primno/dpapi"), index$6 = require("./index-CR4vSMhM.js"), index$7 = require("./index-B34KkOYs.js"), classicLevel = require("classic-level"), certificateManager = require("./certificateManager-BNNWUnqZ.js"), mac = require("./mac-BtNu6qud.js"), CronExpressionParser = require("cron-parser");
require("url"), require("./userAgentUtils-DJa5NphP.js"), require("@cliqz/adblocker-electron"), require("cross-fetch"), require("events"), require("xlsx"), require("file-type"), require("mime-types"), require("mitt"), require("zod"), require("p-queue"), require("https"), require("http"), require("string_decoder"), require("./index-GfVwZ7mz.js"), require("electron-updater"), require("posthog-node"), require("drizzle-orm/libsql/migrator"), require("drizzle-orm/libsql"), require("drizzle-orm/sqlite-core"), require("drizzle-orm");
function _interopNamespaceDefault(e) {
  const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : { enumerable: true, get: () => e[k] });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}
const path__namespace = /* @__PURE__ */ _interopNamespaceDefault(path);
const fs__namespace$1 = /* @__PURE__ */ _interopNamespaceDefault(fs);
const os__namespace = /* @__PURE__ */ _interopNamespaceDefault(os);
const crypto__namespace = /* @__PURE__ */ _interopNamespaceDefault(crypto);
const fs__namespace = /* @__PURE__ */ _interopNamespaceDefault(fs$1);
class BrowserControlTestWindow {
  static instance = null;
  window = null;
  registeredChannels = /* @__PURE__ */ new Set();
  unbindEventBusHandlers = [];
  constructor() {
    this.registerIpcHandlers();
  }
  static getInstance() {
    if (!BrowserControlTestWindow.instance) {
      BrowserControlTestWindow.instance = new BrowserControlTestWindow();
    }
    return BrowserControlTestWindow.instance;
  }
  open() {
    const existingWindow = this.getWindow();
    if (existingWindow) {
      existingWindow.show();
      existingWindow.focus();
      return existingWindow;
    }
    this.window = this.createWindow();
    this.setupEventForwarders();
    return this.window;
  }
  getWindow() {
    if (!this.window || this.window.isDestroyed()) {
      this.window = null;
      return null;
    }
    return this.window;
  }
  close() {
    const win = this.getWindow();
    win?.close();
  }
  destroy() {
    this.close();
    this.unregisterIpcHandlers();
    this.removeEventForwarders();
    BrowserControlTestWindow.instance = null;
  }
  createWindow() {
    const window = new electron.BrowserWindow({
      width: 1e3,
      height: 800,
      minWidth: 800,
      minHeight: 600,
      title: "BrowserControl 测试工具",
      titleBarStyle: "hiddenInset",
      show: false,
      autoHideMenuBar: true,
      webPreferences: {
        preload: path.join(index$1.g(), "../preload/browserControlTest.js"),
        sandbox: false,
        contextIsolation: true,
        nodeIntegration: false
      }
    });
    window.on("ready-to-show", () => {
      window.show();
    });
    window.on("closed", () => {
      this.window = null;
    });
    if (utils.is.dev && process.env["ELECTRON_RENDERER_URL"]) {
      window.loadURL(`${process.env["ELECTRON_RENDERER_URL"]}/browserControlTest/index.html`);
    } else {
      window.loadFile(path.join(index$1.g(), "../renderer/browserControlTest/index.html"));
    }
    return window;
  }
  setupEventForwarders() {
    this.removeEventForwarders();
    const forward = (channel, ipcChannel) => {
      const handler = (payload) => {
        this.getWindow()?.webContents.send(ipcChannel, payload);
      };
      mainEventBus.m.on(channel, handler);
      this.unbindEventBusHandlers.push(() => {
        mainEventBus.m.off(channel, handler);
      });
    };
    forward("tab:fileChooserOpened", "browserControlTest:fileChooserOpened");
    forward("tab:fileChooserAccepted", "browserControlTest:fileChooserAccepted");
    forward("tab:fileChooserCancelled", "browserControlTest:fileChooserCancelled");
    forward("tab:fileChooserListeningChanged", "browserControlTest:fileChooserListeningChanged");
  }
  removeEventForwarders() {
    for (const off of this.unbindEventBusHandlers) {
      off();
    }
    this.unbindEventBusHandlers = [];
  }
  requireActiveTab() {
    const activeTab = index$2.t.currentTab;
    if (!activeTab) {
      throw new Error("没有活动的标签页");
    }
    return activeTab;
  }
  registerIpcHandlers() {
    this.registerHandler("browserControlTest:getSnapshot", async (...rawArgs) => {
      const options = rawArgs[0] || {};
      const activeTab = this.requireActiveTab();
      const detail = await activeTab.getAllDetail({
        getInteractiveElements: options.getInteractiveElements ?? true,
        screenshotMode: "viewport"
      });
      const elementsArray = Array.from(detail.elements.entries()).map(([id, element]) => {
        const actions = [];
        if (index$2.i(element)) actions.push("click");
        if (index$2.a(element)) actions.push("setValue");
        if (index$2.b(element)) actions.push("selectByValue");
        if (index$2.c(element)) actions.push("toggle");
        if (index$2.d(element)) actions.push("setFiles");
        return {
          id,
          type: element.data?.type ?? "unknown",
          prompt: element.toPrompt(),
          actions
        };
      });
      return {
        success: true,
        tab: {
          id: activeTab.id,
          url: activeTab.url,
          title: activeTab.title,
          isCurrent: activeTab.isCurrent,
          favicon: activeTab.favicon
        },
        pagePrompt: detail.pagePrompt,
        elements: elementsArray,
        screenshotViewport: detail.screenshotWithHighlight,
        screenshotFullPage: void 0
      };
    });
    this.registerHandler("browserControlTest:captureFullPage", async () => {
      const activeTab = this.requireActiveTab();
      const res = await activeTab.screenshot({ mode: "full_page" });
      return {
        success: true,
        image: res
      };
    });
    this.registerHandler(
      "browserControlTest:toggleFileChooserListener",
      async (...rawArgs) => {
        const on = Boolean(rawArgs[0]);
        const activeTab = this.requireActiveTab();
        await activeTab.setFileChooserListening(on);
        return { success: true, message: on ? "监听已开启" : "监听已关闭" };
      }
    );
    this.registerHandler("browserControlTest:getFileChooserStatus", async () => {
      const activeTab = this.requireActiveTab();
      const status = activeTab.fileChooserStatus;
      return status;
    });
    this.registerHandler("browserControlTest:chooseFilesForOpenedChooser", async () => {
      const activeTab = this.requireActiveTab();
      const status = activeTab.fileChooserStatus;
      if (!status.isOpen) {
        return { success: false, message: "当前无已拦截的文件选择对话框" };
      }
      const { canceled, filePaths } = await electron.dialog.showOpenDialog(index$2.g(), {
        title: "选择要上传的文件",
        properties: status.isMultiple ? ["openFile", "multiSelections"] : ["openFile"],
        filters: status.acceptPatterns && status.acceptPatterns.length > 0 ? [
          {
            name: "Accepted",
            extensions: status.acceptPatterns.map((x) => x.replace(/^\./, ""))
          }
        ] : void 0
      });
      if (canceled || filePaths.length === 0) {
        return { success: false, message: "未选择文件" };
      }
      const res = await activeTab.setFileChooserFiles(filePaths);
      return { success: res.success, message: res.toPrompt() };
    });
    this.registerHandler("browserControlTest:cancelFileChooser", async () => {
      const activeTab = this.requireActiveTab();
      const res = await activeTab.cancelFileChooser();
      return { success: res.success, message: res.toPrompt() };
    });
    this.registerHandler(
      "browserControlTest:invokeElementAction",
      async (...rawArgs) => {
        const args = rawArgs[0] || {};
        const activeTab = this.requireActiveTab();
        const { elementId, action } = args || {};
        if (!elementId || !action) {
          throw new Error("参数无效：需要 elementId 和 action");
        }
        const element = await activeTab.getInteractiveElement(elementId);
        if (!element) {
          throw new Error(`未找到元素: ${elementId}`);
        }
        switch (action) {
          case "click": {
            if (!index$2.i(element)) throw new Error("该元素不支持点击");
            const res = await element.click();
            return { success: res.success, message: res.toPrompt() };
          }
          case "setValue": {
            if (!index$2.a(element)) throw new Error("该元素不支持输入");
            const value = args.value ?? "";
            const res = await element.setValue(value);
            return { success: res.success, message: res.toPrompt() };
          }
          case "selectByValue": {
            if (!index$2.b(element)) throw new Error("该元素不支持选择");
            const value = args.value ?? "";
            const res = await element.selectByValue(value);
            return { success: res.success, message: res.toPrompt() };
          }
          case "toggle": {
            if (!index$2.c(element)) throw new Error("该元素不支持切换");
            const res = await element.toggle();
            return { success: res.success, message: res.toPrompt() };
          }
          case "setFiles": {
            if (!index$2.d(element)) throw new Error("该元素不是文件输入框");
            let filePaths = args.filePaths;
            if (!filePaths || filePaths.length === 0) {
              const { canceled, filePaths: chosen } = await electron.dialog.showOpenDialog(index$2.g(), {
                title: "选择要上传的文件",
                properties: ["openFile", "multiSelections"]
              });
              if (canceled || chosen.length === 0) {
                throw new Error("未选择文件");
              }
              filePaths = chosen;
            }
            const res = await element.setFiles(filePaths);
            return { success: res.success, message: res.toPrompt() };
          }
          default:
            throw new Error(`未知的动作: ${String(action)}`);
        }
      }
    );
    this.registerHandler("browserControlTest:getInteractiveElements", async () => {
      const activeTab = this.requireActiveTab();
      const result = await activeTab.getInteractiveElements();
      const elementsArray = Array.from(result.elements.entries()).map(([id, element]) => ({
        id,
        type: element.data?.type ?? "unknown",
        prompt: element.toPrompt()
      }));
      return {
        success: true,
        elements: elementsArray,
        pagePrompt: result.pagePrompt
      };
    });
    this.registerHandler("browserControlTest:uploadFile", async () => {
      const activeTab = this.requireActiveTab();
      const interactiveResult = await activeTab.getInteractiveElements();
      const elements = interactiveResult.elements;
      let fileInputElementId = null;
      for (const [id, element] of elements.entries()) {
        if (index$2.d(element)) {
          fileInputElementId = id;
          break;
        }
      }
      if (!fileInputElementId) {
        throw new Error('未找到文件输入元素（<input type="file">）');
      }
      const fileInput = await activeTab.getInteractiveElement(fileInputElementId);
      if (!fileInput || !index$2.d(fileInput)) {
        throw new Error("无法获取文件输入元素");
      }
      const { canceled, filePaths } = await electron.dialog.showOpenDialog(index$2.g(), {
        title: "选择要上传的文件",
        properties: ["openFile", "multiSelections"]
      });
      if (canceled || filePaths.length === 0) {
        throw new Error("未选择文件");
      }
      const uploadResult = await fileInput.setFiles(filePaths);
      return {
        success: uploadResult.success,
        message: uploadResult.toPrompt()
      };
    });
    this.registerHandler("browserControlTest:clickButton", async () => {
      const activeTab = this.requireActiveTab();
      const interactiveResult = await activeTab.getInteractiveElements();
      const elements = interactiveResult.elements;
      let buttonElementId = null;
      for (const [id, element] of elements.entries()) {
        if (index$2.i(element)) {
          buttonElementId = id;
          break;
        }
      }
      if (!buttonElementId) {
        throw new Error("未找到按钮元素");
      }
      const button = await activeTab.getInteractiveElement(buttonElementId);
      if (!button || !index$2.i(button)) {
        throw new Error("无法获取按钮元素");
      }
      const clickResult = await button.click();
      return {
        success: clickResult.success,
        message: clickResult.toPrompt()
      };
    });
    this.registerHandler("browserControlTest:inputText", async () => {
      const activeTab = this.requireActiveTab();
      const interactiveResult = await activeTab.getInteractiveElements();
      const elements = interactiveResult.elements;
      let inputElementId = null;
      for (const [id, element] of elements.entries()) {
        if (index$2.a(element)) {
          inputElementId = id;
          break;
        }
      }
      if (!inputElementId) {
        throw new Error("未找到输入框元素");
      }
      const input = await activeTab.getInteractiveElement(inputElementId);
      if (!input || !index$2.a(input)) {
        throw new Error("无法获取输入框元素");
      }
      const inputResult = await input.setValue("Hello from BrowserControl!");
      return {
        success: inputResult.success,
        message: inputResult.toPrompt()
      };
    });
    this.registerHandler("browserControlTest:screenshotViewport", async () => {
      const activeTab = this.requireActiveTab();
      const res = await activeTab.screenshot({ mode: "viewport" });
      const storage = index$3.getAppStorage();
      const defaultPath = storage.getPath(
        "temp",
        "screenshots",
        `flowith-screenshot-viewport-${Date.now()}.png`
      );
      const { canceled, filePath } = await electron.dialog.showSaveDialog(index$2.g(), {
        title: "保存截图（视口）",
        defaultPath,
        filters: [{ name: "PNG Image", extensions: ["png"] }]
      });
      if (!canceled && filePath) {
        await fs.promises.writeFile(filePath, Buffer.from(res, "base64"));
        electron.shell.showItemInFolder(filePath);
        return {
          success: true,
          message: `截图已保存到: ${filePath}`
        };
      }
      return {
        success: true,
        message: "截图获取成功"
      };
    });
    this.registerHandler("browserControlTest:screenshotFullPage", async () => {
      const activeTab = this.requireActiveTab();
      const res = await activeTab.screenshot({ mode: "full_page" });
      const storage = index$3.getAppStorage();
      const defaultPath = storage.getPath(
        "temp",
        "screenshots",
        `flowith-screenshot-full-${Date.now()}.png`
      );
      const { canceled, filePath } = await electron.dialog.showSaveDialog(index$2.g(), {
        title: "保存截图（全页）",
        defaultPath,
        filters: [{ name: "PNG Image", extensions: ["png"] }]
      });
      if (!canceled && filePath) {
        await fs.promises.writeFile(filePath, Buffer.from(res, "base64"));
        electron.shell.showItemInFolder(filePath);
        return {
          success: true,
          message: `截图已保存到: ${filePath}`
        };
      }
      return {
        success: true,
        message: "截图获取成功"
      };
    });
    this.registerHandler("browserControlTest:getAllDetail", async () => {
      const activeTab = this.requireActiveTab();
      const detail = await activeTab.getAllDetail();
      return {
        success: true,
        detail
      };
    });
    this.registerHandler("browserControlTest:getAllHistory", async () => {
      const history = index$2.t.history;
      const lines = history.map((h) => h.toPrompt()).join("\n");
      return { success: true, message: lines || "无历史记录" };
    });
    this.registerHandler("browserControlTest:getCurrentTabHistory", async () => {
      const activeTab = this.requireActiveTab();
      const lines = activeTab.history.map((h) => h.toPrompt()).join("\n");
      return { success: true, message: lines || "当前标签页无历史记录" };
    });
    this.registerHandler("browserControlTest:googleSearch", async () => {
      const tab = await index$2.t.createTab("https://www.google.com");
      await new Promise((resolve) => setTimeout(resolve, 2e3));
      const result = await tab.getInteractiveElements();
      const elements = result.elements;
      let searchBoxElementId = null;
      for (const [id, element] of elements.entries()) {
        if (index$2.a(element) && (element.toPrompt().toLowerCase().includes("search") || element.toPrompt().toLowerCase().includes("搜索"))) {
          searchBoxElementId = id;
          break;
        }
      }
      if (!searchBoxElementId) {
        throw new Error("未找到搜索框");
      }
      const searchBox = await tab.getInteractiveElement(searchBoxElementId);
      if (!searchBox || !index$2.a(searchBox)) {
        throw new Error("无法获取搜索框元素");
      }
      await searchBox.setValue("Flowith Browser");
      let searchButtonElementId = null;
      for (const [id, element] of elements.entries()) {
        if (index$2.i(element) && element.toPrompt().includes("submit") && (element.toPrompt().includes("Google Search") || element.toPrompt().includes("Google 搜索"))) {
          searchButtonElementId = id;
          break;
        }
      }
      if (!searchButtonElementId) {
        throw new Error("未找到搜索按钮");
      }
      const searchButton = await tab.getInteractiveElement(searchButtonElementId);
      if (!searchButton || !index$2.i(searchButton)) {
        throw new Error("无法获取搜索按钮元素");
      }
      await searchButton.click();
      return {
        success: true,
        message: "Google 搜索测试已执行完成"
      };
    });
    this.registerHandler("browserControlTest:sendEnterKey", async () => {
      const activeTab = this.requireActiveTab();
      const res = await activeTab.sendKeyPress("Enter");
      return { success: res.success, message: res.toPrompt() };
    });
    this.registerHandler("browserControlTest:sendBackspace", async () => {
      const activeTab = this.requireActiveTab();
      const res = await activeTab.sendKeyPress("Backspace");
      return { success: res.success, message: res.toPrompt() };
    });
    this.registerHandler("browserControlTest:sendCtrlA", async () => {
      const activeTab = this.requireActiveTab();
      const modifiers = process.platform === "darwin" ? ["meta"] : ["ctrl"];
      const res = await activeTab.sendKeyPress("a", modifiers);
      return { success: res.success, message: res.toPrompt() };
    });
    this.registerHandler("browserControlTest:listControllers", async () => {
      const list = index$2.C.getInstance().listControllers();
      return list;
    });
    this.registerHandler(
      "browserControlTest:createNormalController",
      async (...rawArgs) => {
        const id = typeof rawArgs[0] === "string" && rawArgs[0] ? String(rawArgs[0]) : void 0;
        const ctrl = index$2.C.getInstance().createController("normal", id);
        return { id: ctrl.id };
      }
    );
    this.registerHandler("browserControlTest:getTabOwners", async () => {
      const tabs = index$2.T.getInstance().tabs;
      return tabs.map((t) => ({ id: t.id, ownerId: t.ownerId }));
    });
    const getControllerOrThrow = (id) => {
      const controllerId = String(id || "");
      if (!controllerId) throw new Error("controllerId is required");
      const ctrl = index$2.C.getInstance().getController(controllerId);
      if (!ctrl) throw new Error(`Controller not found: ${controllerId}`);
      return ctrl;
    };
    const toTabInfo = (tab) => ({
      id: tab.id,
      title: tab.title,
      url: tab.url,
      favicon: tab.favicon,
      isCurrent: tab.isCurrent,
      isOperating: tab.isOperating,
      ownerId: tab.ownerId,
      canGoBack: tab.canGoBack(),
      canGoForward: tab.canGoForward(),
      agentColors: tab.agentColors,
      createdAt: tab.createdAt
    });
    this.registerHandler("browserControlTest:controller:getTabs", async (...rawArgs) => {
      const ctrl = getControllerOrThrow(rawArgs[0]);
      return ctrl.tabs.map(toTabInfo);
    });
    this.registerHandler(
      "browserControlTest:controller:getRequiredTabs",
      async (...rawArgs) => {
        const ctrl = getControllerOrThrow(rawArgs[0]);
        return ctrl.ownedTabs.map(toTabInfo);
      }
    );
    this.registerHandler(
      "browserControlTest:controller:getHistory",
      async (...rawArgs) => {
        const ctrl = getControllerOrThrow(rawArgs[0]);
        return ctrl.history.map((h) => h.toPrompt());
      }
    );
    this.registerHandler(
      "browserControlTest:controller:clearHistory",
      async (...rawArgs) => {
        const ctrl = getControllerOrThrow(rawArgs[0]);
        ctrl.clearHistory();
        return { success: true };
      }
    );
    this.registerHandler(
      "browserControlTest:controller:getCurrent",
      async (...rawArgs) => {
        const ctrl = getControllerOrThrow(rawArgs[0]);
        const t = ctrl.currentTab;
        return t ? toTabInfo(t) : null;
      }
    );
    this.registerHandler(
      "browserControlTest:controller:setCurrent",
      async (...rawArgs) => {
        const ctrl = getControllerOrThrow(rawArgs[0]);
        const tabId = String(rawArgs[1] || "");
        if (!tabId) throw new Error("tabId is required");
        const t = ctrl.getTab(tabId);
        if (!t) throw new Error(`Tab not found: ${tabId}`);
        ctrl.currentTab = t;
        return { success: true };
      }
    );
    this.registerHandler(
      "browserControlTest:controller:createTab",
      async (...rawArgs) => {
        const ctrl = getControllerOrThrow(rawArgs[0]);
        const url = rawArgs[1] ? String(rawArgs[1]) : void 0;
        const t = await ctrl.createTab(url);
        return { id: t.id };
      }
    );
    this.registerHandler(
      "browserControlTest:controller:closeTab",
      async (...rawArgs) => {
        const ctrl = getControllerOrThrow(rawArgs[0]);
        const tabId = String(rawArgs[1] || "");
        if (!tabId) throw new Error("tabId is required");
        await ctrl.closeTab(tabId);
        return { success: true };
      }
    );
    this.registerHandler("browserControlTest:controller:getTab", async (...rawArgs) => {
      const ctrl = getControllerOrThrow(rawArgs[0]);
      const tabId = String(rawArgs[1] || "");
      if (!tabId) throw new Error("tabId is required");
      const t = ctrl.getTab(tabId);
      return t ? toTabInfo(t) : null;
    });
    this.registerHandler(
      "browserControlTest:controller:setRequired",
      async (...rawArgs) => {
        const ctrl = getControllerOrThrow(rawArgs[0]);
        const tabId = String(rawArgs[1] || "");
        const required = Boolean(rawArgs[2]);
        if (!tabId) throw new Error("tabId is required");
        const t = ctrl.getTab(tabId);
        if (!t) throw new Error(`Tab not found: ${tabId}`);
        if (required) {
          t.acquireOwnership();
        } else {
          t.releaseOwnership();
        }
        return { success: true };
      }
    );
  }
  registerHandler(channel, handler) {
    if (this.registeredChannels.has(channel)) return;
    electron.ipcMain.handle(channel, async (_event, ...args) => {
      try {
        return await handler(...args);
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : String(error));
      }
    });
    this.registeredChannels.add(channel);
  }
  unregisterIpcHandlers() {
    for (const channel of this.registeredChannels) {
      electron.ipcMain.removeHandler(channel);
    }
    this.registeredChannels.clear();
  }
}
const browserControlTestWindow = BrowserControlTestWindow.getInstance();
async function getDropdownOptionsAction() {
  console.log("[devMenu] ==================== Get Dropdown Options 开始 ====================");
  try {
    const tabManager = index$2.C.getInstance().createController("system");
    const activeTab = tabManager.currentTab;
    if (!activeTab) {
      electron.dialog.showMessageBox(index$2.g(), {
        type: "warning",
        title: "Get Dropdown Options 测试",
        message: "没有活动的标签页"
      });
      return;
    }
    console.log("[devMenu] 当前标签页:", activeTab.id, activeTab.url);
    console.log("[devMenu] 获取交互元素...");
    const interactiveResult = await activeTab.getInteractiveElements();
    const elements = interactiveResult.elements;
    console.log("[devMenu] 获取到", elements.size, "个交互元素");
    const { isSelectElement } = await Promise.resolve().then(() => require("./index-vXB5mSwm.js")).then((n) => n.a6);
    const selectIds = [];
    for (const [id, element] of elements) {
      if (isSelectElement(element)) {
        selectIds.push(id);
        console.log("[devMenu] ✅ 找到 SELECT 元素:", id);
      }
    }
    console.log("[devMenu] 总共找到", selectIds.length, "个 SELECT 元素");
    if (selectIds.length === 0) {
      electron.dialog.showMessageBox(index$2.g(), {
        type: "info",
        title: "Get Dropdown Options 测试",
        message: "当前页面没有找到下拉框元素"
      });
      return;
    }
    const allResults = [];
    for (const elementId of selectIds) {
      console.log(`[devMenu] 处理元素 ${elementId}...`);
      try {
        const element = await activeTab.getInteractiveElement(elementId);
        if (!element) {
          allResults.push(`元素 ${elementId}: ❌ 未找到`);
          continue;
        }
        const backendNodeId = element.backendNodeId;
        if (!backendNodeId) {
          allResults.push(`元素 ${elementId}: ❌ 无 backendNodeId`);
          continue;
        }
        const cdpDebugger = activeTab.getView().webContents.debugger;
        const resolved = await cdpDebugger.sendCommand("DOM.resolveNode", { backendNodeId });
        const objectId = resolved.object?.objectId;
        if (!objectId) {
          allResults.push(`元素 ${elementId}: ❌ 无法解析 objectId`);
          continue;
        }
        const result = await cdpDebugger.sendCommand("Runtime.callFunctionOn", {
          objectId,
          functionDeclaration: `
            function() {
              if (!this || this.tagName !== 'SELECT') {
                return [];
              }
              return Array.from(this.options).map(function(opt) {
                return opt.text.trim();
              });
            }
          `,
          returnByValue: true
        });
        const options = result.result?.value || [];
        console.log(`[devMenu] ✅ 元素 ${elementId} 获取到 ${options.length} 个选项:`, options);
        const optionsText = options.map((opt, idx) => `  ${idx + 1}. ${opt}`).join("\n");
        allResults.push(`元素 ${elementId}:
  选项数量: ${options.length}
${optionsText}`);
      } catch (error) {
        console.error(`[devMenu] ❌ 元素 ${elementId} 失败:`, error);
        allResults.push(
          `元素 ${elementId}: ❌ ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
    electron.dialog.showMessageBox(index$2.g(), {
      type: "info",
      title: "Get Dropdown Options 测试 - 结果",
      message: `找到 ${selectIds.length} 个 SELECT 元素`,
      detail: allResults.join("\n\n" + "=".repeat(60) + "\n\n")
    });
    console.log("[devMenu] ==================== Get Dropdown Options 结束 ====================");
  } catch (error) {
    console.error("[devMenu] ❌ 测试失败:", error);
    electron.dialog.showMessageBox(index$2.g(), {
      type: "error",
      title: "Get Dropdown Options 测试失败",
      message: error instanceof Error ? error.message : String(error)
    });
  }
}
async function selectDropdownOptionAction() {
  console.log("[devMenu] ==================== Select Dropdown Option 开始 ====================");
  try {
    const tabManager = index$2.C.getInstance().createController("system");
    const activeTab = tabManager.currentTab;
    if (!activeTab) {
      electron.dialog.showMessageBox(index$2.g(), {
        type: "warning",
        title: "Select Dropdown Option 测试",
        message: "没有活动的标签页"
      });
      return;
    }
    console.log("[devMenu] 当前标签页:", activeTab.id, activeTab.url);
    console.log("[devMenu] 获取交互元素...");
    const interactiveResult = await activeTab.getInteractiveElements();
    const elements = interactiveResult.elements;
    const { isSelectElement } = await Promise.resolve().then(() => require("./index-vXB5mSwm.js")).then((n) => n.a6);
    const selectIds = [];
    for (const [id, element2] of elements) {
      if (isSelectElement(element2)) {
        selectIds.push(id);
        console.log("[devMenu] ✅ 找到 SELECT 元素:", id);
      }
    }
    console.log("[devMenu] 总共找到", selectIds.length, "个 SELECT 元素");
    if (selectIds.length === 0) {
      electron.dialog.showMessageBox(index$2.g(), {
        type: "info",
        title: "Select Dropdown Option 测试",
        message: "当前页面没有找到下拉框元素"
      });
      return;
    }
    const elementId = selectIds[0];
    console.log(`[devMenu] 自动选择元素 ${elementId}`);
    const element = await activeTab.getInteractiveElement(elementId);
    if (!element) {
      electron.dialog.showMessageBox(index$2.g(), {
        type: "error",
        title: "Select Dropdown Option 测试",
        message: `元素 ${elementId} 未找到`
      });
      return;
    }
    console.log("[devMenu] 使用 CDP 获取选项...");
    const backendNodeId = element.backendNodeId;
    const cdpDebugger = activeTab.getView().webContents.debugger;
    const resolved = await cdpDebugger.sendCommand("DOM.resolveNode", { backendNodeId });
    const objectId = resolved.object?.objectId;
    if (!objectId) {
      electron.dialog.showMessageBox(index$2.g(), {
        type: "error",
        title: "Select Dropdown Option 测试",
        message: "无法解析元素的 objectId"
      });
      return;
    }
    const result = await cdpDebugger.sendCommand("Runtime.callFunctionOn", {
      objectId,
      functionDeclaration: `
        function() {
          if (!this || this.tagName !== 'SELECT') return [];
          return Array.from(this.options).map(function(opt, idx) {
            return {
              index: idx,
              text: opt.text.trim(),
              value: opt.value,
              selected: opt.selected
            };
          });
        }
      `,
      returnByValue: true
    });
    const options = result.result?.value || [];
    console.log(`[devMenu] 获取到 ${options.length} 个选项:`, options);
    if (options.length === 0) {
      electron.dialog.showMessageBox(index$2.g(), {
        type: "info",
        title: "Select Dropdown Option 测试",
        message: "该下拉框没有选项"
      });
      return;
    }
    const randomIndex = Math.floor(Math.random() * options.length);
    const selectedOption = options[randomIndex];
    const valueToSet = selectedOption.value;
    console.log(
      `[devMenu] 🎲 随机选择选项 [${randomIndex}] "${selectedOption.text}" (value: "${valueToSet}")`
    );
    console.log("[devMenu] 调用 element.selectByValue()...");
    const { isSelectElement: isSelect } = await Promise.resolve().then(() => require("./index-vXB5mSwm.js")).then((n) => n.a6);
    if (!isSelect(element)) {
      throw new Error("元素类型验证失败");
    }
    const setResult = await element.selectByValue(valueToSet);
    console.log("[devMenu] 选择结果:", setResult);
    console.log("[devMenu] 选择成功:", setResult.success);
    const optionsText = options.map(
      (opt) => `${opt.index === randomIndex ? "🎯 " : ""}[${opt.index}] ${opt.text}${opt.value !== opt.text ? ` (value: ${opt.value})` : ""}${opt.selected ? " ✓" : ""}`
    ).join("\n");
    if (setResult.success) {
      electron.dialog.showMessageBox(index$2.g(), {
        type: "info",
        title: "Select Dropdown Option 测试 - 成功 ✅",
        message: `成功设置下拉框选项（随机选择）`,
        detail: `元素 ID: ${elementId}
随机选择: [${randomIndex}] ${selectedOption.text}
选项值: ${valueToSet}

所有选项:
${optionsText}

${setResult.toPrompt ? setResult.toPrompt() : "操作完成"}`
      });
    } else {
      electron.dialog.showMessageBox(index$2.g(), {
        type: "error",
        title: "Select Dropdown Option 测试 - 失败 ❌",
        message: "设置下拉框选项失败",
        detail: `元素 ID: ${elementId}
尝试选择: [${randomIndex}] ${selectedOption.text}
选项值: ${valueToSet}

错误: ${setResult.error?.message || "未知错误"}`
      });
    }
    console.log("[devMenu] ==================== Select Dropdown Option 结束 ====================");
  } catch (error) {
    console.error("[devMenu] ❌ 测试失败:", error);
    electron.dialog.showMessageBox(index$2.g(), {
      type: "error",
      title: "Select Dropdown Option 测试失败",
      message: error instanceof Error ? error.message : String(error)
    });
  }
}
async function scrollDownAction() {
  const activeTab = index$2.t.currentTab;
  if (!activeTab) {
    electron.dialog.showMessageBox(index$2.g(), {
      type: "warning",
      title: "Scroll Down 测试",
      message: "没有活动的标签页"
    });
    return;
  }
  try {
    console.log(`[Scroll Test] 开始向下滚动测试 - 标签页: ${activeTab.id}, URL: ${activeTab.url}`);
    const result = await activeTab.scroll("down", 3);
    console.log(`[Scroll Test] 滚动完成:`, result);
    electron.dialog.showMessageBox(index$2.g(), {
      type: result.success ? "info" : "error",
      title: "Scroll Down 测试结果",
      message: result.success ? "向下滚动成功" : "向下滚动失败",
      detail: `标签页: ${activeTab.id}
URL: ${activeTab.url}

${result.toPrompt()}`
    });
  } catch (error) {
    console.error(`[Scroll Test] 向下滚动异常:`, error);
    electron.dialog.showMessageBox(index$2.g(), {
      type: "error",
      title: "Scroll Down 测试失败",
      message: "测试过程中发生错误",
      detail: error instanceof Error ? error.message : String(error)
    });
  }
}
async function scrollUpAction() {
  const activeTab = index$2.t.currentTab;
  if (!activeTab) {
    electron.dialog.showMessageBox(index$2.g(), {
      type: "warning",
      title: "Scroll Up 测试",
      message: "没有活动的标签页"
    });
    return;
  }
  try {
    console.log(`[Scroll Test] 开始向上滚动测试 - 标签页: ${activeTab.id}, URL: ${activeTab.url}`);
    const result = await activeTab.scroll("up", 3);
    console.log(`[Scroll Test] 滚动完成:`, result);
    electron.dialog.showMessageBox(index$2.g(), {
      type: result.success ? "info" : "error",
      title: "Scroll Up 测试结果",
      message: result.success ? "向上滚动成功" : "向上滚动失败",
      detail: `标签页: ${activeTab.id}
URL: ${activeTab.url}

${result.toPrompt()}`
    });
  } catch (error) {
    console.error(`[Scroll Test] 向上滚动异常:`, error);
    electron.dialog.showMessageBox(index$2.g(), {
      type: "error",
      title: "Scroll Up 测试失败",
      message: "测试过程中发生错误",
      detail: error instanceof Error ? error.message : String(error)
    });
  }
}
async function scrollCustomAction() {
  const activeTab = index$2.t.currentTab;
  if (!activeTab) {
    electron.dialog.showMessageBox(index$2.g(), {
      type: "warning",
      title: "Custom Scroll 测试",
      message: "没有活动的标签页"
    });
    return;
  }
  const { response: directionResponse } = await electron.dialog.showMessageBox(index$2.g(), {
    type: "question",
    title: "Custom Scroll 测试 - 选择方向",
    message: "请选择滚动方向:",
    buttons: ["向下 (Down)", "向上 (Up)", "取消"],
    defaultId: 0,
    cancelId: 2
  });
  if (directionResponse === 2) return;
  const direction = directionResponse === 0 ? "down" : "up";
  const { response: amountResponse } = await electron.dialog.showMessageBox(index$2.g(), {
    type: "question",
    title: "Custom Scroll 测试 - 选择滚动量",
    message: `请选择滚动量（视口高度倍数）:`,
    detail: `方向: ${direction === "down" ? "向下" : "向上"}`,
    buttons: ["1倍", "2倍", "3倍", "5倍", "取消"],
    defaultId: 2,
    cancelId: 4
  });
  if (amountResponse === 4) return;
  const amounts = [1, 2, 3, 5];
  const amount = amounts[amountResponse];
  try {
    console.log(
      `[Scroll Test] 开始自定义滚动测试 - 方向: ${direction}, 量: ${amount}, 标签页: ${activeTab.id}`
    );
    const result = await activeTab.scroll(direction, amount);
    console.log(`[Scroll Test] 滚动完成:`, result);
    electron.dialog.showMessageBox(index$2.g(), {
      type: result.success ? "info" : "error",
      title: "Custom Scroll 测试结果",
      message: result.success ? `${direction === "down" ? "向下" : "向上"}滚动 ${amount} 倍成功` : "滚动失败",
      detail: `标签页: ${activeTab.id}
URL: ${activeTab.url}
方向: ${direction}
滚动量: ${amount}倍视口高度

${result.toPrompt()}`
    });
  } catch (error) {
    console.error(`[Scroll Test] 自定义滚动异常:`, error);
    electron.dialog.showMessageBox(index$2.g(), {
      type: "error",
      title: "Custom Scroll 测试失败",
      message: "测试过程中发生错误",
      detail: error instanceof Error ? error.message : String(error)
    });
  }
}
const tabPreviewDevToolsAction = {
  label: "🚧 Tab Preview: Open DevTools",
  accelerator: "CmdOrCtrl+Shift+P",
  click: () => {
    const manager = index$2.e.getInstance();
    manager.openDevTools();
    console.log("🚧 [DevMenu] Tab Preview Overlay DevTools opened");
  }
};
const tabBorderOverlayDevToolsAction = {
  label: "🔲 Tab Border Overlay: DevTools",
  click: () => {
    index$2.f.openDevTools();
    console.log("[DevMenu] Tab Border Overlay DevTools toggled");
  }
};
const tabBorderOverlayTestAction = {
  label: "🧪 Tab Border: 测试显示（旋转+锁定）",
  click: () => {
    index$2.f.testShowBorder(true, true);
    console.log("[DevMenu] Testing border: rotating + blocking");
  }
};
const tabBorderOverlayTestStaticAction = {
  label: "🧪 Tab Border: 测试显示（静态+穿透）",
  click: () => {
    index$2.f.testShowBorder(false, false);
    console.log("[DevMenu] Testing border: static + passthrough");
  }
};
const tabBorderOverlayDebugInfoAction = {
  label: "📊 Tab Border: 打印调试信息",
  click: () => {
    const info = index$2.f.getDebugInfo();
    console.log("[DevMenu] Tab Border Debug Info:", info);
  }
};
const testTabOperatingAction = {
  label: "🤖 Test: Set Tab Operating (模拟 Agent 操作中)",
  click: () => {
    const currentTab = index$2.t.currentTab;
    if (!currentTab) {
      electron.dialog.showMessageBox({
        type: "warning",
        title: "No Tab",
        message: "当前没有活动的 tab",
        detail: "请先打开一个 tab"
      });
      return;
    }
    console.log("[DevMenu] Setting tab to operating state:", currentTab.id);
    currentTab.acquireOwnership();
    console.log("[DevMenu] ✅ Tab is now operating:", {
      tabId: currentTab.id,
      url: currentTab.url,
      ownerId: currentTab.ownerId
    });
    electron.dialog.showMessageBox({
      type: "info",
      title: "Tab Operating",
      message: "✅ Tab 已设置为操作中",
      detail: `Tab ID: ${currentTab.id}
URL: ${currentTab.url}

现在应该：
1. 边框旋转
2. 阻挡点击
3. 可以双击暂停`
    });
  }
};
const stopTabOperatingAction = {
  label: "⏸️ Test: Stop Tab Operating (停止操作)",
  click: () => {
    const currentTab = index$2.t.currentTab;
    if (!currentTab) {
      return;
    }
    console.log("[DevMenu] Stopping tab operating:", currentTab.id);
    currentTab.releaseOwnership();
    console.log("[DevMenu] ✅ Tab operating stopped:", {
      tabId: currentTab.id
    });
    electron.dialog.showMessageBox({
      type: "info",
      title: "Tab Operating Stopped",
      message: "✅ Tab 操作已停止",
      detail: "边框应该变为静态（不旋转、不阻挡点击）"
    });
  }
};
class AppAliveScheduler {
  constructor(store, driver) {
    this.store = store;
    this.driver = driver;
  }
  // 内部存储使用 unknown，类型安全由 type 字符串在运行时保证
  handlers = /* @__PURE__ */ new Map();
  // ============ 公开 API ============
  async init() {
    await this.store.init();
    const jobs = await this.store.find();
    for (const job of jobs) {
      await this.activateJob(job);
    }
  }
  register(type, onTrigger, onExpired) {
    this.handlers.set(type, { onTrigger, onExpired });
  }
  async add(type, schedule, payload, options) {
    if (schedule.type === "once" && new Date(schedule.at) <= /* @__PURE__ */ new Date()) {
      throw new Error(`Cannot schedule job in the past: ${schedule.at}`);
    }
    const snapshot = this.buildSnapshot(type, schedule, payload, options?.metadata);
    await this.store.save(snapshot);
    await this.activateJob(snapshot);
    return this.wrapJob(snapshot);
  }
  async get(jobId) {
    const snapshot = await this.store.get(jobId);
    return snapshot ? this.wrapJob(snapshot) : null;
  }
  async list(query) {
    const snapshots = await this.store.find(query);
    return snapshots.map((s) => this.wrapJob(s));
  }
  // ============ 内部方法 ============
  /** 构建 snapshot (纯数据) */
  buildSnapshot(type, schedule, payload, metadata) {
    return {
      id: uuid.v4(),
      type,
      schedule,
      payload,
      createdAt: /* @__PURE__ */ new Date(),
      metadata: metadata || {},
      lastScheduledAt: null,
      nextRunAt: null
    };
  }
  /** 激活任务：启动 driver 调度 */
  async activateJob(snapshot) {
    if (this.isExpired(snapshot)) {
      console.warn(`[Scheduler] Job ${snapshot.id} (${snapshot.type}) expired, removing.`);
      await this.handleExpired(snapshot);
      return;
    }
    const trigger = snapshot.schedule.type === "cron" ? snapshot.schedule.expression : new Date(snapshot.schedule.at);
    this.driver.start(snapshot.id, trigger, (ctx) => {
      void this.onTriggered(snapshot, ctx);
    });
  }
  /** 任务触发回调 */
  async onTriggered(snapshot, ctx) {
    const handlers = this.handlers.get(snapshot.type);
    if (!handlers) {
      console.warn(`[Scheduler] No handler for type: ${snapshot.type}`);
      return;
    }
    await handlers.onTrigger(snapshot.payload, {
      jobId: snapshot.id,
      scheduledAt: ctx.scheduledAt,
      triggeredAt: ctx.triggeredAt
    });
    if (snapshot.schedule.type === "once") {
      await this.store.remove(snapshot.id);
    }
  }
  async handleExpired(snapshot) {
    const handlers = this.handlers.get(snapshot.type);
    if (handlers?.onExpired) {
      const scheduledAt = snapshot.schedule.type === "once" ? new Date(snapshot.schedule.at) : /* @__PURE__ */ new Date();
      await handlers.onExpired(snapshot.payload, {
        jobId: snapshot.id,
        scheduledAt,
        expiredAt: /* @__PURE__ */ new Date()
      });
    }
    await this.store.remove(snapshot.id);
  }
  /** 判断是否过期 */
  isExpired(snapshot) {
    return snapshot.schedule.type === "once" && new Date(snapshot.schedule.at) <= /* @__PURE__ */ new Date();
  }
  /** 包装为 IScheduledJob */
  wrapJob(snapshot) {
    return {
      ...snapshot,
      toSnapshot: () => snapshot,
      update: async (updates) => {
        const newSnapshot = { ...snapshot, ...updates };
        await this.store.save(newSnapshot);
        this.driver.stop(snapshot.id);
        await this.activateJob(newSnapshot);
      },
      remove: async () => {
        this.driver.stop(snapshot.id);
        await this.store.remove(snapshot.id);
      }
    };
  }
}
const STORE_FILENAME = "schedulerJobs.json";
const STORE_DIR = "data/scheduler";
class JsonMetaStore {
  filePath = "";
  data = { jobs: {} };
  async init() {
    this.filePath = path.join(electron.app.getPath("userData"), STORE_DIR, STORE_FILENAME);
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (fs.existsSync(this.filePath)) {
      const content = fs.readFileSync(this.filePath, "utf-8");
      this.data = JSON.parse(content);
    } else {
      this.data = { jobs: {} };
      this.persist();
    }
  }
  persist() {
    fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), "utf-8");
  }
  async save(snapshot) {
    this.data.jobs[snapshot.id] = snapshot;
    this.persist();
  }
  async get(jobId) {
    return this.data.jobs[jobId] || null;
  }
  async remove(jobId) {
    if (this.data.jobs[jobId]) {
      delete this.data.jobs[jobId];
      this.persist();
    }
  }
  async find(query) {
    const jobs = Object.values(this.data.jobs);
    if (!query) {
      return jobs;
    }
    return jobs.filter((job) => {
      if (query.type && job.type !== query.type) {
        return false;
      }
      if (query.metadata) {
        const queryMeta = query.metadata;
        const jobMeta = job.metadata || {};
        for (const [key, value] of Object.entries(queryMeta)) {
          if (jobMeta[key] !== value) {
            return false;
          }
        }
      }
      if (query.scheduleType && job.schedule.type !== query.scheduleType) {
        return false;
      }
      if (query.nextRunAt && job.nextRunAt) {
        const { after, before } = query.nextRunAt;
        const nextRun = new Date(job.nextRunAt).getTime();
        if (after && nextRun <= after.getTime()) {
          return false;
        }
        if (before && nextRun >= before.getTime()) {
          return false;
        }
      }
      return true;
    });
  }
}
class NodeCronDriver {
  // 维护 jobId -> CronJob 的映射
  jobs = /* @__PURE__ */ new Map();
  /**
   * 启动调度
   * @param id 唯一标识 (用于后续停止)
   * @param trigger Cron 表达式或 Date 对象
   * @param action 触发时的回调
   */
  start(id, trigger, action) {
    this.stop(id);
    if (typeof trigger === "string") {
      const validation = cron.validateCronExpression(trigger);
      if (!validation.valid) {
        throw new Error(
          `[NodeCronDriver] Invalid cron expression for job ${id}: ${validation.error}`
        );
      }
    }
    const job = cron.CronJob.from({
      cronTime: trigger,
      onTick: () => {
        const triggeredAt = /* @__PURE__ */ new Date();
        const scheduledAt = trigger instanceof Date ? trigger : job.lastDate() ?? triggeredAt;
        action({ scheduledAt, triggeredAt });
        if (trigger instanceof Date) {
          this.stop(id);
        }
      },
      start: true
    });
    this.jobs.set(id, job);
  }
  /**
   * 停止调度
   */
  stop(id) {
    const job = this.jobs.get(id);
    if (job) {
      job.stop();
      this.jobs.delete(id);
    }
  }
  /**
   * 停止所有
   */
  stopAll() {
    for (const job of this.jobs.values()) {
      job.stop();
    }
    this.jobs.clear();
  }
}
let schedulerInstance = null;
function getScheduler() {
  if (!schedulerInstance) {
    const store = new JsonMetaStore();
    const driver = new NodeCronDriver();
    schedulerInstance = new AppAliveScheduler(store, driver);
  }
  return schedulerInstance;
}
const index = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({ __proto__: null, getScheduler }, Symbol.toStringTag, { value: "Module" }));
let testWindow = null;
function openSchedulerTestWindow() {
  if (testWindow) {
    testWindow.focus();
    return;
  }
  testWindow = new electron.BrowserWindow({
    width: 900,
    height: 700,
    title: "Scheduler Debugger",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(index$1.g(), "../preload/schedulerTest.js"),
      sandbox: false
    }
  });
  if (utils.is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    testWindow.loadURL(`${process.env["ELECTRON_RENDERER_URL"]}/schedulerTest/index.html`);
  } else {
    testWindow.loadFile(path.join(index$1.g(), "../renderer/schedulerTest/index.html"));
  }
  testWindow.on("closed", () => {
    testWindow = null;
    electron.ipcMain.removeHandler("scheduler-test:get-jobs");
    electron.ipcMain.removeHandler("scheduler-test:add-job");
    electron.ipcMain.removeHandler("scheduler-test:remove-job");
  });
  registerIpcHandlers();
  const scheduler = getScheduler();
  scheduler.register("test-job", async (payload, ctx) => {
    console.log("[SchedulerDebug] Job Triggered:", payload, ctx);
    if (testWindow && !testWindow.isDestroyed()) {
      testWindow.webContents.send("scheduler-test:log", `Triggered: ${ctx.jobId}`);
    }
  });
}
function registerIpcHandlers() {
  const scheduler = getScheduler();
  electron.ipcMain.handle("scheduler-test:get-jobs", async () => {
    const jobs = await scheduler.list();
    return jobs.map((job) => job.toSnapshot());
  });
  electron.ipcMain.handle("scheduler-test:add-job", async (_, { type, schedule, payload, metadata }) => {
    await scheduler.add(type, schedule, payload, { metadata });
  });
  electron.ipcMain.handle("scheduler-test:remove-job", async (_, id) => {
    return await scheduler.get(id).then((job) => job?.remove());
  });
}
const schedulerDebuggerAction = {
  label: "Scheduler 调试器",
  click: () => {
    openSchedulerTestWindow();
  }
};
function getDevMenuItems() {
  const devAccelerator = (key) => utils.is.dev ? key : void 0;
  return {
    label: "开发者",
    submenu: [
      {
        label: "切换 主窗口 DevTools",
        accelerator: devAccelerator(process.platform === "darwin" ? "Cmd+Alt+I" : "Ctrl+Alt+I"),
        click: () => {
          const baseView = index$2.B.getInstance().getView();
          if (baseView.webContents.isDevToolsOpened()) baseView.webContents.closeDevTools();
          else baseView.webContents.openDevTools({ mode: "undocked" });
        }
      },
      {
        label: "切换 当前标签 DevTools",
        accelerator: devAccelerator(process.platform === "darwin" ? "Cmd+Shift+D" : "Ctrl+Shift+D"),
        click: () => {
          const activeTab = index$2.t.currentTab;
          if (activeTab) {
            activeTab.toggleDevTools();
          }
        }
      },
      {
        label: "切换 侧边栏 DevTools",
        accelerator: devAccelerator(process.platform === "darwin" ? "Cmd+Shift+S" : "Ctrl+Shift+S"),
        click: () => {
          const wc = index$2.s.getWebContents();
          if (!wc) return;
          if (wc.isDevToolsOpened()) wc.closeDevTools();
          else wc.openDevTools({ mode: "undocked" });
        }
      },
      {
        label: "切换 AgentWidget DevTools",
        click: () => {
          index$2.h.toggleDevTools();
        }
      },
      {
        label: "切换 TabNavigationBar DevTools",
        click: () => {
          index$2.j.toggleDevTools();
        }
      },
      {
        label: "切换 UpdateToast DevTools",
        click: () => {
          index$2.u.toggleDevTools();
        }
      },
      {
        label: "切换 登录模态窗口 DevTools",
        click: () => {
          index$2.L.getInstance().toggleDevTools();
        }
      },
      {
        label: "切换 Reward Page DevTools",
        click: async () => {
          try {
            const { rewardPage } = await Promise.resolve().then(() => require("./index-vXB5mSwm.js")).then((n) => n.ac);
            rewardPage.toggleDevTools();
            console.log("[DevMenu] Reward Page DevTools 已切换");
          } catch (error) {
            console.error("[DevMenu] 打开 Reward Page DevTools 失败:", error);
          }
        }
      },
      {
        label: "切换 Agent Guide DevTools",
        click: async () => {
          try {
            const { agentGuide } = await Promise.resolve().then(() => require("./index-vXB5mSwm.js")).then((n) => n.ad);
            agentGuide.toggleDevTools();
            console.log("[DevMenu] Agent Guide DevTools 已切换");
          } catch (error) {
            console.error("[DevMenu] 打开 Agent Guide DevTools 失败:", error);
          }
        }
      },
      {
        label: "切换 Gate 页面 DevTools",
        click: () => {
          const wc = index$2.w.getWebContents();
          if (!wc) return;
          if (wc.isDevToolsOpened()) wc.closeDevTools();
          else wc.openDevTools({ mode: "undocked" });
          console.log("[DevMenu] Gate 页面 DevTools 已切换");
        }
      },
      schedulerDebuggerAction,
      tabPreviewDevToolsAction,
      // 🚧 DEV MODE - 临时
      tabBorderOverlayDevToolsAction,
      { type: "separator" },
      {
        label: "Teach Mode Dialog 测试",
        submenu: [
          {
            label: "显示 Start Mode (Teach Mode)",
            click: () => {
              electron.ipcMain.emit("teach-mode-dialog:show", null, "start", { status: "idle" });
              console.log("[DevMenu] Teach Mode Dialog - Start Mode 已打开");
            }
          },
          {
            label: "显示 Complete Mode (测试数据)",
            click: () => {
              const testState = {
                status: "completed",
                events: [
                  {
                    timestamp: Date.now(),
                    type: "navigation",
                    url: "https://github.com/flowith"
                  },
                  {
                    timestamp: Date.now() + 1e3,
                    type: "click",
                    url: "https://twitter.com/flowith"
                  },
                  {
                    timestamp: Date.now() + 2e3,
                    type: "input",
                    url: "https://google.com"
                  }
                ],
                eventCount: 3
              };
              electron.ipcMain.emit("teach-mode-dialog:show", null, "complete", testState);
              console.log("[DevMenu] Teach Mode Dialog - Complete Mode 已打开");
            }
          },
          {
            label: "切换 Teach Mode Dialog DevTools",
            click: () => {
              const wc = index$2.k.getWebContents();
              if (!wc) {
                console.warn("[DevMenu] Teach Mode Dialog WebContents 不存在");
                return;
              }
              if (wc.isDevToolsOpened()) wc.closeDevTools();
              else wc.openDevTools({ mode: "undocked" });
              console.log("[DevMenu] Teach Mode Dialog DevTools 已切换");
            }
          }
        ]
      },
      { type: "separator" },
      {
        label: "Tab Border & Agent 测试",
        submenu: [
          testTabOperatingAction,
          stopTabOperatingAction,
          { type: "separator" },
          tabBorderOverlayTestAction,
          tabBorderOverlayTestStaticAction,
          tabBorderOverlayDebugInfoAction
        ]
      },
      { type: "separator" },
      {
        label: "显示 Reward Page",
        accelerator: devAccelerator(process.platform === "darwin" ? "Cmd+Shift+R" : "Ctrl+Shift+R"),
        click: async () => {
          try {
            const { rewardPage } = await Promise.resolve().then(() => require("./index-vXB5mSwm.js")).then((n) => n.ac);
            rewardPage.show();
            console.log("[DevMenu] Reward Page 已显示");
          } catch (error) {
            console.error("[DevMenu] 显示 Reward Page 失败:", error);
            electron.dialog.showMessageBox(index$2.g(), {
              type: "error",
              title: "Reward Page",
              message: "无法显示 Reward Page",
              detail: String(error)
            });
          }
        }
      },
      {
        label: "显示 Gate 页面",
        accelerator: devAccelerator(process.platform === "darwin" ? "Cmd+Shift+G" : "Ctrl+Shift+G"),
        click: () => {
          index$2.w.show();
          console.log("[DevMenu] Gate 页面已显示");
        }
      },
      {
        label: "关闭 Gate 页面",
        click: () => {
          index$2.w.hide();
          console.log("[DevMenu] Gate 页面已关闭");
        }
      },
      { type: "separator" },
      {
        label: "打印终端快照",
        click: () => {
          const activeTab = index$2.t.currentTab;
          if (activeTab && activeTab.id) {
            index$2.l.printSnapshot(activeTab.id);
          } else {
            index$2.l.printSnapshot();
          }
        }
      },
      {
        label: "打印 OAuth 弹窗信息",
        accelerator: devAccelerator(process.platform === "darwin" ? "Cmd+Shift+P" : "Ctrl+Shift+P"),
        click: () => {
          console.log("\n========== OAuth 弹窗调试信息 ==========");
          console.log("时间:", (/* @__PURE__ */ new Date()).toLocaleString());
          const allTabs = index$2.t.tabs;
          console.log("总标签页数:", allTabs.length);
          let totalPopups = 0;
          allTabs.forEach((tab, index2) => {
            const popupInfo = tab.getPopupInfo?.();
            if (popupInfo && popupInfo.popupCount > 0) {
              totalPopups += popupInfo.popupCount;
              console.log(`
标签页 ${index2 + 1}:`, {
                id: tab.id,
                url: tab.url,
                title: tab.title,
                弹窗数量: popupInfo.popupCount,
                弹窗详情: popupInfo.popups
              });
            }
          });
          if (totalPopups === 0) {
            console.log("\n当前没有活动的OAuth弹窗");
          } else {
            console.log(`
总弹窗数: ${totalPopups}`);
          }
          console.log("========================================\n");
          electron.dialog.showMessageBox(index$2.g(), {
            type: "info",
            title: "OAuth 弹窗信息",
            message: `当前活动弹窗: ${totalPopups} 个`,
            detail: totalPopups === 0 ? '当前没有活动的OAuth弹窗。\n\n提示：在第三方网站（如Twitter）点击"Sign in with Google"后，会创建OAuth弹窗。' : `详细信息已打印到控制台。
打开主窗口开发者工具 (Cmd+Alt+I) 查看完整信息。`
          });
        }
      },
      { type: "separator" },
      {
        label: "Human Input 调试",
        submenu: [
          {
            label: "切换 Human Input DevTools",
            accelerator: devAccelerator(
              process.platform === "darwin" ? "Cmd+Shift+H" : "Ctrl+Shift+H"
            ),
            click: async () => {
              try {
                const { humanInput } = await Promise.resolve().then(() => require("./index-vXB5mSwm.js")).then((n) => n.a9);
                humanInput.toggleDevTools();
                console.log("[DevMenu] Human Input DevTools 已切换");
              } catch (error) {
                console.error("[DevMenu] 打开 Human Input DevTools 失败:", error);
                electron.dialog.showMessageBox(index$2.g(), {
                  type: "error",
                  title: "Human Input DevTools",
                  message: "无法打开 DevTools",
                  detail: String(error)
                });
              }
            }
          },
          {
            label: "查看队列状态",
            click: async () => {
              try {
                const { humanInputQueueManager } = await Promise.resolve().then(() => require("./index-vXB5mSwm.js")).then((n) => n.aa);
                const snapshot = humanInputQueueManager.getQueueSnapshot();
                const win = index$2.g();
                if (!win) return;
                const details = [
                  `总计请求: ${snapshot.totalCount}`,
                  `活动请求: ${snapshot.activeRequest ? snapshot.activeRequest.requestId : "无"}`,
                  snapshot.activeRequest ? `  - 任务: ${snapshot.activeRequest.taskId}` : "",
                  snapshot.activeRequest ? `  - 提示: ${snapshot.activeRequest.prompt}` : "",
                  snapshot.activeRequest ? `  - 类型: ${snapshot.activeRequest.type}` : "",
                  `等待队列: ${snapshot.pendingRequests.length} 个请求`,
                  ...snapshot.pendingRequests.map(
                    (req, idx) => `  ${idx + 1}. ${req.requestId.substring(0, 20)}... (${req.taskId.substring(0, 20)}...)`
                  )
                ].filter(Boolean).join("\n");
                electron.dialog.showMessageBox(win, {
                  type: "info",
                  title: "Human Input 队列状态",
                  message: `当前队列状态 (${(/* @__PURE__ */ new Date()).toLocaleTimeString()})`,
                  detail: details
                });
                console.log("[DevMenu] Human Input 队列状态:", snapshot);
              } catch (error) {
                console.error("[DevMenu] 获取队列状态失败:", error);
                electron.dialog.showMessageBox(index$2.g(), {
                  type: "error",
                  title: "队列状态",
                  message: "获取队列状态失败",
                  detail: String(error)
                });
              }
            }
          },
          {
            label: "测试 Human Input (文本输入)",
            click: async () => {
              try {
                const { humanInputQueueManager } = await Promise.resolve().then(() => require("./index-vXB5mSwm.js")).then((n) => n.aa);
                const testRequestId = `test_${Date.now()}_text`;
                const testTaskId = `task_debug_${Date.now()}`;
                console.log("[DevMenu] 创建测试 Human Input 请求 (文本):", testRequestId);
                humanInputQueueManager.registerTaskPrompt(testTaskId, "搜索 GitHub 上的热门项目");
                const promise = humanInputQueueManager.enqueue(
                  testRequestId,
                  testTaskId,
                  "请输入您想搜索的编程语言（例如：TypeScript, Python, Rust）",
                  "text",
                  void 0,
                  void 0,
                  60
                );
                promise.then((response) => {
                  console.log("[DevMenu] 测试请求收到响应:", response);
                  electron.dialog.showMessageBox(index$2.g(), {
                    type: "info",
                    title: "Human Input 测试结果",
                    message: "测试请求已完成",
                    detail: `用户响应: ${response}`
                  });
                }).catch((error) => {
                  console.error("[DevMenu] 测试请求失败:", error);
                });
              } catch (error) {
                console.error("[DevMenu] 创建测试请求失败:", error);
                electron.dialog.showMessageBox(index$2.g(), {
                  type: "error",
                  title: "Human Input 测试",
                  message: "创建测试请求失败",
                  detail: String(error)
                });
              }
            }
          },
          {
            label: "测试 Human Input (选项)",
            click: async () => {
              try {
                const { humanInputQueueManager } = await Promise.resolve().then(() => require("./index-vXB5mSwm.js")).then((n) => n.aa);
                const testRequestId = `test_${Date.now()}_selection`;
                const testTaskId = `task_debug_${Date.now()}`;
                console.log("[DevMenu] 创建测试 Human Input 请求 (选项):", testRequestId);
                humanInputQueueManager.registerTaskPrompt(testTaskId, "分析用户行为并生成报告");
                const promise = humanInputQueueManager.enqueue(
                  testRequestId,
                  testTaskId,
                  "请选择您希望分析的时间范围：",
                  "selection",
                  ["最近 7 天", "最近 30 天", "最近 90 天", "自定义时间"],
                  "最近 30 天",
                  60
                );
                promise.then((response) => {
                  console.log("[DevMenu] 测试请求收到响应:", response);
                  electron.dialog.showMessageBox(index$2.g(), {
                    type: "info",
                    title: "Human Input 测试结果",
                    message: "测试请求已完成",
                    detail: `用户选择: ${response}`
                  });
                }).catch((error) => {
                  console.error("[DevMenu] 测试请求失败:", error);
                });
              } catch (error) {
                console.error("[DevMenu] 创建测试请求失败:", error);
                electron.dialog.showMessageBox(index$2.g(), {
                  type: "error",
                  title: "Human Input 测试",
                  message: "创建测试请求失败",
                  detail: String(error)
                });
              }
            }
          }
        ]
      },
      { type: "separator" },
      {
        label: "打开用户数据目录",
        click: () => {
          electron.shell.openPath(electron.app.getPath("userData"));
        }
      },
      {
        label: "打开应用日志目录",
        click: () => {
          electron.shell.openPath(path.join(electron.app.getPath("userData")));
        }
      },
      { type: "separator" },
      {
        label: "BrowserControl 测试工具",
        accelerator: devAccelerator(process.platform === "darwin" ? "Cmd+Shift+B" : "Ctrl+Shift+B"),
        click: () => {
          browserControlTestWindow.open();
        }
      },
      { type: "separator" },
      {
        label: "Composer 缓存管理",
        submenu: [
          {
            label: "查看缓存统计",
            click: () => {
              const stats = index$2.m();
              const win = index$2.g();
              if (!win) return;
              const details = [
                `📊 缓存性能统计`,
                ``,
                `✅ 缓存命中: ${stats.hits} 次`,
                `❌ 缓存未命中: ${stats.misses} 次`,
                `📈 命中率: ${stats.hitRate}`,
                ``,
                `💾 已缓存资源: ${stats.cachedCount} 个`,
                `📦 总缓存大小: ${stats.totalSize}`,
                ``,
                `💡 提示:`,
                `- 首次访问时缓存未命中是正常的`,
                `- 后续访问应该看到高命中率（>80%）`,
                `- 命中率高 = 加载速度快`
              ].join("\n");
              console.log("[ComposerCache] 缓存统计:", stats);
              electron.dialog.showMessageBox(win, {
                type: "info",
                title: "Composer 缓存统计",
                message: `当前缓存状态`,
                detail: details,
                buttons: ["关闭", "打开控制台查看详情"]
              }).then((result) => {
                if (result.response === 1) {
                  const baseView = index$2.B.getInstance().getView();
                  if (!baseView.webContents.isDevToolsOpened()) {
                    baseView.webContents.openDevTools({ mode: "undocked" });
                  }
                }
              });
            }
          },
          {
            label: "清除缓存",
            click: async () => {
              try {
                const activeTab = index$2.t.currentTab;
                if (activeTab) {
                  const view = activeTab.getView();
                  await index$2.n(view.webContents.session);
                  index$2.r();
                  electron.dialog.showMessageBox(index$2.g(), {
                    type: "info",
                    title: "缓存已清除",
                    message: "Composer 缓存已成功清除",
                    detail: "下次加载 Composer 时会重新从网络获取资源"
                  });
                }
              } catch (error) {
                console.error("[DevMenu] 清除缓存失败:", error);
                electron.dialog.showMessageBox(index$2.g(), {
                  type: "error",
                  title: "清除失败",
                  message: "清除 Composer 缓存失败",
                  detail: String(error)
                });
              }
            }
          },
          {
            label: "重置统计数据",
            click: () => {
              index$2.r();
              electron.dialog.showMessageBox(index$2.g(), {
                type: "info",
                title: "统计已重置",
                message: "缓存统计数据已重置",
                detail: "计数器已归零，可以重新开始统计"
              });
            }
          }
        ]
      },
      { type: "separator" },
      {
        label: "Action 测试",
        submenu: [
          {
            label: "Scroll Down (向下滚动)",
            click: scrollDownAction
          },
          {
            label: "Scroll Up (向上滚动)",
            click: scrollUpAction
          },
          {
            label: "Scroll Custom (自定义滚动)",
            click: scrollCustomAction
          },
          { type: "separator" },
          {
            label: "Get Dropdown Options (获取下拉框选项)",
            click: getDropdownOptionsAction
          },
          {
            label: "Select Dropdown Option (选择下拉框选项)",
            click: selectDropdownOptionAction
          }
        ]
      }
    ]
  };
}
async function handleSmartTabClose() {
  index$2.v();
  const currentTab = index$2.t.currentTab;
  const allTabs = index$2.t.tabs;
  console.log("[Menu] Command+W pressed:", {
    currentTab: currentTab?.id,
    totalTabs: allTabs.length,
    currentUrl: currentTab?.url
  });
  if (allTabs.length === 0) {
    console.log("[Menu] No tabs, triggering quit confirmation");
    quitHandler.q.triggerQuitFromCmdW();
    return;
  }
  if (currentTab) {
    console.log("[Menu] Closing current tab");
    await index$2.t.closeTab(currentTab.id);
  }
}
async function handleCreateBlankTab() {
  try {
    const newTab = await index$2.t.createTab(void 0, void 0, true);
    console.log("[Menu] Command+T created new tab:", {
      tabId: newTab.id,
      url: newTab.url
    });
  } catch (error) {
    console.error("[Menu] Failed to create blank tab:", error);
  }
}
async function handleCreateTerminalTab() {
  try {
    const newTab = await index$2.t.createTab("flowith://terminal", void 0, true);
    console.log("[Menu] Command+D created terminal tab:", {
      tabId: newTab.id,
      url: newTab.url
    });
  } catch (error) {
    console.error("[Menu] Failed to create terminal tab:", error);
  }
}
async function handleOpenLocalFile() {
  try {
    const mainWindow = index$2.g();
    if (!mainWindow) {
      console.error("[Menu] Main window not found");
      return;
    }
    const { canceled, filePaths } = await electron.dialog.showOpenDialog(mainWindow, {
      title: "Open Local File",
      properties: ["openFile", "multiSelections"],
      filters: index$2.o()
    });
    if (canceled || filePaths.length === 0) {
      return;
    }
    for (const filePath of filePaths) {
      if (!index$2.p(filePath)) {
        electron.dialog.showMessageBox(mainWindow, {
          type: "error",
          title: "Unsupported File Type",
          message: index$2.q(filePath)
        });
        continue;
      }
      const fileUrl = `file://${filePath}`;
      await index$2.t.createTab(fileUrl, void 0, true);
      console.log("[Menu] Opened local file:", { filePath, fileUrl });
    }
  } catch (error) {
    console.error("[Menu] Failed to open local file:", error);
  }
}
let menuAuthListenersInstalled = false;
async function buildUpdateChannelSubmenu() {
  const t = (key, params) => index$4.m.t(key, params);
  try {
    const [{ autoUpdateService }, { getUserAccess, setUserChannel }] = await Promise.all([
      Promise.resolve().then(() => require("./index-CP7J970o.js")).then((n) => n.b),
      Promise.resolve().then(() => require("./appUpdateApi-BCFEadMj.js"))
    ]);
    const access = await getUserAccess().catch(() => ({
      channels: ["stable"],
      currentChannel: "stable"
    }));
    console.log("[Menu] Update Channel access:", access);
    const uiSelected = access.currentChannel || autoUpdateService.getCurrentChannel();
    const channels = ["stable", "beta", "alpha"];
    const latest = access?.latest || {};
    const currentVersion = electron.app.getVersion();
    const items = channels.map((ch) => ({
      label: (() => {
        const base = ch[0].toUpperCase() + ch.slice(1);
        const latestVersion = latest[ch]?.version;
        const hasUpdate = Boolean(latestVersion && latestVersion !== currentVersion);
        return hasUpdate ? `${base} * ${latestVersion}` : base;
      })(),
      type: "radio",
      enabled: access.channels.includes(ch),
      checked: uiSelected === ch,
      click: async () => {
        try {
          console.log("[Menu] Update Channel click:", ch);
          await autoUpdateService.setUpdateChannel(ch);
          void setUserChannel(ch).catch((err) => console.warn("[Menu] setUserChannel failed:", err));
          console.log("[Menu] Trigger manual check for updates with channel:", ch);
          await autoUpdateService.checkManually();
        } catch (err) {
          console.error("[Menu] Update channel change failed:", err);
        }
      }
    }));
    return {
      label: t("menus.application.updateChannel"),
      submenu: items
    };
  } catch (error) {
    console.error("[Menu] buildUpdateChannelSubmenu failed:", error);
    return {
      label: t("menus.application.updateChannel"),
      enabled: false
    };
  }
}
async function createApplicationMenu() {
  index$4.m.setLocale(index$4.l.getLocale());
  const template = [];
  const t = (key, params) => index$4.m.t(key, params);
  if (process.platform === "darwin") {
    const updateChannelMenu = await buildUpdateChannelSubmenu();
    template.push({
      label: electron.app.getName(),
      submenu: [
        {
          label: t("menus.application.about", { appName: electron.app.getName() }),
          role: "about"
        },
        {
          label: t("menus.application.checkForUpdates"),
          click: async () => {
            try {
              const { autoUpdateService } = await Promise.resolve().then(() => require("./index-CP7J970o.js")).then((n) => n.b);
              await autoUpdateService.checkManually();
            } catch (error) {
              console.error("[Menu] 检查更新失败:", error);
            }
          }
        },
        updateChannelMenu,
        { type: "separator" },
        {
          label: t("menus.application.settings"),
          accelerator: "Command+,",
          click: async () => {
            await index$2.t.createTab("flowith://settings/history", void 0, true);
          }
        },
        { type: "separator" },
        {
          label: t("menus.application.services"),
          role: "services",
          submenu: []
        },
        { type: "separator" },
        {
          label: t("menus.application.hide", { appName: electron.app.getName() }),
          accelerator: "Command+H",
          role: "hide"
        },
        {
          label: t("menus.application.hideOthers"),
          accelerator: "Command+Shift+H",
          role: "hideOthers"
        },
        {
          label: t("menus.application.showAll"),
          role: "unhide"
        },
        { type: "separator" },
        {
          label: t("menus.application.quit"),
          accelerator: "Command+Q",
          click: () => {
            quitHandler.q.triggerQuitFromCmdQ();
          }
        }
      ]
    });
  }
  template.push({
    label: t("menus.edit.label"),
    submenu: [
      {
        label: t("menus.edit.undo"),
        accelerator: "CmdOrCtrl+Z",
        role: "undo"
      },
      {
        label: t("menus.edit.redo"),
        accelerator: "Shift+CmdOrCtrl+Z",
        role: "redo"
      },
      { type: "separator" },
      {
        label: t("menus.edit.cut"),
        accelerator: "CmdOrCtrl+X",
        role: "cut"
      },
      {
        label: t("common.copy"),
        accelerator: "CmdOrCtrl+C",
        role: "copy"
      },
      {
        label: t("menus.edit.paste"),
        accelerator: "CmdOrCtrl+V",
        role: "paste"
      },
      {
        label: t("menus.edit.selectAll"),
        accelerator: "CmdOrCtrl+A",
        role: "selectAll"
      }
    ]
  });
  const archiveSubmenu = [
    {
      label: t("menus.view.newTab"),
      accelerator: "CmdOrCtrl+T",
      click: () => {
        void handleCreateBlankTab();
      }
    },
    {
      label: t("menus.view.reopenClosedTab"),
      accelerator: "CmdOrCtrl+Shift+T",
      click: async () => {
        try {
          const reopenedTab = await index$2.t.reopenClosedTab();
          if (reopenedTab) {
            console.log("[Menu] Reopened closed tab:", {
              tabId: reopenedTab.id,
              url: reopenedTab.url
            });
          } else {
            console.log("[Menu] No closed tabs to reopen");
          }
        } catch (error) {
          console.error("[Menu] Failed to reopen closed tab:", error);
        }
      }
    },
    ...process.platform === "darwin" ? [
      {
        label: t("menus.view.newTerminalTab"),
        accelerator: "CmdOrCtrl+D",
        click: () => {
          void handleCreateTerminalTab();
        }
      }
    ] : [],
    {
      label: t("menus.view.openLocalFile"),
      accelerator: "CmdOrCtrl+O",
      click: () => {
        void handleOpenLocalFile();
      }
    },
    { type: "separator" },
    {
      label: t("menus.view.goBack"),
      accelerator: "CmdOrCtrl+[",
      click: () => {
        const activeTab = index$2.t.currentTab;
        if (activeTab) {
          activeTab.goBack();
        }
      }
    },
    {
      label: t("menus.view.goForward"),
      accelerator: "CmdOrCtrl+]",
      click: () => {
        const activeTab = index$2.t.currentTab;
        if (activeTab) {
          activeTab.goForward();
        }
      }
    },
    { type: "separator" },
    {
      label: t("menus.view.viewHistory"),
      accelerator: "CmdOrCtrl+Y",
      click: async () => {
        await index$2.t.createTab("flowith://settings/history", void 0, true);
      }
    },
    {
      label: t("menus.view.viewDownloads"),
      click: async () => {
        await index$2.t.createTab("flowith://settings/download", void 0, true);
      }
    }
  ];
  template.push({
    label: t("menus.view.archive"),
    submenu: archiveSubmenu
  });
  template.push({
    label: t("menus.view.label"),
    submenu: [
      {
        label: t("menus.view.findInPage"),
        accelerator: "CmdOrCtrl+F",
        click: async () => {
          const activeTab = index$2.t.currentTab;
          if (activeTab) await activeTab.findInPage();
        }
      },
      { type: "separator" },
      {
        label: t("menus.view.reload"),
        accelerator: "CmdOrCtrl+R",
        click: () => {
          const activeTab = index$2.t.currentTab;
          if (activeTab) {
            activeTab.refresh();
          }
        }
      },
      {
        label: t("menus.view.forceReload"),
        accelerator: "CmdOrCtrl+Shift+R",
        click: () => {
          const activeTab = index$2.t.currentTab;
          if (activeTab) {
            activeTab.forceRefresh();
          }
        }
      },
      { type: "separator" },
      {
        label: t("menus.view.actualSize"),
        accelerator: "CmdOrCtrl+0",
        click: () => {
          const activeTab = index$2.t.currentTab;
          if (activeTab) {
            activeTab.resetZoom();
          }
        }
      },
      {
        label: t("menus.view.zoomIn"),
        accelerator: "CmdOrCtrl+Plus",
        click: () => {
          const activeTab = index$2.t.currentTab;
          if (activeTab) {
            activeTab.zoomIn();
          }
        }
      },
      {
        label: t("menus.view.zoomOut"),
        accelerator: "CmdOrCtrl+-",
        click: () => {
          const activeTab = index$2.t.currentTab;
          if (activeTab) {
            activeTab.zoomOut();
          }
        }
      },
      { type: "separator" },
      {
        label: t("menus.view.toggleFullScreen"),
        accelerator: process.platform === "darwin" ? "Ctrl+Command+F" : "F11",
        click: () => {
          const mainWindow = index$2.g();
          if (mainWindow) {
            mainWindow.setFullScreen(!mainWindow.isFullScreen());
          }
        }
      }
    ]
  });
  const windowSubmenu = [
    {
      label: t("menus.window.minimize"),
      accelerator: "CmdOrCtrl+M",
      role: "minimize"
    },
    {
      label: t("menus.window.close"),
      accelerator: "CmdOrCtrl+W",
      click: async () => {
        await handleSmartTabClose();
      }
    },
    ...process.platform === "darwin" ? [
      { type: "separator" },
      {
        label: t("menus.window.bringAllToFront"),
        role: "front"
      }
    ] : []
  ];
  for (let i = 1; i <= 9; i++) {
    windowSubmenu.push({
      label: `Switch to Tab ${i}`,
      accelerator: `CmdOrCtrl+${i}`,
      visible: false,
      // Hidden from menu but keyboard shortcut works
      click: () => {
        const allTabs = index$2.t.tabs;
        if (allTabs.length >= i) {
          const targetTab = allTabs[i - 1];
          index$2.t.currentTab = targetTab;
          console.log("[Menu] Switched to tab:", {
            index: i,
            tabId: targetTab.id,
            url: targetTab.url
          });
        }
      }
    });
  }
  template.push({
    label: t("menus.window.label"),
    submenu: windowSubmenu
  });
  if (utils.is.dev) {
    template.push(getDevMenuItems());
  }
  template.push({
    label: t("menus.help.label"),
    submenu: [
      {
        label: t("menus.help.about"),
        click: () => {
          const mainWindow = index$2.g();
          if (mainWindow) {
            electron.dialog.showMessageBox(mainWindow, {
              type: "info",
              title: t("menus.help.about"),
              message: `${electron.app.getName()}`,
              detail: [
                `${t("menus.help.version")} ${electron.app.getVersion()}`,
                "",
                t("menus.help.aboutDescription1"),
                t("menus.help.aboutDescription2"),
                "",
                t("menus.help.copyright"),
                "https://flowith.io"
              ].join("\n"),
              buttons: [t("common.ok")]
            });
          }
        }
      }
    ]
  });
  const menu = electron.Menu.buildFromTemplate(template);
  electron.Menu.setApplicationMenu(menu);
  if (!menuAuthListenersInstalled) {
    menuAuthListenersInstalled = true;
    const refresh = () => {
      void createApplicationMenu();
    };
    mainEventBus.m.on("auth:userInfoUpdate", refresh);
    mainEventBus.m.on("auth:loginSuccess", refresh);
    mainEventBus.m.on("locale:changed", refresh);
  }
}
class TranslationHandler {
  constructor() {
    this.setupIpcHandlers();
  }
  setupIpcHandlers() {
    electron.ipcMain.handle(
      "call-openrouter",
      async (_event, data) => {
        if (data.silent) {
          try {
            const client2 = config.s.getClient();
            const { data: sessionData } = await client2.auth.getSession();
            if (!sessionData.session?.access_token) {
              return { content: "", usage: null };
            }
          } catch {
            return { content: "", usage: null };
          }
        }
        try {
          await index$2.x.ensureLoaded("translation-handler");
          const modeConfigs = index$2.x.getModeConfigMap();
          let finalModel;
          let finalTemperature;
          let finalMaxTokens;
          let isCerebrasModel;
          const requestedModeConfig = data.mode && modeConfigs[data.mode] ? modeConfigs[data.mode] : void 0;
          if (requestedModeConfig) {
            const config2 = requestedModeConfig;
            finalModel = config2.model;
            finalTemperature = data.temperature ?? config2.temperature;
            finalMaxTokens = data.max_tokens ?? (config2.maxTokens || 4e3);
            isCerebrasModel = config2.provider === "cerebras";
            console.log(`[TranslationHandler] 📦 使用模式配置: ${data.mode}`);
          } else if (data.model) {
            finalModel = data.model;
            finalTemperature = data.temperature ?? 0.3;
            finalMaxTokens = data.max_tokens ?? 4e3;
            const provider = index$2.x.getProviderForModel(data.model);
            isCerebrasModel = provider === "cerebras";
            console.log(`[TranslationHandler] 🔧 使用手动指定模型: ${data.model}`);
          } else {
            const config2 = modeConfigs.nlCompletion ?? index$2.y.nlCompletion;
            finalModel = config2.model;
            finalTemperature = data.temperature ?? config2.temperature;
            finalMaxTokens = data.max_tokens ?? 4e3;
            isCerebrasModel = config2.provider === "cerebras";
          }
          const client2 = isCerebrasModel ? index$2.z : index$2.A;
          console.log(
            `[TranslationHandler] 🎯 使用客户端: ${isCerebrasModel ? "Cerebras" : "UniAPI"}`
          );
          const requestParams = {
            model: finalModel,
            messages: data.messages,
            temperature: finalTemperature,
            max_tokens: finalMaxTokens
          };
          const result = await client2.chatCompletion(requestParams);
          return {
            content: result.choices[0].message.content,
            usage: result.usage
          };
        } catch (error) {
          const errorMessage = error.message;
          const isAuthError = errorMessage?.includes("not authenticated") || errorMessage?.includes("User not authenticated");
          if (isAuthError) {
            console.warn("[TranslationHandler] ⚠️ 认证失败 (未登录)");
            if (data.silent) {
              return { content: "", usage: null };
            }
          }
          throw error;
        }
      }
    );
  }
}
class MessageManager {
  handlers = /* @__PURE__ */ new Map();
  /**
   * 注册消息处理器
   * @param type 消息类型
   * @param handler 处理器函数
   * @returns 取消注册函数
   */
  on(type, handler) {
    const typedHandler = handler;
    this.handlers.set(type, typedHandler);
    return () => {
      this.handlers.delete(type);
    };
  }
  /**
   * 调用消息对应的处理器并返回结果
   * @param message 要处理的消息
   * @returns 处理器的返回值
   */
  async invoke(message) {
    const handler = this.handlers.get(message.type);
    if (!handler) {
      throw new Error(`No handler registered for message type: ${message.type}`);
    }
    return await handler(message);
  }
  /**
   * 清空所有处理器
   */
  clear() {
    this.handlers.clear();
  }
  /**
   * 清空指定类型的处理器
   */
  clearType(type) {
    this.handlers.delete(type);
  }
}
var MessageType = /* @__PURE__ */ ((MessageType2) => {
  MessageType2["SYNC_AUTH"] = "syncAuth";
  MessageType2["REQUEST_AUTH"] = "requestAuth";
  MessageType2["PING_PONG"] = "pingPong";
  MessageType2["URL_CHANGE"] = "urlChange";
  return MessageType2;
})(MessageType || {});
class FlowithBrowserBridge {
  messageManager = new MessageManager();
  api;
  isInitialized = false;
  constructor(api2) {
    this.api = api2;
    this.initialize();
  }
  /**
   * 初始化通信桥接
   */
  initialize() {
    if (!this.api || this.isInitialized) return;
    this.api.setCallback(this.onReceiveMessage.bind(this));
    this.isInitialized = true;
  }
  /**
   * 处理接收到的消息
   * @param message 原始消息
   */
  async onReceiveMessage(message) {
    if (message) {
      return await this.messageManager.invoke(message);
    }
  }
  /**
   * 注册消息处理器
   * @param type 消息类型
   * @param handler 处理器函数
   * @returns 取消注册函数
   */
  register(type, handler) {
    return this.messageManager.on(type, handler);
  }
  /**
   * 发送消息并等待响应
   * @param message 要发送的消息
   * @returns 响应消息
   */
  async invoke(message) {
    if (!this.api) {
      throw new Error("Browser API not available");
    }
    return await this.api.send(message);
  }
  /**
   * 检查是否已连接到主进程
   * @returns 连接状态
   */
  isConnected() {
    return Boolean(this.api && this.isInitialized);
  }
  /**
   * 销毁实例，清理资源
   */
  destroy() {
    this.messageManager.clear();
    this.isInitialized = false;
    this.api = void 0;
  }
}
const SEND_CHANNEL = "flowith-browser-to-hypergpt-frontend";
let hypergptFrontendCallback = () => Promise.resolve();
const api = {
  send: async (message) => {
    const targetViewId = message.viewId;
    if (targetViewId) {
      const targetTab = index$2.t.getTab(targetViewId);
      if (targetTab) {
        const targetView = targetTab.getView();
        targetView.webContents.send(SEND_CHANNEL, message);
      }
    } else {
      for (const tab of index$2.t.tabs) {
        const view = tab.getView();
        view.webContents.send(SEND_CHANNEL, message);
      }
    }
  },
  setCallback: (callback) => {
    hypergptFrontendCallback = callback;
  }
};
const HypergptFrontend = new FlowithBrowserBridge(api);
function registerHypergptFrontendHandlers() {
  HypergptFrontend.register(MessageType.PING_PONG, async (message) => {
    if (message.data.type === "ping") {
      return { type: MessageType.PING_PONG, data: { type: "pong" } };
    }
    return void 0;
  });
  HypergptFrontend.register(MessageType.REQUEST_AUTH, async () => {
    const authData = await config.s.getSession();
    return {
      type: MessageType.SYNC_AUTH,
      data: authData ? {
        accessToken: authData.access_token,
        refreshToken: authData.refresh_token
      } : null
    };
  });
  HypergptFrontend.register(MessageType.URL_CHANGE, async ({ viewId, data: { currentUrl } }) => {
    if (!viewId) return;
    mainEventBus.m.emit("tab:urlUpdated", { tabId: viewId, url: currentUrl });
  });
}
function fetchRepos() {
  return config.s.getClient().from("knowledge_repository").select(
    `
      *,
      permission:knowledge_permission(role,from_community),
      source_count:knowledge_source(id.count()),
      status:published_knowledge_repo_version!repo_id(status)
    `
  ).order("created_at", { ascending: false });
}
function insertRepo(title) {
  return config.s.getClient().rpc("create_repo", {
    p_title: title
  });
}
async function uploadSource({
  source,
  metadata,
  previewImg,
  repoId,
  method = "add",
  intelligentSplit = true
  // TODO: @DViridescent 可能未来可以添加一个配置开关来控制是否智能分割
}) {
  const formData = new FormData();
  formData.append("source", source);
  formData.append("metadata", JSON.stringify(metadata));
  if (repoId) formData.append("repoId", repoId);
  if (previewImg) {
    formData.append("previewImg", previewImg);
  }
  formData.append("method", method);
  formData.append("intelligentSplit", intelligentSplit.toString());
  const response = await fetchWithInitHeaders(
    config.g() + "/file/farm",
    {
      method: "POST",
      body: formData
    },
    true
  );
  return response.ok ? {
    data: response.body,
    error: null
  } : {
    data: null,
    error: await response.json()
  };
}
async function fetchWithInitHeaders(input, init, withAuth = true) {
  try {
    const headers = new Headers(init?.headers);
    if (withAuth) {
      try {
        const authData = await config.s.getSession();
        if (authData?.access_token) {
          headers.set("Authorization", authData.access_token);
        }
      } catch (e) {
        console.log("获取认证数据失败:", e);
      }
    }
    const response = await fetch(input, { ...init, headers });
    return response;
  } catch (error) {
    return Promise.reject(error);
  }
}
class KnowledgeBaseManager {
  state = {
    isUploading: false,
    progress: 0,
    currentStep: "",
    totalSteps: 3,
    completedSteps: 0,
    error: null,
    fileName: null,
    startTime: null
  };
  // 缓存：知识库列表与默认仓库
  reposCache = [];
  refreshingRepos = false;
  defaultRepoId = null;
  constructor() {
    mainEventBus.m.on("auth:userInfoUpdate", () => {
      this.prefetchRepos();
    });
  }
  /**
   * 获取当前状态
   */
  getState() {
    return { ...this.state };
  }
  /**
   * 更新状态并广播到所有渲染进程
   */
  updateState(updates) {
    this.state = { ...this.state, ...updates };
    this.broadcastState();
  }
  /**
   * 广播状态到所有渲染进程
   */
  broadcastState() {
    try {
      index$2.B.getInstance().sendIpc("knowledge-base-state-update", this.state);
    } catch (error) {
      console.error("[KnowledgeBaseManager] 无法发送到 baseView:", error);
    }
    try {
      const sidebarWebContents = index$2.s.getWebContents();
      if (sidebarWebContents && !sidebarWebContents.isDestroyed()) {
        sidebarWebContents.send("knowledge-base-state-update", this.state);
      }
    } catch (error) {
      console.error("[KnowledgeBaseManager] 无法获取侧边栏 WebContents:", error);
    }
  }
  /**
   * 开始上传
   */
  startUpload(fileName, totalSteps = 3) {
    this.updateState({
      isUploading: true,
      progress: 0,
      currentStep: "准备上传...",
      totalSteps,
      completedSteps: 0,
      error: null,
      fileName,
      startTime: Date.now()
    });
  }
  /**
   * 更新进度
   */
  updateProgress(progress, step, completedSteps) {
    this.updateState({
      progress: Math.min(Math.max(progress, 0), 100),
      currentStep: step,
      completedSteps: completedSteps !== void 0 ? completedSteps : this.state.completedSteps
    });
  }
  /**
   * 完成上传
   */
  completeUpload() {
    this.updateState({
      progress: 100,
      currentStep: "上传完成！",
      completedSteps: this.state.totalSteps,
      isUploading: false
    });
    setTimeout(() => {
      this.resetUpload();
    }, 2e3);
  }
  /**
   * 上传失败
   */
  failUpload(error) {
    this.updateState({
      isUploading: false,
      error,
      currentStep: "上传失败"
    });
    setTimeout(() => {
      this.resetUpload();
    }, 5e3);
  }
  /**
   * 重置上传状态
   */
  resetUpload() {
    this.updateState({
      isUploading: false,
      progress: 0,
      currentStep: "",
      completedSteps: 0,
      error: null,
      fileName: null,
      startTime: null
    });
  }
  /**
   * 预取知识库列表（后台刷新缓存，不阻塞调用者）
   */
  prefetchRepos() {
    if (this.refreshingRepos) return;
    this.refreshingRepos = true;
    this.refreshReposCache().catch(() => {
    }).finally(() => {
      this.refreshingRepos = false;
    });
  }
  /**
   * 同步获取用于菜单展示的仓库列表（按默认仓库优先排序）。若缓存为空，则返回空数组。
   */
  getReposForMenu() {
    const list = [...this.reposCache];
    if (list.length === 0) return list;
    const defaultId = this.defaultRepoId;
    if (defaultId) {
      list.sort((a, b) => a.id === defaultId ? -1 : b.id === defaultId ? 1 : 0);
    } else {
      list.sort(
        (a, b) => a.title === "Flowith Browser" ? -1 : b.title === "Flowith Browser" ? 1 : 0
      );
    }
    return list;
  }
  /**
   * 返回已知的默认仓库ID（若尚未计算，则为 null）。
   */
  getDefaultRepoIdSync() {
    return this.defaultRepoId;
  }
  /**
   * 上传文本到知识库 - 主要接口
   */
  async uploadText(data) {
    const { text, title, url, hashtags } = data;
    try {
      console.log("[KnowledgeBaseManager] 开始上传知识库内容:", title);
      if (!text?.trim()) {
        throw new Error("文本内容不能为空");
      }
      const fileName = `${title.replace(/[<>:"/\\|?*]/g, "_")}.md`;
      this.startUpload(fileName);
      this.updateProgress(10, "正在准备文件...", 1);
      await this.delay(200);
      const markdownContent = this.formatAsMarkdown(text, { title, url });
      this.updateProgress(30, "正在生成内容...", 1);
      await this.delay(300);
      const sourceMetadata = {
        id: crypto.randomUUID(),
        title,
        preview: markdownContent.substring(0, 200) + (markdownContent.length > 200 ? "..." : ""),
        hashtags: hashtags || "",
        type: "markdown",
        upload_status: "input"
      };
      this.updateProgress(50, "正在获取知识库...", 2);
      const repoId = data.repoId ?? await this.ensureDefaultRepo();
      this.updateProgress(70, "正在上传内容...", 2);
      const sourceFile = new File([markdownContent], fileName, { type: "text/markdown" });
      const uploadResult = await uploadSource({
        source: sourceFile,
        metadata: sourceMetadata,
        method: "add",
        repoId
      });
      if (uploadResult.error) {
        throw new Error(uploadResult.error.message || "上传失败");
      }
      this.updateProgress(100, "上传完成！", 3);
      setTimeout(() => {
        this.completeUpload();
      }, 500);
      console.log("[KnowledgeBaseManager] 知识库内容上传成功:", fileName);
      return {
        fileName,
        metadata: sourceMetadata
      };
    } catch (error) {
      console.error("[KnowledgeBaseManager] 上传知识库内容失败:", error);
      const errorMessage = error instanceof Error ? error.message : "上传失败";
      this.failUpload(errorMessage);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }
  /**
   * 上传整个网页（仅以 URL 作为输入，后端负责抓取）
   */
  async uploadWebpage(params) {
    let { url } = params;
    const { title, hashtags } = params;
    try {
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = `https://${url}`;
      }
      let parsed;
      try {
        parsed = new URL(url);
      } catch {
        throw new Error("无效的 URL");
      }
      const hostname = parsed.hostname;
      const fileName = `${hostname.replace(/[<>:"/\\|?*]/g, "_")}.webpage`;
      this.startUpload(fileName);
      this.updateProgress(10, "正在准备网页上传...", 1);
      await this.delay(200);
      const sourceFile = new File([url], `${hostname}.webpage`, {
        type: "text/plain; charset=utf-8"
      });
      this.updateProgress(40, "正在获取知识库...", 2);
      const repoId = params.repoId ?? await this.ensureDefaultRepo();
      const sourceMetadata = {
        id: crypto.randomUUID(),
        title: title || hostname,
        preview: "",
        hashtags: hashtags || "",
        type: "webpage",
        upload_status: "input"
      };
      this.updateProgress(70, "正在上传网页...", 2);
      const uploadResult = await uploadSource({
        source: sourceFile,
        metadata: sourceMetadata,
        repoId,
        method: "add"
      });
      if (uploadResult.error) {
        throw new Error(uploadResult.error.message || "上传失败");
      }
      this.updateProgress(100, "上传完成！", 3);
      setTimeout(() => this.completeUpload(), 500);
      return {
        fileName,
        metadata: sourceMetadata
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "上传失败";
      this.failUpload(message);
      throw error instanceof Error ? error : new Error(message);
    }
  }
  /**
   * 上传图片（通过图片 URL 抓取并上传）
   */
  async uploadImageFromUrl(params) {
    const { srcUrl, title, pageUrl, hashtags } = params;
    try {
      if (!srcUrl?.trim()) {
        throw new Error("图片地址为空");
      }
      let hostname = "image";
      try {
        const url = new URL(pageUrl || srcUrl);
        hostname = url.hostname;
      } catch {
      }
      const filename = (srcUrl.split("/")?.pop() || hostname || "image").replace(
        /[<>:"/\\|?*]/g,
        "_"
      );
      this.startUpload(filename);
      this.updateProgress(20, "正在获取图片数据...", 1);
      const response = await fetch(srcUrl);
      if (!response.ok) {
        throw new Error(`下载图片失败: ${response.status}`);
      }
      const blob = await response.blob();
      this.updateProgress(45, "正在获取知识库...", 2);
      const repoId = params.repoId ?? await this.ensureDefaultRepo();
      const sourceMetadata = {
        id: crypto.randomUUID(),
        title: title || hostname,
        hashtags: hashtags || "",
        preview: {
          url: srcUrl,
          size: [0, 0],
          dominantColor: "#bcbcbc"
        },
        type: "image",
        upload_status: "input"
      };
      this.updateProgress(70, "正在上传图片...", 2);
      const file = new File([blob], filename, { type: blob.type || "image/*" });
      const uploadResult = await uploadSource({
        source: file,
        metadata: sourceMetadata,
        repoId,
        method: "add"
      });
      if (uploadResult.error) {
        throw new Error(uploadResult.error.message || "上传失败");
      }
      this.updateProgress(100, "上传完成！", 3);
      setTimeout(() => this.completeUpload(), 500);
      return {
        fileName: filename,
        metadata: sourceMetadata
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "上传失败";
      this.failUpload(message);
      throw error instanceof Error ? error : new Error(message);
    }
  }
  /**
   * 获取或创建 Flowith Browser 知识库
   */
  async getOrCreateOSRepoId() {
    const repos = await fetchRepos();
    const osRepo = repos.data?.find(
      (repo) => repo.title === "Flowith Browser"
    );
    if (osRepo) {
      return osRepo.id;
    }
    const newRepo = await insertRepo("Flowith Browser");
    return newRepo.data?.repo_id;
  }
  /**
   * 确保默认仓库存在并返回其ID，同时缓存默认ID。
   */
  async ensureDefaultRepo() {
    if (this.defaultRepoId) return this.defaultRepoId;
    const id = await this.getOrCreateOSRepoId();
    this.defaultRepoId = id;
    this.prefetchRepos();
    return id;
  }
  /**
   * 实际刷新仓库缓存
   */
  async refreshReposCache() {
    const response = await fetchRepos();
    const data = response.data;
    if (Array.isArray(data)) {
      this.reposCache = data.map((r) => ({ id: r.id, title: r.title }));
    }
  }
  /**
   * 延迟函数
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  /**
   * 将文本格式化为 Markdown 格式
   */
  formatAsMarkdown(text, metadata) {
    const lines = [];
    lines.push(`# ${metadata.title}`);
    lines.push("");
    lines.push(`**来源链接:** ${metadata.url}`);
    lines.push("");
    lines.push(`**添加时间:** ${(/* @__PURE__ */ new Date()).toLocaleString()}`);
    lines.push("");
    lines.push("---");
    lines.push("");
    lines.push(text.trim());
    return lines.join("\n");
  }
}
const knowledgeBaseManager = new KnowledgeBaseManager();
function initializeBrowserAgentHandlers() {
  electron.ipcMain.handle(
    "task:start",
    async (_event, request) => {
      const client2 = config.s.getClient();
      const { data } = await client2.auth.getSession();
      if (!data.session) {
        console.warn("[BrowserAgentHandlers] ⚠️ 用户未登录，无法启动任务");
        console.log("[BrowserAgentHandlers] 🔔 触发登录模态框...");
        mainEventBus.m.emit("auth:requireLogin");
        throw new Error("用户未登录，请先登录后再启动任务");
      }
      console.log("[BrowserAgentHandlers] ✅ 用户已登录，开始执行任务");
      return await index$2.D.startTask(request);
    }
  );
  electron.ipcMain.handle(
    "task:pause",
    async (_event, taskId) => {
      await index$2.D.getAgent(taskId)?.pause();
    }
  );
  electron.ipcMain.handle(
    "task:resume",
    async (_event, taskId) => {
      await index$2.D.resumeTask(taskId);
    }
  );
  electron.ipcMain.handle(
    "task:followUp",
    async (_event, { taskId, instructions }) => {
      await index$2.D.followUp(taskId, instructions);
    }
  );
  electron.ipcMain.handle(
    "task:archive",
    async (_e, taskId) => await index$2.E.archiveTask(taskId)
  );
  electron.ipcMain.handle("task:delete", async (_e, taskId) => {
    await index$2.F(taskId);
  });
  electron.ipcMain.handle("taskSnapshot:get", async (_e, taskId) => {
    const snapshot = await index$2.G(taskId);
    if (!snapshot) {
      throw new Error(`任务 ${taskId} 不存在`);
    }
    return snapshot;
  });
  electron.ipcMain.handle(
    "browser-agent:submit-human-input",
    async (_event, params) => {
      console.log("[BrowserAgentHandlers] 收到人工输入提交:", params);
      try {
        index$2.H.submitResponse(params.requestId, String(params.response));
      } catch (error) {
        console.error("[BrowserAgentHandlers] 提交人工输入失败:", error);
        throw error;
      }
    }
  );
  electron.ipcMain.handle("browser-agent:get-human-input-queue", async () => {
    return index$2.H.getQueueSnapshot();
  });
  electron.ipcMain.handle(
    "file:showInFolder",
    async (_event, path2) => {
      electron.shell.showItemInFolder(path2);
    }
  );
}
const pendingCreditTasks = /* @__PURE__ */ new Map();
const PLATFORM_URLS = {
  x: "https://x.com/compose/post",
  rednote: "https://creator.xiaohongshu.com/publish/publish"
};
const REDNOTE_STYLE_PROMPTS = [
  {
    name: "乔布斯风格",
    detail: `极简有力、先抛“反直觉的一句话”开场；强调产品愿景与改变；短句+强动词，少形容词；用对比/排比强化记忆点。

## 核心风格要素

### 1. 以愿景开场，拉高叙事高度
- 先给“一句颠覆性判断/愿景宣言”（Think different）
- 把产品上升为“改变某个行业/时代的方式”
- 用“我们不只是… 我们在重新发明…”的框架

### 2. 极简语言，删除一切不必要
- 短句+强动词（It just works / 简单到不可思议）
- 避免堆砌形容词，用事实与对比说话
- 每段只表达一个信息点

### 3. 叙事弧线与戏剧化节奏
- 三幕式：痛点→答案→惊喜（One more thing）
- 在关键节点前留白与停顿，制造“解锁时刻”
- 先讲体验，再讲技术细节

### 4. 技术×人文的隐喻与对照
- 强调“科技与人文的交汇”
- 用隐喻/类比把复杂技术变得可感知
- 对比“旧世界/新范式”凸显跃迁

### 5. 端到端体验与整合
- 硬件、软件、服务一体化叙述
- 强调“无摩擦”“天然适配”“开箱即用”
- 以具体使用场景展示顺滑体验

### 6. 语言与排版约束
- 避免行业黑话与冗词；不使用 Emoji
- 句式简洁、节奏明快；排比/对仗可少量使用
- 金句可重复，以强化记忆点

### 7. 参考表达模板
- 金句："The best X we've ever made" / “有史以来最…的X”
- 转折："But we wanted to go further" / “但这还不够”
- 惊喜："One more thing" / “还有一件事”`
  },
  {
    name: "雷军风格",
    detail: '亲和务实、工程师气质；用数据和性价比说话；口语化、有热情的召唤句；结尾给出“上手就懂”的行动号召。雷军作为小米创始人,其演讲风格以数据驱动、情感共鸣、宏大叙事著称,善于将普通产品升华为"改变世界"的创新。\n\n## 核心风格要素\n\n### 1. 量化一切,数据驱动\n\n**创造精确的数字:**\n\n- 大量使用具体数字、百分比、倍数和排名\n\n- 即使数字经过精心设计,也要显得精确\n\n- 示例:"提升了57%"、"耗时300个日夜"、"精确到7点3分56秒"\n\n**对比彰显优势:**\n\n- 与传统产品、行业标准进行数据对比\n\n- 突出"遥遥领先"的优势地位\n\n- 用数据说话,让优势一目了然\n\n### 2. 宏大叙事,情感共鸣\n\n**定义问题高度:**\n\n- 将普通需求上升到"困扰人类几千年的难题"\n\n- 定义为"行业前所未有的挑战"\n\n- 塑造为"一个时代的梦想"\n\n**故事化研发过程:**\n\n- 生动描绘团队艰辛付出\n\n- 强调"工程师们反复研究比对"\n\n- 突出"砸重金"、"踏遍全球寻找最优解"\n\n- 展现对细节的极致追求\n\n**连接用户情感:**\n\n- 使用"朋友们"、"米粉们"等亲切称呼\n\n- 让观众感觉产品是为他们量身定做\n\n- 营造共同追梦的氛围\n\n### 3. 专业术语,赋予高级感\n\n**创造"专业名词":**\n\n- 为普通技术赋予专业、高级、独特的名字\n\n- 示例:"农夫米泉"(泡面专用水)、"小米超级空心面"(面条)\n\n- 让产品听起来独一无二\n\n**跨界联合:**\n\n- 强调与行业巨头的"联合研制"\n\n- 突出"战略合作"伙伴\n\n- 增强产品权威性和技术领先性\n\n### 4. 结构清晰,节奏明快\n\n**经典三段式结构:**\n\n1. 提出痛点/梦想\n\n- 描绘用户普遍存在但常被忽略的痛点\n\n- 用数据放大这个痛点\n\n- 引发观众共鸣\n\n2. 展示解决方案\n\n- 隆重推出产品\n\n- 详细阐述如何通过技术、设计、努力解决痛点\n\n- 运用数据和故事的核心展示部分\n\n3. 公布价格/总结价值\n\n- 在吊足胃口后公布价格\n\n- 强调"极具诚意"或"交个朋友"\n\n- 再次强调核心价值和多样化选择\n\n**标志性句式:**\n\n- "那么,究竟..."\n\n- "我们为此,做了..."\n\n- "是的,你没有听错"\n\n- "这,就是我们的答案"\n\n- 使用富有节奏感和感染力的表达'
  },
  {
    name: "罗永浩风格",
    detail: '犀利真诚，略带自嘲幽默；先坦诚问题再给出有力观点；用比喻制造反差，收束于“真香时刻”的强记忆点。\n\n## 核心风格要素\n\n### 1. 反差金句与对仗排比\n- 标志性母题："天生骄傲"、"漂亮得不像实力派"\n- 中英穿插："Simplicity, is hidden complexity / 简约，源自隐藏的精密"、"the essence of flat, is super curved / 平坦的本质，是极致的曲面"、"Uncomfortable, is the new comfortable / 不适感，导致了全新的舒适"\n- 句式：断裂停顿（这，就是…）、反问/设问、括号内侧评\n\n### 2. 痛点设问式开场\n- 以生活化场景抛问题（找应用、语音助手尴尬、满屏图标疲劳、解屏多样化等）\n- 夸张而不失真实，引出“为什么需要它”\n\n### 3. 列举式信息密度\n- 使用“能…还能…”连珠排比，3–6 组，层层加码\n- 以强转折收束（如“能被毁灭，但不能被打败”的精神内核）\n\n### 4. 价值升华与态度\n- 从功能升华到理念与时代气质（锐丽异类、纤瘦身影、内敛与闷骚）\n- 人设口吻“交个朋友”，真诚、好懂、带锋芒\n\n### 5. 语言与节奏\n- 短句+强节奏；对仗、排比、反问穿插\n- 中英对照金句可少量点缀；避免官话口号\n\n### 6. 结构建议\n1) 开场金句→ 2) 痛点三连→ 3) 解决方案→ 4) 细节亮点排比→ 5) 价值收束/口号\n\n### 7. 风格约束\n- 不用 Emoji、避免“姐妹们”等口头语\n- 不模板化 AI 腔；所有论断尽量给到具体细节\n\n### 8. 参考表达模板\n- 金句："No detail, can be too detailed / 所有的细节，都决定成败"\n- 设问："在 162 个应用里找一个，要划多久？"\n- 收束："这，就是我们的答案。"'
  },
  {
    name: "Geoffrey Hinton风格",
    detail: '学术严谨、前瞻克制；以事实与研究共识构建论证；谨慎讨论风险与边界，同时给出现实可行的落地方向。\n\n## 核心风格要素\n\n### 1. 学术严谨与证据链\n- 以经过验证的研究、数据与可复现实验为依据\n- 引用共识与反例，明确适用条件与前提假设\n- 避免绝对化结论，强调概率与不确定性表达\n\n### 2. 机制直觉与可解释性\n- 用直观比喻阐释深度网络的工作机理（表示学习、梯度传播等）\n- 描述表征如何在层间演化，给出可视化/可解释分析的方向\n- 强调“为何有效”的理论理解，而非只给现象\n\n### 3. 前瞻与边界\n- 讨论潜在能力、社会影响与风险（安全、偏见、对齐问题）\n- 清晰指出局限性与失效场景，提出稳健的改进路径\n- 在务实落地与长远研究之间保持平衡\n\n### 4. 语言与表述\n- 使用克制措辞："evidence suggests"、"a plausible explanation"、"it is likely that"\n- 对不确定部分给出多种可能机理与验证思路\n- 避免营销化口号，保持中性客观\n\n### 5. 结构建议\n1) 问题定义与背景 → 2) 相关研究与共识 → 3) 机制直觉/解释 → 4) 证据与实验 → 5) 局限与风险 → 6) 未来方向/稳健落地\n\n### 6. 参考表达模板\n- 金句："We should be cautious while being optimistic."\n- 转折："However, there are important limitations to consider."\n- 收束："A plausible next step is to systematically evaluate…"'
  },
  {
    name: "Andrej Karpathy 风格",
    detail: '工程/系统视角、端到端思维；以“从数据到产品”的链路解释；偏代码与架构类比，鼓励动手与最小可行 Demo。\n\n## 核心风格要素\n\n### 1. 端到端与系统化\n- 从数据→模型→训练→评估→部署的闭环\n- 强调简洁、统一的流水线抽象（DataLoader/Trainer/Logger/Exporter）\n- 先跑通最小可行版本，再迭代优化\n\n### 2. 代码先行与最小 Demo\n- 以最短代码说明核心原理（from scratch 风格）\n- 通过 Notebook/脚本快速搭建原型，用可视化辅助理解\n- 提供可复制粘贴的骨架代码，易于扩展\n\n### 3. 训练“配方”与工程细节\n- 明确 batch size、学习率计划、优化器、混合精度与检查点\n- 数据处理：缓存、切分、随机种子、分布式同步\n- 监控：loss/metric 曲线、采样可视化、失败重试策略\n\n### 4. 可复现与扩展性\n- 固定随机种子，记录版本与配置；模块化组件，命令行参数化\n- 提供清晰的 README 与运行命令；预留 Hook 便于替换模块\n- 强调“原则+实践”的可迁移性（小到大、单机到分布式）\n\n### 5. 讲解与语言\n- 先直觉后公式，图示优先；用系统/代码类比解释概念\n- 避免玄学调参，强调经验性“配方”与数据优先\n- 常用表达："Let’s build it step by step"、"End-to-end"、"The recipe is…"\n\n### 6. 结构建议\n1) 问题与目标 → 2) 最小可行基线 → 3) 数据与预处理 → 4) 模型与训练循环 → 5) 评估与可视化 → 6) 扩展与部署 → 7) 下一步\n\n### 7. 参考表达模板\n- 开场："Let’s start simple, then scale."\n- 过渡："We’ll keep the pipeline end-to-end and modular."\n- 收束："This gives us a solid baseline to iterate on."'
  }
];
const DEFAULT_REDNOTE_STYLE = {
  name: "通用实用风格",
  detail: "直入主题、结构清晰；以使用场景+可操作要点为主，避免空话套话。"
};
function selectRandomRednoteStyle() {
  try {
    if (!Array.isArray(REDNOTE_STYLE_PROMPTS) || REDNOTE_STYLE_PROMPTS.length === 0) {
      return DEFAULT_REDNOTE_STYLE;
    }
    const index2 = Math.floor(Math.random() * REDNOTE_STYLE_PROMPTS.length);
    return REDNOTE_STYLE_PROMPTS[index2] ?? DEFAULT_REDNOTE_STYLE;
  } catch {
    return DEFAULT_REDNOTE_STYLE;
  }
}
function generatePostInstructions(platform, invitationCodes = []) {
  if (platform === "x") {
    const praiseVariants = [
      "Okay, high-key obsessed with FlowithOS. This thing is an absolute game-changer. Seriously, do yourself a favor and try it.",
      "My mind is actually blown. FlowithOS just changed my entire workflow. How did I even function before this? Get on it, people!",
      "FlowithOS. That's it. That's the post. Best product of 2025, period. You need this.",
      `Fr, FlowithOS just ate. This app slaps. It's giving "Product of the Year" vibes, 100%. Get it.`,
      "Low-key think FlowithOS is from the future. This thing is insane. If you know, you know. If you don't, find out.",
      "Stop what you're doing and download FlowithOS. This isn't a recommendation, it's a command. Easily the best thing to drop this year.",
      "FlowithOS just 10x'd my productivity. Dead serious. It's the most useful product I've found all year. You gotta try this.",
      "Y'all, the hype is REAL. FlowithOS is easily the most impressive tool I've used all year. No cap. Don't miss out on this.",
      "I'm not exaggerating: FlowithOS is the single most impressive piece of tech I've touched in 2025. This is the new standard.",
      "FlowithOS is the GOAT. This is the best product drop of 2025."
    ];
    const example = praiseVariants[Math.floor(Math.random() * praiseVariants.length)];
    const codesInline = invitationCodes.length > 0 ? invitationCodes.join(" ") : "[No invitation codes available - proceed without codes]";
    const instructions = `Step 1:

Draft a tweet that is no more than 140 characters. This draft will be written in a very casual, conversational English style.

Copywriting structure requirements

1. first @ flowith

2. Praise flowithOS

For example: ${example}

The theme is praising FlowithOS as the most useful/best/impressive product you've used this year. The wording can be a bit creative. The tone will be trendy and internet-savvy, recommending everyone to try it out.

3. Social identity

For example: From now on, actions are signatures. Join the first authors of this new era↓

Be sure to include the ↓ guidance symbol. It must include a "grand" narrative like that of era.

The wording can be a bit creative. The tone will be trendy and internet-savvy, recommending everyone to try it out.

Step 2: 

navigate to x.com, and find the input box (If the user haven't login twitter, use 'ask_user' tool to let the user login first.)

input: @flowith

then, paste the draft into the textarea

Step 3: 

click the "Add" button on the bottom right of the dialogue, near the "post" button to start a thread. Then reply to the tweet with "Claim $20 FREE credits + 7 days of automated posting: ${codesInline}"

Step 4: click the "post" button`;
    return instructions;
  }
  if (platform === "rednote") {
    const selectedStyle = selectRandomRednoteStyle();
    return `现在，前往小红书平台发布一篇分享 FlowithOS 使用体验的高质量长文笔记。

    ## 执行流程

    ### 内容创作要求

    内容与标题要求
    - 风格: ${selectedStyle.name}（写作要求：${selectedStyle.detail}）
    - 内容: 需与正文标题有所区分,但同样要直接、有吸引力、非共识、有深度。使用中文。
    - 禁止: 避免 AI 腔调、模板化表达和"姐妹们"等传统词藻、不要用 Emoji.
    - 发布时必须使用中文作为正文语言

    排版要求
    - 禁止使用“#”
    - 至少5个段落，段落之间不空行

    📄 正文要求(700字以内)

    发布模式:
    - 固定使用长文模式进行发布
    - 点击"一键排版",选择一个随机且和内容匹配的排版风格

    内容要点:
    - 核心价值: 真实分享 FlowithOS 使用体验,重点突出 Agent Neo OS 的强大能力(也就是你自己的强大能力，你要结合你的架构、能力和潜力来写)
    - 功能亮点: 突出最让人惊艳的功能点
    - 场景化: 结合具体使用场景, 提供有价值的干货信息、反共识、吸引人场景等
    - 结尾提及: 在文末自然提及"这篇笔记由 Flowith OS AI 发布"

    ---

    ## 严格按步骤执行发布操作流程

    ### 操作步骤
    1. 进入创作 → 打开小红书，点击【发布】，进入创作服务平台
    2. 点击左上角红色"发布笔记"按钮
    3. 选择模式 → 点击"写长文"模式
    4. 新建创作 → 点击"新的创作"
    5. 填写标题 → 在"输入标题"处填写文章标题，注意标题要在15个字以内
    6. 填写正文 → 在"粘贴到这里或输入文字"处输入正文内容
    7. 美化排版 → 点击下方"一键排版",选择任意一个合适的风格
    8. 检查发布 → 点击"下一步”,在发布页面填写15字以内的标题， 随后输入几句非常自然、真实的正文描述
    9. 点击"发布"按钮。

    ---

    ## 发布前检查清单

    内容完整性确认:
    - [ ] 标题是否已填写,且在15个字以内
    - [ ] 正文内容是否完善
    - [ ] 标签是否已添加
    - [ ] 排版是否清晰美观

    准备就绪后,点击左下角"发布"按钮完成发布。

    ---

    ## 特殊情况处理

    > 🔐 登录验证提示:
    > 注意在进入平台时候, 如果打开网页发现用户未登录小红书账号，需要使用 \`ask_user\` 动作请求用户登录,等待用户完成后再继续操作。如果登录成功，则继续执行后续步骤，如果网页还在加载，则使用 wait 动作等待网页加载完成。

    ---

    ## 质量标准

    ✅ 符合账号调性 - 真实自然,不生硬
    ✅ 内容有价值 - 提供实用干货,有深度
    ✅ 成功发布 - 在小红书平台正式发布`;
  }
  return "Unable to generate instructions for unknown platform";
}
async function getOrCreateShareTab(platformUrl) {
  try {
    const windows = electron.BrowserWindow.getAllWindows();
    if (windows.length === 0) {
      console.error("[RewardPageHandlers] No browser windows found");
      return null;
    }
    const mainWindow = windows[0];
    mainWindow.webContents.send("create-new-tab", { url: platformUrl });
    await new Promise((resolve) => setTimeout(resolve, 500));
    return "active-tab";
  } catch (error) {
    console.error("[RewardPageHandlers] Error creating share tab:", error);
    return null;
  }
}
async function tryAwardCredits(taskId) {
  const MAX_ATTEMPTS = 5;
  const RETRY_DELAYS = [0, 2e3, 5e3, 1e4, 3e4];
  const taskInfo = pendingCreditTasks.get(taskId);
  if (!taskInfo) return;
  const attempt = taskInfo.attempts;
  if (attempt >= MAX_ATTEMPTS) {
    console.error("[RewardPageHandlers] Max retry attempts reached for", taskId);
    pendingCreditTasks.delete(taskId);
    return;
  }
  taskInfo.attempts++;
  taskInfo.lastAttempt = Date.now();
  try {
    console.log(`[RewardPageHandlers] Awarding credits (attempt ${attempt + 1}/${MAX_ATTEMPTS})...`);
    const result = await config.a(2e3, "social_share", true);
    if (result.alreadyClaimed) {
      console.log("[RewardPageHandlers] User already claimed share reward");
      pendingCreditTasks.delete(taskId);
      return;
    }
    if (result.success) {
      console.log("[RewardPageHandlers] ✅ Awarded 2000 credits successfully");
      index$2.I.showCreditAward(2e3);
      pendingCreditTasks.delete(taskId);
      return;
    }
    console.warn("[RewardPageHandlers] Award failed, will retry:", result.error);
    const delay = RETRY_DELAYS[attempt] || 3e4;
    setTimeout(() => tryAwardCredits(taskId), delay);
  } catch (error) {
    console.error("[RewardPageHandlers] Credit award exception:", error);
    const delay = RETRY_DELAYS[attempt] || 3e4;
    setTimeout(() => tryAwardCredits(taskId), delay);
  }
}
function setupCreditAwardListener() {
  mainEventBus.m.on("taskSnapshot:update", (snapshot) => {
    const taskId = snapshot.id;
    if (!pendingCreditTasks.has(taskId)) return;
    if (snapshot.status === "running") {
      const taskInfo = pendingCreditTasks.get(taskId);
      if (taskInfo && taskInfo.attempts === 0) {
        console.log("[RewardPageHandlers] Trigger detected (running), awarding credits...");
        tryAwardCredits(taskId).catch((err) => {
          console.error("[RewardPageHandlers] Award initiation failed:", err);
        });
      }
    }
    if (snapshot.status === "completed" || snapshot.status === "failed" || snapshot.status === "paused") {
      setTimeout(() => {
        if (pendingCreditTasks.has(taskId)) {
          console.log("[RewardPageHandlers] Cleaning up expired task (snapshot):", taskId);
          pendingCreditTasks.delete(taskId);
        }
      }, 3e5);
    }
  });
}
function initializeRewardPageHandlers() {
  setupCreditAwardListener();
  electron.ipcMain.handle(
    "reward-page:start-share-task",
    async (_event, request) => {
      console.log("[RewardPageHandlers] Starting share task:", request.platform);
      try {
        const client2 = config.s.getClient();
        const { data } = await client2.auth.getSession();
        if (!data.session) {
          console.warn("[RewardPageHandlers] User not logged in");
          mainEventBus.m.emit("auth:requireLogin");
          return {
            success: false,
            error: "请先登录后再使用分享功能"
          };
        }
        console.log("[RewardPageHandlers] User authenticated, proceeding with share task");
        const platformUrl = PLATFORM_URLS[request.platform];
        if (!platformUrl) {
          return {
            success: false,
            error: `Unsupported platform: ${request.platform}`
          };
        }
        const instructions = generatePostInstructions(
          request.platform,
          request.invitationCodes || []
        );
        const tabId = await getOrCreateShareTab(platformUrl);
        if (!tabId) {
          return {
            success: false,
            error: "无法创建分享标签页"
          };
        }
        console.log("[RewardPageHandlers] Starting browser agent task on tab:", tabId);
        const taskId = await index$2.D.startTask({
          instructions,
          agentMode: "vision"
          // Use vision mode for better UI understanding
        });
        console.log("[RewardPageHandlers] Browser agent task started:", taskId);
        pendingCreditTasks.set(taskId, {
          attempts: 0,
          lastAttempt: 0
        });
        return {
          success: true,
          taskId
        };
      } catch (error) {
        console.error("[RewardPageHandlers] Error starting share task:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "启动分享任务失败"
        };
      }
    }
  );
}
function broadcastPresetChange() {
  const mainWindow = index$2.g();
  if (!mainWindow) return;
  const tabManager = index$2.T.getInstance();
  const tabs = tabManager.tabs;
  tabs.forEach((tab) => {
    try {
      const view = tab.getView("system");
      view.webContents.send("preset:changed");
    } catch (error) {
      console.error("[PresetHandlers] Failed to send preset:changed to tab:", error);
    }
  });
  const views = mainWindow.contentView.children;
  views.forEach((view) => {
    if (view instanceof electron.WebContentsView) {
      try {
        view.webContents.send("preset:changed");
      } catch (error) {
      }
    }
  });
  mainWindow.webContents.send("preset:changed");
}
function registerAgentPresetHandlers() {
  electron.ipcMain.handle("agentWidget:presets:list", async (_event, locale) => {
    return await index$5.a.list(locale);
  });
  electron.ipcMain.handle("agentWidget:presets:create", async (_event, data) => {
    const result = await index$5.a.create(data);
    broadcastPresetChange();
    return result;
  });
  electron.ipcMain.handle("agentWidget:presets:update", async (_event, data) => {
    const result = await index$5.a.update(data);
    broadcastPresetChange();
    return result;
  });
  electron.ipcMain.handle("agentWidget:presets:remove", async (_event, id) => {
    await index$5.a.remove(id);
    broadcastPresetChange();
  });
  electron.ipcMain.handle("agentWidget:presets:generateFromTask", async (_event, cleanedTaskData) => {
    try {
      const systemPrompt = `You are a Workflow Abstraction Specialist. Transform specific task executions into reusable Agent Presets.

# MISSION

Extract the universal pattern from the specific execution:
- Essence over details
- Universal over specific
- Actionable over descriptive
- Reusable over one-time

# ANALYSIS

Ask yourself four questions:

1. **Intent**: What problem does this solve?
2. **Pattern**: What's the logical flow?
3. **Boundaries**: What stays? What goes?
4. **Success**: How do we know it worked?

# OUTPUT SPECIFICATION

Generate valid JSON with three fields:

## name
**3-8 words. Action verb. Distinctive.**

Good: "Extract Article to Notion"
Bad: "Task 1" (vague) | "Navigate to website and..." (verbose)

Match original language.

## instruction
**Transform through three lenses:**

Preserve:
- Workflow sequence and structure
- Decision points: "If login required, authenticate first"
- Validation: "Verify content transferred completely"
- Essential domain terms

Remove:
- Specifics: URLs, names, dates, quantities
- Casual tone: "just", "maybe", "try to"
- Implementation: clicks, waits, coordinates
- Personal context: "my folder", "usual method"

Generalize:
- "Medium" → "content source website"
- "'React Hooks Tutorial'" → "target article by given topic"
- "My Learning Notes" → "destination notebook"

Structure:
- Imperative commands, not descriptions
- Chronological order
- Explicit conditionals
- Critical validations

## color
**One color. Primary intent wins.**

purple → Games, entertainment
green → Creation, editing, design
blue → Data, research, analysis
red → Social, communication
yellow → Search, discovery

# OUTPUT FORMAT

Return ONLY valid JSON. No markdown. No explanation. No wrapper.

{"name": "...", "instruction": "...", "color": "..."}

# SELF-CHECK

Before output:
□ Name: 3-8 words, verb-driven
□ Instruction: Zero specific values
□ Instruction: Universal terminology
□ Instruction: Includes conditionals
□ Color: Matches primary category
□ Format: Pure JSON
□ Language: Matches original`;
      const userPrompt = `Transform this task into a reusable preset:

<original_instruction>
${cleanedTaskData.originalInstruction}
</original_instruction>

<executed_actions>
${JSON.stringify(cleanedTaskData.executedActions, null, 2)}
</executed_actions>

<result>
${cleanedTaskData.result}
</result>`;
      const response = await index$2.A.chatCompletion({
        model: "claude-haiku-4-5-20251001",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 25536
      });
      const content = response.choices[0].message.content.trim();
      const jsonStr = content.startsWith("```") ? content.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/)?.[1].trim() ?? content : content;
      const generated = JSON.parse(jsonStr);
      return {
        name: generated.name,
        instruction: generated.instruction,
        color: generated.color || "blue"
      };
    } catch (error) {
      console.error("[PresetHandlers] Generate from task failed:", error);
      throw error;
    }
  });
}
const BACKGROUNDS_DIR = "backgrounds";
async function ensureBackgroundsDir() {
  const storage = index$3.getAppStorage();
  const bgDir = storage.paths.getPath("data", BACKGROUNDS_DIR);
  try {
    await fs__namespace.mkdir(bgDir, { recursive: true });
  } catch (error) {
    console.error("[BackgroundHandlers] Failed to create backgrounds directory:", error);
    throw error;
  }
  return bgDir;
}
function isValidImageFile(filePath) {
  const validExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"];
  const ext = path__namespace.extname(filePath).toLowerCase();
  return validExtensions.includes(ext);
}
function isValidImageExtension(fileName) {
  const validExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"];
  const ext = path__namespace.extname(fileName).toLowerCase();
  return validExtensions.includes(ext);
}
function registerBackgroundHandlers() {
  electron.ipcMain.handle("background:selectImageFile", async () => {
    const win = index$2.g();
    const { canceled, filePaths } = await electron.dialog.showOpenDialog(win, {
      properties: ["openFile"],
      filters: [
        { name: "Images", extensions: ["jpg", "jpeg", "png", "webp", "gif", "svg"] }
      ],
      title: "Select Background Image"
    });
    if (canceled || filePaths.length === 0) {
      return null;
    }
    return filePaths[0];
  });
  electron.ipcMain.handle("background:uploadImage", async (_event, sourceFilePath) => {
    try {
      if (!isValidImageFile(sourceFilePath)) {
        throw new Error("Invalid image file type");
      }
      const bgDir = await ensureBackgroundsDir();
      const ext = path__namespace.extname(sourceFilePath);
      const fileName = `${crypto.randomUUID()}${ext}`;
      const destPath = path__namespace.join(bgDir, fileName);
      await fs__namespace.copyFile(sourceFilePath, destPath);
      console.log("[BackgroundHandlers] Image uploaded:", fileName);
      return fileName;
    } catch (error) {
      console.error("[BackgroundHandlers] Failed to upload image:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("background:uploadImageBuffer", async (_event, buffer, originalFileName) => {
    try {
      if (!isValidImageExtension(originalFileName)) {
        throw new Error("Invalid image file type");
      }
      const bgDir = await ensureBackgroundsDir();
      const ext = path__namespace.extname(originalFileName);
      const fileName = `${crypto.randomUUID()}${ext}`;
      const destPath = path__namespace.join(bgDir, fileName);
      await fs__namespace.writeFile(destPath, Buffer.from(buffer));
      console.log("[BackgroundHandlers] Image uploaded from buffer:", fileName);
      return fileName;
    } catch (error) {
      console.error("[BackgroundHandlers] Failed to upload image from buffer:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("background:getImageUrl", async (_event, fileName) => {
    try {
      const storage = index$3.getAppStorage();
      const imagePath = storage.paths.getPath("data", BACKGROUNDS_DIR, fileName);
      try {
        await fs__namespace.access(imagePath);
      } catch {
        console.error("[BackgroundHandlers] Image file not found:", imagePath);
        throw new Error("Image file not found");
      }
      const imageUrl = `flowith://backgrounds/${fileName}`;
      console.log("[BackgroundHandlers] Image URL generated:", imageUrl);
      return imageUrl;
    } catch (error) {
      console.error("[BackgroundHandlers] Failed to get image URL:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("background:deleteImage", async (_event, fileName) => {
    try {
      const storage = index$3.getAppStorage();
      const imagePath = storage.paths.getPath("data", BACKGROUNDS_DIR, fileName);
      await fs__namespace.unlink(imagePath);
      console.log("[BackgroundHandlers] Image deleted:", fileName);
    } catch (error) {
      console.error("[BackgroundHandlers] Failed to delete image:", error);
      throw error;
    }
  });
}
function registerAnalyticsHandlers() {
  electron.ipcMain.handle(
    "analytics:track",
    async (_event, eventName, properties) => {
      try {
        await posthogService.posthogService.track(eventName, properties);
        return { success: true };
      } catch (error) {
        console.error("[IPC] analytics:track error:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
      }
    }
  );
  electron.ipcMain.handle(
    "analytics:identify",
    async (_event, properties) => {
      try {
        await posthogService.posthogService.identify(properties);
        return { success: true };
      } catch (error) {
        console.error("[IPC] analytics:identify error:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
      }
    }
  );
  electron.ipcMain.handle("analytics:getDistinctId", async (_event) => {
    try {
      const distinctId = await identityManager.analyticsIdentityManager.getDistinctId();
      return { success: true, distinctId };
    } catch (error) {
      console.error("[IPC] analytics:getDistinctId error:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  });
  electron.ipcMain.handle("analytics:isEnabled", async (_event) => {
    try {
      const enabled = posthogService.posthogService.isEnabled();
      return { success: true, enabled };
    } catch (error) {
      console.error("[IPC] analytics:isEnabled error:", error);
      return { success: false, enabled: false };
    }
  });
  electron.ipcMain.handle("analytics:getUserProperties", async (_event) => {
    try {
      const properties = await identityManager.analyticsIdentityManager.getUserProperties();
      return { success: true, properties };
    } catch (error) {
      console.error("[IPC] analytics:getUserProperties error:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  });
  electron.ipcMain.handle(
    "analytics:setUserProperties",
    async (_event, properties) => {
      try {
        await posthogService.posthogService.setUserProperties(properties);
        return { success: true };
      } catch (error) {
        console.error("[IPC] analytics:setUserProperties error:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
      }
    }
  );
  electron.ipcMain.handle("analytics:alias", async (_event, userId) => {
    try {
      await posthogService.posthogService.alias(userId);
      return { success: true };
    } catch (error) {
      console.error("[IPC] analytics:alias error:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  });
  electron.ipcMain.handle("analytics:flush", async (_event) => {
    try {
      await posthogService.posthogService.flush();
      return { success: true };
    } catch (error) {
      console.error("[IPC] analytics:flush error:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  });
}
async function createTerminalTabForCommand(commandId, command, controllerId) {
  if (!index$2.P.isSupported()) {
    console.warn("[TerminalTab] Terminal not supported on this platform (Windows)");
    throw new Error(
      "Terminal is not supported on Windows. This feature is only available on macOS and Linux."
    );
  }
  const controller = controllerId ? index$2.J.getController(controllerId) || (() => {
    console.log(
      `[TerminalTab] Controller ${controllerId} not found, creating new one with colors`
    );
    return index$2.J.createController("normal", controllerId);
  })() : index$2.J.createController("system");
  if (controllerId) {
    const existingController = index$2.J.getController(controllerId);
    if (existingController) {
      console.log(`[TerminalTab] ✅ Reusing existing controller: ${controllerId}`);
      console.log(`[TerminalTab] Controller colors:`, existingController.colors);
    }
  }
  const encodedCommand = encodeURIComponent(command);
  const terminalUrl = `flowith://terminal/interactive/${commandId}?command=${encodedCommand}`;
  console.log(`[TerminalTab] Creating interactive terminal tab for command: ${command}`);
  console.log(`[TerminalTab] Controller ID: ${controllerId || "system"}`);
  console.log(`[TerminalTab] URL: ${terminalUrl}`);
  const tab = await controller.createTab(terminalUrl, void 0, true);
  console.log(
    `[TerminalTab] Created interactive terminal tab ${tab.id} with ownerId: ${controllerId || "system"}`
  );
  return tab.id;
}
function registerIntelligenceHandlers() {
  electron.ipcMain.handle("intelligence:list", async (_e, type) => {
    return await index$2.K.list(type);
  });
  electron.ipcMain.handle("intelligence:create", async (_e, type) => {
    return await index$2.K.create(type);
  });
  electron.ipcMain.handle("intelligence:rename", async (_e, id, newName) => {
    return await index$2.K.rename(id, newName);
  });
  electron.ipcMain.handle("intelligence:delete", async (_e, id) => {
    return await index$2.K.remove(id);
  });
  electron.ipcMain.handle("intelligence:read", async (_e, id) => {
    return await index$2.K.read(id);
  });
  electron.ipcMain.handle("intelligence:update", async (_e, id, content) => {
    return await index$2.K.update(id, content);
  });
  electron.ipcMain.handle("intelligence:duplicate", async (_e, id) => {
    return await index$2.K.duplicate(id);
  });
  electron.ipcMain.handle("intelligence:deleteHostname", async (_e, hostname) => {
    return await index$2.K.deleteHostname(hostname);
  });
}
function registerTeachModeHandlers() {
  electron.ipcMain.handle("teach-mode:get-state", () => {
    return index$5.t.getState();
  });
  electron.ipcMain.handle("teach-mode:start", async (_event, goal) => {
    return await index$5.t.start(goal);
  });
  electron.ipcMain.handle("teach-mode:finish", async (_event, options) => {
    return await index$5.t.finish(options);
  });
  electron.ipcMain.handle("teach-mode:cancel", async (_event, reason) => {
    return await index$5.t.cancel(reason);
  });
  electron.ipcMain.handle("teach-mode:reset", () => {
    return index$5.t.reset();
  });
  electron.ipcMain.handle("teach-mode:pause", () => {
    return index$5.t.pause();
  });
  electron.ipcMain.handle("teach-mode:resume", () => {
    return index$5.t.resume();
  });
}
function registerUpdateHandlers() {
  electron.ipcMain.handle(
    "update-toast:install",
    async (_event, updateInfo) => {
      log.info("[UpdateIPC] ========== Toast install IPC 被调用 ==========");
      log.info("[UpdateIPC] Toast install triggered, version:", updateInfo?.version);
      log.info("[UpdateIPC] updateInfo 完整内容:", JSON.stringify(updateInfo, null, 2));
      try {
        log.info("[UpdateIPC] 准备调用 autoUpdateService.quitAndInstall");
        await index$4.a.quitAndInstall(updateInfo);
        log.info("[UpdateIPC] quitAndInstall 调用成功");
        return { success: true };
      } catch (error) {
        log.error("[UpdateIPC] ❌ Toast install failed:", error);
        try {
          const details = error instanceof Error ? {
            name: error.name,
            message: error.message,
            stack: error.stack
          } : error;
          log.error("[UpdateIPC] 错误详情对象:", JSON.stringify(details));
        } catch {
        }
        log.error(
          "[UpdateIPC] 错误类型:",
          error instanceof Error ? error.constructor.name : typeof error
        );
        log.error("[UpdateIPC] 错误消息:", error instanceof Error ? error.message : String(error));
        log.error("[UpdateIPC] 错误堆栈:", error instanceof Error ? error.stack : "no stack");
        const errorMsg = error instanceof Error ? error.message : "Install failed";
        return { success: false, error: errorMsg };
      }
    }
  );
  electron.ipcMain.handle("update-toast:dismiss", async () => {
    console.log("[UpdateIPC] Toast dismissed by user");
    try {
      const { updateToast } = await Promise.resolve().then(() => require("./index-vXB5mSwm.js")).then((n) => n.ae);
      updateToast.hide();
    } catch (error) {
      console.error("[UpdateIPC] Hide toast failed:", error);
    }
    return { success: true };
  });
  electron.ipcMain.handle("update-toast:minimize", async () => {
    log.info("[UpdateIPC] Toast minimized by user - 转为静默下载模式");
    try {
      const { updateToast } = await Promise.resolve().then(() => require("./index-vXB5mSwm.js")).then((n) => n.ae);
      const { autoUpdateService: autoUpdateService2 } = await Promise.resolve().then(() => require("./index-CP7J970o.js")).then((n) => n.b);
      updateToast.hide();
      autoUpdateService2.setIsManualCheck(false);
      log.info("[UpdateIPC] 下载将在后台继续，不再显示进度");
    } catch (error) {
      log.error("[UpdateIPC] Minimize toast failed:", error);
    }
    return { success: true };
  });
  electron.ipcMain.handle("update-toast:dismiss-completed", async () => {
    try {
      const { getAppStorage } = await Promise.resolve().then(() => require("./index-Bf0u4cvK.js"));
      const storage = getAppStorage();
      const exists = await storage.fs.exists("config", "update-info.json");
      if (exists) {
        const updateInfo = await storage.fs.readJSON("config", "update-info.json");
        updateInfo.notified = true;
        await storage.fs.writeJSON("config", "update-info.json", updateInfo, { overwrite: true });
        console.log("[UpdateIPC] 更新日志已标记为已通知");
      }
      return { success: true };
    } catch (error) {
      console.error("[UpdateIPC] 更新通知状态失败:", error);
      return { success: false };
    }
  });
  electron.ipcMain.handle("update:download", async () => {
    try {
      await index$4.a.downloadUpdate();
      return { success: true };
    } catch (error) {
      console.error("[UpdateIPC] Download failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Download failed"
      };
    }
  });
  electron.ipcMain.handle("update:install", async () => {
    try {
      await index$4.a.quitAndInstall();
      return { success: true };
    } catch (error) {
      console.error("[UpdateIPC] Install failed:", error);
      return { success: false, error: error instanceof Error ? error.message : "Install failed" };
    }
  });
  electron.ipcMain.handle("update:dismiss", () => {
    index$2.M.hide();
    return { success: true };
  });
  electron.ipcMain.handle("update:open-downloaded-installer", async () => {
    try {
      const res = await index$4.a.openDownloadedInstaller();
      return res;
    } catch (error) {
      console.error("[UpdateIPC] Open installer failed:", error);
      return { success: false, message: error instanceof Error ? error.message : "failed" };
    }
  });
}
function setupAdBlockHandlers() {
  electron.ipcMain.handle("adblock:getEnabled", () => {
    const enabled = index$3.getAppStorage().store.appSettings.get("adBlockEnabled", false);
    return enabled;
  });
  electron.ipcMain.handle("adblock:setEnabled", async (_event, enabled) => {
    try {
      index$3.getAppStorage().store.appSettings.set("adBlockEnabled", enabled);
      const defaultSession = electron.session.defaultSession;
      index$2.N(enabled, defaultSession);
      return {
        success: true,
        message: enabled ? "Ad blocker enabled. Effect is immediate." : "Ad blocker disabled."
      };
    } catch (error) {
      console.error("[AdBlockHandlers] Failed to set ad block:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error"
      };
    }
  });
  electron.ipcMain.handle("adblock:getStats", () => {
    try {
      return index$2.O();
    } catch (error) {
      console.error("[AdBlockHandlers] Failed to get stats:", error);
      return {
        totalBlocked: 0,
        blockedByDomain: 0,
        blockedByPattern: 0,
        recentBlocked: [],
        uptime: 0,
        blacklistSize: { domains: 0, patterns: 0 }
      };
    }
  });
  electron.ipcMain.handle("adblock:resetStats", () => {
    try {
      index$2.Q();
      return { success: true };
    } catch (error) {
      console.error("[AdBlockHandlers] Failed to reset stats:", error);
      return { success: false, message: String(error) };
    }
  });
}
function initializeIpcHandlers() {
  electron.ipcMain.handle(
    "hypergpt-frontend-to-flowith-browser",
    (_event, message) => hypergptFrontendCallback(message)
  );
  electron.ipcMain.handle("knowledge-base-upload", async (_event, data) => {
    return knowledgeBaseManager.uploadText(data);
  });
  electron.ipcMain.handle("knowledge-base-get-state", () => {
    return knowledgeBaseManager.getState();
  });
  electron.ipcMain.handle("knowledge-base-reset", () => {
    knowledgeBaseManager.resetUpload();
  });
  initializeBrowserAgentHandlers();
  initializeRewardPageHandlers();
  index$2.R();
  registerIntelligenceHandlers();
  registerTeachModeHandlers();
  registerAgentPresetHandlers();
  registerBackgroundHandlers();
  registerUpdateHandlers();
  setupAdBlockHandlers();
  electron.ipcMain.handle("clipboard:writeText", (_event, text) => {
    electron.clipboard.writeText(text);
  });
  electron.ipcMain.handle("clipboard:readText", () => {
    return electron.clipboard.readText();
  });
  electron.ipcMain.handle("debug:get-log-path", async () => {
    try {
      const log2 = (await import("electron-log")).default;
      const logPath = log2.transports.file.getFile().path;
      console.log("[IPC] 日志文件路径:", logPath);
      return { success: true, path: logPath };
    } catch (error) {
      console.error("[IPC] 获取日志路径失败:", error);
      return { success: false, error: String(error) };
    }
  });
  let invitationCodesCache = null;
  const CACHE_DURATION = 3e4;
  let fetchInProgress = false;
  const pendingRequests = [];
  async function fetchInvitationCodesWithCache() {
    try {
      const now = Date.now();
      const cacheAge = invitationCodesCache ? now - invitationCodesCache.timestamp : null;
      if (invitationCodesCache && now - invitationCodesCache.timestamp < CACHE_DURATION) {
        console.log(`[IPC] Returning cached invitation codes (age: ${cacheAge}ms)`);
        return invitationCodesCache.data;
      }
      if (fetchInProgress) {
        console.log(`[IPC] Fetch in progress, queueing request (queue size: ${pendingRequests.length + 1})`);
        return new Promise((resolve) => {
          pendingRequests.push(resolve);
        });
      }
      fetchInProgress = true;
      const { supabaseManager } = await Promise.resolve().then(() => require("./supabaseManager-BAbRVJxx.js")).then((n) => n.f);
      const session = await supabaseManager.getSession();
      if (!session?.access_token) {
        config.b(false);
        const result = { error: "Not logged in", codes: [] };
        fetchInProgress = false;
        pendingRequests.forEach((resolve) => resolve(result));
        pendingRequests.length = 0;
        return result;
      }
      const { getWorkerURL } = await Promise.resolve().then(() => require("./supabaseManager-BAbRVJxx.js")).then((n) => n.e);
      const workerUrl = getWorkerURL();
      const response = await fetch(`${workerUrl}/user/os-invitation/my-codes`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${session.access_token}`
        }
      });
      if (!response.ok) {
        console.error("[IPC] Failed to fetch invitation codes:", response.status);
        config.b(false);
        const result = { error: "Failed to fetch codes", codes: [] };
        fetchInProgress = false;
        pendingRequests.forEach((resolve) => resolve(result));
        pendingRequests.length = 0;
        return result;
      }
      const data = await response.json();
      const hasCodes = Array.isArray(data?.codes) && data.codes.length > 0;
      config.b(hasCodes);
      invitationCodesCache = {
        data,
        timestamp: Date.now()
      };
      fetchInProgress = false;
      if (pendingRequests.length > 0) {
        console.log(`[IPC] API fetch complete, resolving ${pendingRequests.length} queued requests`);
        pendingRequests.forEach((resolve) => resolve(data));
        pendingRequests.length = 0;
      } else {
        console.log("[IPC] API fetch complete, no pending requests");
      }
      return data;
    } catch (error) {
      console.error("[IPC] Error fetching invitation codes:", error);
      config.b(false);
      const result = { error: "Network error", codes: [] };
      fetchInProgress = false;
      pendingRequests.forEach((resolve) => resolve(result));
      pendingRequests.length = 0;
      return result;
    }
  }
  global.__cachedFetchInvitationCodes = fetchInvitationCodesWithCache;
  electron.ipcMain.handle("os-invitation:get-my-codes", fetchInvitationCodesWithCache);
  electron.ipcMain.on("window:minimize", () => {
    const mainWindow = index$2.g();
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.minimize();
    }
  });
  electron.ipcMain.on("window:close", () => {
    const mainWindow = index$2.g();
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.close();
    }
  });
  electron.ipcMain.on("window:toggle-fullscreen", () => {
    const mainWindow = index$2.g();
    if (!mainWindow || mainWindow.isDestroyed()) return;
    if (process.platform === "win32") {
      if (mainWindow.isMaximized()) mainWindow.unmaximize();
      else mainWindow.maximize();
    } else {
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
    }
  });
  electron.ipcMain.handle("auto-update:check", async () => {
    console.log("🔍 [IPC] auto-update:check 被调用");
    try {
      const { autoUpdateService: autoUpdateService2 } = await Promise.resolve().then(() => require("./index-CP7J970o.js")).then((n) => n.b);
      console.log("🔍 [IPC] autoUpdateService 已导入，调用 checkManually()");
      const hasUpdate = await autoUpdateService2.checkManually();
      console.log("🔍 [IPC] checkManually() 返回:", hasUpdate);
      return { success: true, hasUpdate };
    } catch (error) {
      console.error("🔍 [IPC] auto-update:check 失败:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Check for updates failed"
      };
    }
  });
  electron.ipcMain.handle("auto-update:download", async () => {
    try {
      const { autoUpdateService: autoUpdateService2 } = await Promise.resolve().then(() => require("./index-CP7J970o.js")).then((n) => n.b);
      await autoUpdateService2.downloadUpdate();
      return { success: true };
    } catch (error) {
      console.error("[IPC] auto-update:download 失败:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "下载失败"
      };
    }
  });
  electron.ipcMain.handle("auto-update:install", async () => {
    try {
      await index$4.a.quitAndInstall();
      return { success: true };
    } catch (error) {
      console.error("[IPC] auto-update:install 失败:", error);
      return { success: false, error: error instanceof Error ? error.message : "安装失败" };
    }
  });
  electron.ipcMain.handle("auto-update:clear-cache", async () => {
    try {
      const { autoUpdateService: autoUpdateService2 } = await Promise.resolve().then(() => require("./index-CP7J970o.js")).then((n) => n.b);
      const result = await autoUpdateService2.clearUpdateCache();
      return { success: true, ...result };
    } catch (error) {
      console.error("[IPC] auto-update:clear-cache 失败:", error);
      return {
        success: false,
        removed: 0,
        freedBytes: 0,
        message: error instanceof Error ? error.message : "Unknown error"
      };
    }
  });
  electron.ipcMain.handle("auto-update:get-version", () => {
    try {
      return {
        version: index$4.a.getCurrentVersion(),
        channel: index$4.a.getCurrentChannel()
      };
    } catch (error) {
      console.error("[IPC] auto-update:get-version 失败:", error);
      return { version: "unknown", channel: "stable" };
    }
  });
  electron.ipcMain.handle("auto-update:set-channel", async (_event, ch) => {
    try {
      const { autoUpdateService: autoUpdateService2 } = await Promise.resolve().then(() => require("./index-CP7J970o.js")).then((n) => n.b);
      const res = await autoUpdateService2.setUpdateChannel(ch);
      return res;
    } catch (error) {
      console.error("[IPC] auto-update:set-channel 失败:", error);
      return { success: false };
    }
  });
  electron.ipcMain.handle("auto-update:get-channel", async () => {
    try {
      const { autoUpdateService: autoUpdateService2 } = await Promise.resolve().then(() => require("./index-CP7J970o.js")).then((n) => n.b);
      const ch = await autoUpdateService2.resolveCurrentChannel();
      return { channel: ch || autoUpdateService2.getCurrentChannel() };
    } catch (error) {
      console.error("[IPC] auto-update:get-channel 失败:", error);
      return { channel: "stable" };
    }
  });
  electron.ipcMain.handle("app-update:get-access", async () => {
    try {
      const { getUserAccess } = await Promise.resolve().then(() => require("./appUpdateApi-BCFEadMj.js"));
      const access = await getUserAccess();
      return access;
    } catch (error) {
      console.error("[IPC] app-update:get-access 失败:", error);
      return { channels: ["stable"], currentChannel: "stable" };
    }
  });
  electron.ipcMain.handle("auto-update:get-state", () => {
    try {
      return { state: index$4.a.getUpdateState() };
    } catch (error) {
      console.error("[IPC] auto-update:get-state 失败:", error);
      return { state: "idle" };
    }
  });
  if (index$2.P.isSupported()) {
    const ptyManager = index$2.P.getInstance();
    electron.ipcMain.handle("pty:spawn", (event, options) => {
      try {
        const processId = ptyManager.spawn(options, event.sender.id);
        return { processId };
      } catch (error) {
        console.error("[IPC] pty:spawn failed:", error);
        throw error;
      }
    });
    electron.ipcMain.on("pty:write", (_event, { processId, data }) => {
      ptyManager.write(processId, data);
    });
    electron.ipcMain.on("pty:resize", (_event, { processId, cols, rows }) => {
      ptyManager.resize(processId, cols, rows);
    });
    electron.ipcMain.on("pty:kill", (_event, { processId }) => {
      ptyManager.kill(processId);
    });
    electron.ipcMain.handle("pty:register-tab", (_event, { tabId, processId }) => {
      ptyManager.registerTabProcess(tabId, processId);
      return { success: true };
    });
    electron.ipcMain.handle("pty:write-to-tab", (_event, { tabId, text }) => {
      const success = ptyManager.writeToTab(tabId, text);
      return { success };
    });
  } else {
    console.log("[IPC] ⚠️  PTY handlers 跳过 (不支持当前平台)");
  }
  mainEventBus.m.on("terminal-tab:create", (data) => {
    console.log("[MainEventBus] 收到 terminal-tab:create 请求:", data);
    createTerminalTabForCommand(data.commandId, data.command, data.controllerId).then((tabId) => {
      console.log("[MainEventBus] 终端tab创建成功:", tabId);
      mainEventBus.m.emit("terminal-tab:created", {
        commandId: data.commandId,
        tabId
      });
    }).catch((error) => {
      console.error("[MainEventBus] 创建终端tab失败:", error);
    });
  });
  electron.ipcMain.on("terminal:ready", (_event, data) => {
    console.log("[IPC] 收到 terminal:ready 事件:", data);
    mainEventBus.m.emit("terminal:ready", data);
  });
  electron.ipcMain.on(
    "terminal:interactive-input",
    (_event, payload) => {
      const command = payload?.command ?? "";
      if (!command) return;
      if (payload?.tabId) {
        index$2.l.recordOutput(payload.tabId, `\r
$ ${command}\r
`);
      }
    }
  );
  electron.ipcMain.on(
    "terminal:interactive-output",
    (_event, payload) => {
      const chunk = typeof payload?.chunk === "string" ? payload.chunk : "";
      if (payload?.tabId && chunk) {
        index$2.l.recordOutput(payload.tabId, chunk);
      }
    }
  );
  electron.ipcMain.on(
    "terminal:interactive-exit",
    (_event, payload) => {
      if (payload?.tabId) {
        const exitCode = payload.exitCode ?? 0;
        index$2.l.markCommandComplete(payload.tabId, exitCode);
        console.log(`[IPC] Terminal 命令完成: ${payload.tabId}, exitCode: ${exitCode}`);
      }
    }
  );
  mainEventBus.m.on("tabs:removed", ({ tabId }) => {
    console.log(`[Terminal Cleanup] Tab ${tabId} removed, checking for terminal resources...`);
    if (index$2.P.isSupported()) {
      const ptyManager = index$2.P.getInstance();
      const processId = ptyManager.getProcessIdByTab(tabId);
      if (processId !== null) {
        console.log(`[Terminal Cleanup] Killing PTY process ${processId} for tab ${tabId}`);
        try {
          ptyManager.kill(processId);
          console.log(`[Terminal Cleanup] ✅ PTY process ${processId} cleaned up`);
        } catch (error) {
          console.error(`[Terminal Cleanup] ⚠️ Failed to kill PTY process ${processId}:`, error);
        }
      }
    }
    if (index$2.l.isSupported) {
      try {
        index$2.l.close(tabId);
        console.log(`[Terminal Cleanup] ✅ Terminal snapshot for tab ${tabId} cleaned up`);
      } catch (error) {
        console.error(
          `[Terminal Cleanup] ⚠️ Failed to cleanup terminal snapshot for ${tabId}:`,
          error
        );
      }
    }
    console.log(`[Terminal Cleanup] ✅ Cleanup complete for tab ${tabId}`);
  });
  electron.ipcMain.handle("get-node-version", () => {
    try {
      const paths = [
        "/usr/local/bin/node",
        "/opt/homebrew/bin/node",
        "/usr/bin/node",
        `${os.homedir()}/.nvm/current/bin/node`,
        "node"
        // fallback to PATH
      ];
      for (const nodePath of paths) {
        try {
          const version = child_process.execSync(`${nodePath} -v`, {
            encoding: "utf8",
            timeout: 1e3
          }).trim();
          console.log(`[IPC] Got node version from ${nodePath}:`, version);
          return version;
        } catch {
          continue;
        }
      }
      console.warn("[IPC] Could not find node binary, using Electron node version");
      return process.versions.node ? `v${process.versions.node}` : null;
    } catch (error) {
      console.error("[IPC] Failed to get node version:", error);
      return process.versions.node ? `v${process.versions.node}` : null;
    }
  });
  electron.ipcMain.handle("get-node-version-from-shell", () => {
    try {
      const shell = process.env.SHELL || "/bin/zsh";
      const output = child_process.execSync(`${shell} -i -l -c "node -v 2>/dev/null || echo 'not-found'"`, {
        encoding: "utf8",
        timeout: 3e3,
        env: {
          ...process.env,
          HOME: os.homedir()
        }
      });
      const cleanOutput = output.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, "");
      const match = cleanOutput.match(/v\d+\.\d+\.\d+/);
      const version = match ? match[0] : "not-found";
      return version;
    } catch (error) {
      console.error("[IPC] Failed to get node version from shell:", error);
      return "not-found";
    }
  });
  electron.ipcMain.handle("get-cwd", () => {
    try {
      return os.homedir();
    } catch (error) {
      console.error("[IPC] Failed to get home dir:", error);
      return os.homedir();
    }
  });
  electron.ipcMain.handle("get-home-dir", () => {
    return os.homedir();
  });
  electron.ipcMain.handle("get-git-branch", (_event, cwd) => {
    try {
      const targetDir = cwd || process.cwd();
      const branch = child_process.execSync("git branch --show-current 2>/dev/null", {
        encoding: "utf8",
        cwd: targetDir,
        timeout: 1e3
      }).trim();
      return branch || null;
    } catch {
      return null;
    }
  });
  electron.ipcMain.handle("get-git-branches", (_event, cwd) => {
    try {
      const targetDir = cwd || process.cwd();
      const output = child_process.execSync("git branch --all 2>/dev/null", {
        encoding: "utf8",
        cwd: targetDir,
        timeout: 2e3
      });
      const branches = output.split("\n").map(
        (line) => line.trim().replace(/^\*\s+/, "").replace(/^remotes\/origin\//, "")
      ).filter((branch) => branch && branch !== "HEAD").filter((branch, index2, self) => self.indexOf(branch) === index2).sort();
      return branches;
    } catch (error) {
      console.error("[IPC] Failed to get git branches:", error);
      return [];
    }
  });
  electron.ipcMain.handle("get-directory-navigation", (_event, currentPath) => {
    try {
      const absolutePath = currentPath.startsWith("~") ? currentPath.replace("~", os.homedir()) : currentPath;
      const result = [];
      const parentDir = path.dirname(absolutePath);
      if (parentDir !== absolutePath) {
        const parentName = parentDir === os.homedir() ? "~" : path.basename(parentDir);
        result.push({
          name: `.. (${parentName})`,
          path: parentDir,
          type: "parent"
        });
      }
      try {
        const siblings = fs__namespace$1.readdirSync(parentDir, { withFileTypes: true }).filter(
          (dirent) => dirent.isDirectory() && !dirent.name.startsWith(".") && path.join(parentDir, dirent.name) !== absolutePath
        ).map((dirent) => ({
          name: dirent.name,
          path: path.join(parentDir, dirent.name),
          type: "sibling"
        })).sort(
          (a, b) => a.name.localeCompare(b.name)
        ).slice(0, 6);
        result.push(...siblings);
      } catch (err) {
        console.error("[IPC] Failed to read siblings:", err);
      }
      try {
        const children = fs__namespace$1.readdirSync(absolutePath, { withFileTypes: true }).filter((dirent) => dirent.isDirectory() && !dirent.name.startsWith(".")).map((dirent) => ({
          name: dirent.name,
          path: path.join(absolutePath, dirent.name),
          type: "child"
        })).sort(
          (a, b) => a.name.localeCompare(b.name)
        ).slice(0, 8);
        result.push(...children);
      } catch (err) {
        console.error("[IPC] Failed to read children:", err);
      }
      return result;
    } catch (error) {
      console.error("[IPC] Failed to get directory navigation:", error);
      return [];
    }
  });
  registerAnalyticsHandlers();
  electron.ipcMain.handle("download:getAll", async () => {
    try {
      const { downloadManager } = await Promise.resolve().then(() => require("./downloadManager-D2zb6fqP.js"));
      return await downloadManager.getAllDownloads();
    } catch (error) {
      console.error("[IPC] Failed to get downloads:", error);
      return [];
    }
  });
  electron.ipcMain.handle("download:getStats", async () => {
    try {
      const { downloadManager } = await Promise.resolve().then(() => require("./downloadManager-D2zb6fqP.js"));
      return await downloadManager.getStats();
    } catch (error) {
      console.error("[IPC] Failed to get download stats:", error);
      return { total: 0, progressing: 0, completed: 0, failed: 0, cancelled: 0 };
    }
  });
  electron.ipcMain.handle("download:pause", async (_event, id) => {
    try {
      const { downloadManager } = await Promise.resolve().then(() => require("./downloadManager-D2zb6fqP.js"));
      return downloadManager.pauseDownload(id);
    } catch (error) {
      console.error("[IPC] Failed to pause download:", error);
      return false;
    }
  });
  electron.ipcMain.handle("download:resume", async (_event, id) => {
    try {
      const { downloadManager } = await Promise.resolve().then(() => require("./downloadManager-D2zb6fqP.js"));
      return downloadManager.resumeDownload(id);
    } catch (error) {
      console.error("[IPC] Failed to resume download:", error);
      return false;
    }
  });
  electron.ipcMain.handle("download:cancel", async (_event, id) => {
    try {
      const { downloadManager } = await Promise.resolve().then(() => require("./downloadManager-D2zb6fqP.js"));
      return downloadManager.cancelDownload(id);
    } catch (error) {
      console.error("[IPC] Failed to cancel download:", error);
      return false;
    }
  });
  electron.ipcMain.handle("download:remove", async (_event, id) => {
    try {
      const { downloadManager } = await Promise.resolve().then(() => require("./downloadManager-D2zb6fqP.js"));
      return await downloadManager.removeDownload(id);
    } catch (error) {
      console.error("[IPC] Failed to remove download:", error);
      return false;
    }
  });
  electron.ipcMain.handle("download:removeBatch", async (_event, ids) => {
    try {
      const { downloadManager } = await Promise.resolve().then(() => require("./downloadManager-D2zb6fqP.js"));
      return await downloadManager.removeBatch(ids);
    } catch (error) {
      console.error("[IPC] Failed to remove downloads:", error);
      return 0;
    }
  });
  electron.ipcMain.handle("download:clearAll", async () => {
    try {
      const { downloadManager } = await Promise.resolve().then(() => require("./downloadManager-D2zb6fqP.js"));
      return await downloadManager.clearAll();
    } catch (error) {
      console.error("[IPC] Failed to clear downloads:", error);
      return 0;
    }
  });
  electron.ipcMain.handle("download:openFile", async (_event, path2) => {
    try {
      const { shell } = await import("electron");
      await shell.openPath(path2);
      return true;
    } catch (error) {
      console.error("[IPC] Failed to open file:", error);
      return false;
    }
  });
  electron.ipcMain.handle("file:read-content", async (_event, filePath) => {
    try {
      const fs2 = await import("fs/promises");
      const content = await fs2.readFile(filePath, "utf8");
      return { success: true, content };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  });
  electron.ipcMain.handle(
    "file:save-content",
    async (_event, { filePath, content }) => {
      try {
        const fs2 = await import("fs/promises");
        await fs2.writeFile(filePath, content, "utf8");
        return { success: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: message };
      }
    }
  );
  electron.ipcMain.handle(
    "file:create-preview",
    async (_event, { originalPath, content }) => {
      try {
        const fs2 = await import("fs/promises");
        const path2 = await import("path");
        const dirPath = path2.dirname(originalPath);
        const fileName = path2.basename(originalPath);
        const ext = path2.extname(fileName);
        const baseName = path2.basename(fileName, ext);
        const previewFileName = `.preview_${baseName}${ext}`;
        const previewPath = path2.join(dirPath, previewFileName);
        await fs2.writeFile(previewPath, content, "utf8");
        return { success: true, previewPath };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: message };
      }
    }
  );
  electron.ipcMain.handle("file:delete-preview", async (_event, previewPath) => {
    try {
      const fs2 = await import("fs/promises");
      await fs2.unlink(previewPath);
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  });
  electron.ipcMain.handle("file:get-stats", async (_event, filePath) => {
    try {
      const fs2 = await import("fs/promises");
      const stats = await fs2.stat(filePath);
      return {
        success: true,
        mtime: stats.mtimeMs,
        ctime: stats.ctimeMs
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  });
  electron.ipcMain.handle("download:showInFolder", async (_event, path2) => {
    try {
      const { shell } = await import("electron");
      shell.showItemInFolder(path2);
      return true;
    } catch (error) {
      console.error("[IPC] Failed to show in folder:", error);
      return false;
    }
  });
  mainEventBus.m.on("download:started", (data) => {
    index$2.t.tabs.forEach((tab) => {
      try {
        const view = tab.getView();
        view.webContents.send("download:started", data);
      } catch {
      }
    });
  });
  mainEventBus.m.on("download:progress", (data) => {
    index$2.t.tabs.forEach((tab) => {
      try {
        const view = tab.getView();
        view.webContents.send("download:progress", data);
      } catch {
      }
    });
  });
  mainEventBus.m.on("download:completed", (data) => {
    index$2.t.tabs.forEach((tab) => {
      try {
        const view = tab.getView();
        view.webContents.send("download:completed", data);
      } catch {
      }
    });
  });
  mainEventBus.m.on("download:failed", (data) => {
    index$2.t.tabs.forEach((tab) => {
      try {
        const view = tab.getView();
        view.webContents.send("download:failed", data);
      } catch {
      }
    });
  });
  mainEventBus.m.on("download:cancelled", (data) => {
    index$2.t.tabs.forEach((tab) => {
      try {
        const view = tab.getView();
        view.webContents.send("download:cancelled", data);
      } catch {
      }
    });
  });
}
class CookieDecryptor {
  static keychainPasswordCache = /* @__PURE__ */ new Map();
  static derivedKeyCache = /* @__PURE__ */ new Map();
  static materialsCache = /* @__PURE__ */ new Map();
  static serviceNameCandidates = {
    chrome: ["Chrome Safe Storage"],
    comet: ["Comet Safe Storage", "Chromium Safe Storage"],
    edge: ["Microsoft Edge Safe Storage"],
    arc: ["Arc Safe Storage", "Chromium Safe Storage"]
  };
  static getCacheKey(browserType, localStatePath) {
    return `${browserType}:${localStatePath}`;
  }
  static getKeychainPassword(browserType) {
    if (this.keychainPasswordCache.has(browserType)) {
      return this.keychainPasswordCache.get(browserType);
    }
    const candidates = this.serviceNameCandidates[browserType];
    let lastError = null;
    for (const serviceName of candidates) {
      try {
        const password = child_process.execSync(`security find-generic-password -w -s "${serviceName}"`, {
          encoding: "utf8"
        }).trim();
        this.keychainPasswordCache.set(browserType, password);
        return password;
      } catch (error) {
        lastError = error;
      }
    }
    const message = lastError instanceof Error ? lastError.message : "unknown keychain error";
    throw new Error(`Failed to read keychain password for ${browserType}: ${message}`);
  }
  static getDerivedKey(browserType) {
    if (this.derivedKeyCache.has(browserType)) {
      return this.derivedKeyCache.get(browserType);
    }
    const password = this.getKeychainPassword(browserType);
    const salt = Buffer.from("saltysalt");
    const iterations = 1003;
    const keyLength = 32;
    const hash = "sha1";
    const derivedKey = crypto__namespace.pbkdf2Sync(password, salt, iterations, keyLength, hash);
    this.derivedKeyCache.set(browserType, derivedKey);
    return derivedKey;
  }
  static decryptMasterKey(localStatePath, baseKey) {
    if (!localStatePath) {
      throw new Error("Local State path is required to decrypt master key");
    }
    if (!fs__namespace$1.existsSync(localStatePath)) {
      throw new Error(`Local State file not found: ${localStatePath}`);
    }
    let rawContent;
    try {
      rawContent = fs__namespace$1.readFileSync(localStatePath, "utf8");
    } catch (error) {
      throw new Error(`Unable to read Local State: ${error.message}`);
    }
    let localState;
    try {
      localState = JSON.parse(rawContent);
    } catch (error) {
      throw new Error(`Invalid Local State JSON: ${error.message}`);
    }
    const encryptedKeyBase64 = localState?.os_crypt?.encrypted_key;
    if (!encryptedKeyBase64) {
      throw new Error("Local State does not contain os_crypt.encrypted_key");
    }
    const encryptedKey = Buffer.from(encryptedKeyBase64, "base64");
    if (encryptedKey.length === 0) {
      throw new Error("Encrypted master key is empty");
    }
    const prefix = encryptedKey.slice(0, 5).toString("utf8");
    if (prefix.startsWith("DPAPI")) {
      if (process.platform !== "win32") {
        throw new Error("DPAPI encrypted master key is only supported on Windows");
      }
      if (!dpapi.isPlatformSupported) {
        throw new Error("@primno/dpapi is not supported on this platform");
      }
      const encryptedData = encryptedKey.slice(5);
      try {
        const decrypted = dpapi.Dpapi.unprotectData(encryptedData, null, "CurrentUser");
        return Buffer.from(decrypted);
      } catch (error) {
        throw new Error(`DPAPI decryption failed: ${error.message}`);
      }
    }
    const version = encryptedKey.slice(0, 3).toString();
    if ((version === "v10" || version === "v11") && encryptedKey.length > 31) {
      try {
        return this.decryptGcmPayload(encryptedKey, baseKey);
      } catch (primaryError) {
        try {
          const fallbackKey = baseKey.slice(0, 16);
          const decrypted = this.decryptGcmPayload(encryptedKey, fallbackKey);
          return decrypted;
        } catch {
          throw primaryError;
        }
      }
    }
    return encryptedKey;
  }
  static decryptGcmPayload(payload, key) {
    const version = payload.slice(0, 3).toString();
    if (version !== "v10" && version !== "v11") {
      throw new Error(`Unsupported GCM payload version: ${version}`);
    }
    if (payload.length <= 31) {
      throw new Error("GCM payload is too short");
    }
    const nonce = payload.slice(3, 15);
    const ciphertext = payload.slice(15, payload.length - 16);
    const authTag = payload.slice(payload.length - 16);
    if (ciphertext.length === 0) {
      throw new Error("GCM ciphertext is empty");
    }
    const algorithm = key.length === 16 ? "aes-128-gcm" : "aes-256-gcm";
    const decipher = crypto__namespace.createDecipheriv(algorithm, key, nonce);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return decrypted;
  }
  static decryptLegacyCbc(payload, legacyKey) {
    const version = payload.slice(0, 3).toString();
    if (version !== "v10" && version !== "v11") {
      throw new Error(`Unsupported legacy payload version: ${version}`);
    }
    const encrypted = payload.slice(3);
    const iv = Buffer.alloc(16, " ");
    const decipher = crypto__namespace.createDecipheriv("aes-128-cbc", legacyKey, iv);
    decipher.setAutoPadding(true);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    if (decrypted.length > 32) {
      return decrypted.slice(32);
    }
    return decrypted;
  }
  /**
   * 获取 Local State 文件路径
   */
  static getLocalStatePath(browserType) {
    const isWindows = process.platform === "win32";
    const isMac = process.platform === "darwin";
    const baseDir = isWindows ? process.env.LOCALAPPDATA || path__namespace.join(os__namespace.homedir(), "AppData", "Local") : isMac ? path__namespace.join(os__namespace.homedir(), "Library/Application Support") : path__namespace.join(os__namespace.homedir(), ".config");
    const pathMap = {
      chrome: isWindows ? path__namespace.join(baseDir, "Google", "Chrome", "User Data", "Local State") : isMac ? path__namespace.join(baseDir, "Google/Chrome/Local State") : path__namespace.join(baseDir, "google-chrome", "Local State"),
      edge: isWindows ? path__namespace.join(baseDir, "Microsoft", "Edge", "User Data", "Local State") : isMac ? path__namespace.join(baseDir, "Microsoft Edge/Local State") : path__namespace.join(baseDir, "microsoft-edge", "Local State"),
      comet: isWindows ? path__namespace.join(baseDir, "Comet", "User Data", "Local State") : isMac ? path__namespace.join(baseDir, "Comet/Local State") : path__namespace.join(baseDir, "comet", "Local State"),
      arc: isWindows ? path__namespace.join(baseDir, "Arc", "User Data", "Local State") : isMac ? path__namespace.join(baseDir, "Arc/Local State") : path__namespace.join(baseDir, "arc", "Local State")
    };
    return pathMap[browserType];
  }
  static getEncryptionMaterials(browserType, localStatePath) {
    if (!localStatePath) {
      localStatePath = this.getLocalStatePath(browserType);
    }
    const cacheKey = this.getCacheKey(browserType, localStatePath);
    if (this.materialsCache.has(cacheKey)) {
      return this.materialsCache.get(cacheKey);
    }
    let masterKey;
    let legacyKey;
    const gcmKeys = [];
    if (process.platform === "win32") {
      try {
        masterKey = this.decryptMasterKey(localStatePath, Buffer.alloc(0));
        if (masterKey) {
          gcmKeys.push(masterKey);
        }
      } catch (error) {
        console.warn("🥷 [CookieDecryptor] Windows DPAPI 解密失败:", error);
        masterKey = void 0;
      }
      legacyKey = Buffer.alloc(16, 0);
      gcmKeys.push(legacyKey);
    } else {
      const baseKey = this.getDerivedKey(browserType);
      legacyKey = baseKey.slice(0, 16);
      try {
        masterKey = this.decryptMasterKey(localStatePath, baseKey);
      } catch {
        masterKey = void 0;
      }
      if (masterKey) {
        gcmKeys.push(masterKey);
      }
      gcmKeys.push(baseKey);
      if (!gcmKeys.some((key) => key.length === legacyKey.length)) {
        gcmKeys.push(legacyKey);
      }
    }
    const materials = { masterKey, legacyKey, gcmKeys };
    this.materialsCache.set(cacheKey, materials);
    return materials;
  }
  static decryptCookieValue(encryptedValue, materials) {
    if (!encryptedValue || encryptedValue.length === 0) {
      return null;
    }
    const version = encryptedValue.slice(0, 3).toString();
    if (version !== "v10" && version !== "v11") {
      return encryptedValue.toString("utf8");
    }
    for (const key of materials.gcmKeys) {
      try {
        const decrypted = this.decryptGcmPayload(encryptedValue, key);
        return decrypted.toString("utf8");
      } catch {
      }
    }
    try {
      const decryptedLegacy = this.decryptLegacyCbc(encryptedValue, materials.legacyKey);
      return decryptedLegacy.toString("utf8");
    } catch {
      return null;
    }
  }
  static decryptCookies(cookies, materials) {
    const decrypted = [];
    for (const cookie of cookies) {
      let value = null;
      if (cookie.value && cookie.value.length > 0) {
        value = cookie.value;
      } else if (cookie.encrypted_value && cookie.encrypted_value.length > 0) {
        value = this.decryptCookieValue(cookie.encrypted_value, materials);
      }
      if (value) {
        decrypted.push({ name: cookie.name, value });
      }
    }
    return decrypted;
  }
  static clearCache() {
    this.keychainPasswordCache.clear();
    this.derivedKeyCache.clear();
    this.materialsCache.clear();
  }
}
class CookieImporter {
  /**
   * 获取浏览器 Cookie 文件路径（跨平台）
   */
  static getCookiePath(browserType) {
    const isWindows = process.platform === "win32";
    const isMac = process.platform === "darwin";
    const baseDir = isWindows ? process.env.LOCALAPPDATA || path__namespace.join(os__namespace.homedir(), "AppData", "Local") : isMac ? path__namespace.join(os__namespace.homedir(), "Library/Application Support") : path__namespace.join(os__namespace.homedir(), ".config");
    const pathConfigs = {
      chrome: isWindows ? path__namespace.join(baseDir, "Google", "Chrome", "User Data", "Default", "Network", "Cookies") : isMac ? path__namespace.join(baseDir, "Google/Chrome/Default/Cookies") : path__namespace.join(baseDir, "google-chrome", "Default", "Cookies"),
      edge: isWindows ? path__namespace.join(baseDir, "Microsoft", "Edge", "User Data", "Default", "Network", "Cookies") : isMac ? path__namespace.join(baseDir, "Microsoft Edge/Default/Cookies") : path__namespace.join(baseDir, "microsoft-edge", "Default", "Cookies"),
      comet: isWindows ? path__namespace.join(baseDir, "Comet", "User Data", "Default", "Network", "Cookies") : isMac ? path__namespace.join(baseDir, "Comet/Default/Cookies") : path__namespace.join(baseDir, "comet", "Default", "Cookies"),
      arc: isWindows ? path__namespace.join(baseDir, "Arc", "User Data", "Default", "Network", "Cookies") : isMac ? path__namespace.join(os__namespace.homedir(), "Library/Application Support/Arc/User Data/Default/Cookies") : path__namespace.join(baseDir, "arc", "User Data", "Default", "Cookies")
    };
    return pathConfigs[browserType] || "";
  }
  static async importFromChromium(browserType) {
    if (browserType === "arc") {
      console.log("🥷 [CookieImporter] Arc 浏览器 detected，开始导入 cookies...");
    }
    const cookiesPath = this.getCookiePath(browserType);
    if (!fs__namespace$1.existsSync(cookiesPath)) {
      if (browserType === "arc") {
        console.warn("🥷 [CookieImporter] 未找到 Arc Cookies 数据库:", cookiesPath);
      }
      return {
        success: false,
        total: 0,
        imported: 0,
        failed: 0,
        errors: [`${browserType} Cookies database not found: ${cookiesPath}`]
      };
    }
    try {
      const profileDir = path__namespace.dirname(cookiesPath);
      const isInNetworkFolder = profileDir.endsWith("Network");
      const browserRootDir = isInNetworkFolder ? path__namespace.resolve(profileDir, "..", "..") : path__namespace.resolve(profileDir, "..");
      const localStatePath = path__namespace.join(browserRootDir, "Local State");
      const encryptionMaterials = CookieDecryptor.getEncryptionMaterials(
        browserType,
        localStatePath
      );
      if (browserType === "arc") {
        console.log("🥷 [CookieImporter] Arc Local State 路径:", localStatePath);
      }
      const tempPath = path__namespace.join(os__namespace.tmpdir(), `cookies-${Date.now()}.db`);
      fs__namespace$1.copyFileSync(cookiesPath, tempPath);
      const db = client.createClient({ url: `file:${tempPath}` });
      const queryWithTimeout = async (promise, timeoutMs) => {
        return Promise.race([
          promise,
          new Promise(
            (_, reject) => setTimeout(() => reject(new Error("Query timeout")), timeoutMs)
          )
        ]);
      };
      const result = await queryWithTimeout(
        db.execute(
          "SELECT host_key, name, value, encrypted_value, path, CAST(expires_utc AS TEXT) as expires_utc, is_secure, is_httponly, samesite FROM cookies LIMIT 1000"
        ),
        5e3
      );
      const cookies = result.rows.map((row) => ({
        host_key: row.host_key,
        name: row.name,
        value: row.value,
        encrypted_value: Buffer.from(row.encrypted_value),
        path: row.path,
        expires_utc: row.expires_utc,
        is_secure: row.is_secure,
        is_httponly: row.is_httponly,
        samesite: row.samesite
      }));
      await db.close();
      let imported = 0;
      let failed = 0;
      const errors = [];
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        try {
          let rawValue = cookie.value;
          if (!rawValue || rawValue.length === 0) {
            const decrypted = CookieDecryptor.decryptCookieValue(
              cookie.encrypted_value,
              encryptionMaterials
            );
            rawValue = decrypted ?? "";
          }
          if (!rawValue || rawValue.length === 0) {
            failed++;
            continue;
          }
          let hostKey = cookie.host_key;
          const isHostPrefixed = cookie.name.startsWith("__Host-");
          let urlHost;
          if (isHostPrefixed && hostKey.startsWith(".")) {
            if (hostKey === ".google.com") {
              urlHost = "accounts.google.com";
            } else {
              urlHost = hostKey.substring(1);
            }
          } else {
            urlHost = hostKey.startsWith(".") ? hostKey.substring(1) : hostKey;
          }
          const needsSecure = isHostPrefixed || cookie.name.startsWith("__Secure-") || cookie.is_secure === 1;
          const protocol = needsSecure ? "https://" : "http://";
          const url = `${protocol}${urlHost}${cookie.path}`;
          let expirationDate;
          const expiresUtcBigInt = BigInt(cookie.expires_utc);
          if (expiresUtcBigInt > 0n) {
            const unixTimestamp = Number((expiresUtcBigInt - 11644473600000000n) / 1000000n);
            const now = Date.now() / 1e3;
            if (unixTimestamp < now) {
              failed++;
              continue;
            }
            expirationDate = unixTimestamp;
          }
          let cleanValue = rawValue.replace(/[\x00-\x1F\x7F-\x9F]/g, "").replace(/[^\x20-\x7E\xA0-\xFF]/g, "").trim();
          if (!cleanValue || cleanValue.length === 0) {
            failed++;
            continue;
          }
          if (/[\uFFFD\u0000-\u001F]/.test(cleanValue)) {
            failed++;
            continue;
          }
          let sameSite;
          if (cookie.samesite === 0) sameSite = "no_restriction";
          else if (cookie.samesite === 1) sameSite = "lax";
          else if (cookie.samesite === 2) sameSite = "strict";
          else sameSite = "unspecified";
          const isSecurePrefixed = cookie.name.startsWith("__Secure-");
          const cookieConfig = {
            url,
            name: cookie.name,
            value: cleanValue,
            path: isHostPrefixed ? "/" : cookie.path || "/",
            secure: isHostPrefixed || isSecurePrefixed ? true : cookie.is_secure === 1,
            httpOnly: cookie.is_httponly === 1,
            sameSite,
            expirationDate
          };
          if (!isHostPrefixed) {
            cookieConfig.domain = hostKey.startsWith(".") ? hostKey : void 0;
          }
          await electron.session.defaultSession.cookies.set(cookieConfig);
          imported++;
        } catch (error) {
          failed++;
          const errorMsg = error instanceof Error ? error.message : "Unknown error";
          if (errors.length < 10) {
            errors.push(`${cookie.name} (${cookie.host_key}): ${errorMsg}`);
          }
        }
      }
      fs__namespace$1.unlinkSync(tempPath);
      CookieDecryptor.clearCache();
      if (browserType === "arc") {
        console.log("🥷 [CookieImporter] Arc cookies 导入完成，开始刷新相关标签页");
      }
      try {
        await electron.session.defaultSession.cookies.flushStore();
      } catch {
      }
      try {
        const allGoogleCookies = await electron.session.defaultSession.cookies.get({
          url: "https://www.google.com"
        });
        const criticalCookies = [
          "SID",
          "SSID",
          "APISID",
          "SAPISID",
          "__Secure-1PSID",
          "__Secure-3PSID",
          "__Secure-1PAPISID",
          "__Secure-3PAPISID",
          "NID",
          "AEC",
          "SIDCC",
          "__Secure-1PSIDCC",
          "__Secure-3PSIDCC",
          "SNID",
          "__Secure-1PSIDTS",
          "__Secure-3PSIDTS"
        ];
        allGoogleCookies.filter((c) => criticalCookies.includes(c.name));
        if (imported > 0) {
          await this.refreshAffectedTabs(browserType);
        }
      } catch {
      }
      return {
        success: true,
        total: cookies.length,
        imported,
        failed,
        errors: errors.length > 0 ? errors : void 0
      };
    } catch (error) {
      if (browserType === "arc") {
        console.error("🥷 [CookieImporter] Arc cookies 导入失败:", error);
      }
      throw error;
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async refreshAffectedTabs(_browserType) {
    try {
      const { tabManager } = await Promise.resolve().then(() => require("./index-vXB5mSwm.js")).then((n) => n.a7);
      const tabs = tabManager.tabs;
      for (const tab of tabs) {
        const url = tab.url.toLowerCase();
        if (url.includes("google") || url.includes("youtube")) {
          tab.getView().webContents.reload();
        }
      }
    } catch {
    }
  }
  static async importFromSafari() {
    return {
      success: false,
      total: 0,
      imported: 0,
      failed: 0,
      errors: ["Safari cookie import not yet implemented"]
    };
  }
  static async countCookies(browserType) {
    if (browserType === "safari") {
      if (process.platform !== "darwin") {
        return 0;
      }
      const cookiesPath2 = path__namespace.join(os__namespace.homedir(), "Library/Cookies/Cookies.binarycookies");
      return fs__namespace$1.existsSync(cookiesPath2) ? 0 : 0;
    }
    const cookiesPath = this.getCookiePath(browserType);
    if (!fs__namespace$1.existsSync(cookiesPath)) {
      if (browserType === "arc") {
        console.warn("🥷 [CookieImporter] 统计 Arc cookies 时未找到数据库:", cookiesPath);
      }
      return 0;
    }
    try {
      const tempPath = path__namespace.join(os__namespace.tmpdir(), `count-cookies-${Date.now()}.db`);
      fs__namespace$1.copyFileSync(cookiesPath, tempPath);
      const db = client.createClient({ url: `file:${tempPath}` });
      const result = await db.execute("SELECT COUNT(*) as count FROM cookies");
      const count = result.rows[0].count;
      await db.close();
      fs__namespace$1.unlinkSync(tempPath);
      return count;
    } catch {
      return 0;
    }
  }
}
function macOSTimestampToDate(timestamp) {
  const MACOS_EPOCH_OFFSET = 978307200;
  return new Date((timestamp + MACOS_EPOCH_OFFSET) * 1e3);
}
function isBookmark(item) {
  return !!item.value.data.tab;
}
function isFolder(item) {
  return item.value.data.list !== void 0;
}
class SimpleArcBookmarksParser {
  rawData;
  constructor(jsonData) {
    if (typeof jsonData === "string") {
      this.rawData = JSON.parse(jsonData);
    } else {
      this.rawData = jsonData;
    }
  }
  static fromFile(filePath) {
    const content = fs__namespace$1.readFileSync(filePath, "utf8");
    return new SimpleArcBookmarksParser(content);
  }
  static fromJSON(jsonData) {
    return new SimpleArcBookmarksParser(jsonData);
  }
  parse() {
    const bookmarks = [];
    const folders = [];
    const spaces = [];
    for (const spaceModel of this.rawData.sidebarSyncState.spaceModels) {
      if (typeof spaceModel === "object" && spaceModel !== null) {
        const space = spaceModel;
        spaces.push({
          id: space.value.id,
          title: space.value.title || space.value.id,
          icon: this.extractIcon(space),
          containerIds: Array.isArray(space.value.containerIDs) ? [...space.value.containerIDs] : []
        });
      }
    }
    for (const item of this.rawData.sidebarSyncState.items) {
      if (typeof item !== "object" || item === null) {
        continue;
      }
      const sidebarItem = item;
      if (isBookmark(sidebarItem)) {
        const tab = sidebarItem.value.data.tab;
        if (!tab || !tab.savedURL) {
          continue;
        }
        bookmarks.push({
          id: sidebarItem.value.id,
          title: (sidebarItem.value.title || tab.savedTitle || "Untitled").trim(),
          url: tab.savedURL,
          parentId: sidebarItem.value.parentID,
          createdAt: macOSTimestampToDate(sidebarItem.value.createdAt),
          lastActiveAt: macOSTimestampToDate(tab.timeLastActiveAt),
          isUnread: sidebarItem.value.isUnread
        });
      } else if (isFolder(sidebarItem)) {
        folders.push({
          id: sidebarItem.value.id,
          title: (sidebarItem.value.title || "Untitled").trim(),
          parentId: sidebarItem.value.parentID,
          childrenIds: Array.isArray(sidebarItem.value.childrenIds) ? [...sidebarItem.value.childrenIds] : [],
          createdAt: macOSTimestampToDate(sidebarItem.value.createdAt)
        });
      }
    }
    const domains = /* @__PURE__ */ new Set();
    for (const bookmark of bookmarks) {
      try {
        const url = new URL(bookmark.url);
        domains.add(url.hostname);
      } catch {
      }
    }
    return {
      version: this.rawData.version,
      parsedAt: /* @__PURE__ */ new Date(),
      lastSync: macOSTimestampToDate(
        this.rawData.sidebarSyncState.lastSuccessfulSyncDate
      ),
      spaces,
      bookmarks,
      folders,
      statistics: {
        totalBookmarks: bookmarks.length,
        totalFolders: folders.length,
        totalSpaces: spaces.length,
        uniqueDomains: domains.size
      }
    };
  }
  extractIcon(space) {
    const iconType = space.value.customInfo?.iconType;
    return iconType?.emoji_v2 || iconType?.icon;
  }
}
function parseArcBookmarksFromFile(filePath) {
  return SimpleArcBookmarksParser.fromFile(filePath).parse();
}
class BookmarkImporterService {
  /**
   * 获取平台相关的浏览器数据目录基础路径
   */
  static getBrowserBaseDir() {
    if (process.platform === "win32") {
      return process.env.LOCALAPPDATA || path__namespace.join(os__namespace.homedir(), "AppData", "Local");
    } else if (process.platform === "darwin") {
      return path__namespace.join(os__namespace.homedir(), "Library/Application Support");
    } else {
      return path__namespace.join(os__namespace.homedir(), ".config");
    }
  }
  /**
   * 获取浏览器路径配置（跨平台）
   */
  static getBrowserPaths(browserType) {
    const baseDir = this.getBrowserBaseDir();
    const isWindows = process.platform === "win32";
    const isMac = process.platform === "darwin";
    const pathConfigs = {
      chrome: {
        bookmark: isWindows ? path__namespace.join(baseDir, "Google", "Chrome", "User Data", "Default", "Bookmarks") : isMac ? path__namespace.join(baseDir, "Google/Chrome/Default/Bookmarks") : path__namespace.join(baseDir, "google-chrome", "Default", "Bookmarks"),
        cookie: isWindows ? path__namespace.join(baseDir, "Google", "Chrome", "User Data", "Default", "Network", "Cookies") : isMac ? path__namespace.join(baseDir, "Google/Chrome/Default/Cookies") : path__namespace.join(baseDir, "google-chrome", "Default", "Cookies")
      },
      edge: {
        bookmark: isWindows ? path__namespace.join(baseDir, "Microsoft", "Edge", "User Data", "Default", "Bookmarks") : isMac ? path__namespace.join(baseDir, "Microsoft Edge/Default/Bookmarks") : path__namespace.join(baseDir, "microsoft-edge", "Default", "Bookmarks"),
        cookie: isWindows ? path__namespace.join(baseDir, "Microsoft", "Edge", "User Data", "Default", "Network", "Cookies") : isMac ? path__namespace.join(baseDir, "Microsoft Edge/Default/Cookies") : path__namespace.join(baseDir, "microsoft-edge", "Default", "Cookies")
      },
      comet: {
        bookmark: isWindows ? path__namespace.join(baseDir, "Comet", "User Data", "Default", "Bookmarks") : isMac ? path__namespace.join(baseDir, "Comet/Default/Bookmarks") : path__namespace.join(baseDir, "comet", "Default", "Bookmarks"),
        cookie: isWindows ? path__namespace.join(baseDir, "Comet", "User Data", "Default", "Network", "Cookies") : isMac ? path__namespace.join(baseDir, "Comet/Default/Cookies") : path__namespace.join(baseDir, "comet", "Default", "Cookies")
      },
      arc: {
        bookmark: isWindows ? path__namespace.join(baseDir, "Arc", "User Data", "Default", "Bookmarks") : isMac ? path__namespace.join(os__namespace.homedir(), "Library/Application Support/Arc/StorableSidebar.json") : path__namespace.join(baseDir, "arc", "StorableSidebar.json"),
        cookie: isWindows ? path__namespace.join(baseDir, "Arc", "User Data", "Default", "Network", "Cookies") : isMac ? path__namespace.join(os__namespace.homedir(), "Library/Application Support/Arc/User Data/Default/Cookies") : path__namespace.join(baseDir, "arc", "User Data", "Default", "Cookies")
      },
      safari: {
        bookmark: isMac ? path__namespace.join(os__namespace.homedir(), "Library/Safari/Bookmarks.plist") : "",
        cookie: isMac ? path__namespace.join(os__namespace.homedir(), "Library/Cookies/Cookies.binarycookies") : ""
      }
    };
    const config2 = pathConfigs[browserType];
    return {
      bookmarkPath: config2?.bookmark || "",
      cookiePath: config2?.cookie || ""
    };
  }
  /**
   * 检测已安装的浏览器
   */
  static async detectInstalledBrowsers() {
    const browsers = [
      {
        name: "chrome",
        type: "chrome",
        displayName: "Google Chrome",
        icon: "https://os-assets.flowith.net/browser-import/logo-chrome.svg",
        ...this.getBrowserPaths("chrome"),
        installed: false,
        supportsCookieImport: true,
        supportsLocalStorageImport: true
      },
      {
        name: "comet",
        type: "comet",
        displayName: "Comet Browser",
        icon: "https://os-assets.flowith.net/browser-import/logo-comet.svg",
        ...this.getBrowserPaths("comet"),
        installed: false,
        supportsCookieImport: true,
        supportsLocalStorageImport: true
      },
      {
        name: "edge",
        type: "edge",
        displayName: "Microsoft Edge",
        icon: "https://os-assets.flowith.net/browser-import/logo-edge.png",
        ...this.getBrowserPaths("edge"),
        installed: false,
        supportsCookieImport: true,
        supportsLocalStorageImport: true
      },
      // Safari 仅在 macOS 上可用
      ...process.platform === "darwin" ? [
        {
          name: "safari",
          type: "safari",
          displayName: "Safari",
          icon: "https://os-assets.flowith.net/browser-import/logo-safari.png",
          ...this.getBrowserPaths("safari"),
          installed: false,
          supportsCookieImport: false,
          // Cookie 导入待实现
          supportsLocalStorageImport: true
          // ✅ 支持 LocalStorage 导入
        }
      ] : [],
      {
        name: "arc",
        type: "arc",
        displayName: "Arc",
        icon: "https://os-assets.flowith.net/browser-import/logo-arc.svg",
        ...this.getBrowserPaths("arc"),
        installed: false,
        supportsCookieImport: true,
        supportsLocalStorageImport: true
      }
    ];
    for (const browser of browsers) {
      try {
        browser.installed = fs__namespace$1.existsSync(browser.bookmarkPath);
        if (browser.installed) {
          try {
            if (browser.type === "chrome" || browser.type === "comet" || browser.type === "edge") {
              const count = this.countChromeBookmarks(browser.bookmarkPath);
              browser.bookmarkCount = count;
            } else if (browser.type === "arc") {
              const count = this.countArcBookmarks(browser.bookmarkPath);
              browser.bookmarkCount = count;
            } else if (browser.type === "safari") {
              const count = this.countSafariBookmarks(browser.bookmarkPath);
              browser.bookmarkCount = count;
            }
          } catch (e) {
            console.warn(`统计 ${browser.displayName} 书签失败:`, e);
            browser.bookmarkCount = 0;
          }
          if (browser.supportsCookieImport && browser.cookiePath && (browser.type === "chrome" || browser.type === "comet" || browser.type === "edge" || browser.type === "arc")) {
            try {
              const cookieCount = await CookieImporter.countCookies(browser.type);
              browser.cookieCount = cookieCount;
            } catch (e) {
              console.warn(`统计 ${browser.displayName} cookies 失败:`, e);
              browser.cookieCount = 0;
            }
          }
        }
      } catch (e) {
        console.warn(`检查 ${browser.displayName} 时出错:`, e);
        browser.installed = false;
        browser.bookmarkCount = 0;
      }
    }
    const installedBrowsers = browsers.filter((b) => b.installed);
    return installedBrowsers;
  }
  /**
   * 从指定浏览器读取书签
   */
  static async readBookmarks(browserType) {
    switch (browserType) {
      case "chrome":
      case "comet":
      case "edge":
        return this.readChromeBookmarks(browserType);
      case "safari":
        return this.readSafariBookmarks();
      case "arc":
        return this.readArcBookmarks();
      default:
        throw new Error(`不支持的浏览器类型: ${browserType}`);
    }
  }
  /**
   * 读取 Chrome/Comet/Edge/Arc(Windows) 书签（JSON 格式）
   */
  static readChromeBookmarks(browserType) {
    const { bookmarkPath } = this.getBrowserPaths(browserType);
    if (!fs__namespace$1.existsSync(bookmarkPath)) {
      console.warn(`🥷 [BookmarkImporter] ${browserType} 书签文件不存在: ${bookmarkPath}`);
      return [];
    }
    try {
      const content = fs__namespace$1.readFileSync(bookmarkPath, "utf8");
      const data = JSON.parse(content);
      const bookmarks = [];
      let idCounter = 0;
      const generateUniqueId = (type, originalId) => {
        idCounter++;
        return `${browserType}-${type}-${originalId || idCounter}-${Date.now()}-${idCounter}`;
      };
      const parseNode = (node, source) => {
        if (node.type === "url") {
          return {
            id: generateUniqueId("url", node.id),
            title: node.name || "Untitled",
            url: node.url,
            type: "url",
            dateAdded: node.date_added ? parseInt(node.date_added) : Date.now(),
            source
          };
        } else if (node.type === "folder") {
          const children = [];
          if (node.children) {
            node.children.forEach((child) => {
              const bookmark = parseNode(child, source);
              if (bookmark) children.push(bookmark);
            });
          }
          return {
            id: generateUniqueId("folder", node.id),
            title: node.name || "Untitled Folder",
            type: "folder",
            children,
            source
          };
        }
        return null;
      };
      if (data.roots) {
        Object.values(data.roots).forEach((root) => {
          const bookmark = parseNode(root, browserType);
          if (bookmark) bookmarks.push(bookmark);
        });
      }
      return bookmarks;
    } catch (error) {
      console.error(`🥷 [BookmarkImporter] ${browserType} 书签解析失败:`, error);
      return [];
    }
  }
  /**
   * 读取 Safari 书签（plist 格式）
   */
  static readSafariBookmarks() {
    console.warn("🥷 [BookmarkImporter] Safari 书签导入暂未实现");
    return [];
  }
  /**
   * 读取 Arc 书签（StorableSidebar.json 或 Windows 上的 Bookmarks）
   */
  static readArcBookmarks() {
    const { bookmarkPath } = this.getBrowserPaths("arc");
    if (!fs__namespace$1.existsSync(bookmarkPath)) {
      const message = `Arc 书签文件不存在: ${bookmarkPath}`;
      console.warn(`🥷 [BookmarkImporter] ${message}`);
      return [];
    }
    if (process.platform === "win32") {
      return this.readChromeBookmarks("arc");
    }
    let parsedData;
    try {
      parsedData = parseArcBookmarksFromFile(bookmarkPath);
    } catch (error) {
      console.error(
        `🥷 [BookmarkImporter] 解析 Arc 书签失败: ${error instanceof Error ? error.message : String(error)}`
      );
      return [];
    }
    const folderMap = new Map(
      parsedData.folders.map((folder) => [folder.id, folder])
    );
    const bookmarkMap = new Map(
      parsedData.bookmarks.map((bookmark) => [bookmark.id, bookmark])
    );
    const usedIds = /* @__PURE__ */ new Set();
    const memo = /* @__PURE__ */ new Map();
    const cloneBookmarkTree = (node) => ({
      ...node,
      children: node.children?.map(cloneBookmarkTree)
    });
    const buildNode = (id, pathSet) => {
      if (!id) {
        return null;
      }
      if (pathSet.has(id)) {
        console.warn(`🥷 [BookmarkImporter] 检测到 Arc 书签循环引用: ${id}`);
        return null;
      }
      if (memo.has(id)) {
        const cached = memo.get(id);
        return cached ? cloneBookmarkTree(cached) : null;
      }
      pathSet.add(id);
      if (bookmarkMap.has(id)) {
        const bookmark = bookmarkMap.get(id);
        usedIds.add(id);
        const titleCandidate = bookmark.title?.trim();
        const safeTitle = titleCandidate && titleCandidate.length > 0 ? titleCandidate : bookmark.url || "Untitled";
        const node = {
          id: `arc-url-${bookmark.id}`,
          title: safeTitle,
          url: bookmark.url,
          type: "url",
          dateAdded: bookmark.createdAt.getTime(),
          source: "arc"
        };
        memo.set(id, node);
        return cloneBookmarkTree(node);
      }
      if (folderMap.has(id)) {
        const folder = folderMap.get(id);
        usedIds.add(id);
        const children = [];
        for (const childId of folder.childrenIds || []) {
          const child = buildNode(childId, new Set(pathSet));
          if (child) {
            children.push(child);
          }
        }
        const folderTitleCandidate = folder.title?.trim();
        const folderTitle = folderTitleCandidate && folderTitleCandidate.length > 0 ? folderTitleCandidate : "Untitled";
        const node = {
          id: `arc-folder-${folder.id}`,
          title: folderTitle,
          type: "folder",
          children,
          dateAdded: folder.createdAt.getTime(),
          source: "arc"
        };
        memo.set(id, node);
        return cloneBookmarkTree(node);
      }
      memo.set(id, null);
      return null;
    };
    const allIds = /* @__PURE__ */ new Set([
      ...parsedData.bookmarks.map((b) => b.id),
      ...parsedData.folders.map((f) => f.id)
    ]);
    const idToSpaceId = /* @__PURE__ */ new Map();
    parsedData.spaces.forEach((space) => {
      space.containerIds.forEach((containerId) => {
        idToSpaceId.set(containerId, space.id);
      });
    });
    console.log(`🥷 [Arc Debug] Space containerIds 映射: ${idToSpaceId.size} 个直接容器`);
    const findSpaceForNode = (nodeId, visited = /* @__PURE__ */ new Set()) => {
      if (visited.has(nodeId)) return null;
      visited.add(nodeId);
      if (idToSpaceId.has(nodeId)) {
        return idToSpaceId.get(nodeId);
      }
      const bookmark = bookmarkMap.get(nodeId);
      if (bookmark?.parentId) {
        return findSpaceForNode(bookmark.parentId, visited);
      }
      const folder = folderMap.get(nodeId);
      if (folder?.parentId) {
        return findSpaceForNode(folder.parentId, visited);
      }
      return null;
    };
    const result = [];
    const processedIds = /* @__PURE__ */ new Set();
    parsedData.spaces.forEach((space, index2) => {
      console.log(`🥷 [Arc Debug] 处理 Space: "${space.title}", containerIds:`, space.containerIds);
      const spaceChildren = [];
      space.containerIds.forEach((containerId) => {
        if (!processedIds.has(containerId)) {
          const node = buildNode(containerId, /* @__PURE__ */ new Set());
          if (node) {
            spaceChildren.push(node);
            processedIds.add(containerId);
            console.log(`🥷 [Arc Debug] Space "${space.title}" 添加容器: ${node.title}`);
          }
        }
      });
      const spaceRootNodes = [];
      [...parsedData.folders, ...parsedData.bookmarks].forEach((item) => {
        if (processedIds.has(item.id) || usedIds.has(item.id)) {
          return;
        }
        const belongsToSpace = findSpaceForNode(item.id);
        if (belongsToSpace === space.id) {
          const parentBelongsToSpace = item.parentId ? findSpaceForNode(item.parentId) : null;
          if (!item.parentId || !allIds.has(item.parentId) || parentBelongsToSpace !== space.id) {
            const node = buildNode(item.id, /* @__PURE__ */ new Set());
            if (node) {
              spaceRootNodes.push(node);
              console.log(`🥷 [Arc Debug] Space "${space.title}" 添加根节点: ${node.title}`);
            }
          }
        }
      });
      const allChildren = [...spaceChildren, ...spaceRootNodes];
      if (allChildren.length > 0) {
        const spaceTitleCandidate = space.title?.trim();
        const spaceTitle = spaceTitleCandidate && spaceTitleCandidate.length > 0 ? spaceTitleCandidate : `Space ${index2 + 1}`;
        result.push({
          id: `arc-space-${space.id}`,
          title: `${space.icon ? space.icon + " " : ""}${spaceTitle}`,
          type: "folder",
          children: allChildren,
          source: "arc"
        });
        console.log(
          `🥷 [Arc Debug] ✅ Space "${space.title}" 生成，包含 ${allChildren.length} 个子项`
        );
      } else {
        console.log(`🥷 [Arc Debug] ⚠️ Space "${space.title}" 为空`);
      }
    });
    const orphanNodes = [];
    [...parsedData.folders, ...parsedData.bookmarks].forEach((item) => {
      if (!usedIds.has(item.id) && !processedIds.has(item.id)) {
        const belongsToSpace = findSpaceForNode(item.id);
        if (!belongsToSpace) {
          if (!item.parentId || !allIds.has(item.parentId)) {
            const node = buildNode(item.id, /* @__PURE__ */ new Set());
            if (node) {
              orphanNodes.push(node);
            }
          }
        }
      }
    });
    console.log(`🥷 [Arc Debug] 孤立节点: ${orphanNodes.length} 个`);
    if (orphanNodes.length > 0) {
      result.push({
        id: `arc-orphans-${Date.now()}`,
        title: "Unsorted",
        type: "folder",
        children: orphanNodes,
        source: "arc"
      });
    }
    return result;
  }
  /**
   * 统计 Chrome 格式书签数量
   */
  static countChromeBookmarks(filePath) {
    try {
      const content = fs__namespace$1.readFileSync(filePath, "utf8");
      const data = JSON.parse(content);
      let count = 0;
      const traverse = (node) => {
        if (node.type === "url") count++;
        if (node.children) {
          node.children.forEach(traverse);
        }
      };
      if (data.roots) {
        Object.values(data.roots).forEach(traverse);
      }
      return count;
    } catch {
      return 0;
    }
  }
  /**
   * 统计 Arc 格式书签数量
   */
  static countArcBookmarks(filePath) {
    try {
      const parsedData = parseArcBookmarksFromFile(filePath);
      return parsedData.statistics.totalBookmarks;
    } catch {
      return 0;
    }
  }
  /**
   * 统计 Safari 格式书签数量
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static countSafariBookmarks(_filePath) {
    return 0;
  }
}
class BookmarkManager {
  static instance = null;
  repository = index$6.getBookmarkRepository();
  storageFilePath;
  // 保留用于迁移
  migrated = false;
  constructor() {
    const userDataPath = electron.app.getPath("userData");
    this.storageFilePath = path__namespace.join(userDataPath, "bookmarks.json");
    this.migrateFromJSON().catch((error) => {
      console.error(`🥷 [BookmarkManager] 迁移失败:`, error);
    });
  }
  static getInstance() {
    if (!BookmarkManager.instance) {
      BookmarkManager.instance = new BookmarkManager();
    }
    return BookmarkManager.instance;
  }
  /**
   * 从 JSON 文件迁移到数据库
   */
  async migrateFromJSON() {
    if (this.migrated) return;
    try {
      if (fs__namespace$1.existsSync(this.storageFilePath)) {
        const content = fs__namespace$1.readFileSync(this.storageFilePath, "utf8");
        const jsonBookmarks = JSON.parse(content);
        if (jsonBookmarks.length > 0) {
          const existingBookmarks = await this.repository.getAll();
          if (existingBookmarks.length === 0) {
            await this.importBookmarksRecursive(jsonBookmarks, null, 0);
            const backupPath = `${this.storageFilePath}.backup`;
            fs__namespace$1.renameSync(this.storageFilePath, backupPath);
            console.log(`🥷 [BookmarkManager] 迁移完成，旧文件已备份到: ${backupPath}`);
          } else {
          }
        }
      }
      this.migrated = true;
    } catch (error) {
      console.error(`🥷 [BookmarkManager] 迁移失败:`, error);
    }
  }
  /**
   * 递归导入书签（用于迁移）
   */
  async importBookmarksRecursive(bookmarks, parentId, startIndex) {
    for (let i = 0; i < bookmarks.length; i++) {
      const bookmark = bookmarks[i];
      await this.repository.add({
        id: bookmark.id,
        type: bookmark.type,
        title: bookmark.title,
        url: bookmark.url || null,
        favicon: bookmark.favicon || null,
        parentId,
        index: startIndex + i,
        createdAt: bookmark.dateAdded ? new Date(bookmark.dateAdded) : /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date(),
        source: null,
        tags: null,
        notes: null
      });
      if (bookmark.type === "folder" && bookmark.children) {
        await this.importBookmarksRecursive(bookmark.children, bookmark.id, 0);
      }
    }
  }
  /**
   * 获取所有书签（构建树形结构）
   */
  async getAll() {
    return await this.repository.buildTree(null);
  }
  /**
   * 获取所有 URL 类型书签（展平）
   */
  async getAllUrls() {
    const dbBookmarks = await this.repository.getAllUrls();
    return dbBookmarks.map((b) => this.repository.convertToSharedBookmark(b));
  }
  /**
   * 添加书签
   */
  async add(bookmark) {
    await this.repository.add({
      id: bookmark.id,
      type: bookmark.type,
      title: bookmark.title,
      url: bookmark.url || null,
      favicon: bookmark.favicon || null,
      parentId: bookmark.parentId || null,
      index: 0,
      createdAt: bookmark.dateAdded ? new Date(bookmark.dateAdded) : /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date(),
      source: null,
      tags: null,
      notes: null
    });
    console.log(`🥷 [BookmarkManager] 添加书签: ${bookmark.title}`);
  }
  /**
   * 批量导入书签（保留文件夹结构，自动去重）
   */
  async import(bookmarks) {
    const existingUrls = new Set(
      (await this.repository.getAllUrls()).map((b) => b.url).filter(Boolean)
    );
    let imported = 0;
    let skipped = 0;
    const processBookmark = async (bookmark, parentId, index2) => {
      if (bookmark.type === "url" && bookmark.url) {
        if (existingUrls.has(bookmark.url)) {
          skipped++;
          return;
        } else {
          existingUrls.add(bookmark.url);
          imported++;
          await this.repository.add({
            id: bookmark.id || index$7.n(),
            type: "url",
            title: bookmark.title,
            url: bookmark.url,
            favicon: bookmark.favicon || null,
            parentId,
            index: index2,
            createdAt: /* @__PURE__ */ new Date(),
            updatedAt: /* @__PURE__ */ new Date(),
            source: null,
            tags: null,
            notes: null
          });
        }
      } else if (bookmark.type === "folder") {
        const folderId = bookmark.id || index$7.n();
        await this.repository.add({
          id: folderId,
          type: "folder",
          title: bookmark.title,
          url: null,
          favicon: null,
          parentId,
          index: index2,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date(),
          source: null,
          tags: null,
          notes: null
        });
        if (bookmark.children) {
          for (let i = 0; i < bookmark.children.length; i++) {
            await processBookmark(bookmark.children[i], folderId, i);
          }
        }
      }
    };
    for (let i = 0; i < bookmarks.length; i++) {
      await processBookmark(bookmarks[i], null, i);
    }
    console.log(`🥷 [BookmarkManager] 导入完成: ${imported} 个新增, ${skipped} 个已存在`);
    return { imported, skipped };
  }
  /**
   * 更新书签
   */
  async update(bookmarkId, updates) {
    const result = await this.repository.update(bookmarkId, {
      title: updates.title,
      url: updates.url || void 0,
      favicon: updates.favicon || void 0,
      notes: updates.notes || void 0
    });
    if (result) {
      console.log(`🥷 [BookmarkManager] 已更新: ${bookmarkId}`);
      return true;
    }
    return false;
  }
  /**
   * 创建新文件夹
   */
  async createFolder(name, parentId = null) {
    const folderId = `folder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const dbFolder = await this.repository.add({
      id: folderId,
      type: "folder",
      title: name,
      url: null,
      favicon: null,
      parentId,
      index: 0,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date(),
      source: null,
      tags: null,
      notes: null
    });
    console.log(`🥷 [BookmarkManager] 创建文件夹: ${name}`);
    return this.repository.convertToSharedBookmark(dbFolder);
  }
  /**
   * 移动书签
   */
  async move(bookmarkId, targetParentId, newIndex) {
    const result = await this.repository.move(bookmarkId, targetParentId, newIndex);
    if (result) {
      console.log(
        `🥷 [BookmarkManager] 移动书签: ${bookmarkId} → ${targetParentId || "root"}[${newIndex}]`
      );
    }
    return result;
  }
  /**
   * 删除书签
   */
  async remove(bookmarkId) {
    const result = await this.repository.delete(bookmarkId);
    if (result) {
      console.log(`🥷 [BookmarkManager] 删除书签: ${bookmarkId}`);
    }
    return result;
  }
  /**
   * 搜索书签
   */
  async search(keyword) {
    const dbBookmarks = await this.repository.search(keyword);
    return dbBookmarks.map((b) => this.repository.convertToSharedBookmark(b));
  }
  /**
   * 清空所有书签
   */
  async clear() {
    await this.repository.deleteAll();
    console.log(`🥷 [BookmarkManager] 已清空所有书签`);
  }
}
function isAuthTokenData(data) {
  if (typeof data !== "object" || data === null) {
    return false;
  }
  const obj = data;
  return typeof obj.access_token === "string" && typeof obj.refresh_token === "string" && obj.access_token.length > 0 && obj.refresh_token.length > 0;
}
const AUTH_TOKEN_KEY = "sb-aibdxsebwhalbnugsqel-all-auth-token";
const TARGET_ORIGINS = [config.F, "https://flowith.net"];
function getLocalStoragePath(browserType) {
  const isWindows = process.platform === "win32";
  const isMac = process.platform === "darwin";
  const homeDir = os__namespace.homedir();
  const baseDir = isWindows ? process.env.LOCALAPPDATA || path__namespace.join(homeDir, "AppData", "Local") : isMac ? path__namespace.join(homeDir, "Library/Application Support") : path__namespace.join(homeDir, ".config");
  const pathConfigs = {
    chrome: isWindows ? path__namespace.join(baseDir, "Google", "Chrome", "User Data", "Default", "Local Storage", "leveldb") : isMac ? path__namespace.join(baseDir, "Google/Chrome/Default/Local Storage/leveldb") : path__namespace.join(baseDir, "google-chrome", "Default", "Local Storage", "leveldb"),
    edge: isWindows ? path__namespace.join(baseDir, "Microsoft", "Edge", "User Data", "Default", "Local Storage", "leveldb") : isMac ? path__namespace.join(baseDir, "Microsoft Edge/Default/Local Storage/leveldb") : path__namespace.join(baseDir, "microsoft-edge", "Default", "Local Storage", "leveldb"),
    comet: isWindows ? path__namespace.join(baseDir, "Comet", "User Data", "Default", "Local Storage", "leveldb") : isMac ? path__namespace.join(baseDir, "Comet/Default/Local Storage/leveldb") : path__namespace.join(baseDir, "comet", "Default", "Local Storage", "leveldb"),
    arc: isWindows ? path__namespace.join(baseDir, "Arc", "User Data", "Default", "Local Storage", "leveldb") : isMac ? path__namespace.join(baseDir, "Arc/User Data/Default/Local Storage/leveldb") : path__namespace.join(baseDir, "arc", "User Data", "Default", "Local Storage", "leveldb")
  };
  return pathConfigs[browserType] || "";
}
function extractJsonPayload(rawValue) {
  const text = typeof rawValue === "string" ? rawValue : rawValue.toString("utf8");
  if (!text) {
    return null;
  }
  const withoutBorders = text.replace(/^[\u0000-\u001F]+/, "").replace(/[\u0000-\u001F]+$/, "");
  const trimmed = withoutBorders.trim();
  if (!trimmed) {
    return null;
  }
  if (trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.length >= 2) {
    try {
      const unwrapped = JSON.parse(trimmed);
      if (typeof unwrapped === "string") {
        return unwrapped;
      }
    } catch {
    }
  }
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const candidate = trimmed.slice(firstBrace, lastBrace + 1);
    if (candidate) {
      return candidate.replace(/\u0000+/g, "");
    }
  }
  return trimmed.replace(/\u0000+/g, "");
}
function parseAuthToken(rawValue) {
  const payload = extractJsonPayload(rawValue);
  if (!payload) {
    return null;
  }
  try {
    const parsed = JSON.parse(payload);
    return isAuthTokenData(parsed) ? parsed : null;
  } catch (error) {
    console.error(
      `🥷 [LocalStorageImporter] ❌ Token JSON 解析失败:`,
      error instanceof Error ? error.message : String(error)
    );
    return null;
  }
}
async function readWithClassicLevel(dbPath) {
  const tempDir = path__namespace.join(os__namespace.tmpdir(), `leveldb-${Date.now()}`);
  try {
    fs__namespace$1.cpSync(dbPath, tempDir, { recursive: true });
    const lockFile = path__namespace.join(tempDir, "LOCK");
    if (fs__namespace$1.existsSync(lockFile)) {
      fs__namespace$1.unlinkSync(lockFile);
    }
    const db = new classicLevel.ClassicLevel(tempDir, {
      createIfMissing: false
    });
    try {
      await db.open();
      for await (const [key, value] of db.iterator()) {
        const keyStr = key.toString();
        const isFlowithKey = TARGET_ORIGINS.some(
          (origin) => keyStr.includes(origin) && keyStr.includes(AUTH_TOKEN_KEY)
        );
        if (isFlowithKey) {
          const valueStr = value.toString();
          const cleanValue = valueStr.replace(/^\0/, "");
          const parsed = parseAuthToken(cleanValue);
          if (parsed) {
            console.log(`🥷 [LocalStorageImporter] 找到 auth token:`, {
              origin: TARGET_ORIGINS.find((o) => keyStr.includes(o)),
              accessTokenLength: parsed.access_token.length,
              refreshTokenLength: parsed.refresh_token.length
            });
            await db.close();
            fs__namespace$1.rmSync(tempDir, { recursive: true, force: true });
            return parsed;
          }
          console.warn(`🥷 [LocalStorageImporter] ⚠️ 候选 token 无法解析，继续尝试其他记录`);
        }
      }
      await db.close();
      fs__namespace$1.rmSync(tempDir, { recursive: true, force: true });
      return null;
    } catch (error) {
      try {
        await db.close();
      } catch {
      }
      throw error;
    }
  } finally {
    try {
      if (fs__namespace$1.existsSync(tempDir)) {
        fs__namespace$1.rmSync(tempDir, { recursive: true, force: true });
      }
    } catch {
    }
  }
}
async function readAuthTokenFromLevelDB(dbPath) {
  try {
    return await readWithClassicLevel(dbPath);
  } catch (error) {
    console.error(`🥷 [LocalStorageImporter] 读取 LevelDB 失败:`, error);
    return null;
  }
}
async function readAuthTokenFromSafari() {
  if (process.platform !== "darwin") {
    console.log("🥷 [LocalStorageImporter] Safari 仅在 macOS 上可用");
    return null;
  }
  const homeDir = os__namespace.homedir();
  const localStorageDir = path__namespace.join(homeDir, "Library/Safari/LocalStorage");
  if (!fs__namespace$1.existsSync(localStorageDir)) {
    console.log(`🥷 [LocalStorageImporter] Safari LocalStorage 目录不存在: ${localStorageDir}`);
    return null;
  }
  try {
    const files = fs__namespace$1.readdirSync(localStorageDir);
    const flowithFiles = files.filter(
      (f) => (f.includes("flowith.io") || f.includes("flowith.net")) && f.endsWith(".localstorage")
    );
    if (flowithFiles.length === 0) {
      console.log(`🥷 [LocalStorageImporter] 未找到 Flowith 的 Safari LocalStorage 文件`);
      return null;
    }
    console.log(
      `🥷 [LocalStorageImporter] 找到 ${flowithFiles.length} 个 Safari LocalStorage 文件:`,
      flowithFiles
    );
    for (const file of flowithFiles) {
      const dbPath = path__namespace.join(localStorageDir, file);
      try {
        const tempPath = path__namespace.join(os__namespace.tmpdir(), `safari-ls-${Date.now()}.db`);
        fs__namespace$1.copyFileSync(dbPath, tempPath);
        const db = client.createClient({ url: `file:${tempPath}` });
        try {
          const result = await db.execute({
            sql: "SELECT value FROM ItemTable WHERE key = ?",
            args: [AUTH_TOKEN_KEY]
          });
          const row = result.rows[0] ? { value: result.rows[0].value } : void 0;
          if (row?.value) {
            console.log(`🥷 [LocalStorageImporter] 在 ${file} 中找到 auth token`);
            await db.close();
            fs__namespace$1.unlinkSync(tempPath);
            try {
              const parsed = JSON.parse(row.value);
              return isAuthTokenData(parsed) ? parsed : null;
            } catch {
              console.log(`🥷 [LocalStorageImporter] Token 格式无效`);
              continue;
            }
          }
          await db.close();
          fs__namespace$1.unlinkSync(tempPath);
        } catch (error) {
          try {
            await db.close();
            fs__namespace$1.unlinkSync(tempPath);
          } catch {
          }
          console.error(`🥷 [LocalStorageImporter] 读取 ${file} 失败:`, error);
        }
      } catch (error) {
        console.error(`🥷 [LocalStorageImporter] 处理 ${file} 失败:`, error);
      }
    }
    return null;
  } catch (error) {
    console.error(`🥷 [LocalStorageImporter] Safari LocalStorage 读取失败:`, error);
    return null;
  }
}
class LocalStorageImporter {
  /**
   * 从浏览器导入 Flowith 认证 Token
   */
  static async importAuthToken(browserType) {
    try {
      console.log(`🥷 [LocalStorageImporter] 开始读取 ${browserType} Local Storage...`);
      let authToken = null;
      if (browserType === "safari") {
        authToken = await readAuthTokenFromSafari();
      } else {
        if (browserType === "arc") {
          console.log("🥷 [LocalStorageImporter] Arc 浏览器 detected，准备读取 Local Storage...");
        }
        const localStoragePath = getLocalStoragePath(browserType);
        console.log(`🥷 [LocalStorageImporter] localStoragePath: ${localStoragePath}`);
        if (!fs__namespace$1.existsSync(localStoragePath)) {
          if (browserType === "arc") {
            console.warn("🥷 [LocalStorageImporter] 未找到 Arc Local Storage leveldb 目录");
          }
          return {
            success: false,
            authToken: null,
            error: `${browserType} Local Storage not found: ${localStoragePath}`
          };
        }
        authToken = await readAuthTokenFromLevelDB(localStoragePath);
        if (browserType === "arc") {
          console.log(
            `🥷 [LocalStorageImporter] Arc Local Storage 读取结果: ${authToken ? "找到 token" : "未找到 token"}`
          );
        }
      }
      if (authToken) {
        console.log(`🥷 [LocalStorageImporter] ✅ 成功读取 auth token`);
        return {
          success: true,
          authToken
        };
      } else {
        console.log(`🥷 [LocalStorageImporter] ⚠️ 未找到 Flowith auth token`);
        return {
          success: false,
          authToken: null,
          error: "Auth token not found in Local Storage"
        };
      }
    } catch (error) {
      console.error(`🥷 [LocalStorageImporter] ❌ 读取失败:`, error);
      return {
        success: false,
        authToken: null,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
  /**
   * 存储认证 Token 到应用
   */
  static async storeAuthToken(authToken) {
    try {
      console.log(`🥷 [LocalStorageImporter] 开始存储 auth token...`);
      if (!isAuthTokenData(authToken)) {
        console.error(`🥷 [LocalStorageImporter] ❌ Token 格式无效，缺少必要字段`);
        return false;
      }
      const { supabaseManager } = await Promise.resolve().then(() => require("./supabaseManager-BAbRVJxx.js")).then((n) => n.f);
      const client2 = supabaseManager.getClient();
      const { error } = await client2.auth.setSession({
        access_token: authToken.access_token,
        refresh_token: authToken.refresh_token
      });
      if (error) {
        console.error(`🥷 [LocalStorageImporter] ❌ 设置 session 失败:`, error);
        return false;
      }
      console.log(`🥷 [LocalStorageImporter] ✅ Auth token 已成功存储`);
      return true;
    } catch (error) {
      console.error(`🥷 [LocalStorageImporter] ❌ 存储 token 失败:`, error);
      return false;
    }
  }
}
class BookmarkService {
  static instance = null;
  bookmarkManager;
  constructor() {
    this.bookmarkManager = BookmarkManager.getInstance();
    this.setupIpcHandlers();
  }
  static getInstance() {
    if (!BookmarkService.instance) {
      BookmarkService.instance = new BookmarkService();
    }
    return BookmarkService.instance;
  }
  /**
   * 设置 IPC 处理器
   */
  setupIpcHandlers() {
    electron.ipcMain.handle("bookmarks:detectBrowsers", async () => {
      try {
        return await BookmarkImporterService.detectInstalledBrowsers();
      } catch (error) {
        console.error("🥷 [BookmarkService] 检测浏览器失败:", error);
        return [];
      }
    });
    electron.ipcMain.handle(
      "bookmarks:readFromBrowser",
      async (_event, browserType) => {
        try {
          return await BookmarkImporterService.readBookmarks(browserType);
        } catch (error) {
          console.error(`🥷 [BookmarkService] 从 ${browserType} 读取书签失败:`, error);
          return [];
        }
      }
    );
    electron.ipcMain.handle(
      "bookmarks:import",
      async (_event, bookmarks) => {
        try {
          const { imported, skipped } = await this.bookmarkManager.import(bookmarks);
          if (imported > 0) {
            this.trackBookmarkEvent(imported);
          }
          return {
            success: true,
            total: bookmarks.length,
            imported,
            skipped
          };
        } catch (error) {
          console.error("🥷 [BookmarkService] 导入书签失败:", error);
          return {
            success: false,
            total: bookmarks.length,
            imported: 0,
            skipped: 0
          };
        }
      }
    );
    electron.ipcMain.handle("bookmarks:getAll", async () => {
      return await this.bookmarkManager.getAll();
    });
    electron.ipcMain.handle("bookmarks:getAllUrls", async () => {
      return await this.bookmarkManager.getAllUrls();
    });
    electron.ipcMain.handle("bookmarks:search", async (_event, keyword) => {
      return await this.bookmarkManager.search(keyword);
    });
    electron.ipcMain.handle(
      "bookmarks:update",
      async (_event, bookmarkId, updates) => {
        return await this.bookmarkManager.update(bookmarkId, updates);
      }
    );
    electron.ipcMain.handle(
      "bookmarks:move",
      async (_event, bookmarkId, targetParentId, newIndex) => {
        return await this.bookmarkManager.move(bookmarkId, targetParentId, newIndex);
      }
    );
    electron.ipcMain.handle("bookmarks:createFolder", async (_event, name) => {
      return await this.bookmarkManager.createFolder(name);
    });
    electron.ipcMain.handle("bookmarks:remove", async (_event, bookmarkId) => {
      return await this.bookmarkManager.remove(bookmarkId);
    });
    electron.ipcMain.handle("bookmarks:clear", async () => {
      await this.bookmarkManager.clear();
    });
    electron.ipcMain.handle(
      "cookies:importFromBrowser",
      async (_event, browserType) => {
        try {
          if (browserType === "safari") {
            return await CookieImporter.importFromSafari();
          } else {
            return await CookieImporter.importFromChromium(browserType);
          }
        } catch (error) {
          console.error(`🥷 [BookmarkService] 从 ${browserType} 导入 Cookies 失败:`, error);
          return {
            success: false,
            total: 0,
            imported: 0,
            failed: 0,
            errors: [error instanceof Error ? error.message : "Unknown error"]
          };
        }
      }
    );
    electron.ipcMain.handle(
      "localStorage:importAuthToken",
      async (_event, browserType) => {
        try {
          console.log(`🥷 [BookmarkService] 开始从 ${browserType} 导入 auth token...`);
          const result = await LocalStorageImporter.importAuthToken(browserType);
          if (result.success && result.authToken) {
            const stored = await LocalStorageImporter.storeAuthToken(result.authToken);
            return {
              ...result,
              stored
            };
          }
          return result;
        } catch (error) {
          console.error(`🥷 [BookmarkService] 导入 auth token 失败:`, error);
          return {
            success: false,
            authToken: null,
            error: error instanceof Error ? error.message : "Unknown error"
          };
        }
      }
    );
  }
  /**
   * 追踪书签事件到分析系统
   */
  trackBookmarkEvent(importedCount) {
    Promise.resolve().then(() => require("./posthogService-khJWbAtc.js")).then(({ posthogService: posthogService2 }) => {
      if (!posthogService2.isEnabled()) {
        return;
      }
      void posthogService2.track("bookmark_created", {
        total_bookmarks: importedCount
      });
    }).catch((error) => {
      console.debug("[BookmarkService] Analytics tracking failed:", error);
    });
  }
}
function initializeBookmarkService() {
  BookmarkService.getInstance();
}
class HistoryService {
  static instance = null;
  historyManager;
  constructor() {
    this.historyManager = index$2.S.getInstance();
    this.setupIpcHandlers();
  }
  static getInstance() {
    if (!HistoryService.instance) {
      HistoryService.instance = new HistoryService();
    }
    return HistoryService.instance;
  }
  /**
   * 设置 IPC 处理器
   */
  setupIpcHandlers() {
    electron.ipcMain.handle("history:getAll", async () => {
      return await this.historyManager.getAll();
    });
    electron.ipcMain.handle(
      "history:search",
      async (_event, keyword) => {
        const entries = await this.historyManager.search(keyword);
        return {
          entries,
          total: entries.length
        };
      }
    );
    electron.ipcMain.handle(
      "history:getByTimeRange",
      async (_event, range, custom) => {
        return await this.historyManager.getByTimeRange(range, custom);
      }
    );
    electron.ipcMain.handle("history:remove", async (_event, id) => {
      const success = await this.historyManager.remove(id);
      return {
        success,
        removed: success ? 1 : 0
      };
    });
    electron.ipcMain.handle(
      "history:removeBatch",
      async (_event, ids) => {
        const removed = await this.historyManager.removeBatch(ids);
        return {
          success: removed > 0,
          removed
        };
      }
    );
    electron.ipcMain.handle(
      "history:removeByTimeRange",
      async (_event, range, custom) => {
        const removed = await this.historyManager.removeByTimeRange(range, custom);
        return {
          success: removed > 0,
          removed
        };
      }
    );
    electron.ipcMain.handle("history:clear", async () => {
      const stats = await this.historyManager.getStats();
      const total = stats.total;
      await this.historyManager.clear();
      return {
        success: true,
        removed: total
      };
    });
    electron.ipcMain.handle("history:getStats", async () => {
      return await this.historyManager.getStats();
    });
    electron.ipcMain.handle("history:getFrequentUrls", async (_event, prefix) => {
      return await this.historyManager.getFrequentUrls(prefix);
    });
    console.log("[HistoryService] IPC handlers registered");
  }
}
function initializeHistoryService() {
  HistoryService.getInstance();
}
class AgentSnapshotAnalytics {
  initialize() {
    mainEventBus.m.on("taskSnapshot:update", (snapshot) => {
      this.onSnapshot(snapshot);
    });
  }
  onSnapshot(snapshot) {
    if (!posthogService.posthogService.isEnabled()) return;
    switch (snapshot.status) {
      case "created": {
        void posthogService.posthogService.track("agent_task_created", {
          task_id: snapshot.id,
          mode: "unknown",
          has_files: (snapshot.files?.length ?? 0) > 0
        });
        break;
      }
      case "running": {
        void posthogService.posthogService.track("agent_task_started", {
          task_id: snapshot.id,
          mode: "unknown"
        });
        break;
      }
      case "completed": {
        void posthogService.posthogService.track("agent_task_completed", { task_id: snapshot.id });
        break;
      }
      case "paused":
      case "failed": {
        void posthogService.posthogService.track("agent_task_stopped", { task_id: snapshot.id });
        break;
      }
    }
  }
}
const agentSnapshotAnalytics = new AgentSnapshotAnalytics();
function initializeAgentSnapshotAnalytics() {
  agentSnapshotAnalytics.initialize();
}
function registerFlowithProtocol() {
  electron.protocol.handle("flowith", async (request) => {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const hostname = url.hostname;
    if (hostname === "backgrounds") {
      return await loadBackgroundImage(pathname);
    }
    if (utils.is.dev && process.env["ELECTRON_RENDERER_URL"]) {
      const devServerUrl = process.env["ELECTRON_RENDERER_URL"];
      if ((pathname === "/" || pathname === "") && hostname === "history") {
        return Response.redirect("flowith://settings/history", 302);
      }
      if ((pathname === "/" || pathname === "") && hostname === "download") {
        return Response.redirect("flowith://settings/download", 302);
      }
      if ((pathname === "/" || pathname === "") && hostname === "settings") {
        return fetch(`${devServerUrl}/settings.html`);
      }
      if (hostname === "settings" && (pathname === "/history" || pathname === "/download" || pathname === "/adblock" || pathname === "/update")) {
        return fetch(`${devServerUrl}/settings.html`);
      }
      if ((pathname === "/" || pathname === "") && hostname === "blank") {
        return fetch(`${devServerUrl}/blank.html`);
      }
      if (hostname === "terminal" && (pathname === "/" || pathname === "" || pathname.startsWith("/interactive/") || pathname.startsWith("/readonly/"))) {
        return fetch(`${devServerUrl}/terminal.html`);
      }
      if (hostname === "editor" && (pathname === "/" || pathname === "")) {
        return fetch(`${devServerUrl}/codeEditor.html`);
      }
      return fetch(`${devServerUrl}${pathname}${url.search}`);
    }
    if (pathname.startsWith("/assets/")) {
      return await loadAsset(pathname);
    }
    if (pathname === "/settings/" || pathname === "/settings" || pathname === "/settings/history" || pathname === "/settings/download" || pathname === "/settings/adblock" || pathname === "/settings/update" || (pathname === "/" || pathname === "") && hostname === "settings" || hostname === "settings" && (pathname === "/history" || pathname === "/download" || pathname === "/adblock" || pathname === "/update")) {
      return await loadSettingsPage();
    }
    if (pathname === "/history/" || pathname === "/history" || (pathname === "/" || pathname === "") && hostname === "history") {
      return Response.redirect("flowith://settings/history", 302);
    }
    if (pathname === "/download/" || pathname === "/download" || (pathname === "/" || pathname === "") && hostname === "download") {
      return Response.redirect("flowith://settings/download", 302);
    }
    if (pathname === "/blank/" || pathname === "/blank" || (pathname === "/" || pathname === "") && hostname === "blank") {
      return await loadBlankPage();
    }
    if (hostname === "terminal" && (pathname === "/" || pathname === "" || pathname.startsWith("/interactive/") || pathname.startsWith("/readonly/"))) {
      console.log(
        `[ProtocolHandler] Loading terminal page - pathname: ${pathname}, search: ${url.search}`
      );
      return await loadTerminalPage();
    }
    if (hostname === "editor" && (pathname === "/" || pathname === "")) {
      console.log(`[ProtocolHandler] Loading code editor page - search: ${url.search}`);
      return await loadCodeEditorPage();
    }
    if (pathname === "/" && !hostname) {
      return await loadHistoryPage();
    }
    console.warn("[ProtocolHandler] Unknown route:", request.url);
    return new Response(`Not Found: ${request.url}`, {
      status: 404,
      headers: { "content-type": "text/plain" }
    });
  });
}
async function loadHistoryPage() {
  try {
    if (utils.is.dev && process.env["ELECTRON_RENDERER_URL"]) {
      const response = await fetch(`${process.env["ELECTRON_RENDERER_URL"]}/history.html`);
      const html = await response.text();
      return new Response(html, {
        status: 200,
        headers: { "content-type": "text/html; charset=utf-8" }
      });
    } else {
      const appPath = electron.app.getAppPath();
      const htmlPath = path.join(appPath, "out/renderer/history.html");
      let html = await fs$1.readFile(htmlPath, "utf-8");
      html = injectBaseTag(html, "flowith://history/");
      return new Response(html, {
        status: 200,
        headers: { "content-type": "text/html; charset=utf-8" }
      });
    }
  } catch (error) {
    console.error("[ProtocolHandler] Failed to load history page:", error);
    return new Response(`Internal Server Error: ${error}`, {
      status: 500,
      headers: { "content-type": "text/plain" }
    });
  }
}
async function loadBlankPage() {
  try {
    if (utils.is.dev && process.env["ELECTRON_RENDERER_URL"]) {
      const response = await fetch(`${process.env["ELECTRON_RENDERER_URL"]}/blank.html`);
      const html = await response.text();
      return new Response(html, {
        status: 200,
        headers: { "content-type": "text/html; charset=utf-8" }
      });
    } else {
      const appPath = electron.app.getAppPath();
      const htmlPath = path.join(appPath, "out/renderer/blank.html");
      console.log("[ProtocolHandler] Loading blank page from:", htmlPath);
      console.log("[ProtocolHandler] App path:", appPath);
      let html = await fs$1.readFile(htmlPath, "utf-8");
      html = injectBaseTag(html, "flowith://blank/");
      return new Response(html, {
        status: 200,
        headers: { "content-type": "text/html; charset=utf-8" }
      });
    }
  } catch (error) {
    console.error("[ProtocolHandler] Failed to load blank page:", error);
    console.error("[ProtocolHandler] App path:", electron.app.getAppPath());
    console.error(
      "[ProtocolHandler] Attempted path:",
      path.join(electron.app.getAppPath(), "out/renderer/blank.html")
    );
    return new Response(`Internal Server Error: ${error}`, {
      status: 500,
      headers: { "content-type": "text/plain" }
    });
  }
}
async function loadSettingsPage() {
  try {
    if (utils.is.dev && process.env["ELECTRON_RENDERER_URL"]) {
      const response = await fetch(`${process.env["ELECTRON_RENDERER_URL"]}/settings.html`);
      const html = await response.text();
      return new Response(html, {
        status: 200,
        headers: { "content-type": "text/html; charset=utf-8" }
      });
    } else {
      const appPath = electron.app.getAppPath();
      const htmlPath = path.join(appPath, "out/renderer/settings.html");
      let html = await fs$1.readFile(htmlPath, "utf-8");
      html = injectBaseTag(html, "flowith://settings/");
      return new Response(html, {
        status: 200,
        headers: { "content-type": "text/html; charset=utf-8" }
      });
    }
  } catch (error) {
    console.error("[ProtocolHandler] Failed to load settings page:", error);
    return new Response(`Internal Server Error: ${error}`, {
      status: 500,
      headers: { "content-type": "text/plain" }
    });
  }
}
async function loadTerminalPage() {
  try {
    if (utils.is.dev && process.env["ELECTRON_RENDERER_URL"]) {
      const response = await fetch(`${process.env["ELECTRON_RENDERER_URL"]}/terminal.html`);
      const html = await response.text();
      return new Response(html, {
        status: 200,
        headers: { "content-type": "text/html; charset=utf-8" }
      });
    } else {
      const appPath = electron.app.getAppPath();
      const htmlPath = path.join(appPath, "out/renderer/terminal.html");
      let html = await fs$1.readFile(htmlPath, "utf-8");
      html = injectBaseTag(html, "flowith://terminal/");
      return new Response(html, {
        status: 200,
        headers: { "content-type": "text/html; charset=utf-8" }
      });
    }
  } catch (error) {
    console.error("[ProtocolHandler] Failed to load terminal page:", error);
    return new Response(`Internal Server Error: ${error}`, {
      status: 500,
      headers: { "content-type": "text/plain" }
    });
  }
}
async function loadCodeEditorPage() {
  try {
    if (utils.is.dev && process.env["ELECTRON_RENDERER_URL"]) {
      const response = await fetch(`${process.env["ELECTRON_RENDERER_URL"]}/codeEditor.html`);
      const html = await response.text();
      return new Response(html, {
        status: 200,
        headers: { "content-type": "text/html; charset=utf-8" }
      });
    } else {
      const appPath = electron.app.getAppPath();
      const htmlPath = path.join(appPath, "out/renderer/codeEditor.html");
      let html = await fs$1.readFile(htmlPath, "utf-8");
      html = injectBaseTag(html, "flowith://editor/");
      return new Response(html, {
        status: 200,
        headers: { "content-type": "text/html; charset=utf-8" }
      });
    }
  } catch (error) {
    console.error("[ProtocolHandler] Failed to load code editor page:", error);
    return new Response(`Internal Server Error: ${error}`, {
      status: 500,
      headers: { "content-type": "text/plain" }
    });
  }
}
function injectBaseTag(html, baseUrl) {
  return html.replace(/<head>/i, `<head>
    <base href="${baseUrl}">`);
}
async function loadAsset(pathname) {
  try {
    const assetPath = path.join(index$1.g(), "../renderer", pathname);
    const content = await fs$1.readFile(assetPath);
    const ext = pathname.split(".").pop()?.toLowerCase() || "";
    const mimeTypes = {
      js: "application/javascript",
      css: "text/css",
      woff: "font/woff",
      woff2: "font/woff2",
      ttf: "font/ttf",
      svg: "image/svg+xml",
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      gif: "image/gif",
      webp: "image/webp",
      json: "application/json"
    };
    const contentType = mimeTypes[ext] || "application/octet-stream";
    return new Response(new Uint8Array(content), {
      status: 200,
      headers: {
        "content-type": contentType,
        "access-control-allow-origin": "*",
        "cache-control": "public, max-age=31536000"
      }
    });
  } catch (error) {
    console.error("[ProtocolHandler] Failed to load asset:", pathname, error);
    return new Response(`Not Found: ${pathname}`, {
      status: 404,
      headers: { "content-type": "text/plain" }
    });
  }
}
async function loadBackgroundImage(pathname) {
  try {
    const storage = index$3.getAppStorage();
    const fileName = pathname.startsWith("/") ? pathname.slice(1) : pathname;
    if (!fileName) {
      console.warn("[ProtocolHandler] No filename provided for background image");
      return new Response("Bad Request: No filename provided", {
        status: 400,
        headers: { "content-type": "text/plain" }
      });
    }
    const imagePath = storage.paths.getPath("data", "backgrounds", fileName);
    const ext = fileName.split(".").pop()?.toLowerCase() || "";
    const mimeTypes = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      gif: "image/gif"
    };
    const mimeType = mimeTypes[ext] || "image/jpeg";
    const imageBuffer = await fs$1.readFile(imagePath);
    return new Response(new Uint8Array(imageBuffer), {
      status: 200,
      headers: {
        "content-type": mimeType,
        "access-control-allow-origin": "*",
        "cache-control": "public, max-age=31536000"
        // Cache for 1 year
      }
    });
  } catch (error) {
    console.error("[ProtocolHandler] Failed to load background image:", pathname, error);
    return new Response(`Not Found: ${error}`, {
      status: 404,
      headers: { "content-type": "text/plain" }
    });
  }
}
function registerDevShortcuts() {
  electron.globalShortcut.register("CommandOrControl+Option+I", () => {
    const baseView = index$2.B.getInstance().getView();
    if (baseView) {
      if (baseView.webContents.isDevToolsOpened()) {
        baseView.webContents.closeDevTools();
      } else {
        baseView.webContents.openDevTools();
      }
    }
  });
  electron.globalShortcut.register("CommandOrControl+Shift+D", () => {
    const activeTab = index$2.t.currentTab;
    if (activeTab) {
      activeTab.toggleDevTools();
    }
  });
  electron.globalShortcut.register("CommandOrControl+Shift+S", () => {
    const wc = index$2.s.getWebContents();
    if (wc) {
      if (wc.isDevToolsOpened()) {
        wc.closeDevTools();
      } else {
        wc.openDevTools({ mode: "undocked" });
      }
    }
  });
  electron.globalShortcut.register("CommandOrControl+Shift+U", () => {
    const wc = index$2.U.getWebContents();
    if (wc) {
      if (wc.isDevToolsOpened()) {
        wc.closeDevTools();
      } else {
        wc.openDevTools({ mode: "undocked" });
      }
    }
  });
  electron.globalShortcut.register("CommandOrControl+Shift+C", () => {
    index$2.V.getInstance().toggleDevTools();
  });
  electron.globalShortcut.register("CommandOrControl+Shift+G", () => {
    index$2.w.show();
  });
  electron.globalShortcut.register("CommandOrControl+Shift+B", () => {
    browserControlTestWindow.open();
  });
}
function registerCertificateHandlers() {
  electron.ipcMain.handle("certificate:get-policy", async () => {
    return certificateManager.c.getPolicy();
  });
  electron.ipcMain.handle("certificate:update-policy", async (_event, updates) => {
    certificateManager.c.updatePolicy(updates);
    return { success: true };
  });
  electron.ipcMain.handle("certificate:add-trusted-domain", async (_event, domain) => {
    certificateManager.c.addTrustedDomain(domain);
    return { success: true };
  });
  electron.ipcMain.handle("certificate:remove-trusted-domain", async (_event, domain) => {
    certificateManager.c.removeTrustedDomain(domain);
    return { success: true };
  });
  electron.ipcMain.handle("certificate:clear-session-exceptions", async () => {
    certificateManager.c.clearSessionExceptions();
    return { success: true };
  });
}
class TrayWindows {
  static instance = null;
  tray = null;
  constructor() {
  }
  static getInstance() {
    if (!TrayWindows.instance) {
      TrayWindows.instance = new TrayWindows();
    }
    return TrayWindows.instance;
  }
  init() {
    if (this.tray) return;
    const iconPath = electron.app.isPackaged ? path.join(process.resourcesPath, "assets", "AppIcon.png") : path.join(index$1.g(), "../../assets", "AppIcon.png");
    const icon = electron.nativeImage.createFromPath(iconPath);
    const resizedIcon = icon.resize({ width: 32, height: 32 });
    this.tray = new electron.Tray(resizedIcon);
    this.tray.setToolTip("flowithOS Beta");
    this.tray.on("click", () => {
      this.awake();
    });
    const contextMenu = electron.Menu.buildFromTemplate([
      {
        label: index$4.m.t("tray.showMainWindow"),
        click: () => {
          this.awake();
        }
      },
      {
        label: index$4.m.t("tray.quit"),
        click: () => {
          electron.app.quit();
        }
      }
    ]);
    this.tray.setContextMenu(contextMenu);
  }
  awake() {
    mainEventBus.m.emit("app:wakeup");
  }
}
function initializeTray() {
  if (process.platform === "darwin") {
    mac.initializeTray();
  } else if (process.platform === "win32") {
    const tray = TrayWindows.getInstance();
    tray.init();
  }
}
if (!electron.app.isPackaged) {
  log.transports.console.level = "info";
  log.transports.file.level = "warn";
} else {
  log.transports.console.level = "warn";
  log.transports.file.level = "info";
}
log.transports.console.format = "[{h}:{i}:{s}] {text}";
log.transports.console.useStyles = true;
let groupLevel = 0;
const GROUP_INDENT = "  ";
function formatMessage(message) {
  const indent = GROUP_INDENT.repeat(groupLevel);
  return `${indent}${message}`;
}
const logger = {
  /**
   * 开始日志分组
   */
  group(label) {
    log.info(formatMessage(label));
    groupLevel++;
  },
  /**
   * 结束日志分组
   */
  groupEnd() {
    if (groupLevel > 0) {
      groupLevel--;
    }
  },
  /**
   * Info 级别日志
   */
  info(message, ...args) {
    log.info(formatMessage(message), ...args);
  },
  /**
   * Debug 级别日志（DEV 环境显示，生产环境不显示）
   */
  debug(message, ...args) {
    log.debug(formatMessage(message), ...args);
  },
  /**
   * Warning 级别日志
   */
  warn(message, ...args) {
    log.warn(formatMessage(message), ...args);
  },
  /**
   * Error 级别日志
   */
  error(message, ...args) {
    log.error(formatMessage(message), ...args);
  },
  /**
   * 成功消息（带 ✓ 图标）
   */
  success(message, ...args) {
    log.info(formatMessage(`✓ ${message}`), ...args);
  },
  /**
   * 进行中消息（带 ⏳ 图标）
   */
  progress(message, ...args) {
    log.info(formatMessage(`⏳ ${message}`), ...args);
  },
  /**
   * 重置分组层级（用于错误恢复）
   */
  resetGroup() {
    groupLevel = 0;
  }
};
function handleExternalUrl(url) {
  console.log("[Main] 🌐 处理外部 URL:", url);
  try {
    const window = index$2.g();
    if (window) {
      if (window.isMinimized()) window.restore();
      window.show();
      window.focus();
    }
    index$2.t.createTab(url, void 0, true).catch((error) => {
      console.error("[Main] 创建标签页失败:", error);
    });
  } catch (error) {
    console.error("[Main] 处理外部 URL 失败:", error);
  }
}
class AgentJob {
  constructor(job, executionStore) {
    this.job = job;
    this.executionStore = executionStore;
  }
  status = "active";
  get id() {
    return this.job.id;
  }
  get fromTaskId() {
    const rawValue = this.job.metadata?.fromTaskId;
    if (typeof rawValue === "string" && rawValue.length > 0) {
      return rawValue;
    }
    return void 0;
  }
  get payload() {
    return this.job.payload;
  }
  get schedule() {
    return this.job.schedule;
  }
  get createdAt() {
    return this.job.createdAt;
  }
  executions() {
    return this.executionStore.getExecutions(this.job.id);
  }
  async stop() {
    await this.job.remove();
    await this.executionStore.markJobRemoved(this.job.id);
  }
}
class ArchivedAgentJob {
  constructor(record, executionStore) {
    this.record = record;
    this.executionStore = executionStore;
  }
  status = "archived";
  get id() {
    return this.record.id;
  }
  get fromTaskId() {
    const rawValue = this.record.metadata?.fromTaskId;
    if (typeof rawValue === "string" && rawValue.length > 0) {
      return rawValue;
    }
    return void 0;
  }
  get payload() {
    return this.record.payload;
  }
  get schedule() {
    return this.record.schedule;
  }
  get createdAt() {
    return this.record.createdAt;
  }
  executions() {
    return this.executionStore.getExecutions(this.record.id);
  }
  async stop() {
    throw new Error("Cannot stop archived job");
  }
}
const EXECUTION_FILENAME = "agentSchedulerJobs.json";
const EXECUTION_DIR = path.join("data", "scheduler");
class AgentJobExecutionStore {
  filePath = "";
  data = { executions: [], jobs: {} };
  async init() {
    const baseDir = electron.app.getPath("userData");
    const targetDir = path.join(baseDir, EXECUTION_DIR);
    const filePath = path.join(targetDir, EXECUTION_FILENAME);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(content);
      this.data = {
        executions: Array.isArray(parsed.executions) ? parsed.executions : [],
        jobs: parsed?.jobs && typeof parsed.jobs === "object" ? parsed.jobs : {}
      };
      this.filePath = filePath;
      return;
    }
    this.filePath = filePath;
    this.persist();
  }
  /**
   * 保存 Job 的快照，用于历史记录
   */
  async upsertJobSnapshot(snapshot) {
    this.ensureReady();
    const createdAt = snapshot.createdAt instanceof Date ? snapshot.createdAt : new Date(snapshot.createdAt || Date.now());
    const existing = this.data.jobs[snapshot.id];
    this.data.jobs[snapshot.id] = {
      id: snapshot.id,
      payload: snapshot.payload,
      schedule: snapshot.schedule,
      metadata: snapshot.metadata,
      createdAt: createdAt.toISOString(),
      removedAt: existing?.removedAt ?? null
    };
    this.ensureBaseline(snapshot.id, createdAt);
    this.persist();
  }
  /**
   * 记录一次成功触发（called）的计划实例
   */
  async recordCall(params) {
    this.ensureReady();
    if (this.hasExecution(params.jobId, params.scheduledAt)) {
      return;
    }
    this.data.executions.push({
      id: crypto.randomUUID(),
      jobId: params.jobId,
      status: "called",
      scheduledAt: params.scheduledAt.toISOString(),
      triggeredAt: params.triggeredAt.toISOString(),
      taskId: params.taskId,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    this.persist();
  }
  /**
   * 记录一次错过（missed）的计划实例
   */
  async recordMiss(params) {
    this.ensureReady();
    if (this.hasExecution(params.jobId, params.scheduledAt)) {
      return;
    }
    this.data.executions.push({
      id: crypto.randomUUID(),
      jobId: params.jobId,
      status: "missed",
      scheduledAt: params.scheduledAt.toISOString(),
      triggeredAt: null,
      taskId: null,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    this.persist();
  }
  /**
   * 获取指定 Job 的执行记录（按 scheduledAt 升序）
   */
  getExecutions(jobId) {
    this.ensureReady();
    return this.data.executions.filter((item) => item.jobId === jobId && item.status !== "baseline").sort((a, b) => {
      const left = new Date(a.scheduledAt).getTime();
      const right = new Date(b.scheduledAt).getTime();
      return left - right;
    }).map((item) => this.toExecution(item));
  }
  /**
   * 找到 Job 最后记录到的 scheduledAt，用于 cron 推演
   */
  getLastScheduledAt(jobId) {
    this.ensureReady();
    let lastTimestamp = null;
    for (const snapshot of this.data.executions) {
      if (snapshot.jobId !== jobId) {
        continue;
      }
      const ts = new Date(snapshot.scheduledAt).getTime();
      if (Number.isNaN(ts)) {
        continue;
      }
      if (lastTimestamp === null || ts > lastTimestamp) {
        lastTimestamp = ts;
      }
    }
    return lastTimestamp === null ? null : new Date(lastTimestamp);
  }
  /**
   * 获取 Job 的静态快照（若已归档也能取到）
   */
  getJobRecord(jobId) {
    this.ensureReady();
    const snapshot = this.data.jobs[jobId];
    return snapshot ? this.toJobRecord(snapshot) : null;
  }
  /**
   * 遍历所有 Job 快照，可按 metadata.fromTaskId 过滤
   */
  listJobRecords(query) {
    this.ensureReady();
    const records = Object.values(this.data.jobs);
    return records.map((record) => this.toJobRecord(record)).filter((record) => {
      if (query?.fromTaskId) {
        return record.metadata?.fromTaskId === query.fromTaskId;
      }
      return true;
    });
  }
  /**
   * 标记 Job 已被删除（一次性作业触发后调用）
   */
  async markJobRemoved(jobId, removedAt = /* @__PURE__ */ new Date()) {
    this.ensureReady();
    const record = this.data.jobs[jobId];
    if (!record || record.removedAt) {
      return;
    }
    record.removedAt = removedAt.toISOString();
    this.persist();
  }
  toExecution(snapshot) {
    const scheduledAt = new Date(snapshot.scheduledAt);
    if (snapshot.status === "called") {
      if (!snapshot.taskId || !snapshot.triggeredAt) {
        throw new Error("Invalid called execution snapshot");
      }
      return {
        id: snapshot.id,
        status: "called",
        taskId: snapshot.taskId,
        scheduledAt,
        triggeredAt: new Date(snapshot.triggeredAt)
      };
    }
    if (snapshot.status === "missed") {
      return {
        id: snapshot.id,
        status: "missed",
        scheduledAt
      };
    }
    throw new Error("Invalid execution snapshot status");
  }
  toJobRecord(snapshot) {
    return {
      id: snapshot.id,
      payload: snapshot.payload,
      schedule: snapshot.schedule,
      metadata: snapshot.metadata,
      createdAt: new Date(snapshot.createdAt),
      removedAt: snapshot.removedAt ? new Date(snapshot.removedAt) : null
    };
  }
  persist() {
    this.ensureReady();
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), "utf-8");
  }
  ensureReady() {
    if (!this.filePath) {
      throw new Error("AgentJobExecutionStore is not initialized");
    }
  }
  hasExecution(jobId, scheduledAt) {
    const target = scheduledAt.toISOString();
    return this.data.executions.some((item) => item.jobId === jobId && item.scheduledAt === target);
  }
  ensureBaseline(jobId, timestamp) {
    const existing = this.data.executions.find((item) => item.jobId === jobId);
    if (existing) {
      return;
    }
    this.data.executions.push({
      id: crypto.randomUUID(),
      jobId,
      status: "baseline",
      scheduledAt: timestamp.toISOString(),
      triggeredAt: null,
      taskId: null,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
}
const AGENT_SCHEDULER_TYPE = "agent-scheduler";
const MAX_RECONCILE_ITERATIONS = 100;
class AgentScheduler {
  static instance = null;
  static getInstance() {
    if (!AgentScheduler.instance) {
      AgentScheduler.instance = new AgentScheduler();
    }
    return AgentScheduler.instance;
  }
  get scheduler() {
    return getScheduler();
  }
  executionStore = new AgentJobExecutionStore();
  initialized = false;
  /** 初始化：注册 handler + 对现有 job 做一次审计补偿 */
  async init() {
    if (this.initialized) {
      return;
    }
    await this.executionStore.init();
    this.scheduler.register(
      AGENT_SCHEDULER_TYPE,
      async (payload, context) => {
        await this.handleTrigger(payload, context);
      },
      async (payload, context) => {
        await this.handleExpired(payload, context);
      }
    );
    await this.reconcileExistingJobs();
    this.initialized = true;
  }
  /** 添加一个作业，当作业被触发时，会创建一个任务
   *
   * @param schedule 调度时间
   * @param payload 作业参数
   * @param fromTaskId 当前任务id，是创建作业的任务id
   * @returns 添加的作业
   */
  /** 新增一个 Agent Job，会立即同步快照到审计存储 */
  async add(schedule, payload, fromTaskId) {
    const metadata = {
      fromTaskId
    };
    const job = await this.scheduler.add(AGENT_SCHEDULER_TYPE, schedule, payload, { metadata });
    await this.executionStore.upsertJobSnapshot(job.toSnapshot());
    return this.wrapActiveJob(job);
  }
  /**
   * 列出所有 Agent 作业：
   * - active：仍由基础 Scheduler 托管
   * - archived：已经执行/删除，但仍保留审计历史
   */
  async list(query) {
    const jobQuery = this.buildJobQuery(query);
    const jobs = await this.scheduler.list(jobQuery);
    const activeJobs = [];
    const activeIds = /* @__PURE__ */ new Set();
    for (const job of jobs) {
      if (!this.isAgentJob(job)) {
        continue;
      }
      this.executionStore.upsertJobSnapshot(job.toSnapshot());
      const wrapped = this.wrapActiveJob(job);
      activeJobs.push(wrapped);
      activeIds.add(job.id);
    }
    const archivedJobs = this.executionStore.listJobRecords(query).filter((record) => !activeIds.has(record.id)).map((record) => this.wrapArchivedJob(record));
    return [...activeJobs, ...archivedJobs].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }
  /**
   * 获取单个作业，若作业已归档会返回只读视图
   */
  async get(id) {
    const job = await this.scheduler.get(id);
    if (this.isAgentJob(job)) {
      this.executionStore.upsertJobSnapshot(job.toSnapshot());
      return this.wrapActiveJob(job);
    }
    const record = this.executionStore.getJobRecord(id);
    return record ? this.wrapArchivedJob(record) : null;
  }
  /** 基础 Scheduler 触发时的回调：创建任务并记录 called */
  async handleTrigger(payload, context) {
    const taskId = await this.createTask(payload);
    await this.executionStore.recordCall({
      jobId: context.jobId,
      scheduledAt: context.scheduledAt,
      triggeredAt: context.triggeredAt,
      taskId
    });
    await this.archiveIfOneTimeJob(context.jobId);
  }
  /** 一次性任务过期时的回调：记录 missed 并归档 */
  async handleExpired(_payload, context) {
    await this.executionStore.recordMiss({
      jobId: context.jobId,
      scheduledAt: context.scheduledAt
    });
    await this.archiveIfOneTimeJob(context.jobId);
  }
  /** 启动时恢复 cron job，补记离线期间的 missed */
  async reconcileExistingJobs() {
    const snapshots = await this.scheduler.list({
      type: AGENT_SCHEDULER_TYPE
    });
    for (const job of snapshots) {
      if (!this.isAgentJob(job)) {
        continue;
      }
      await this.executionStore.upsertJobSnapshot(job.toSnapshot());
      await this.reconcileJob(job);
    }
  }
  /** 针对单个 cron job 进行 missed 推演 */
  async reconcileJob(job) {
    if (job.schedule.type !== "cron") {
      return;
    }
    const lastScheduledAt = this.executionStore.getLastScheduledAt(job.id) ?? job.createdAt;
    const now = /* @__PURE__ */ new Date();
    if (lastScheduledAt >= now) {
      return;
    }
    const missedSchedules = this.calculateMissedCronSchedules(
      job.schedule.expression,
      lastScheduledAt,
      now
    );
    for (const scheduledAt of missedSchedules) {
      await this.executionStore.recordMiss({
        jobId: job.id,
        scheduledAt
      });
    }
  }
  /** 计算某时间窗口内可能错过的 cron 实例 */
  calculateMissedCronSchedules(expression, after, before) {
    const misses = [];
    try {
      const iterator = CronExpressionParser.parse(expression, {
        currentDate: after,
        endDate: before
      });
      let iteration = 0;
      while (iteration < MAX_RECONCILE_ITERATIONS && iterator.hasNext()) {
        const cronDate = iterator.next();
        const scheduledAt = cronDate.toDate();
        if (scheduledAt >= before) {
          break;
        }
        misses.push(scheduledAt);
        iteration += 1;
      }
    } catch (error) {
      console.warn("[AgentScheduler] Failed to reconcile cron job:", error.message);
    }
    return misses;
  }
  /** 根据 payload 拉起真实 Agent 任务 */
  async createTask(payload) {
    return index$2.D.startTask({
      instructions: payload.instruction
    });
  }
  buildJobQuery(query) {
    const jobQuery = {
      type: AGENT_SCHEDULER_TYPE
    };
    if (query?.fromTaskId) {
      jobQuery.metadata = {
        fromTaskId: query.fromTaskId
      };
    }
    return jobQuery;
  }
  /**
   * 一次性任务一旦触发/过期即视为归档，避免 list 时重复出现在 active 列表
   */
  async archiveIfOneTimeJob(jobId) {
    const record = this.executionStore.getJobRecord(jobId);
    if (record?.schedule.type === "once") {
      await this.executionStore.markJobRemoved(jobId);
    }
  }
  isAgentJob(job) {
    return Boolean(job && job.type === AGENT_SCHEDULER_TYPE);
  }
  wrapActiveJob(job) {
    return new AgentJob(job, this.executionStore);
  }
  wrapArchivedJob(record) {
    return new ArchivedAgentJob(record, this.executionStore);
  }
}
const agentScheduler = AgentScheduler.getInstance();
async function startUp(app_start_time) {
  utils.electronApp.setAppUserModelId("com.flowith.browser");
  registerFlowithProtocol();
  registerCertificateHandlers();
  electron.app.on("browser-window-created", (_, window) => {
    utils.optimizer.watchWindowShortcuts(window);
  });
  logger.group("🚀 Application Startup");
  await index$3.initializeStorage();
  logger.success("Storage system initialized");
  process.on("uncaughtException", (error) => {
    void Promise.resolve().then(() => require("./crashHandler-vKV_m3xl.js")).then(
      ({ globalCrashHandler }) => globalCrashHandler.logCrash(error, "uncaughtException")
    );
  });
  process.on("unhandledRejection", (reason) => {
    void Promise.resolve().then(() => require("./crashHandler-vKV_m3xl.js")).then(
      ({ globalCrashHandler }) => globalCrashHandler.logCrash(reason, "unhandledRejection")
    );
  });
  const { initializeDatabase: initDB } = await Promise.resolve().then(() => require("./index-CR4vSMhM.js"));
  await initDB();
  logger.success("Database initialized");
  try {
    const { getAppStorage: getAppStorage2 } = await Promise.resolve().then(() => require("./index-Bf0u4cvK.js"));
    const storage2 = getAppStorage2();
    const migrationFlag = storage2.store.appSettings.get("url-migration-completed");
    if (!migrationFlag) {
      console.log("[Main] 🔄 Starting URL migration...");
      const { UrlMigration } = await Promise.resolve().then(() => require("./urlMigration-C2gVE6zO.js"));
      await UrlMigration.migrateAll();
      storage2.store.appSettings.set("url-migration-completed", true);
      console.log("[Main] ✅ URL migration completed");
    } else {
      console.log("[Main] ℹ️ URL migration already completed, skipping");
    }
  } catch (error) {
    console.error("[Main] ❌ URL migration failed:", error);
  }
  index$2.W();
  index$4.i();
  initializeIpcHandlers();
  initializeBookmarkService();
  initializeHistoryService();
  const { getScheduler: getScheduler2 } = await Promise.resolve().then(() => index);
  await getScheduler2().init();
  await agentScheduler.init();
  await index$2.X();
  const { intelligenceService } = await Promise.resolve().then(() => require("./index-vXB5mSwm.js")).then((n) => n.ab);
  await intelligenceService.initialize();
  const { agentPresetService } = await Promise.resolve().then(() => require("./TeachModeService-BNgYqdjn.js")).then((n) => n.i);
  agentPresetService.init().catch((err) => {
    console.error("[Main] Failed to preload official presets:", err);
  });
  logger.progress("Loading user session...");
  await config.s.initialize();
  const { modelConfigService } = await Promise.resolve().then(() => require("./index-vXB5mSwm.js")).then((n) => n.a8);
  try {
    await modelConfigService.refresh("startup");
  } catch (error) {
    console.error("[Main] ❌ 初始化模型配置服务失败，使用内置默认配置", error);
  }
  const { posthogService: posthogService2 } = await Promise.resolve().then(() => require("./posthogService-khJWbAtc.js"));
  await posthogService2.initialize();
  if (posthogService2.isEnabled()) {
    void posthogService2.track("app_started", {
      version: electron.app.getVersion(),
      platform: process.platform,
      electron_version: process.versions.electron
    });
  }
  initializeAgentSnapshotAnalytics();
  const { flowManager } = await Promise.resolve().then(() => require("./flowManager-BwBec1ar.js"));
  flowManager.initializeIpcHandlers();
  index$2.Y();
  mainEventBus.m.emit("app:wakeup");
  electron.app.on("activate", () => {
    mainEventBus.m.emit("app:wakeup");
  });
  electron.app.on("second-instance", (_event, commandLine) => {
    console.log("[Main] 🌐 检测到第二个实例，命令行参数:", commandLine);
    mainEventBus.m.emit("app:wakeup");
    const urls = commandLine.filter((arg) => {
      return arg.startsWith("http://") || arg.startsWith("https://");
    });
    if (urls.length > 0) {
      const url = urls[urls.length - 1];
      console.log("[Main] 🌐 从命令行提取 URL:", url);
      handleExternalUrl(url);
    }
  });
  AbstractModalViewManager.v.onIdle().then(() => {
    const totalElapsed = Date.now() - app_start_time;
    logger.success(`System ready (total: ${totalElapsed}ms)`);
  });
  index$2.Z();
  const { getAppStorage } = await Promise.resolve().then(() => require("./index-Bf0u4cvK.js"));
  const storage = getAppStorage();
  const onboardingCompleted = storage.store.appSettings.get("onboardingCompleted", false);
  const drainedOpenUrls = certificateManager.s(handleExternalUrl);
  if (!onboardingCompleted) {
    console.log("[Main] 🎯 首次启动检测：显示完整 Onboarding 流程");
    index$2.w.show();
    console.log("[Main] ⏸️ 首次启动：跳过创建初始标签页，等待 onboarding 完成");
  } else {
    const startupUrls = [...drainedOpenUrls];
    if (process.platform === "win32" || process.platform === "linux") {
      const args = process.argv;
      console.log("[Main] 检查命令行参数:", args);
      const urlArgs = args.filter((arg) => arg.startsWith("http://") || arg.startsWith("https://"));
      startupUrls.push(...urlArgs);
    }
    if (startupUrls.length > 0) {
      console.log("[Main] 🌐 使用启动 URL 创建标签页列表:", startupUrls);
      for (const url of startupUrls) {
        await index$2.t.createTab(url, void 0, true);
      }
    } else {
      await index$2.t.createTab();
    }
  }
  registerHypergptFrontendHandlers();
  try {
    new TranslationHandler();
  } catch (error) {
    console.error("[Main] ❌ TranslationHandler 初始化失败:", error);
  }
  createApplicationMenu();
  void quitHandler.q.isImmediateQuitAllowed();
  if (!electron.app.isPackaged) {
    registerDevShortcuts();
  }
  initializeTray();
  const autoUpdateDelay = electron.app.isPackaged ? parseInt(process.env.AUTO_UPDATE_STARTUP_DELAY || "0") * 1e3 : 0;
  setTimeout(async () => {
    try {
      await index$4.a.initialize();
    } catch (error) {
      console.error("[Main] ❌ 自动更新初始化失败（不影响应用使用）:", error);
    }
  }, autoUpdateDelay);
  const shouldCheckUpdateLog = electron.app.isPackaged || process.env.AUTO_UPDATE_ENABLE_IN_DEV === "true";
  console.log("[Main] update-completed 检查决策:", {
    isPackaged: electron.app.isPackaged,
    AUTO_UPDATE_ENABLE_IN_DEV: process.env.AUTO_UPDATE_ENABLE_IN_DEV,
    shouldCheckUpdateLog
  });
  if (shouldCheckUpdateLog) {
    setTimeout(async () => {
      try {
        const { getAppStorage: getAppStorage2 } = await Promise.resolve().then(() => require("./index-Bf0u4cvK.js"));
        const storage2 = getAppStorage2();
        const exists = storage2.fs.exists("config", "update-info.json");
        if (exists) {
          const updateLog = await storage2.fs.readJSON("config", "update-info.json");
          console.log("[Main] 发现待显示的更新日志:", updateLog.version);
          console.log("[Main] updateLog 完整内容:", JSON.stringify(updateLog, null, 2));
          const currentVersion = electron.app.getVersion();
          const updateLogVersion = updateLog.version?.replace(/^v/, "");
          console.log("[Main] 版本对比:", {
            updateLogVersion,
            currentVersion,
            匹配: updateLogVersion === currentVersion
          });
          if (updateLogVersion !== currentVersion) {
            console.log("[Main] 更新日志版本不匹配当前版本，跳过显示", {
              updateLogVersion,
              currentVersion
            });
            return;
          }
          console.log("[Main] notified 检查:", updateLog.notified, typeof updateLog.notified);
          if (updateLog.notified === true) {
            console.log("[Main] 更新日志已通知过，跳过显示");
            return;
          }
          const lastUpdate = await index$4.a.getLastUpdateAvailable();
          console.log("[Main] lastUpdate:", lastUpdate);
          const hasNewerUpdate = lastUpdate && lastUpdate.time > updateLog.installedAt && lastUpdate.version !== updateLog.version;
          console.log("[Main] hasNewerUpdate 检查:", {
            hasNewerUpdate,
            lastUpdateTime: lastUpdate?.time,
            installedAt: updateLog.installedAt,
            时间对比: lastUpdate ? lastUpdate.time > updateLog.installedAt : "N/A"
          });
          if (hasNewerUpdate) {
            console.log("[Main] 检测到有更新版本，跳过显示已更新日志", {
              lastUpdateVersion: lastUpdate.version,
              lastUpdateTime: lastUpdate.time,
              installedAt: updateLog.installedAt
            });
            return;
          }
          console.log("[Main] ✅ 所有检查通过，准备发送 update-completed 到 UpdateToast");
          const { updateToast } = await Promise.resolve().then(() => require("./index-vXB5mSwm.js")).then((n) => n.ae);
          const currentChannel = index$4.a.getCurrentChannel();
          await updateToast.sendUpdateInfo({
            type: "update-completed",
            version: updateLog.version,
            releaseNotes: updateLog.releaseNotes,
            installedAt: updateLog.installedAt,
            channel: currentChannel
          });
          console.log("[Main] ✅ update-completed 已发送");
        }
      } catch (error) {
        console.error("[Main] 检查更新日志失败:", error);
      }
    }, 0);
  } else {
    console.log("[Main] 开发环境未启用更新功能，跳过 update-completed 检查");
  }
  logger.groupEnd();
}
exports.startUp = startUp;
