"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const electron = require("electron"), path = require("path"), fs = require("fs/promises"), fs$1 = require("fs");
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
const fs__namespace = /* @__PURE__ */ _interopNamespaceDefault(fs);
const fs__namespace$1 = /* @__PURE__ */ _interopNamespaceDefault(fs$1);
class PathManager {
  rootPath;
  _paths = null;
  constructor() {
    this.rootPath = electron.app.getPath("userData");
  }
  /**
   * 获取所有存储路径
   */
  get paths() {
    if (!this._paths) {
      this._paths = {
        root: this.rootPath,
        config: path__namespace.join(this.rootPath, "config"),
        data: path__namespace.join(this.rootPath, "data"),
        logs: path__namespace.join(this.rootPath, "logs"),
        cache: path__namespace.join(this.rootPath, "cache"),
        temp: path__namespace.join(this.rootPath, "temp"),
        database: path__namespace.join(this.rootPath, "database")
      };
    }
    return this._paths;
  }
  /**
   * 获取特定范围的路径
   */
  getPath(scope, ...subPaths) {
    const basePath = this.paths[scope];
    if (subPaths.length === 0) {
      return basePath;
    }
    return path__namespace.join(basePath, ...subPaths);
  }
  /**
   * 确保目录存在
   */
  async ensureDirectory(scope, ...subPaths) {
    const fullPath = this.getPath(scope, ...subPaths);
    await fs__namespace.mkdir(fullPath, { recursive: true });
    return fullPath;
  }
  /**
   * 确保所有核心目录存在
   */
  async ensureDirectories() {
    const directories = [
      // 基础目录
      this.paths.config,
      this.paths.data,
      this.paths.logs,
      this.paths.cache,
      this.paths.temp,
      this.paths.database,
      // 数据子目录
      this.getPath("data", "agent-data"),
      // 日志子目录
      this.getPath("logs", "crash"),
      this.getPath("logs", "app"),
      // 缓存子目录
      this.getPath("cache", "screenshots"),
      this.getPath("cache", "thumbnails"),
      // 数据库子目录
      this.getPath("database", "sqlite")
    ];
    for (const dir of directories) {
      try {
        await fs__namespace.mkdir(dir, { recursive: true });
      } catch (error) {
        console.error(`[PathManager] Failed to create directory: ${dir}`, error);
        throw error;
      }
    }
  }
}
class SimpleStore {
  data = {};
  filePath;
  constructor(name, cwd, defaults = {}) {
    this.filePath = path__namespace.join(cwd, `${name}.json`);
    this.data = { ...defaults };
    this.loadSync();
  }
  loadSync() {
    try {
      const content = fs__namespace$1.readFileSync(this.filePath, "utf8");
      this.data = { ...this.data, ...JSON.parse(content) };
    } catch {
    }
  }
  async save() {
    try {
      await fs__namespace.mkdir(path__namespace.dirname(this.filePath), { recursive: true });
      await fs__namespace.writeFile(this.filePath, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error("Failed to save store:", error);
    }
  }
  get(key, defaultValue) {
    return key in this.data ? this.data[key] : defaultValue;
  }
  set(keyOrObject, value) {
    if (typeof keyOrObject === "string") {
      this.data[keyOrObject] = value;
    } else {
      Object.assign(this.data, keyOrObject);
    }
    this.save();
  }
  has(key) {
    return key in this.data;
  }
  delete(key) {
    delete this.data[key];
    this.save();
  }
  clear() {
    this.data = {};
    this.save();
  }
  get size() {
    return Object.keys(this.data).length;
  }
  get store() {
    return { ...this.data };
  }
}
class StoreManager {
  stores = /* @__PURE__ */ new Map();
  pathManager;
  constructor(pathManager) {
    this.pathManager = pathManager;
  }
  /**
   * 获取或创建 Store 实例
   */
  getStore(name, options) {
    if (!this.stores.has(name)) {
      try {
        const store = new SimpleStore(name, this.pathManager.paths.config, options?.defaults || {});
        this.stores.set(name, store);
      } catch (error) {
        console.error(`[StoreManager] Failed to create store ${name}:`, error);
        const fallbackStore = new SimpleStore(name, "/tmp", {});
        this.stores.set(name, fallbackStore);
      }
    }
    return this.stores.get(name);
  }
  /**
   * 应用设置存储
   */
  get appSettings() {
    return this.getStore("app-settings", {
      defaults: {
        theme: "system",
        language: "zh-CN",
        autoUpdate: true,
        enableNotifications: true,
        enableAnalytics: false,
        whitelistVerified: false,
        osInvitationVerified: false,
        onboardingCompleted: false,
        // 新增：标记用户是否完成过 onboarding 流程
        adBlockEnabled: false
        // 广告拦截开关
      },
      schema: {
        theme: {
          type: "string",
          enum: ["light", "dark", "system"],
          default: "system"
        },
        language: {
          type: "string",
          default: "zh-CN"
        },
        autoUpdate: {
          type: "boolean",
          default: true
        },
        enableNotifications: {
          type: "boolean",
          default: true
        },
        enableAnalytics: {
          type: "boolean",
          default: false
        },
        adBlockEnabled: {
          type: "boolean",
          default: false
        }
      }
    });
  }
  /**
   * 广告拦截统计存储
   */
  get adBlockStats() {
    return this.getStore("adblock-stats", {
      defaults: {
        totalBlocked: 0,
        networkBlocked: 0,
        cosmeticBlocked: 0,
        lastResetTime: Date.now()
      },
      schema: {
        totalBlocked: {
          type: "number",
          default: 0
        },
        networkBlocked: {
          type: "number",
          default: 0
        },
        cosmeticBlocked: {
          type: "number",
          default: 0
        },
        lastResetTime: {
          type: "number",
          default: Date.now()
        }
      }
    });
  }
  /**
   * 窗口状态存储
   */
  get window() {
    return this.getStore("window-state", {
      defaults: {
        bounds: {
          width: 1200,
          height: 800,
          x: void 0,
          y: void 0
        },
        isMaximized: false,
        isFullscreen: false,
        displayId: void 0
      },
      schema: {
        bounds: {
          type: "object",
          properties: {
            width: { type: "number", minimum: 400 },
            height: { type: "number", minimum: 300 },
            x: { type: "number" },
            y: { type: "number" }
          },
          required: ["width", "height"]
        },
        isMaximized: {
          type: "boolean",
          default: false
        },
        isFullscreen: {
          type: "boolean",
          default: false
        },
        displayId: {
          type: "string"
        }
      }
    });
  }
  /**
   * 用户偏好设置存储
   */
  get preferences() {
    return this.getStore("preferences", {
      defaults: {
        browser: {
          homepage: "https://google.com",
          searchEngine: "google",
          enableJavaScript: true,
          enableImages: true,
          enablePopups: false
        },
        agent: {
          enableVision: true,
          maxConcurrentTasks: 3,
          defaultModel: "claude-3-sonnet"
        },
        ui: {
          showAddressBar: true,
          showSidebar: true,
          sidebarWidth: 56,
          enableAnimations: true
        }
      }
    });
  }
  /**
   * 会话数据存储
   */
  get session() {
    return this.getStore("session", {
      defaults: {
        lastActiveTabs: [],
        recentFiles: [],
        searchHistory: [],
        currentUser: null
      }
    });
  }
  /**
   * 缓存数据存储
   */
  get cache() {
    return this.getStore("cache", {
      defaults: {
        thumbnails: {},
        apiResponses: {},
        fileHashes: {}
      }
    });
  }
  /**
   * 归档任务存储
   */
  get archivedTasks() {
    return this.getStore("archived-tasks", {
      defaults: {
        tasks: []
      }
    });
  }
  /**
   * 获取所有 Store 的统计信息
   */
  getStoreStats() {
    const stores = Array.from(this.stores.entries()).map(([name, store]) => {
      const storeData = store.store || {};
      return {
        name,
        size: JSON.stringify(storeData).length,
        path: store.path || "",
        itemCount: Object.keys(storeData).length
      };
    });
    return {
      storeCount: this.stores.size,
      stores
    };
  }
  /**
   * 清理所有 Store 缓存
   */
  clear() {
    for (const [name, store] of this.stores) {
      store.clear();
      console.log(`[StoreManager] Cleared store: ${name}`);
    }
  }
  /**
   * 重置指定 Store 为默认值
   */
  reset(storeName) {
    const store = this.stores.get(storeName);
    if (store) {
      store.clear();
      console.log(`[StoreManager] Reset store: ${storeName}`);
    }
  }
  /**
   * 备份所有 Store 数据
   */
  async backup() {
    const backup = {};
    for (const [name, store] of this.stores) {
      backup[name] = store.store || {};
    }
    return backup;
  }
  /**
   * 从备份恢复 Store 数据
   */
  async restore(backup) {
    for (const [name, data] of Object.entries(backup)) {
      if (this.stores.has(name)) {
        const store = this.stores.get(name);
        store.clear();
        Object.entries(data).forEach(([key, value]) => {
          store.set(key, value);
        });
        console.log(`[StoreManager] Restored store: ${name}`);
      }
    }
  }
  /**
   * 关闭所有 Store
   */
  close() {
    this.stores.clear();
    console.log("[StoreManager] All stores closed");
  }
}
class FileSystemManager {
  pathManager;
  constructor(pathManager) {
    this.pathManager = pathManager;
  }
  // ========== 基础文件操作 ==========
  /**
   * 检查文件是否存在
   */
  exists(scope, ...pathSegments) {
    const filePath = this.pathManager.getPath(scope, ...pathSegments);
    return fs$1.existsSync(filePath);
  }
  /**
   * 读取文件为 Buffer
   */
  async readFile(scope, fileName) {
    const filePath = this.pathManager.getPath(scope, fileName);
    if (!fs$1.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    return await fs__namespace.readFile(filePath);
  }
  /**
   * 读取文件为字符串
   */
  async readText(scope, fileName, encoding = "utf8") {
    const buffer = await this.readFile(scope, fileName);
    return buffer.toString(encoding);
  }
  /**
   * 写入文件
   */
  async writeFile(scope, fileName, data, options) {
    const filePath = this.pathManager.getPath(scope, fileName);
    const dir = path__namespace.dirname(filePath);
    await fs__namespace.mkdir(dir, { recursive: true });
    if (!options?.overwrite && fs$1.existsSync(filePath)) {
      throw new Error(`File already exists: ${filePath}`);
    }
    await fs__namespace.writeFile(filePath, data);
  }
  /**
   * 写入文本文件
   */
  async writeText(scope, fileName, text, options) {
    await this.writeFile(scope, fileName, text, options);
  }
  /**
   * 删除文件
   */
  async deleteFile(scope, fileName) {
    const filePath = this.pathManager.getPath(scope, fileName);
    if (fs$1.existsSync(filePath)) {
      await fs__namespace.unlink(filePath);
    }
  }
  // ========== JSON 操作 ==========
  /**
   * 读取 JSON 文件
   */
  async readJSON(scope, fileName) {
    const text = await this.readText(scope, fileName);
    try {
      return JSON.parse(text);
    } catch (error) {
      throw new Error(`Invalid JSON in file: ${fileName}. ${error}`);
    }
  }
  /**
   * 写入 JSON 文件
   */
  async writeJSON(scope, fileName, data, options) {
    const indent = options?.indent ?? 2;
    const jsonString = JSON.stringify(data, null, indent);
    await this.writeText(scope, fileName, jsonString, options);
  }
  // ========== 目录操作 ==========
  /**
   * 列出目录中的文件
   */
  async listFiles(scope, subPath = "", pattern) {
    const dirPath = this.pathManager.getPath(scope, subPath);
    if (!fs$1.existsSync(dirPath)) {
      return [];
    }
    const files = await fs__namespace.readdir(dirPath);
    if (pattern) {
      return files.filter((file) => pattern.test(file));
    }
    return files;
  }
  /**
   * 创建目录
   */
  async createDirectory(scope, ...pathSegments) {
    return await this.pathManager.ensureDirectory(scope, ...pathSegments);
  }
  /**
   * 删除目录
   */
  async deleteDirectory(scope, subPath, recursive = false) {
    const dirPath = this.pathManager.getPath(scope, subPath);
    if (fs$1.existsSync(dirPath)) {
      await fs__namespace.rm(dirPath, { recursive: recursive || false, force: true });
    }
  }
  // ========== 高级操作 ==========
  /**
   * 清理文件
   */
  async cleanup(scope, options) {
    const dirPath = this.pathManager.paths[scope];
    let deletedCount = 0;
    if (!fs$1.existsSync(dirPath)) {
      return 0;
    }
    const processDirectory = async (currentDir) => {
      const items = await fs__namespace.readdir(currentDir, { withFileTypes: true });
      for (const item of items) {
        const itemPath = path__namespace.join(currentDir, item.name);
        if (item.isDirectory() && options?.recursive) {
          await processDirectory(itemPath);
        } else if (item.isFile()) {
          let shouldDelete = false;
          if (options?.olderThan) {
            const stats = await fs__namespace.stat(itemPath);
            if (stats.mtime < options.olderThan) {
              shouldDelete = true;
            }
          }
          if (options?.pattern) {
            const regex = new RegExp(options.pattern);
            if (regex.test(item.name)) {
              shouldDelete = true;
            }
          }
          if (!options?.olderThan && !options?.pattern) {
            shouldDelete = true;
          }
          if (shouldDelete) {
            await fs__namespace.unlink(itemPath);
            deletedCount++;
          }
        }
      }
    };
    await processDirectory(dirPath);
    return deletedCount;
  }
}
class AppStorage {
  pathManager;
  storeManager;
  fileSystemManager;
  // removed shared FS
  isInitialized = false;
  constructor() {
    this.pathManager = new PathManager();
    this.storeManager = new StoreManager(this.pathManager);
    this.fileSystemManager = new FileSystemManager(this.pathManager);
  }
  // ========== 生命周期管理 ==========
  /**
   * 初始化存储系统
   */
  async initialize() {
    if (this.isInitialized) {
      console.warn("[AppStorage] Already initialized");
      return;
    }
    try {
      await this.pathManager.ensureDirectories();
      this.setupPeriodicCleanup();
      this.isInitialized = true;
    } catch (error) {
      console.error("[AppStorage] Failed to initialize:", error);
      throw error;
    }
  }
  /**
   * 检查是否已初始化
   */
  get initialized() {
    return this.isInitialized;
  }
  // ========== 公开 API ==========
  /**
   * 获取路径管理器
   */
  get paths() {
    return this.pathManager;
  }
  /**
   * 获取 Store 管理器
   */
  get store() {
    return this.storeManager;
  }
  /**
   * 获取文件系统管理器
   */
  get fs() {
    return this.fileSystemManager;
  }
  // ========== 便捷方法 ==========
  /**
   * 获取指定范围的路径
   */
  getPath(scope, ...subPaths) {
    return this.pathManager.getPath(scope, ...subPaths);
  }
  /**
   * 清理临时文件
   */
  async cleanupTemp(olderThan) {
    const deletedCount = await this.fileSystemManager.cleanup("temp", {
      olderThan,
      recursive: true
    });
    return deletedCount;
  }
  /**
   * 清理缓存文件
   */
  async cleanupCache(olderThan) {
    let deletedCount = 0;
    let freedSpace = 0;
    if (olderThan) {
      deletedCount = await this.fileSystemManager.cleanup("cache", {
        olderThan,
        recursive: true
      });
    }
    return { deletedCount, freedSpace };
  }
  // ========== 私有方法 ==========
  /**
   * 设置定期清理
   */
  setupPeriodicCleanup() {
    setInterval(
      () => {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1e3);
        this.cleanupTemp(oneDayAgo).catch((error) => {
          console.warn("[AppStorage] Periodic temp cleanup failed:", error);
        });
      },
      60 * 60 * 1e3
    );
    setInterval(
      () => {
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3);
        this.cleanupCache(oneWeekAgo).catch((error) => {
          console.warn("[AppStorage] Periodic cache cleanup failed:", error);
        });
      },
      24 * 60 * 60 * 1e3
    );
  }
}
let appStorageInstance = null;
function getAppStorage() {
  if (!appStorageInstance) {
    appStorageInstance = new AppStorage();
  }
  return appStorageInstance;
}
async function initializeStorage() {
  const storage = getAppStorage();
  if (!storage.initialized) {
    await storage.initialize();
  }
  return storage;
}
exports.AppStorage = AppStorage;
exports.FileSystemManager = FileSystemManager;
exports.StoreManager = StoreManager;
exports.default = getAppStorage;
exports.getAppStorage = getAppStorage;
exports.initializeStorage = initializeStorage;
