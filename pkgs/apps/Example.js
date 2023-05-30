export default {
  name: "Example",
  description: "Example application. Boilerplate.",
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
      title: "Example App",
      content: "Hello",
      onclose: () => {
        onEnd();
      },
      s,
    });

    wrapper = MyWindow.window.querySelector(".win-content");

    /* Heading */ new Root.Lib.html("h1").text("Example App").appendTo(wrapper);
    /* Paragraph */ new Root.Lib.html("p")
      .html("Hi welcome to the example app")
      .appendTo(wrapper);
    /* Button */ new Root.Lib.html("button")
      .text("Hello, world")
      .appendTo(wrapper)
      .on("click", (e) => {
        Root.Modal.alert(
          `Hello!\nCursor Position: ${e.clientX}, ${e.clientY}\nMy PID: ${Root.PID}\nMy Token: ${Root.Token}`
        );
      });
    /* Spawn Button */ new Root.Lib.html("button")
      .text("Spawn another")
      .appendTo(wrapper)
      .on("click", (e) => {
        Root.Lib.launch("apps:Example", wrapper);
      });
    /* Spawn Admin Button */ new Root.Lib.html("button")
      .text("Spawn an Admin App")
      .appendTo(wrapper)
      .on("click", (e) => {
        Root.Lib.launch("apps:Admin", wrapper);
      });
    /* Close Button */ new Root.Lib.html("button")
      .text("End Process")
      .appendTo(wrapper)
      .on("click", (e) => {
        onEnd();
      });

    return Root.Lib.setupReturns(onEnd, (m) => {
      console.log("Example recieved message: " + m);
    });
  },
};
