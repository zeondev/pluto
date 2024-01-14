export default {
  name: "Audio Player",
  description: "Listen to your music in this app.",
  ver: 1, // Compatible with core v1
  type: "process",
  exec: async function (Root) {
    let wrapper; // Lib.html | undefined
    let MyWindow;

    console.log("Hello from example package", Root.Lib);

    Root.Lib.setOnEnd(function () {
      MyWindow.close();
    });
    const Win = (await Root.Lib.loadLibrary("WindowSystem")).win;

    MyWindow = new Win({
      title: "Audio Player",
      pid: Root.PID,
      onclose: () => {
        Root.Lib.onEnd();
      },
    });

    // initializing wrappers and vfs
    wrapper = MyWindow.window.querySelector(".win-content");

    const vfs = await Root.Lib.loadLibrary("VirtualFS");
    const FileDialog = await Root.Lib.loadLibrary("FileDialog");

    await vfs.importFS();

    wrapper.classList.add("with-sidebar", "row", "o-h", "h-100");

    const Sidebar = await Root.Lib.loadComponent("Sidebar");

    // this function opens the file and changes the title to the file name,
    // we load the file into a buffer
    async function openFile(path) {
      let file;
      if (path) file = path;
      else file = await FileDialog.pickFile("Root");
      if (file === false) return;
      let result = updateAudio(await vfs.readFile(file));
      if (result === false) return;
      MyWindow.window.querySelector(".win-titlebar .title").innerText =
        "Audio Player - " + file.split("/").pop();
      MyWindow.focus();
    }

    // creates sidebar
    Sidebar.new(wrapper, [
      {
        onclick: async (_) => {
          openFile();
        },
        html: Root.Lib.icons.fileAudio,
        title: "Select Audio...",
      },
      {
        style: {
          "margin-top": "auto",
        },
        onclick: (_) => {
          alert("Not implemented");
        },
        html: Root.Lib.icons.help,
        title: "Help",
      },
    ]);

    // creates the wrapper that the image is in
    let vidWrapper = new Root.Lib.html("div")
      .class("ovh", "fg", "fc", "row")
      .appendTo(wrapper);

    // creates the actual img element
    let img = new Root.Lib.html("audio")
      .appendTo(vidWrapper)
      .style({
        width: "100%",
        "object-fit": "contain",
        border: "none",
      })
      .attr({ draggable: "false", controls: 'on' });

    // updates the video on the next load
    function updateAudio(content) {
      if (!content.startsWith("data:audio/") && !content.startsWith("blob:")) {
        Root.Modal.alert("Error", "This does not look like an audio file").then(
          (_) => {
            MyWindow.focus();
          }
        );
        return false;
      }
      img.elm.src = content;
    }

    return Root.Lib.setupReturns((m) => {
      if (typeof m === "object" && m.type && m.type === "loadFile" && m.path) {
        openFile(m.path);
      }
    });
  },
};
