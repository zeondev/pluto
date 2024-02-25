let pid = -1;
let token = "";

export default {
  name: "BootLoader",
  description: "Handles loading and startup",
  ver: 1, // Compatible with core v1
  type: "process",
  exec: async function (Root) {
    const serviceList = ["Account"];

    // Root is just a temp name for the global object the core gives you
    if (pid !== -1) {
      console.log("%BootLoader called twice, aborting", "color:red");
      console.log(Root);
      const x = Root.Lib.cleanup(Root.PID, Root.Token);
      console.log(x); // true
      return {};
    }
    pid = Root.PID;
    token = Root.Token;

    // Make app
    const ls = await Root.Core.startPkg("ui:LoadingScreen");
    const FileMapping = await Root.Core.startPkg("lib:FileMappings");
    // start loading screen
    const lsg = ls.loader(Root.Lib);
    try {
      const serviceReference = [];

      for (let i = 0; i < serviceList.length; i++) {
        let r = await Root.Core.startPkg("services:" + serviceList[i]);
        serviceReference.push({ name: serviceList[i], ref: r?.proc || r });
      }

      if (
        localStorage.getItem("error") != null &&
        localStorage.getItem("error") === "force"
      )
        throw new Error("Core forced panicked using error value.");

      Root.Core.services = serviceReference;
      // await Root.Core.startPkg('ui:LoginScreen');

      // Start of global customization config

      let vfs = await Root.Core.startPkg("lib:VirtualFS");
      await vfs.importFS();

      if (await vfs.exists("Root/Pluto/config/fsVersionUpdate.txt")) {
        let version = await vfs.readFile(
          "Root/Pluto/config/fsVersionUpdate.txt"
        );

        if (Number(version) < Root.Lib.systemInfo.version) {
          await vfs.importFS();
          await vfs.merge();
        } else {
          await vfs.importFS();
        }
      } else {
        await vfs.importFS();
      }
      console.log(Root.Lib.systemInfo);
      await vfs.writeFile(
        "Root/Pluto/config/fsVersionUpdate.txt",
        Root.Lib.systemInfo.version.toString()
      );
      let appearanceConfig = JSON.parse(
        await vfs.readFile("Root/Pluto/config/appearanceConfig.json")
      );

      if (appearanceConfig.sidebarType) {
        document.documentElement.dataset.sidebarType =
          appearanceConfig.sidebarType;
      }
      if (appearanceConfig.dockStyle) {
        document.documentElement.dataset.dockStyle = appearanceConfig.dockStyle;
      }
      if (appearanceConfig.dockShowTray !== undefined) {
        document.documentElement.dataset.dockShowTray =
          appearanceConfig.dockShowTray;
      }
      if (appearanceConfig.dockShowAssistant !== undefined) {
        document.documentElement.dataset.dockShowAssistant =
          appearanceConfig.dockShowAssistant;
      }
      if (
        appearanceConfig.language &&
        Root.Lib.langs.includes(appearanceConfig.language)
      ) {
        Root.Core.setLanguage(appearanceConfig.language);
      }

      let themeLib = await Root.Core.startPkg("lib:ThemeLib");

      async function checkTheme() {
        if (
          appearanceConfig.theme &&
          appearanceConfig.theme.endsWith(".theme")
        ) {
          const x = themeLib.validateTheme(
            await vfs.readFile(
              "Root/Pluto/config/themes/" + appearanceConfig.theme
            )
          );

          if (x !== undefined && x.success === true) {
            console.log(x);

            themeLib.setCurrentTheme(x.data);
          } else {
            console.log(x.message);
            document.documentElement.dataset.theme = "dark";
          }
        } else {
          themeLib.setCurrentTheme(
            '{"version":1,"name":"Dark","description":"A built-in theme.","values":null,"cssThemeDataset":"dark","wallpaper":"./assets/wallpapers/space.png"}'
          );
        }
      }

      await checkTheme();

      lsg.cleanup();

      if (appearanceConfig["shh"] === true) {
        window.__DEBUG = true;
      }

      if (
        (appearanceConfig["wantsLoginScreen"] === undefined ||
          appearanceConfig["wantsLoginScreen"] === true) &&
        sessionStorage.getItem("skipLogin") !== "true"
      ) {
        const lgs = await Root.Core.startPkg(
          "ui:ActualLoginScreen",
          true,
          true
        );

        await lgs.launch();
      }

      if (await vfs.exists("Root/Pluto/config/settingsConfig.json")) {
        let settingsConfig = JSON.parse(
          await vfs.readFile("Root/Pluto/config/settingsConfig.json")
        );
        if (
          settingsConfig !== undefined &&
          settingsConfig.bootApp !== undefined
        ) {
          let appMapping = await FileMapping.retrieveAllMIMEdata(
            settingsConfig.bootApp,
            vfs
          );
          appMapping.onClick(Root.Core);
          // await Root.Core.startPkg(
          //   mapping.onClick(Root.Core);
          //   await vfs.readFile(settingsConfig.bootApp),
          //   false,
          //   true
          // );
        } else {
          await Root.Core.startPkg("apps:FTGSF");
          await Root.Core.startPkg("ui:Desktop", true, true);
        }
      } else {
        await Root.Core.startPkg("apps:FTGSF");
        await Root.Core.startPkg("ui:Desktop", true, true);
      }

      const searchParams = new URLSearchParams(location.search);

      async function checkPackageBoot() {
        if (searchParams.has("pkg")) {
          const pkg = searchParams.get("pkg");
          if (pkg.startsWith("app:")) {
            // load custom app from fs
            const appExists = await vfs.exists(pkg.slice(4));

            if (!appExists) return;

            const app = await vfs.readFile(pkg.slice(4));

            const p = await Root.Core.startPkg(
              "data:text/javascript," + encodeURIComponent(app),
              false,
              true
            );

            if (searchParams.has("data")) {
              p.proc.send(JSON.parse(searchParams.get("data")));
            }
          } else {
            // load system app
            const p = await Root.Core.startPkg(pkg, true, true);

            if (searchParams.has("data")) {
              try {
                p.proc.send(JSON.parse(searchParams.get("data")));
              } catch (e) {}
            }
          }
        } else {
          if (
            appearanceConfig["hasSetupSystem"] === undefined ||
            appearanceConfig["hasSetupSystem"] === false
          ) {
            await Root.Core.startPkg("apps:Welcome", true, true);
          }
        }
      }

      await checkPackageBoot();

      await checkTheme();
      // await Root.Core.startPkg("apps:TaskManager", true, true);
      // destroy loading screen

      // ply startup stound
      let a = new Audio("./assets/startup.wav");
      a.volume = 0.5;
      a.play();

      // Console
      const consoleApp = await Root.Core.startPkg("system:Console", true, true);

      document.addEventListener("keydown", (e) => {
        if (e.key === "~") {
          e.preventDefault();
          if (e.repeat) return;
          consoleApp.proc.send({ type: "toggle" });
        }
      });
    } catch (e) {
      window.err = e;
      lsg.cleanup();
      Root.Core.startPkg("system:Basic");
      Root.Modal.alert(
        "BootLoader Error",
        "Something went wrong while loading...\n\n" +
          e +
          "\n\n" +
          e.stack +
          "\n\n" +
          "Launching Basic Mode"
      );
    }

    return Root.Lib.setupReturns((m) => {
      console.log("BootLoader received message: " + m);
    });
  },
};
