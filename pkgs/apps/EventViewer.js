import ctxMenu from "../lib/CtxMenu.js";

export default {
  name: "Event Viewer",
  description: "Examine process events",
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
      if (TaskManagerWindow) TaskManagerWindow.close();
      clearInterval(remakeTable);
    });

    if (
      !Root.Core ||
      (Root.Core &&
        Root.Core.processList &&
        Root.Core.processList
          .filter((x) => x !== null)
          .find(
            (x) => x.name && x.name === "apps:EventViewer" && x.proc !== null
          ) !== undefined)
    ) {
      Root.Lib.onEnd();
      return Root.Lib.setupReturns((m) => {
        console.log("Example received message: " + m);
      });
    }

    const Win = (await Root.Lib.loadLibrary("WindowSystem")).win;

    TaskManagerWindow = new Win({
      title: Root.Lib.getString("systemApp_EventViewer"),
      content: "Loading...",
      width: "568px",
      height: "320px",
      pid: Root.PID,
      onclose: () => {
        Root.Lib.onEnd();
      },
    });

    const Html = Root.Lib.html;

    let list = [];

    wrapper = TaskManagerWindow.window.querySelector(".win-content");
    wrapper.innerHTML = "";

    wrapper.classList.add("col");

    const wrapperWrapper = new Html("div").class("fg", "ovh").appendTo(wrapper);
    const table = new Html("table").class("w-100").appendTo(wrapperWrapper);
    const buttonRow = new Html("div").class("row").appendTo(wrapper);

    let selectedEid = -1;

    function makeTaskTable() {
      table.clear();
      let tableHead = new Html("thead").appendTo(table);
      let tableHeadRow = new Html("tr").appendTo(tableHead);
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

      // let processes =
      //   Root.Core !== null ? Root.Core.processList : Root.Lib.getProcessList();

      for (let i = 0; i < list.length; i++) {
        let tableBodyRow = new Html("tr")
          .on("click", (_) => {
            selectedEid = i;
            makeTaskTable();
          })
          .appendTo(tableBody);

        let proc = Root.Core.processList
          .filter((p) => p !== null)
          .find((p) => p.pid === list[i].pid);

        if (proc === null) continue;

        if (selectedEid === i) tableBodyRow.class("table-selected");

        const listItem = list[i];

        let fullName = proc.name;

        console.log(listItem);

        new Html("td").text(fullName).appendTo(tableBodyRow);

        new Html("td").text(listItem.type).appendTo(tableBodyRow);

        new Html("td")
          .text(
            Array.from(listItem.data)
              .map((m) => {
                let s =
                  typeof m !== "function" ? JSON.stringify(m) : m.toString();

                if (s.length > 128) {
                  s = s.substring(0, 125) + "...";
                }

                return s;
              })
              .join(", ")
          )
          .appendTo(tableBodyRow);

        new Html("td").text(proc.pid).appendTo(tableBodyRow);
      }
    }

    makeTaskTable();

    // remakeTable = setInterval((_) => {
    //   makeTaskTable();
    // }, 1000);

    if (Root.Core !== null) {
      new Root.Lib.html("button")
        .class("primary")
        .text(Root.Lib.getString("details"))
        .appendTo(buttonRow)
        .on("click", (e) => {
          Root.Modal.modal(
            "Details",
            new Html("div").appendMany(
              ...Array.from(list[selectedEid].data).map((m) => {
                if (typeof m !== "function") {
                  let s = JSON.stringify(m);
                  return new Html("span").text(s);
                } else {
                  let s = m.toString();
                  return new Html("span").text(s);
                }
              })
            ),
            wrapper,
            true,
            {
              text: "OK",
              type: "primary",
              callback() {},
            }
          );
        });
      new Root.Lib.html("button")
        .text("Clear")
        .appendTo(buttonRow)
        .on("click", (e) => {
          list = [];
          makeTaskTable();
        });
    }

    return Root.Lib.setupReturns(async (m) => {
      if (m && m.type) {
        if (m.type === "procEvent" && m.data.pid !== Root.PID) {
          // console.log('hey', m);
          list.push(m.data);
          makeTaskTable();
        }
        // if (m.type === "refresh") {
        //   Root.Lib.getString = m.data;
        //   TaskManagerWindow.setTitle(
        //     Root.Lib.getString("systemApp_TaskManager")
        //   );
        //   Root.Lib.updateProcTitle(Root.Lib.getString("systemApp_TaskManager"));
        // }
      }
    });
  },
};
