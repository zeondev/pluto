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
    // exported functions here
    // Sidebar.new(wrapper?)

    /*

    example :

    Sidebar.new(wrapper, [
      { 
        onclick: e => { doThing(e); }, 
        html: '<svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.0833 1.66666H3.00001C2.55798 1.66666 2.13406 1.84226 1.8215 2.15482C1.50894 2.46738 1.33334 2.8913 1.33334 3.33333V16.6667C1.33334 17.1087 1.50894 17.5326 1.8215 17.8452C2.13406 18.1577 2.55798 18.3333 3.00001 18.3333H13C13.442 18.3333 13.866 18.1577 14.1785 17.8452C14.4911 17.5326 14.6667 17.1087 14.6667 16.6667V6.25L10.0833 1.66666Z" stroke="white" stroke-linecap="round" stroke-linejoin="round"/><path d="M9.66666 1.66666V6.66666H14.6667" stroke="white" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 15V10" stroke="white" stroke-linecap="round" stroke-linejoin="round"/><path d="M5.5 12.5H10.5" stroke="white" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        // example can also include SVG
      } 
    ])
    
    */
    new: (wrapper, buttons) => {
      const sideBar = new html("div").class("col", "sidebar");

      buttons.forEach((b) =>
        new html("button")
          .class("transparent")
          .attr({ title: b?.title !== undefined ? b.title : "Button" })
          .html(b.html)
          .on("click", (e) => b.onclick && b.onclick(e))
          .style(b.style || {})
          .appendTo(sideBar)
      );

      sideBar.appendTo(wrapper);
    },
  },
};
