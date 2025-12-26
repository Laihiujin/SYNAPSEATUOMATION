"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const electron = require("electron"), path = require("path"), index$1 = require("./index-vXB5mSwm.js"), mainEventBus = require("./mainEventBus-D2ZkkKhI.js"), index$2 = require("./index-CP7J970o.js"), index = require("../index.js");
require("@electron-toolkit/utils"), require("./index-Bf0u4cvK.js"), require("fs/promises"), require("fs"), require("./supabaseManager-BAbRVJxx.js"), require("@supabase/supabase-js"), require("./AbstractModalViewManager-aig2dJrA.js"), require("p-queue"), require("url"), require("./quitHandler-DVZxe9rU.js"), require("./index-CR4vSMhM.js"), require("drizzle-orm/libsql/migrator"), require("drizzle-orm/libsql"), require("@libsql/client"), require("drizzle-orm/sqlite-core"), require("drizzle-orm"), require("./index-B34KkOYs.js"), require("crypto"), require("./userAgentUtils-DJa5NphP.js"), require("@cliqz/adblocker-electron"), require("cross-fetch"), require("events"), require("xlsx"), require("file-type"), require("mime-types"), require("mitt"), require("zod"), require("https"), require("http"), require("string_decoder"), require("os"), require("electron-log"), require("./index-GfVwZ7mz.js"), require("electron-updater");
let tray = null;
const iconCache = /* @__PURE__ */ new Map();
let taskSnapshotListener = null;
function initializeTray() {
  try {
    const iconPath = electron.app.isPackaged ? path.join(process.resourcesPath, "assets", "TrayIcon.png") : path.join(index.g(), "../../assets", "TrayIcon.png");
    const icon = electron.nativeImage.createFromPath(iconPath);
    const resizedIcon = icon.resize({ width: 20, height: 20 });
    resizedIcon.setTemplateImage(true);
    tray = new electron.Tray(resizedIcon);
    tray.setToolTip("flowithOS Beta");
    void updateTrayMenu();
    tray.on("click", async () => {
      await updateTrayMenu();
    });
    tray.on("right-click", async () => {
      await updateTrayMenu();
    });
    taskSnapshotListener = () => {
      void updateTrayMenu();
    };
    mainEventBus.m.on("taskSnapshot:update", taskSnapshotListener);
    console.log("[TrayManager] ✅ Tray initialized with task status listener");
  } catch (error) {
    console.error("[TrayManager] ❌ Failed to initialize tray:", error);
  }
}
function getStatusIcon(status) {
  const iconMap = {
    created: "create.png",
    running: "running.png",
    wrapping_up: "wrapping.png",
    paused: "pause.png",
    completed: "complete.png",
    failed: "fail.png"
  };
  const iconFile = iconMap[status];
  if (!iconFile) return void 0;
  if (iconCache.has(status)) {
    return iconCache.get(status);
  }
  try {
    const iconPath = electron.app.isPackaged ? path.join(process.resourcesPath, "assets", iconFile) : path.join(index.g(), "../../assets", iconFile);
    const loadedIcon = electron.nativeImage.createFromPath(iconPath);
    if (!loadedIcon.isEmpty()) {
      const resizedIcon = loadedIcon.resize({ width: 14, height: 14 });
      resizedIcon.setTemplateImage(true);
      iconCache.set(status, resizedIcon);
      return resizedIcon;
    }
  } catch (error) {
    console.error(`[TrayManager] Failed to load icon for status ${status}:`, error);
  }
  return void 0;
}
function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}
async function handleTaskClick(taskId) {
  const mainWindow = index$1.g();
  if (!mainWindow || mainWindow.isDestroyed()) {
    console.error("[TrayManager] Main window not available");
    return;
  }
  mainWindow.show();
  mainWindow.focus();
  const { sideBarPanel } = await Promise.resolve().then(() => require("./index-vXB5mSwm.js")).then((n) => n.a5);
  sideBarPanel.sendIpc("tray:load-task", taskId);
}
async function handleNewTask() {
  const mainWindow = index$1.g();
  if (!mainWindow || mainWindow.isDestroyed()) {
    console.error("[TrayManager] Main window not available");
    return;
  }
  mainWindow.show();
  mainWindow.focus();
  try {
    const tabManager = index$1.T.getInstance();
    const newTab = await tabManager.createTab("system", "flowith://blank/", void 0, true);
    console.log("[TrayManager] Created new blank tab:", newTab.id);
  } catch (error) {
    console.error("[TrayManager] Failed to create new tab:", error);
  }
}
async function updateTrayMenu() {
  if (!tray) return;
  const mainWindow = index$1.g();
  const isVisible = mainWindow && !mainWindow.isDestroyed() && mainWindow.isVisible();
  let allTasks = [];
  try {
    allTasks = await index$1.E.listTasks("unarchived");
  } catch (error) {
    console.error("[TrayManager] Failed to get tasks:", error);
    tray.setTitle("");
  }
  const inProgressCount = allTasks.filter(
    (task) => task.status === "running" || task.status === "paused"
  ).length;
  if (inProgressCount > 0) {
    tray.setTitle(`${inProgressCount}`);
  } else {
    tray.setTitle("");
  }
  const inProgressTasks = allTasks.filter((task) => task.status === "running" || task.status === "paused").sort((a, b) => b.created_at - a.created_at);
  const menuItems = [];
  menuItems.push({
    label: index$2.m.t("tray.newTask"),
    click: () => {
      void handleNewTask();
    }
  });
  menuItems.push({ type: "separator" });
  if (inProgressTasks.length > 0) {
    menuItems.push({
      label: index$2.m.t("tray.recentTasks"),
      enabled: false
    });
    const displayTasks = inProgressTasks.slice(0, 8);
    displayTasks.forEach((task) => {
      const statusIcon = getStatusIcon(task.status);
      const truncatedInstruction = truncateText(task.instructions, 30);
      menuItems.push({
        label: truncatedInstruction,
        icon: statusIcon,
        click: () => {
          void handleTaskClick(task.id);
        }
      });
    });
    if (inProgressTasks.length > 8) {
      const remainingTasks = inProgressTasks.slice(8);
      const submenuItems = remainingTasks.map((task) => {
        const statusIcon = getStatusIcon(task.status);
        const truncatedInstruction = truncateText(task.instructions, 30);
        return {
          label: truncatedInstruction,
          icon: statusIcon,
          click: () => {
            void handleTaskClick(task.id);
          }
        };
      });
      menuItems.push({
        label: index$2.m.t("tray.viewMore"),
        submenu: submenuItems
      });
    }
    menuItems.push({ type: "separator" });
  }
  menuItems.push(
    {
      label: index$2.m.t("tray.showMainWindow"),
      enabled: !isVisible,
      click: async () => {
        const window = index$1.g();
        if (window && !window.isDestroyed()) {
          window.show();
          window.focus();
          await updateTrayMenu();
        }
      }
    },
    {
      label: index$2.m.t("tray.hideMainWindow"),
      enabled: isVisible,
      click: async () => {
        const window = index$1.g();
        if (window && !window.isDestroyed()) {
          window.hide();
          await updateTrayMenu();
        }
      }
    },
    {
      label: index$2.m.t("tray.quit"),
      click: () => electron.app.quit()
    }
  );
  const contextMenu = electron.Menu.buildFromTemplate(menuItems);
  tray.setContextMenu(contextMenu);
}
function refreshTrayMenu() {
  void updateTrayMenu();
}
exports.initializeTray = initializeTray;
exports.refreshTrayMenu = refreshTrayMenu;
