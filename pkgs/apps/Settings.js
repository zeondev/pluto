export default {
  name: "Settings",
  description: "Modify settings from this UI.",
  ver: 1, // Compatible with core v1
  type: "process",
  privileges: [
    {
      privilege: "knownPackageList",
      description: "Get a list of the known applications on the system",
    },
    {
      privilege: "processList",
      description: "There can only be one settings app open at a time",
    },
    {
      privilege: "services",
      description: "Access system services",
    },
  ],
  exec: async function (Root) {
    let wrapper; // Lib.html | undefined
    let settingsWin;
    Root.Lib.setOnEnd((_) => settingsWin.close());

    console.log("Hello from example package", Root.Lib);

    if (
      !Root.Core ||
      (Root.Core &&
        Root.Core.processList &&
        Root.Core.processList
          .filter((x) => x !== null)
          .find(
            (x) =>
              x.name &&
              x.name === "apps:Settings" &&
              x.proc &&
              x.proc.name &&
              x.proc.name === "Settings"
          ) !== undefined)
    ) {
      Root.Lib.onEnd();
      return Root.Lib.setupReturns((m) => {
        console.log("Example received message: " + m);
      });
    }

    const Win = (await Root.Lib.loadLibrary("WindowSystem")).win;
    const TextSidebar = await Root.Lib.loadComponent("TextSidebar");
    const Card = await Root.Lib.loadComponent("Card");
    const vfs = await Root.Lib.loadLibrary("VirtualFS");
    const themeLib = await Root.Lib.loadLibrary("ThemeLib");
    await vfs.importFS();

    const defaultDesktopConfig = {
      wallpaper: "./assets/wallpapers/space.png",
      useThemeWallpaper: true,
      theme: "dark.theme",
      sidebarType: "vertical",
    };

    let desktopConfig = Object.assign(
      defaultDesktopConfig,
      JSON.parse(await vfs.readFile("Root/Pluto/config/appearanceConfig.json"))
    );
    console.log(desktopConfig);

    async function save() {
      await vfs.writeFile(
        "Root/Pluto/config/appearanceConfig.json",
        JSON.stringify(desktopConfig)
      );
      desktopConfig = Object.assign(
        defaultDesktopConfig,
        JSON.parse(
          await vfs.readFile("Root/Pluto/config/appearanceConfig.json")
        )
      );
    }

    // Testing the html library
    settingsWin = new Win({
      title: "Settings",
      onclose: () => {
        Root.Lib.onEnd();
      },
      width: 480,
      height: 360,
      pid: Root.PID,
    });

    let Html = Root.Lib.html;

    wrapper = settingsWin.window.querySelector(".win-content");

    wrapper.classList.add("row", "o-h", "h-100", "with-sidebar");

    let container;

    TextSidebar.new(wrapper, [
      {
        icon: Root.Lib.icons.cpu,
        text: "System",
        title: "System",
        onclick() {
          pages.system();
        },
      },
      {
        icon: Root.Lib.icons.users,
        text: "Account",
        title: "Account",
        onclick() {
          pages.account();
        },
      },
      {
        icon: Root.Lib.icons.brush,
        text: "Appearance",
        title: "Appearance",
        onclick() {
          pages.appearance();
        },
      },
      {
        icon: Root.Lib.icons.wifiConnected,
        text: "Network",
        title: "Network",
        onclick() {
          pages.network();
        },
      },
      {
        icon: Root.Lib.icons.application,
        text: "Applications",
        title: "Applications",
        onclick() {
          pages.applications();
        },
      },
      {
        icon: Root.Lib.icons.shield,
        text: "Security",
        title: "Security",
        onclick() {
          pages.security();
        },
      },
    ]);

    container = new Root.Lib.html("div")
      .class("container", "col", "w-100", "gap", "padded", "ovh")
      .appendTo(wrapper);

    function makeHeading(type, text) {
      if (type === "h1") {
        new Html().class(type).text(text).appendTo(container);
      } else {
        new Html().class(type, "mt-1").text(text).appendTo(container);
      }
    }
    function makeAlert(type, text) {
      new Html().class("alert", type).text(text).appendTo(container);
    }

    let pages = {
      async clear() {
        container.elm.innerHTML = "";
        desktopConfig = Object.assign(
          defaultDesktopConfig,
          JSON.parse(
            await vfs.readFile("Root/Pluto/config/appearanceConfig.json")
          )
        );
      },
      async account() {
        await this.clear();
        makeHeading("h1", "Account");

        const result = sessionStorage.userData;

        let service = Root.Core.services.find((x) => x.name === "Account");

        if (!service && !service.ref)
          return new Html("span")
            .text("Could not fetch from account service")
            .appendTo(container);

        const userData = service.ref.getUserData();

        const userBoxAvatar = new Html("div").class("icon").style({
          "--url": "url(" + userData.pfp + ")",
        });
        const userBoxName = new Html("div").text(userData.username);
        const userBoxType = new Html("div")
          .class("label")
          .text(
            userData.onlineAccount === true ? "Zeon Account" : "Local account"
          );

        const userBox = new Html("div")
          .appendMany(
            userBoxAvatar,
            new Html("div").class("text").appendMany(userBoxName, userBoxType)
          )
          .class("card-box", "max")
          .appendTo(container);

        if (result === undefined) {
          new Html("button")
            .class("primary", "small", "mc")
            .text("Login with Zeon Account")
            .on("click", async (e) => {
              let x = await Root.Modal.input(
                "Login with Zeon",
                "Enter your user name",
                "Username",
                settingsWin.elm,
                false
              );

              if (x === false) return;

              let y = await Root.Modal.input(
                "Login with Zeon",
                "Enter your password",
                "Password",
                settingsWin.elm,
                true
              );

              if (y === false) return;

              let service = Root.Core.services.find(
                (x) => x.name === "Account"
              );

              if (service) {
                let result = await service.ref.login(x, y);
                this.account();
                if (result.status === 200) {
                  Root.Modal.alert(
                    "Oops",
                    "Something went wrong while logging in:\n\n" +
                      JSON.stringify(result, null, 2),
                    settingsWin
                  );
                }
              }
            })
            .appendTo(container);
        } else {
          new Html("button")
            .class("danger", "mc")
            .text("Log out")
            .on("click", async (e) => {
              const a = await Root.Modal.prompt("Are you sure?", "Log out?");
              if (a === true) {
                let service = Root.Core.services.find(
                  (x) => x.name === "Account"
                );
                if (service && service.ref) {
                  service.ref.logout();
                }
                this.account();
              }
            })
            .appendTo(container);
          try {
            const userData = JSON.parse(sessionStorage.userData);

            if (
              userData &&
              userData.id &&
              userData.user &&
              userData.email &&
              userData.pfp
            ) {
              // ok
              userBoxAvatar.style({
                "--url":
                  "url(" + userData.pfp.replace("/", "https://zeon.dev/") + ")",
              });
              userBoxName.text(userData.user);
              userBoxType.text("Zeon Account");
            }
          } catch (e) {
            Root.Modal.alert("Something went wrong loading your user data.");
          }
        }
      },
      async system() {
        await this.clear();
        makeHeading("h1", "System");

        const sysInfo = Root.Lib.systemInfo;

        const cardBoxIcon = new Html("div")
          .class("icon")
          .style({ "--url": "url(./assets/pluto-logo.svg)" });
        const cardBoxName = new Html("div").text(
          "Pluto " + sysInfo.versionString
        );
        const cardBoxType = new Html("div")
          .class("label")
          .text(sysInfo.codename);

        const cardBox = new Html("div")
          .appendMany(
            cardBoxIcon,
            new Html("div").class("text").appendMany(cardBoxName, cardBoxType)
          )
          .class("card-box", "max")
          .appendTo(container);

        const filesystemSize =
          ((await localforage.getItem("fs")).length / 1024).toFixed(0) + " KB";

        makeHeading("h2", "Your device");

        const webProtocol = location.protocol.endsWith("s:") ? "HTTPS" : "HTTP";
        const webHost = location.host;

        // Get user agent string
        const userAgent = navigator.userAgent;

        // Get browser information
        const browser = {
          name: "",
          version: "",
        };

        if (userAgent.indexOf("Firefox") > -1) {
          browser.name = "Firefox";
          browser.version = userAgent.match(/Firefox\/([\d.]+)/)[1];
        } else if (userAgent.indexOf("Chrome") > -1) {
          browser.name = "Chrome";
          browser.version = userAgent.match(/Chrome\/([\d.]+)/)[1];
        } else if (userAgent.indexOf("Safari") > -1) {
          browser.name = "Safari";
          browser.version = userAgent.match(/Safari\/([\d.]+)/)[1];
        } else if (userAgent.indexOf("Opera") > -1) {
          browser.name = "Opera";
          browser.version = userAgent.match(/Opera\/([\d.]+)/)[1];
        } else if (userAgent.indexOf("Edge") > -1) {
          browser.name = "Microsoft Edge";
          browser.version = userAgent.match(/Edge\/([\d.]+)/)[1];
        } else {
          browser.name = "Other";
          browser.version = "";
        }

        browser.version = parseInt(browser.version);
        if (isNaN(browser.version)) browser.version = "";

        // Get operating system information
        const os = {
          name: "",
          version: "",
        };

        if (userAgent.indexOf("Windows") > -1) {
          os.name = "Windows";
          os.version = userAgent.match(/Windows NT ([\d.]+)/)[1];
        } else if (userAgent.indexOf("Mac") > -1) {
          os.name = "macOS";
          os.version = userAgent
            .match(/Mac OS X ([\d_]+)/)[1]
            .replace(/_/g, ".");
        } else if (userAgent.indexOf("Android") > -1) {
          os.name = "Android";
          os.version = userAgent.match(/Android ([\d.]+)/)[1];
        } else if (userAgent.indexOf("Linux") > -1) {
          os.name = "Linux";
        } else if (userAgent.indexOf("iOS") > -1) {
          os.name = "iOS";
          os.version = userAgent.match(/OS ([\d_]+)/)[1].replace(/_/g, ".");
        } else {
          os.name = "Other";
          os.version = "";
        }

        os.version = parseInt(os.version);
        if (isNaN(os.version)) os.version = "";

        // Get device type
        const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent);
        const deviceType = isMobile ? "Mobile" : "Desktop";

        const yourDevice = new Html("div")
          .class("card-box", "list", "max")
          .appendMany(
            // OS
            new Html()
              .class("item")
              .appendMany(
                new Html().text("Operating System"),
                new Html()
                  .class("label")
                  .text((os.name + " " + os.version).trim())
              ),
            // Browser
            new Html()
              .class("item")
              .appendMany(
                new Html().text("Web Browser"),
                new Html()
                  .class("label")
                  .text((browser.name + " " + browser.version).trim())
              ),
            // Device type
            new Html()
              .class("item")
              .appendMany(
                new Html().text("Device Type"),
                new Html().class("label").text(deviceType)
              ),
            // Protocol
            new Html()
              .class("item")
              .appendMany(
                new Html().text("Web Protocol"),
                new Html().class("label").text(webProtocol)
              ),
            // Host
            new Html()
              .class("item")
              .appendMany(
                new Html().text("Web Host"),
                new Html().class("label").text(webHost)
              )
          )
          .appendTo(container);

        makeHeading("h2", "Pluto Information");

        const plutoDetails = new Html("div")
          .class("card-box", "list", "max")
          .appendMany(
            // FS Capacity
            new Html()
              .class("item")
              .appendMany(
                new Html().text("Storage Used"),
                new Html().class("label").text(filesystemSize)
              ),
            // Core Version
            new Html()
              .class("item")
              .appendMany(
                new Html().text("Core Version"),
                new Html().class("label").text(sysInfo.versionString)
              ),
            // Supported Versions
            new Html()
              .class("item")
              .appendMany(
                new Html().text("Supported Versions"),
                new Html().class("label").text("<" + sysInfo.versionString)
              )
          )
          .appendTo(container);

        // new Html("button")
        //   .text("WIPE entire file system (dangerous)")
        //   .class("danger", "mc", "small")
        //   .on("click", async (e) => {
        //     console.log("a");
        //     window.r = Root;
        //     let result = await Root.Modal.prompt(
        //       "Confirmation",
        //       "Are you sure you want to do this?\nThis action is DESTRUCTIVE and cannot be undone.",
        //       settingsWin.elm
        //     );

        //     if (result === true) {
        //       localStorage.clear();
        //       await vfs.importFS();
        //       await vfs.save();
        //       let result = await Root.Modal.prompt(
        //         "Success",
        //         "Cleared file system.\nWant to launch PassiveReboot as well?",
        //         settingsWin.elm
        //       );

        //       if (result === true) {
        //         Root.Lib.launch("apps:PassiveReboot", settingsWin.elm);
        //       }
        //     }
        //   })
        //   .appendTo(container);
      },
      async appearance() {
        await this.clear();
        makeHeading("h1", "Appearance");

        const themeSelectSpan = new Html("span")
          .class("row", "ac", "js", "gap")
          .appendTo(container);

        themeSelectSpan.append(new Html("span").text("Theme"));

        // Get the themes stored on the system, else fall back to default themes
        const defaultThemes = [
          new Html("option").text("Dark").attr({
            value: "dark",
            selected: desktopConfig.theme === "dark" ? true : null,
          }),
          new Html("option").text("Light").attr({
            value: "light",
            selected: desktopConfig.theme === "light" ? true : null,
          }),
        ];

        const check = await vfs.whatIs("Root/Pluto/config/themes");

        let themes = [];
        let themeData = [];

        if (check === null) {
          // non exist
          themes = defaultThemes;
        } else {
          const themeFileListReal = await vfs.list("Root/Pluto/config/themes");
          const themeFileList = themeFileListReal
            .filter((r) => r.type === "file" && r.item.endsWith(".theme"))
            .map((r) => r.item);

          await themeFileList.forEach(async (itm) => {
            const theme = await vfs.readFile(`Root/Pluto/config/themes/${itm}`);
            const result = themeLib.validateTheme(theme);
            if (result.success === true) {
              themes.push(
                new Html("option").text(result.data.name).attr({
                  value: themes.length,
                  selected: desktopConfig.theme === itm ? true : null,
                })
              );
              themeData.push(Object.assign({ fileName: itm }, result.data));
            } else {
              alert("failed parsing theme data due to " + result.message);
            }
          });
        }

        new Html("select")
          .appendMany(...themes)
          .on("input", (e) => {
            // set the option and do the save
            if (isNaN(parseInt(e.target.value))) {
              // apply theme
              desktopConfig.theme = e.target.value;
              themeLib.setCurrentTheme(x);
            } else {
              const x = themeData[parseInt(e.target.value)];
              console.log(x);
              desktopConfig.theme = x.fileName;
              themeLib.setCurrentTheme(x);
            }
            save();
          })
          .class("if", "mc")
          .appendTo(themeSelectSpan);

        new Html("span")
          .appendMany(
            new Html("input")
              .attr({
                type: "checkbox",
                id: Root.PID + "lc",
                checked: desktopConfig.useThemeWallpaper === true ? true : null,
              })
              .on("input", async (e) => {
                desktopConfig.useThemeWallpaper = e.target.checked;
                if (desktopConfig.theme.endsWith(".theme")) {
                  const currentTheme = themeLib.validateTheme(
                    await vfs.readFile(
                      "Root/Pluto/config/themes/" + desktopConfig.theme
                    )
                  );

                  if (currentTheme.success === true) {
                    if (desktopConfig.useThemeWallpaper === true) {
                      /// use wallpaper from theme
                      themeLib.setWallpaper(currentTheme.data.wallpaper);
                    } else {
                      /// don't use wallpaper from theme
                      themeLib.setWallpaper("default");
                    }
                  } else {
                    Root.Modal.alert(
                      "Error",
                      "Failed to save: " + currentTheme.message
                    );
                    return;
                  }
                }
                save();
              }),
            new Html("label")
              .attr({
                for: Root.PID + "lc",
              })
              .text("Use wallpaper from theme")
          )
          .appendTo(container);

        const sidebarTypeSpan = new Html("span")
          .class("row", "ac", "js", "gap")
          .appendTo(container);

        sidebarTypeSpan.appendMany(
          new Html("span").text("Toolbar position"),
          new Html("select")
            .appendMany(
              new Html("option").text("Vertical").attr({
                value: "vertical",
                selected:
                  desktopConfig.sidebarType === "vertical" ? true : null,
              }),
              new Html("option").text("Horizontal").attr({
                value: "horizontal",
                selected:
                  desktopConfig.sidebarType === "horizontal" ? true : null,
              })
            )
            .on("input", (e) => {
              desktopConfig.sidebarType = e.target.value;
              document.documentElement.dataset.sidebarType = e.target.value;
              save();
            })
            .class("if", "mc")
        );
      },
      async network() {
        await this.clear();
        makeHeading("h1", "Networking");

        new Html("button")
          .text("Test Network")
          .class("primary", "mc", "small")
          .on("click", async (e) => {
            const req = await fetch("https://zeon.dev");
            if (req.status === 200) {
              Root.Modal.alert("Success", "Network is working!");
            } else {
              Root.Modal.alert(
                "Failed",
                "Network is not working. Status code: " + req.status
              );
            }
          })
          .appendTo(container);
      },
      async applications() {
        await this.clear();
        makeHeading("h1", "Applications");
        let installedApps = (await vfs.list("Root/Pluto/apps"))
          .filter((p) => p.type === "file" && p.item.endsWith(".app"))
          .map((i) => i.item);
        console.log(installedApps);
        if (installedApps.length > 0) {
          installedApps.forEach(async (e) => {
            let splitE = e.split(".");
            let name = splitE[0];
            let extension = splitE[1];
            console.log(name, extension);

            const a = (
              await import(
                `data:text/javascript;base64,${btoa(
                  await vfs.readFile(`Root/Pluto/apps/${name}.app`)
                )}`
              )
            ).default;
            console.log(a);

            Card.new(
              container,
              new Html("div").class("flex-group", "col").appendMany(
                new Html("span").class("h2").text(a.name), // Actual name
                new Html("code")
                  .class("label")
                  .style({
                    "margin-top": "-4px",
                  })
                  .text(`${name}.app`), // Type
                // Filename and Version
                new Html("span").text(a.description), // Description
                new Html("span")
                  .class("label-light")
                  .text(`(supports core ${a.ver})`) //
              )
            );
          });
        } else {
          new Html("span")
            .text("You have no installed applications.")
            .appendTo(container);
        }
      },
      async security() {
        await this.clear();
        makeHeading("h1", "Security");
        makeAlert(
          "warning",
          "This section is currently not finished. Come back later when it's completed."
        );
      },
    };

    pages.system();

    return Root.Lib.setupReturns((m) => {
      console.log("Example received message: " + m);
    });
  },
};
