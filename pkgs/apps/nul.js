export default {
  name: "nul",
  description: "nul",
  ver: 0.1, // Compatible with core 0.1
  type: "process",
  exec: async function(Root) {
    function onEnd() {
      const result = Root.Lib.cleanup(Root.PID, Root.Token);
      if (result === true) {
      } else {
        console.log("Cleanup Failure. Token:", Root.Token);
      }
    }; onEnd();
  },
};
