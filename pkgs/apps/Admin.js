export default {
  name: "Admin",
  description: "An example of an elevated process.",
  privileges: [
    {
      privilege: "full",
      description: "for the admin app to do admin things",
    },
  ],
  ver: 0.1, // Compatible with core 0.1
  type: "process",
  exec: async function (Root) {
    let wrapper;
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
      title: "Admin App",
      content: "Hello",
      onclose: () => {
        onEnd();
      },
    });
    wrapper = MyWindow.window.querySelector(".win-content");

    /* Heading */ new Root.Lib.html("h1").text("Hi i am app").appendTo(wrapper);
    /* Paragraph */
    new Root.Lib.html("p")
      .html(`I ${Root.Core !== null ? "have" : "do not have"} admin priviliges`)
      .appendTo(wrapper);
    /* Button */
    new Root.Lib.html("button")
      .text("Check privileges")
      .appendTo(wrapper)
      .on("click", (e) => {
        Root.Modal.alert(
          "Hi",
          `I am ${Root.Core !== null ? "Priviliged" : "Non-Priviliged"}`,
          wrapper
        );
      });
    /* Close Button */
    new Root.Lib.html("button")
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
