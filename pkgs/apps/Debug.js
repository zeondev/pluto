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

    new Root.Lib.html("p")
      .html(
        "Welcome to the debug app, here you can find some stuff to test layouts and other things"
      )
      .appendTo(wrapper);
    new Root.Lib.html("button")
      .text("Toggle Border")
      .appendTo(wrapper)
      .on("click", (e) => {
        toggleBorder();
      });
    console.log(Root.Lib.icons, Root.Lib.icons.length);

    for (let key in Root.Lib.icons) {
      console.log(Root.Lib.icons[key]);
      new Root.Lib.html("div")
        .html(Root.Lib.icons[key] + "<br><span>Name: </span>" + key)
        .appendTo(wrapper)
        .on("click", (e) => {
          console.log(e);
        });
    }

    // Root.Lib.icons.forEach((element) => {
    //   new Root.Lib.html("div")
    //     .html(element)
    //     .appendTo(wrapper)
    //     .on("click", (e) => {
    //       console.log(e);
    //     });
    // });

    return Root.Lib.setupReturns((m) => {
      console.log("Example received message: " + m);
    });
  },
};
