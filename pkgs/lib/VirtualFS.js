let templateFsLayout = {
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

const Vfs = {
  // The file system is represented as a nested object, where each key is a folder or file name
  // and the value is either a string (for file contents) or another object (for a subfolder)
  fileSystem: {},
  async save(reason = "save") {
    await localforage.setItem("fs", JSON.stringify(this.fileSystem));
    this.fileSystem = JSON.parse(await localforage.getItem("fs"));

    // Global VFS Events
    document.dispatchEvent(new CustomEvent("pluto.vfs-refresh"), {
      detail: { reason },
    });
  },
  async exportFS() {
    return this.fileSystem;
  },
  async importFS(fsObject = templateFsLayout) {
    if (fsObject === true) {
      this.fileSystem = templateFsLayout;
    } else if (
      !(await localforage.getItem("fs")) &&
      fsObject === templateFsLayout
    ) {
      this.fileSystem = fsObject;
    } else if (fsObject !== templateFsLayout) {
      this.fileSystem = fsObject;
    } else {
      const existingFs = JSON.parse(await localforage.getItem("fs"));

      // this.fileSystem = {...templateFsLayout, ...existingFs};
      this.fileSystem = existingFs;

      // this.fileSystem = { ...fsObject, ...this.fileSystem };
    }
    this.save("import");
    return this.fileSystem;
  },
  // Helper function to get the parent folder of a given path
  async getParentFolder(path) {
    const parts = path.split("/");
    parts.pop();
    return parts.join("/");
  },
  // function to tell you if stored data is a file or a folder
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
  // Function to get the contents of a file at a given path
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
  // Function to write to a file at a given path
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
    this.save("write " + path);
  },
  // Function to create a new folder at a given path
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
    this.save("mkdir " + path);
  },
  // Function to delete a file or folder at a given path
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
    this.save("delete " + path);
  },
  // Function to list all files and folders at a given path
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
    const result = await Promise.all(
      Object.keys(current).map(async (m) => {
        return { item: m, type: await this.whatIs(path + "/" + m) };
      })
    );
    return result;
  },
  async exists(path, fsObject = this.fileSystem) {
    const parts = path.split("/");
    let current = fsObject;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (typeof current[part] === "undefined") {
        return false;
      }
      current = current[part];
    }
    return true;
  },
  async merge(fsObject = this.fileSystem) {
    var existingFs = fsObject;

    function mergeFileSystem(obj1, obj2) {
      for (var key in obj2) {
        if (obj2.hasOwnProperty(key)) {
          if (
            typeof obj2[key] === "object" &&
            obj2[key] !== null &&
            !Array.isArray(obj2[key])
          ) {
            if (
              !(key in obj1) ||
              typeof obj1[key] !== "object" ||
              obj1[key] === null ||
              Array.isArray(obj1[key])
            ) {
              obj1[key] = {}; // Create an object if the key doesn't exist or if it is not an object
            }
            mergeFileSystem(obj1[key], obj2[key]); // Recursive call for nested objects
          } else {
            if (!(key in obj1)) {
              obj1[key] = obj2[key]; // Assign the value if the key doesn't exist in obj1
            } else {
              console.log(
                `File "${key}" already exists and will not be overwritten.`
              );
            }
          }
        }
      }
    }

    mergeFileSystem(existingFs, templateFsLayout);
    this.importFS(existingFs);
    this.save("merge");
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
