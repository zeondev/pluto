export default {
  name: "Image Viewer",
  description: "View your epic images in this smooth app.",
  ver: "v1.6.2", // Supports minimum Core version of v1.6.2
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
      title: Root.Lib.getString('systemApp_ImageViewer'),
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
      let result = updateImage(await vfs.readFile(file));
      if (result === false) return;
      MyWindow.window.querySelector(".win-titlebar .title").innerText =
        "Image Viewer - " + file.split("/").pop();
      MyWindow.focus();
    }

    // creates sidebar
    let sidebarWrapper = new Root.Lib.html("div")
      .styleJs({ display: "flex" })
      .appendTo(wrapper);

    function makeSidebar() {
      sidebarWrapper.clear();
      Sidebar.new(sidebarWrapper, [
        {
          onclick: async (_) => {
            openFile();
          },
          html: Root.Lib.icons.fileImage,
          title: "Select Image...",
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
    }
    makeSidebar();

    // creates the wrapper that the image is in
    let imgWrapper = new Root.Lib.html("div")
      .class("ovh", "fg", "fc", "row")
      .appendTo(wrapper);

    // creates the actual img element
    let img = new Root.Lib.html("img")
      .appendTo(imgWrapper)
      .style({
        width: "100%",
        height: "100%",
        "object-fit": "contain",
        border: "none",
      })
      .attr({ draggable: "false" });

    // updates the image on the next load
    function updateImage(content) {
      if (!content.startsWith("data:image/") && !content.startsWith("blob:")) {
        Root.Modal.alert("Error", "This does not look like an image").then(
          (_) => {
            MyWindow.focus();
          }
        );
        return false;
      }
      img.elm.src = content;
    }

    return Root.Lib.setupReturns(async (m) => {
      if (m && m.type) {
        if (m.type === "refresh") {
          Root.Lib.getString = m.data;
          MyWindow.setTitle(Root.Lib.getString("systemApp_ImageViewer"));
          Root.Lib.updateProcTitle(Root.Lib.getString("systemApp_ImageViewer"));
          makeSidebar();
        }
      }
      if (typeof m === "object" && m.type && m.type === "loadFile" && m.path) {
        openFile(m.path);
      }
    });
  },
};
