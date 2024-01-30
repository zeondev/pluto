let lib, Html;
import CtxMenu from "../lib/CtxMenu.js";

export default {
  name: "MenuBar",
  description: "Create horizontal toolbars used in GUI apps.",
  ver: 1, // Compatible with core v1
  type: "component",
  init: function (l) {
    lib = l;
    Html = l.html;
  },
  data: {
    new: (wrapper, buttons) => {
      const sideBar = new Html("div").class("row", "menu-bar");

      let popup;
      buttons.forEach((b) => {
        let button = new Html("button")
          .class("transparent")
          .text(b.item)
          .on("mousedown", () => {
            popup.cleanup();
            popup = null;
          })
          .on("click", (e) => {
            if (popup) {
              popup.cleanup();
              popup = null;
            } else {
              const bcr = button.elm.getBoundingClientRect();
              popup = CtxMenu.data
                .new(
                  bcr.left,
                  bcr.bottom,
                  b.items.map((item) => {
                    let text = `<span>${lib.escapeHtml(item.item)}</span>`;
                    if (item.icon) {
                      text = `${item.icon}<span>${lib.escapeHtml(
                        item.item
                      )}</span>`;
                    }
                    if (item.type !== undefined) {
                      if (item.type === "separator") {
                        return {
                          item: "<hr>",
                          selectable: false,
                        };
                      } else return item;
                    }
                    if (item.key !== undefined) {
                      return {
                        item:
                          text +
                          `<span class="ml-auto label">${item.key}</span>`,
                        select: item.select,
                      };
                    } else {
                      return { item: text, select: item.select };
                    }
                  }),
                  null,
                  document.body,
                  true,
                  true
                )
                .styleJs({
                  minWidth: "150px",
                })
                .appendTo("body");
            }
          })
          .style(b.style || {})
          .appendTo(sideBar);
      });

      sideBar.appendTo(wrapper);

      return sideBar;
    },
  },
};
