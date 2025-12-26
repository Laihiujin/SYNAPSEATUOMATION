"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const electron = require("electron");
function setAsDefaultBrowser() {
  try {
    console.log("[SystemSettings] 设置为默认浏览器...");
    const isDefaultHttp = electron.app.isDefaultProtocolClient("http");
    const isDefaultHttps = electron.app.isDefaultProtocolClient("https");
    if (isDefaultHttp && isDefaultHttps) {
      console.log("[SystemSettings] 已经是默认浏览器");
      return true;
    }
    const httpResult = electron.app.setAsDefaultProtocolClient("http");
    const httpsResult = electron.app.setAsDefaultProtocolClient("https");
    if (httpResult && httpsResult) {
      console.log("[SystemSettings] ✅ 成功设置为默认浏览器");
      return true;
    } else {
      console.warn("[SystemSettings] ⚠️ 设置默认浏览器可能失败", { httpResult, httpsResult });
      return false;
    }
  } catch (error) {
    console.error("[SystemSettings] ❌ 设置默认浏览器失败:", error);
    return false;
  }
}
function addToDock() {
  try {
    console.log("[SystemSettings] 添加到 Dock/任务栏...");
    if (process.platform === "darwin") {
      if (electron.app.dock) {
        electron.app.dock.show();
        console.log("[SystemSettings] ✅ 已显示 Dock 图标");
        return true;
      }
    } else if (process.platform === "win32") {
      console.log("[SystemSettings] ℹ️ Windows 平台：用户需要手动固定到任务栏");
      return true;
    } else {
      console.log("[SystemSettings] ℹ️ 当前平台不支持自动添加到 Dock/任务栏");
      return true;
    }
  } catch (error) {
    console.error("[SystemSettings] ❌ 添加到 Dock/任务栏失败:", error);
    return false;
  }
  return false;
}
function setLaunchAtStartup(enabled) {
  try {
    console.log(`[SystemSettings] ${enabled ? "启用" : "禁用"}开机自启动...`);
    electron.app.setLoginItemSettings({
      openAtLogin: enabled,
      openAsHidden: false,
      // macOS: 不以隐藏模式启动
      // Windows 特有选项
      ...process.platform === "win32" && {
        path: process.execPath,
        args: []
      }
    });
    const loginSettings = electron.app.getLoginItemSettings();
    const success = loginSettings.openAtLogin === enabled;
    if (success) {
      console.log(`[SystemSettings] ✅ 成功${enabled ? "启用" : "禁用"}开机自启动`);
    } else {
      console.warn(`[SystemSettings] ⚠️ 开机自启动设置可能失败`);
    }
    return success;
  } catch (error) {
    console.error("[SystemSettings] ❌ 设置开机自启动失败:", error);
    return false;
  }
}
function applyOnboardingSettings(settings) {
  console.log("[SystemSettings] 应用 onboarding 设置:", settings);
  const results = {};
  try {
    if (settings.defaultBrowser) {
      results.defaultBrowser = setAsDefaultBrowser();
    }
    if (settings.addToDock) {
      results.addToDock = addToDock();
    }
    if (settings.launchAtStartup) {
      results.launchAtStartup = setLaunchAtStartup(true);
    }
    console.log(`[SystemSettings] 用户选择${settings.helpImprove ? "启用" : "禁用"}分析数据收集`);
    const allSuccess = Object.values(results).every((result) => result !== false);
    console.log("[SystemSettings] 设置应用结果:", {
      success: allSuccess,
      results
    });
    return {
      success: allSuccess,
      results
    };
  } catch (error) {
    console.error("[SystemSettings] ❌ 应用设置失败:", error);
    return {
      success: false,
      results
    };
  }
}
exports.addToDock = addToDock;
exports.applyOnboardingSettings = applyOnboardingSettings;
exports.setAsDefaultBrowser = setAsDefaultBrowser;
exports.setLaunchAtStartup = setLaunchAtStartup;
