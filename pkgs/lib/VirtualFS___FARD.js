import { openDB } from "https://unpkg.com/idb?module";

let templateFsLayout = {
  Root: {
    Pluto: {
      panics: {
        "README.MD":
          "This folder is designed to help store logs when Pluto crashes. If you have any worries about the logs please contact us with them.",
      },
      config: {
        "appearanceConfig.json": JSON.stringify({
          wallpaper: "/assets/wallpapers/space.png",
          useThemeWallpaper: true,
          theme: "dark",
        }),
        themes: {
          "light.theme":
            '{"version":1,"name":"Light","description":"A built-in theme.","values":null,"cssThemeDataset":"light","wallpaper":"/assets/wallpapers/light.png"}',
          "dark.theme":
            '{"version":1,"name":"Dark","description":"A built-in theme.","values":null,"cssThemeDataset":"dark","wallpaper":"/assets/wallpapers/space.png"}',
          "grey.theme":
            '{"version":1,"name":"Grey","description":"A built-in theme.","values":null,"cssThemeDataset":"chatify","wallpaper":"/assets/wallpapers/grey.svg"}',
          "red.theme":
            '{"version":1,"name":"Red","description":"A built-in theme.","values":null,"cssThemeDataset":"red","wallpaper":"/assets/wallpapers/red.png"}',
          "green.theme":
            '{"version":1,"name":"Green","description":"A built-in theme.","values":null,"cssThemeDataset":"green","wallpaper":"/assets/wallpapers/green.jpg"}',
        },
      },
      apps: {
        "README.MD":
          "This folder contains all the apps that you have downloaded. If you have any questions about them please contact us.",
      },
    },
    Desktop: {
      "Folder 1": {
        "File 1.txt": "File 1.txt in Folder 1",
        "File 2.txt": "File 2.txt in Folder 1",
      },
      "Folder 2": {
        "File 1.txt": "File 1.txt in Folder 2",
        "File 2.txt": "File 2.txt in Folder 2",
      },
    },
    Documents: {},
    Downloads: {},
    Pictures: {},
    Videos: {},
    Music: {},
  },
};


const Vfs = {
  // The file system is represented as a nested object, where each key is a folder or file name
  // and the value is either a string (for file contents) or another object (for a subfolder)
  fileSystem: {},
  db: null,

  async init() {
    // Open the IndexedDB database
    this.db = await openDB("FileSystemDB", 1, {
      upgrade(db) {
        // Create an object store for files
        if (!db.objectStoreNames.contains("files")) {
          db.createObjectStore("files", { keyPath: "path" });
        }
      },
    });
    window.db = this.db;
    console.log(this.db)

    // Import the file system
    this.fileSystem = await this.importFS();
  },

  async save() {
    // Save the file system to IndexedDB
    await this.db.put("files", this.fileSystem, "fs");
  },

  async importFS(fsObject = templateFsLayout) {
    let fileSystem;

    if (fsObject === true) {
      fileSystem = templateFsLayout;
    } else if (
      !(await this.db.get("files", "fs")) &&
      fsObject === templateFsLayout
    ) {
      fileSystem = fsObject;
    } else if (fsObject !== templateFsLayout) {
      fileSystem = fsObject;
    } else {
      fileSystem = await this.db.get("files", "fs");
    }

    // Save the file system to IndexedDB
    await this.db.put("files", fileSystem, "fs");

    return fileSystem;
  },

  async exportFS() {
    return this.fileSystem;
  },

  // Helper function to get the parent folder of a given path
  getParentFolder(path) {
    const parts = path.split("/");
    parts.pop();
    return parts.join("/");
  },

  async whatIs(path, fsObject = this.fileSystem) {
    const parts = path.split("/");
    let current = fsObject;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (typeof current[part] === "undefined") {
        return null;
      }
      current = current[part];
    }
    if (typeof current !== "string") {
      return "dir";
    } else {
      return "file";
    }
  },

  async readFile(path, fsObject = this.fileSystem) {
    const parts = path.split("/");
    let current = fsObject;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (typeof current[part] === "undefined") {
        return null;
      }
      current = current[part];
    }
    if (typeof current !== "string") {
      return null;
    }
    return current;
  },

  async writeFile(path, contents, fsObject = this.fileSystem) {
    const parts = path.split("/");
    const filename = parts.pop();
    let current = fsObject;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (typeof current[part] === "undefined") {
        current[part] = {};
      }
      current = current[part];
    }
    current[filename] = contents;
    await this.save();
  },

  async createFolder(path, fsObject = this.fileSystem) {
    const parts = path.split("/");
    const foldername = parts.pop();
    let current = fsObject;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (typeof current[part] === "undefined") {
        current[part] = {};
      }
      current = current[part];
    }
    if (!current[foldername]) current[foldername] = {};
    await this.save();
  },

  async delete(path, fsObject = this.fileSystem) {
    const parts = path.split("/");
    const filename = parts.pop();
    const parentPath = this.getParentFolder(path);
    let parent = fsObject;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (typeof parent[part] === "undefined") {
        return;
      }
      parent = parent[part];
    }
    delete parent[filename];
    await this.save();
  },

  async list(path, fsObject = this.fileSystem) {
    const parts = path.split("/");
    let current = fsObject;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (typeof current[part] === "undefined") {
        return null;
      }
      current = current[part];
    }
    return Object.keys(current).map((m) => {
      return { item: m, type: this.whatIs(path + "/" + m) };
    });
  },
};

export default {
  name: "Virtual File System",
  description:
    "A file system based in the browsers local storage. This library includes many function to help loading and executing of files.",
  ver: 1, // Compatible with core v1
  type: "library",
  data: Vfs,
};
