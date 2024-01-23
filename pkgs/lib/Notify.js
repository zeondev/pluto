let L = {};

export default {
  name: "Toast Library",
  description: "Allows toast popup creation",
  ver: 1, // Compatible with core v1
  type: "library",
  init: (l) => {
    L = l;
  },
  data: {
    show: function (title, description, p = null) {
      let notifyBox;
      if (L.html.qs(".notify-box") === null) {
        notifyBox = new L.html("div").class("notify-box").appendTo("body");

        if (!p instanceof L.html) {
          p = notifyBox;
        }
      }

      let parent = p;

      let a = new Audio("./assets/notify.wav");
      a.volume = 0.5;
      setTimeout(() => {
        a.play();
      }, 100);

      let notify = new L.html("div")
        .class("notify", "slideIn")
        .appendMany(
          new L.html("div").class("notify-title").text(title),
          new L.html("div").class("notify-text").text(description)
        );

      notify.appendTo(parent);

      console.log(notify, parent);

      window.nf = notify;
      window.np = parent;

      setTimeout(() => {
        notify.classOff("slideIn").classOn("slideOut");
        setTimeout(() => {
          notify.cleanup();
        }, 500);
      }, 5000);
    },
  },
};
