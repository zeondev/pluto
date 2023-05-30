export default {
  name: "Debug",
  description: "Create borders around every HTML object, UI things.",
  ver: 0.1, // Compatible with core 0.1
  type: "process",
  exec: async function (Root) {
    let wrapper; // Lib.html | undefined
    let MyWindow;

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
      title: "Debug",
      content: "Hello",
      onclose: () => {
        onEnd();
      },
    });

    wrapper = MyWindow.window.querySelector(".win-content");

    /* Paragraph */ new Root.Lib.html("p").html("very cool").appendTo(wrapper);
    /* Button */ new Root.Lib.html("button")
      .text("Borderify everything")
      .appendTo(wrapper)
      .on("click", (e) => {
        new Root.Lib.html("style")
          .html("* { outline: 1px solid #fff7 !important; }")
          .appendTo("body");
      });

    return Root.Lib.setupReturns(onEnd, (m) => {
      console.log("Example recieved message: " + m);
    });
  },
};
