export default {
  name: "Desktop",
  description: "Backdrop user interface",
  ver: 0.1, // Compatible with core 0.1
  type: "process",
  exec: async function(Root) {
    let wrapper; // Lib.html | undefinedd
    let MyWindow;

    console.log("Hello from example package", Root.Lib);

    function onEnd() {
      console.log("Example process ended, attempting clean up...");
      const result = Root.Lib.cleanup(Root.PID, Root.Token);
      if (result === true) {
        wrapper.cleanup();
        console.log("Cleanup Success! Token:", Root.Token);
      } else {
        console.log("Cleanup Failure. Token:", Root.Token);
      }
    }

    wrapper = new Root.Lib.html("div").appendTo("body").class("desktop");
    console.log(wrapper);

    let Html = Root.Lib.html;

    let background = new Html()
      .style({
        "background-image": "url(/assets/Wallpaper.png)",
        "background-size": "cover",
        "background-attachment": "fixed",
        "background-repeat": "no-repeat",
        top: "0",
        left: "0",
        right: "0",
        bottom: "0",
        transition: "opacity 2s linear",
        opacity: "0",
        width: "100%",
        height: "100%",
        position: "absolute",
        "z-index": "-1",
      })
      .appendTo(wrapper);

    const preloadImage = new Image();
    preloadImage.src = "/assets/Wallpaper.png";
    preloadImage.addEventListener("load", async (_) => {
      background.style({
        opacity: 1,
        display: "block",
        "z-index": -1,
      });

      let mouseSpace = {
        x: 0,
        y: 0,
      };

      const fileManager = new Root.Lib.html("div")
        .style({
          display: "flex",
          "flex-direction": "column",
          "align-items": "center",
          gap: "8px", // totally not inspired by replit
          position: "absolute",
          left: "12px",
          top: "12px",
        })
        .appendTo(wrapper);

      // new Root.Lib.html("div")
      //   .html(`<svg viewBox="0 0 24 24" width="64" height="64" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`)
      //   .on("dragstart", (e) => {
      //     mouseSpace.x = fileManager.elm.style.left.slice(0, -2) - e.clientX
      //     mouseSpace.y = fileManager.elm.style.top.slice(0, -2) - e.clientY
      //   })
      //   .on("dragend", (e) => {
      //     if (e.x + e.y == 0) return
      //     fileManager.elm.style.left = (e.x + mouseSpace.x) + "px"
      //     fileManager.elm.style.top = (e.y + mouseSpace.y) + "px"
      //   })
      //   .on("dblclick", (e) => {
      //     Root.Core.startPkg('apps:FileManager');
      //   }).appendTo(fileManager);

      // new Root.Lib.html("span")
      //   .text("File Manager")
      //   .style({ color: 'white' })
      //   .appendTo(fileManager)

      // ADD .SHRT FILES FOR SHORTCUTS TO APPS
      const vfs = await Root.Lib.loadLibrary("VirtualFS");

      const menuBar = await Root.Core.startPkg("ui:3x3", true, true);
      menuBar.proc.send({ type: "append", elm: wrapper });

      vfs.importFS();
      const desktopDirectory = "Root/Desktop";
      const fileList = vfs.list(desktopDirectory);

      const iconsWrapper = new Root.Lib.html("div")
        .class("desktop-apps")
        .appendTo(wrapper);

      function createDesktopIcon(fileName, icon, fn) {
        const mouse = { x: 0, y: 0 };
        let lastTapTime = 0;
        let iconWrapper = new Root.Lib.html("div")
          .class("desktop-icon")
          .append(
            new Root.Lib.html("div").html(Root.Lib.icons[icon]).class("icon")
          )
          .append(
            new Root.Lib.html("div")
              .append(new Root.Lib.html().text(fileName).class("text"))
              .class("text-wrapper")
          )
          .appendTo(iconsWrapper)
          .on("dblclick", (_) => fn(Root.Core))
          .on('touchstart', (e) => {
            const currentTime = new Date().getTime();
            const tapInterval = currentTime - lastTapTime;

            if (tapInterval < 300 && tapInterval > 0) {
              fn(Root.Core);
              e.preventDefault();
            }

            lastTapTime = currentTime;
          })
          .on("dragstart", (e) => {
            console.log(e);
            mouse.x = e.clientX;
            mouse.y = e.clientY;
          })
          .on("drag", (e) => {
            console.log(e);
            iconWrapper.style({
              left: mouse.x - e.x,
              top: mouse.y - e.y,
            });
          });
        return iconWrapper;
      }

      for (let i = 0; i < fileList.length; i++) {
        let file = fileList[i];

        let FileMappings = await Root.Lib.loadLibrary("FileMappings");
        //let daleta = t mapping =
        let mapping = FileMappings.retriveAllMIMEdata(
          desktopDirectory + "/" + file.item,
          vfs
        );

        console.log(mapping); // debug test
        createDesktopIcon(mapping.name, mapping.icon, mapping.onClick);

        // if (file.item.endsWith(".shrt")) {
        //   try {
        //     let shrtFile = JSON.parse(
        //       vfs.readFile(desktopDirectory + "/" + file.item)
        //     );

        //     if (!shrtFile.name || !shrtFile.icon || !shrtFile.fullname) {
        //       continue;
        //     }

        //     createDesktopIcon(shrtFile.name, shrtFile.icon, () => {
        //       Root.Core.startPkg(shrtFile.fullname, true, true);
        //     });
        //   } catch (e) {
        //     console.log("UNABLE TO PARSE", file);
        //     Root.Modal.alert("Desktop Shortcut Error", e, wrapper);
        //   }
        // } else {
        //   createDesktopIcon(file.item, file.type, async (e) => {
        //     console.log(file.type)
        //     if (file.type == "dir") {
        //       let fm = await Root.Core.startPkg("apps:FileManager");
        //       fm.proc.send({ type: "loadFolder", path: desktopDirectory + "/" + file.item });
        //     }
        //     else if (file.type == "file") {
        //       let fileExtension = (
        //         file.item.includes(".") ? file.item.split(".").pop() : ""
        //       ).trim();
        //       switch (fileExtension) {
        //         case "app":
        //           Root.Core.startPkg(
        //             "data:text/javascript;base64," +
        //             btoa(vfs.readFile(desktopDirectory + "/" + file.item)),
        //             false
        //           );
        //           break;
        //         case "png":
        //         case "jpg":
        //         case "jpeg":
        //         case "bmp":
        //         case "gif":
        //           let img = await Root.Core.startPkg("apps:ImageViewer");
        //           img.proc.send({ type: "loadFile", path: desktopDirectory + "/" + file.item });
        //           break;
        //         default:
        //           let np = await Root.Core.startPkg("apps:Notepad");
        //           np.proc.send({ type: "loadFile", path: desktopDirectory + "/" + file.item });
        //           break;
        //       }
        //     }
        //   });
        // }
      }
    });
    /*
    let topBar = new Root.Lib.html("div").appendTo(wrapper).class("topBar");
    let tab1 = new Root.Lib.html("div")
      .appendTo(topBar)
      .class("topBarItem")
      .html("Pluto");
    let tab2 = new Root.Lib.html("div")
      .appendTo(topBar)
      .class("topBarItem")
      .html("Application");
    let dock = new Root.Lib.html("div").appendTo(wrapper).class("dock");

    for (let i = 0; i < 5; i++) {
      let app = new Root.Lib.html("div").appendTo(dock).class("app");
    }
*/

    // let dock = new Root.Lib.html("div").class("dock").appendTo(wrapper);

    // let menuButton = new Root.Lib.html("button")
    //   .class("toolbar-button")
    //   .html(
    //     `<svg width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M9 15.3713C12.7949 15.3713 15.8713 12.2949 15.8713 8.5C15.8713 4.70511 12.7949 1.62874 9 1.62874C5.20511 1.62874 2.12874 4.70511 2.12874 8.5C2.12874 12.2949 5.20511 15.3713 9 15.3713ZM9 17C13.6944 17 17.5 13.1944 17.5 8.5C17.5 3.80558 13.6944 0 9 0C4.30558 0 0.5 3.80558 0.5 8.5C0.5 13.1944 4.30558 17 9 17Z" fill="white"/></svg>`
    //   )
    //   .appendTo(dock);
    // let dockItems = new Root.Lib.html("div").class("items").appendTo(dock);
    // let collapseButton = new Root.Lib.html("button")
    //   .class("toolbar-button")
    //   .html(
    //     `<svg width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 15L6 9L12 3" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
    //   )
    //   .appendTo(dock);

    return Root.Lib.setupReturns(onEnd, (m) => {
      console.log("Example recieved message: " + m);
    });
  },
};
