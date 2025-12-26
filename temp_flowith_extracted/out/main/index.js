"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const electron = require("electron");
async function main() {
  const gotTheLock = electron.app.requestSingleInstanceLock();
  if (!gotTheLock) {
    console.log("[Main] 🔒 应用已在运行，退出当前实例");
    electron.app.quit();
  } else {
    console.log("[Main] 🔓 获得单实例锁，应用可以启动");
    const appStartTime = Date.now();
    const { bootstrap } = await Promise.resolve().then(() => require("./chunks/index-_y89fuqw.js"));
    bootstrap();
    await electron.app.whenReady();
    const { migrate } = await Promise.resolve().then(() => require("./chunks/index-DDgCcCN_.js"));
    await migrate();
    const { startUp } = await Promise.resolve().then(() => require("./chunks/index-CcitnFoe.js"));
    await startUp(appStartTime);
  }
}
let mainDir = null;
function setMainDir(dir) {
  mainDir = dir;
}
function getMainDir() {
  if (!mainDir) {
    throw new Error("mainDir is not set");
  }
  return mainDir;
}
setMainDir(__dirname);
void main();
exports.g = getMainDir;
