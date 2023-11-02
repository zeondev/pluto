export default {
  name: "Welcome",
  description: "Sets up your system.",
  ver: 1, // Compatible with core v1
  type: "process",
  privileges: [
    {
      privilege: "setLanguage",
      description: "Allow the user to configure the system language",
    },
  ],
  strings: {
    en_US: {
      welcome_window_title: "Welcome",
      welcome_page1_header: "Welcome to Pluto",
      welcome_page1_body:
        "Hey there! Welcome to Pluto, a new 'desktop environment' for the web.\n\nPress Next to enter setup.",
      welcome_page2_header: "Set your language",
      welcome_page2_body: "The current language is English (US).",
      welcome_page2_language_en_US: "English (US)",
      welcome_page2_language_en_GB: "English (UK)",
      welcome_page2_language_de_DE: "German (Germany)",
      welcome_page2_language_es_ES: "Spanish (Spain)",
      welcome_page2_language_pt_BR: "Portuguese (Brazil)",
      welcome_page3_header: "Personalize",
      welcome_page3_body: "Select your favorite theme.",
      welcome_page4_header: "You have now set up your system!",
      welcome_page4_body:
        "Press the Finish button to quit the app and save your settings.",
    },
    en_GB: {
      welcome_window_title: "Welcome",
      welcome_page1_header: "Welcome to Pluto",
      welcome_page1_body:
        "Hello! Welcome to Pluto, a new 'desktop environment' for the web.\n\nPress the Next button to enter the setup process.",
      welcome_page2_header: "Set your language",
      welcome_page2_body: "The current language is English (UK).",
      welcome_page3_header: "Personalise",
      welcome_page3_body: "Select your favourite theme.",
      welcome_page4_header: "You have now set up your system!",
      welcome_page4_body:
        "Press the Finish button to quit the app and save your settings.",
    },
    de_DE: {
      welcome_window_title: "Willkommen",
      welcome_page1_header: "Willkommen bei Pluto",
      welcome_page1_body:
        'Hallo! Wilkommen bei Pluto, einem neuem Desktop-environment für das Web.\n\nDrücken Sie "Nächste Seite" um die Einstellungen zu öffnen',
      welcome_page2_header: "Legen Sie eine Sprache fest",
      welcome_page2_body: "Die aktuelle Sprache ist deutsch.",
      welcome_page3_header: "Personifizieren",
      welcome_page3_body: "Wählen Sie Ihr Lieblingsthema.",
      welcome_page4_header: "Sie haben jetzt Ihr System eingerichtet!",
      welcome_page4_body:
        'Drücken Sie "Fertig", um die App zu beenden und Ihre Einstellungen zu speichern.',
    },
    es_ES: {
      welcome_window_title: "Bienvenida",
      welcome_page1_header: "Bienvenido a Plutón",
      welcome_page1_body:
        "¡Hola! Bienvenido a Plutón, un nuevo 'entorno de escritorio' para la web.\n\nPresione Siguiente para ingresar la configuración.",
      welcome_page2_header: "Establece tu idioma",
      welcome_page2_body: "El idioma actual es el Español (España).",
      welcome_page3_header: "Personalizar",
      welcome_page3_body: "Seleccione su tema favorito.",
      welcome_page4_header: "¡Ahora has configurado tu sistema!",
      welcome_page4_body: 'Presione "Completa" para dejar la aplicación.',
    },
    pt_BR: {
      welcome_window_title: "Bem-vindo",
      welcome_page1_header: "Bem-vindo a Plutão",
      welcome_page1_body:
        "Ola! Bem-vindo a Plutão, um novo 'ambiente de desktop' para a web.\n\nPressione o próximo para entrar na instalação.",
      welcome_page2_header: "Defina seu idioma",
      welcome_page2_body: "O idioma atual é Português (Brasil).",
      welcome_page3_header: "Personalizar",
      welcome_page3_body: "Selecione seu tema favorito.",
      welcome_page4_header: "Agora você configurou seu sistema!",
      welcome_page4_body:
        'Pressione "Completa" para sair do aplicativo "Ben-vindo".',
    },
  },
  exec: async function (Root) {
    let wrapper; // Lib.html | undefined
    let MyWindow;

    const Win = (await Root.Lib.loadLibrary("WindowSystem")).win;

    let width = 600;
    let height = 350;
    let left = (window.innerWidth - 600) / 2 + "px";
    let top = (window.innerHeight - height) / 2 + "px";

    if (window.innerWidth <= 600) {
      width = window.innerWidth - 2;
      left = 0;
    }

    function calculateCentre(width, height) {
      let left = (window.innerWidth - 600) / 2 + "px";
      let top = (window.innerHeight - height) / 2 + "px";

      if (window.innerWidth <= 600) {
        width = window.innerWidth - 2;
        left = 0;
      }

      return { left, top };
    }

    MyWindow = new Win({
      title: Root.Lib.getString("welcome_window_title"),
      content: "",
      pid: Root.PID,
      width,
      height,
      left,
      top,
      // resizable: false,
      onclose: () => {
        Root.Lib.onEnd();
      },
    });

    Root.Lib.setOnEnd((_) => MyWindow.close());

    wrapper = MyWindow.window.querySelector(".win-content");

    wrapper.classList.add("col", "o-h");

    const Html = Root.Lib.html;

    // /* Banner */ new Html("img")
    //   .attr({
    //     src: "./assets/banner.svg",
    //     draggable: false,
    //   })
    //   .style({
    //     position: "relative",
    //     inset: "-10px",
    //     "min-width": "400px",
    //     width: "calc(100% + 20px)",
    //     "max-height": "400px",
    //   })
    //   .appendTo(wrapper);

    await fetch("./assets/banner.svg")
      .then((response) => response.text())
      .then((svgText) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgText, "image/svg+xml");
        const svg = doc.documentElement;
        // Change the color of specific elements

        let c1 = [...svg.querySelector("#paint0_radial_901_305").children];
        c1.forEach((element) => {
          element.setAttribute("stop-color", "var(--neutral)");
        });
        let c2 = [...svg.querySelector("#paint1_radial_901_305").children];
        c2.forEach((element) => {
          element.setAttribute("stop-color", "var(--label)");
        });
        svg.querySelector("#idt").setAttribute("fill", "var(--label-light)");

        // Convert the modified SVG back to a string
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svg);

        // Create a new <div> element and set its innerHTML to the modified SVG string
        const div = document.createElement("div");
        div.innerHTML = svgString;

        div.style.position = "relative";
        div.style.inset = "-10px";
        div.style.minWidth = "400px";
        div.style.width = "calc(100% + 20px)";
        div.style.maxHeight = "400px";

        // Append the <div> to the desired element in the DOM
        wrapper.appendChild(div);
      })
      .catch((err) => {
        console.error("Error loading SVG file:", err);
      });

    const container = new Html("div")
      .class("fg", "ovh", "col")
      .appendTo(wrapper);

    const vfs = await Root.Lib.loadLibrary("VirtualFS");
    const ThemeLib = await Root.Lib.loadLibrary("ThemeLib");
    const SelectList = await Root.Lib.loadComponent("SelectList");

    let currentPage = "p1",
      currentLanguage = "en_US",
      currentTheme = "dark";

    let pages = {
      clear(pageName) {
        currentPage = pageName;
        container.elm.innerHTML = "";

        let width, height;

        if (pageName === "p2") {
          width = 600;
          height = 450;
        } else {
          width = 600;
          height = 360;
        }

        let { top, left } = calculateCentre(width, height);

        MyWindow.window.style.width = width + "px";
        MyWindow.window.style.height = height + "px";
        MyWindow.window.style.top = top;
        MyWindow.window.style.left = left;
      },
      p1() {
        this.clear("p1");

        new Html("div")
          .class("col", "fg")
          .appendMany(
            new Root.Lib.html("h1")
              .text(Root.Lib.getString("welcome_page1_header"))
              .appendTo(container),
            new Root.Lib.html("p")
              .text(Root.Lib.getString("welcome_page1_body"))
              .appendTo(container)
          )
          .appendTo(container);

        let btnRow = new Root.Lib.html("div")
          .class("row", "w-100", "mt-auto")
          .appendTo(container);
        new Root.Lib.html("button")
          .text(Root.Lib.getString("close"))
          .appendTo(btnRow)
          .on("click", (e) => {
            Root.Lib.onEnd();
          });
        new Root.Lib.html("button")
          .text(Root.Lib.getString("next"))
          .appendTo(btnRow)
          .class("primary", "ml-auto")
          .on("click", (e) => {
            pages.p2();
          });
      },
      async p2() {
        this.clear("p2");

        new Root.Lib.html("h1")
          .text(Root.Lib.getString("welcome_page2_header"))
          .appendTo(container);
        new Root.Lib.html("p")
          .text(Root.Lib.getString("welcome_page2_body"))
          .appendTo(container);

        const langs = Root.Lib.langs;

        const list = SelectList.table(
          container,
          langs.map((l) => {
            return {
              html: Root.Lib.getString("welcome_page2_language_" + l),
              onclick: function () {
                if (Root.Core && Root.Core.setLanguage) {
                  Root.Core.setLanguage(l);
                  currentLanguage = l;
                }
              },
            };
          })
        ).class("ovh");

        let btnRow = new Root.Lib.html("div")
          .class("row", "w-100", "mt-auto")
          .appendTo(container);
        new Root.Lib.html("button")
          .text(Root.Lib.getString("back"))
          .appendTo(btnRow)
          .on("click", (e) => {
            pages.p1();
          });
        new Root.Lib.html("button")
          .text(Root.Lib.getString("next"))
          .appendTo(btnRow)
          .class("primary", "ml-auto")
          .on("click", (e) => {
            pages.p3();
          });
      },
      async p3() {
        this.clear("p3");

        new Root.Lib.html("h1")
          .text(Root.Lib.getString("welcome_page3_header"))
          .appendTo(container);
        new Root.Lib.html("p")
          .text(Root.Lib.getString("welcome_page3_body"))
          .appendTo(container);

        const themes = await vfs.list("Root/Pluto/config/themes");

        const themeData = (
          await Promise.all(
            themes.map(async (t) => {
              if (t.type === "dir") return null;

              const result = await ThemeLib.validateTheme(
                await vfs.readFile("Root/Pluto/config/themes/" + t.item)
              );
              if (result.success === true) {
                return result.data;
              } else {
                return null;
              }
            })
          )
        ).filter((m) => m !== null);

        SelectList.buttonList(
          container,
          themeData.map((m, i) => {
            return {
              title: "Button",
              html: m.name,
              onclick: function () {
                // Root.Modal.alert("oops", JSON.stringify(m), wrapper);
                ThemeLib.setCurrentTheme(m);
                currentTheme = themes[i].item;
              },
            };
          })
        );

        let btnRow = new Root.Lib.html("div")
          .class("row", "w-100", "mt-auto")
          .appendTo(container);
        new Root.Lib.html("button")
          .text(Root.Lib.getString("back"))
          .appendTo(btnRow)
          .on("click", (e) => {
            pages.p2();
          });
        new Root.Lib.html("button")
          .text(Root.Lib.getString("next"))
          .appendTo(btnRow)
          .class("primary", "ml-auto")
          .on("click", (e) => {
            this.p4();
          });
      },
      async p4() {
        this.clear("p4");

        new Root.Lib.html("h1")
          .text(Root.Lib.getString("welcome_page4_header"))
          .appendTo(container);
        new Root.Lib.html("p")
          .text(Root.Lib.getString("welcome_page4_body"))
          .appendTo(container);

        let btnRow = new Root.Lib.html("div")
          .class("row", "w-100", "mt-auto")
          .appendTo(container);
        new Root.Lib.html("button")
          .text(Root.Lib.getString("back"))
          .appendTo(btnRow)
          .on("click", (e) => {
            pages.p3();
          });
        new Root.Lib.html("button")
          .text(Root.Lib.getString("finish"))
          .appendTo(btnRow)
          .class("primary", "ml-auto")
          .on("click", (e) => {
            this.finish();
          });
      },
      async finish() {
        // Save settings
        try {
          const appearanceConfigLocation =
            "Root/Pluto/config/appearanceConfig.json";
          const appearanceConfig = JSON.parse(
            await vfs.readFile(appearanceConfigLocation)
          );

          if (appearanceConfig) {
            appearanceConfig["language"] = currentLanguage;
            appearanceConfig["theme"] = currentTheme;
            appearanceConfig["hasSetupSystem"] = true;
          }

          await vfs.writeFile(
            appearanceConfigLocation,
            JSON.stringify(appearanceConfig)
          );

          Root.Lib.onEnd();
        } catch (e) {
          Root.Modal.alert(
            Root.Lib.getString("notice"),
            Root.Lib.getString("welcome_failed_to_parse")
          );
        }
      },
    };

    pages.p1();

    return Root.Lib.setupReturns((m) => {
      if (m && m.type) {
        if (m.type === "refresh") {
          Root.Lib.getString = m.data;
          MyWindow.setTitle(Root.Lib.getString("welcome_window_title"));
          pages[currentPage]();
        }
      }
    });
  },
};
