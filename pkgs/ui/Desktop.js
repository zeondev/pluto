export default {
  name: "Desktop",
  description: "Backdrop user interface",
  ver: 1, // Compatible with core v1
  type: "process",
  optInToEvents: true,
  exec: async function (Root) {
    let wrapper; // Lib.html | undefinedd
    let MyWindow;

    console.log("Hello from example package", Root.Lib);

    function onEnd() {
      console.log("Example process ended, attempting clean up...");
      const result = Root.Lib.cleanup(Root.PID, Root.Token);
      clearInterval(timeInterval);
      if (result === true) {
        wrapper.cleanup();
        console.log("Cleanup Success! Token:", Root.Token);
      } else {
        console.log("Cleanup Failure. Token:", Root.Token);
      }
    }

    wrapper = new Root.Lib.html("div").appendTo("body").class("desktop");

    let Html = Root.Lib.html;

    let vfs = await Root.Core.startPkg("lib:VirtualFS");
    await vfs.importFS();

    let appearanceConfig = JSON.parse(
      await vfs.readFile("Root/Pluto/config/appearanceConfig.json")
    );

    let wallpaper = "/assets/wallpapers/space.png";

    if (appearanceConfig.wallpaper) {
      wallpaper = appearanceConfig.wallpaper;
    }

    let background = new Html()
      .style({
        "background-image": "url(" + wallpaper + ")",
        "background-size": "cover",
        "background-attachment": "fixed",
        "background-repeat": "no-repeat",
        "background-position": "center",
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

    async function refresh() {
      background.style({
        opacity: 1,
        display: "block",
        "z-index": -1,
      });

      let mouseSpace = {
        x: 0,
        y: 0,
      };
      if (localStorage.getItem("oldvfs")) {
        const x = await Root.Modal.prompt(
          "Filesystem restore",
          "Looks like you have an old file system.\nWould you like to mount it?",
          wrapper
        );

        if (x === true) {
          // Do the thing the thing
          // const vfas = await l.loadLibrary("VirtualFS");

          // Root -> oldFs
          vfs.fileSystem.Root["oldFs"] = JSON.parse(
            localStorage.getItem("oldvfs")
          );
          await vfs.save();
          localStorage.removeItem("oldvfs");

          let fm = await Root.Core.startPkg("apps:FileManager", true, true);

          Root.Modal.alert(
            "Filesystem restore",
            "Your old filesystem has been mounted to the 'oldFs' folder.",
            wrapper
          );
        }
      }

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

      const desktopDirectory = "Root/Desktop";
      const fileList = await vfs.list(desktopDirectory);

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
          .on("touchstart", (e) => {
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

      let FileMappings = await Root.Lib.loadLibrary("FileMappings");

      for (let i = 0; i < fileList.length; i++) {
        let file = fileList[i];

        //let daleta = t mapping =
        let mapping = await FileMappings.retriveAllMIMEdata(
          desktopDirectory + "/" + file.item,
          vfs
        );

        createDesktopIcon(mapping.name, mapping.icon, mapping.onClick);

        // if (file.item.endsWith(".shrt")) {
        //   try {
        //     let shrtFile = JSON.parse(
        //       await vfs.readFile(desktopDirectory + "/" + file.item)
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
        //             btoa(await vfs.readFile(desktopDirectory + "/" + file.item)),
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
    }

    const preloadImage = new Image();
    preloadImage.src = wallpaper;
    preloadImage.addEventListener("load", refresh);

    // let topBar = new Root.Lib.html("div").appendTo(wrapper).class("topBar");
    // let tab1 = new Root.Lib.html("div")
    //   .appendTo(topBar)
    //   .class("topBarItem")
    //   .html("Pluto");
    // let tab2 = new Root.Lib.html("div")
    //   .appendTo(topBar)
    //   .class("topBarItem")
    //   .html("Application");

    let dock = new Root.Lib.html("div").appendTo(wrapper).class("dock");

    let menuButton = new Root.Lib.html("button")
      .class("toolbar-button")
      .html(
        `<svg width="24" height="24" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M9 15.3713C12.7949 15.3713 15.8713 12.2949 15.8713 8.5C15.8713 4.70511 12.7949 1.62874 9 1.62874C5.20511 1.62874 2.12874 4.70511 2.12874 8.5C2.12874 12.2949 5.20511 15.3713 9 15.3713ZM9 17C13.6944 17 17.5 13.1944 17.5 8.5C17.5 3.80558 13.6944 0 9 0C4.30558 0 0.5 3.80558 0.5 8.5C0.5 13.1944 4.30558 17 9 17Z" fill="currentColor"/></svg>`
      )
      .appendTo(dock);

    let menuIsOpen = false;
    let menuIsToggling = false;
    let menuElm;

    function onClickDetect(ev) {
      if (ev.target.closest(".menu")) {
      }
    }

    const userAccountService = Root.Core.services
      .filter((x) => x !== null)
      .find((x) => x.name === "Account");

    function toggleMenu() {
      if (menuIsToggling) {
        return; // Return early if menu is currently toggling
      }

      menuIsToggling = true;
      menuIsOpen = !menuIsOpen;

      const userData = userAccountService.ref.getUserData();

      if (menuIsOpen === true) {
        if (!menuElm) {
          // Create menu element if it doesn't exist
          menuElm = new Html("div")
            .class("menu")
            .appendMany(
              new Html("div").class("me").appendMany(
                new Html("div").class("pfp").style({
                  "--url": `url(${userData.pfp})`,
                }),
                new Html("div")
                  .class("text")
                  .appendMany(
                    new Html("div").class("heading").text(userData.username),
                    new Html("div")
                      .class("subheading")
                      .text(
                        userData.onlineAccount === true
                          ? "Zeon Account"
                          : "Local Account"
                      )
                  ),
                new Root.Lib.html("button")
                  .class("small")
                  .html(Root.Lib.icons.wrench)
                  .on("click", (e) => {
                    Root.Core.startPkg("apps:Settings", true, true);
                  })
              ),
              new Html("div")
                .class("spacer")
                .appendMany(
                  new Html("div").class("space"),
                  new Html("div").text("Apps"),
                  new Html("div").class("space")
                ),
              new Html("div")
                .class("apps")
                .appendMany(
                  new Html("div")
                    .class("app")
                    .appendMany(
                      new Html("div")
                        .class("app-icon")
                        .html(Root.Lib.icons.cpu),
                      new Html("div")
                        .class("app-text")
                        .appendMany(
                          new Html("div")
                            .class("app-heading")
                            .text("Task Manager"),
                          new Html("div")
                            .class("app-description")
                            .text("Examine and manage processes")
                        )
                    )
                )
            )
            .appendTo(dock);
        }

        menuElm.classOn("opening");
        setTimeout(() => {
          menuElm.classOff("opening");
          menuIsToggling = false;
        }, 500);
      } else {
        if (menuElm) {
          menuElm.classOn("closing");
          setTimeout(() => {
            menuElm.cleanup();
            menuElm = null; // Reset menu element reference
            menuIsToggling = false;
          }, 500);
        }
      }
    }

    menuButton.on("click", toggleMenu);

    let dockItems = new Root.Lib.html("div").class("items").appendTo(dock);
    let dockItemsList = [];

    /* quickAccessButton */
    let timeInterval = -1;
    let pastMinute = 0;

    function updateTime() {
      let x = new Date();
      let hours = x.getHours().toString().padStart(2, "0");
      let minutes = x.getMinutes().toString().padStart(2, "0");
      if (pastMinute === minutes) return;
      pastMinute = minutes;
      let timeString = `${hours}:${minutes}`;
      quickAccessButton.text(timeString);
    }

    const quickAccessButton = new Root.Lib.html("div")
      .class("toolbar-button")
      .text("..:..")
      .appendTo(dock);

    updateTime();
    timeInterval = setInterval(updateTime, 1000);

    function createButton(pid, name) {
      dockItemsList[pid] = new Html()
        .class("dock-item")
        .appendTo(dockItems)
        .text(name);
    }

    Root.Core.processList
      .filter((n) => n !== null)
      .forEach((a) => {
        if (
          a.name.startsWith("system:") ||
          a.name.startsWith("ui:") ||
          a.name.startsWith("services:")
        )
          return;
        if (!a.proc) return;

        createButton(a.pid, a.proc.name);
      });

    let isCurrentlyChangingWallpaper = false;
    let wallpaperToChangeTo = "";

    function smoothlySwapBackground(to) {
      wallpaperToChangeTo = to;
      background.style({
        "background-image": "url(" + wallpaperToChangeTo + ")",
      });
      // const preloadImage = new Image();
      // background.classOn("fadeOut");
      // if (isCurrentlyChangingWallpaper === true) {
      //   wallpaperToChangeTo = to;
      //   return;
      // }
      // isCurrentlyChangingWallpaper = true;
      // wallpaperToChangeTo = to;
      // setTimeout(() => {
      //   preloadImage.src = wallpaperToChangeTo;
      //   preloadImage.addEventListener("load", fadeIn);
      // }, 500);
      // function fadeIn() {
      //   setTimeout(() => {
      //     background.classOff("fadeOut").classOn("fadeIn");
      //     background.style({
      //       "background-image": "url(" + wallpaperToChangeTo + ")",
      //     });
      //     isCurrentlyChangingWallpaper = false;
      //   }, 500);
      // }
    }

    return Root.Lib.setupReturns(onEnd, async (m) => {
      try {
        // Got a message
        const { type, data } = m;
        switch (type) {
          case "setWallpaper":
            if (data === "default") {
              appearanceConfig = JSON.parse(
                await vfs.readFile("Root/Pluto/config/appearanceConfig.json")
              );
              smoothlySwapBackground(appearanceConfig.wallpaper);
            } else {
              smoothlySwapBackground(data);
            }
            break;
          case "refresh":
            break;
          case "coreEvent":
            console.log("Desktop recieved core event", data);

            if (
              data.data.name.startsWith("system:") ||
              data.data.name.startsWith("ui:") ||
              data.data.name.startsWith("services:")
            )
              return;
            if (data.type === "pkgStart") {
              if (dockItemsList[data.data.pid]) return;
              createButton(data.data.pid, data.data.proc.name);
            } else if (data.type === "pkgEnd") {
              console.log("Cleanup pid", data.data.pid);
              dockItemsList[data.data.pid].cleanup();
              dockItemsList[data.data.pid] = null;
              console.log("Removed", data.data.pid);
            }
            break;
          case "wsEvent":
            if (data.type === "focusedWindow") {
              if (data.data === undefined) return;
              const p = data.data.options.pid;
              dockItemsList
                .filter((n) => n !== null)
                .forEach((pa) => {
                  pa.classOff("selected");
                });
              if (dockItemsList[p] !== undefined)
                if (dockItemsList[p] !== null)
                  dockItemsList[p].classOn("selected");
                else console.log("?!");
            }
            break;
        }
      } catch (e) {
        console.log("desktop oops", e);
      }
    });
  },
};
