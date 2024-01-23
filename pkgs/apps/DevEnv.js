import * as prettier from "https://unpkg.com/prettier@3.2.4/standalone.mjs";
import prettierPluginBabel from "https://unpkg.com/prettier@3.2.4/plugins/babel.mjs";
import prettierPluginEsTree from "https://unpkg.com/prettier@3.2.4/plugins/estree.mjs";

export default {
  name: "DevEnv",
  description: "Develop applications for Pluto smoothly in your browser.",
  privileges: [
    {
      privilege: "startPkg",
      description: "Run applications",
    },
  ],
  strings: {
    en_US: {
      action_zoomOut: "Zoom Out",
      action_zoomIn: "Zoom In",
      action_format: "Prettify",
      action_runApp: "Run App",
      action_aceSettings: "Ace Editor Settings",
      action_showAutocomplete: "Show Autocomplete",
      appHelp_string1:
        "Welcome to DevEnv. This is a developer environment for developing Pluto apps.",
      appHelp_string2:
        "You can use the buttons on the sidebar to perform different actions in the app.\nThere is also a set of keyboard shortcuts.",
      appHelp_string3: "Would you like to learn about the keyboard shortcuts?",
      appHelp_string4: "Here are the keyboard shortcuts:",
      settings_wordWrap: "Word wrap",
      settings_fontSize: "Font size",
      settings_templateApp: "Startup with example app",
      settings_prettifyOnSave: "Format code on save",
      settings_liveAutocomplete: "Autocomplete while typing",
    },
    en_GB: {
      action_zoomOut: "Zoom Out",
      action_zoomIn: "Zoom In",
      action_format: "Format Code",
      action_runApp: "Run App",
      appHelp_string1:
        "Welcome to DevEnv, a developer environment for developing Pluto apps.",
      appHelp_string2:
        "You can use the sidebar items to perform different actions in the app.\nThere is also a useful set of keyboard shortcuts.",
      appHelp_string3: "Would you like to learn about the keyboard shortcuts?",
      appHelp_string4: "Here are the keyboard shortcuts:",
    },
    de_DE: {
      action_zoomOut: "Rauszoomen",
      action_zoomIn: "Hineinzoomen",
      action_format: "Verschönern Sie Ihren Code",
      action_runApp: "App ausführen",
      appHelp_string1:
        "Willkommen in DevEnv, einer Entwicklerumgebung für die Entwicklung von Pluto-Apps.",
      appHelp_string2:
        "Sie können die Seitenleistenelemente verwenden, um in der App unterschiedliche Aktionen auszuführen.\nEs gibt auch eine Reihe nützlicher Tastaturkürzel.",
      appHelp_string3: "Möchten Sie mehr über Tastaturkürzel erfahren?",
      appHelp_string4: "Hier sind die Tastaturverknüpfungen:",
    },
    es_ES: {
      action_zoomOut: "Disminuir el zoom",
      action_zoomIn: "Aumentar el zoom",
      action_format: "Embellece tu código",
      action_runApp: "Ejecutar la aplicación",
      appHelp_string1:
        "Bienvenido a DevPEnv, un entorno de desarrollador para desarrollar aplicaciones Pluto.",
      appHelp_string2:
        "Puede usar los elementos de la barra lateral para realizar diferentes acciones en la aplicación.\nTambién hay un útil conjunto de atajos de teclado.",
      appHelp_string3: "¿Le gustaría aprender sobre los atajos de teclado?",
      appHelp_string4: "Aquí están los atajos de teclado:",
    },
    pt_BR: {
      action_zoomOut: "Reduzir Zoom",
      action_zoomIn: "Mais Zoom",
      action_format: "Embelezar seu código",
      action_runApp: "Executar aplicativo",
      appHelp_string1:
        "Bem-vindo ao DevEnv, um ambiente de desenvolvedor para o desenvolvimento de aplicativos Pluto.",
      appHelp_string2:
        "Você pode usar os itens da barra lateral para executar ações diferentes no aplicativo.\nHá também um conjunto útil de atalhos de teclado.",
      appHelp_string3: "Você gostaria de aprender sobre os atalhos do teclado?",
      appHelp_string4: "Aqui estão os atalhos do teclado:",
    },
    fil_PH: {
      action_zoomOut: "Liitan",
      action_zoomIn: "Lakihan",
      action_format: "Pagandahin",
      action_runApp: "Buksan ang App",
      appHelp_string1:
        "Maligayang pagdating sa DevEnv. Ito ay isang developer environment para gumawa ng aplikasyon sa Pluto.",
      appHelp_string2:
        "Pwede mong gamitin ang mga buttons sa sidebar para mag-perform ng iba't ibang mga aksyon sa aplikasyon.\nMayroon itong iba't ibang keyboard shortcuts.",
      appHelp_string3:
        "Gusto mo bang matuto ng mga iba't ibang keyboard shortcuts?",
      appHelp_string4: "Ito ay mga keyboard shortcuts:",
    },
  },
  ver: 1, // Compatible with core v1
  type: "process",
  exec: async function (Root) {
    let wrapper; // Lib.html | undefined
    let DvWindow;
    let editorSize = 14;

    Root.Lib.setOnEnd((_) => {
      DvWindow.close();
      // Unregister event listener
      window.removeEventListener("keydown", keyBindHandler);
    });

    const Win = (await Root.Lib.loadLibrary("WindowSystem")).win;
    const FileDialog = await Root.Lib.loadLibrary("FileDialog");
    const Sidebar = await Root.Lib.loadComponent("Sidebar");
    const vfs = await Root.Lib.loadLibrary("VirtualFS");
    await vfs.importFS();

    const Html = Root.Lib.html;

    DvWindow = new Win({
      title: Root.Lib.getString("systemApp_DevEnv"),
      content: "",
      width: 540,
      height: 420,
      pid: Root.PID,
      onclose: async () => {
        if (currentDocument.dirty === true) {
          let result = await Root.Modal.prompt(
            "Warning",
            "You have unsaved changes, are you sure you want to exit?",
            DvWindow.window
          );
          if (result !== true) {
            return false;
          }
        }
        Root.Lib.onEnd();
      },
    });

    const DvDefaultSettings = {
      wordWrap: true,
      fontSize: 14,
      templateApp: true,
      prettifyOnSave: true,
      liveAutocomplete: true,
    };

    let DvSettings = DvDefaultSettings;

    async function DvSaveSettings() {
      await vfs.writeFile(
        "Registry/DvSettings.json",
        JSON.stringify(DvSettings)
      );
      await DvReadSettings();
    }
    async function DvReadSettings() {
      if ((await vfs.exists("Registry/DvSettings.json")) !== false) {
        DvSettings = Object.assign(
          DvDefaultSettings,
          JSON.parse(await vfs.readFile("Registry/DvSettings.json"))
        );
      } else {
        await DvSaveSettings();
      }

      if (DvSettings["wordWrap"] !== undefined) {
        if (typeof DvSettings["wordWrap"] === "boolean") {
          editor.session.setUseWrapMode(DvSettings["wordWrap"]);
        }
      }
      if (DvSettings["fontSize"] !== undefined) {
        if (typeof DvSettings["fontSize"] === "number") {
          textWrapper.style({
            "font-size": DvSettings["fontSize"] + "px",
          });
        }
      }

      if (DvSettings["liveAutocomplete"] !== undefined) {
        if (typeof DvSettings["liveAutocomplete"] === "boolean") {
          editor.setOptions({
            enableLiveAutocompletion: DvSettings["liveAutocomplete"],
          });
        }
      }
    }

    function modal(
      info,
      isHtml = false,
      title = Root.Lib.getString("appHelp")
    ) {
      return new Promise((res, _rej) => {
        Root.Modal.modal(title, info, wrapper, isHtml, {
          text: Root.Lib.getString("ok"),
          callback: (_) => {
            res(true);
          },
        });
      });
    }

    const actionHandlers = {
      newDocument: async (_) => {
        // clicking the new document button seems buggy, possibly due to dirty check
        const result = await dirtyCheck();
        if (result === false) return;
        newDocument("", "");
      },
      openFile: async (_) => {
        const result = await dirtyCheck();
        if (result === false) return;
        openFile();
      },
      save: async (_) => {
        await saveFile();
      },
      zoomIn: async (_) => {
        editorSize += 2;
        textWrapper.style({
          "font-size": editorSize.toString() + "px",
        });
        DvSettings.fontSize = Number(editorSize.toString());
        DvSaveSettings();
      },
      zoomOut: async (_) => {
        editorSize -= 2;
        textWrapper.style({
          "font-size": editorSize.toString() + "px",
        });
        DvSettings.fontSize = Number(editorSize.toString());
        DvSaveSettings();
      },
      run: (_) => {
        Root.Core.startPkg(
          URL.createObjectURL(
            new Blob([editor.getValue()], { type: "application/javascript" })
          ),
          // URL.createObjectURL(["data:text/javascript," + encodeURIComponent(`/*${currentDocument.path}*/` +editor.getValue())], {type:'text/plain'}),
          false
        );
      },
      prettify: async (_) => {
        try {
          const formatted = await prettier.format(editor.getValue(), {
            parser: "babel",
            plugins: [prettierPluginBabel, prettierPluginEsTree],
          });

          editor.setValue(formatted, 1);
          currentDocument.dirty = true;
          updateTitle();
        } catch (e) {
          modal(
            new Html("div").appendMany(
              new Html("span").text("Something went wrong when formatting"),
              new Html("pre").text(e.message)
            ),
            true,
            Root.Lib.getString("error")
          );
        }
      },
      help: async (_) => {
        function modal(info, isHtml = false) {
          return new Promise((res, _rej) => {
            Root.Modal.modal(
              Root.Lib.getString("appHelp"),
              info,
              wrapper,
              isHtml,
              {
                text: Root.Lib.getString("ok"),
                callback: (_) => {
                  res(true);
                },
              }
            );
          });
        }

        if (
          (await Root.Modal.prompt(
            Root.Lib.getString("appHelp"),
            Root.Lib.getString("appHelp_intro"),
            wrapper
          )) === false
        ) {
          return;
        }

        await modal(Root.Lib.getString("appHelp_string1"));
        await modal(Root.Lib.getString("appHelp_string2"));

        if (
          (await Root.Modal.prompt(
            Root.Lib.getString("appHelp"),
            Root.Lib.getString("appHelp_string3"),
            wrapper
          )) === true
        ) {
          await modal(
            new Root.Lib.html("div").html(/*html*/ `${Root.Lib.getString(
              "appHelp_string4"
            )}
<table>
  <thead>
    <tr>
      <th>Key</th>
      <th>Action</th>
    </tr>
  </thead>
  <tbody style="margin-top:0.5em">
    <tr>
      <td>ALT + N</td>
      <td>${Root.Lib.getString("action_newDocument")}</td>
    </tr>
    <tr>
      <td>CTRL + O</td>
      <td>${Root.Lib.getString("action_openDocument")}</td>
    </tr>
    <tr>
      <td>CTRL + S</td>
      <td>${Root.Lib.getString("action_save")}</td>
    </tr>
    <tr>
      <td>CTRL + -</td>
      <td>${Root.Lib.getString("action_zoomOut")}</td>
    </tr>
    <tr>
      <td>CTRL + =</td>
      <td>${Root.Lib.getString("action_zoomIn")}</td>
    </tr>
    <tr>
      <td>CTRL + SHIFT + S</td>
      <td>${Root.Lib.getString("action_format")}</td>
    </tr>
    <tr>
      <td>CTRL + Enter</td>
      <td>${Root.Lib.getString("action_runApp")}</td>
    </tr>
    <tr>
      <td>CTRL + ,</td>
      <td>${Root.Lib.getString("action_aceSettings")}</td>
    </tr>
    <tr>
      <td>CTRL + .</td>
      <td>${Root.Lib.getString("systemApp_Settings")}</td>
    </tr>
    <tr>
      <td>CTRL + Space</td>
      <td>${Root.Lib.getString("action_showAutocomplete")}</td>
    </tr>
  </tbody>
</table>
`),
            true
          );
        }

        await modal(Root.Lib.getString("thankYou"));
      },
      viewDocs: async (_) => {
        const docsWindow = new Win({
          title: Root.Lib.getString("Documentation"),
          content: '<iframe src="./docs/README.html">',
          pid: Root.PID,
          width: 400,
          height: 360,
        });

        Root.Lib.html
          .from(docsWindow.window.querySelector(".win-content"))
          .classOn("iframe")
          .style({ padding: "0px" });
      },
      settings: async (_) => {
        const settingsInfo = Object.keys(DvSettings).map((key, num) => {
          switch (typeof DvSettings[key]) {
            case "boolean":
              return new Html("span").appendMany(
                new Html("input")
                  .attr({
                    type: "checkbox",
                    id: Root.PID + key + num,
                    checked: DvSettings[key] === true ? "true" : undefined,
                  })
                  .on("input", (e) => {
                    DvSettings[key] = e.target.checked;

                    DvSaveSettings();
                  }),
                new Html("label")
                  .attr({
                    for: Root.PID + key + num,
                  })
                  .text(Root.Lib.getString(`settings_${key}`))
              );
            case "string":
              return new Html("span").appendMany(
                new Html("label")
                  .attr({
                    for: Root.PID + key + num,
                  })
                  .text(Root.Lib.getString(`settings_${key}`)),
                new Html("input")
                  .attr({
                    type: "text",
                    id: Root.PID + key + num,
                    value:
                      DvSettings[key] !== undefined
                        ? DvSettings[key]
                        : undefined,
                  })
                  .on("input", (e) => {
                    DvSettings[key] = e.target.value;

                    DvSaveSettings();
                  })
              );
            case "number":
              return new Html("span").appendMany(
                new Html("label")
                  .attr({
                    for: Root.PID + key + num,
                  })
                  .text(Root.Lib.getString(`settings_${key}`)),
                new Html("input")
                  .attr({
                    type: "number",
                    id: Root.PID + key + num,
                    value:
                      DvSettings[key] !== undefined
                        ? DvSettings[key]
                        : undefined,
                  })
                  .style({
                    "max-width": "4rem",
                  })
                  .on("input", (e) => {
                    let n = parseInt(e.target.value);
                    if (n < 0) {
                      n = 0;
                    }

                    DvSettings[key] = n;

                    DvSaveSettings();
                  })
              );
            case "bigint":
            case "symbol":
            case "undefined":
            case "object":
            case "function":
              return new Html("span").text(
                Root.Lib.getString(`settings_${key}`)
              );
          }
        });

        modal(
          new Html("div").class("col", "gap").appendMany(...settingsInfo),
          true,
          Root.Lib.getString("systemApp_Settings")
        );
      },
    };

    /**
     * Keyboard shortcut handler for DevEnv.
     * @param {KeyboardEvent} e Handle keyboard event.
     */
    async function keyBindHandler(e) {
      const focusState = DvWindow.window.classList.contains("focus");

      if (!focusState) return;
      if (e.repeat) return;

      if (e.altKey) {
        switch (e.key.toLowerCase()) {
          case "n":
            // Alt + N = New document (as CTRL + N can't be bound)
            e.preventDefault();
            actionHandlers.newDocument();
            break;
        }
      }

      if (e.ctrlKey) {
        if (e.ctrlKey && e.shiftKey && e.key === "S") {
          // Ctrl + Shift + S
          e.preventDefault();
          actionHandlers.prettify();
          return;
        }

        switch (e.key.toLowerCase()) {
          case "o":
            // Ctrl + O = Open
            e.preventDefault();
            actionHandlers.openFile();
            break;
          case "s":
            // Ctrl + S = Save
            e.preventDefault();
            if (DvSettings.prettifyOnSave === true) {
              await actionHandlers.prettify();
            }
            actionHandlers.save();
            break;
          case "enter":
            // Ctrl + Enter = Run
            e.preventDefault();
            actionHandlers.run();
            break;
          case "-":
            // Ctrl + - = Zoom Out
            e.preventDefault();
            actionHandlers.zoomOut();
            break;
          case "=":
            // Ctrl + = Zoom In
            e.preventDefault();
            actionHandlers.zoomIn();
            break;
          case ".":
            // Ctrl + . = Settings
            e.preventDefault();
            actionHandlers.settings();
            break;
        }
      }
    }

    window.addEventListener("keydown", keyBindHandler);

    wrapper = DvWindow.window.querySelector(".win-content");

    wrapper.classList.add("row", "o-h", "h-100", "with-sidebar");

    let currentDocument = {
      path: "",
      dirty: false,
    };

    const updateTitle = (_) =>
      (DvWindow.window.querySelector(".win-titlebar .title").innerText = `${
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
      DvWindow.focus();
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
          DvWindow.window
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
          onclick: actionHandlers.newDocument,
          html: Root.Lib.icons.newFile,
          title: Root.Lib.getString("action_newDocument"),
        },
        {
          onclick: actionHandlers.openFile,
          html: Root.Lib.icons.openFolder,
          title: Root.Lib.getString("action_openDocument"),
        },
        {
          onclick: actionHandlers.save,
          html: Root.Lib.icons.save,
          title: Root.Lib.getString("action_save"),
        },
        {
          onclick: actionHandlers.zoomIn,
          html: Root.Lib.icons.zoomIn,
          title: Root.Lib.getString("action_zoomIn"),
        },
        {
          onclick: actionHandlers.zoomOut,
          html: Root.Lib.icons.zoomOut,
          title: Root.Lib.getString("action_zoomOut"),
        },
        {
          onclick: actionHandlers.prettify,
          html: Root.Lib.icons.sparkles,
          title: Root.Lib.getString("action_format"),
        },
        {
          onclick: actionHandlers.help,
          html: Root.Lib.icons.help,
          title: Root.Lib.getString("appHelp"),
        },
        {
          onclick: actionHandlers.viewDocs,
          html: Root.Lib.icons.book,
          title: Root.Lib.getString("appDocumentation"),
        },
        {
          onclick: actionHandlers.settings,
          html: Root.Lib.icons.wrench,
          title: Root.Lib.getString("systemApp_Settings"),
        },
        {
          style: {
            "margin-top": "auto",
            "margin-left": "auto",
          },
          onclick: actionHandlers.run,
          html: Root.Lib.icons.run,
          title: Root.Lib.getString("action_runApp"),
        },
      ]);
    }
    makeSidebar();

    let text = new Root.Lib.html("div").class("fg").appendTo(wrapper);

    let textWrapper = new Root.Lib.html("div")
      .style({ height: "100%" })
      .appendTo(text);

    var editor = ace.edit(textWrapper.elm);
    // Custom theme
    editor.setOptions({
      enableBasicAutocompletion: true,
    });
    editor.setShowPrintMargin(false);
    editor.session.setTabSize(2);
    editor.session.setUseSoftTabs(true);
    editor.session.setUseWrapMode(true);
    editor.session.setMode("ace/mode/typescript");

    await DvReadSettings();

    text.on("input", (e) => {
      currentDocument.dirty = true;
      updateTitle();
    });

    let defaultText = "";

    if (DvSettings.templateApp === true) {
      defaultText = `export default {
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
};`;
    }

    newDocument("", defaultText);

    return Root.Lib.setupReturns(async (m) => {
      if (m && m.type) {
        if (m.type === "refresh") {
          Root.Lib.getString = m.data;
          DvWindow.setTitle(Root.Lib.getString("systemApp_DevEnv"));
          Root.Lib.updateProcTitle(Root.Lib.getString("systemApp_DevEnv"));
          makeSidebar();
        }
      }
      if (typeof m === "object" && m.type && m.type === "loadFile" && m.path) {
        newDocument(m.path, await vfs.readFile(m.path));
      }
    });
  },
};
