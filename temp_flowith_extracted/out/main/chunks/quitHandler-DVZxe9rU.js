"use strict";
const electron = require("electron"), AbstractModalViewManager = require("./AbstractModalViewManager-aig2dJrA.js");
const WARNING_WIDTH = 320;
const WARNING_HEIGHT = 120;
const TOP_MARGIN = 32;
class QuitWarningManager extends AbstractModalViewManager.A {
  static instance = null;
  constructor() {
    super("quitWarning", "quit-warning:ready");
  }
  static getInstance() {
    if (!QuitWarningManager.instance) {
      QuitWarningManager.instance = new QuitWarningManager();
    }
    return QuitWarningManager.instance;
  }
  getViewBounds(parentBounds) {
    return {
      x: Math.floor((parentBounds.width - WARNING_WIDTH) / 2),
      y: TOP_MARGIN,
      width: WARNING_WIDTH,
      height: WARNING_HEIGHT
    };
  }
}
const quitWarning = QuitWarningManager.getInstance();
class QuitHandler {
  static instance = null;
  quitWarningActive = false;
  quitWarningTimer = null;
  WARNING_DURATION = 2e3;
  // 2 seconds
  triggerSource = "cmd-q";
  immediateQuitAllowed = false;
  constructor() {
  }
  static getInstance() {
    if (!QuitHandler.instance) {
      QuitHandler.instance = new QuitHandler();
    }
    return QuitHandler.instance;
  }
  /**
   * Trigger quit from Command+W when no tabs remain
   */
  triggerQuitFromCmdW() {
    this.requestQuit("cmd-w");
  }
  /**
   * Trigger quit from Command+Q (menu or shortcut)
   */
  triggerQuitFromCmdQ() {
    this.requestQuit("cmd-q");
  }
  /**
   * Allow quitting immediately without the hold-to-quit confirmation.
   * Used for system-level window close actions.
   */
  allowImmediateQuit(source = "cmd-q") {
    console.log(`[QuitHandler] Immediate quit allowed from ${source}`);
    this.triggerSource = source;
    this.immediateQuitAllowed = true;
    this.cleanup();
  }
  isImmediateQuitAllowed() {
    return this.immediateQuitAllowed;
  }
  resetImmediateQuit() {
    this.immediateQuitAllowed = false;
  }
  requestQuit(source) {
    this.immediateQuitAllowed = false;
    if (this.quitWarningActive) {
      const shortcut2 = source === "cmd-w" ? "⌘W" : "⌘Q";
      console.log(`[QuitHandler] Second ${shortcut2} - Quitting`);
      this.allowImmediateQuit(source);
      electron.app.quit();
      return;
    }
    const shortcut = source === "cmd-w" ? "⌘W" : "⌘Q";
    console.log(`[QuitHandler] First ${shortcut} - Press again to quit`);
    this.triggerSource = source;
    this.showQuitWarning();
  }
  async showQuitWarning() {
    this.quitWarningActive = true;
    await quitWarning.show();
    const webContents = quitWarning.getWebContents();
    if (webContents && !webContents.isDestroyed()) {
      webContents.send("show-quit-warning", {
        duration: this.WARNING_DURATION,
        shortcut: this.triggerSource === "cmd-w" ? "⌘W" : "⌘Q"
      });
    }
    this.quitWarningTimer = setTimeout(() => {
      console.log("[QuitHandler] Warning timeout - reset");
      this.clearQuitWarning();
    }, this.WARNING_DURATION);
  }
  clearQuitWarning() {
    this.quitWarningActive = false;
    if (this.quitWarningTimer) {
      clearTimeout(this.quitWarningTimer);
      this.quitWarningTimer = null;
    }
    const webContents = quitWarning.getWebContents();
    if (webContents && !webContents.isDestroyed()) {
      webContents.send("hide-quit-warning");
    }
    setTimeout(() => {
      quitWarning.hide();
    }, 300);
  }
  cleanup() {
    if (this.quitWarningTimer) {
      clearTimeout(this.quitWarningTimer);
      this.quitWarningTimer = null;
    }
    this.quitWarningActive = false;
    quitWarning.hide();
  }
}
const quitHandler = QuitHandler.getInstance();
const quitHandler$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({ __proto__: null, quitHandler }, Symbol.toStringTag, { value: "Module" }));
exports.a = quitWarning;
exports.b = quitHandler$1;
exports.q = quitHandler;
