const { app, BrowserWindow, ipcMain, session } = require("electron");
const path = require("path");
const fs = require("fs");
const http = require("http");
const { URL } = require("url");

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

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".html") return "text/html; charset=utf-8";
  if (ext === ".js") return "application/javascript; charset=utf-8";
  if (ext === ".css") return "text/css; charset=utf-8";
  if (ext === ".json") return "application/json; charset=utf-8";
  if (ext === ".svg") return "image/svg+xml";
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".ico") return "image/x-icon";
  if (ext === ".map") return "application/json; charset=utf-8";
  if (ext === ".txt") return "text/plain; charset=utf-8";
  return "application/octet-stream";
}

function resolveStaticFile(webBuildDir, requestPathname) {
  const normalized = requestPathname === "/" ? "/index.html" : requestPathname;
  const cleanPath = decodeURIComponent(normalized).replace(/^\/+/, "");
  const candidate = path.resolve(webBuildDir, cleanPath);
  if (candidate.startsWith(webBuildDir) && fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
    return candidate;
  }

  if (!path.extname(cleanPath)) {
    const htmlCandidate = path.resolve(webBuildDir, `${cleanPath}.html`);
    if (htmlCandidate.startsWith(webBuildDir) && fs.existsSync(htmlCandidate) && fs.statSync(htmlCandidate).isFile()) {
      return htmlCandidate;
    }
  }

  return null;
}

function startStaticServer(webBuildDir) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      try {
        const requestUrl = new URL(req.url || "/", "http://127.0.0.1");
        const filePath = resolveStaticFile(webBuildDir, requestUrl.pathname);
        if (!filePath) {
          res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
          res.end("Not found");
          return;
        }
        res.writeHead(200, { "Content-Type": getContentType(filePath) });
        fs.createReadStream(filePath).pipe(res);
      } catch {
        res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Internal server error");
      }
    });

    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Falha ao iniciar servidor local do desktop"));
        return;
      }
      resolve({ server, url: `http://127.0.0.1:${address.port}` });
    });
  });
}

async function createWindow() {
  const webBuildDir = path.resolve(__dirname, "web-build");
  const { server, url } = await startStaticServer(webBuildDir);

  const win = new BrowserWindow({
    width: 1300,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  });

  win.webContents.on("did-fail-load", (_, errorCode, errorDescription, validatedURL) => {
    console.error("Desktop load failure:", { errorCode, errorDescription, validatedURL });
  });

  win.on("closed", () => {
    server.close();
  });

  win.loadURL(`${url}/`);
}

ipcMain.handle("settings:get", () => getSettings());
ipcMain.handle("settings:setApiBaseUrl", (_, apiBaseUrl) => {
  const next = { ...getSettings(), apiBaseUrl: normalizeApiBaseUrl(String(apiBaseUrl ?? "")) };
  setSettings(next);
  return true;
});

app.whenReady().then(() => {
  configureApiRewrite();
  createWindow().catch((error) => {
    console.error("Falha ao iniciar janela desktop:", error);
    app.quit();
  });
});
