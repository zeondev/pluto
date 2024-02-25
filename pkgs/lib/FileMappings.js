let L = {};
let C = {};

export default {
  name: "MIME File Mapping Library",
  description:
    "This library maps MIME types with applications and labels in order to fulfill launching files from desktop and FileManager use cases.",
  ver: 1, // Compatible with core v1
  type: "library",
  init: (l, c) => {
    L = l;
    C = c;
  },
  data: {
    mappings: {
      txt: {
        type: "text",
        label: "Text document",
        opensWith: "apps:Notepad",
        icon: "file",
      },
      panic: {
        type: "text",
        label: "Panic Log",
        opensWith: "apps:Notepad",
        icon: "filePanic",
      },
      md: {
        type: "text",
        label: "Markdown document",
        opensWith: "apps:Notepad",
        icon: "fileMd",
      },
      app: {
        type: "executable",
        label: "Executable Application",
        opensWith: "custom",
        ctxMenuApp: {
          launch: "apps:DevEnv",
          name: "systemApp_DevEnv",
        },
        icon: "box",
      },
      json: {
        type: "code",
        label: "JSON file",
        opensWith: "apps:DevEnv",
        icon: "fileJson",
      },
      js: {
        type: "code",
        label: "JavaScript file",
        opensWith: "apps:DevEnv",
        icon: "fileJson",
      },
      png: {
        type: "image",
        label: "PNG image",
        opensWith: "apps:ImageViewer",
        icon: "fileImage",
      },
      jpg: {
        type: "image",
        label: "JPG image",
        opensWith: "apps:ImageViewer",
        icon: "fileImage",
      },
      jpeg: {
        type: "image",
        label: "JPG image",
        opensWith: "apps:ImageViewer",
        icon: "fileImage",
      },
      gif: {
        type: "image",
        label: "GIF image",
        opensWith: "apps:ImageViewer",
        icon: "fileImage",
      },
      mp4: {
        type: "video",
        label: "MP4 video",
        opensWith: "apps:VideoPlayer",
        icon: "fileVideo",
      },
      mov: {
        type: "video",
        label: "MOV video",
        opensWith: "apps:VideoPlayer",
        icon: "fileVideo",
      },
      mkv: {
        type: "video",
        label: "MKV video",
        opensWith: "apps:VideoPlayer",
        icon: "fileVideo",
      },
      avi: {
        type: "video",
        label: "AVI video",
        opensWith: "apps:VideoPlayer",
        icon: "fileVideo",
      },
      webm: {
        type: "video",
        label: "WebM video",
        opensWith: "apps:VideoPlayer",
        icon: "fileVideo",
      },
      wav: {
        type: "audio",
        label: "WAV audio",
        opensWith: "apps:AudioPlayer",
        icon: "fileAudio",
      },
      m4a: {
        type: "audio",
        label: "MPEG audio",
        opensWith: "apps:AudioPlayer",
        icon: "fileAudio",
      },
      mp3: {
        type: "audio",
        label: "MP3 audio",
        opensWith: "apps:AudioPlayer",
        icon: "fileAudio",
      },
      shrt: {
        type: "text",
        label: "Desktop shortcut",
        opensWith: "apps:Notepad",
      },
      theme: {
        type: "text",
        label: "Theme",
        opensWith: "apps:Notepad",
        icon: "brush",
      },
    },
    retrieveAllMIMEdata: async function (path) {
      // pass in path, if shrt file, run custom shrt algorithm (returns everything that a regular run does), else, find file format, return icon, label, file name, and onclick events
      const vfs = await L.loadLibrary("VirtualFS");
      await vfs.importFS();
      /**@type array */
      let pathLast = path.split("/").pop();
      let pathSplitDot = pathLast.split(".");
      const ext = pathSplitDot.pop();
      const fileName = pathSplitDot.join(".");

      if (ext === "shrt") {
        let shrtFile = {};
        try {
          shrtFile = JSON.parse(await vfs.readFile(path));
        } catch (e) {
          return {
            name: "Unknown",
            icon: "help",
            fullName: `Desktop shortcut?`,
            onClick: (c) => {
              L.Modal.alert("Oops", "Cannot open this file");
            },
          };
        }

        if (shrtFile === undefined || shrtFile === null)
          return {
            name: "Unknown",
            icon: "help",
            fullName: `Desktop shortcut?`,
            onClick: (c) => {
              L.Modal.alert("Oops", "Cannot open this file");
            },
          };
        if (!shrtFile.name || !shrtFile.icon || !shrtFile.fullName) {
          return 0;
        }
        return {
          name: L.getString(shrtFile.localizedName) ?? shrtFile.name,
          icon: shrtFile.icon,
          fullName: `Desktop shortcut (${shrtFile.fullName})`,
          onClick: (c) => {
            c.startPkg(shrtFile.fullName, true, true);
          },
        };
      } else if (ext === "app" && path.startsWith("Registry/AppStore/")) {
        const asExists = await vfs.whatIs(
          "Registry/AppStore/_AppStoreIndex.json"
        );

        if (asExists === null) {
          return {
            name: "Non-signed App",
            icon: "package",
            fullName: "Invalid App",
            onClick() {
              L.Modal.alert("This app can not be launched");
            },
          };
        } else {
          const as = JSON.parse(
            await vfs.readFile("Registry/AppStore/_AppStoreIndex.json")
          );

          if (window.__DEBUG === true)
            console.log(fileName, as);

          if (fileName in as) {
            return {
              name: as[fileName].name,
              icon: `<img style="border-radius:50%;width:24px;height:24px" src="${as[fileName].icon}">`,
              fullName: as[fileName].shortDescription,
              ctxMenuApp: undefined,
              invalid: false,
              async onClick() {
                C.startPkg(
                  "data:text/javascript," +
                    encodeURIComponent(await vfs.readFile(path)),
                  false,
                  false
                );
              },
            };
          } else {
            return {
              name: "App Store App (unknown)",
              icon: "wrench",
              fullName: "App Store App (unknown)",
              invalid: true,
              onClick() {
                L.Modal.alert("This app can not be launched");
              },
            };
          }
        }
      } else {
        let icon = await vfs.whatIs(path);
        let map = {};
        if (icon === "dir") {
          map = {
            type: "dir",
            label: icon === "File folder",
            opensWith: "apps:FileManager",
            loadType: "loadFolder",
          };
        } else {
          map = { label: icon === "file", opensWith: null };
        }
        if (this.mappings[ext.toLowerCase()]) {
          map = this.mappings[ext.toLowerCase()];
          icon = map.icon;
        } else {
          if (icon !== "dir")
            map = {
              type: "file",
              label: "Unknown file",
              opensWith: "apps:Notepad",
              icon: "file",
            };
        }
        let pathSplit = path.split("/");
        return {
          name: pathSplit[pathSplit.length - 1],
          icon,
          fullName: map.label,
          ctxMenuApp: map.ctxMenuApp,
          onClick: async (c) => {
            if (map.opensWith === null) return;
            if (map.opensWith === "custom") {
              c.startPkg(
                "data:text/javascript," +
                  encodeURIComponent(await vfs.readFile(path)),
                false,
                false
              );
              return;
            } else {
              let x = await c.startPkg(map.opensWith, true, true);
              if (map.loadType) {
                x.proc.send({ type: map.loadType, path });
              } else {
                x.proc.send({ type: "loadFile", path });
              }
            }
          },
        };
      }
    },
    getType: function (extension) {
      if (extension in this.mappings) {
        return this.mappings[extension].text;
      } else return false;
    },
    getLabel: function (extension) {
      if (extension in this.mappings) {
        return this.mappings[extension].text;
      } else return false;
    },
  },
};
