let lib;
let html;

export default {
  name: "Select list",
  description: "Creates a select list in table or button list format.",
  ver: 1,
  type: "component",
  init: function (l) {
    lib = l;
    html = l.html;
  },
  data: {
    buttonList: (wrapper, buttons) => {
      const selectList = new html("div").class("row", "gap-small");

      buttons.forEach((b) =>
        new html("button")
          .html(b.html)
          .on("click", (e) => b.onclick && b.onclick(e))
          .style(
            b.style || {
              display: "flex",
              "max-width": "max-content",
              "border-radius": "8px",
            }
          )
          .appendTo(selectList)
      );

      selectList.appendTo(wrapper);
    },
    table: (wrapper, buttons) => {
      const selectList = new html("table");

      buttons.forEach((b) =>
        new html("tr")
          .html(b.html)
          .on("click", (e) => b.onclick && b.onclick(e))
          .style(b.style || { padding: "8px", display: "block" })
          .appendTo(selectList)
      );

      selectList.appendTo(wrapper);

      return selectList;
    },
    // table: (wrapper, buttons) => {
    //   const selectList = new html("table");

    //   buttons.forEach((b) =>
    //     new html("tr")
    //       .html(b.html)
    //       .on("click", (e) => b.onclick && b.onclick(e))
    //       .style(b.style || {})
    //       .appendTo(selectList)
    //   );

    //   selectList.appendTo(wrapper);
    // },
  },
};
