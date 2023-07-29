export default {
  name: "App Store",
  description: "Pluto App Store",
  ver: 1, // Compatible with core v1
  type: "process",
  strings: {
    en_US: {
      appStore_welcome: "Welcome",
    },
  },
  exec: async function (Root) {
    let wrapper; // Lib.html | undefined
    let StoreWindow;

    const Win = (await Root.Lib.loadLibrary("WindowSystem")).win;

    // Testing the html library
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

    const vfs = await Root.Lib.loadLibrary("VirtualFS");

    wrapper = StoreWindow.window.querySelector(".win-content");

    const container = new Root.Lib.html("div")
      .class("col", "w-100", "gap", "ovh", "app-store")
      .appendTo(wrapper);

    try {
      new Html("div").class("row", "fc").text("Loading...").appendTo(container);

      const host = "https://zeondev.github.io/Pluto-AppStore/";

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

        async function installApp(pkg, app) {
          await fetch(`${host}pkgs/${pkg}/${app.assets.path}`)
            .then(async (e) => {
              let result = await e.text();

              await vfs.writeFile(`Root/Pluto/apps/${app.name}.app`, result);

              await Root.Modal.alert(
                "Success",
                `Your app has been installed!`,
                container.elm
              );
            })
            .catch((e) => {
              Root.Modal.alert(
                "Notice",
                `Something went wrong while installing the app.`,
                container.elm
              );
            });
        }

        const pages = {
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
                        )
                    ),
                    new Html("div").class("app-buttons").appendMany(
                      new Html("div")
                        .html(appCompatibleIcon)
                        .class(appCompatibleColor, "row"),
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

            new Html("div")
              .class("app")
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
                    )
                ),
                new Html("div").class("app-buttons").appendMany(
                  new Html("div")
                    .html(appCompatibleIcon)
                    .class(appCompatibleColor, "row"),
                  new Html("button")
                    .text("Install")
                    .class("primary")
                    .on("click", async (e) => {
                      if (appCompatible === "ok") {
                        await installApp(pkg, app);
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
                    })
                )
              )
              .appendTo(container);
          },
        };

        await pages.appsList();
      } else throw new Error("Not the app store module");
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
