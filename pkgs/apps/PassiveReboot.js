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
    let wrapper; // Lib.html | undefined
    let window;
    let remakeTable;

    function onEnd() {
      console.log("Example process ended, attempting clean up...");
      const result = Root.Lib.cleanup(Root.PID, Root.Token);
      if (result === true) {
        console.log("Cleanup Success! Token:", Root.Token);
      } else {
        console.log("Cleanup Failure. Token:", Root.Token);
      }
    }

    if (Root.Core !== null) {
      let processes = Root.Core.processList
        .slice(1)
        .filter((p) => p !== null && p.name !== "apps:PassiveReboot");
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
      onEnd();
    }

    return Root.Lib.setupReturns(onEnd, (m) => {
      console.log("Example recieved message: " + m);
    });
  },
};
