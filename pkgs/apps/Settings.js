let pages;

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
    {
      privilege: "setLanguage",
      description: "Allow the user to configure the system language",
    },
  ],
  strings: {
    en_US: {
      thisSystem: "This system",
      yourDevice: "Your device",
      operatingSystem: "Operating system",
      webBrowser: "Web browser",
      deviceType: "Device type",
      webProtocol: "Web protocol",
      webHost: "Web host",
      plutoInfo: "Pluto Information",
      storageUsed: "Storage used",
      coreVersion: "Core version",
      supportedVersions: "Supported versions",
    },
    de_DE: {
      thisSystem: "Dieses System",
      yourDevice: "Ihr Gerät",
      operatingSystem: "Betriebssystem",
      webBrowser: "Web browser",
      deviceType: "Gerätetyp",
      webProtocol: "Webprotokoll",
      webHost: "Web-Host",
      plutoInfo: "Pluto-Informationen",
      storageUsed: "Speicher verwendet",
      coreVersion: "Kernversion",
      supportedVersions: "Unterstützte Versionen",
    },
    es_ES: {
      thisSystem: "Este sistema",
      yourDevice: "Tu dispositivo",
      operatingSystem: "Sistema operativo",
      webBrowser: "Navegador web",
      deviceType: "Tipo de dispositivo",
      webProtocol: "Protocolo web",
      webHost: "Alojamiento web",
      plutoInfo: "Información de Plutón",
      storageUsed: "Memoria usada",
      coreVersion: "Versión central",
      supportedVersions: "Versiones compatibles",
    },
    pt_BR: {
      thisSystem: "Este sistema",
      yourDevice: "Seu dispositivo",
      operatingSYstem: "Sistema operativo",
      webBrowser: "Navegador da Web",
      deviceType: "Tipo de dispositivo",
      webProtocol: "Protocolo da web",
      webHost: "Host da web",
      plutoInfo: "Informação",
      storageUsed: "Memoria usada",
      coreVersion: "Versão da core",
      supportedVersions: "Versãos suportado",
    },
  },
  exec: async function (Root) {
    let wrapper; // Lib.html | undefined
    let settingsWin;
    Root.Lib.setOnEnd(
      (_) => settingsWin && settingsWin.close && settingsWin.close()
    );

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
    const codeScanner = await Root.Lib.loadLibrary("CodeScanner");
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

    let currentPage = "system";

    function setupSettingsApp() {
      wrapper.innerHTML = "";

      TextSidebar.new(wrapper, [
        {
          icon: Root.Lib.icons.cpu,
          text: Root.Lib.getString("system"),
          title: Root.Lib.getString("system"),
          onclick() {
            pages.system();
          },
        },
        {
          icon: Root.Lib.icons.users,
          text: Root.Lib.getString("account"),
          title: Root.Lib.getString("account"),
          onclick() {
            pages.account();
          },
        },
        {
          icon: Root.Lib.icons.brush,
          text: Root.Lib.getString("appearance"),
          title: Root.Lib.getString("appearance"),
          onclick() {
            pages.appearance();
          },
        },
        {
          icon: Root.Lib.icons.wifiConnected,
          text: Root.Lib.getString("network"),
          title: Root.Lib.getString("network"),
          onclick() {
            pages.network();
          },
        },
        {
          icon: Root.Lib.icons.application,
          text: Root.Lib.getString("applications"),
          title: Root.Lib.getString("applications"),
          onclick() {
            pages.applications();
          },
        },
        {
          icon: Root.Lib.icons.shield,
          text: Root.Lib.getString("security"),
          title: Root.Lib.getString("security"),
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

      pages = {
        async clear(pageName) {
          container.elm.innerHTML = "";
          currentPage = pageName;
          desktopConfig = Object.assign(
            defaultDesktopConfig,
            JSON.parse(
              await vfs.readFile("Root/Pluto/config/appearanceConfig.json")
            )
          );
        },
        async account() {
          await this.clear("account");
          makeHeading("h1", Root.Lib.getString("account"));

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
              userData.onlineAccount === true
                ? Root.Lib.getString("zeonAccount")
                : Root.Lib.getString("localAccount")
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
                    "url(" +
                    userData.pfp.replace("/", "https://zeon.dev/") +
                    ")",
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
          await this.clear("system");
          makeHeading("h1", Root.Lib.getString("system"));

          const sysInfo = Root.Lib.systemInfo;

          const cardBoxIcon = new Html("div")
            .class("icon")
            .style({ "--url": "url(./assets/pluto-logo.svg)" });
          const cardBoxName = new Html("div").text(
            `${Root.Lib.getString("plutoName")} ${sysInfo.versionString}`
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
            ((await localforage.getItem("fs")).length / 1024).toFixed(0) +
            " KB";

          makeHeading("h2", Root.Lib.getString("yourDevice"));

          const webProtocol = location.protocol.endsWith("s:")
            ? "HTTPS"
            : "HTTP";
          let webHost = location.host;

          // Get user agent string
          const userAgent = navigator.userAgent;

          if (webHost === "" && userAgent.includes("Electron")) {
            webHost = "Local (Electron)";
          } else if (webHost === "") {
            webHost = "Local";
          }

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
                  new Html().text(Root.Lib.getString("operatingSystem")),
                  new Html()
                    .class("label")
                    .text((os.name + " " + os.version).trim())
                ),
              // Browser
              new Html()
                .class("item")
                .appendMany(
                  new Html().text(Root.Lib.getString("webBrowser")),
                  new Html()
                    .class("label")
                    .text((browser.name + " " + browser.version).trim())
                ),
              // Device type
              new Html()
                .class("item")
                .appendMany(
                  new Html().text(Root.Lib.getString("deviceType")),
                  new Html().class("label").text(deviceType)
                ),
              // Protocol
              new Html()
                .class("item")
                .appendMany(
                  new Html().text(Root.Lib.getString("webProtocol")),
                  new Html().class("label").text(webProtocol)
                ),
              // Host
              new Html()
                .class("item")
                .appendMany(
                  new Html().text(Root.Lib.getString("webHost")),
                  new Html().class("label").text(webHost)
                )
            )
            .appendTo(container);

          makeHeading("h2", Root.Lib.getString("plutoInfo"));

          const plutoDetails = new Html("div")
            .class("card-box", "list", "max")
            .appendMany(
              // FS Capacity
              new Html()
                .class("item")
                .appendMany(
                  new Html().text(Root.Lib.getString("storageUsed")),
                  new Html().class("label").text(filesystemSize)
                ),
              // Core Version
              new Html()
                .class("item")
                .appendMany(
                  new Html().text(Root.Lib.getString("coreVersion")),
                  new Html().class("label").text(sysInfo.versionString)
                ),
              // Supported Versions
              new Html()
                .class("item")
                .appendMany(
                  new Html().text(Root.Lib.getString("supportedVersions")),
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
          await this.clear("appearance");
          makeHeading("h1", Root.Lib.getString("appearance"));

          const themeSelectSpan = new Html("span")
            .class("row", "ac", "js", "gap")
            .appendTo(container);

          themeSelectSpan.append(
            new Html("span").text(Root.Lib.getString("theme"))
          );

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
            const themeFileListReal = await vfs.list(
              "Root/Pluto/config/themes"
            );
            const themeFileList = themeFileListReal
              .filter((r) => r.type === "file" && r.item.endsWith(".theme"))
              .map((r) => r.item);

            await themeFileList.forEach(async (itm) => {
              const theme = await vfs.readFile(
                `Root/Pluto/config/themes/${itm}`
              );
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
                  checked:
                    desktopConfig.useThemeWallpaper === true ? true : null,
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

          const dockStyleSpan = new Html("span")
            .class("row", "ac", "js", "gap")
            .appendTo(container);

          dockStyleSpan.appendMany(
            new Html("span").text("Dock style"),
            new Html("select")
              .appendMany(
                new Html("option").text("Full").attr({
                  value: "vertical",
                  selected:
                    desktopConfig.dockStyle === "vertical" ? true : null,
                }),
                new Html("option").text("Compact").attr({
                  value: "compact",
                  selected: desktopConfig.dockStyle === "compact" ? true : null,
                })
              )
              .on("input", (e) => {
                desktopConfig.dockStyle = e.target.value;

                Html.qs(".desktop .dock").classOn("hiding");

                setTimeout(() => {
                  // a bit hacky to do the animation
                  Html.qs(".desktop .dock").classOff("hiding");
                  document.documentElement.dataset.dockStyle = e.target.value;
                }, 600);

                save();
              })
              .class("if", "mc")
          );

          const languageSelectSpan = new Html("span")
            .class("row", "ac", "js", "gap")
            .appendTo(container);

          languageSelectSpan.appendMany(
            new Html("span").text(Root.Lib.getString("Language")),
            new Html("select")
              .appendMany(
                ...Root.Lib.langs.map((l) => {
                  return new Html("option")
                    .text(Root.Lib.getString("lang_" + l))
                    .attr({
                      value: l,
                      selected: desktopConfig.language === l ? true : null,
                    });
                })
              )
              .on("input", (e) => {
                desktopConfig.language = e.target.value;
                Root.Core.setLanguage(e.target.value);
                save();
              })
              .class("if", "mc")
          );
        },
        async network() {
          await this.clear("network");
          makeHeading("h1", Root.Lib.getString("network"));
          let resultTab = new Html("div").appendTo(container);
          resultTab.class("row", "ac", "js", "gap");
          resultTab.clear();
          new Html("button")
            .text("Test Network")
            .class("primary", "mc", "small")
            .on("click", async (e) => {
              resultTab.clear();
              let d1 = new Date();
              const req1 = await fetch(
                "https://zeon.dev" + "?dummy=" + Date.now()
              );
              let d2 = new Date();
              let d3 = new Date();
              const req2 = await fetch(
                "https://zeon.dev" + "?dummy=" + Date.now()
              );
              let d4 = new Date();
              if (req1.status === 200 && req2.status === 200) {
                console.log(d1 - d2);
                console.log(d4 - d3);

                let averageResponseTime = (d2 - d1 + (d4 - d3)) / 2;
                let averageResponse;
                if (averageResponseTime < 100) {
                  console.log("good");
                  averageResponse = "fast";
                } else if (averageResponseTime > 100) {
                  console.log("good");
                  averageResponse = "good";
                } else if (averageResponseTime > 150) {
                  console.log("ok");
                  averageResponse = "ok";
                } else if (averageResponseTime > 200) {
                  console.log("slow");
                  averageResponse = "slow";
                }

                // Root.Modal.alert(
                //   "Success",
                //   "You're online and good to go!\n\nYour internet speed is " +
                //     averageResponse +
                //     ". " +
                //     "Average response time: " +
                //     averageResponseTime +
                //     "ms"
                // );
                new Html("span")
                  .appendMany(
                    new Html("span")
                      .class("h2")
                      .style({ "margin-bottom": "8px" })
                      .text("You're online and good to go!"),
                    new Html("span").text(
                      "Your internet is " + averageResponse + "\n"
                    ),
                    new Html("span")
                      .class("muted")
                      .text(
                        "Average response time: " + averageResponseTime + "ms"
                      )
                  )
                  .appendTo(resultTab);
              } else {
                Root.Modal.alert(
                  "Failed",
                  "Network is not working. Status code: " +
                    req1.status +
                    ", " +
                    req2.status
                );
              }
            })
            .appendTo(container);
        },
        async applications() {
          await this.clear("applications");
          makeHeading("h1", Root.Lib.getString("applications"));
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
          async function performSecurityScan() {
            let dc = await codeScanner.scanForDangerousCode();
            table.clear();

            new Html("thead")
              .appendMany(
                new Html("tr").appendMany(
                  new Html("th").text("Name"),
                  new Html("th").text("Safe"),
                  new Html("th").text("Delete App")
                )
              )
              .appendTo(table);

            console.log(dc, dc.length, 0 < dc.length, 1 < dc.length);

            for (let i = 0; i < dc.length; i++) {
              if (dc[i].success) {
                new Html("tbody")
                  .appendMany(
                    new Html("tr").appendMany(
                      new Html("td").text(dc[i].filename),
                      new Html("td").text(
                        dc[i].dangerous === true ? "No" : "Yes"
                      ),
                      new Html("td").appendMany(
                        dc[i].dangerous === true
                          ? new Html("button")
                              .text("Delete")
                              .on("click", async (_) => {
                                await dc[i].delete();
                                await performSecurityScan();
                              })
                          : new Html("button")
                              .attr({ disabled: true })
                              .text("Delete")
                      )
                    )
                  )
                  .appendTo(table);
              }
            }
          }
          await this.clear("security");
          // makeAlert("warning", "This section is currently not finished.");
          makeHeading("h1", Root.Lib.getString("security"));
          let table = new Html("table")
            .class("w-100")
            .appendMany()
            .appendTo(container);
          new Html("button")
            .text("Security Check")
            .class("primary", "mc", "small")
            .on("click", async (_) => performSecurityScan())
            .appendTo(container);

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

          new Html("span")
            .appendMany(
              new Html("input")
                .attr({
                  type: "checkbox",
                  id: Root.PID + "lc",
                  checked: settingsConfig.warnSecurityIssues,
                })
                .on("input", async (e) => {
                  settingsConfig.warnSecurityIssues = e.target.checked;
                  await vfs.writeFile(
                    "Root/Pluto/config/settingsConfig.json",
                    JSON.stringify(settingsConfig)
                  );
                }),
              new Html("label")
                .attr({
                  for: Root.PID + "lc",
                })
                .text("Check every startup?")
            )
            .appendTo(container);
        },
      };

      setTimeout((_) => pages[currentPage]());
    }

    console.log("loading settings pap", pages);

    await setupSettingsApp();

    return Root.Lib.setupReturns(async (m) => {
      if (m && m.type) {
        if (m.type === "refresh") {
          Root.Lib.getString = m.data;
          setupSettingsApp();
        }
        if (m.type === "goPage") {
          // setupSettingsApp();
          console.log(m.data);
          console.log(m);
          console.log(pages);
          pages[m.data] !== undefined && (await pages[m.data]());
        }
      }
    });
  },
};
