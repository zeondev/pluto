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
    show: function (title, description, p = null, buttons, autoDismiss = null) {
      if (document.querySelector("body>.notify-box") == null) {
        new L.html("div").class("notify-box").appendTo("body");
      }

      if (autoDismiss === null) {
        if (Array.isArray(buttons)) {
          autoDismiss = false;
        } else {
          autoDismiss = true;
        }
      }

      if (p === null) {
        p = document.querySelector("body>.notify-box");
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

      function hide() {
        notify.classOff("slideIn").classOn("slideOut");
        setTimeout(() => {
          notify.cleanup();
        }, 500);
      }

      // buttons
      if (Array.isArray(buttons)) {
        new L.html("div").class("flex-group").appendTo(notify);

        for (let i = 0; i < buttons.length; i++) {
          let button = buttons[i];
          if (!button.text || !button.callback)
            throw new Error("Invalid button configuration");

          const b = new L.html("button")
            .text(button.text)
            .on("click", (e) => {
              hide();
              setTimeout(() => {
                notify.cleanup();
                button.callback(e);
              }, 500);
            });

          if (button.type && button.type === "primary") b.class("primary");

          b.appendTo(notify.elm.querySelector(".flex-group"));
        }
      }

      notify.appendTo(parent);

      console.log(notify, parent);

      window.nf = notify;
      window.np = parent;

      if (autoDismiss)
        setTimeout(() => {
          hide();
        }, 5000);
    },
  },
};
