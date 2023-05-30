let L = {};
let C = {};

export default {
  name: "List Pick Library",
  description:
    "! this library is unfinished ! List library to pick out items from a list",
  ver: 0.1, // Compatible with core 0.1
  type: "library",
  init: (l, c) => {
    L = l;
    C = c;
  },
  data: {
    pick: (items) => {
      return new Promise(async (resolve, reject) => {
        const Win = (await L.loadLibrary("WindowSystem")).win;

        let win = new Win({
          title: "Select an item",
          content: "",
          onclose: () => {
            resolve(false);
          },
        });

        const setTitle = (t) =>
          (win.window.querySelector(".win-titlebar .title").innerText = t);

        let wrapper = win.window.querySelector(".win-content");

        wrapper.classList.add("row", "o-h", "h-100", "with-sidebar");

        let isClosing = false;

        const wrapperWrapper = new L.html("div")
          .class("col", "w-100")
          .appendTo(wrapper);
        const wrapperWrapperWrapper = new L.html("div")
          .class("fg", "w-100")
          .appendTo(wrapperWrapper);

        const attemptClose = async (_) => {
          if (!isClosing) {
            isClosing = true;
            await win.close();
          }
        };

        const table = new L.html("table")
          .class("w-100")
          .appendTo(wrapperWrapperWrapper);
        const buttonRow = new L.html("div")
          .class("row")
          .appendTo(wrapperWrapper);

        let confirmButton = new L.html("button")
          .class("primary")
          .text("Confirm")
          .style({ "margin-left": "auto" })
          .attr({ disabled: true })
          .on("click", async (_) => {
            await attemptClose();
            return resolve(selectedItem);
          });
        let cancelButton = new L.html("button")
          .text("Cancel")
          .on("click", async (_) => {
            await attemptClose();
            resolve(false);
          });

        buttonRow.appendMany(confirmButton, cancelButton);

        vfs.importFS();

        let selectedItem = "";

        function renderFileList(folder) {
          const isFolder = vfs.whatIs(folder);

          if (isFolder !== "dir") {
            path = "Root/Desktop";
            return renderFileList();
          }

          // return renderFileList(vfs.getParentFolder(folder));

          setTitle("File picker - " + folder);
          let fileList = vfs.list(folder);

          table.html("");

          let tableBody = new L.html("tbody").appendTo(table);

          for (let i = 0; i < fileList.length; i++) {
            let file = fileList[i];
            let tableBodyRow = new L.html("tr").appendTo(tableBody);
            tableBodyRow.on("click", async (_) => {
              if (selectedItem === path + "/" + file.item) {
                if (file.type === "dir") {
                  selectedItem = path + "/" + file.item;
                  confirmButton.attr({ disabled: "" });
                  path = selectedItem;
                  renderFileList(path);
                } else {
                  selectedItem = path + "/" + file.item;
                  await attemptClose();
                  return resolve(selectedItem);
                }

                return;
              }
              selectedItem = path + "/" + file.item;
              renderFileList(path);
            });

            if (file === null) continue;

            if (selectedItem === path + "/" + file.item)
              tableBodyRow.class("table-selected");

            new L.html("td").text(file.item).appendTo(tableBodyRow);
            new L.html("td").text(file.type).appendTo(tableBodyRow);
          }
        }

        renderFileList(path);
      });
    },
  },
};
