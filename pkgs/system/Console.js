export default {
  name: "Console",
  description: "Console app",
  ver: 1, // Compatible with core v1
  type: "process",
  exec: async function (Root) {
    let wrapper; // Lib.html | undefined
    let MyWindow;

    Root.Lib.setOnEnd((_) => MyWindow.close());

    let logs = [];
    let list;

    // // define a new console
    // var console = (function (oldCons) {
    //   return {
    //     log: function (...args) {
    //       oldCons.log(...args);
    //       // Your code
    //       log(inspectMuch(...args), inspectMuch(...args), "log");
    //     },
    //     info: function (...args) {
    //       oldCons.info(...args);
    //       // Your code
    //     },
    //     warn: function (...args) {
    //       oldCons.warn(...args);
    //       // Your code...args
    //     },
    //     error: function (...args) {
    //       oldCons.error(...args);
    //       // Your code
    //     },
    //     debug: function (...args) {
    //       oldCons.debug(...args);
    //     },
    //     clear: function () {
    //       oldCons.clear();
    //     },
    //     group: function (...text) {
    //       oldCons.group(...text);
    //     },
    //     groupEnd: function () {
    //       oldCons.groupEnd();
    //     },
    //   };
    // })(window.console);

    // //Then redefine the old console
    // window.console = console;

    const commandInfos = {
      launch: "launch <cat:app> - Start a system application",
      help: "help - Show this menu",
      clear: "clear - Clear console output",
    };
    const commands = {
      // Commands example
      async launch(app) {
        // launch the app
        log("Loading...", "Loading...", "log");
        await Root.Core.startPkg(app);
        log("Loaded" + app, "Loaded " + app, "log");
      },
      async help() {
        log(
          Object.keys(commandInfos)
            .map((k) => commandInfos[k])
            .join("\n"),
          Object.keys(commandInfos)
            .map((k) => {
              const str = commandInfos[k];

              const cmdInfo = str.split(" - ");

              const name = escapeHtml(cmdInfo[0].trim());
              const desc = escapeHtml(cmdInfo[1].trim());

              return `<span style="color:var(--primary)">${name}</span> - ${desc}`;
            })
            .join("\n"),
          "log"
        );
      },
      async clear() {
        logs = [];
        list.elm.innerText = ""; // clear the visible list
      },
    };

    function escapeHtml(unsafe) {
      return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function colorText(text, style) {
      return `<span style="${style}">${escapeHtml(text)}</span>`;
    }

    function inspect(obj, quoteStrings = true, depth = 0) {
      if (typeof obj === "undefined") {
        return colorText("undefined", "color:#939395");
      }
      if (obj === null) {
        return colorText("null", "color:#939395");
      }
      if (typeof obj === "boolean") {
        return colorText(obj.toString(), "color:#e370cf");
      }
      if (typeof obj === "number") {
        return colorText(obj.toString(), "color:#86de74");
      }
      if (typeof obj === "string") {
        if (quoteStrings) return colorText(`'${obj}'`, "color:green");
        else return obj;
      }

      if (Array.isArray(obj)) {
        if (depth > 0) {
          return "[Array]";
        }
        let elements = obj.map((el) => inspect(el, depth + 1));
        return `[${elements.join(", ")}]`;
      }

      if (typeof obj === "object") {
        let keys = Object.keys(obj);
        if (depth > 0 && keys.length === 0) {
          return "{}";
        }
        let properties = keys.map(
          (key) => `${key}: ${inspect(obj[key], depth + 1)}`
        );
        return `{${properties.join(", ")}}`;
      }

      return obj.toString();
    }

    function inspectMuch(...much) {
      const formattedData = much.map((item) => inspect(item, false));
      const styledOutput = formattedData.join(" ");
      return styledOutput;
    }

    const Win = (await Root.Lib.loadLibrary("WindowSystem")).win;

    MyWindow = new Win({
      title: "Console",
      onclose: function () {
        consoleState = false;
        MyWindow.hide();
        return false;
      },
    });

    MyWindow.window.style.display = "none";
    wrapper = MyWindow.window.querySelector(".win-content");

    wrapper.classList.add("col", "h-100");
    wrapper.style.padding = "0";

    list = new Root.Lib.html("div")
      .class("fg", "ovh", "monospace")
      .style({ padding: "0" })
      .appendTo(wrapper);
    let inputRow = new Root.Lib.html("div")
      .class("row")
      .style({ padding: "4px" })
      .appendTo(wrapper);
    let consoleInput = new Root.Lib.html("input")
      .attr({
        placeholder: "Command",
        autocorrect: "off",
        autocomplete: "off",
        autofill: "off",
      })
      .class("fg", "monospace")
      .style({ "min-width": "0" })
      .appendTo(inputRow)
      .on("keydown", (e) => {
        if (e.key === "Enter" || e.keyCode === 13) {
          runCommand();
        }
      });
    new Root.Lib.html("button")
      .text("Run")
      .appendTo(inputRow)
      .on("click", (_) => runCommand());

    function appendListItem(html) {
      list.append(new Root.Lib.html("div").class("list-item").html(html));
    }
    function log(text, html, type) {
      logs.push({ type, data: text });

      if (html === null) html = text;

      // const tolerance = 10;
      // const lastChildRect = list.elm.lastElementChild
      //   ? list.elm.lastElementChild.getBoundingClientRect()
      //   : null;
      // const isAtBottom =
      //   lastChildRect &&
      //   lastChildRect.bottom - list.elm.getBoundingClientRect().bottom <=
      //     tolerance;

      list.append(
        new Root.Lib.html("div").class("list-item", "log-" + type).html(html)
      );

      // if (isAtBottom) {
      list.elm.scrollTop = list.elm.scrollHeight - list.elm.clientHeight;
      // }
      // console.log(
      //   list.elm.scrollTop,
      //   isAtBottom,
      //   list.elm.scrollHeight - list.elm.scrollTop - list.elm.offsetHeight
      // );
    }

    async function runCommand() {
      let cmdData = consoleInput.elm.value.split(" ");
      consoleInput.elm.value = "";

      appendListItem("] " + cmdData.join(" "));

      const cmd = cmdData[0];
      const args = cmdData.slice(1);

      if (cmd in commands) {
        await commands[cmd](...args);
      } else {
        log("invalid command", "invalid command", "error");
      }
    }

    /*
    +============================+
    | -        Console         X |
    |----------------------------|
    | >my_cmd_here               |
    | funny command goes here    |
    |                            |
    |                            |
    |                            |
    |                            |
    |----------------------------|
    | My cmd here|          [OK] |
    +============================+
    */

    let consoleState = false; // not open

    log(
      "Welcome to the Console",
      'Welcome to the Console! Type "help" for commands.',
      "info"
    );

    return Root.Lib.setupReturns((m) => {
      // Got a message
      const { type, data } = m;
      switch (type) {
        case "toggle":
          consoleState = !consoleState;
          consoleState === true ? MyWindow.show() : MyWindow.hide();
          if (consoleState === true) {
            MyWindow.focus();
            consoleInput.elm.focus();
          } else {
            consoleInput.elm.blur();
          }
          break;
        case "log":
          log(data, inspectMuch(...data), m.variant || "log");
          break;
      }
    });
  },
};
