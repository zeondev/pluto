async function pmlRunScript(script) {}

export default {
  name: "PML",
  description: "Pluto XML Application.",
  ver: "v1.6.2", // Supports minimum Core version of v1.6.2
  type: "process",
  exec: async function (Root) {
    let wrapper; // Lib.html | undefined
    let PMLWindow;
    let appTitle = "Example App";

    const Win = (await Root.Lib.loadLibrary("WindowSystem")).win;

    PMLWindow = new Win({
      title: appTitle,
      content: "Hello",
      pid: Root.PID,
      onclose: () => {
        Root.Lib.onEnd();
      },
    });

    console.log("WINDOW", PMLWindow);

    const Vfs = await Root.Lib.loadLibrary("VirtualFS");

    const FileDialog = await Root.Lib.loadLibrary("FileDialog");

    function makeid(length) {
      var result = "";
      var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
      var charactersLength = characters.length;
      for (var i = 0; i < length; i++) {
        result += characters.charAt(
          Math.floor(Math.random() * charactersLength)
        );
      }
      return result;
    }

    // function updateTitle(title) {
    //   PMLWindow.window.querySelector(
    //     ".win-titlebar .outer-title .title"
    //   ).innerHTML = title;
    // }

    Root.Lib.setOnEnd((_) => PMLWindow.close());

    wrapper = PMLWindow.window.querySelector(".win-content");

    async function readAndRunPmlFile(path) {
      let file = await Vfs.readFile(path);

      console.log(wrapper);

      wrapper.id = makeid(16);
      console.log("there is xml content", file);
      var parser = new DOMParser();
      var xmlDoc = parser.parseFromString(file, "text/xml");
      console.log(xmlDoc.documentElement);
      for (let i = 0; i < xmlDoc.documentElement.children.length; i++) {
        if (xmlDoc.documentElement.children[i].tagName == "info") {
          console.log("info found", xmlDoc.documentElement.children[i]);
          console.log(xmlDoc.documentElement.children[i].innerHTML);
          for (
            let j = 0;
            j < xmlDoc.documentElement.children[i].children.length;
            j++
          ) {
            if (
              xmlDoc.documentElement.children[i].children[j].tagName == "title"
            ) {
              console.log(
                "title found",
                xmlDoc.documentElement.children[i].children[j]
              );
              appTitle =
                xmlDoc.documentElement.children[i].children[
                  j
                ].textContent.trim();

              PMLWindow.setTitle(appTitle);
            }
          }
        } else if (xmlDoc.documentElement.children[i].tagName == "content") {
          console.log("content found", xmlDoc.documentElement.children[i]);
          wrapper.innerHTML = ""; // clean it
          wrapper.insertAdjacentHTML(
            "beforeend",
            xmlDoc.documentElement.children[i].innerHTML
          );
        } else if (xmlDoc.documentElement.children[i].tagName == "script") {
          console.log("script found", xmlDoc.documentElement.children[i]);
          console.log(xmlDoc.documentElement.children[i].innerText);
          var scriptText = xmlDoc.documentElement.children[i].textContent;

          // Clean the script
          scriptText = scriptText.replace(/#this/g, "#" + wrapper.id);
          console.log("script", scriptText);
          let scriptElm = document.createElement("script");
          wrapper.appendChild(scriptElm);
          scriptElm.innerHTML = scriptText;
        } else if (xmlDoc.documentElement.children[i].tagName == "style") {
          console.log("style found", xmlDoc.documentElement.children[i]);
          console.log(xmlDoc.documentElement.children[i].innerText);
          var styleText = xmlDoc.documentElement.children[i].textContent;

          // Clean the style
          styleText = styleText.replace(/#this/g, "#" + wrapper.id);
          console.log("style", styleText);
          let styleElm = document.createElement("style");
          wrapper.appendChild(styleElm);
          styleElm.innerHTML = styleText;
        }
      }
    }

    let prep = false;

    setTimeout(async () => {
      if (prep === false) {
        let path = await FileDialog.pickFile("Root");
        await readAndRunPmlFile(path);
      }
    }, 100);

    return Root.Lib.setupReturns(async (m) => {
      if (typeof m === "object" && m.type && m.type === "loadFile" && m.path) {
        prep = true;
        readAndRunPmlFile(m.path);
      }
    });
  },
};
