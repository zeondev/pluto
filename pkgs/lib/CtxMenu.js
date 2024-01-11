import Html from "../../assets/html.js";

export default {
  new(
    posX = 0,
    posY = 0,
    items = [{ item: "Nothing", select: () => null }],
    header = "Actions",
    parent = document.body,
    isAbsolute = true
  ) {
    // Debug mode
    window.__DEBUG === true && console.log("Ctxmenu!", posX, posY, items);

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

    // actual menu
    const ctxMenu = new Html("div")
      .class("ctx-menu", "popup-overlay")
      .styleJs({
        position: isAbsolute === true ? "absolute" : "unset",
        left: posX + "px",
        top: posY - 28 + "px",
      })
      .appendMany(headerItem, ...itemsMapped)
      .on("contextmenu", (e) => {
        e.preventDefault();
      })
      .appendTo(parent);
    return ctxMenu;
  },
};
