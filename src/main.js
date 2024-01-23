const {
  app,
  BrowserWindow,
  globalShortcut,
  session,
  ipcMain,
  Menu,
} = require("electron");
const { readFileSync } = require("fs");
const path = require("path");
const https = require("https");
const { Client } = require("@xhayper/discord-rpc");
const { init, launch } = require("./localServer");
const electronLocalShortcut = require("electron-localshortcut");

const client = new Client({
  clientId: "1198824358026682468",
});

client.on("ready", () => {
  console.log("Connected to RPC.");
});

client.login();

// let baseUrl = "https://pluto-app.zeon.dev";
let baseUrl = "http://localhost:5500";

// local proxy server
init(baseUrl);
launch(baseUrl);

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    // fullscreen: true,
    webPreferences: {
      nodeIntegration: true, // enable the use of Node.js APIs in the renderer process
      preload: path.join(__dirname, "preload.js"),
      // For the host variable
      contextIsolation: false,
      // webSecurity: false,
      // allowRunningInsecureContent: true,
    },
    icon: path.join(__dirname, "icon.ico"),
  });

  if (process.platform === "darwin") {
    electronLocalShortcut.register(mainWindow, "CommandOrControl+=", () => {
      mainWindow.webContents.setZoomFactor(
        mainWindow.webContents.getZoomFactor() + 0.1
      );
    });

    electronLocalShortcut.register(mainWindow, "CommandOrControl+-", () => {
      mainWindow.webContents.setZoomFactor(
        mainWindow.webContents.getZoomFactor() - 0.1
      );
    });

    electronLocalShortcut.register(mainWindow, "Command+Option+I", () => {
      if (mainWindow.webContents.isDevToolsOpened()) {
        mainWindow.webContents.closeDevTools();
      } else {
        mainWindow.webContents.openDevTools();
      }
    });
  } else {
    electronLocalShortcut.register(mainWindow, "CommandOrControl+=", () => {
      mainWindow.webContents.setZoomFactor(
        mainWindow.webContents.getZoomFactor() + 0.1
      );
    });

    electronLocalShortcut.register(mainWindow, "CommandOrControl+-", () => {
      mainWindow.webContents.setZoomFactor(
        mainWindow.webContents.getZoomFactor() - 0.1
      );
    });

    electronLocalShortcut.register(mainWindow, "Ctrl+Shift+I", () => {
      if (mainWindow.webContents.isDevToolsOpened()) {
        mainWindow.webContents.closeDevTools();
      } else {
        mainWindow.webContents.openDevTools();
      }
    });
  }

  mainWindow.setMenu(null);

  // Load the custom `index.html` file
  // mainWindow.loadFile("pluto/index.html");
  // load the url
  mainWindow.loadURL(baseUrl);

  ipcMain.on(
    "update-rpc",
    /**
     * set activity
     * @param {*} event Unused.
     * @param {import("@xhayper/discord-rpc").SetActivity} rpcActivity
     */
    (event, rpcActivity) => {
      client.user?.setActivity(rpcActivity);
    }
  );

  // Execute custom JavaScript code after the web page is loaded
  mainWindow.webContents.on("did-finish-load", () => {
    // Inject your custom script
    mainWindow.webContents.executeJavaScript(readFileSync("./src/inject.js"));
  });

  // let zoomFactor = 1;

  // Register global shortcuts for zooming in/out
  // globalShortcut.register("CommandOrControl+-", () => {
  //   zoomFactor = zoomFactor - 0.2;
  //   mainWindow.webContents.zoomFactor = zoomFactor;
  // });

  // globalShortcut.register("CommandOrControl+=", () => {
  //   zoomFactor = zoomFactor + 0.2;
  //   mainWindow.webContents.zoomFactor = zoomFactor;
  // });

  // Open DevTools (optional)
  mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  // session.defaultSession.webRequest.onHeadersReceived(
  //   // {urls},
  //   (details, callback) => {
  //     details.responseHeaders["x-frame-options"] = "";
  //     // console.log(details.responseHeaders);
  //     const responseHeaders = Object.assign(details.responseHeaders, {
  //       "x-frame-options": [""],
  //     });
  //     callback({ cancel: false, responseHeaders });
  //   }
  // );

  const urls = [
    `${baseUrl}/pkgs/lib/VirtualFS.js`,
    `${baseUrl}/pkgs/lib/FileMappings.js`,
    `${baseUrl}/pkgs/services/DesktopIntegration.js`,
  ];

  function requestCallback(req, callback) {
    if (urls.includes(req.url)) {
      const url = readFileSync(`./${req.url.replace(`${baseUrl}/`, "")}`);
      console.log("replacing url", url);
      callback({
        statusCode: 200,
        data: readFileSync(`./${req.url.replace(`${baseUrl}/`, "")}`), //__dirname + "/local.html"),
        mimeType: "application/javascript; charset=utf-8",
      });
    } else {
      const rq = https
        .request(
          req.url,
          {
            method: req.method,
            headers: req.headers,
          },
          (res) => {
            let data = [];
            res.on("data", (chunk) => {
              data.push(chunk);
            });
            res.on("end", () => {
              callback({
                statusCode: res.statusCode,
                headers: Object.assign(res.headers, {
                  "x-frame-options": [""],
                }),
                data: Buffer.concat(data),
              });
            });
          }
        )
        .on("error", (err) => {
          console.log("Error: ", err.message);
        });

      if (req.method.toLowerCase() === "post") {
        rq.write(req.uploadData[0].bytes.toString());
      }

      rq.end();
    }
  }

  // session.defaultSession.protocol.interceptBufferProtocol(
  //   "http",
  //   requestCallback
  //   );
  // session.defaultSession.protocol.interceptBufferProtocol(
  //   "https",
  //   requestCallback
  // );

  session.defaultSession.webRequest.onBeforeRequest(
    { urls },
    (details, callback) => {
      if (details.url.startsWith("devtools:"))
        return callback({ cancel: false });
      callback({
        cancel: false,
        redirectURL: `http://localhost:1930/pluto/?url=${encodeURIComponent(
          details.url
        )}`,
      });
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
