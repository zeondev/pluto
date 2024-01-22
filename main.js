const {
  app,
  BrowserWindow,
  globalShortcut,
  session,
  ipcMain,
} = require("electron");
const { readFileSync } = require("fs");
const path = require("path");
const https = require("https");
const { Client } = require("@xhayper/discord-rpc");

const client = new Client({
  clientId: "1198824358026682468",
});

client.on("ready", () => {
  console.log("Connected to RPC.");
});

client.login();

let baseUrl = "https://pluto-app.zeon.dev";

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    fullscreen: true,
    webPreferences: {
      nodeIntegration: true, // enable the use of Node.js APIs in the renderer process
      preload: path.join(__dirname, "preload.js"),
      // webSecurity: false,
      // allowRunningInsecureContent: true,
    },
    icon: path.join(__dirname, "icon.ico"),
  });

  mainWindow.setMenu(null);

  // Load the custom `index.html` file
  // mainWindow.loadFile("pluto/index.html");
  // load the url
  mainWindow.loadURL(baseUrl);

  ipcMain.on(
    "update-rpc",
    /**
     * set activit
     * @param {*} event H
     * @param {import("@xhayper/discord-rpc").SetActivity} rpcActivity yes
     */
    (event, rpcActivity) => {
      client.user?.setActivity(rpcActivity);
    }
  );

  // Execute custom JavaScript code after the web page is loaded
  mainWindow.webContents.on("did-finish-load", () => {
    // Inject your custom script
    mainWindow.webContents.executeJavaScript(readFileSync("./script.js"));
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
  ];

  session.defaultSession.protocol.interceptBufferProtocol(
    "https",
    (req, callback) => {
      if (urls.includes(req.url)) {
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
