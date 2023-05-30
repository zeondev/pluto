export default {
  name: "DevEnv",
  description: "Develop applications for Pluto smoothly in your browser.",
  privileges: [
    {
      privilege: "startPkg",
      description: "Run applications",
    },
  ],
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

    NpWindow = new Win({
      title: "DevEnv",
      content: "",
      width: 340,
      height: 220,
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
        let result = await FileDialog.saveFile(
          vfs.getParentFolder(currentDocument.path) || "Root"
        );
        if (result === false) return false;
        currentDocument.path = result;
      }
      vfs.writeFile(currentDocument.path, editor.getValue());
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
        style: {
          "margin-top": "auto",
        },
        onclick: (_) => {
          Root.Core.startPkg(
            "data:text/javascript;base64," + btoa(editor.getValue()),
            false
          );
        },
        html: Root.Lib.icons.run,
      },
    ]);

    const vfs = await Root.Lib.loadLibrary("VirtualFS");
    vfs.importFS();

    let text = new Root.Lib.html("div").class("fg").appendTo(wrapper);

    let textWrapper = new Root.Lib.html("div")
      .style({ height: "100%" })
      .appendTo(text);

    var editor = ace.edit(textWrapper.elm);
    // Custom theme
    editor.setShowPrintMargin(false);
    editor.session.setMode("ace/mode/typescript");

    text.on("input", (e) => {
      currentDocument.dirty = true;
      updateTitle();
    });

    newDocument(
      "",
      `export default {
  name: "Example",
  description: "Example app",
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

    // Create a window
    MyWindow = new Win({
      title: "Example App",
      content: "Hello",
      onclose: () => {
        onEnd();
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
        onEnd();
      });

    return Root.Lib.setupReturns(onEnd, (m) => {
      console.log("Example recieved message: " + m);
    });
  },
};
`
    );

    return Root.Lib.setupReturns(onEnd, (m) => {
      if (typeof m === "object" && m.type && m.type === "loadFile" && m.path) {
        newDocument(m.path, vfs.readFile(m.path));
      }
    });
  },
};
