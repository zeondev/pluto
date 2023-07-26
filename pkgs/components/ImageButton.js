let html;

export default {
  name: "Image button component",
  description: "Image button",
  ver: 1, // Compatible with core v1
  type: "component",
  init: function (l) {
    html = l.html;
  },
  data: {
    new: (wrapper, imageUri) => {
      const card = new html("button").append(
        new html("img").attr({
          src: imageUri,
        })
      );
      card.appendTo(wrapper);
    },
  },
};
