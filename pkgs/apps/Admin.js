export default {
  name: "Admin",
  description: "An example of an elevated process.",
  privileges: [
    {
      privilege: "full",
      description: "for the admin app to do admin things",
    },
  ],
  ver: 1, // Compatible with core v1
  type: "process",
  exec: async function (Root) {
    let wrapper;
    let MyWindow;

    Root.Lib.setOnEnd((_) => MyWindow.close());

    const Win = (await Root.Lib.loadLibrary("WindowSystem")).win;

    MyWindow = new Win({
      title: "Admin App",
      content: "Hello",
      pid: Root.PID,
      onclose: () => {
        onEnd();
      },
    });
    wrapper = MyWindow.window.querySelector(".win-content");

    /* Heading */ new Root.Lib.html("h1").text("Hi i am app").appendTo(wrapper);
    /* Paragraph */
    new Root.Lib.html("p")
      .html(`I ${Root.Core !== null ? "have" : "do not have"} admin privileges`)
      .appendTo(wrapper);
    /* Button */
    new Root.Lib.html("button")
      .text("Check privileges")
      .appendTo(wrapper)
      .on("click", (e) => {
        Root.Modal.alert(
          "Hi",
          `I am ${Root.Core !== null ? "Privileged" : "Non-Privileged"}`,
          wrapper
        );
      });
    /* Close Button */
    new Root.Lib.html("button")
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
