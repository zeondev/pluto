export default {
  name: "App Store",
  description: "Pluto App Store",
  ver: 1, // Compatible with core v1
  type: "process",
  privileges: [
    {
      privilege: "startPkg",
      description: "Open apps you have installed",
    },
  ],
  strings: {
    en_US: {
      appStore_welcome: "Welcome",
    },
  },
  exec: async function (Root) {
    let wrapper; // Lib.html | undefined
    let StoreWindow;
    let pages;

    const Win = (await Root.Lib.loadLibrary("WindowSystem")).win;

    StoreWindow = new Win({
      title: "App Store",
      pid: Root.PID,
      width: "500px",
      height: "350px",
      onclose: () => {
        Root.Lib.onEnd();
      },
    });

    const Html = Root.Lib.html;

    Root.Lib.setOnEnd((_) => StoreWindow.close());

    if (!Root.Core && !Root.Core.startPkg) return Root.Lib.onEnd();

    const vfs = await Root.Lib.loadLibrary("VirtualFS");

    wrapper = StoreWindow.window.querySelector(".win-content");

    wrapper.classList.add("row", "o-h", "h-100", "with-sidebar");

    // Hide sidebar (for now)

    // const TextSidebar = await Root.Lib.loadComponent("TextSidebar");

    // TextSidebar.new(wrapper, [
    //   {
    //     icon: Root.Lib.icons.package,
    //     text: "Apps",
    //     title: "Apps",
    //     onclick() {
    //       pages.appsList();
    //     },
    //   },
    //   {
    //     icon: Root.Lib.icons.wrench,
    //     text: "Settings",
    //     title: "Settings",
    //     onclick() {
    //       pages.settings();
    //     },
    //   },
    // ]);

    const container = new Root.Lib.html("div")
      .class("col", "w-100", "gap", "ovh", "app-store")
      .appendTo(wrapper);

    try {
      new Html("div").class("row", "fc").text("Loading...").appendTo(container);

      let host = "https://zeondev.github.io/Pluto-AppStore/";

      const appStoreModule = (await import(`${host}import.js`)).default;

      // Check if this is the right app store module
      if (appStoreModule.init) {
        await appStoreModule.init(host);

        const sysInfo = Root.Lib.systemInfo;

        function getAppCompatibility(appVersion, coreVersion) {
          let appCompatible, appCompatibleColor, appCompatibleIcon;
          if (
            parseFloat(coreVersion.toFixed(1)) <
            parseFloat(appVersion.toFixed(1))
          ) {
            // not compatible
            appCompatible = "err";
          } else if (
            parseFloat(coreVersion.toFixed(1)) >
            parseFloat(appVersion.toFixed(1))
          ) {
            // warn of possible incompatibility
            appCompatible = "warn";
          } else {
            appCompatible = "ok";
          }

          if (appCompatible === "ok") {
            appCompatibleIcon = Root.Lib.icons.circleCheck;
          } else if (appCompatible === "warn") {
            appCompatibleIcon = Root.Lib.icons.warning;
          } else if (appCompatible === "err") {
            appCompatibleIcon = Root.Lib.icons.circleExclamation;
          }

          if (appCompatible === "ok") appCompatibleColor = "success";
          else if (appCompatible === "warn") appCompatibleColor = "warning";
          else if (appCompatible === "err") appCompatibleColor = "danger";

          return { appCompatible, appCompatibleColor, appCompatibleIcon };
        }

        async function installApp(pkg, app, force = false) {
          await fetch(`${host}pkgs/${pkg}/${app.assets.path}`)
            .then(async (e) => {
              console.log(await vfs.whatIs(`Root/Pluto/apps/${app.name}.app`));
              if (
                (await vfs.whatIs(`Root/Pluto/apps/${app.name}.app`)) ===
                  null ||
                force == true
              ) {
                let result = await e.text();

                await vfs.writeFile(`Root/Pluto/apps/${app.name}.app`, result);

                pages.appPage(app, pkg);
              } else if (
                (await vfs.whatIs(`Root/Pluto/apps/${app.name}.app`)) === "file"
              ) {
                await Root.Core.startPkg(
                  "data:text/javascript;base64," +
                    btoa(await vfs.readFile(`Root/Pluto/apps/${app.name}.app`)),
                  false,
                  true
                );
              }
            })
            .catch((e) => {
              Root.Modal.alert(
                "Notice",
                `Something went wrong while installing the app.`,
                container.elm
              );
            });
        }

        pages = {
          async clear() {
            container.elm.innerHTML = "";
          },
          async appsList() {
            this.clear();

            const packageList = await appStoreModule.list();

            // const searchBar = new Html("div")
            //   .class("search-bar")
            //   .appendMany(
            //     new Html("input")
            //       .attr({
            //         placeholder: "Search apps",
            //       })
            //       .class("transparent", "m-0", "pad")
            //       .on("input", (e) => {
            //         console.log(e.target.value);
            //       })
            //   )
            //   .appendTo(container);

            // const fuzzySearch = function (term, ratio) {
            //   var string = this.toLowerCase();
            //   var compare = term.toLowerCase();
            //   var matches = 0;
            //   if (string.indexOf(compare) > -1) return true; // covers basic partial matches
            //   for (var i = 0; i < compare.length; i++) {
            //     string.indexOf(compare[i]) > -1
            //       ? (matches += 1)
            //       : (matches -= 1);
            //   }
            //   return matches / this.length >= ratio || term == "";
            // };

            const appsList = new Html("div")
              .class("apps", "ovh", "fg")
              .appendTo(container);

            async function renderAppsList() {
              for (let pkg of packageList) {
                const app = await appStoreModule.fetch(pkg);

                console.log("pkgResult", app);

                const { appCompatibleColor, appCompatibleIcon } =
                  getAppCompatibility(app.compatibleWith, sysInfo.version);

                new Html("div")
                  .class("app")
                  .appendMany(
                    new Html("div").class("app-meta").appendMany(
                      new Html("img").class("app-icon").attr({
                        src: `${host}pkgs/${pkg}/${app.assets.icon}`,
                      }),
                      new Html("div")
                        .class("app-text")
                        .appendMany(
                          new Html("span")
                            .class("row", "gap", "fc")
                            .appendMany(
                              new Html("span").class("h3").text(app.name),
                              new Html("span")
                                .class("label")
                                .text(`by ${app.author}`)
                            ),
                          new Html("span").text(app.shortDescription)
                        ),
                      new Html("div")
                        .class("row", "ml-auto")
                        .append(
                          new Html("div")
                            .html(appCompatibleIcon)
                            .class(appCompatibleColor, "row")
                        )
                    ),
                    new Html("div").class("app-buttons").appendMany(
                      new Html("button").text("View").on("click", (e) => {
                        pages.appPage(app, pkg);
                      })
                    )
                  )
                  .appendTo(appsList);
              }
            }

            renderAppsList();
          },
          async appPage(app, pkg) {
            this.clear();
            console.log("loading new app page");

            console.log(app, pkg);

            const appIconUrl = `${host}pkgs/${pkg}/${app.assets.icon}`;
            const appHasBanner = app.assets.banner ? true : false;
            const appBannerUrl = appHasBanner
              ? `${host}pkgs/${pkg}/${app.assets.banner}`
              : `${host}pkgs/${pkg}/${app.assets.icon}`;

            const { appCompatible, appCompatibleColor, appCompatibleIcon } =
              getAppCompatibility(app.compatibleWith, sysInfo.version);

            new Html("div")
              .class("app-banner", appHasBanner === false ? "no-banner" : null)
              .style({
                "--url": "url(" + appBannerUrl + ")",
              })
              .append(
                new Html("button")
                  .class("transparent", "square", "mc", "mhc")
                  .html(Root.Lib.icons.back)
                  .on("click", (e) => {
                    this.appsList();
                  })
              )
              .appendTo(container);

            async function makeInstallOrOpenButton() {
              let localHash = new Hashes.MD5().hex(
                await vfs.readFile(`Root/Pluto/apps/${app.name}.app`)
              );
              const appHash = await fetch(
                `${host}pkgs/${pkg}/${app.assets.path}`
              ).then(async (e) => {
                return new Hashes.MD5().hex(await e.text());
              });

              const whatIsApp = await vfs.whatIs(
                `Root/Pluto/apps/${app.name}.app`
              );

              return [
                new Html("button")
                  .text(
                    whatIsApp === null
                      ? "Install"
                      : localHash !== appHash
                      ? "Update"
                      : whatIsApp === "file"
                      ? "Open"
                      : "Error"
                  )
                  .class("primary")
                  .attr({ id: "installButton" })
                  .on("click", async (e) => {
                    if (localHash !== appHash && whatIsApp !== null) {
                      await installApp(pkg, app, true);
                    } else if (localHash !== appHash && whatIsApp === null) {
                      if (appCompatible === "ok") {
                        await installApp(pkg, app, true);
                      } else {
                        const result = await Root.Modal.prompt(
                          "Notice",
                          `This app (made for ${app.compatibleWith}) may be incompatible with your current version of Pluto (${sysInfo.version}).\nAre you sure you want to continue installing?`,
                          container.elm
                        );

                        if (result === true) {
                          await installApp(pkg, app);
                        }
                      }
                    } else {
                      await installApp(pkg, app);
                    }
                  }),
                whatIsApp != null
                  ? new Html("button")
                      .text("Uninstall")
                      .class("danger")
                      .on("click", async (e) => {
                        let result = await Root.Modal.prompt(
                          "Are you sure?",
                          "Are you sure you want to delete this app?",
                          wrapper
                        );

                        if (result === true) {
                          await vfs.delete(`Root/Pluto/apps/${app.name}.app`);
                          // await Root.Modal.alert(
                          //   "App Deleted!",
                          //   `${app.name} has been successfully deleted!`
                          // );
                          pages.appPage(app, pkg);
                        }
                      })
                  : new Html(),
                // .appendTo(container),
              ];
            }

            new Html("div")
              .class("app", "in-menu")
              .appendMany(
                new Html("div").class("app-meta").appendMany(
                  new Html("img").class("app-icon").attr({
                    src: appIconUrl,
                  }),
                  new Html("div")
                    .class("app-text")
                    .appendMany(
                      new Html("span")
                        .class("row", "gap", "fc")
                        .appendMany(
                          new Html("span").class("h3").text(app.name),
                          new Html("span")
                            .class("label")
                            .text(`by ${app.author}`)
                        ),
                      new Html("span").text(app.description)
                    ),
                  new Html("div")
                    .class("row", "ml-auto")
                    .append(
                      new Html("div")
                        .html(appCompatibleIcon)
                        .class(appCompatibleColor, "row")
                    )
                ),
                new Html("div")
                  .class("app-buttons")
                  .appendMany(...(await makeInstallOrOpenButton()))
              )
              .appendTo(container);
          },
          async settings() {
            this.clear();
            const box = new Html("div")
              .class("padded", "col", "gap")
              .appendTo(container);
            new Html("span")
              .class("h1")
              .text("Advanced Settings")
              .appendTo(box);

            const URLregex = new RegExp(
              /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi
            );

            let inputValue = "";
            let useCustomRepo = false;

            const input = new Html("input")
              .attr({
                type: "text",
                placeholder: "Custom Repository URL",
              })
              .on("input", (e) => {
                if (!e.target.value.match(URLregex)) {
                  e.target.style.borderColor = "var(--negative)";
                } else {
                  e.target.style.borderColor = "var(--outline)";
                }
                inputValue = e.target.value;
                if (useCustomRepo === true) {
                  host = e.target.value;
                }
              })
              .appendTo(box);

            new Html("span")
              .appendMany(
                new Html("input")
                  .attr({
                    type: "checkbox",
                    id: Root.PID + "chk",
                  })
                  .on("input", async (e) => {
                    console.log(e.target.checked);
                    if (e.target.checked === true) {
                      let result = await Root.Modal.prompt(
                        "Are you sure",
                        "Are you sure you want to use a custom app store repository?",
                        wrapper
                      );

                      if (result === true) {
                        useCustomRepo = true;
                      } else {
                        e.target.checked = false;
                        useCustomRepo = false;
                      }
                    } else {
                      useCustomRepo = false;
                    }
                  }),
                new Html("label")
                  .attr({
                    for: Root.PID + "chk",
                  })
                  .text("Use custom Server URL")
              )
              .appendTo(box);
          },
        };

        await pages.appsList();
      } else
        Root.Modal.alert(
          "Notice",
          "App Store module missing on server.",
          wrapper
        );
    } catch (e) {
      Root.Modal.alert(
        "Error",
        "Something went wrong, and we could not fetch app store database.\n\n" +
          e.message,
        wrapper
      );
    }

    return Root.Lib.setupReturns((m) => {
      console.log("Example received message: " + m);
    });
  },
};
