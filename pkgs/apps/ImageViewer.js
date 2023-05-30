export default {
  name: "ImageViewer",
  description: "View your epic images in this smooth app.",
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
      title: "Image Viewer",
      onclose: () => {
        onEnd();
      },
    });

    wrapper = MyWindow.window.querySelector(".win-content");

    const vfs = await Root.Lib.loadLibrary("VirtualFS");
    const FileDialog = await Root.Lib.loadLibrary("FileDialog");

    vfs.importFS();

    wrapper.classList.add("with-sidebar", "row", "o-h", "h-100");

    const Sidebar = await Root.Lib.loadComponent("Sidebar");

    async function openFile(path) {
      let file;
      if (path) file = path;
      else file = await FileDialog.pickFile("Root");
      if (file === false) return;
      let result = updateImage(vfs.readFile(file));
      if (result === false) return;
      MyWindow.window.querySelector(".win-titlebar .title").innerText =
        "Image Viewer - " + file.split("/").pop();
      MyWindow.focus();
    }

    Sidebar.new(wrapper, [
      {
        onclick: async (_) => {
          openFile();
        },
        html: Root.Lib.icons.fileImage,
      },
      {
        style: {
          "margin-top": "auto",
        },
        onclick: (_) => {
          alert("Not implemented");
        },
        html: Root.Lib.icons.help,
      },
    ]);

    let imgWrapper = new Root.Lib.html("div")
      .class("ovh", "fg", "fc", "row")
      .appendTo(wrapper);

    let img = new Root.Lib.html("img")
      .appendTo(imgWrapper)
      .style({
        width: "100%",
        height: "100%",
        "object-fit": "contain",
        border: "none",
      })
      .attr({ draggable: "false" });

    function updateImage(content) {
      if (!content.startsWith("data:image/")) {
        Root.Modal.alert("Error", "This does not look like an image").then(
          (_) => {
            MyWindow.focus();
          }
        );
        return false;
      }
      img.elm.src = content;
    }

    return Root.Lib.setupReturns(onEnd, (m) => {
      if (typeof m === "object" && m.type && m.type === "loadFile" && m.path) {
        openFile(m.path);
      }
    });
  },
};
