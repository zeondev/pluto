// Pluto

(async () => {
  try {
    const coreDetails = {
      version: 1.21,
      versionString: (1.21).toFixed(1),
      codename: "Elysium",
    };
    const knownLibraries = [];
    const GlobalLib = {
      html: class Html {
        constructor(e) {
          this.elm = document.createElement(e || "div");
        }
        text(val) {
          this.elm.innerText = val;
          return this;
        }
        html(val) {
          this.elm.innerHTML = val;
          return this;
        }
        cleanup() {
          this.elm.remove();
        }
        query(selector) {
          return this.elm.querySelector(selector);
        }
        class(...val) {
          for (let i = 0; i < val.length; i++) {
            this.elm.classList.toggle(val[i]);
          }
          return this;
        }
        classOn(...val) {
          for (let i = 0; i < val.length; i++) {
            this.elm.classList.add(val[i]);
          }
          return this;
        }
        classOff(...val) {
          for (let i = 0; i < val.length; i++) {
            this.elm.classList.remove(val[i]);
          }
          return this;
        }
        style(obj) {
          for (const key of Object.keys(obj)) {
            this.elm.style.setProperty(key, obj[key]);
          }
          return this;
        }
        on(ev, cb) {
          this.elm.addEventListener(ev, cb);
          return this;
        }
        un(ev, cb) {
          this.elm.removeEventListener(ev, cb);
          return this;
        }
        appendTo(parent) {
          if (parent instanceof HTMLElement) {
            parent.appendChild(this.elm);
          } else if (parent instanceof Html) {
            parent.elm.appendChild(this.elm);
          } else if (typeof parent === "string") {
            document.querySelector(parent).appendChild(this.elm);
          }
          return this;
        }
        append(elem) {
          if (elem instanceof HTMLElement) {
            this.elm.appendChild(elem);
          } else if (elem instanceof Html) {
            this.elm.appendChild(elem.elm);
          } else if (typeof elem === "string") {
            const newElem = document.createElement(elem);
            this.elm.appendChild(newElem);
            return new Html(newElem);
          }
          return this;
        }
        appendMany(...elements) {
          for (const elem of elements) {
            this.append(elem);
          }
          return this;
        }
        clear() {
          this.elm.innerHTML = "";
          return this;
        }
        attr(obj) {
          for (let key in obj) {
            if (obj[key] !== null) this.elm.setAttribute(key, obj[key]);
            else this.elm.removeAttribute(key);
          }
          return this;
        }
        val(str) {
          this.elm.value = str;
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

    // Similar name to procLib but is not actually ProcLib
    const processLib = class ProcessAvailableLibrary {
      constructor(url, pid, token) {
        var Url = url;
        var Pid = pid;
        var Token = token;

        this.html = GlobalLib.html;
        this.icons = GlobalLib.icons;
        this.systemInfo = coreDetails;

        this.launch = async (app, parent = "body") => {
          if (
            (await Modal.prompt(
              "App Start",
              `${Core.processList[Pid].proc.name} wants to launch ${app
                .split(":")
                .pop()}.\nConfirm or deny?`,
              parent
            )) === true
          ) {
            return await Core.startPkg(app);
          } else {
            // await Modal.alert("Cancelled.");
            return false;
          }
        };
        this.getProcessList = (_) =>
          Core.processList
            .filter((m) => m !== null)
            .map((m) => {
              return {
                name: m.name,
                pid: m.pid,
              };
            });
        this.loadLibrary = async (lib) => {
          if (lib.includes(":")) return false;
          return await Core.startPkg("lib:" + lib);
        };
        this.loadComponent = async (cmp) => {
          if (cmp.includes(":")) return false;
          return await Core.startPkg("components:" + cmp);
        };
        this.cleanup = function (pid, token) {
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
        this.setupReturns = function (onMessage) {
          // the idea is a standardized .proc on processes
          return {
            end: this.onEnd,
            send: onMessage,
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
      randomString: (_) => {
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
    };

    let Modal;

    const corePrivileges = {
      startPkg: { description: "Start other applications" },
      processList: { description: "View and control other processes" },
      knownPackageList: { description: "Know installed packages" },
      services: { description: "Interact with system services" },
      full: {
        description:
          '<span style="color:var(--negative-light);">Full system access</span>',
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

    const Core = {
      version: coreDetails.version,
      codename: coreDetails.codename,
      processList: [],
      knownPackageList: [],
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

          Core.knownPackageList.push({ url, pkg });

          // system:BootLoader
          if (pkg.name && pkg.type === "process" && pkg.ver <= Core.version) {
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
              const Token = ProcLib.randomString();
              const newLib = new processLib(url, PID, Token);
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
                });
              } else if (
                pkg.privileges === undefined ||
                pkg.privileges === false
              ) {
                result = await pkg.exec({
                  Lib: newLib,
                  Core: null,
                  PID,
                  Token,
                  Modal,
                  Services: Core.services,
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
                    if (!item.description) continue;
                    privileges[item.privilege].authorNote = item.description;
                  }
                }

                let modalResult = "";
                if (force === false)
                  modalResult = await new Promise((resolve, reject) => {
                    Modal.modal(
                      "App Access Control",
                      "App " +
                        url.split(":").pop() +
                        ` wants to launch privileged:<br><br><ul>${Object.keys(
                          privileges
                        )
                          .map(
                            (m) =>
                              `<li>${privileges[m].description}<br>${
                                privileges[m].authorNote !== undefined
                                  ? `Author note: ${privileges[m].authorNote}</li>`
                                  : '<span style="color:var(--negative-light)">No author note</span>'
                              }`
                          )
                          .join("")}</ul>`,
                      "body",
                      false,
                      {
                        text: "Allow",
                        type: "primary",
                        callback: (_) => resolve("allow"),
                      },
                      {
                        text: "Deny",
                        callback: (_) => resolve("deny"),
                      },
                      {
                        text: "Cancel",
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
                } else {
                  result = null;
                }
              }

              if (
                Core.processList[PID] &&
                typeof Core.processList[PID]["proc"] !== "undefined"
              ) {
                Core.processList[PID].proc = Object.assign(
                  { name: pkg?.name, description: pkg?.description },
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
      services: {},
      broadcastEventToProcs,
    };

    Modal = await Core.startPkg("ui:Modal");

    await Core.startPkg("system:BootLoader");

    window.m = Modal;
    window.c = Core;
    window.l = GlobalLib;
    window.h = GlobalLib.html;
  } catch (e) {
    alert(e);
  }
})();
