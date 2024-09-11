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
      settings_useMenuBar: "Enable the new menu bar",
      menuFile: "File",
      menuEdit: "Edit",
      menuView: "View",
      menuExtensions: "Extensions",
      menuHelp: "Help",
      manageExtensions: "Manage Extensions",
      openTerminal: "Open Terminal",
      line: "Ln",
      column: "Col",
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
      action_format: "Hübsch Code",
      action_runApp: "App ausführen",
      appHelp_string1:
        "Willkommen in DevEnv, einer Entwicklerumgebung für die Entwicklung von Pluto-Apps.",
      appHelp_string2:
        "Sie können die Seitenleistenelemente verwenden, um in der App unterschiedliche Aktionen auszuführen.\nEs gibt auch eine Reihe nützlicher Tastaturkürzel.",
      appHelp_string3: "Möchten Sie mehr über Tastaturkürzel erfahren?",
      appHelp_string4: "Hier sind die Tastaturkürzel:",
    },
    es_ES: {
      action_zoomOut: "Disminuir el zoom",
      action_zoomIn: "Aumentar el zoom",
      action_format: "Embellece tu código",
      action_runApp: "Ejecutar la aplicación",
      appHelp_string1:
        "Bienvenido a DevEnv, un entorno de desarrollador para desarrollar aplicaciones Pluto.",
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
    tr_TR: {
      action_zoomOut: "Uzaklaştır",
      action_zoomIn: "Yakınlaştır",
      action_format: "Biçimlendir",
      action_runApp: "Uygulamayı Başlat",
      appHelp_string1:
        "DevEnv'e hoş geldiniz. Bu, Pluto'da uygulama geliştirmek için bir geliştirici ortamıdır.",
      appHelp_string2:
        "Uygulamadaki çeşitli eylemleri gerçekleştirmek için yan menüdeki düğmeleri kullanabilirsiniz.\nFarklı klavye kısayolları da mevcuttur.",
      appHelp_string3: "Farklı klavye kısayollarını öğrenmek ister misiniz?",
      appHelp_string4: "İşte klavye kısayolları:",
    },
  },
  ver: "v1.6.2", // Supports minimum Core version of v1.6.2
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
      content:
        '<div class="col fc h-100">DevEnv is loading external libraries, please wait...</div>',
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

    wrapper = DvWindow.window.querySelector(".win-content");

    function loadScript(url, scriptId) {
      return new Promise((resolve) => {
        if (Html.qs('script[id="' + scriptId + '"]')) {
          return resolve(false);
        }

        new Html("script")
          .attr({ id: scriptId, src: url })
          .on("load", () => {
            resolve(true);
          })
          .appendTo("head");
      });
    }

    let counter = new Html("div")
      .text("0 / 5")
      .appendTo(wrapper.querySelector(".col"));

    let count = 0;
    function increaseCount() {
      count++;
      counter.text(`${count} / 5`);
    }

    await loadScript(
      "https://cdnjs.cloudflare.com/ajax/libs/ace/1.22.0/ace.min.js",
      "ace"
    );
    increaseCount();
    await loadScript(
      "https://cdnjs.cloudflare.com/ajax/libs/ace/1.22.0/ext-language_tools.js",
      "ace_language_tools"
    );
    increaseCount();

    // import * as prettier from "https://unpkg.com/prettier@3.2.4/standalone.mjs";
    // import prettierPluginBabel from "https://unpkg.com/prettier@3.2.4/plugins/babel.mjs";
    // import prettierPluginEsTree from "https://unpkg.com/prettier@3.2.4/plugins/estree.mjs";

    const prettier = await import(
      "https://unpkg.com/prettier@3.2.4/standalone.mjs"
    );
    increaseCount();
    const prettierPluginBabel = (
      await import("https://unpkg.com/prettier@3.2.4/plugins/babel.mjs")
    ).default;
    increaseCount();
    const prettierPluginEsTree = (
      await import("https://unpkg.com/prettier@3.2.4/plugins/estree.mjs")
    ).default;
    increaseCount();

    console.log(prettier, prettierPluginBabel, prettierPluginEsTree);

    const DvDefaultSettings = {
      wordWrap: true,
      fontSize: 14,
      templateApp: true,
      prettifyOnSave: true,
      liveAutocomplete: true,
      useMenuBar: false,
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
        // first-time help
        actionHandlers.help();
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
      makeSidebar();
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

    // let extensionsWindow = null;

    const actionHandlers = {
      newDocument: async () => {
        // clicking the new document button seems buggy, possibly due to dirty check
        const result = await dirtyCheck();
        if (result === false) return;
        newDocument("", "");
      },
      openFile: async () => {
        const result = await dirtyCheck();
        if (result === false) return;
        openFile();
      },
      save: async () => {
        await saveFile();
      },
      zoomIn: async () => {
        editorSize += 2;
        textWrapper.style({
          "font-size": editorSize.toString() + "px",
        });
        DvSettings.fontSize = Number(editorSize.toString());
        DvSaveSettings();
      },
      zoomOut: async () => {
        editorSize -= 2;
        textWrapper.style({
          "font-size": editorSize.toString() + "px",
        });
        DvSettings.fontSize = Number(editorSize.toString());
        DvSaveSettings();
      },
      run: async () => {
        if (currentDocument.dirty === true) {
          modal(
            new Html("div").appendMany(
              new Html("span").text(
                "You have unsaved changes. Save your work before running the app."
              )
            ),
            true,
            Root.Lib.getString("error")
          );
          return;
        }

        if (currentDocument.path.endsWith(".app")) {
          Root.Core.startPkg(
            URL.createObjectURL(
              new Blob([editor.getValue()], { type: "application/javascript" })
            ),
            // URL.createObjectURL(["data:text/javascript," + encodeURIComponent(`/*${currentDocument.path}*/` +editor.getValue())], {type:'text/plain'}),
            false
          );
        } else if (currentDocument.path.endsWith(".pml")) {
          let x = await Root.Core.startPkg("apps:PML", true, true);
          x.proc.send({
            type: "loadFile",
            path: currentDocument.path,
          });
        }
      },
      prettify: async () => {
        try {
          if (
            currentDocument.path.endsWith(".js") === false &&
            currentDocument.path.endsWith(".ts") === false &&
            currentDocument.path.endsWith(".app") === false &&
            currentDocument.path !== ""
          ) {
            modal(
              new Html("div").appendMany(
                new Html("span").html(
                  "You currently cannot format a file of this type. Use <code>.js</code>, <code>.ts</code>, or <code>.app</code> file extensions for formatting support."
                )
              ),
              true,
              Root.Lib.getString("error")
            );
            return;
          }
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
              new Html("span").text("An error occurred while formatting:"),
              new Html("pre").text(e.message)
            ),
            true,
            Root.Lib.getString("error")
          );
        }
      },
      help: async () => {
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
      viewDocs: async () => {
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
      settings: async () => {
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
      // manageExtensions: async () => {
      //   if (extensionsWindow !== null) {
      //     return extensionsWindow.focus();
      //   }

      //   extensionsWindow = new Win({
      //     title: Root.Lib.getString("manageExtensions"),
      //     content:
      //       '<div class="row fc h-100">DevEnv is looking for extensions, please wait...</div>',
      //     pid: Root.PID,
      //     width: 400,
      //     height: 360,
      //     onclose: () => {
      //       extensionsWindow = null;
      //     },
      //   });

      //   const extensionsFolderExists = await vfs.whatIs(
      //     "Root/Pluto/config/DvExtensions"
      //   );

      //   if (
      //     extensionsFolderExists === null ||
      //     extensionsFolderExists === "file"
      //   ) {
      //     await vfs.createFolder("Root/Pluto/config/DvExtensions");
      //   }

      //   const fileList = await vfs.list("Root/Pluto/config/DvExtensions");

      //   const extensionList = fileList.filter(
      //     (f) => f.type === "file" && f.item.endsWith(".dvx")
      //   );

      //   if (extensionList.length > 0) {
      //     extensionList.forEach((e) => {
      //       new Html('div').text(e.item);
      //     });
      //   } else {

      //   }
      // },
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

      // somewhat working macOS command key support
      if (e.ctrlKey || e.metaKey) {
        if (
          (e.ctrlKey && e.shiftKey && e.key === "S") ||
          (e.metaKey && e.shiftKey && e.key === "S")
        ) {
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

    wrapper.innerHTML = "";
    wrapper.classList.add("col", "o-h", "h-100");

    let currentDocument = {
      path: "",
      dirty: false,
    };

    const updateTitle = (_) => {
      // Display title
      DvWindow.window.querySelector(".win-titlebar .title").innerText = `${
        currentDocument.dirty === true ? "•" : ""
      } DevEnv - ${
        currentDocument.path === ""
          ? "Untitled"
          : currentDocument.path.split("/").pop()
      }`.trim();

      // Correct language mode
      if (currentDocument.path === "") {
        editor.session.setMode("ace/mode/typescript");
      } else {
        const dots = currentDocument.path.split(".");
        if (dots.length > 0) {
          let currentFileExtension = dots.pop();
          if (currentFileExtension in appFileTypes) {
            editor.session.setMode(
              `ace/mode/${appFileTypes[currentFileExtension]}`
            );
          } else {
            editor.session.setMode("ace/mode/plain_text");
          }
        }
      }
    };
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

    const MenuBar = await Root.Lib.loadComponent("MenuBar");

    const appFileTypes = {
      app: "typescript",
      css: "css",
      html: "html",
      pml: "html",
      xml: "xml",
      js: "typescript",
    };
    const defaultFileType = null;

    // let extensionsList = [];

    function makeSidebar() {
      sidebarWrapper.clear();

      if (DvSettings.useMenuBar === true) {
        wrapper.classList.add("iframe", "col");
        wrapper.classList.remove("with-sidebar", "row");
        MenuBar.new(sidebarWrapper, [
          {
            item: Root.Lib.getString("menuFile"),
            items: [
              {
                icon: Root.Lib.icons.newFile,
                item: Root.Lib.getString("action_newDocument"),
                key: "Alt + N",
                select() {
                  actionHandlers.newDocument();
                },
              },
              {
                icon: Root.Lib.icons.openFolder,
                item: Root.Lib.getString("action_openDocument"),
                key: "Ctrl + O",
                select() {
                  actionHandlers.openFile();
                },
              },
              {
                icon: Root.Lib.icons.save,
                item: Root.Lib.getString("action_save"),
                key: "Ctrl + S",
                select() {
                  actionHandlers.save();
                },
              },
              { type: "separator" },
              {
                icon: Root.Lib.icons.run,
                item: Root.Lib.getString("action_runApp"),
                key: "CTRL + Enter",
                select() {
                  actionHandlers.run();
                },
              },
            ],
          },
          {
            item: Root.Lib.getString("menuEdit"),
            items: [
              {
                icon: Root.Lib.icons.sparkles,
                item: Root.Lib.getString("action_format"),
                key: "Ctrl + Shift + S",
                select() {
                  actionHandlers.prettify();
                },
              },
              {
                icon: Root.Lib.icons.wrench,
                item: Root.Lib.getString("systemApp_Settings"),
                key: "Ctrl + .",
                select() {
                  actionHandlers.settings();
                },
              },
            ],
          },
          {
            item: Root.Lib.getString("menuView"),
            items: [
              {
                icon: Root.Lib.icons.zoomIn,
                item: Root.Lib.getString("action_zoomIn"),
                key: "Ctrl + -",
                select() {
                  actionHandlers.zoomIn();
                },
              },
              {
                icon: Root.Lib.icons.zoomOut,
                item: Root.Lib.getString("action_zoomOut"),
                key: "Ctrl + =",
                select() {
                  actionHandlers.zoomOut();
                },
              },
            ],
          },
          // {
          //   item: Root.Lib.getString("menuExtensions"),
          //   items: [
          //     {
          //       icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="20.1508" cy="14.3551" rx="3.84906" ry="3.81308" fill="white"/><ellipse cx="9.96234" cy="3.81308" rx="3.84906" ry="3.81308" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M0 6.29716C0 5.2968 0.810956 4.48584 1.81132 4.48584H17.8868C18.8872 4.48584 19.6981 5.2968 19.6981 6.29716V22.1885C19.6981 23.1889 18.8872 23.9998 17.8868 23.9998H13.7517C13.7909 23.7815 13.8114 23.5567 13.8114 23.3271C13.8114 21.2212 12.0881 19.514 9.96234 19.514C7.83656 19.514 6.11328 21.2212 6.11328 23.3271C6.11328 23.5567 6.13376 23.7815 6.173 23.9998H1.81132C0.810955 23.9998 0 23.1889 0 22.1885V18.1422C0.14844 18.1594 0.299462 18.1682 0.452572 18.1682C2.57835 18.1682 4.30163 16.4611 4.30163 14.3552C4.30163 12.2493 2.57835 10.5421 0.452572 10.5421C0.299462 10.5421 0.14844 10.5509 0 10.5682V6.29716Z" fill="white"/></svg>`,
          //       item: Root.Lib.getString("manageExtensions"),
          //       select() {
          //         actionHandlers.manageExtensions();
          //       },
          //     },
          //     ...extensionsList,
          //   ],
          // },
          {
            item: Root.Lib.getString("menuHelp"),
            items: [
              {
                icon: Root.Lib.icons.book,
                item: Root.Lib.getString("appDocumentation"),
                select() {
                  actionHandlers.viewDocs();
                },
              },
              {
                icon: Root.Lib.icons.help,
                item: Root.Lib.getString("appHelp"),
                select() {
                  actionHandlers.help();
                },
              },
            ],
          },
        ]);
      } else {
        wrapper.classList.remove("iframe", "col");
        wrapper.classList.add("with-sidebar", "row");
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
        ]);
      }
    }
    makeSidebar();

    let text = new Root.Lib.html("div").class("fg", "col").appendTo(wrapper);

    let textWrapper = new Root.Lib.html("div")
      .style({ height: "100%" })
      .appendTo(text);

    var editor = window.ace.edit(textWrapper.elm);
    // Custom theme
    editor.setOptions({
      enableBasicAutocompletion: true,
    });
    editor.setShowPrintMargin(false);
    editor.session.setTabSize(2);
    editor.session.setUseSoftTabs(true);
    editor.session.setUseWrapMode(true);
    editor.session.setMode("ace/mode/typescript");

    const editorRef = text.qs(".ace_editor");

    if (editorRef) {
      editorRef.classOn("fg", "row");
    }

    let statusBar = new Root.Lib.html("div")
      .styleJs({
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        textAlign: "right",
        background: "var(--unfocused)",
        flexShrink: 0,
        minHeight: "1.4rem",
        padding: "0.25rem 1rem",
        gap: "1rem",
      })
      .appendTo(text);

    let statusBarRunAppButton = new Root.Lib.html("button")
      .class("row", "ac", "gap-small", "transparent")
      .style({
        margin: "0 auto 0 0",
        padding: "0.2em 0.75em",
      })
      .appendMany(
        new Root.Lib.html("i")
          .class("icon")
          .style({ width: "16px", height: "16px" })
          .html(Root.Lib.icons.run),
        new Root.Lib.html("span").text(Root.Lib.getString("action_runApp"))
      )
      .on("click", () => {
        actionHandlers.run();
      })
      .appendTo(statusBar);

    let statusBarLineColNumber = new Root.Lib.html("span")
        .text("Ln 0")
        .appendTo(statusBar),
      statusBarTerminalOption = new Root.Lib.html("button")
        .class("row", "ac", "gap-small", "transparent")
        .style({
          margin: "0",
          padding: "0.2em 0.75em",
        })
        .appendMany(
          new Root.Lib.html("span")
            .class("icon")
            .style({ width: "16px", height: "16px" })
            .html(Root.Lib.icons.terminal),
          new Root.Lib.html("span").text(
            Root.Lib.getString("systemApp_Terminal")
          )
        )
        .on("click", () => {
          Root.Core.startPkg("apps:Terminal");
        })
        .appendTo(statusBar);

    await DvReadSettings();

    function updateStatusBar() {
      let cursor = editor.selection.getCursor();
      let selectionRange = editor.getSelectedText().length;

      let text = `${Root.Lib.getString("line")} ${
        cursor.row + 1
      }, ${Root.Lib.getString("column")} ${cursor.column + 1}`;

      if (selectionRange > 0) {
        text += `&nbsp;(${selectionRange} selected)`;
      }

      statusBarLineColNumber.html(text);
    }

    text.on("input", (e) => {
      currentDocument.dirty = true;
      updateTitle();
    });

    editor.session.selection.on("changeCursor", (e) => {
      updateStatusBar();
    });
    editor.session.selection.on("changeSelection", (e) => {
      updateStatusBar();
    });

    let defaultText = "";

    if (DvSettings.templateApp === true) {
      defaultText = `export default {
  name: "Example",
  description: "Example app",
  ver: "v1.6.2", // Supports minimum Core version of v1.6.2
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
          statusBarRunAppButton.elm.querySelector("span").textContent =
            Root.Lib.getString("action_runApp");
        }
      }
      if (typeof m === "object" && m.type && m.type === "loadFile" && m.path) {
        newDocument(m.path, await vfs.readFile(m.path));
      }
    });
  },
};
