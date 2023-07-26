function makeid(length) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

export default {
  name: "Basic",
  description: "Basic user interface",
  ver: 0.1, // Compatible with core 0.1
  type: "process",
  exec: async function (Root) {
    let wrapper; // Lib.html | undefinedd
    let MyWindow;

    console.log("Hello from example package", Root.Lib);

    function onEnd() {
      console.log("Example process ended, attempting clean up...");
      const result = Root.Lib.cleanup(Root.PID, Root.Token);
      if (result === true) {
        wrapper.cleanup();
        console.log("Cleanup Success! Token:", Root.Token);
      } else {
        console.log("Cleanup Failure. Token:", Root.Token);
      }
    }

    let Html = Root.Lib.html;
    wrapper = new Html("div").appendTo("body").class("desktop");
    console.log(wrapper);

    let background = new Html()
      .style({
        top: "0",
        left: "0",
        right: "0",
        bottom: "0",
        transition: "opacity 2s linear",
        opacity: "0",
        width: "100%",
        height: "100%",
        position: "absolute",
        "z-index": "-1",
      })
      .appendTo(wrapper);

    const vfs = await Root.Lib.loadLibrary("VirtualFS");
    vfs.importFS();

    vfs.writeFile(
      "Root/Pluto/panics/pluto_" + makeid(16) + ".panic",
      err + "\n\n" + err.stack + "\n\n\n" + new Date().toString()
    );
    console.log(err);

    new Html("button")
      .text("Attempt to launch TaskManager")
      .on("click", (e) => {
        Root.Core.startPkg("apps:TaskManager");
      })
      .appendTo(wrapper);

    // new Html("button")
    //   .text("Attempt to save error")
    //   .on("click", (e) => {
    //     vfs.writeFile(
    //       "Root/Pluto/panics/pluto_" + makeid(16) + ".panic",
    //       err + "\n\n" + err.stack + "\n\n\n" + new Date().toString()
    //     );
    //     console.log(err);
    //   })
    //   .appendTo(wrapper);

    new Html("button")
      .text("Attempt filesystem backup and restore")
      .on("click", (e) => {
        localStorage.setItem("oldvfs", JSON.stringify(vfs.exportFS()));
        let fs = vfs.importFS(true);
        vfs.save();
        location.reload();
      })
      .appendTo(wrapper);

    return Root.Lib.setupReturns(onEnd, (m) => {
      console.log("Example recieved message: " + m);
    });
  },
};
