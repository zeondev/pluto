const { contextBridge } = require("electron");
const path = require("path");
const fs = require("fs");
const dir = path.join(__dirname, "fs");
const { mkdirpSync } = require("mkdirp");
const du = require("du");

const { ipcRenderer } = require("electron/renderer");

contextBridge.exposeInMainWorld("host", {
  fs,
  path,
  dir,
  mkdirp: mkdirpSync,
  du,
  updateRPC: (title) => ipcRenderer.send("update-rpc", title),
});

function createFileTree(rootPath, fileTree) {
  Object.entries(fileTree).forEach(([key, value]) => {
    const filePath = path.join(rootPath, key);

    if (typeof value === "string") {
      // Check if the file already exists
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, value);
      }
    } else if (typeof value === "object") {
      // Check if the directory already exists
      if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath);
      }
      createFileTree(filePath, value);
    }
  });
}

// Example usage
const templateFsLayout = {
  Registry: {},
  Root: {
    Pluto: {
      panics: {
        "README.MD":
          "This folder is designed to help store logs when Pluto crashes. If you have any worries about the logs please contact us with them.",
      },
      config: {
        "appearanceConfig.json": JSON.stringify({
          wallpaper: "./assets/wallpapers/space.png",
          useThemeWallpaper: true,
          theme: "dark.theme",
          sidebarType: "vertical",
        }),
        "settingsConfig.json": JSON.stringify({
          warnSecurityIssues: true,
        }),
        themes: {
          "light.theme":
            '{"version":1,"name":"Light","description":"A built-in theme.","values":null,"cssThemeDataset":"light","wallpaper":"./assets/wallpapers/light.png"}',
          "dark.theme":
            '{"version":1,"name":"Dark","description":"A built-in theme.","values":null,"cssThemeDataset":"dark","wallpaper":"./assets/wallpapers/space.png"}',
          "grey.theme":
            '{"version":1,"name":"Grey","description":"A built-in theme.","values":null,"cssThemeDataset":"grey","wallpaper":"./assets/wallpapers/grey.svg"}',
          "red.theme":
            '{"version":1,"name":"Red","description":"A built-in theme.","values":null,"cssThemeDataset":"red","wallpaper":"./assets/wallpapers/red.png"}',
          "green.theme":
            '{"version":1,"name":"Green","description":"A built-in theme.","values":null,"cssThemeDataset":"green","wallpaper":"./assets/wallpapers/green.jpg"}',
        },
      },
      apps: {
        "README.MD":
          "This folder contains all the apps that you have downloaded. If you have any questions about them please contact us.",
      },
      startup: "",
    },
    Desktop: {},
    Documents: {},
    Downloads: {},
    Pictures: {},
    Videos: {},
    Music: {},
  },
};

createFileTree(dir, templateFsLayout);
