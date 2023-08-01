export default {
  name: "Example",
  description: "Example application. Boilerplate.",
  ver: 1, // Compatible with core v1
  type: "process",
  exec: async function (Root) {
    let wrapper; // Lib.html | undefined
    let MyWindow;

    console.log("Hello from example package", Root.Lib);

    const Win = (await Root.Lib.loadLibrary("WindowSystem")).win;

    MyWindow = new Win({
      title: "Example App",
      content: "Hello",
      pid: Root.PID,
      onclose: () => {
        Root.Lib.onEnd();
      },
    });

    Root.Lib.setOnEnd(_ => MyWindow.close());

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
        Root.Lib.onEnd();
      });

    return Root.Lib.setupReturns((m) => {
      console.log("Example received message: " + m);
    });
  },
};
