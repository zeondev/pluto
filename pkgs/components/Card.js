let html;

export default {
  name: "Card component",
  description: "Create a card",
  ver: 1, // Compatible with core v1
  type: "component",
  init: function (l) {
    html = l.html;
  },
  data: {
    new: (wrapper, content) => {
      const card = new html("div").class("card").append(content);
      card.appendTo(wrapper);
    },
  },
};
