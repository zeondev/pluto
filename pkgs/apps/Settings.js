export default {
  name: "Example",
  description: "Example application. Boilerplate.",
  ver: 0.1, // Compatible with core 0.1
  type: "process",
  privileges: [
    {
      privilege: "knownPackageList",
      description: "Get a list of the known applications on the system",
    },
  ],
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
    const TextSidebar = await Root.Lib.loadComponent("TextSidebar");
    const vfs = await Root.Lib.loadLibrary("VirtualFS");
    vfs.importFS();

    let desktopConfig = JSON.parse(
      vfs.readFile("Root/Pluto/config/appearanceConfig.json")
    );
    console.log(desktopConfig);

    function save() {
      vfs.writeFile(
        "Root/Pluto/config/appearanceConfig.json",
        JSON.stringify(desktopConfig)
      );
    }

    // Testing the html library
    MyWindow = new Win({
      title: "Settings",
      onclose: () => {
        onEnd();
      },
    });

    let Html = Root.Lib.html;

    wrapper = MyWindow.window.querySelector(".win-content");

    wrapper.classList.add("row", "o-h", "h-100", "with-sidebar");

    let container;

    TextSidebar.new(wrapper, [
      {
        icon: Root.Lib.icons.brush,
        text: "Appearance",
        title: "H is h",
        onclick() {
          pages.appe();
        },
      },
      {
        icon: Root.Lib.icons.wifiConnected,
        text: "Network",
        title: "H is h",
        onclick() {
          pages.netw();
        },
      },
      {
        icon: Root.Lib.icons.application,
        text: "Applications",
        title: "H is h",
        onclick() {
          pages.appl();
        },
      },
      {
        icon: Root.Lib.icons.glasses,
        text: "Privacy",
        title: "H is h",
        onclick() {
          pages.priv();
        },
      },
    ]);

    container = new Root.Lib.html("div").class("container").appendTo(wrapper);

    let pages = {
      clear() {
        container.elm.innerHTML = "";
      },
      appe() {
        this.clear();
        new Html("h1").text("Appearance").appendTo(container);
        // Here we're are going to make the select option
        // for light and dark mode !
        new Html("select")
          .appendMany(new Option("Dark", "dark"), new Option("Light", "light"))
          .on("input", (e) => {
            // set the option and do the save
            desktopConfig.theme = e.target.value;
            document.documentElement.dataset.theme = e.target.value;
            save();
          })
          .appendTo(container);
      },
      netw() {
        this.clear();
        new Html("h1").text("Networking").appendTo(container);
      },
      appl() {
        this.clear();
        new Html("h1").text("Applications").appendTo(container);
      },
      priv() {
        this.clear();
        new Html("h1").text("Privacy").appendTo(container);
      },
    };

    new Html("h1").text("Example App").appendTo(container);

    return Root.Lib.setupReturns(onEnd, (m) => {
      console.log("Example recieved message: " + m);
    });
  },
};
