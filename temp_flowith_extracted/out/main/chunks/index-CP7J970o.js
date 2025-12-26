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
const electron = require("electron"), log = require("electron-log"), config = require("./supabaseManager-BAbRVJxx.js"), electronUpdater = require("electron-updater"), fs = require("fs"), fs$1 = require("fs/promises"), path = require("path"), os = require("os"), index$1 = require("./index-Bf0u4cvK.js"), mainEventBus = require("./mainEventBus-D2ZkkKhI.js");
const LOCALE_CONFIG = {
  de: {
    nativeName: "Deutsch",
    detect: ["de"]
  },
  en: {
    nativeName: "English",
    detect: ["en"]
  },
  es: {
    nativeName: "Español",
    detect: ["es"]
  },
  fr: {
    nativeName: "Français",
    detect: ["fr"]
  },
  id: {
    nativeName: "Bahasa Indonesia",
    detect: ["id"]
  },
  jp: {
    nativeName: "日本語",
    detect: ["ja"]
    // Browser uses 'ja', we use 'jp'
  },
  ko: {
    nativeName: "한국어",
    detect: ["ko"]
  },
  pt: {
    nativeName: "Português",
    detect: ["pt"]
  },
  ru: {
    nativeName: "Русский",
    detect: ["ru"]
  },
  th: {
    nativeName: "ภาษาไทย",
    detect: ["th"]
  },
  tr: {
    nativeName: "Türkçe",
    detect: ["tr"]
  },
  vi: {
    nativeName: "Tiếng Việt",
    detect: ["vi"]
  },
  "zh-CN": {
    nativeName: "简体中文",
    detect: ["zh-cn", "zh-hans"]
  },
  "zh-TW": {
    nativeName: "繁體中文",
    detect: ["zh-tw", "zh-hant"]
  }
};
const LOCALES = Object.keys(LOCALE_CONFIG);
function isValidLocale(value) {
  return typeof value === "string" && LOCALES.includes(value);
}
const STORAGE_KEY = "rendererLocale";
class LocaleManager {
  locale;
  constructor() {
    this.locale = this.loadInitialLocale();
  }
  loadInitialLocale() {
    try {
      const store = index$1.getAppStorage().store.appSettings;
      const stored = store.get(STORAGE_KEY);
      if (isValidLocale(stored)) {
        return stored;
      }
    } catch (error) {
      console.warn("[LocaleManager] Failed to load locale from storage:", error);
    }
    return "en";
  }
  persist(locale) {
    try {
      index$1.getAppStorage().store.appSettings.set(STORAGE_KEY, locale);
    } catch (error) {
      console.warn("[LocaleManager] Failed to persist locale:", error);
    }
  }
  getLocale() {
    return this.locale;
  }
  setLocale(locale, options = { broadcast: true }) {
    if (!isValidLocale(locale)) return;
    const localeChanged = this.locale !== locale;
    if (this.locale === locale) {
      this.persist(locale);
      if (options.broadcast) {
        this.broadcast(options.exclude);
      }
      return;
    }
    this.locale = locale;
    this.persist(locale);
    if (options.broadcast) {
      this.broadcast(options.exclude);
    }
    if (localeChanged) {
      mainEventBus.m.emit("locale:changed", { locale });
    }
  }
  sendTo(target) {
    try {
      target.send("locale:update", { locale: this.locale });
    } catch (error) {
      console.warn("[LocaleManager] Failed to send locale:update to WebContents:", error);
    }
  }
  broadcast(exclude) {
    const all = electron.webContents.getAllWebContents();
    const state = { locale: this.locale };
    for (const contents of all) {
      try {
        if (exclude && contents.id === exclude.id) {
          continue;
        }
        if (!contents.isDestroyed()) {
          contents.send("locale:update", state);
        }
      } catch (error) {
        console.warn("[LocaleManager] Failed to send locale:update to WebContents:", error);
      }
    }
  }
}
const localeManager = new LocaleManager();
function initializeLocaleManager() {
  if (global.__localeIPCRegistered) return;
  global.__localeIPCRegistered = true;
  electron.ipcMain.handle("locale:getLocale", () => {
    return localeManager.getLocale();
  });
  electron.ipcMain.on("locale:setLocale", (event, locale) => {
    localeManager.setLocale(locale, { broadcast: true, exclude: event.sender });
  });
  electron.ipcMain.on("locale:request-sync", (event) => {
    localeManager.sendTo(event.sender);
  });
}
class MainI18n {
  translations = /* @__PURE__ */ new Map();
  currentLocale = "en";
  constructor() {
    this.loadTranslations();
    this.currentLocale = localeManager.getLocale();
  }
  loadTranslations() {
    for (const locale of LOCALES) {
      try {
        const isDev = process.env.NODE_ENV === "development" || !electron.app.isPackaged;
        let translationPath;
        if (isDev) {
          const appPath = electron.app.getAppPath();
          translationPath = path.join(appPath, "src/renderer/src/locales", `${locale}.json`);
        } else {
          translationPath = path.join(process.resourcesPath, "locales", `${locale}.json`);
        }
        if (!fs.existsSync(translationPath) && !isDev) {
          translationPath = path.join(__dirname, "../../../resources/locales", `${locale}.json`);
        }
        if (fs.existsSync(translationPath)) {
          const content = fs.readFileSync(translationPath, "utf-8");
          const data = JSON.parse(content);
          this.translations.set(locale, data);
        } else {
          console.warn(
            `[MainI18n] Translation file not found for locale: ${locale} at ${translationPath}`
          );
        }
      } catch (error) {
        console.error(`[MainI18n] Failed to load translations for locale: ${locale}`, error);
      }
    }
  }
  setLocale(locale) {
    this.currentLocale = locale;
  }
  getLocale() {
    return this.currentLocale;
  }
  t(key, params) {
    const keys = key.split(".");
    const translation = this.translations.get(this.currentLocale);
    if (!translation) {
      console.warn(`[MainI18n] No translations loaded for locale: ${this.currentLocale}`);
      return key;
    }
    let value = translation;
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        console.warn(
          `[MainI18n] Translation key not found: ${key} for locale: ${this.currentLocale}`
        );
        return key;
      }
    }
    if (typeof value !== "string") {
      console.warn(`[MainI18n] Translation value is not a string for key: ${key}`);
      return key;
    }
    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
        return params[paramKey]?.toString() || match;
      });
    }
    return value;
  }
}
const mainI18n = new MainI18n();
function getUpdateConfig() {
  const workerUrl = config.g();
  return {
    STARTUP_DELAY: parseFloat(process.env.AUTO_UPDATE_STARTUP_DELAY || "0") * 1e3,
    PERIODIC_INTERVAL: parseFloat(process.env.AUTO_UPDATE_CHECK_INTERVAL || "6") * 60 * 60 * 1e3,
    MIN_CHECK_INTERVAL: parseFloat(process.env.AUTO_UPDATE_MIN_INTERVAL || "60") * 60 * 1e3,
    MIN_IDLE_TIME: parseFloat(process.env.AUTO_UPDATE_MIN_IDLE || "120"),
    WORKER_URL: workerUrl,
    VERBOSE_LOG: process.env.AUTO_UPDATE_VERBOSE === "true" || !electron.app.isPackaged,
    ENABLE_IN_DEV: process.env.AUTO_UPDATE_ENABLE_IN_DEV === "true"
  };
}
function createUpdater(workerUrl) {
  if (process.platform === "darwin") {
    return new electronUpdater.MacUpdater({
      provider: "generic",
      url: workerUrl + "/app_update"
    });
  }
  return electronUpdater.autoUpdater;
}
function configureUpdater(updater, config2) {
  updater.logger = log;
  log.transports.file.level = config2.VERBOSE_LOG ? "debug" : "info";
  updater.autoDownload = true;
  updater.autoInstallOnAppQuit = false;
  updater.autoRunAppAfterInstall = true;
  updater.allowDowngrade = true;
  updater.disableDifferentialDownload = true;
  if (!electron.app.isPackaged) {
    updater.forceDevUpdateConfig = true;
  }
  log.info("[AutoUpdate] Updater configured:", {
    autoDownload: updater.autoDownload,
    autoInstallOnAppQuit: updater.autoInstallOnAppQuit,
    autoRunAppAfterInstall: updater.autoRunAppAfterInstall,
    allowDowngrade: updater.allowDowngrade,
    disableDifferentialDownload: updater.disableDifferentialDownload
  });
}
let appStore = null;
async function getAppStore() {
  if (appStore) return appStore;
  const Store = (await import("electron-store")).default;
  const store = new Store({ name: "app-settings" });
  appStore = {
    get: (key, defaultValue) => store.get(key, defaultValue),
    set: (key, value) => store.set(key, value)
  };
  return appStore;
}
async function getSelectedChannel() {
  try {
    const store = await getAppStore();
    const saved = store.get("updateChannel", null)?.toLowerCase();
    if (saved === "beta" || saved === "alpha" || saved === "stable") return saved;
  } catch {
  }
  const env = (process.env.AUTO_UPDATE_CHANNEL || "").toLowerCase();
  if (env === "beta" || env === "alpha" || env === "stable") return env;
  return "stable";
}
async function setUpdateChannel(channel2) {
  try {
    const store = await getAppStore();
    store.set("updateChannel", channel2);
    log.info("[AutoUpdate] 渠道已切换:", channel2);
    return { success: true };
  } catch (e) {
    log.error("[AutoUpdate] 渠道切换失败:", e);
    throw e;
  }
}
function getExpectedManifestName(channel2, platform = process.platform) {
  const ch = channel2 || "stable";
  const suffix = platform === "darwin" ? "-mac" : platform === "linux" ? "-linux" : "";
  return `${ch}${suffix}.yml`;
}
let currentChannel = "stable";
function getCurrentChannel() {
  return currentChannel;
}
function setCurrentChannel(channel2) {
  currentChannel = channel2;
}
async function resolveCurrentChannel() {
  try {
    const ch = await getSelectedChannel();
    setCurrentChannel(ch);
    return ch;
  } catch {
    return currentChannel;
  }
}
async function recordLastCheck() {
  const store = await getAppStore();
  store.set("lastUpdateCheck", Date.now());
}
async function getLastCheckTime() {
  const store = await getAppStore();
  return store.get("lastUpdateCheck", null);
}
async function recordUpdateAvailable(version, channel2) {
  const store = await getAppStore();
  store.set("lastUpdateAvailable", {
    version,
    time: Date.now(),
    channel: channel2
  });
}
async function getLastUpdateAvailable() {
  const store = await getAppStore();
  return store.get("lastUpdateAvailable", null);
}
const channel = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({ __proto__: null, getCurrentChannel, getExpectedManifestName, getLastCheckTime, getLastUpdateAvailable, getSelectedChannel, recordLastCheck, recordUpdateAvailable, resolveCurrentChannel, setCurrentChannel, setUpdateChannel }, Symbol.toStringTag, { value: "Module" }));
async function downloadUpdate(updater) {
  log.info("[AutoUpdate] 开始下载更新");
  await updater.downloadUpdate();
  log.info("[AutoUpdate] 下载调用成功");
}
async function verifyDownloadedUpdate() {
  try {
    const cacheRoot = getCacheRoot$1();
    const candidates = getCacheDirCandidates(cacheRoot);
    const preferredExts = getPreferredExtensions();
    log.info("[AutoUpdate] 验证下载文件，搜索目录:", candidates);
    for (const dir of candidates) {
      if (!fs.existsSync(dir)) continue;
      const names = await fs$1.readdir(dir).catch(() => []);
      let allNames = [...names];
      if (dir.includes("ShipIt")) {
        allNames = await scanShipItSubdirs(dir, names, allNames);
      }
      const files = await findValidFiles(dir, allNames, preferredExts);
      if (files.length > 0) {
        const file = files[0];
        log.info("[AutoUpdate] 验证通过：找到下载文件", { file: file.full, size: file.size });
        return { exists: true, file: file.full, size: file.size };
      }
    }
    log.warn("[AutoUpdate] 验证失败：未找到下载文件");
    return { exists: false };
  } catch (error) {
    log.error("[AutoUpdate] 验证下载文件失败:", error);
    return { exists: false };
  }
}
async function openDownloadedInstaller() {
  try {
    const cacheRoot = getCacheRoot$1();
    const candidates = getCacheDirCandidates(cacheRoot);
    const preferredExts = getPreferredExtensions();
    for (const dir of candidates) {
      if (!fs.existsSync(dir)) continue;
      const names = await fs$1.readdir(dir).catch(() => []);
      let allNames = [...names];
      if (dir.includes("ShipIt")) {
        allNames = await scanShipItSubdirs(dir, names, allNames);
      }
      const files = await findValidFiles(dir, allNames, preferredExts);
      if (files.length > 0) {
        const bestFile = files[0].full;
        electron.shell.showItemInFolder(bestFile);
        log.info("[AutoUpdate] 已在文件管理器中高亮安装包");
        return { success: true, file: bestFile, dir: path.dirname(bestFile) };
      }
    }
    for (const dir of candidates) {
      if (fs.existsSync(dir)) {
        await electron.shell.openPath(dir);
        return { success: false, dir, message: "Installer not found, opened cache directory" };
      }
    }
    return { success: false, message: "No installer or cache directory found" };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : String(error) };
  }
}
function getCacheRoot$1() {
  if (process.platform === "darwin") return path.join(os.homedir(), "Library", "Caches");
  if (process.platform === "win32") return process.env.LOCALAPPDATA || path.join(os.homedir(), "AppData", "Local");
  return process.env.XDG_CACHE_HOME || path.join(os.homedir(), ".cache");
}
function getCacheDirCandidates(cacheRoot) {
  return [
    path.join(cacheRoot, "com.flowith.os.beta.ShipIt"),
    path.join(cacheRoot, "com.flowith.os.ShipIt"),
    path.join(cacheRoot, "flowith-os-beta-updater", "pending"),
    path.join(cacheRoot, "flowith-os-beta-updater"),
    path.join(cacheRoot, `${electron.app.getName()}-updater`, "pending"),
    path.join(cacheRoot, `${electron.app.getName()}-updater`),
    path.join(cacheRoot, "flowith-browser-updater", "pending"),
    path.join(cacheRoot, "flowith-browser-updater"),
    path.join(cacheRoot, "flowithOS Beta-updater", "pending"),
    path.join(cacheRoot, "flowithOS Beta-updater")
  ];
}
function getPreferredExtensions() {
  if (process.platform === "win32") return [".exe"];
  if (process.platform === "darwin") return [".zip", ".dmg", ".pkg"];
  return [".AppImage", ".deb"];
}
async function scanShipItSubdirs(dir, names, allNames) {
  const result = [...allNames];
  for (const name of names) {
    if (name.startsWith("update.")) {
      const subDir = path.join(dir, name);
      try {
        const subNames = await fs$1.readdir(subDir);
        result.push(...subNames.map((sn) => path.join(name, sn)));
      } catch {
      }
    }
  }
  return result;
}
async function findValidFiles(dir, allNames, preferredExts) {
  const entries = (await Promise.all(
    allNames.map(async (name) => {
      try {
        const full = path.join(dir, name);
        const st = await fs$1.stat(full);
        return { full, isFile: st.isFile(), size: st.size, mtimeMs: st.mtimeMs, ext: path.extname(name) };
      } catch {
        return null;
      }
    })
  )).filter(Boolean);
  return entries.filter((e) => e.isFile && (preferredExts.includes(e.ext) || e.full.endsWith(".zip"))).sort((a, b) => b.mtimeMs - a.mtimeMs);
}
function showUpdateAvailableNotification(version) {
  try {
    const notification = new electron.Notification({
      title: mainI18n.t("update.notifications.newVersionAvailable", { version }),
      body: mainI18n.t("update.notifications.downloadingInBackground"),
      silent: true,
      urgency: "normal",
      timeoutType: "default"
    });
    notification.show();
  } catch (error) {
    log.error("[AutoUpdate] Failed to show update notification:", error);
  }
}
function showDownloadCompleteNotification(version) {
  try {
    const notification = new electron.Notification({
      title: mainI18n.t("update.notifications.updateDownloaded"),
      body: mainI18n.t("update.notifications.readyToInstall", { version }),
      silent: false,
      urgency: "normal"
    });
    notification.show();
  } catch (error) {
    log.error("[AutoUpdate] Failed to show download complete notification:", error);
  }
}
async function sendUpdateInfo(info) {
  try {
    const { updateToast } = await Promise.resolve().then(() => require("./index-vXB5mSwm.js")).then((n) => n.ae);
    await updateToast.sendUpdateInfo(info);
  } catch (error) {
    log.error("[AutoUpdate] 发送更新信息失败:", error);
  }
}
async function sendProgress(progress) {
  try {
    const { updateToast } = await Promise.resolve().then(() => require("./index-vXB5mSwm.js")).then((n) => n.ae);
    await updateToast.sendProgress(progress);
  } catch (error) {
    log.error("[AutoUpdate] 发送进度失败:", error);
  }
}
function setupEventListeners(updater, handlers) {
  updater.on("checking-for-update", () => {
    log.info("[AutoUpdate] 开始检查更新");
    Promise.resolve().then(() => index).then(({ autoUpdateService: autoUpdateService2 }) => {
      autoUpdateService2.setUpdateState("checking");
    }).catch(() => {
    });
  });
  updater.on("update-available", (info) => {
    const isManual = handlers.getIsManualCheck();
    log.info("[AutoUpdate] 发现新版本:", info.version, isManual ? "(手动检查)" : "(自动检查)");
    recordUpdateAvailable(info.version, getCurrentChannel());
    showUpdateAvailableNotification(info.version);
    Promise.resolve().then(() => index).then(({ autoUpdateService: autoUpdateService2 }) => {
      autoUpdateService2.setUpdateState("downloading");
    }).catch(() => {
    });
    if (isManual) {
      log.info("[AutoUpdate] 手动检查：发送 update-available 到 UI");
      sendUpdateInfo({
        type: "update-available",
        version: info.version,
        currentVersion: electron.app.getVersion(),
        releaseDate: info.releaseDate,
        releaseNotes: info.releaseNotes,
        channel: getCurrentChannel(),
        isManual: true
      });
    } else {
      log.info("[AutoUpdate] 自动检查：静默下载，不显示 UI");
    }
  });
  updater.on("update-not-available", async () => {
    const isManual = handlers.getIsManualCheck();
    Promise.resolve().then(() => index).then(({ autoUpdateService: autoUpdateService2 }) => {
      autoUpdateService2.setUpdateState("idle");
    }).catch(() => {
    });
    if (isManual) {
      let releaseNotes;
      try {
        const { getAppStorage } = await Promise.resolve().then(() => require("./index-Bf0u4cvK.js"));
        const storage = getAppStorage();
        const exists = storage.fs.exists("config", "update-info.json");
        if (exists) {
          const updateData = await storage.fs.readJSON("config", "update-info.json");
          if (updateData.version === electron.app.getVersion() || updateData.version === `v${electron.app.getVersion()}`) {
            releaseNotes = updateData.releaseNotes;
            log.info("[AutoUpdate] 从 update-info.json 获取到当前版本的 releaseNotes");
          }
        }
      } catch (error) {
        log.warn("[AutoUpdate] 获取 releaseNotes 失败:", error);
      }
      sendUpdateInfo({
        type: "no-update",
        currentVersion: electron.app.getVersion(),
        channel: getCurrentChannel(),
        checkedAt: (/* @__PURE__ */ new Date()).toISOString(),
        releaseNotes
      });
      handlers.setIsManualCheck(false);
    }
  });
  updater.on("download-progress", (progress) => {
    if (handlers.getIsInstalling()) {
      log.info("[AutoUpdate] 忽略下载进度：正在安装");
      return;
    }
    if (!handlers.getIsManualCheck()) {
      return;
    }
    if (progress.percent % 10 < 1 || progress.percent > 99) {
      log.info("[AutoUpdate] 下载进度:", {
        percent: progress.percent.toFixed(2) + "%",
        transferred: Math.round(progress.transferred / 1024 / 1024) + "MB",
        total: Math.round(progress.total / 1024 / 1024) + "MB",
        speed: Math.round(progress.bytesPerSecond / 1024) + "KB/s"
      });
    }
    sendProgress(progress);
  });
  updater.on("update-downloaded", async (info) => {
    log.info("[AutoUpdate] 更新下载完成:", info.version);
    Promise.resolve().then(() => index).then(({ autoUpdateService: autoUpdateService2 }) => {
      autoUpdateService2.setUpdateState("ready");
    }).catch(() => {
    });
    const verification = await verifyDownloadedUpdate();
    if (!verification.exists) {
      if (handlers.downloadRetryCount >= handlers.maxDownloadRetries) {
        log.error("[AutoUpdate] 已达到最大重试次数");
        handlers.setDownloadRetryCount(0);
        return;
      }
      log.error("[AutoUpdate] 下载文件不存在，准备重试");
      handlers.setDownloadRetryCount(handlers.downloadRetryCount + 1);
      setTimeout(async () => {
        try {
          log.info("[AutoUpdate] 自动重试下载");
          await downloadUpdate(updater);
        } catch (error) {
          log.error("[AutoUpdate] 重试下载失败:", error);
          handlers.setDownloadRetryCount(0);
        }
      }, 1e3);
      return;
    }
    handlers.setDownloadRetryCount(0);
    log.info("[AutoUpdate] 验证通过：文件存在", { file: verification.file });
    showDownloadCompleteNotification(info.version);
    sendUpdateInfo({
      type: "ready-to-install",
      version: info.version,
      currentVersion: electron.app.getVersion(),
      releaseDate: info.releaseDate,
      releaseNotes: info.releaseNotes,
      channel: getCurrentChannel()
    });
    handlers.setIsManualCheck(false);
  });
  updater.on("error", (error) => {
    log.error("[AutoUpdate] 更新错误:", { message: error.message, stack: error.stack });
    Promise.resolve().then(() => index).then(({ autoUpdateService: autoUpdateService2 }) => {
      autoUpdateService2.setUpdateState("idle");
    }).catch(() => {
    });
    const is403Error = error.message.includes("403") || error.message.toUpperCase().includes("FORBIDDEN") || error?.code === 403 || error?.statusCode === 403;
    if (is403Error) {
      const currentChannel2 = updater.channel || getCurrentChannel();
      if (currentChannel2 !== "stable") {
        log.warn("[AutoUpdate] 检测到 403 错误，自动降级到 stable 渠道", {
          currentChannel: currentChannel2,
          errorMessage: error.message
        });
        Promise.resolve().then(() => channel).then(async ({ setUpdateChannel: setUpdateChannel2 }) => {
          await setUpdateChannel2("stable");
          log.info("[AutoUpdate] 已自动降级到 stable 渠道");
          sendUpdateInfo({
            type: "channel-downgraded",
            previousChannel: currentChannel2,
            newChannel: "stable",
            reason: "403-forbidden"
          });
        }).catch((err) => {
          log.error("[AutoUpdate] 自动降级失败:", err);
        });
        return;
      }
    }
    if (error.message.includes("ditto:") && handlers.downloadRetryCount < handlers.maxDownloadRetries) {
      handlers.setDownloadRetryCount(handlers.downloadRetryCount + 1);
      log.info(
        `[AutoUpdate] 重试下载 (${handlers.downloadRetryCount}/${handlers.maxDownloadRetries})`
      );
      setTimeout(async () => {
        try {
          await downloadUpdate(updater);
        } catch (err) {
          log.error("[AutoUpdate] 重试失败:", err);
          handlers.setDownloadRetryCount(0);
        }
      }, 2e3);
      return;
    }
    if (handlers.downloadRetryCount >= handlers.maxDownloadRetries) {
      handlers.setDownloadRetryCount(0);
    }
    const channel$1 = updater.channel || "stable";
    const expectedManifest = getExpectedManifestName(channel$1);
    sendUpdateInfo({
      type: "error",
      errorMessage: error.message,
      errorCode: error?.code,
      channel: channel$1,
      expectedManifest
    });
  });
}
async function quitAndInstall(updater, updateInfo) {
  log.info("[AutoUpdate] ========== quitAndInstall 函数被调用 ==========");
  log.info("[AutoUpdate] 准备安装更新并重启");
  log.info("[AutoUpdate] 当前版本:", electron.app.getVersion());
  log.info("[AutoUpdate] 目标版本:", updateInfo?.version || "unknown");
  log.info("[AutoUpdate] 当前 App 路径:", electron.app.getPath("exe"));
  log.info("[AutoUpdate] 当前 App 名称:", electron.app.getName());
  log.info("[AutoUpdate] 是否打包:", electron.app.isPackaged);
  log.info("[AutoUpdate] 准备验证下载的更新文件...");
  const verification = await verifyDownloadedUpdate();
  if (!verification.exists) {
    log.error("[AutoUpdate] 安装前验证：文件不存在");
    throw new Error("Update file not found");
  }
  log.info("[AutoUpdate] 安装前验证通过");
  log.info("[AutoUpdate] 更新包路径:", verification.file);
  log.info("[AutoUpdate] 更新包大小:", verification.size, "bytes");
  if (updateInfo) {
    try {
      const { getAppStorage } = await Promise.resolve().then(() => require("./index-Bf0u4cvK.js"));
      const storage = getAppStorage();
      const updateData = {
        version: updateInfo.version,
        releaseDate: (/* @__PURE__ */ new Date()).toISOString(),
        releaseNotes: updateInfo.releaseNotes,
        installedAt: Date.now(),
        notified: false
        // 重置为 false，确保重启后显示
      };
      await storage.fs.writeJSON("config", "update-info.json", updateData, { overwrite: true });
      log.info("[AutoUpdate] 更新信息已保存:", JSON.stringify(updateData, null, 2));
    } catch (error) {
      log.error("[AutoUpdate] 保存更新信息失败:", error);
    }
  } else {
    log.warn("[AutoUpdate] updateInfo 为空，跳过保存更新信息");
  }
  const { quitHandler } = await Promise.resolve().then(() => require("./quitHandler-DVZxe9rU.js")).then((n) => n.b);
  quitHandler.allowImmediateQuit("dock");
  log.info("[AutoUpdate] 已通知 quitHandler 允许立即退出");
  await new Promise((resolve) => setTimeout(resolve, 100));
  log.info("[AutoUpdate] ========== 准备调用 quitAndInstall ==========");
  log.info("[AutoUpdate] 参数: isSilent=false, isForceRunAfter=true");
  log.info("[AutoUpdate] updater.autoRunAppAfterInstall:", updater.autoRunAppAfterInstall);
  log.info("[AutoUpdate] updater.autoInstallOnAppQuit:", updater.autoInstallOnAppQuit);
  log.info("[AutoUpdate] 平台:", process.platform);
  log.info("[AutoUpdate] 是否打包:", electron.app.isPackaged);
  try {
    log.info("[AutoUpdate] 🚀 执行 updater.quitAndInstall(false, true)");
    updater.quitAndInstall(false, true);
    log.info("[AutoUpdate] ✅ quitAndInstall 调用成功（应用即将退出）");
  } catch (e) {
    log.error("[AutoUpdate] ❌ quitAndInstall 调用失败（不进行兜底，交由上层处理）");
    log.error("[AutoUpdate] 错误类型:", e instanceof Error ? e.name : typeof e);
    log.error(
      "[AutoUpdate] 错误详情:",
      e instanceof Error ? e.message : JSON.stringify(e, Object.getOwnPropertyNames(e))
    );
    throw e;
  }
}
async function cleanupUpdaterCaches(isDownloading, options) {
  const ttlDays = Math.max(0, options?.ttlDays ?? parseInt(process.env.AUTO_UPDATE_CACHE_TTL_DAYS || "7", 10));
  const keepLatest = Math.max(0, options?.keepLatest ?? parseInt(process.env.AUTO_UPDATE_CACHE_MAX_FILES || "1", 10));
  log.info("[AutoUpdate] 缓存清理开始", { ttlDays, keepLatest });
  if (isDownloading) {
    log.info("[AutoUpdate] 跳过清理：正在下载更新");
    return { removed: 0, freedBytes: 0, message: "正在下载更新，跳过清理" };
  }
  try {
    const cacheRoot = getCacheRoot();
    const candidates = getCandidateDirs(cacheRoot);
    const { removed, freedBytes } = await cleanDirs(candidates, ttlDays, keepLatest);
    log.info("[AutoUpdate] 缓存清理完成", { removed, freedMB: Math.round(freedBytes / 1024 / 1024 * 10) / 10 });
    return { removed, freedBytes };
  } catch (err) {
    log.warn("[AutoUpdate] 缓存清理失败:", err);
    return { removed: 0, freedBytes: 0, message: err instanceof Error ? err.message : String(err) };
  }
}
function getCacheRoot() {
  if (process.platform === "darwin") return path.join(os.homedir(), "Library", "Caches");
  if (process.platform === "win32") return process.env.LOCALAPPDATA || path.join(os.homedir(), "AppData", "Local");
  return process.env.XDG_CACHE_HOME || path.join(os.homedir(), ".cache");
}
function getCandidateDirs(cacheRoot) {
  return [
    path.join(cacheRoot, `${electron.app.getName()}-updater`),
    path.join(cacheRoot, "flowith-browser-updater"),
    path.join(cacheRoot, "flowithOS Beta-updater"),
    path.join(cacheRoot, "flowith-os-beta-updater"),
    path.join(cacheRoot, "com.flowith.os.beta.ShipIt"),
    path.join(cacheRoot, "com.flowith.os.ShipIt")
  ];
}
async function cleanDirs(candidates, ttlDays, keepLatest) {
  const now = Date.now();
  const ttlMs = ttlDays * 24 * 60 * 60 * 1e3;
  let removed = 0;
  let freedBytes = 0;
  for (const dir of candidates) {
    if (!fs.existsSync(dir)) continue;
    const names = await fs$1.readdir(dir).catch(() => []);
    const entries = await scanDirEntries(dir, names);
    const keepExts = /* @__PURE__ */ new Set([".zip", ".dmg", ".exe", ".yml", ".json"]);
    const files = entries.filter((e) => e.isFile && keepExts.has(e.ext)).sort((a, b) => b.mtimeMs - a.mtimeMs);
    for (const e of files) {
      if (ttlMs > 0 && now - e.mtimeMs > ttlMs) {
        await fs$1.rm(e.full, { force: true }).catch(() => {
        });
        removed++;
        freedBytes += e.size || 0;
      }
    }
    const alive = files.filter((e) => !(ttlMs > 0 && now - e.mtimeMs > ttlMs));
    const extra = keepLatest > 0 ? alive.slice(keepLatest) : alive;
    for (const e of extra) {
      await fs$1.rm(e.full, { force: true }).catch(() => {
      });
      removed++;
      freedBytes += e.size || 0;
    }
    const left = await fs$1.readdir(dir).catch(() => []);
    if (left.length === 0) {
      await fs$1.rm(dir, { recursive: true, force: true }).catch(() => {
      });
    }
  }
  return { removed, freedBytes };
}
async function scanDirEntries(dir, names) {
  const entries = (await Promise.all(
    names.map(async (name) => {
      if (name === "pending") return null;
      try {
        const full = path.join(dir, name);
        const st = await fs$1.stat(full);
        return { full, isFile: st.isFile(), mtimeMs: st.mtimeMs, size: st.size, ext: path.extname(name) };
      } catch {
        return null;
      }
    })
  )).filter(Boolean);
  return entries;
}
class AutoUpdateService {
  updater;
  config;
  checkInterval = null;
  hasCheckedOnStartup = false;
  isInitialized = false;
  isManualCheck = false;
  downloadRetryCount = 0;
  isInstalling = false;
  currentUpdateState = "idle";
  maxDownloadRetries = 3;
  cleanupRetryTimer = null;
  constructor() {
    this.config = getUpdateConfig();
    this.updater = createUpdater(this.config.WORKER_URL);
  }
  async initialize() {
    if (this.isInitialized) return;
    log.info("[AutoUpdate] 初始化自动更新服务", {
      ENABLE_IN_DEV: this.config.ENABLE_IN_DEV,
      isPackaged: electron.app.isPackaged
    });
    const initialChannel = await getSelectedChannel();
    setCurrentChannel(initialChannel);
    log.info("[AutoUpdate] 初始通道:", initialChannel);
    configureUpdater(this.updater, this.config);
    setupEventListeners(this.updater, {
      getIsManualCheck: () => this.isManualCheck,
      setIsManualCheck: (value) => {
        this.isManualCheck = value;
      },
      downloadRetryCount: this.downloadRetryCount,
      setDownloadRetryCount: (value) => {
        this.downloadRetryCount = value;
      },
      maxDownloadRetries: this.maxDownloadRetries,
      getIsInstalling: () => this.isInstalling
    });
    if (!electron.app.isPackaged && !this.config.ENABLE_IN_DEV) {
      log.info("[AutoUpdate] 开发环境：仅启用手动检查，跳过自动检查和周期检查");
      this.isInitialized = true;
      return;
    }
    const startupDelay = electron.app.isPackaged ? this.config.STARTUP_DELAY : 0;
    setTimeout(() => {
      this.checkOnStartup().catch((err) => {
        console.error("[AutoUpdate] 启动检查失败:", err);
      });
    }, startupDelay);
    this.startPeriodicCheck();
    log.info("[AutoUpdate] 自动更新服务初始化完成（包含自动检查）");
    this.isInitialized = true;
  }
  async checkManually() {
    if (this.isInstalling) {
      log.info("[AutoUpdate] 跳过手动检查：正在安装中");
      return false;
    }
    try {
      this.isManualCheck = true;
      await sendUpdateInfo({ type: "checking" });
      await cleanupUpdaterCaches(false);
      await this.configureUpdateFeed();
      const result = await this.updater.checkForUpdates();
      await recordLastCheck();
      return !!result?.isUpdateAvailable;
    } catch (error) {
      log.error("[AutoUpdate] 手动检查失败:", error);
      this.isManualCheck = false;
      const channel2 = this.updater.channel || getCurrentChannel();
      await sendUpdateInfo({
        type: "error",
        errorMessage: error instanceof Error ? error.message : String(error),
        errorCode: error?.code,
        channel: channel2,
        expectedManifest: getExpectedManifestName(channel2)
      });
      return false;
    }
  }
  async quitAndInstall(updateInfo) {
    log.info("[AutoUpdateService] quitAndInstall 方法被调用");
    log.info("[AutoUpdateService] updateInfo:", JSON.stringify(updateInfo));
    this.isInstalling = true;
    this.stopPeriodicCheck();
    log.info("[AutoUpdateService] 已设置 isInstalling=true 并暂停周期检查");
    try {
      await quitAndInstall(this.updater, updateInfo);
      log.warn("[AutoUpdateService] performQuitAndInstall 返回（异常路径）：应用未退出");
    } catch (error) {
      log.error("[AutoUpdateService] quitAndInstall 失败（保持应用运行以便诊断）:", error);
      this.isInstalling = false;
      this.startPeriodicCheck();
      throw error;
    }
  }
  async clearUpdateCache() {
    return await cleanupUpdaterCaches(false);
  }
  async setUpdateChannel(channel2) {
    const result = await setUpdateChannel(channel2);
    setCurrentChannel(channel2);
    return result;
  }
  getCurrentVersion() {
    return electron.app.getVersion();
  }
  getCurrentChannel() {
    return getCurrentChannel();
  }
  async resolveCurrentChannel() {
    return await resolveCurrentChannel();
  }
  async getLastCheckTime() {
    return await getLastCheckTime();
  }
  async getLastUpdateAvailable() {
    return await getLastUpdateAvailable();
  }
  async openDownloadedInstaller() {
    return await openDownloadedInstaller();
  }
  destroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    if (this.cleanupRetryTimer) {
      clearTimeout(this.cleanupRetryTimer);
      this.cleanupRetryTimer = null;
    }
  }
  async checkOnStartup() {
    if (this.isInstalling) {
      log.info("[AutoUpdate] 跳过启动检查：正在安装中");
      return;
    }
    if (this.hasCheckedOnStartup) {
      return;
    }
    try {
      await cleanupUpdaterCaches(false);
      await this.configureUpdateFeed();
      await this.updater.checkForUpdates();
      await recordLastCheck();
      this.hasCheckedOnStartup = true;
      log.info("[AutoUpdate] 启动检查完成");
    } catch (error) {
      console.error("[AutoUpdate] 启动检查失败:", error);
      log.error("[AutoUpdate] 启动检查失败:", error);
    }
  }
  startPeriodicCheck() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.checkInterval = setInterval(async () => {
      if (this.isInstalling) {
        log.info("[AutoUpdate] 跳过周期检查 tick：正在安装中");
        return;
      }
      try {
        await cleanupUpdaterCaches(false);
        await this.configureUpdateFeed();
        await this.updater.checkForUpdates();
        await recordLastCheck();
      } catch (error) {
        log.error("[AutoUpdate] 定时检查失败:", error);
      }
    }, this.config.PERIODIC_INTERVAL);
  }
  async configureUpdateFeed() {
    if (this.isInstalling) {
      log.info("[AutoUpdate] 跳过配置更新源：正在安装中");
      return;
    }
    const session = await config.s.getSession();
    let uiChannel = await getSelectedChannel();
    if (!session) {
      if (uiChannel !== "stable") {
        console.log(`[AutoUpdate] 用户未登录，将渠道从 ${uiChannel} 强制降级到 stable`);
        uiChannel = "stable";
        await setUpdateChannel("stable");
      }
    }
    if (session) {
      try {
        const { getUserAccess } = await Promise.resolve().then(() => require("./appUpdateApi-BCFEadMj.js"));
        const access = await getUserAccess();
        const allowedChannels = Array.isArray(access?.channels) ? access.channels : ["stable"];
        if (!allowedChannels.includes(uiChannel)) {
          const previousChannel = uiChannel;
          uiChannel = "stable";
          await setUpdateChannel("stable");
          try {
            await sendUpdateInfo({
              type: "channel-downgraded",
              previousChannel,
              newChannel: uiChannel,
              reason: "no-access"
            });
          } catch {
          }
        }
      } catch {
      }
    }
    setCurrentChannel(uiChannel);
    this.updater.channel = uiChannel;
    if (!this.config.WORKER_URL) {
      throw new Error("WORKER_URL 未配置");
    }
    const arch = process.platform === "darwin" ? "universal" : process.arch;
    const requestHeaders = session ? {
      Authorization: `Bearer ${session.access_token}`,
      "X-App-Version": electron.app.getVersion(),
      "X-Platform": process.platform,
      "X-Arch": arch,
      "X-Update-Channel": uiChannel
    } : {
      "X-App-Version": electron.app.getVersion(),
      "X-Platform": process.platform,
      "X-Arch": arch,
      "X-Update-Channel": uiChannel
    };
    this.updater.requestHeaders = requestHeaders;
    log.info("[AutoUpdate] Feed configured", {
      baseUrl: this.config.WORKER_URL + "/app_update",
      channel: this.updater.channel,
      expectedManifest: getExpectedManifestName(this.updater.channel || "stable"),
      hasSession: !!session
    });
  }
  static instance = null;
  stopPeriodicCheck() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      log.info("[AutoUpdate] 已停止周期检查");
    }
  }
  setIsManualCheck(value) {
    log.info("[AutoUpdate] setIsManualCheck 被调用:", value);
    this.isManualCheck = value;
  }
  getUpdateState() {
    return this.currentUpdateState;
  }
  setUpdateState(state) {
    this.currentUpdateState = state;
    log.info("[AutoUpdate] Update state changed to:", state);
    this.broadcastUpdateState(state);
  }
  async broadcastUpdateState(state) {
    try {
      const { tabManager } = await Promise.resolve().then(() => require("./index-vXB5mSwm.js")).then((n) => n.a7);
      tabManager.tabs.forEach((tab) => {
        try {
          const view = tab.getView();
          view.webContents.send("update-state-changed", { state });
        } catch {
        }
      });
    } catch (e) {
      log.warn("[AutoUpdate] Failed to broadcast update state:", e);
    }
  }
  static getInstance() {
    if (!AutoUpdateService.instance) {
      AutoUpdateService.instance = new AutoUpdateService();
    }
    return AutoUpdateService.instance;
  }
}
const instance = AutoUpdateService.getInstance();
const autoUpdateService = {
  initialize: () => instance.initialize(),
  checkManually: () => instance.checkManually(),
  downloadUpdate: () => downloadUpdate(instance["updater"]),
  quitAndInstall: (updateInfo) => instance.quitAndInstall(updateInfo),
  openDownloadedInstaller: () => instance.openDownloadedInstaller(),
  clearUpdateCache: () => instance.clearUpdateCache(),
  setUpdateChannel: (ch) => instance.setUpdateChannel(ch),
  getCurrentVersion: () => instance.getCurrentVersion(),
  getCurrentChannel: () => instance.getCurrentChannel(),
  resolveCurrentChannel: () => instance.resolveCurrentChannel(),
  getLastCheckTime: () => instance.getLastCheckTime(),
  getLastUpdateAvailable: () => instance.getLastUpdateAvailable(),
  // 暴露只读 isManualCheck，便于调试或其他模块判断
  getIsManualCheck: () => instance["isManualCheck"],
  // 暴露设置 isManualCheck 的方法，用于最小化下载进度时切换到静默模式
  setIsManualCheck: (value) => instance.setIsManualCheck(value),
  getIsInstalling: () => instance["isInstalling"],
  getUpdateState: () => instance.getUpdateState(),
  setUpdateState: (state) => instance.setUpdateState(state),
  destroy: () => instance.destroy()
};
const index = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({ __proto__: null, autoUpdateService, cleanupUpdaterCaches }, Symbol.toStringTag, { value: "Module" }));
exports.a = autoUpdateService;
exports.b = index;
exports.i = initializeLocaleManager;
exports.l = localeManager;
exports.m = mainI18n;
