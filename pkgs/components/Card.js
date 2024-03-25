let html;

export default {
  name: "Card component",
  description: "Create a card",
  ver: "v1.6.2", // Supports minimum Core version of v1.6.2
  type: "component",
  init: function (l) {
    html = l.html;
  },
  data: {
    new: (wrapper, content) => {
      const card = new html("div").class("card").append(content);
      card.appendTo(wrapper);
      return card;
    },
  },
};
