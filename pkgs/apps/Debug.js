export default {
  name: "Debug",
  description: "Create borders around every HTML object, UI things.",
  ver: 1, // Compatible with core v1
  type: "process",
  exec: async function (Root) {
    let wrapper; // Lib.html | undefined
    let MyWindow;

    Root.Lib.setOnEnd((_) => {
      MyWindow.close();
    });

    const Win = (await Root.Lib.loadLibrary("WindowSystem")).win;

    MyWindow = new Win({
      title: "Debug",
      content: "Hello",
      pid: Root.PID,
      onclose: () => {
        Root.Lib.onEnd();
      },
    });

    wrapper = MyWindow.window.querySelector(".win-content");

    let hasStyle = true;
    let styleRef = null;

    function toggleBorder() {
      hasStyle = !hasStyle;

      if (hasStyle) styleRef.cleanup();
      else
        styleRef = new Root.Lib.html("style")
          .html("* { outline: 1px solid #fff7 !important; }")
          .appendTo("body");
    }

    new Root.Lib.html("p").html("very cool").appendTo(wrapper);
    new Root.Lib.html("button")
      .text("Border-ify everything")
      .appendTo(wrapper)
      .on("click", (e) => {
        toggleBorder();
      });

    return Root.Lib.setupReturns((m) => {
      console.log("Example received message: " + m);
    });
  },
};
