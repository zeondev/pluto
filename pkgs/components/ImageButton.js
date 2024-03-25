let html;

export default {
  name: "Image button component",
  description: "Image button",
  ver: "v1.6.2", // Supports minimum Core version of v1.6.2
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
