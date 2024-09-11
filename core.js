// Pluto
(async () => {
  const semver = (await import("./assets/semver.min.js")).default;
  try {
    const coreDetails = {
      version: "v1.6.2",
      codename: "Elysium",
    };
    // for compatibility
    coreDetails.versionString = coreDetails.version;
    coreDetails.minSupported = `<=${coreDetails.version}`;
    const knownLibraries = [];
    const GlobalLib = {
      getString,
      semver,
      escapeHtml: escapeHtml,
      html: class Html {
        /** The HTML element referenced in this instance. Change using `.swapRef()`, or remove using `.cleanup()`. */
        elm;
        /**
         * Create a new instance of the Html class.
         * @param elm The HTML element to be created or classified from.
         */
        constructor(elm) {
          if (elm instanceof HTMLElement) {
            this.elm = elm;
          } else {
            this.elm = document.createElement(elm || "div");
          }
        }
        /**
         * Sets the text of the current element.
         * @param val The text to set to.
         * @returns Html
         */
        text(val) {
          this.elm.innerText = val;
          return this;
        }
        /**
         * Sets the text of the current element.
         * @param val The text to set to.
         * @returns Html
         */
        html(val) {
          this.elm.innerHTML = val;
          return this;
        }
        /**
         * Safely remove the element. Can be used in combination with a `.swapRef()` to achieve a "delete & swap" result.
         * @returns Html
         */
        cleanup() {
          this.elm.remove();
          return this;
        }
        /**
         * querySelector something.
         * @param selector The query selector.
         * @returns The HTML element (not as Html)
         */
        query(selector) {
          return this.elm.querySelector(selector);
        }
        /**
         * An easier querySelector method.
         * @param query The string to query
         * @returns a new Html
         */
        qs(query) {
          if (this.elm.querySelector(query)) {
            return Html.from(this.elm.querySelector(query));
          } else {
            return null;
          }
        }
        /**
         * An easier querySelectorAll method.
         * @param query The string to query
         * @returns a new Html
         */
        qsa(query) {
          if (this.elm.querySelector(query)) {
            return Array.from(this.elm.querySelectorAll(query)).map((e) =>
              Html.from(e)
            );
          } else {
            return null;
          }
        }
        /**
         * Sets the ID of the element.
         * @param val The ID to set.
         * @returns Html
         */
        id(val) {
          this.elm.id = val;
          return this;
        }
        /**
         * Toggle on/off a class.
         * @param val The class to toggle.
         * @returns Html
         */
        class(...val) {
          for (let i = 0; i < val.length; i++) {
            this.elm.classList.toggle(val[i]);
          }
          return this;
        }
        /**
         * Toggles ON a class.
         * @param val The class to enable.
         * @returns Html
         */
        classOn(...val) {
          for (let i = 0; i < val.length; i++) {
            this.elm.classList.add(val[i]);
          }
          return this;
        }
        /**
         * Toggles OFF a class.
         * @param val The class to disable.
         * @returns Html
         */
        classOff(...val) {
          for (let i = 0; i < val.length; i++) {
            this.elm.classList.remove(val[i]);
          }
          return this;
        }
        /**
         * Apply CSS styles (dashed method.) Keys use CSS syntax, e.g. `background-color`.
         * @param obj The styles to apply (as an object of `key: value;`.)
         * @returns Html
         */
        style(obj) {
          for (const key of Object.keys(obj)) {
            this.elm.style.setProperty(key, obj[key]);
          }
          return this;
        }
        /**
         * Apply CSS styles (JS method.) Keys use JS syntax, e.g. `backgroundColor`.
         * @param obj The styles to apply (as an object of `key: value;`)
         * @returns Html
         */
        styleJs(obj) {
          for (const key of Object.keys(obj)) {
            //@ts-ignore No other workaround I could find.
            this.elm.style[key] = obj[key];
          }
          return this;
        }
        /**
         * Apply an event listener.
         * @param ev The event listener type to add.
         * @param cb The event listener callback to add.
         * @returns Html
         */
        on(ev, cb) {
          this.elm.addEventListener(ev, cb);
          return this;
        }
        /**
         * Remove an event listener.
         * @param ev The event listener type to remove.
         * @param cb The event listener callback to remove.
         * @returns Html
         */
        un(ev, cb) {
          this.elm.removeEventListener(ev, cb);
          return this;
        }
        /**
         * Append this element to another element. Uses `appendChild()` on the parent.
         * @param parent Element to append to. HTMLElement, Html, and string (as querySelector) are supported.
         * @returns Html
         */
        appendTo(parent) {
          if (parent instanceof HTMLElement) {
            parent.appendChild(this.elm);
          } else if (parent instanceof Html) {
            parent.elm.appendChild(this.elm);
          } else if (typeof parent === "string") {
            document.querySelector(parent)?.appendChild(this.elm);
          }
          return this;
        }
        /**
         * Prepend this element to another element. Uses `prepend()` on the parent.
         * @param parent Element to append to. HTMLElement, Html, and string (as querySelector) are supported.
         * @returns Html
         */
        prependTo(parent) {
          if (parent instanceof HTMLElement) {
            parent.prepend(this.elm);
          } else if (parent instanceof Html) {
            parent.elm.prepend(this.elm);
          } else if (typeof parent === "string") {
            document.querySelector(parent)?.prepend(this.elm);
          }
          return this;
        }
        /**
         * Append an element. Typically used as a `.append(new Html(...))` call.
         * @param elem The element to append.
         * @returns Html
         */
        append(elem) {
          if (elem instanceof HTMLElement) {
            this.elm.appendChild(elem);
          } else if (elem instanceof Html) {
            this.elm.appendChild(elem.elm);
          } else if (typeof elem === "string") {
            const newElem = document.createElement(elem);
            this.elm.appendChild(newElem);
            return new Html(newElem.tagName);
          }
          return this;
        }
        /**
         * Prepend an element. Typically used as a `.prepend(new Html(...))` call.
         * @param elem The element to prepend.
         * @returns Html
         */
        prepend(elem) {
          if (elem instanceof HTMLElement) {
            this.elm.prepend(elem);
          } else if (elem instanceof Html) {
            this.elm.prepend(elem.elm);
          } else if (typeof elem === "string") {
            const newElem = document.createElement(elem);
            this.elm.prepend(newElem);
            return new Html(newElem.tagName);
          }
          return this;
        }
        /**
         * Append multiple elements. Typically used as a `.appendMany(new Html(...), new Html(...)` call.
         * @param elements The elements to append.
         * @returns Html
         */
        appendMany(...elements) {
          for (const elem of elements) {
            this.append(elem);
          }
          return this;
        }
        /**
         * Prepend multiple elements. Typically used as a `.prependMany(new Html(...), new Html(...)` call.
         * @param elements The elements to prepend.
         * @returns Html
         */
        prependMany(...elements) {
          for (const elem of elements) {
            this.prepend(elem);
          }
          return this;
        }
        /**
         * Clear the innerHTML of the element.
         * @returns Html
         */
        clear() {
          this.elm.innerHTML = "";
          return this;
        }
        /**
         * Set attributes (object method.)
         * @param obj The attributes to set (as an object of `key: value;`)
         * @returns Html
         */
        attr(obj) {
          for (let key in obj) {
            if (obj[key] !== null && obj[key] !== undefined) {
              this.elm.setAttribute(key, obj[key]);
            } else {
              this.elm.removeAttribute(key);
            }
          }
          return this;
        }
        /**
         * Set the text value of the element. Only works if element is `input` or `textarea`.
         * @param str The value to set.
         * @returns Html
         */
        val(str) {
          var x = this.elm;
          x.value = str;
          return this;
        }
        /**
         * Retrieve text content from the element. (as innerText, not trimmed)
         * @returns string
         */
        getText() {
          return this.elm.innerText;
        }
        /**
         * Retrieve HTML content from the element.
         * @returns string
         */
        getHtml() {
          return this.elm.innerHTML;
        }
        /**
         * Retrieve the value of the element. Only applicable if it is an `input` or `textarea`.
         * @returns string
         */
        getValue() {
          return this.elm.value;
        }
        /**
         * Swap the local `elm` with a new HTMLElement.
         * @param elm The element to swap with.
         * @returns Html
         */
        swapRef(elm) {
          this.elm = elm;
          return this;
        }
        /**
         * An alternative method to create an Html instance.
         * @param elm Element to create from.
         * @returns Html
         */
        static from(elm) {
          if (typeof elm === "string") {
            const element = Html.qs(elm);
            if (element === null) return null;
            else return element;
          } else {
            return new Html(elm);
          }
        }
        /**
         * An easier querySelector method.
         * @param query The string to query
         * @returns a new Html
         */
        static qs(query) {
          if (document.querySelector(query)) {
            return Html.from(document.querySelector(query));
          } else {
            return null;
          }
        }
        /**
         * An easier querySelectorAll method.
         * @param query The string to query
         * @returns a new Html
         */
        static qsa(query) {
          if (document.querySelector(query)) {
            return Array.from(document.querySelectorAll(query)).map((e) =>
              Html.from(e)
            );
          } else {
            return null;
          }
        }
      },
      randomString: () => {
        if (crypto && crypto.randomUUID) return crypto.randomUUID();
        else {
          var d = new Date().getTime();
          var d2 =
            (typeof performance !== "undefined" &&
              performance.now &&
              performance.now() * 1000) ||
            0;
          return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
            /[xy]/g,
            function (c) {
              var r = Math.random() * 16;
              if (d > 0) {
                r = (d + r) % 16 | 0;
                d = Math.floor(d / 16);
              } else {
                r = (d2 + r) % 16 | 0;
                d2 = Math.floor(d2 / 16);
              }
              return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
            }
          );
        }
      },
      loadLibrary: async function (lib) {
        if (lib.includes(":")) return false;
        knownLibraries.push(lib);
        return await Core.startPkg("lib:" + lib);
      },
      loadComponent: async (cmp) => {
        if (cmp.includes(":")) return false;
        knownLibraries.push(cmp);
        return await Core.startPkg("components:" + cmp);
      },
    };

    GlobalLib.icons = (await import("./assets/icons.js")).default;
    const strings = (await import("./assets/strings.js")).default;

    function replaceString(string, replacements) {
      let str = string;
      for (let rpl in replacements) {
        str = str.replace(`{${rpl}}`, replacements[rpl]);
      }
      return str;
    }

    function getString(str, replacements = null, source) {
      function getStr() {
        if (source && source[language] && source[language][str])
          return source[language][str];
        else if (source && source["en_US"][str]) return source["en_US"][str];
        else if (strings[language] && strings[language][str])
          return strings[language][str];
        else return strings["en_US"][str];
      }
      const newStr = escapeHtml(getStr());
      if (replacements !== null) {
        return replaceString(newStr, replacements);
      } else {
        if (newStr === undefined) return str;
        return newStr;
      }
    }

    function escapeHtml(str) {
      if (str !== undefined)
        return str
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
    }

    // Similar name to procLib but is not actually ProcLib
    const processLib = class ProcessAvailableLibrary {
      constructor(url, pid, token, strs) {
        var Url = url;
        var Pid = pid;
        var Token = token;

        this.escapeHtml = escapeHtml;
        this.getString = function (str, replacements = null) {
          broadcastEventToProcs({
            type: "procEvent",
            data: {
              type: "getString",
              pid: Pid,
              url: Url,
              data: arguments,
            },
          });
          return getString(str, replacements, strs);
        };

        this.html = GlobalLib.html;
        this.randomString = GlobalLib.randomString;
        this.icons = GlobalLib.icons;
        this.systemInfo = coreDetails;
        this.semver = GlobalLib.semver;
        this.updateProcTitle = function (newTitle) {
          broadcastEventToProcs({
            type: "procEvent",
            data: {
              type: "updateProcTitle",
              pid: Pid,
              url: Url,
              data: arguments,
            },
          });
          if (Core.processList[Pid].proc !== null) {
            Core.processList[Pid].proc.name = newTitle;
          }
        };
        this.updateProcDesc = function (newDescription) {
          broadcastEventToProcs({
            type: "procEvent",
            data: {
              type: "updateProcDesc",
              pid: Pid,
              url: Url,
              data: arguments,
            },
          });
          if (Core.processList[Pid].proc !== null) {
            Core.processList[Pid].proc.description = newDescription;
          }
        };
        this.langs = supportedLangs;
        this.launch = async (app, parent = "body") => {
          broadcastEventToProcs({
            type: "procEvent",
            data: {
              type: "launch",
              pid: Pid,
              url: Url,
              data: arguments,
            },
          });
          let appName = "";

          if (Core.processList[Pid].proc !== null) {
            appName = Core.processList[Pid].proc.name;
          } else {
            appName = "???";
          }
          if (
            (await Modal.prompt(
              getString("notice"),
              getString("core_appLaunch_notification", {
                suspectedApp: appName,
                targetApp: app.split(":").pop(),
              }),
              parent
            )) === true
          ) {
            return await Core.startPkg(app);
          } else {
            return false;
          }
        };
        this.getProcessList = () => {
          broadcastEventToProcs({
            type: "procEvent",
            data: {
              type: "getProcessList",
              pid: Pid,
              url: Url,
              data: arguments,
            },
          });
          return Core.processList
            .filter((m) => m !== null)
            .map((m) => {
              return {
                name: m.name,
                pid: m.pid,
              };
            });
        };
        this.loadLibrary = async (lib) => {
          if (lib.includes(":")) return false;
          broadcastEventToProcs({
            type: "procEvent",
            data: {
              type: "loadLibrary",
              pid: Pid,
              url: Url,
              data: [lib],
            },
          });
          return await Core.startPkg("lib:" + lib);
        };
        this.loadComponent = async (cmp) => {
          if (cmp.includes(":")) return false;
          broadcastEventToProcs({
            type: "procEvent",
            data: {
              type: "loadComponent",
              pid: Pid,
              url: Url,
              data: [cmp],
            },
          });
          return await Core.startPkg("components:" + cmp);
        };
        this.cleanup = function (pid, token) {
          broadcastEventToProcs({
            type: "procEvent",
            data: {
              type: "cleanup",
              pid: Pid,
              url: Url,
              data: [pid],
            },
          });
          // Token is required for the pid to verify that it is the one willing to clean up
          console.log("Checking..");
          const proc = Core.processList
            .filter((p) => p !== null)
            .findIndex((p) => p.pid === pid && p.token === token);
          if (proc !== -1) {
            console.log(Core.processList[proc]);
            ProcLib.cleanupProcess(pid);
            return true;
          } else {
            return false;
          }
        };
        this.setOnEnd = function (onEndCallback) {
          broadcastEventToProcs({
            type: "procEvent",
            data: {
              type: "setOnEnd",
              pid: Pid,
              url: Url,
              data: [onEndCallback],
            },
          });
          this.onEndCallback = onEndCallback;
          this.onEnd = () => {
            console.log("Example process ended, attempting clean up...");
            const result = this.cleanup(Pid, Token);
            if (result === true) {
              this.onEndCallback && this.onEndCallback();
              console.log("Cleanup Success! Token:", Token);
            } else {
              console.log("Cleanup Failure. Token:", Token);
            }
          };
        };
        this.setupReturns = function (onMessage, trayInfo = null) {
          broadcastEventToProcs({
            type: "procEvent",
            data: {
              type: "setOnEnd",
              pid: Pid,
              url: Url,
              data: [onMessage, trayInfo],
            },
          });
          // the idea is a standardized .proc on processes
          return {
            end: this.onEnd,
            trayInfo,
            send: async (m) => {
              if (
                m &&
                m.type &&
                m.type === "refresh" &&
                m.data &&
                typeof m.data === "function"
              ) {
                this.getString = m.data;
              }
              return await onMessage(m);
            },
          };
        };
      }
    };

    const ProcLib = {
      findEmptyPID: function () {
        let r = Core.processList.findIndex((p) => p === null);
        return r !== -1 ? r : Core.processList.length;
      },
      cleanupProcess: function (pid) {
        let proc = Core.processList
          .filter((p) => p !== null)
          .find((p) => p.pid === pid);
        console.group("Process cleanup (" + pid, proc.name + ")");
        console.debug(
          `%cProcess ${proc.name} (${proc.pid}) was ended.`,
          "color:green;font-weight:bold"
        );
        let x = procsListeningToEvents.findIndex((p) => p === pid);
        if (x !== undefined || x !== null) {
          // console.log("removing", x, "from broadcast list");
          procsListeningToEvents[x] = null;
        }
        broadcastEventToProcs({
          type: "coreEvent",
          data: {
            type: "pkgEnd",
            data: Core.processList[pid],
          },
        });
        Core.processList[pid] = null;
        console.groupEnd();
      },
    };

    let Modal, Toast;

    const corePrivileges = {
      startPkg: { description: "core_appAccessControl_privilege_startPkg" },
      processList: {
        description: "core_appAccessControl_privilege_processList",
      },
      knownPackageList: {
        description: "core_appAccessControl_privilege_knownPackageList",
      },
      services: { description: "core_appAccessControl_privilege_services" },
      setLanguage: {
        description: "core_appAccessControl_privilege_setLanguage",
      },
      host: {
        description:
          "core_appAccessControl_privilege_desktopOnlyHostPermission",
      },
      full: {
        description: "core_appAccessControl_privilege_full",
      },
    };

    const permittedApps = ["lib:ThemeLib"];
    const procsListeningToEvents = [];

    function broadcastEventToProcs(eventData) {
      // console.log("procsListeningToEvents", procsListeningToEvents);
      procsListeningToEvents
        .filter((m) => m !== null)
        .forEach((e) => {
          Core.processList[e] !== null &&
            Core.processList[e].proc !== null &&
            Core.processList[e].proc.send(eventData);
        });
    }

    const supportedLangs = [
      "en_US",
      "en_GB",
      "de_DE",
      "es_ES",
      "pt_BR",
      "fil_PH",
      "tr_TR",
    ];

    let language = "en_US";

    const Core = {
      version: coreDetails.version,
      codename: coreDetails.codename,
      processList: [],
      knownPackageList: [],

      setLanguage(lang) {
        console.log("setting language to", lang);
        if (supportedLangs.includes(lang)) language = lang;

        // kindly ask all processes to restart
        Core.processList
          .filter((n) => n !== null)
          .forEach((p) => {
            p.proc &&
              p.proc.send &&
              p.proc.send({
                type: "refresh",
                data: function (
                  str,
                  replacements = null,
                  source = p.proc.strings
                ) {
                  return getString(str, replacements, source);
                },
              });
          });
      },
      startPkg: async function (url, isUrl = true, force = false) {
        try {
          // This should be safe as startPkg can only be called by admin packages and trusted libraries
          let pkg;
          if (isUrl === false) {
            // treat this package as a raw uri
            pkg = await import(url);
            url = "none:<Imported as URI>";
          } else {
            pkg = await import("./pkgs/" + url.replace(":", "/") + ".js");
          }

          if (!pkg.default)
            throw new Error('No "default" specified in package');
          pkg = pkg.default;

          if (!Core.knownPackageList.find((m) => m.url === url))
            Core.knownPackageList.push({ url, pkg });

          // system:BootLoader

          // fixed semver support
          let pkgSatisfies = false;

          if (pkg.ver !== undefined) {
            if (typeof pkg.ver === "number" || typeof pkg.ver === "string") {
              if (semver.satisfies(Core.version, `>=${pkg.ver}`)) {
                pkgSatisfies = true;
              }
            }
          }

          if (pkg.name && pkg.type === "process" && pkgSatisfies === true) {
            console.group("Running " + url);
            console.log(
              `Core version: ${Core.version}\nPackage version: ${pkg.ver}`
            );
            // Matching Core version and type is set
            console.log("Good package data");

            // Check if this package is a process and call exec
            if (pkg.type === "process" && typeof pkg.exec === "function") {
              const PID = ProcLib.findEmptyPID();

              // console.log(pkg.exec.toString());
              Core.processList[PID] = {
                name: url,
                pid: PID,
                proc: null,
              };
              const Token = GlobalLib.randomString();
              const newLib = new processLib(url, PID, Token, pkg.strings);
              if (Core.processList[PID]) Core.processList[PID].token = Token;
              let result;
              // console.log(pkg.privileges);
              if (
                url.startsWith("system:") ||
                url.startsWith("ui:") ||
                url.startsWith("components:") ||
                url.startsWith("services:") ||
                permittedApps.includes(url)
              ) {
                result = await pkg.exec({
                  Lib: newLib,
                  Core,
                  PID,
                  Token,
                  Modal,
                  Services: Core.services,
                  // Provide access to GlobalLib just in case.
                  GlobalLib,
                });
              } else if (
                pkg.privileges === undefined ||
                pkg.privileges === false ||
                pkg.optInToEvents === false
              ) {
                result = await pkg.exec({
                  Lib: newLib,
                  Core: null,
                  PID,
                  Token,
                  Modal,
                  Services: null,
                });
              } else {
                let privileges = {};

                if (!Array.isArray(pkg.privileges)) {
                  throw new Error("pkg.privileges must be an array");
                }

                for (const item of pkg.privileges) {
                  if (!item || typeof item !== "object" || !item.privilege)
                    continue;

                  if (item.privilege in corePrivileges) {
                    privileges[item.privilege] = corePrivileges[item.privilege];
                    if (!item.description)
                      item.description =
                        '<span class="danger">No author note</span>';
                    // dangerous
                    if (item.privilege === "full") {
                      privileges[
                        item.privilege
                      ].description = `<span class=\"danger\">${getString(
                        privileges[item.privilege].description
                      )}</span>`;
                    }
                    privileges[item.privilege].authorNote = item.description;
                  }
                }

                let modalResult = "";
                if (force === false)
                  modalResult = await new Promise((resolve, reject) => {
                    setTimeout(() => {
                      let x = new Audio("./assets/alert.wav");
                      x.volume = 0.75;
                      x.play();
                    }, 100);
                    Modal.modal(
                      getString("core_appAccessControl_title"),
                      `${getString("core_appAccessControl_description", {
                        appName:
                          url === "none:<Imported as URI>"
                            ? pkg.name
                            : url.split(":").pop(),
                      })}<br><br><ul>${Object.keys(privileges)
                        .map(
                          (m) =>
                            `<li>${getString(
                              privileges[m].description
                            )}<br><span class="label">${
                              privileges[m].authorNote !== undefined
                                ? `${getString(
                                    "core_appAccessControl_authorNote",
                                    {
                                      note: escapeHtml(
                                        privileges[m].authorNote
                                      ),
                                    }
                                  )}</li>`
                                : `<span style="color:var(--negative-light)">${getString(
                                    "core_appAccessControl_noAuthorNote"
                                  )}</span>`
                            }</span>`
                        )
                        .join("")}</ul>`,
                      "body",
                      false,
                      {
                        text: getString("allow"),
                        type: "primary",
                        callback: (_) => resolve("allow"),
                      },
                      {
                        text: getString("deny"),
                        callback: (_) => resolve("deny"),
                      },
                      {
                        text: getString("cancel"),
                        callback: (_) => resolve(false),
                      }
                    );
                  });
                else modalResult = "allow";
                if (modalResult === "allow") {
                  let coreObj = {
                    ...(privileges.startPkg ? { startPkg: Core.startPkg } : {}),
                    ...(privileges.processList
                      ? { processList: Core.processList }
                      : {}),
                    ...(privileges.knownPackageList
                      ? { knownPackageList: Core.knownPackageList }
                      : {}),
                    ...(privileges.host ? { host: GlobalLib.host } : {}),
                    ...(privileges.setLanguage
                      ? { setLanguage: Core.setLanguage }
                      : {}),
                    ...(privileges.services ? { services: Core.services } : {}),
                  };
                  if (privileges.full) {
                    coreObj = Core;
                  }
                  result = await pkg.exec({
                    Lib: newLib,
                    Core: coreObj,
                    PID,
                    Token,
                    Modal,
                    Services: Core.services,
                  });
                } else if (modalResult === "deny") {
                  result = await pkg.exec({
                    Lib: newLib,
                    Core: null,
                    PID,
                    Token,
                    Modal,
                    Services: Core.services,
                  });
                } else if (modalResult === false) {
                  result = null;
                  // Report the app was improperly quit
                  broadcastEventToProcs({
                    type: "coreEvent",
                    data: {
                      type: "pkgEnd",
                      detail: "forceStop",
                      data: Core.processList[PID],
                    },
                  });
                  // End the process
                  Core.processList[PID] = null;
                  return;
                }
              }

              if (
                Core.processList[PID] &&
                typeof Core.processList[PID]["proc"] !== "undefined"
              ) {
                Core.processList[PID].proc = Object.assign(
                  {
                    name: pkg?.name,
                    description: pkg?.description,
                    strings: pkg?.strings,
                  },
                  result
                );
                if (
                  typeof pkg?.optInToEvents !== "undefined" &&
                  pkg?.optInToEvents === true
                ) {
                  console.log("Core: adding", PID, "to optInToEvents");
                  procsListeningToEvents.push(PID);
                }

                broadcastEventToProcs({
                  type: "coreEvent",
                  data: {
                    type: "pkgStart",
                    data: Core.processList[PID],
                  },
                });
              }
              console.groupEnd();
              return Core.processList[PID];
            }
          } else if (pkg.type === "library" || pkg.type === "component") {
            if (pkg.data && typeof pkg.data === "object") {
              if (pkg.init && typeof pkg.init === "function") {
                await pkg.init(GlobalLib, Core);
              }

              return pkg.data;
            }
          } else {
            console.log(pkg);
            throw new Error(
              "Bad package metadata" +
                (pkg.ver !== undefined && typeof pkg.ver === "number"
                  ? ` - maybe version "${pkg.ver}" doesn\'t match your current version of "${Core.version}"?`
                  : "")
            );
          }
        } catch (e) {
          const s = `Failed to load package ${url}. ${e}\n\n${e.stack}`;
          if (Modal && Modal.alert) {
            Modal.alert(s);
          } else {
            alert(s);
          }
        }
      },
      services: [],
      broadcastEventToProcs,
    };

    Modal = await Core.startPkg("ui:Modal");
    Toast = await Core.startPkg("lib:Notify");

    // Comment these out to disable global core access
    // recommended to keep for debugging purposes
    window.m = Modal;
    window.t = Toast;
    window.c = Core;
    window.l = GlobalLib;
    window.h = GlobalLib.html;
    window.cd = coreDetails;

    // If in electron app, don't give away host data
    let host;
    if (window.host !== undefined) {
      host = window.host;
      window.host = undefined;

      GlobalLib.host = host;

      // Give access to the core temporarily.
      window.bootUpCore = Core;
      // Desktop app-specific boot event.
      window.dispatchEvent(new CustomEvent("pluto.boot"));
      setTimeout(() => {
        window.bootUpCore = null;
      }, 1000);
    }

    Core.processList.push({
      name: "system:Core",
      pid: 0,
      proc: {
        name: `Pluto Core (${coreDetails.codename})`,
        description: "Handles core system functionality and package loading.",
        trayInfo: null,
        end: null,
      },
      token: GlobalLib.randomString(),
    });

    await Core.startPkg("system:BootLoader");
  } catch (e) {
    alert(e);
  }
})();
