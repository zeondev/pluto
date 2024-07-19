export default {
  name: "Terminal",
  description: "Terminal for Pluto",
  ver: "v1.6.2", // Supports minimum Core version of v1.6.2
  type: "process",
  privileges: [
    {
      privilege: "processList",
      description: "Send messages to applications",
    },
    {
      privilege: "services",
      description: "Access services",
    },
    {
      privilege: "startPkg",
      description: "Run applications",
    },
  ],
  exec: async (Root) => {
    let wrapper; // Lib.html | undefined
    let MyWindow;

    Root.Lib.setOnEnd(function () {
      MyWindow.close();
    });

    const L = Root.Lib;
    const C = Root.Core;

    const Html = L.html;

    const Win = (await Root.Lib.loadLibrary("WindowSystem")).win;
    const vfs = await L.loadLibrary("VirtualFS");
    vfs.importFS();
    const FileMappings = await L.loadLibrary("FileMappings");
    let service = Root.Core.services.find((x) => x.name === "Account");

    MyWindow = new Win({
      title: Root.Lib.getString("systemApp_Terminal"),
      pid: Root.PID,
      width: 869,
      height: 500,
      onclose: () => {
        Root.Lib.onEnd();
      },
    });

    wrapper = Html.from(MyWindow.window.querySelector(".win-content"));

    wrapper.style({ background: "var(--unfocused)" });

    const Term = {
      commandLine: true,
      prompt: "%&nbsp;",
      setPrompt: function (text) {
        prompt = text;
        Html.qs(".no-ui .prompt").html(prompt);
      },
      history: [],
      clear: function () {
        Html.qs(".no-ui .output").html("");
      },
    };

    let Terminal = new Html("div")
      .class("no-ui")
      .html(
        /*html*/ `<div><div class="output">Welcome to Pluto's terminal!<br>Enter 'js' in the terminal if you want to switch to JavaScript.<br></div></div><div class="userInput"><div style="display:flex;" id="inputDiv"><span class="prompt">${Term.prompt}</span><div class="none input" contenteditable="true"></div></div></div>`
      );

    Terminal.appendTo(wrapper);

    let inputDiv = Terminal.query(".input");

    Terminal.on("click", (_) => {
      if (window.getSelection().type === "Range") return;
      inputDiv.focus();
    });

    let currentIndex = -1;

    inputDiv.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && e.shiftKey) {
        let ev = new Event("keydown");
        ev.which === 13;
        e.target.dispatchEvent(ev);
      } else if (e.key == "Enter" || (e.keyCode === 13 && !e.shiftKey)) {
        e.preventDefault();

        let elm = e.target.closest("div");
        var input = e.target.innerText;

        Term.history.unshift(input);
        if (Term.history.length > 300)
          Term.history = Term.history.splice(300, 1);

        currentIndex = -1;

        runCommand(elm, input);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        currentIndex++;
        if (currentIndex > Term.history.length) {
          currentIndex = Term.history.length;
        } else {
          document.querySelector(".no-ui .input").innerHTML =
            Term.history[currentIndex] || "";
        }

        let range = document.createRange();
        range.selectNodeContents(document.querySelector(".no-ui .input"));
        range.collapse(false);
        let selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        currentIndex--;
        if (currentIndex < 0) {
          currentIndex = -1;
          document.querySelector(".no-ui .input").innerHTML = "";
        } else {
          document.querySelector(".no-ui .input").innerHTML =
            Term.history[currentIndex] || "";
        }

        let range = document.createRange();
        range.selectNodeContents(document.querySelector(".no-ui .input"));
        range.collapse(false);
        let selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
      }
      // Todo: add highlighting (seems challenging from what I've tried)
      // var sel = window.getSelection();
      // inputDiv.innerHTML = hljs.highlight(inputDiv.innerText, { language: 'javascript' }).value;
    });

    function appendOutput(text, breakLine = true) {
      document
        .querySelector(".no-ui .output")
        .insertAdjacentHTML(
          "beforeend",
          text.trim() + (breakLine === true ? "<br>" : "")
        );
    }

    function GetObject(obj) {
      if (obj === "") return;
      let str = "";
      if (typeof obj === "object") {
        str += "{";
        for (let key in obj) {
          let value = obj[key];
          // todo: fix this not working
          // let val = '';
          // switch (typeof value) {
          //   case 'object':
          //   console.log('1');
          //     val = value.replace(/"/g, '\"').toString();
          //     break;
          //   case 'boolean':
          //   case 'number':
          //   case 'bigint':
          //   case 'undefined':
          //   case 'symbol':
          //   console.log('2');
          //     val = hljs.highlight(key, { language: 'javascript' });
          //     break;
          //   case 'function':
          //   console.log('3');
          //     val = 'hello'
          //     break;
          //   default:
          //   console.log('4');
          //     val = 'unknown type: ' + typeof key;
          //     break;
          // }
          str += `    ${key}: "${value.toString()}",\n`;
        }
        str += "}";
      } else if (typeof obj === "number" || typeof obj === "string") {
        str += obj;
      } else {
        str += JSON.stringify(obj, null, 4);
      }

      return str;
      // return hljs.highlight(str, { language: 'javascript' }).value;
    }

    let path = "Root";

    function setPromptPath() {
      Term.setPrompt(
        `<Span style="color:var(--primary)">${
          path === "Root" ? "~" : path
        }</Span>%&nbsp;`
      );
    }

    setPromptPath();

    async function runCommand(elm, input = "") {
      // debugger;
      document
        .querySelector(".no-ui .output")
        .insertAdjacentHTML(
          "beforeend",
          elm
            .closest(".userInput")
            .innerText.replace(/    /g, "")
            .replace("\n", "")
            .replace(/\n/g, "<br>") + "<br>"
        );

      elm.innerHTML = "";
      elm = undefined;
      let res;

      if (Term.commandLine === false) {
        try {
          if (input === "") appendOutput("", false);
          res = eval(input);
        } catch (e) {
          // NoUI.querySelector(".output").insertAdjacentHTML(
          //   "beforeend",
          //   '<span style="color:red" + e.message + "</span><br>"
          // );'
        }

        if (input != "") {
          try {
            let y = GetObject(res);
            document
              .querySelector(".no-ui .output")
              .insertAdjacentHTML("beforeend", y + "<br>");
          } catch (e) {
            document
              .querySelector(".no-ui .output")
              .insertAdjacentHTML("beforeend", res);
          }
        }
      } else {
        // Shell
        let cmd = input.split(" ")[0].trim();
        // if (cmd === '') appendOutput('', true);
        let args = input.split(" ").slice(1);
        let argsStr = args.join(" ");
        switch (cmd) {
          case "echo":
            appendOutput(argsStr, true);
            break;
          case "exit":
            appendOutput("Closing session");
            MyWindow.close();
          case "help":
            appendOutput(
              `No-UI commands:
  cat [file]    Print the contents of a file
  cd [dir]      Change directory
  clear         Clear the screen
  echo [msg]    Print something to the screen
  exit          Quit this mode
  help          Displays this menu
  js            Switch to JavaScript mode
  ls            List files in the current directory
  mkdir [dir]   Create a directory
  pwd           Print the current directory
  rm [file]     Delete a file
  rmdir [dir]   Delete a directory
  touch [file]  Create a file
  uname         Lists system information
  curl [url]    Fetch a URL
  wget [url]    Download a URL
  install [url] Install an app from a URL
  whoami        Print the current username<br>
  `
            );
            break;
          case "clear":
            document.querySelector(".no-ui .output").innerHTML = "";
            break;
          case "js":
            Term.commandLine = false;
            break;
          case "ls":
            console.log(cmd, path);
            let files = await vfs.list(path);
            let str = "";
            for (let i = 0; i < files.length; i++) {
              str +=
                files[i].item + (files[i].type === "dir" ? "/" : "") + "<br>";
            }
            appendOutput(str);
            break;
          case "cd":
            // let dir = argsStr;
            // console.log(dir)
            // if (dir === "..") {
            //   path = path.split("/");
            //   path.pop();
            //   path = path.join("/");
            // } else {
            //   path += dir;
            // }

            let args = argsStr.trim().split(" ");

            const isFile = await vfs.whatIs(path + "/" + args[0]);

            console.log(isFile, path + "/" + args[0], args, args[0]);

            if (args[0] === "..") {
              // if the folder is Root then it will not go back
              if (path === "Root") {
                appendOutput("Cannot cd back from Root");
              }
              // if the folder is not Root then it will go back
              else {
                // set the path var, to the old path then it adds a / before new path but remove the last slash
                path = path.split("/").slice(0, -1).join("/");
              }

              setPromptPath();
              return;
            }

            if (isFile === "file") {
              appendOutput("Cannot cd into a file");
              return;
            }

            if (!isFile) {
              appendOutput("Path does not exist");
              return;
            }
            console.log(isFile);

            // set the path var, to the old path then it adds a / before new path but remove the last slash
            path = path + "/" + args[0];

            setPromptPath();
            break;
          case "cat":
            let file = argsStr.trim();
            let content = await vfs.readFile(path + "/" + file);

            console.log(content, path + "/" + file);
            content = content.replace(/&/g, "&amp;");
            content = content.replace(/</g, "&lt;");
            content = content.replace(/>/g, "&gt;");
            content = content.replace(/"/g, "&quot;");
            content = content.replace(/'/g, "&apos;");
            appendOutput(content);
            break;
          case "pwd":
            appendOutput(path);
            break;
          case "mkdir":
            let dir = argsStr.trim();
            await vfs.createFolder(path + "/" + dir);
            break;
          case "rm":
          case "rmdir":
            let file2 = argsStr.trim();
            await vfs.delete(path + "/" + file2);
            break;
          case "touch":
            let file3 = argsStr.trim();
            await vfs.writeFile(path + "/" + file3, "");
            break;
          case "uname":
            console.log(Root);
            let KernelName = "Pluto-Core";
            let HostName = window.location.hostname;
            let KernelRelease = Root.Lib.systemInfo.version + " Browser";
            let KernelVersion =
              "#1 " +
              Root.Lib.systemInfo.codename +
              " " +
              Root.Lib.systemInfo.version;
            let Machine = "Browser";
            let OsName = "Pluto";
            let args2 = argsStr.trim();
            switch (args2) {
              case "-a":
                appendOutput(
                  `${KernelName} ${HostName} ${KernelRelease} ${KernelVersion} ${Machine} ${OsName}`
                );
                break;
              case "-s":
                appendOutput(`${KernelName}`);
                break;
              case "-n":
                appendOutput(`${HostName}`);
                break;
              case "-r":
                appendOutput(`${KernelRelease}`);
                break;
              case "-v":
                appendOutput(`${KernelVersion}`);
                break;
              case "-m":
                appendOutput(`${Machine}`);
                break;
              case "-o":
                appendOutput(`${OsName}`);
                break;
              case "-p":
                appendOutput(`${Machine}`);
                break;
              case "-u":
                appendOutput(`${navigator.userAgent}`);
                break;
              default:
                appendOutput(
                  `uname: invalid option ${args2}
usage: uname [OPTION]
uname -a   List all information
uname -s   Kernel name
uname -n   Host name
uname -r   Kernel release
uname -v   Kernel version
uname -m   Machine
uname -o   OS name
uname -p   Machine
uname -u   User agent`
                );
                break;
            }
            break;
          case "curl":
            let url = argsStr.trim();
            let res = await fetch(url);
            let text = await res.text();
            // escape the html in text
            text = text.replace(/&/g, "&amp;");
            text = text.replace(/</g, "&lt;");
            text = text.replace(/>/g, "&gt;");
            text = text.replace(/"/g, "&quot;");
            text = text.replace(/'/g, "&apos;");
            appendOutput(text);
            break;
          case "wget":
            let url2 = argsStr.trim();
            let res2 = await fetch(url2);
            let text2 = await res2.text();
            let filename = url2.split("/").pop();
            if (!filename || filename === "") {
              // if filename is empty then make a random id
              filename = Math.random().toString(36).substring(2);
            }
            await vfs.writeFile(path + "/" + filename, text2);
            appendOutput(`Downloaded ${filename}`);
            break;
          case "install":
            let url3 = argsStr.trim();
            let res3 = await fetch(url3);
            let text3 = await res3.text();
            let filename2 = url3.split("/").pop();
            if (!filename2 || filename2 === "") {
              // if filename is empty then make a random id
              filename2 = Math.random().toString(36).substring(2);
            }
            await vfs.writeFile("Root/Pluto/apps/" + filename2, text3);
            appendOutput(`Downloaded ${filename2}`);
            break;
          case "whoami":
            const userData = service.ref.getUserData();
            let username = userData.username;
            appendOutput(username);
            break;
          default:
            if (cmd !== "") {
              console.log(cmd);
              let appPath = `Root/Pluto/apps/${cmd}.app`;
              let process = null;
              const appExists = await vfs.exists(appPath);
              if (!appExists) {
                appendOutput(cmd + ": command not found");
                break;
              }
              console.log(cmd + " app exists... Executing");
              const curApp = await Root.Core.startPkg(
                "data:text/javascript;base64," +
                  btoa(await vfs.readFile(appPath)),
                false,
                true
              );
              if (curApp != false) {
                process = curApp;
              }
              if (!process) {
                appendOutput(cmd + " failed executing :(");
              }
              process.proc.send({
                type: "command",
                arguments: argsStr.trim().split(" "),
                pid: Root.PID,
              });
            }
            break;
        }
      }
      document.querySelector(".no-ui").scrollTop =
        document.querySelector(".no-ui").scrollHeight;
    }

    // NoUI.appendTo('body');

    Terminal = undefined;

    inputDiv.focus();

    L.setOnEnd((_) => {
      // Clean up process
      MyWindow.close();
    });

    return L.setupReturns(async (m) => {
      if (m && m.type) {
        if (m.type === "refresh") {
          Root.Lib.getString = m.data;
          MyWindow.setTitle(Root.Lib.getString("systemApp_Terminal"));
          Root.Lib.updateProcTitle(Root.Lib.getString("systemApp_Terminal"));
        }
        if (m.type == "append") {
          appendOutput(m.data);
        }
        if (m.type == "exec_finish") {
          Root.Core.processList[m.pid].proc.end();
        }
      }
    });
  },
};
