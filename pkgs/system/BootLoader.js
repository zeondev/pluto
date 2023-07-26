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
      console.log("%cBootloader called twice, aborting", "color:red");
      console.log(Root);
      const x = Root.Lib.cleanup(Root.PID, Root.Token);
      console.log(x); // true
      return {};
    }
    pid = Root.PID;
    token = Root.Token;

    // Make app
    const ls = await Root.Core.startPkg("ui:LoadingScreen");
    // start loading screen
    const lsg = ls.loader();
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

      // Start of global customisation config

      let vfs = await Root.Core.startPkg("lib:VirtualFS");
      await vfs.importFS();

      let appearanceConfig = JSON.parse(
        await vfs.readFile("Root/Pluto/config/appearanceConfig.json")
      );

      await Root.Core.startPkg("apps:FTGSF");

      await Root.Core.startPkg("ui:Desktop", true, true);

      let themeLib = await Root.Core.startPkg("lib:ThemeLib");

      if (appearanceConfig.theme && appearanceConfig.theme.endsWith(".theme")) {
        const x = themeLib.validateTheme(
          await vfs.readFile("Root/Pluto/config/themes/" + appearanceConfig.theme)
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

      await Root.Core.startPkg("apps:Welcome");
      // await Root.Core.startPkg("apps:TaskManager", true, true);
      // destroy loading screen
      lsg.cleanup();

      // ply starutp stound
      let a = new Audio("./assets/startup.wav");
      a.volume = 0.5;
      a.play();
    } catch (e) {
      window.err = e;
      lsg.cleanup();
      Root.Core.startPkg("system:Basic");
      Root.Modal.alert(
        "Bootloader Error",
        "Something went wrong while loading...\n\n" +
          e +
          "\n\n" +
          e.stack +
          "\n\n" +
          "Launching Basic Mode"
      );

      // Console
      const cnsl = await Root.Core.startPkg("system:Console", true, true);

      window.addEventListener("keydown", (e) => {
        if (e.key === "`") {
          e.preventDefault();
          // send msg
          cnsl.proc.send({ type: "toggle" });
        }
      });
    }

    return Root.Lib.setupReturns(
      (_) => {
        // Root.Modal.alert("BootLoader", "No");
        // console.log("Bootloader process ended, attempting clean up...");
        // const result = Root.Lib.cleanup(pid, token);
        // if (result === true) {
        //   console.log("Cleanup Success! Token:", token);
        // } else {
        //   console.log("Cleanup Failure. Token:", token);
        // }
      },
      (m) => {
        console.log("Bootloader recieved message: " + m);
      }
    );
  },
};
