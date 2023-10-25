export default {
  name: "DevEnv",
  description: "Develop applications for Pluto smoothly in your browser.",
  privileges: [
    {
      privilege: "startPkg",
      description: "Run applications",
    },
  ],
  ver: 1, // Compatible with core v1
  type: "process",
  exec: async function (Root) {
    let wrapper; // Lib.html | undefined
    let NpWindow;
    let editorSize = 14;

    Root.Lib.setOnEnd((_) => NpWindow.close());

    const Win = (await Root.Lib.loadLibrary("WindowSystem")).win;
    const FileDialog = await Root.Lib.loadLibrary("FileDialog");
    const Sidebar = await Root.Lib.loadComponent("Sidebar");

    NpWindow = new Win({
      title: "DevEnv",
      content: "",
      width: 540,
      height: 420,
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
      } DevEnv - ${
        currentDocument.path === ""
          ? "Untitled"
          : currentDocument.path.split("/").pop()
      }`.trim());

    function newDocument(path, content) {
      currentDocument.path = path;
      currentDocument.dirty = false;
      updateTitle();
      // just to be sure (instead of using .text() as that was sometimes not working)
      editor.setValue(content, -1);
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
        let result = await FileDialog.saveFile(
          (await vfs.getParentFolder(currentDocument.path)) || "Root"
        );
        if (result === false) return false;
        currentDocument.path = result;
      }
      await vfs.writeFile(currentDocument.path, editor.getValue());
      currentDocument.dirty = false;
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
          editorSize += 2;
          textWrapper.style({
            "font-size": editorSize.toString() + "px",
          });
        },
        html: Root.Lib.icons.zoomIn,
      },
      {
        onclick: async (_) => {
          editorSize -= 2;
          textWrapper.style({
            "font-size": editorSize.toString() + "px",
          });
        },
        html: Root.Lib.icons.zoomOut,
      },
      {
        style: {
          "margin-top": "auto",
        },
        onclick: (_) => {
          Root.Core.startPkg(
            URL.createObjectURL(new Blob([editor.getValue()], {type: 'application/javascript'})),
            // URL.createObjectURL(["data:text/javascript," + encodeURIComponent(`/*${currentDocument.path}*/` +editor.getValue())], {type:'text/plain'}),
            false
          );
        },
        html: Root.Lib.icons.run,
      },
    ]);

    const vfs = await Root.Lib.loadLibrary("VirtualFS");
    await vfs.importFS();

    let text = new Root.Lib.html("div").class("fg").appendTo(wrapper);

    let textWrapper = new Root.Lib.html("div")
      .style({ height: "100%" })
      .appendTo(text);

    var editor = ace.edit(textWrapper.elm);
    // Custom theme
    editor.setShowPrintMargin(false);
    editor.session.setTabSize(2);
    editor.session.setUseSoftTabs(true);
    editor.session.setUseWrapMode(true);
    editor.session.setMode("ace/mode/typescript");

    text.on("input", (e) => {
      currentDocument.dirty = true;
      updateTitle();
    });

    newDocument(
      "",
      /*js*/ `export default {
  name: "Example",
  description: "Example app",
  ver: 1, // Compatible with core v1
  type: "process",
  exec: async function (Root) {
    let wrapper; // Lib.html | undefined
    let MyWindow;

    console.log("Hello from example package", Root.Lib);

    Root.Lib.setOnEnd(_ => MyWindow.close());

    const Win = (await Root.Lib.loadLibrary("WindowSystem")).win;

    // Create a window
    MyWindow = new Win({
      title: "Example App",
      content: "Hello",
      onclose: () => {
        Root.Lib.onEnd();
      },
    });

    wrapper = MyWindow.window.querySelector(".win-content");

    /* Heading */
    new Root.Lib.html("h1").text("Example App").appendTo(wrapper);
    /* Paragraph */
    new Root.Lib.html("p")
      .html("This is an example app!")
      .appendTo(wrapper);
    /* Button with modal */
    new Root.Lib.html("button")
      .text("Hello, world")
      .appendTo(wrapper)
      .on("click", (e) => {
        Root.Modal.alert(
          \`Hello!\nCursor Position: \${e.clientX}, \${e.clientY}\nMy PID: \${Root.PID}\nMy Token: \${Root.Token}\`
        );
      });
    /* Spawn an app */ 
    new Root.Lib.html("button")
      .text("Spawn another")
      .appendTo(wrapper)
      .on("click", (e) => {
        Root.Lib.launch("apps:Example", wrapper);
      });
    /* Example close button */
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
`
    );

    return Root.Lib.setupReturns(async (m) => {
      if (typeof m === "object" && m.type && m.type === "loadFile" && m.path) {
        newDocument(m.path, await vfs.readFile(m.path));
      }
    });
  },
};
