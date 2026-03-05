const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("osMedtechDesktop", {
  getSettings: () => ipcRenderer.invoke("settings:get"),
  setApiBaseUrl: (url) => ipcRenderer.invoke("settings:setApiBaseUrl", url)
});
