let lib;
let html;

import CtxMenu from "../lib/CtxMenu.js";

export default {
  name: "MenuBar",
  description: "Create horizontal toolbars used in GUI apps.",
  ver: 1, // Compatible with core v1
  type: "component",
  init: function (l) {
    lib = l;
    html = l.html;
  },
  data: {
    new: (wrapper, buttons) => {
      const sideBar = new html("div").class("row", "menu-bar");

      let popup;
      buttons.forEach((b) => {
        let button = new html("button")
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
                .new(bcr.left, bcr.bottom, b.items, null, document.body, true)
                .appendTo("body");
            }
          })
          .style(b.style || {})
          .appendTo(sideBar);
      });

      sideBar.appendTo(wrapper);
    },
  },
};
