"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const electron = require("electron"), utils = require("@electron-toolkit/utils"), dotenv = require("dotenv"), path = require("path"), index = require("../index.js"), os = require("os"), certificateManager = require("./certificateManager-BNNWUnqZ.js");
require("fs"), require("crypto");
function loadEnv() {
  process.env.DOTENV_CONFIG_QUIET = "true";
  const appRoot = path.join(index.g(), "../../");
  if (electron.app.isPackaged) {
    dotenv.config({ path: path.join(appRoot, ".env.production") });
  } else {
    dotenv.config({ path: path.join(appRoot, ".env.development.local") });
    dotenv.config({ path: path.join(appRoot, ".env.development") });
  }
  dotenv.config({ path: path.join(appRoot, ".env") });
}
class NetworkOptimizer {
  /**
   * 应用网络优化配置
   */
  static applyAppCommandLines() {
    this.configureTLS();
    this.configureProtocols();
    this.configureRetryPolicy();
    this.configureDNS();
    this.configureCaching();
  }
  static applyWhenReady() {
    electron.app.whenReady().then(() => {
      this.configureSessionNetwork();
    }).catch((error) => {
      console.warn("[NetworkOptimizer] configureSessionNetwork failed:", error);
    });
  }
  /**
   * 配置 TLS/SSL 设置
   */
  static configureTLS() {
    electron.app.commandLine.appendSwitch("ssl-version-min", "tls1.2");
  }
  /**
   * 配置网络协议支持
   */
  static configureProtocols() {
    if (process.env.ENABLE_HTTP3 === "true") {
      electron.app.commandLine.appendSwitch("enable-quic", "");
      electron.app.commandLine.appendSwitch("quic-version", "h3-29");
    }
    if (process.env.ENABLE_EXPERIMENTAL_WEB_PLATFORM === "true") {
      electron.app.commandLine.appendSwitch("enable-experimental-web-platform-features", "");
    }
  }
  /**
   * 配置网络重试策略
   */
  static configureRetryPolicy() {
    if (process.env.NETWORK_CONNECT_TIMEOUT) {
      electron.app.commandLine.appendSwitch("network-connect-timeout", process.env.NETWORK_CONNECT_TIMEOUT);
    }
    if (process.env.MAX_CONNECTIONS_PER_HOST) {
      electron.app.commandLine.appendSwitch("max-connections-per-host", process.env.MAX_CONNECTIONS_PER_HOST);
    }
    if (process.env.ENABLE_TCP_FASTOPEN === "true") {
      electron.app.commandLine.appendSwitch("enable-tcp-fastopen", "");
    }
  }
  /**
   * 配置 DNS 设置
   */
  static configureDNS() {
    if (process.env.ENABLE_DOH === "true") {
      const dohServer = process.env.DOH_SERVER || "https://1.1.1.1/dns-query";
      electron.app.commandLine.appendSwitch("dns-over-https-server", dohServer);
      electron.app.commandLine.appendSwitch("enable-async-dns", "");
    }
  }
  /**
   * 配置缓存策略
   */
  static configureCaching() {
    if (process.env.DISK_CACHE_SIZE) {
      electron.app.commandLine.appendSwitch("disk-cache-size", process.env.DISK_CACHE_SIZE);
    }
    if (process.env.MEDIA_CACHE_SIZE) {
      electron.app.commandLine.appendSwitch("media-cache-size", process.env.MEDIA_CACHE_SIZE);
    }
  }
  // 下载处理器注册标志
  static downloadHandlerRegistered = false;
  /**
   * 配置会话级别的网络设置
   */
  static configureSessionNetwork() {
    const defaultSession = electron.session.defaultSession;
    try {
      const maybe = defaultSession.preconnect;
      if (typeof maybe === "function") {
        const preconnectUrls = ["https://fonts.googleapis.com", "https://fonts.gstatic.com"];
        for (const urlString of preconnectUrls) {
          try {
            const url = new URL(urlString);
            if (url.href) {
              maybe.call(defaultSession, { url, numSockets: 2 });
            }
          } catch {
          }
        }
      }
    } catch {
    }
    if (!electron.app.isPackaged && process.env.ENABLE_NET_EMULATION === "true") {
      defaultSession.enableNetworkEmulation({
        offline: false,
        latency: 0,
        downloadThroughput: -1,
        uploadThroughput: -1
      });
    }
    defaultSession.setPermissionRequestHandler((_wc, permission, callback) => {
      const allowedPermissions = [
        "notifications",
        "media",
        "mediaKeySystem",
        "clipboard-read",
        "clipboard-write",
        "fullscreen"
      ];
      if (allowedPermissions.includes(permission)) {
        console.log("[NetworkOptimizer] Permission GRANTED:", permission);
        callback(true);
      } else {
        console.log("[NetworkOptimizer] Permission DENIED:", permission);
        callback(false);
      }
    });
    if (!this.downloadHandlerRegistered) {
      this.downloadHandlerRegistered = true;
      defaultSession.on("will-download", (_event, item, webContents) => {
        Promise.resolve().then(() => require("./downloadManager-D2zb6fqP.js")).then(({ downloadManager }) => {
          downloadManager.handleDownload(item, webContents).catch((err) => {
            console.error("[NetworkOptimizer] 处理下载失败:", err);
          });
        }).catch((err) => {
          console.error("[NetworkOptimizer] 导入 downloadManager 失败:", err);
        });
      });
    }
  }
  /**
   * 应用故障恢复策略
   */
  static applyFallbackStrategies() {
    if (process.env.INTERCEPT_LOGIN === "true") {
      electron.app.on("login", (event, _webContents, _details, _authInfo, callback) => {
        event.preventDefault();
        callback();
      });
    }
  }
}
function setupAppMemoryFlags() {
  electron.app.commandLine.appendSwitch("enable-features", "MemoryPressureHandler");
  electron.app.commandLine.appendSwitch("renderer-process-limit", "8");
  electron.app.commandLine.appendSwitch("aggressive-cache-discard", "");
  electron.app.commandLine.appendSwitch("aggressive-tab-discard", "");
  electron.app.commandLine.appendSwitch("tile-memory-limit", "512");
  electron.app.commandLine.appendSwitch("skia-resource-cache-limit", "256");
}
function setupAppCommandLine() {
  setupAppMemoryFlags();
  electron.app.commandLine.appendSwitch("max-tiles-for-interest-area", "512");
  electron.app.commandLine.appendSwitch("max-unused-resource-memory-usage-percentage", "50");
  electron.app.commandLine.appendSwitch("gpu-rasterization-msaa-sample-count", "0");
  electron.app.commandLine.appendSwitch("enable-gpu-rasterization");
  const systemMemoryGb = os.totalmem() / (1024 * 1024 * 1024);
  const maxOldSpaceSizeMb = systemMemoryGb > 8 ? 4096 : Math.max(1024, Math.floor(systemMemoryGb * 0.4 * 1024));
  electron.app.commandLine.appendSwitch("js-flags", `--max-old-space-size=${maxOldSpaceSizeMb}`);
  electron.app.commandLine.appendSwitch("enable-accelerated-2d-canvas");
  electron.app.commandLine.appendSwitch("enable-accelerated-video-decode");
  if (!electron.app.isPackaged || process.env.FORCE_GPU === "true") {
    electron.app.commandLine.appendSwitch("ignore-gpu-blocklist");
  }
  electron.app.commandLine.appendSwitch("disable-features", "CalculateNativeWinOcclusion");
  const chromeRemoteDebugPort = process.env.CHROME_DEBUG_PORT;
  if (!electron.app.isPackaged && chromeRemoteDebugPort) {
    electron.app.commandLine.appendSwitch("remote-debugging-address", "127.0.0.1");
    electron.app.commandLine.appendSwitch("remote-debugging-port", chromeRemoteDebugPort);
    console.log(`[Main] 🧩 remote-debugging-port = ${chromeRemoteDebugPort} (dev only, localhost)`);
  }
  electron.app.commandLine.appendSwitch("proxy-bypass-list", "localhost,127.0.0.1,*.local,<local>");
  NetworkOptimizer.applyAppCommandLines();
  electron.app.commandLine.appendSwitch("v", "0");
  electron.app.commandLine.appendSwitch("log-level", "3");
  electron.app.commandLine.appendSwitch(
    "vmodule",
    "network_delegate=0,script_context=0,modulator_impl_base=0,file_util_posix=0,extensions/renderer/*=0"
  );
}
function setUserAgent() {
  const chromeVersion = process.versions.chrome;
  if (process.platform === "win32") {
    electron.app.userAgentFallback = `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} Safari/537.36`;
  } else {
    electron.app.userAgentFallback = `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} Safari/537.36`;
  }
}
function registerFlowithProtocolPrivileges() {
  electron.protocol.registerSchemesAsPrivileged([
    {
      scheme: "flowith",
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true,
        corsEnabled: true,
        bypassCSP: true,
        // 允许绕过 CSP 加载资源
        stream: true
      }
    }
  ]);
}
function bootstrap() {
  loadEnv();
  process.env.NO_PROXY = [process.env.NO_PROXY, "localhost", "127.0.0.1"].filter(Boolean).join(",");
  setupAppCommandLine();
  NetworkOptimizer.applyWhenReady();
  NetworkOptimizer.applyFallbackStrategies();
  registerFlowithProtocolPrivileges();
  setUserAgent();
  if (electron.app.isPackaged) {
    certificateManager.c.addTrustedDomain("ycombinator.com");
  }
  console.log("[Main] 📦 App Version:", electron.app.getVersion());
  console.log(`[Main] 🗂️ Using userData path: ${electron.app.getPath("userData")}`);
  certificateManager.i();
  electron.app.on("window-all-closed", async () => {
    if (process.platform === "darwin") {
      if (utils.is.dev) {
        console.log("[Main] 🛑 开发模式：所有窗口关闭，退出应用");
        electron.app.quit();
        return;
      }
    }
    if (process.platform !== "darwin") {
      electron.app.quit();
    }
  });
  electron.app.on("before-quit", async () => {
    const { quitHandler } = await Promise.resolve().then(() => require("./quitHandler-DVZxe9rU.js")).then((n) => n.b);
    const { autoUpdateService } = await Promise.resolve().then(() => require("./index-CP7J970o.js")).then((n) => n.b);
    try {
      if (autoUpdateService?.getIsInstalling && autoUpdateService.getIsInstalling()) {
        console.log("[Main] ⚡ Fast quit for update install - skipping heavy cleanup");
        if (!quitHandler.isImmediateQuitAllowed()) {
          quitHandler.allowImmediateQuit("dock");
        }
        return;
      }
    } catch {
    }
    try {
      const { posthogService } = await Promise.resolve().then(() => require("./posthogService-khJWbAtc.js"));
      posthogService.track("app_quit", {
        version: electron.app.getVersion()
      });
      await posthogService.shutdown();
    } catch (error) {
      console.error("[Main] Analytics shutdown error:", error);
    }
    try {
      const { supabaseManager } = await Promise.resolve().then(() => require("./supabaseManager-BAbRVJxx.js")).then((n) => n.f);
      await supabaseManager.reportFinalDailyActive();
      await supabaseManager.cleanupPresence();
    } catch (error) {
      console.error("[Main] Failed to cleanup supabase:", error);
    }
    if (!quitHandler.isImmediateQuitAllowed()) {
      quitHandler.allowImmediateQuit("dock");
    }
    electron.globalShortcut.unregisterAll();
    try {
      autoUpdateService.destroy();
    } catch (error) {
      console.error("[Main] 清理自动更新服务失败:", error);
    }
    try {
      const { closeDatabaseConnection } = await Promise.resolve().then(() => require("./index-CR4vSMhM.js"));
      await closeDatabaseConnection();
      console.log("[Main] ✅ Database closed");
    } catch (error) {
      console.error("[Main] 关闭数据库失败:", error);
    }
  });
  process.on("SIGTERM", () => {
    console.log("Received SIGTERM, force exiting...");
    process.exit(0);
  });
  process.on("SIGINT", () => {
    console.log("🛑 SIGINT received - IMMEDIATE EXIT");
    process.exit(0);
  });
  return;
}
exports.bootstrap = bootstrap;
