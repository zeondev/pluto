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
      width: 480,
      height: 360,
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

    new Root.Lib.html("h2").text("Icons").appendTo(wrapper);

    const iconsContainer = new Root.Lib.html("div")
      .class("row", "row-wrap", "gap")
      .appendTo(wrapper);

    const Notify = await Root.Lib.loadLibrary("Notify");
    const notifyBox = new Root.Lib.html("div")
      .class("notify-box")
      .appendTo(wrapper);

    for (let key in Root.Lib.icons) {
      new Root.Lib.html("button")
        .class("fc", "gap", "row", "transparent", "m-0")
        .html(Root.Lib.icons[key])
        .append(new Root.Lib.html("span").text(key))
        .appendTo(iconsContainer)
        .on("click", async (e) => {
          await navigator.clipboard.writeText(Root.Lib.icons[key]);
          Notify.show("Copied", `SVG data for ${key} was copied.`, notifyBox);
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
