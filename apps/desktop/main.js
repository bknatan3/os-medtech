const { app, BrowserWindow, ipcMain, session } = require("electron");
const path = require("path");
const fs = require("fs");

function getSettingsPath() {
  return path.join(app.getPath("userData"), "settings.json");
}

function getSettings() {
  const settingsPath = getSettingsPath();
  if (!fs.existsSync(settingsPath)) {
    const defaultApiBaseUrl = process.env.OS_MEDTECH_DEFAULT_API_URL ?? "http://localhost:3333";
    fs.writeFileSync(settingsPath, JSON.stringify({ apiBaseUrl: defaultApiBaseUrl }, null, 2));
  }
  return JSON.parse(fs.readFileSync(settingsPath, "utf8"));
}

function setSettings(next) {
  fs.writeFileSync(getSettingsPath(), JSON.stringify(next, null, 2));
}

function normalizeApiBaseUrl(apiBaseUrl) {
  return apiBaseUrl.replace(/\/+$/, "");
}

function configureApiRewrite() {
  session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
    const settings = getSettings();
    const apiBaseUrl = normalizeApiBaseUrl(settings.apiBaseUrl ?? "http://localhost:3333");
    if (details.url.startsWith("http://localhost:3333/")) {
      const redirectedUrl = details.url.replace("http://localhost:3333", apiBaseUrl);
      callback({ redirectURL: redirectedUrl });
      return;
    }
    callback({});
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1300,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  });
  win.loadFile(path.join(__dirname, "web-build", "index.html"));
}

ipcMain.handle("settings:get", () => getSettings());
ipcMain.handle("settings:setApiBaseUrl", (_, apiBaseUrl) => {
  const next = { ...getSettings(), apiBaseUrl: normalizeApiBaseUrl(String(apiBaseUrl ?? "")) };
  setSettings(next);
  return true;
});

app.whenReady().then(() => {
  configureApiRewrite();
  createWindow();
});
