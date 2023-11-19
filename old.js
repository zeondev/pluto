const { app, BrowserWindow, globalShortcut, session } = require("electron");
const path = require("path");

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true, // enable the use of Node.js APIs in the renderer process
      // webSecurity: false,
      // allowRunningInsecureContent: true,
    },
    icon: path.join(__dirname, "icon.ico"),
  });

  mainWindow.setMenu(null);

  // Load the custom `index.html` file
  mainWindow.loadFile("pluto/index.html");

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

function setupApp() {
  () => {
    createWindow();

    const filter = {
      urls: ["https://www.google.com/*"], // Replace with the URL you want to bypass
    };

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
  };
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
    // the commandLine is array of strings in which last element is deep link url
    dialog.showErrorBox(
      "Welcome Back",
      `You arrived from: ${commandLine.pop()}`
    );
  });

  // Create mainWindow, load the rest of the app, etc...
  app.whenReady().then(setupApp);
}

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

app.on("will-quit", () => {
  // Unregister global shortcuts before quitting
  globalShortcut.unregisterAll();
});
