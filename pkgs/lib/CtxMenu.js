import Html from "../../assets/html.js";

export default {
  name: "Context Menu Library",
  description: "Allows context menu creation",
  ver: 1, // Compatible with core v1
  type: "library",
  data: {
    new(
      posX = 0,
      posY = 0,
      items = [{ item: "Nothing", select: () => null }],
      header = null,
      parent = document.body,
      isAbsolute = true,
      isHtml = false
    ) {
      const headerItem = new Html("div").class("header").text(header);

      // Create the items
      const itemsMapped = items
        .filter((i) => i !== null)
        .map((i) => {
          if (typeof i.selectable !== undefined) {
            if (i.selectable === false) {
              return new Html("div").html(i.item).class("row", "ac");
            }
          }
          const h = new Html("div")
            .class("item", "row", "ac", "gap")
            .on("click", (_) => {
              ctxMenu.cleanup();
              i.select();
            });
          if (isHtml === true) h.html(i.item);
          else h.text(i.item);
          return h;
        });

      let itemList = [];
      if (header === null) {
        itemList = [...itemsMapped];
      } else {
        itemList = [headerItem, ...itemsMapped];
      }

      // actual menu
      const ctxMenu = new Html("div")
        .class("ctx-menu", "popup-overlay")
        .styleJs({
          position: isAbsolute === true ? "absolute" : "unset",
          left: posX + "px",
          top: posY + (header !== null ? -28 : 0) + "px",
          padding: header === null ? "4px 0" : undefined,
        })
        .appendMany(...itemList)
        .on("contextmenu", (e) => {
          e.preventDefault();
        })
        .appendTo(parent);

      requestAnimationFrame(() => {
        // ctx menu has rendered, move it to correct location

        /**
         * @type DOMRect
         */
        const bcr = ctxMenu.elm.getBoundingClientRect();

        // Prevent bottom context menu issues
        if (bcr.bottom > window.innerHeight) {
          ctxMenu.style({
            top: window.innerHeight - bcr.height + "px",
          });
        }
        if (bcr.right > window.innerWidth) {
          ctxMenu.style({
            left: window.innerWidth - bcr.width + "px",
          });
        }
      });

      return ctxMenu;
    },
  },
};
