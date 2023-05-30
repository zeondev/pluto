export default {
  name: "MIME File Mapping Library",
  description:
    "This library maps MIME types with applications and labels in order to fulfill launching files from desktop and FileManager use cases.",
  ver: 0.1, // Compatible with core 0.1
  type: "library",
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
        icon: "box",
      },
      json: {
        type: "code",
        label: "JSON file",
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
      shrt: {
        type: "text",
        label: "Desktop shortcut",
        opensWith: "apps:Notepad",
      },
    },
    retriveAllMIMEdata: function(path, vfs) {
      // pass in path, if shrt file, run custom shrt algorythm (returns everything that a regular run does), else, find file format, return icon, label, file name, and onclick events
      let ext = path.split(".").pop();
      if (ext === "shrt") {
        let shrtFile = JSON.parse(vfs.readFile(path));
        if (!shrtFile.name || !shrtFile.icon || !shrtFile.fullname) {
          return 0;
        }
        return {
          name: shrtFile.name,
          icon: shrtFile.icon,
          fullname: `Desktop shortcut (${shrtFile.fullname})`,
          onClick: (c) => {
            c.startPkg(shrtFile.fullname, true, true);
          },
        };
      } else {
        let icon = vfs.whatIs(path);
        let map = {};
        if (icon === 'dir') {
          map = { label: icon === 'File folder', opensWith: 'apps:FileManager', loadType: 'loadFolder' };
        } else {
          map = { label: icon === "File", opensWith: null };
        }
        if (this.mappings[ext.toLowerCase()]) {
          map = this.mappings[ext.toLowerCase()];
          icon = map.icon;
        }
        let pathSplit = path.split("/");
        return {
          name: pathSplit[pathSplit.length - 1],
          icon,
          fullname: map.label,
          onClick: async (c) => {
            if (map.opensWith === null) return;
            let x = await c.startPkg(map.opensWith, true, true);
            if (map.loadType) {
              x.proc.send({ type: map.loadType, path });
            } else {
              x.proc.send({ type: "loadFile", path });
            }
          },
        };
      }
    },
    getType: function(extension) {
      if (extension in this.mappings) {
        return this.mappings[extension].text;
      } else return false;
    },
    getLabel: function(extension) {
      if (extension in this.mappings) {
        return this.mappings[extension].text;
      } else return false;
    },
  },
};
