"use strict";
const electron = require("electron");
const api = {
  getJobs: () => electron.ipcRenderer.invoke("scheduler-test:get-jobs"),
  addJob: (job) => electron.ipcRenderer.invoke("scheduler-test:add-job", job),
  removeJob: (id) => electron.ipcRenderer.invoke("scheduler-test:remove-job", id),
  onLog: (callback) => {
    const handler = (_, log) => callback(log);
    electron.ipcRenderer.on("scheduler-test:log", handler);
    return () => electron.ipcRenderer.removeListener("scheduler-test:log", handler);
  }
};
electron.contextBridge.exposeInMainWorld("schedulerTest", api);
