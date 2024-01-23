# Virtual File System Documentation

[Back to README.md](README.md)

- [Virtual File System Documentation](#virtual-file-system-documentation)
  - [Default file structure](#default-file-structure)
  - [Functions](#functions)
  - [Secret File Tips](#secret-file-tips)
  - [File Location Tips](#file-location-tips)
    - [Configuration files](#configuration-files)
    - [Storing external libraries](#storing-external-libraries)

## Default file structure

```js
{
  Registry: {},
  Root: {
    Pluto: {
      panics: { ... },
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
        themes: { ... },
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
}
```

## Functions

Vfs functions are found as below. Some are documented, others are not

- `async exportFS()`
- `async importFS(fsObject = templateFsLayout)`
- `async getParentFolder(path)`
  Helper function to get the parent folder of a given path
- `async whatIs(path, fsObject = this.fileSystem)`
  function to tell you if stored data is a file or a folder
- `async readFile(path, fsObject = this.fileSystem, bypass = false)`
  Function to get the contents of a file at a given path
- `async writeFile(path, contents, fsObject = this.fileSystem)`
  Function to write to a file at a given path
- `async createFolder(path, fsObject = this.fileSystem)`
  Function to create a new folder at a given path
- `async delete(path, fsObject = this.fileSystem)`
  Function to delete a file or folder at a given path
- `async list(path, fsObject = this.fileSystem)`
  Function to list all files and folders at a given path
- `async rename(path, newName, fsObject = this.fileSystem)`
  Function to rename a file
  **newName MUST be the new exact name of the file, NOT absolute.**
- `async exists(path, fsObject = this.fileSystem)`
- `async merge(fsObject = this.fileSystem)`

Using the VFS in your app:

```js
const Vfs = await Root.Lib.loadLibrary("VirtualFS");
await Vfs.importFS();

// You can now use Vfs with any of the functions above
```

## Secret File Tips

The file `Root/Pluto/startup` allows you to configure startup apps. Use newlines to change which apps are launched at boot.

Example:
```
Root/Desktop/Settings.shrt
Root/Pluto/Apps/Example.js
```
launches Settings and Example at startup.

## File Location Tips

### Configuration files 

For config files, use the Registry path instead of Root. The files will be hidden from the end-user by default.     
Here's an example:

```js
const vfs = await Root.Lib.loadLibrary("VirtualFS");

await vfs.importFS();

// Registry is a hidden folder that can be used for storing app data but keeping it away from the user
vfs.writeFile("Registry/MyConfig.json", JSON.stringify(config));
```

### Storing external libraries

Use the `Root/Pluto/cache/lib` folder for storing external libraries.

