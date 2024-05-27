export default {
  name: "Panic Viewer",
  description: "View panic logs.",
  ver: "v1.6.2", // Supports minimum Core version of v1.6.2
  type: "process",
  exec: async function (Root) {
    let wrapper; // Lib.html | undefined
    let MyWindow;

    console.log("Hello from example package", Root.Lib);

    const Win = (await Root.Lib.loadLibrary("WindowSystem")).win;

    MyWindow = new Win({
      title: "Panic Viewer",
      content: "Hello",
      pid: Root.PID,
      width: 480,
      height: 480,
      onclose: () => {
        Root.Lib.onEnd();
      },
    });

    Root.Lib.setOnEnd((_) => MyWindow.close());

    const Html = Root.Lib.html;

    wrapper = MyWindow.window.querySelector(".win-content");

    let panicParser = await Root.Lib.loadLibrary("PanicParser");

    async function performSecurityScan() {
      let dc = await panicParser.scanPanicFolder();
      table.clear();

      new Html("thead")
        .appendMany(
          new Html("tr").appendMany(
            new Html("th").text("Reason"),
            new Html("th").text("Stack"),
            new Html("th").text("Time")
          )
        )
        .appendTo(table);

      console.log(dc, dc.length, 0 < dc.length, 1 < dc.length);

      try {
        let newDc = dc.sort((a, b) => {
          let dateA = new Date(JSON.parse(a.content).date);
          let dateB = new Date(JSON.parse(b.content).date);
          return dateB - dateA; // For descending order. Use dateA - dateB for ascending order.
        });
      } catch (e) {
        console.log(e);
      }

      for (let i = 0; i < dc.length; i++) {
        try {
          if (dc[i].success) {
            console.log(dc[i].content);
            let dcContent = JSON.parse(dc[i].content);
            new Html("tbody")
              .appendMany(
                new Html("tr").appendMany(
                  new Html("td").text(dcContent.reason),
                  new Html("td").text(dcContent.stack),
                  new Html("td").text(dcContent.date)
                  //         why ^^^^^^^^^^ ??? what
                )
              )
              .appendTo(table);
          }
        } catch (e) {
          console.log(e);
        }
      }
    }

    let table = new Html("table").appendTo(wrapper);
    performSecurityScan();

    return Root.Lib.setupReturns((m) => {
      console.log("Example received message: " + m);
    });
  },
};
