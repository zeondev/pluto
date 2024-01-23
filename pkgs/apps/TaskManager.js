import ctxMenu from "../lib/CtxMenu.js";

export default {
  name: "Task Manager",
  description: "Examine and manage processes",
  ver: 1, // Compatible with core v1
  type: "process",
  optInToEvents: true,
  privileges: [
    {
      privilege: "processList",
      description: "List and kill processes",
    },
  ],
  strings: {
    en_US: {
      table_type: "Type",
      table_appId: "App ID",
      table_details: "Details",
      table_pid: "PID",
      input_appId: "App ID (apps:...)",
      endProcess: "End Task",
    },
    en_GB: {
      table_type: "Type",
      table_appId: "App ID",
      table_details: "Details",
      table_pid: "PID",
      input_appId: "App ID (apps:...)",
      endProcess: "End Task",
    },
    de_DE: {
      table_type: "Typ",
      table_appId: "App ID",
      table_details: "Einzelheiten",
      table_pid: "PID",
      input_appId: "App-ID (apps:...)",
      endProcess: "Task beenden",
    },
    es_ES: {
      table_type: "Tipo",
      table_appId: "ID de aplicación",
      table_details: "Detalles",
      table_pid: "PID",
      input_appId: "ID de aplicación (apps:...)",
      endProcess: "Tarea final",
    },
    pt_BR: {
      table_type: "Tipo",
      table_appId: "ID do aplicativo",
      table_details: "Detalhes",
      table_pid: "PID",
      input_appId: "ID do aplicativo (apps:...)",
      endProcess: "Finalizar tarefa",
    },
    fil_PH: {
      table_type: "Uri",
      table_appId: "App ID",
      table_details: "Detalye",
      table_pid: "PID",
      input_appId: "App ID (apps:...)",
      endProcess: "I-tigil ang Task",
    },
  },
  exec: async function (Root) {
    let wrapper; // Lib.html | undefined
    let TaskManagerWindow;
    let remakeTable;

    Root.Lib.setOnEnd(function () {
      TaskManagerWindow.close();
      clearInterval(remakeTable);
    });

    const Win = (await Root.Lib.loadLibrary("WindowSystem")).win;

    TaskManagerWindow = new Win({
      title: Root.Lib.getString("systemApp_TaskManager"),
      content: "Loading...",
      width: "468px",
      height: "320px",
      pid: Root.PID,
      onclose: () => {
        Root.Lib.onEnd();
      },
    });

    const Html = Root.Lib.html;

    wrapper = TaskManagerWindow.window.querySelector(".win-content");
    wrapper.innerHTML = "";

    wrapper.classList.add("col");

    const wrapperWrapper = new Html("div").class("fg", "ovh").appendTo(wrapper);
    const table = new Html("table").class("w-100").appendTo(wrapperWrapper);
    const buttonRow = new Html("div").class("row").appendTo(wrapper);

    let selectedPid = -1;

    function makeTaskTable() {
      table.clear();
      let tableHead = new Html("thead").appendTo(table);
      let tableHeadRow = new Html("tr").appendTo(tableHead);
      new Html("th")
        .styleJs({ whiteSpace: "nowrap" })
        .text(Root.Lib.getString("table_type"))
        .appendTo(tableHeadRow);
      new Html("th")
        .styleJs({ whiteSpace: "nowrap" })
        .text(Root.Lib.getString("table_appId"))
        .appendTo(tableHeadRow);
      new Html("th")
        .styleJs({ whiteSpace: "nowrap" })
        .text(Root.Lib.getString("table_details"))
        .attr({ colspan: 2 })
        .appendTo(tableHeadRow);
      new Html("th")
        .styleJs({ whiteSpace: "nowrap" })
        .text(Root.Lib.getString("table_pid"))
        .appendTo(tableHeadRow);

      let tableBody = new Html("tbody").appendTo(table);

      let processes =
        Root.Core !== null ? Root.Core.processList : Root.Lib.getProcessList();

      for (let i = 0; i < processes.length; i++) {
        let tableBodyRow = new Html("tr")
          .on("click", (_) => {
            selectedPid = proc.pid;
            makeTaskTable();
          })
          .on("contextmenu", (e) => {
            e.preventDefault();
            ctxMenu.data.new(e.clientX, e.clientY, [
              {
                item: Root.Lib.getString("endProcess"),
                async select() {
                  let p = Root.Core.processList
                    .filter((p) => p !== null)
                    .find((p) => p.pid === proc.pid);
                  p.proc?.end();
                  selectedPid = -1;
                  makeTaskTable();
                },
              },
            ]);
          })
          .appendTo(tableBody);
        let proc = processes[i];

        if (proc === null) continue;

        if (selectedPid === proc.pid) tableBodyRow.class("table-selected");

        let fullName = proc.name.split(":");
        let name = fullName[1];
        let category = fullName[0];

        new Html("td").text(category).appendTo(tableBodyRow);
        new Html("td").text(name).appendTo(tableBodyRow);
        if (proc.proc) {
          new Html("td").text(proc.proc.name).appendTo(tableBodyRow);
          new Html("td").text(proc.proc.description).appendTo(tableBodyRow);
        } else {
          new Html("td")
            .text("N/A")
            .attr({ colspan: 2 })
            .appendTo(tableBodyRow);
        }
        new Html("td").text(proc.pid).appendTo(tableBodyRow);
      }
    }

    makeTaskTable();

    let x = new Root.Lib.html("input")
      .attr({ placeholder: Root.Lib.getString("input_appId") })
      .class("fg")
      .appendTo(buttonRow);
    /* Button */
    new Root.Lib.html("button")
      .text(Root.Lib.getString("launchApp"))
      .appendTo(buttonRow)
      .on("click", (e) => {
        Root.Lib.launch("apps:" + x.elm.value.replace(/([^A-Za-z0-9-])/g, ""));
      });

    remakeTable = setInterval((_) => {
      makeTaskTable();
    }, 1000);

    if (Root.Core !== null) {
      new Root.Lib.html("button")
        .class("primary")
        .text(Root.Lib.getString("endProcess"))
        .appendTo(buttonRow)
        .on("click", (e) => {
          if (selectedPid === -1) {
            return;
          }
          let p = Root.Core.processList
            .filter((p) => p !== null)
            .find((p) => p.pid === selectedPid);
          p.proc?.end();
          selectedPid = -1;
          makeTaskTable();
        });
    }

    return Root.Lib.setupReturns(async (m) => {
      if (m && m.type) {
        if (m.type === "refresh") {
          Root.Lib.getString = m.data;
          TaskManagerWindow.setTitle(
            Root.Lib.getString("systemApp_TaskManager")
          );
          Root.Lib.updateProcTitle(Root.Lib.getString("systemApp_TaskManager"));
        }
      }
    });
  },
};
