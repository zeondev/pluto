export default {
  name: "Cloudburst",
  description: "Cloudburst application",
  ver: 1, // Compatible with core v1
  type: "process",
  exec: async function (Root) {
    let wrapper; // Lib.html | undefined
    let MyWindow;

    console.log("Hello from example package", Root.Lib);

    Root.Lib.setOnEnd((_) => MyWindow.close());

    const Win = (await Root.Lib.loadLibrary("WindowSystem")).win;

    MyWindow = new Win({
      title: Root.Lib.getString('systemApp_Weather'),
      content: '<iframe src="https://cherries.to/cloudburst/">',
      pid: Root.PID,
      width: 400,
      height: 360,
      onclose: () => {
        Root.Lib.onEnd();
      },
    });

    wrapper = MyWindow.window.querySelector(".win-content");
    wrapper.style.padding = "0px";

    return Root.Lib.setupReturns(async (m) => {
      if (m && m.type) {
        if (m.type === "refresh") {
          Root.Lib.getString = m.data;
          MyWindow.setTitle(Root.Lib.getString("systemApp_Weather"));
          Root.Lib.updateProcTitle(Root.Lib.getString("systemApp_Weather"));
        }
      }
      console.log("Example received message: " + m);
    });
  },
};
