export default {
  name: "Build A Ktat",
  description: "Build A Ktat app, very nice for some cool characters.",
  ver: 1, // Compatible with core v1
  type: "process",
  exec: async function (Root) {
    let wrapper; // Lib.html | undefined
    let MyWindow;

    console.log("Hello from example package", Root.Lib);

    Root.Lib.setOnEnd(_ => MyWindow.close());

    const Win = (await Root.Lib.loadLibrary("WindowSystem")).win;

    MyWindow = new Win({
      title: "Build A Ktat",
      content: '<iframe src="https://build-a.ktat.repl.co">',
      pid: Root.PID,
      width: 800,
      height: 600,
      onclose: () => {
        Root.Lib.onEnd();
      },
    });

    wrapper = MyWindow.window.querySelector(".win-content");
    wrapper.style.padding = "0px";

    return Root.Lib.setupReturns((m) => {
      console.log("Example received message: " + m);
    });
  },
};
