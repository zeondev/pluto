let pid = -1;
let token = "";

export default {
  name: "BootLoader",
  description: "Handles loading and startup",
  ver: 0.1, // Compatible with core 0.1
  type: "process",
  exec: async function (Root) {
    const serviceList = ["OpenWeatherMap"];

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
        throw new Error("h");

      Root.Core.services = serviceReference;
      // throw new Error("KERNEL bootloader PANIC")
      // await Root.Core.startPkg('ui:LoginScreen');

      // Start of global customisation config

      let vfs = await Root.Core.startPkg("lib:VirtualFS");
      vfs.importFS();

      let appearanceConfig = JSON.parse(
        vfs.readFile("Root/Pluto/config/appearanceConfig.json")
      );
      document.documentElement.dataset.theme = appearanceConfig.theme;

      // End

      await Root.Core.startPkg("ui:Desktop", true, true);
      // await Root.Core.startPkg("apps:Welcome");
      await Root.Core.startPkg("apps:TaskManager", true, true);
      await Root.Core.startPkg("apps:FTGSF");
      // destroy loading screen
      lsg.cleanup();

      // ply starutp stound
      let a = new Audio("/assets/startup.wav");
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
    }

    return Root.Lib.setupReturns(
      (_) => {
        Root.Modal.alert("BootLoader", "No");
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
