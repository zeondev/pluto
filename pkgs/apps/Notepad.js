export default {
  name: "Notepad",
  description: "Write and edit text files with this simplistic app.",
  ver: "v1.6.2", // Supports minimum Core version of v1.6.2
  type: "process",
  exec: async function (Root) {
    let wrapper; // Lib.html | undefined
    let NpWindow;

    this.name = Root.Lib.getString("systemApp_Notepad");

    Root.Lib.setOnEnd((_) => NpWindow.close());

    const Win = (await Root.Lib.loadLibrary("WindowSystem")).win;
    const FileDialog = await Root.Lib.loadLibrary("FileDialog");
    const Sidebar = await Root.Lib.loadComponent("Sidebar");

    NpWindow = new Win({
      title: Root.Lib.getString("systemApp_Notepad"),
      content: "",
      width: 340,
      height: 230,
      pid: Root.PID,
      onclose: async () => {
        if (currentDocument.dirty === true) {
          let result = await Root.Modal.prompt(
            "Warning",
            "You have unsaved changes, are you sure you want to exit?",
            NpWindow.window
          );
          if (result !== true) {
            return false;
          }
        }
        Root.Lib.onEnd();
      },
    });

    wrapper = NpWindow.window.querySelector(".win-content");

    wrapper.classList.add("row", "o-h", "h-100", "with-sidebar");

    let currentDocument = {
      path: "",
      dirty: false,
    };

    const updateTitle = (_) =>
      (NpWindow.window.querySelector(".win-titlebar .title").innerText = `${
        currentDocument.dirty === true ? "•" : ""
      } Notepad - ${
        currentDocument.path === ""
          ? "Untitled"
          : currentDocument.path.split("/").pop()
      }`.trim());

    function newDocument(path, content) {
      currentDocument.path = path;
      currentDocument.dirty = false;
      updateTitle();
      // just to be sure (instead of using .text() as that was sometimes not working)
      text.elm.textContent = content;
      text.elm.scrollTop = 0;
    }

    // FileDialog.pickFile and FileDialog.saveFile both take path as an argument and are async
    async function openFile() {
      let file = await FileDialog.pickFile(
        (await vfs.getParentFolder(currentDocument.path)) || "Root"
      );
      if (file === false) return;
      let content = await vfs.readFile(file);
      newDocument(file, content);
      NpWindow.focus();
    }
    async function saveFile() {
      // make sure the path is not unreasonable
      if (currentDocument.path === "") {
        return saveAs();
      }
      await vfs.writeFile(currentDocument.path, text.elm.value);
      currentDocument.dirty = false;
      updateTitle();
    }
    async function saveAs() {
      let result = await FileDialog.saveFile(
        (await vfs.getParentFolder(currentDocument.path)) || "Root"
      );
      if (result === false) return false;

      await vfs.writeFile(currentDocument.path, text.elm.value);

      currentDocument.dirty = false;
      currentDocument.path = result;
      updateTitle();
    }

    async function dirtyCheck() {
      if (currentDocument.dirty === true) {
        let result = await Root.Modal.prompt(
          "Warning",
          "You have unsaved changes, are you sure you want to proceed?",
          NpWindow.window
        );
        if (result !== true) {
          return false;
        }
      }
      return true;
    }

    let sidebarWrapper = new Root.Lib.html("div")
      .styleJs({ display: "flex" })
      .appendTo(wrapper);

    function makeSidebar() {
      sidebarWrapper.clear();
      Sidebar.new(sidebarWrapper, [
        {
          onclick: async (_) => {
            // clicking the new document button seems buggy, possibly due to dirty check
            const result = await dirtyCheck();
            if (result === false) return;
            newDocument("", "");
          },
          html: Root.Lib.icons.newFile,
          title: Root.Lib.getString("action_newDocument"),
        },
        {
          onclick: async (_) => {
            const result = await dirtyCheck();
            if (result === false) return;
            openFile();
          },
          html: Root.Lib.icons.openFolder,
          title: Root.Lib.getString("action_openDocument"),
        },
        {
          onclick: async (_) => {
            await saveFile();
          },
          html: Root.Lib.icons.save,
          title: Root.Lib.getString("action_save"),
        },
        {
          onclick: async (_) => {
            await saveAs();
          },
          html: Root.Lib.icons.saveAll,
          title: Root.Lib.getString("action_saveAs"),
        },
        {
          style: {
            "margin-top": "auto",
          },
          onclick: (_) => {
            alert("Not implemented");
          },
          html: Root.Lib.icons.help,
          title: Root.Lib.getString("appHelp"),
        },
      ]);
    }

    makeSidebar();

    const vfs = await Root.Lib.loadLibrary("VirtualFS");
    await vfs.importFS();

    let text = new Root.Lib.html("textarea")
      .class("transparent", "ovh", "fg", "container")
      .text("")
      .attr({ placeholder: "Enter text..." })
      .appendTo(wrapper);

    text.on("input", (e) => {
      currentDocument.dirty = true;
      updateTitle();
    });

    return Root.Lib.setupReturns(async (m) => {
      if (m && m.type) {
        if (m.type === "refresh") {
          Root.Lib.getString = m.data;
          NpWindow.setTitle(Root.Lib.getString("systemApp_Notepad"));
          Root.Lib.updateProcTitle(Root.Lib.getString("systemApp_Notepad"));
          makeSidebar();
        }
      }
      if (typeof m === "object" && m.type && m.type === "loadFile" && m.path) {
        newDocument(m.path, await vfs.readFile(m.path));
      }
    });
  },
};
