export default {
  name: "Build A Ktat",
  description: "Build A Ktat app, very nice for some cool characters.",
  ver: 0.1, // Compatible with core 0.1
  type: "process",
  exec: async function (Root) {
    let wrapper; // Lib.html | undefined
    let MyWindow;

    console.log("Hello from example package", Root.Lib);

    function onEnd() {
      console.log("Example process ended, attempting clean up...");
      const result = Root.Lib.cleanup(Root.PID, Root.Token);
      if (result === true) {
        MyWindow.close();
        console.log("Cleanup Success! Token:", Root.Token);
      } else {
        console.log("Cleanup Failure. Token:", Root.Token);
      }
    }

    const Win = (await Root.Lib.loadLibrary("WindowSystem")).win;

    // Testing the html library
    MyWindow = new Win({
      title: "Build A Ktat",
      content: '<iframe src="https://build-a.ktat.repl.co">',
      pid: Root.PID,
      onclose: () => {
        onEnd();
      },
    });

    wrapper = MyWindow.window.querySelector(".win-content");
    wrapper.style.padding = "0px";

    return Root.Lib.setupReturns(onEnd, (m) => {
      console.log("Example recieved message: " + m);
    });
  },
};
