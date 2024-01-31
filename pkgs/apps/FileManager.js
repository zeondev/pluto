import ctxMenu from "../lib/CtxMenu.js";

let localforage = window.localforage;

export default {
  name: "File Manager",
  description:
    "Browse, import, and manage files through this beautiful and simplistic file manager.",
  privileges: [
    {
      privilege: "startPkg",
      description: "Run applications from files",
    },
  ],
  ver: 1, // Compatible with core v1
  type: "process",
  exec: async function (Root) {
    let win;

    const L = Root.Lib;
    const C = Root.Core;

    const vfs = await L.loadLibrary("VirtualFS");
    const Sidebar = await L.loadComponent("Sidebar");
    const Win = (await L.loadLibrary("WindowSystem")).win;
    const FileMappings = await L.loadLibrary("FileMappings");

    const appName = Root.Lib.getString("systemApp_FileManager");

    win = new Win({
      title: appName,
      pid: Root.PID,
      width: "468px",
      height: "320px",
      onclose: () => {
        Root.Lib.onEnd();
      },
    });

    Root.Lib.setOnEnd((_) => win.close());

    const setTitle = (t) =>
      (win.window.querySelector(".win-titlebar .title").innerText = t);

    let wrapper = win.window.querySelector(".win-content");

    wrapper.classList.add("row", "o-h", "h-100", "with-sidebar");

    let path = "Root";

    let sidebarWrapper = new Root.Lib.html("div")
      .styleJs({ display: "flex" })
      .appendTo(wrapper);

    function makeSidebar() {
      sidebarWrapper.clear();
      Sidebar.new(sidebarWrapper, [
        {
          onclick: async (_) => {
            if (path === "Root") return;

            let p = await vfs.getParentFolder(path);
            path = p;
            renderFileList(p);
          },
          html: L.icons.arrowUp,
          title: "Up a directory",
        },
        {
          onclick: async (_) => {
            let result = await Root.Modal.input(
              "Input",
              "New folder name",
              "New folder"
            );
            if (result === false) return;
            result = result.replace(/\//g, "");
            await vfs.createFolder(path + "/" + result);
            renderFileList(path);
          },
          html: L.icons.createFolder,
          title: "Create Folder",
        },
        {
          onclick: async (_) => {
            let result = await Root.Modal.input(
              "Input",
              "New file name",
              "New file"
            );
            if (result === false) return;
            result = result.replace(/\//g, "");
            await vfs.writeFile(path + "/" + result, "");
            renderFileList(path);
          },
          html: L.icons.createFile,
          title: "Create File",
        },
        {
          onclick: async (_) => {
            let result = await Root.Modal.input(
              "Go to Folder",
              "Enter folder path",
              "Path",
              wrapper,
              false,
              path
            );
            if (result === false) return;
            path = result;
            renderFileList(path);
          },
          html: L.icons.dir,
          title: "Go to Folder",
        },
        {
          onclick: async (_) => {
            if (!selectedItem) return;
            let i = await vfs.whatIs(selectedItem);
            if (i === "dir")
              return Root.Modal.alert(
                "Error",
                "Folder download is not yet supported.",
                wrapper
              );
            let text = await vfs.readFile(selectedItem, undefined, true);

            // boilerplate download code
            var element = document.createElement("a");
            element.setAttribute(
              "href",
              "data:text/plain;charset=utf-8," + encodeURIComponent(text)
            );
            element.setAttribute("download", selectedItem.split("/").pop());
            element.style.display = "none";
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
            renderFileList(path);
          },
          html: L.icons.download,
          title: "Download File",
        },
        {
          onclick: (_) => {
            var input = new Root.Lib.html("input").elm;
            input.type = "file";

            input.onchange = (e) => {
              // getting a hold of the file reference
              var file = e.target.files[0];
              var reader = new FileReader();

              if (
                file.type.startsWith("image") ||
                file.type.startsWith("audio") ||
                file.type.startsWith("video")
              ) {
                console.log(file);
                // read as arraybuffer; store as base64
                // reader.readAsDataURL(file);
                reader.readAsArrayBuffer(file);

                // here we tell the reader what to do when it's done reading...
                reader.onload = async (readerEvent) => {
                  // var content = readerEvent.target.result; // this is the content!
                  const blob = new Blob([readerEvent.target.result], {
                    type: file.type,
                  });

                  const filePath = `${Root.Lib.randomString()}-${file.name}`;

                  await localforage.setItem(filePath, blob);

                  await vfs.writeFile(
                    `${path}/${file.name}`,
                    `vfsImport:${filePath}`
                  );

                  renderFileList(path);
                };
              } else {
                // read as text
                reader.readAsText(file, "UTF-8");

                // here we tell the reader what to do when it's done reading...
                reader.onload = async (readerEvent) => {
                  var content = readerEvent.target.result; // this is the content!

                  const filePath = `${Root.Lib.randomString()}-${file.name}`;

                  await localforage.setItem(filePath, content);

                  await vfs.writeFile(
                    `${path}/${file.name}`,
                    `vfsImport:${filePath}`
                  );

                  renderFileList(path);
                };
              }
            };

            input.click();
          },
          html: L.icons.upload,
          title: "Upload File from Host",
        },
        {
          onclick: async (_) => {
            if (!selectedItem) return;
            let i = await vfs.whatIs(selectedItem);
            let result = await Root.Modal.prompt(
              "Notice",
              `Are you sure you want to delete this ${
                i === "dir" ? "folder" : "file"
              }?`
            );
            if (result === true) {
              await vfs.delete(selectedItem);
              renderFileList(path);
            }
          },
          html: L.icons.delete,
          title: "Delete File",
        },
      ]);
    }

    makeSidebar();

    const wrapperWrapper = new L.html("div")
      .class("col", "w-100", "ovh")
      .appendTo(wrapper);
    const wrapperWrapperWrapper = new L.html("div")
      .class("fg", "w-100")
      .appendTo(wrapperWrapper);

    wrapperWrapperWrapper.on("contextmenu", (e) => {
      if (e.target.closest("tr")) return;
      e.preventDefault();

      ctxMenu.data.new(e.clientX, e.clientY, [
        {
          item: "Copy path",
          async select() {
            let x = new L.html("textarea").val(path);
            // Select the text field
            x.elm.select();
            x.elm.setSelectionRange(0, 99999); // For mobile devices

            // Copy the text inside the text field
            navigator.clipboard.writeText(x.getValue());
          },
        },
      ]);
    });

    const table = new L.html("table")
      .class("w-100")
      .appendTo(wrapperWrapperWrapper);

    await vfs.importFS();

    let selectedItem = "";

    let tableHead = new L.html("thead").appendTo(table);
    let tableHeadRow = new L.html("tr").appendTo(tableHead);
    new L.html("th").attr({ colspan: 2 }).text("Name").appendTo(tableHeadRow);
    new L.html("th").text("Type").appendTo(tableHeadRow);

    let tableBody = new L.html("tbody").appendTo(table);

    async function renderFileList(folder) {
      const isFolder = await vfs.whatIs(folder);

      if (isFolder !== "dir") {
        path = "Root/";
        return renderFileList(path);
      }
      // return renderFileList(await vfs.getParentFolder(folder));

      setTitle(appName + " - " + folder);
      let fileList = await vfs.list(folder);

      const mappings = await Promise.all(
        fileList.map(async (e) => {
          return await FileMappings.retrieveAllMIMEdata(path + "/" + e.item);
        })
      );

      tableBody.html("");

      for (let i = 0; i < fileList.length; i++) {
        let file = fileList[i];
        let tableBodyRow = new L.html("tr").appendTo(tableBody);
        const mapping = mappings[i];

        tableBodyRow.on("contextmenu", (e) => {
          e.preventDefault();
          ctxMenu.data.new(e.clientX, e.clientY, [
            {
              item: "Open",
              async select() {
                mapping.onClick(Root.Core);
              },
            },
            mapping.ctxMenuApp !== undefined
              ? {
                  item: `Open in ${Root.Lib.getString(
                    mapping.ctxMenuApp.name
                  )}`,
                  async select() {
                    const p = await Root.Core.startPkg(
                      mapping.ctxMenuApp.launch,
                      true,
                      true
                    );
                    p.proc.send({
                      type: "loadFile",
                      path: path + "/" + file.item,
                    });
                  },
                }
              : null,
            {
              item: "Copy path",
              async select() {
                let x = new L.html("textarea").val(path + "/" + file.item);
                // Select the text field
                x.elm.select();
                x.elm.setSelectionRange(0, 99999); // For mobile devices

                // Copy the text inside the text field
                navigator.clipboard.writeText(x.getValue());
              },
            },
            {
              item: "Rename",
              async select() {
                let result = await Root.Modal.input(
                  "Rename File",
                  `Rename ${file.item} to...`,
                  file.item,
                  wrapper,
                  false,
                  file.item
                );
                // clean result
                result = result.replace(/\//g, "");
                await vfs.rename(`${path}/${file.item}`, `${result}`);
                renderFileList(path);
              },
            },
            {
              item: "Delete",
              async select() {
                await vfs.delete(`${path}/${file.item}`);
              },
            },
          ]);
        });

        async function handleClick() {
          if (selectedItem === path + "/" + file.item) {
            if (file.type === "dir") {
              selectedItem = path + "/" + file.item;
              path = selectedItem;
              renderFileList(path);
            } else {
              mapping.onClick(Root.Core);
            }

            return;
          }
          selectedItem = path + "/" + file.item;
          renderFileList(path);
        }

        tableBodyRow.on("mousedown", (e) => {
          if (e.button === 0) handleClick();
        });
        tableBodyRow.on("touchstart", handleClick);

        if (file === null) continue;

        if (selectedItem === path + "/" + file.item)
          tableBodyRow.class("table-selected");

        let userFriendlyFileType = Root.Lib.getString("file");

        switch (file.type) {
          case "dir":
            userFriendlyFileType = Root.Lib.getString("fileFolder");
            break;
          case "file":
            userFriendlyFileType = mapping.fullName || mapping.label;
            break;
        }

        new L.html("td")
          .style({ width: "24px", height: "24px" })
          .append(
            new Root.Lib.html("div")
              .html(
                mapping.icon in Root.Lib.icons
                  ? Root.Lib.icons[mapping.icon]
                  : mapping.icon
              )
              .style({ width: "24px" })
          )
          .appendTo(tableBodyRow);
        new L.html("td").text(file.item).appendTo(tableBodyRow);
        new L.html("td").text(userFriendlyFileType).appendTo(tableBodyRow);
      }

      if (fileList.length === 0) {
        tableBody.append(
          new L.html("tr")
            .attr({ colspan: "2" })
            .appendMany(new L.html("label").text("This directory is empty."))
            .styleJs({ padding: "12px", display: "block" })
        );
      }
    }

    await renderFileList(path);

    return L.setupReturns(async (m) => {
      if (m && m.type) {
        if (m.type === "refresh") {
          Root.Lib.getString = m.data;
          win.setTitle(Root.Lib.getString("systemApp_FileManager"));
          Root.Lib.updateProcTitle(Root.Lib.getString("systemApp_FileManager"));
          makeSidebar();
        }
      }
      if (
        typeof m === "object" &&
        m.type &&
        m.type === "loadFolder" &&
        m.path
      ) {
        path = m.path;
        renderFileList(m.path);
      }
    });
  },
};
