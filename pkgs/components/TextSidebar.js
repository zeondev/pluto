let lib;
let html;

export default {
  name: "Text Sidebar",
  description: "Sidebar",
  ver: 0.1, // Compatible with core 0.1
  type: "component",
  init: function (l) {
    lib = l;
    html = l.html;
  },
  data: {
    new: (wrapper, buttons) => {
      const sideBar = new html("div").class("col", "text-sidebar").appendMany();

      buttons.forEach((b) =>
        new html("button")
          .class("sidebar-item", "m-0", "transparent")
          .attr({ title: b?.title !== undefined ? b.title : "Button" })
          .appendMany(
            new html("div").class("sidebar-icon").html(b.icon),
            new html("div").class("sidebar-text").html(b.text)
          )
          .on("click", (e) => {
            b.onclick && b.onclick(e);
          })
          .style(b.style || {})
          .appendTo(sideBar)
      );

      sideBar.appendTo(wrapper);
    },
  },
};
