let templateFsLayout = {
  Root: {
    Pluto: {
      panics: {
        "README.MD":
          "This folder is designed to help store logs when Pluto crashes. If you have any worries about the logs please contact us with them.",
      },
      config: {
        "appearanceConfig.json": JSON.stringify({
          wallpaper: "/assets/Wallpaper.png",
          theme: "dark",
        }),
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
  },
};

const Vfs = {
  // The file system is represented as a nested object, where each key is a folder or file name
  // and the value is either a string (for file contents) or another object (for a subfolder)
  fileSystem: {},
  save() {
    localStorage.setItem("fs", JSON.stringify(this.fileSystem));
    this.fileSystem = JSON.parse(localStorage.getItem("fs"));
  },
  importFS(fsObject = templateFsLayout) {
    if (!localStorage.getItem("fs") && fsObject === templateFsLayout) {
      this.fileSystem = fsObject;
    } else if (fsObject !== templateFsLayout) {
      this.fileSystem = fsObject;
    } else {
      this.fileSystem = JSON.parse(localStorage.getItem("fs"));
    }
    this.save();
    return this.fileSystem;
  },
  exportFS() {
    return this.fileSystem;
  },
  // Helper function to get the parent folder of a given path
  getParentFolder(path) {
    const parts = path.split("/");
    parts.pop();
    return parts.join("/");
  },
  // function to tell you if stored data is a file or a folder
  whatIs(path, fsObject = this.fileSystem) {
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
  readFile(path, fsObject = this.fileSystem) {
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
  writeFile(path, contents, fsObject = this.fileSystem) {
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
    this.save();
  },
  // Function to create a new folder at a given path
  createFolder(path, fsObject = this.fileSystem) {
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
    current[foldername] = {};
    this.save();
  },
  // Function to delete a file or folder at a given path
  delete(path, fsObject = this.fileSystem) {
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
    this.save();
  },
  // Function to list all files and folders at a given path
  list(path, fsObject = this.fileSystem) {
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
  ver: 0.1, // Compatible with core 0.1
  type: "library",
  data: Vfs,
};
