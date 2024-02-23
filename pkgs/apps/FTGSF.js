export default {
  name: "FTGSF",
  description: "Generates shortcuts for applications on the Desktop.",
  ver: 1, // Compatible with core v1
  type: "process",
  exec: async function (Root) {
    let wrapper; // Lib.html | undefined\

    console.log("generating shortcuts for applications on the desktop");

    const vfs = await Root.Lib.loadLibrary("VirtualFS");
    await vfs.importFS();

    // task manager
    // file manager
    // image viewer
    // notepad
    // weather
    // DevEnv

    let shortcutsList = [
      {
        localizedName: "systemApp_TaskManager",
        name: "Task Manager",
        icon: "cpu",
        fullName: "apps:TaskManager",
      },
      {
        localizedName: "systemApp_FileManager",
        name: "File Manager",
        icon: "folders",
        fullName: "apps:FileManager",
      },
      {
        localizedName: "systemApp_AppStore",
        name: "App Store",
        icon: "package",
        fullName: "apps:AppStore",
      },
      {
        localizedName: "systemApp_Settings",
        name: "Settings",
        icon: "wrench",
        fullName: "apps:Settings",
      },
      {
        localizedName: "systemApp_Notepad",
        name: "Notepad",
        icon: "note",
        fullName: "apps:Notepad",
      },
      {
        localizedName: "systemApp_DevEnv",
        name: "DevEnv",
        icon: "fileCode",
        fullName: "apps:DevEnv",
      },
      {
        localizedName: "systemApp_ImageViewer",
        name: "Image Viewer",
        icon: "image",
        fullName: "apps:ImageViewer",
      },
      {
        localizedName: "systemApp_Browser",
        name: "Browser",
        icon: "globe",
        fullName: "apps:Browser",
      },
      {
        localizedName: "systemApp_Weather",
        name: "Weather",
        icon: "cloudMoon",
        fullName: "apps:Cloudburst",
      },
      {
        localizedName: "systemApp_Terminal",
        name: "Terminal",
        icon: "terminal",
        fullName: "apps:Terminal",
      },
      {
        localizedName: "systemApp_Calculator",
        name: "Calculator",
        icon: "calculator",
        fullName: "apps:Calculator",
      },
      {
        localizedName: "systemApp_EventViewer",
        name: "Event Viewer",
        icon: "monitor",
        fullName: "apps:EventViewer",
      },
    ];
    console.log(shortcutsList.length);
    for (let i = 0; i < shortcutsList.length; i++) {
      await vfs.writeFile(
        "Root/Desktop/" + shortcutsList[i].name.replace(" ", "") + ".shrt",
        JSON.stringify(shortcutsList[i])
      );
    }
    Root.Lib.setOnEnd();
    Root.Lib.onEnd();

    return Root.Lib.setupReturns((m) => {
      console.log("Example received message: " + m);
    });
  },
};
