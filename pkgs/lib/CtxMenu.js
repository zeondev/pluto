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
      isAbsolute = true
    ) {
      const headerItem = new Html("div").class("header").text(header);

      // Create the items
      const itemsMapped = items
        .filter((i) => i !== null)
        .map((i) => {
          return new Html("div")
            .class("item")
            .text(i.item)
            .on("click", (_) => {
              ctxMenu.cleanup();
              i.select();
            });
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
      return ctxMenu;
    },
  },
};
