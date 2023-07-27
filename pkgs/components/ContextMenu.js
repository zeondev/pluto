let lib;
let html;

export default {
  name: "Test library",
  description: "Test library",
  ver: 1, // Compatible with core v1
  type: "component",
  init: function (l) {
    lib = l;
    html = l.html;
  },
  data: {
    new: (wrapper, buttons) => {
      const contextMenu = new html("div").class("col", "context-menu").appendMany();

      buttons.forEach((b) =>
        new html("button")
          .class("transparent")
          .attr({ title: b?.title !== undefined ? b.title : "Button" })
          .html(b.html)
          .on("click", (e) => b.onclick && b.onclick(e))
          .style(b.style || {})
          .appendTo(contextMenu)
      );

      contextMenu.appendTo(wrapper);
    },
  },
};
