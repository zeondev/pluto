let findEmptyInList = function (list) {
  let r = list.findIndex((p) => p === null);
  return r !== -1 ? r : list.length;
};

export default {
  name: "Browser",
  description: "Search the internet.",
  ver: 1, // Compatible with core v1
  type: "process",
  exec: async function (Root) {
    let wrapper; // Lib.html | undefined
    let MyWindow;

    console.log("Browser Loading...");

    Root.Lib.setOnEnd((_) => MyWindow.close());

    const Win = (await Root.Lib.loadLibrary("WindowSystem")).win;

    MyWindow = new Win({
      title: "Browser",
      content: "",
      pid: Root.PID,
      width: 640,
      height: 480,
      minWidth: 400,
      minHeight: 400,
      onclose: () => {
        Root.Lib.onEnd();
      },
    });

    wrapper = MyWindow.window.querySelector(".win-content");
    wrapper.classList.add("col", "with-sidebar", "browser");
    wrapper.style.overflow = "hidden";
    let selectedTab = 1;
    let tabsList = [
      {
        tabName: "Google",
        favicon: "https://www.google.com/favicon.ico",
        id: 1,
      },
    ];
    const header = new Root.Lib.html("div")
      .style({
        display: "flex",
        "flex-direction": "row",
        gap: "8px",
        "justify-content": "space-between",
        background: "var(--header)",
      })
      .appendTo(wrapper);
    const tabs = new Root.Lib.html("div")
      .style({
        display: "flex",
        "flex-direction": "row",
        gap: "1px",
        "justify-content": "space-between",
        background: "var(--outline)",
        height: "32px",
        "padding-top": "1px",
      })
      .appendTo(wrapper);
    new Root.Lib.html("div")
      .style({
        display: "flex",
        "align-items": "center",
        "flex-direction": "row",
        "justify-content": "space-between",
        background: "var(--unfocused)",
        // border: "1px solid var(--outline)",
        height: "32px",
        width: "100%",
        padding: "0px 8px",
      })
      .class("selected", "tab-1")
      .appendMany(
        new Root.Lib.html("span").text("Tab 1"),
        new Root.Lib.html("span")
          .html(
            `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`
          )
          .style({
            display: "flex",
            "justify-content": "center",
            "align-items": "center",
          })
      )
      .on("click", (e) => {
        // e.target.classList.forEach((el) => {
        //   if (el.startsWith("tab-")) {
        //     for (let i = 0; i < tabsList.length; i++) {
        //       wrapper
        //         .querySelector(`.tab-${tabsList[i].id}`)
        //         .classList.remove("selected");
        //       wrapper.querySelector(`.page-${tabsList[i].id}`).style.display =
        //         "none";
        //     }
        //     selectedTab = Number(el.split("-")[1]);
        //     wrapper.querySelector(`.page-${selectedTab}`).style.display =
        //       "block";
        //     wrapper.querySelector(`input.url`).value = wrapper.querySelector(
        //       `.page-${selectedTab}`
        //     ).src;
        //     e.target.classList.add("selected");
        //   }
        // });
      })
      .on("click", (e) => {
        e.target.classList.forEach((el) => {
          if (el.startsWith("tab-")) {
            for (let i = 0; i < tabsList.length; i++) {
              wrapper
                .querySelector(`.tab-${tabsList[i].id}`)
                .classList.remove("selected");
              wrapper.querySelector(`.page-${tabsList[i].id}`).style.display =
                "none";
            }
            selectedTab = Number(el.split("-")[1]);
            wrapper.querySelector(`.page-${selectedTab}`).style.display =
              "block";
            wrapper.querySelector(`input.url`).value = wrapper.querySelector(
              `.page-${selectedTab}`
            ).src;
            e.target.classList.add("selected");
          }
        });
      })
      .appendTo(tabs);
    // new Root.Lib.html("div")
    //   .style({
    //     display: "flex",
    //     "align-items": "center",
    //     "flex-direction": "row",
    //     background: "var(--unfocused)",
    //     // border: "1px solid var(--outline)",
    //     height: "32px",
    //     width: "100%",
    //   })
    //   .text("Tab 2")
    //   .appendTo(tabs);
    new Root.Lib.html("button")
      .style({
        display: "flex",
        "align-items": "center",
        "justify-content": "center",
        padding: "8px",
      })
      .html(
        `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-home"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`
      )
      .on("click", () => {
        alert("button clicked");
      })
      .appendTo(header);
    const toolHeader = new Root.Lib.html("div")
      .style({
        display: "flex",
        "flex-direction": "row",
        gap: "8px",
        "justify-content": "center",
        background: "var(--header)",
      })
      .appendTo(header);

    new Root.Lib.html("button")
      .style({
        display: "flex",
        "align-items": "center",
        "justify-content": "center",
        padding: "8px",
      })
      .html(
        `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>`
      )
      .on("click", () => {
        console.log(tabsList.length);
        for (let i = 0; i < tabsList.length; i++) {
          console.log(tabsList[i].id);
          wrapper
            .querySelector(`.tab-${tabsList[i].id}`)
            .classList.remove("selected");
          wrapper.querySelector(`.page-${tabsList[i].id}`).style.display =
            "none";
        }
        // selectedTab = Number(tabsList.length) + 1;
        selectedTab = tabsList.filter((p) => p !== null).length + 1;
        tabsList.push({
          tabName: "New Tab",
          favicon: "https://www.google.com/favicon.ico",
          id: selectedTab,
        });
        new Root.Lib.html("iframe")
          .attr({
            src: "http://www.google.com/webhp?igu=1",
          })
          .class("fg", "page-" + selectedTab)
          .appendTo(pages);
        new Root.Lib.html("div")
          .style({
            display: "flex",
            "align-items": "center",
            "flex-direction": "row",
            "justify-content": "space-between",
            background: "var(--unfocused)",
            // border: "1px solid var(--outline)",
            height: "32px",
            width: "100%",
            padding: "0px 8px",
          })
          .class("selected", "tab-" + selectedTab)
          .appendMany(
            new Root.Lib.html("span").text("Tab " + selectedTab),
            new Root.Lib.html("span")
              .html(
                `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`
              )
              .style({
                display: "flex",
                "justify-content": "center",
                "align-items": "center",
              })
              .on("click", (e) => {
                e.target.parentElement.parentElement.classList.forEach(
                  (elm) => {
                    if (elm.startsWith("tab-")) {
                      const tabId = Number(elm.split("-")[1]);
                      const tabElement = wrapper.querySelector(`.tab-${tabId}`);
                      const pageElement = wrapper.querySelector(
                        `.page-${tabId}`
                      );

                      // Remove tab and iframe elements
                      tabElement.remove();
                      pageElement.remove();

                      // Remove tab from tabsList
                      tabsList = tabsList.filter((tab) => tab.id !== tabId);
                    }
                  }
                );
              })
          )
          .on("click", (e) => {
            e.target.classList.forEach((el) => {
              if (el.startsWith("tab-")) {
                for (let i = 0; i < tabsList.length; i++) {
                  wrapper
                    .querySelector(`.tab-${tabsList[i].id}`)
                    .classList.remove("selected");
                  wrapper.querySelector(
                    `.page-${tabsList[i].id}`
                  ).style.display = "none";
                }
                selectedTab = Number(el.split("-")[1]);
                wrapper.querySelector(`.page-${selectedTab}`).style.display =
                  "block";
                wrapper.querySelector(`input.url`).value =
                  wrapper.querySelector(`.page-${selectedTab}`).src;

                e.target.classList.add("selected");
              }
            });
          })
          .appendTo(tabs);
      })
      .appendTo(header);

    const pages = new Root.Lib.html("div")
      .style({
        width: "100%",
        height: "100%",
      })
      .appendTo(wrapper);
    const iframe = new Root.Lib.html("iframe")
      .attr({
        // there's a good reason i did this, it's called browser compatibility
        // style:
        //   "width:-webkit-fill-available;width:-moz-fill-available;height:-webkit-fill-available;height:-moz-fill-available;",
        src: "http://www.google.com/webhp?igu=1",
      })
      .class("fg", "page-1")
      .appendTo(pages);

    iframe.on("load", async (e) => {
      console.log("Iframe has loaded successfully!");
      // Uncaught DOMException: Permission denied to access property "reload" on cross-origin object

      let f = await fetch(iframe.elm.src)
        .then((t) => t.text())
        .catch(undefined);

      if (f === undefined) {
        // Create a new DOMParser object
        const parser = new DOMParser();

        // Parse the HTML string
        const doc = parser.parseFromString(htmlString, "text/html");

        // Get the title element
        const titleElement = doc.querySelector("title");

        // Get the text content of the title element
        const title = titleElement.textContent;

        console.log("Got Title: ", title);

        console.log(iframe.elm.src, e);
      } else {
        console.log(
          "Failed to fetch title, here is a suggested title",
          iframe.elm.src.replace("https://", "")
        );
      }
      // console.log(iframe.elm.contentWindow.title);
    });

    new Root.Lib.html("button")
      .style({
        display: "flex",
        "align-items": "center",
        "justify-content": "center",
        padding: "8px",
      })
      .html(
        `<svg viewBox="0 0 24 24" width="12" height="12" stroke="var(--text)" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="ignore-css"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>`
      )
      .on("click", () => {
        // iframe.elm.contentWindow.location.reload();
        // Root.Lib.html
        //     .qs(".page-" + selectedTab).elm
        //     .contentWindow.location.reload();
        Root.Lib.html
          .qs(".page-" + selectedTab)
          .attr({ src: wrapper.querySelector(`.page-${selectedTab}`).src });
      })
      .appendTo(toolHeader);

    let adrb = new Root.Lib.html("input")
      .attr({
        type: "input",
        // style: "width:-webkit-fill-available;width:-moz-fill-available;",
        value: "http://www.google.com/webhp?igu=1",
      })
      .class("url")
      .on("keydown", async (e) => {
        if (e.key === "Enter") {
          if (e.target.value.trim() == "") return;
          console.log(selectedTab, "page-" + selectedTab);
          let uri;
          if (
            !e.target.value.trim().startsWith("http://") &&
            !e.target.value.trim().startsWith("https://")
          ) {
            uri = "https://" + e.target.value.trim();
          }
          Root.Lib.html
            .qs(".page-" + selectedTab)
            .attr({ src: uri || e.target.value.trim() });
        }
      })
      .appendTo(toolHeader);

    new Root.Lib.html("button")
      .style({
        display: "flex",
        "align-items": "center",
        "justify-content": "center",
        padding: "8px",
      })
      .html(
        `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`
      )
      .on("click", () => {
        // if (adrb.elm.value.trim() == "") return;
        // iframe.attr({ src: adrb.elm.value.trim() });
        if (adrb.elm.value.trim() == "") return;
        console.log(selectedTab, "page-" + selectedTab);
        let uri;
        if (
          !adrb.elm.value.trim().startsWith("http://") &&
          !adrb.elm.value.trim().startsWith("https://")
        ) {
          uri = "https://" + adrb.elm.value.trim();
        }
        Root.Lib.html
          .qs(".page-" + selectedTab)
          .attr({ src: uri || adrb.elm.value.trim() });
      })
      .appendTo(toolHeader);

    return Root.Lib.setupReturns((m) => {
      console.log("Example received message: " + m);
    });
  },
};
