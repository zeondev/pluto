import Html from "../../assets/html.js";

export default {
  name: "Tooltip",
  description: "Create hover effects used in GUI apps.",
  ver: 1, // Compatible with core v1
  type: "component",
  init: function (l) {
    lib = l;
  },
  new(
    posX = 0,
    posY = 0,
    text = "Action",
    parent = document.body,
    isAbsolute = true
  ) {
    const headerItem = new Html("div").class("text").text(text);

    // actual menu
    const ctxMenu = new Html("div")
      .class("tooltip", "popup-overlay")
      .styleJs({
        position: isAbsolute === true ? "absolute" : "unset",
        left: posX + "px",
        top: posY - 28 + "px",
      })
      .appendMany(headerItem)
      .on("contextmenu", (e) => {
        e.preventDefault();
      })
      .appendTo(parent);
    return ctxMenu;
  },
};
