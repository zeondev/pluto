const { app, BrowserWindow, globalShortcut, session, ipcMain } = require("electron");
const path = require("path");

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    fullscreen: true,
    webPreferences: {
      nodeIntegration: true, // enable the use of Node.js APIs in the renderer process
      // webSecurity: false,
      // allowRunningInsecureContent: true,
    },
    icon: path.join(__dirname, "icon.ico"),
  });

  mainWindow.setMenu(null);

  // Load the custom `index.html` file
  // mainWindow.loadFile("pluto/index.html");
  // I can't have it load pluto for some reason so we'll just load Url
  mainWindow.loadURL("https://pluto.zeon.dev");

  let zoomFactor = 1;

  // Register global shortcuts for zooming in/out
  globalShortcut.register("CommandOrControl+-", () => {
    zoomFactor = zoomFactor - 0.2;
    mainWindow.webContents.zoomFactor = zoomFactor;
  });

  globalShortcut.register("CommandOrControl+=", () => {
    zoomFactor = zoomFactor + 0.2;
    mainWindow.webContents.zoomFactor = zoomFactor;
  });

  // Open DevTools (optional)
  mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  session.defaultSession.webRequest.onHeadersReceived(
    // {urls},
    (details, callback) => {
      details.responseHeaders["x-frame-options"] = "";
      // console.log(details.responseHeaders);
      const responseHeaders = Object.assign(details.responseHeaders, {
        "x-frame-options": [""],
      });
      callback({ cancel: false, responseHeaders });
    }
  );

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

app.on("will-quit", () => {
  // Unregister global shortcuts before quitting
  globalShortcut.unregisterAll();
});
