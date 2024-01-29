import ctxMenu from "../lib/CtxMenu.js";
import Tooltip from "../components/Tooltip.js";
import * as htmlClass from "../../assets/html.js";

export default {
  name: "Desktop",
  description: "Backdrop user interface",
  ver: 1, // Compatible with core v1
  type: "process",
  optInToEvents: true,
  exec: async function (Root) {
    let wrapper; // Lib.html | undefined
    let MyWindow;

    console.log("Hello from example package", Root.Lib);

    wrapper = new Root.Lib.html("div").appendTo("body").class("desktop");

    Root.Lib.setOnEnd(function () {
      clearInterval(timeInterval);
      wrapper.cleanup();
    });

    /** @type {htmlClass.default} */
    let Html = Root.Lib.html;

    let vfs = await Root.Core.startPkg("lib:VirtualFS");
    await vfs.importFS();

    let codeScanner = await Root.Core.startPkg("lib:CodeScanner");

    let appearanceConfig = JSON.parse(
      await vfs.readFile("Root/Pluto/config/appearanceConfig.json")
    );

    let wallpaper = "./assets/wallpapers/space.png";

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

    const iconsWrapper = new Root.Lib.html("div")
      .class("desktop-apps")
      .appendTo(wrapper);

    if (localStorage.getItem("oldVFS")) {
      const x = await Root.Modal.prompt(
        "Filesystem restore",
        "Looks like you have an old file system.\nWould you like to mount it?",
        wrapper
      );

      if (x === true) {
        // Do the thing the thing
        // const vfs = await l.loadLibrary("VirtualFS");

        // Root -> oldFs
        vfs.fileSystem.Root["oldFs"] = JSON.parse(
          localStorage.getItem("oldVFS")
        );
        await vfs.save();
        localStorage.removeItem("oldVFS");

        let fm = await Root.Core.startPkg("apps:FileManager", true, true);

        Root.Modal.alert(
          "Filesystem restore",
          "Your old filesystem has been mounted to the 'oldFs' folder.",
          wrapper
        );
      }
    }

    async function refresh() {
      iconsWrapper.clear();

      background.style({
        opacity: 1,
        display: "block",
        "z-index": -1,
      });

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

        let mapping = await FileMappings.retrieveAllMIMEdata(
          desktopDirectory + "/" + file.item,
          vfs
        );

        createDesktopIcon(mapping.name, mapping.icon, mapping.onClick);
      }
    }

    const preloadImage = new Image();
    preloadImage.src = wallpaper;
    preloadImage.addEventListener("load", refresh);

    background.on("contextmenu", (e) => {
      e.preventDefault();
      ctxMenu.data.new(e.clientX, e.clientY, [
        {
          item: Root.Lib.getString("refresh"),
          async select() {
            refresh();
          },
        },
        {
          item: Root.Lib.getString("systemApp_FileManager"),
          async select() {
            let fm = await Root.Core.startPkg("apps:FileManager", true, true);

            fm.proc.send({ type: "loadFolder", path: "Root/Desktop" });
          },
        },
        {
          item: Root.Lib.getString("systemApp_Settings"),
          async select() {
            let fm = await Root.Core.startPkg("apps:Settings", true, true);
          },
        },
      ]);
    });

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
      } else {
        if (ev.target.closest(".ctx-menu")) return;
        if (menuIsOpen === true) toggleMenu();
        if (trayMenuState === true) toggleTrayMenu();
      }
    }

    function onFullClickDetect(ev) {
      if (menuIsOpen !== true) return;

      if (ev.target.closest(".menu")) {
        if (ev.button === 0) {
          if (
            ev.target.closest(".menu button") ||
            ev.target.closest(".menu .app")
          ) {
            toggleMenu();
          }
        }
      }
    }

    let FileMappings = await Root.Lib.loadLibrary("FileMappings");

    const userAccountService = Root.Core.services
      .filter((x) => x !== null)
      .find((x) => x.name === "Account");

    async function toggleMenu() {
      if (menuIsToggling) {
        return; // Return early if menu is currently toggling
      }

      menuIsToggling = true;
      menuIsOpen = !menuIsOpen;

      const userData = userAccountService.ref.getUserData();

      if (menuIsOpen === true) {
        window.addEventListener("mousedown", onClickDetect);
        window.addEventListener("click", onFullClickDetect);
        window.addEventListener("touchstart", onClickDetect);
        window.addEventListener("touchend", onFullClickDetect);

        if (!menuElm) {
          // Create menu element if it doesn't exist
          const desktopApps = (await vfs.list("Root/Desktop"))
            .filter((f) => f.item.endsWith(".shrt"))
            .map((f) => {
              return { type: "desktop", item: f.item };
            });
          const installedApps = (await vfs.list("Root/Pluto/apps"))
            .filter((f) => f.item.endsWith(".app"))
            .map((f) => {
              return { type: "installed", item: f.item };
            });
          let asApps = [];
          const asExists = await vfs.whatIs(
            "Registry/AppStore/_AppStoreIndex.json"
          );
          if (asExists !== null) {
            console.log(asExists);
            asApps = (await vfs.list("Registry/AppStore"))
              .filter((f) => f.item.endsWith(".app"))
              .map((f) => {
                return { type: "appStore", item: f.item };
              });
          }

          const apps = [...installedApps, ...asApps, ...desktopApps];

          const appsHtml = await Promise.all(
            apps.map(async (app) => {
              // console.log(app);
              let icon = "box",
                name = app.item,
                description = null,
                mapping = null;

              if (app.type === "desktop") {
                const data = await FileMappings.retrieveAllMIMEdata(
                  "Root/Desktop/" + app.item
                );

                mapping = data;

                icon = data.icon;
                name = data.localizedName ?? data.name;
                description = data.fullName;
              } else if (app.type === "appStore") {
                const data = await FileMappings.retrieveAllMIMEdata(
                  "Registry/AppStore/" + app.item
                );

                mapping = data;

                if (data.invalid === true) {
                  return undefined;
                }

                icon = data.icon;
                name = data.name;
                description = data.fullName;
              }

              return new Html("div")
                .class("app")
                .appendMany(
                  new Html("div")
                    .class("app-icon")
                    .html(icon in Root.Lib.icons ? Root.Lib.icons[icon] : icon),
                  new Html("div")
                    .class("app-text")
                    .appendMany(
                      new Html("div").class("app-heading").text(name),
                      description !== null
                        ? new Html("div")
                            .class("app-description")
                            .text(description)
                        : null
                    )
                )
                .on("click", async (e) => {
                  if (app.type === "desktop") {
                    // View the shortcut file
                    try {
                      let shrt = JSON.parse(
                        await vfs.readFile("Root/Desktop/" + app.item)
                      );

                      // console.log(shrt);

                      if (shrt.fullName) {
                        await Root.Core.startPkg(shrt.fullName, true, true);
                      }
                    } catch (e) {
                      console.log("Couldn't load the application");
                    }
                  } else if (app.type === "appStore") {
                    await mapping.onClick();
                  } else {
                    try {
                      const appData = await vfs.readFile(
                        "Root/Pluto/apps/" + app.item
                      );
                      await Root.Core.startPkg(
                        "data:text/javascript," + encodeURIComponent(appData),
                        false,
                        false
                      );
                    } catch (e) {
                      console.log("Couldn't load the application");
                    }
                  }
                });
            })
          );

          menuElm = new Html("div").class("menu").appendMany(
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
                }),
              new Root.Lib.html("button")
                .class("small")
                .html(Root.Lib.icons.lock)
                .on("click", async (e) => {
                  let ls = await Root.Core.startPkg(
                    "ui:LockScreen",
                    true,
                    true
                  );
                  ls.loader();
                })
            ),
            new Html("div")
              .class("spacer")
              .appendMany(
                new Html("div").class("space"),
                new Html("div").text("Apps"),
                new Html("div").class("space")
              ),
            new Html("div").class("apps").appendMany(...appsHtml)
          );

          dock.elm.insertBefore(menuElm.elm, dock.elm.lastChild);
        }

        menuElm.classOn("opening");
        setTimeout(() => {
          menuElm.classOff("opening");
          menuIsToggling = false;
        }, 500);
      } else {
        window.removeEventListener("mousedown", onClickDetect);
        window.removeEventListener("touchstart", onClickDetect);
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
      quickAccessButtonText.text(timeString);
    }

    let trayWrapper = new Root.Lib.html("div")
      .style({ position: "relative" })
      .appendTo(dock);

    const trayMenuButton = new Root.Lib.html("button")
      .class("toolbar-button", "tray")
      .html(Root.Lib.icons.chevronUp)
      .appendTo(trayWrapper);

    let trayMenuState = false; // not opened
    let trayIsToggling = false;
    let trayElm;

    async function toggleTrayMenu() {
      if (trayIsToggling) {
        return; // Return early if menu is currently toggling
      }

      trayIsToggling = true;

      trayMenuState = !trayMenuState;

      let prevItems = [];

      if (trayMenuState === true) {
        window.addEventListener("mousedown", onClickDetect);
        window.addEventListener("click", onFullClickDetect);
        window.addEventListener("touchstart", onClickDetect);
        window.addEventListener("touchend", onFullClickDetect);
        if (!trayElm) {
          async function createTrayItems() {
            const trayItems = Root.Core.processList.filter((f) => f !== null);

            let appsHtml = await Promise.all(
              trayItems.map(async (app) => {
                if (app.proc === undefined || app.proc === null) {
                  console.log("Bad app");
                  return;
                }
                const t = app.proc.trayInfo;
                if (t === null || t === undefined) {
                  return false;
                }
                if (typeof t.icon === undefined) {
                  return false;
                }

                let icon = t.icon || Root.Lib.icons.box;

                let popup;

                const item = new Html("button")
                  .class("tray-item")
                  .appendMany(
                    new Html("div")
                      .styleJs({ width: "24px", height: "24px" })
                      .class("app-icon")
                      .html(icon)
                  )
                  .on("mouseenter", () => {
                    if (popup) {
                      popup.cleanup();
                      popup = null;
                    } else {
                      const bcr = item.elm.getBoundingClientRect();
                      popup = Tooltip.new(
                        bcr.left + bcr.width / 2,
                        bcr.bottom - 36,
                        t.name || app.proc.name || app.name,
                        document.body,
                        true
                      );

                      requestAnimationFrame(() => {
                        popup.style({
                          left:
                            bcr.left +
                            bcr.width / 2 -
                            popup.elm.offsetWidth / 2 +
                            "px",
                        });
                      });
                    }
                  })
                  .on("mouseleave", (e) => {
                    if (popup) {
                      popup.cleanup();
                      popup = null;
                    }
                  })
                  .on("click", async (e) => {
                    // send message to process to spawn a custom context menu
                    app.proc.send({
                      type: "context-menu",
                      button: "left-click",
                      x: e.clientX,
                      y: e.clientY,
                    });
                  })
                  .on("contextmenu", async (e) => {
                    e.preventDefault();
                    app.proc.send({
                      type: "context-menu",
                      button: "right-click",
                      x: e.clientX,
                      y: e.clientY,
                    });
                  });

                // return { pid: app.pid, item };
                return item;
              })
            );

            return appsHtml.filter((m) => m !== false);
          }

          /** @type {htmlClass.default} */
          trayElm = new Html("div").class("menu", "tray");
          async function updateTray() {
            if (trayMenuState === false) clearInterval(trayInterval);
            let trayApps = await createTrayItems();
            if (trayApps.length === 0) {
              trayElm
                .clear()
                .appendMany(
                  new Html("span")
                    .class(
                      "label",
                      "w-100",
                      "flex-group",
                      "fg",
                      "fc",
                      "mt-2",
                      "mb-2"
                    )
                    .text("No apps are using the tray.")
                );
              trayElm.style({
                width: "160px",
              });
            } else {
              if (Html.qsa(".tooltip") !== null) {
                Html.qsa(".tooltip").forEach((t) => t.cleanup());
              }
              trayElm
                .clear()
                .appendMany(
                  new Html("div").class("apps").appendMany(...trayApps)
                );
            }
          }

          updateTray();

          let trayInterval = setInterval(updateTray, 1000);

          trayElm.appendTo(trayWrapper);
        }

        trayElm.classOn("opening");
        setTimeout(() => {
          trayElm.classOff("opening");
          trayIsToggling = false;
        }, 500);
      } else {
        window.removeEventListener("mousedown", onClickDetect);
        window.removeEventListener("touchstart", onClickDetect);
        if (trayElm) {
          trayElm.classOn("closing");
          setTimeout(() => {
            trayElm.cleanup();
            trayElm = null; // Reset menu element reference
            trayIsToggling = false;
          }, 500);
        }
      }
    }

    trayMenuButton.on("click", toggleTrayMenu);

    const quickAccessButton = new Root.Lib.html("div")
      .class("toolbar-button")
      .appendTo(dock);

    const quickAccessButtonText = new Root.Lib.html("spam").appendTo(
      quickAccessButton
    );

    updateTime();
    timeInterval = setInterval(updateTime, 1000);

    function createButton(pid, name, onclickFocusWindow) {
      dockItemsList[pid] = new Html()
        .class("dock-item")
        .appendTo(dockItems)
        .on(
          "click",
          (_) =>
            onclickFocusWindow &&
            onclickFocusWindow.focus &&
            onclickFocusWindow.focus()
        )
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

    // Start the startup apps

    if (await vfs.exists("Root/Pluto/startup")) {
      let startupApps = await vfs.readFile("Root/Pluto/startup").then((e) => {
        return e.split("\n").filter((e) => e !== "");
      });

      if (startupApps.length >= 1) {
        for (let i = 0; i < startupApps.length; i++) {
          let file = startupApps[i];
          let mapping = await FileMappings.retrieveAllMIMEdata(file, vfs);
          console.log(mapping);
          mapping.onClick(Root.Core);
        }
      }
    }

    // scan for dangerous files
    let settingsConfig = JSON.parse(
      await vfs.readFile("Root/Pluto/config/settingsConfig.json")
    );
    console.log(settingsConfig);
    if (settingsConfig === null) {
      await vfs.writeFile(
        "Root/Pluto/config/settingsConfig.json",
        `{"warnSecurityIssues": true}`
      );
      settingsConfig = JSON.parse(
        await vfs.readFile("Root/Pluto/config/settingsConfig.json")
      );
    }

    if (settingsConfig.warnSecurityIssues !== false) {
      let dc = await codeScanner.scanForDangerousCode();

      let fsContainsDC = false;

      for (let i = 0; i < dc.length; i++) {
        if (dc[i].success) {
          if (dc[i].dangerous == true) {
            fsContainsDC = true;
          }
        }
      }

      if (fsContainsDC) {
        new Promise(async (resolve, reject) => {
          // make alert modal popup
          let prmpt = await Root.Modal.prompt(
            "Alert",
            "Your computer contains a potentially dangerous application!\nDo you want to review it?"
          );
          console.log(prmpt);
          if (prmpt == true) {
            let stgApp = await Root.Core.startPkg("apps:Settings", true, true);
            await stgApp.proc.send({
              type: "goPage",
              data: "security",
            });
          }
        });
      }
    }

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

    const WindowSystem = await Root.Lib.loadLibrary("WindowSystem");

    console.log("winSys", WindowSystem, Root.Core.windowsList);

    return Root.Lib.setupReturns(async (m) => {
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
            // Language swap, refresh desktop.
            refresh();
            break;
          case "coreEvent":
            console.log("Desktop received core event", data);

            if (
              data.data.name.startsWith("system:") ||
              data.data.name.startsWith("ui:") ||
              data.data.name.startsWith("services:")
            )
              return;
            if (data.type === "pkgStart") {
              if (dockItemsList[data.data.pid]) return;
              const p = Root.Core.windowsList.find(
                (p) => p.options.pid === data.data.pid
              );
              if (p) {
                console.log("winSys", p);
                createButton(data.data.pid, data.data.proc.name, p);
              }
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
