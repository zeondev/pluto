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

let Lib = {},
  Core = {};

const Vfs = {
  // The file system is represented as a nested object, where each key is a folder or file name
  // and the value is either a string (for file contents) or another object (for a subfolder)
  fileSystem: {},
  log(info) {
    console.debug(`[Vfs] ${info}`);
  },
  async save(reason = "save") {
    // Save does nothing in the electron environment.

    this.log(reason);

    // Global VFS Events
    document.dispatchEvent(new CustomEvent("pluto.vfs-refresh"), {
      detail: { reason },
    });
  },
  async exportFS() {
    return this.fileSystem;
  },
  async importFS(fsObject = templateFsLayout) {
    // This function does nothing in the electron environment, as its handled in preload.js.
  },
  // Helper function to get the parent folder of a given path
  async getParentFolder(path) {
    return Lib.host.path.dirname(path);
  },
  // function to tell you if stored data is a file or a folder
  async whatIs(path, fsObject = this.fileSystem) {
    return new Promise((resolve, reject) => {
      Lib.host.fs.readdir(
        Lib.host.path.join(Lib.host.dir, path),
        (err, files) => {
          if (err) {
            resolve("file");
          } else {
            resolve("dir");
          }
        }
      );
    });
  },
  // Function to get the contents of a file at a given path
  async readFile(path, fsObject = this.fileSystem, bypass = false) {
    try {
      return Lib.host.fs.readFileSync(Lib.host.path.join(Lib.host.dir, path), {
        encoding: "utf-8",
      });
    } catch (e) {
      if (e.code === "ENOENT") {
        return null;
      }
    }
  },
  // Function to write to a file at a given path
  async writeFile(path, contents, fsObject = this.fileSystem) {
    const path2 = Lib.host.path.dirname(Lib.host.path.join(Lib.host.dir, path));
    Lib.host.mkdirp(path2);

    Lib.host.fs.writeFileSync(Lib.host.path.join(Lib.host.dir, path), contents);
    this.save("write " + path);
  },
  // Function to create a new folder at a given path
  async createFolder(path, fsObject = this.fileSystem) {
    const fixedPath = Lib.host.path.dirname(
      Lib.host.path.join(Lib.host.dir, path)
    );
    Lib.host.mkdirp(fixedPath);
    this.save("mkdir " + path);
  },
  // Function to delete a file or folder at a given path
  async delete(path, fsObject = this.fileSystem) {
    const path2 = Lib.host.path.join(Lib.host.dir, path);

    Lib.host.fs.unlinkSync(path2);

    this.save("delete " + path);
  },
  // Function to list all files and folders at a given path
  async list(path, fsObject = this.fileSystem) {
    const path2 = Lib.host.path.join(Lib.host.dir, path);

    return Lib.host.fs.readdirSync(path2).map((f) => {
      let stat = "file";
      try {
        let stat2 = Lib.host.fs.statSync(
          Lib.host.path.join(Lib.host.dir, path, f)
        );
        stat = stat2.isDirectory() === true ? "dir" : "file";
      } catch (e) {}
      return {
        item: f,
        type: stat,
      };
    });
  },
  // Function to rename a file
  // newName MUST be the new exact name of the file
  // NOT absolute
  async rename(path, newName, fsObject = this.fileSystem) {
    // unused
    this.save(`rename ${path} to ${newName}`);
  },
  async exists(path, fsObject = this.fileSystem) {
    const path2 = Lib.host.path.join(Lib.host.dir, path);

    return Lib.host.fs.existsSync(path2);
  },
  async merge(fsObject = this.fileSystem) {
    console.log("unused");
    this.save("merge");
  },
};

export default {
  name: "Real File System Wrapper for Pluto Desktop",
  description:
    "Access to the real file system. This library includes many function to help loading and executing of files.",
  ver: 1, // Compatible with core v1
  type: "library",
  init: (l, c) => {
    // setup lib and core stuff
    Lib = l;
    Core = c;
  },
  data: Vfs,
};
