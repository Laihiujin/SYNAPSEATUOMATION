"use strict";
const electron = require("electron"), utils = require("@electron-toolkit/utils"), path = require("path"), index = require("../index.js"), PQueue = require("p-queue");
const PQueueCtor = PQueue.default;
const viewPreloadQueue = new PQueueCtor({
  concurrency: 3
});
class AbstractModalViewManager {
  constructor(componentName, readyChannel, presetScriptName, presetHtmlName, loadTimeout = utils.is.dev ? 3e4 : 12e3, reactReadyTimeout = utils.is.dev ? 3e4 : 12e3) {
    this.componentName = componentName;
    this.readyChannel = readyChannel;
    this.loadTimeout = loadTimeout;
    this.reactReadyTimeout = reactReadyTimeout;
    this.presetScriptName = presetScriptName ?? `${componentName}.js`;
    this.presetHtmlName = presetHtmlName ?? `${componentName}.html`;
    const preload = path.join(index.g(), "../preload", this.presetScriptName);
    this.view = new electron.WebContentsView({
      webPreferences: {
        preload,
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false
      }
    });
    this.view.setVisible(false);
  }
  // WebContentsView 在构造函数中同步创建，保证顺序稳定
  view;
  parentView = null;
  parentBoundsListener = null;
  // 资源名称（可由子类重写构造参数，也可按 componentName 推断）
  presetScriptName;
  presetHtmlName;
  // 加载状态（使用单一 Promise 简化并发控制）
  loadPromise = null;
  // ========== 抽象方法（子类必须实现） ==========
  /**
   * View 创建后的回调（可选配置，如 setBackgroundColor）
   * 默认行为：设置完全透明背景，适合作为 overlay。
   * 子类可按需重写以自定义背景或增加额外逻辑。
   */
  onViewReady(view) {
    view.setBackgroundColor("#00000000");
  }
  /**
   * View 添加到父容器后的回调（可选，如设置 bounds 监听）
   */
  onViewAddedToParent(_view) {
  }
  // ========== 通用生命周期方法 ==========
  /**
   * 计算当前 View 在父视图中的布局。
   * 默认行为：让 overlay 全屏覆盖父视图。
   * 子类可覆盖本方法以实现自定义布局（如左下角浮窗、锚点弹窗等）。
   */
  getViewBounds(parentBounds) {
    return {
      x: 0,
      y: 0,
      width: parentBounds.width,
      height: parentBounds.height
    };
  }
  /**
   * 父视图 bounds 变化时的回调，内部调用 getViewBounds 应用布局。
   * 一般不需要子类重写，优先重写 getViewBounds 即可。
   */
  onParentBoundsChanged() {
    if (!this.parentView) {
      return;
    }
    const parentBounds = this.parentView.getBounds();
    const bounds = this.getViewBounds(parentBounds);
    this.view.setBounds(bounds);
  }
  /**
   * 将已构造好的 view 挂载到父 View 上（同步执行，保证层级顺序）
   */
  addToParent(parent) {
    if (this.parentView) {
      throw new Error(`[${this.componentName}] View 已经挂载到父视图，不能重复调用 addToParent`);
    }
    this.parentView = parent;
    this.parentView.addChildView(this.view);
    const applyBounds = () => {
      this.onParentBoundsChanged();
    };
    this.parentBoundsListener = applyBounds;
    this.onParentBoundsChanged();
    this.parentView.on("bounds-changed", applyBounds);
    this.onViewAddedToParent(this.view);
  }
  /**
   * 确保 View 内容已加载完成（HTML + React），不再负责挂载顺序
   */
  ensureViewCreated() {
    if (!this.loadPromise) {
      this.loadPromise = this.createView().catch((err) => {
        this.loadPromise = null;
        throw err;
      });
    }
    return this.loadPromise;
  }
  /**
   * 加载页面
   */
  preload() {
    return this.ensureViewCreated();
  }
  /**
   * 标准初始化方法：
   * - 防止重复初始化（多次调用仅告警并返回）
   * - 将 View 挂载到父 View
   * - 注册到预加载队列（按优先级）
   */
  init(parentView, preloadPriority) {
    if (this.parentView) {
      console.warn(`[${this.componentName}] Already initialized`);
      return;
    }
    this.addToParent(parentView);
    viewPreloadQueue.add(
      async () => {
        await this.preload();
      },
      { priority: preloadPriority }
    );
  }
  /**
   * 标准显示方法（供简单场景直接复用）：
   * - 确保内容加载完成
   * - 根据父视图计算并应用布局（getViewBounds）
   * - 设置可见并聚焦
   *
   * 复杂场景可以在子类中包装一层，例如：
   * async open() { await this.show(); this.view.webContents.send(...); }
   * 或者重写 show 方法，在内部使用 super.show() 复用基类逻辑
   */
  async show() {
    await this.ensureViewCreated();
    this.onParentBoundsChanged();
    this.view.setVisible(true);
    this.view.webContents.focus();
  }
  /**
   * 基础隐藏方法：简单将 View 设为不可见。
   * 子类如需额外逻辑（如恢复窗口大小），可以重写此方法。
   */
  hide() {
    this.view.setVisible(false);
  }
  /**
   * 获取当前 View 的 WebContents
   */
  getWebContents() {
    return this.view.webContents;
  }
  /**
   * 切换当前 View 的 DevTools 状态
   */
  toggleDevTools() {
    const wc = this.view.webContents;
    if (wc.isDevToolsOpened()) {
      wc.closeDevTools();
    } else {
      wc.openDevTools({ mode: "undocked" });
    }
  }
  /**
   * 销毁管理器（释放所有资源）
   */
  dispose() {
    const parent = this.parentView;
    if (parent) {
      if (this.parentBoundsListener) {
        parent.removeListener("bounds-changed", this.parentBoundsListener);
        this.parentBoundsListener = null;
      }
      try {
        parent.removeChildView(this.view);
      } catch {
      }
    }
    this.parentView = null;
    this.loadPromise = null;
  }
  // ========== 私有方法 ==========
  /**
   * 加载 WebContents 内容（HTML + React 就绪），不创建 / 挂载 View
   */
  async createView() {
    const view = this.view;
    const loadPromise = new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`[${this.componentName}] HTML 加载超时（${this.loadTimeout}ms）`));
      }, this.loadTimeout);
      view.webContents.once("did-finish-load", () => {
        clearTimeout(timeoutId);
        resolve();
      });
      view.webContents.once("did-fail-load", (_event, errorCode, errorDescription) => {
        clearTimeout(timeoutId);
        reject(
          new Error(`[${this.componentName}] HTML 加载失败: ${errorCode} - ${errorDescription}`)
        );
      });
    });
    const reactReadyPromise = new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        console.warn(`[${this.componentName}] React 就绪信号超时（${this.reactReadyTimeout}ms）`);
        resolve();
      }, this.reactReadyTimeout);
      const readyHandler = (_event, channel) => {
        if (channel === this.readyChannel) {
          clearTimeout(timeoutId);
          resolve();
          view.webContents.off("ipc-message", readyHandler);
        }
      };
      view.webContents.on("ipc-message", readyHandler);
    });
    if (utils.is.dev && process.env.ELECTRON_RENDERER_URL) {
      await view.webContents.loadURL(process.env.ELECTRON_RENDERER_URL + "/" + this.presetHtmlName);
    } else {
      await view.webContents.loadFile(path.join(index.g(), "../renderer", this.presetHtmlName));
    }
    await loadPromise;
    await reactReadyPromise;
    this.onViewReady(view);
  }
}
exports.A = AbstractModalViewManager;
exports.v = viewPreloadQueue;
