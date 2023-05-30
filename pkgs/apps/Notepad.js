export default {
  name: "Notepad",
  description: "Write and edit text files with this simplistic app.",
  ver: 0.1, // Compatible with core 0.1
  type: "process",
  exec: async function (Root) {
    let wrapper; // Lib.html | undefined
    let NpWindow;

    function onEnd() {
      const result = Root.Lib.cleanup(Root.PID, Root.Token);
      if (result === true) {
        NpWindow.close();
      }
    }

    const Win = (await Root.Lib.loadLibrary("WindowSystem")).win;
    const FileDialog = await Root.Lib.loadLibrary("FileDialog");
    const Sidebar = await Root.Lib.loadComponent("Sidebar");

    // Testing the html library
    NpWindow = new Win({
      title: "Notepad",
      content: "",
      width: 340,
      height: 230,
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
        onEnd();
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
        vfs.getParentFolder(currentDocument.path) || "Root"
      );
      if (file === false) return;
      let content = vfs.readFile(file);
      newDocument(file, content);
      NpWindow.focus();
    }
    async function saveFile() {
      // make sure the path is not unreasonable
      if (currentDocument.path === "") {
        return saveAs();
      }
      vfs.writeFile(currentDocument.path, text.elm.value);
      currentDocument.dirty = false;
      updateTitle();
    }
    async function saveAs() {
      let result = await FileDialog.saveFile(
        vfs.getParentFolder(currentDocument.path) || "Root"
      );
      if (result === false) return false;
      currentDocument.path = result;
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

    Sidebar.new(wrapper, [
      {
        onclick: async (_) => {
          // clicking the new document button seems buggy, possibly due to dirty check
          const result = await dirtyCheck();
          if (result === false) return;
          newDocument("", "");
        },
        html: Root.Lib.icons.newFile,
      },
      {
        onclick: async (_) => {
          const result = await dirtyCheck();
          if (result === false) return;
          openFile();
        },
        html: Root.Lib.icons.openFolder,
      },
      {
        onclick: async (_) => {
          await saveFile();
        },
        html: Root.Lib.icons.save,
      },
      {
        onclick: async (_) => {
          await saveAs();
        },
        html: Root.Lib.icons.saveAll,
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

    const vfs = await Root.Lib.loadLibrary("VirtualFS");
    vfs.importFS();

    let text = new Root.Lib.html("textarea")
      .class("transparent", "ovh", "fg", "container")
      .text("")
      .attr({ placeholder: "Enter text..." })
      .appendTo(wrapper);

    text.on("input", (e) => {
      currentDocument.dirty = true;
      updateTitle();
    });

    return Root.Lib.setupReturns(onEnd, (m) => {
      if (typeof m === "object" && m.type && m.type === "loadFile" && m.path) {
        newDocument(m.path, vfs.readFile(m.path));
      }
    });
  },
};
