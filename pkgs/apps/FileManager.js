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

    win = new Win({
      title: "Files",
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

    Sidebar.new(wrapper, [
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
        },
        html: L.icons.createFile,
        title: "Create File",
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
              // read as arraybuffer; store as base64
              reader.readAsDataURL(file);

              // here we tell the reader what to do when it's done reading...
              reader.onload = async (readerEvent) => {
                var content = readerEvent.target.result; // this is the content!
                await vfs.writeFile(`Root/${file.name}`, content);
              };
            } else {
              // read as text
              reader.readAsText(file, "UTF-8");

              // here we tell the reader what to do when it's done reading...
              reader.onload = async (readerEvent) => {
                var content = readerEvent.target.result; // this is the content!
                await vfs.writeFile(`${path}/${file.name}`, content);
              };
            }
          };

          input.click();
        },
        html: L.icons.import,
        title: "Import file from your system",
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
          }
        },
        html: L.icons.delete,
        title: "Delete File",
      },
    ]);

    const wrapperWrapper = new L.html("div")
      .class("col", "w-100", "ovh")
      .appendTo(wrapper);
    const wrapperWrapperWrapper = new L.html("div")
      .class("fg", "w-100")
      .appendTo(wrapperWrapper);

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
        return renderFileList();
      }
      // return renderFileList(await vfs.getParentFolder(folder));

      setTitle("Files - " + folder);
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

        tableBodyRow.on("mousedown", handleClick);
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
              .html(Root.Lib.icons[mapping.icon])
              .style({ width: "24px" })
          )
          .appendTo(tableBodyRow);
        new L.html("td").text(file.item).appendTo(tableBodyRow);
        new L.html("td").text(userFriendlyFileType).appendTo(tableBodyRow);
      }
    }

    await renderFileList(path);

    return L.setupReturns((m) => {
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
