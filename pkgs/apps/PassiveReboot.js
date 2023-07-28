export default {
  name: "Passive Reboot",
  description: "Quickly 'refresh' the apps without fully restarting.",
  ver: 1, // Compatible with core v1
  type: "process",
  privileges: [
    {
      privilege: "processList",
      description: "Allows passive reboot to function",
    },
    {
      privilege: "startPkg",
      description: "Restart the apps",
    },
  ],
  exec: async function (Root) {
    Root.Lib.setOnEnd((_) => {
      console.log("ended?");
    });

    if (Root.Core !== null) {
      let processes = Root.Core.processList
        .slice(1)
        .filter(
          (p) =>
            p !== null &&
            p.name !== "apps:PassiveReboot" &&
            !p.name.startsWith("services:")
        );
      console.log(processes);

      processes.forEach((p) => {
        // const n = p.name.replace(/:/g, "/");
        const n = p.name;
        if (p.proc.end) {
          p.proc.end("force kill");

          // Root.Core.startPkg("/pkgs/" + n + ".js?t=" + Date.now(), false, true);
          Root.Core.startPkg(n, true, true);
        }
      });

      // DIE
      Root.Lib.onEnd();
    }

    return Root.Lib.setupReturns((m) => {
      console.log("Example received message: " + m);
    });
  },
};
