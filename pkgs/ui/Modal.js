let lib;

export default {
  name: "Modal",
  description: "Handles modal alerts and popups",
  ver: 1, // Compatible with core v1
  type: "library",
  init: function (l) {
    lib = l;
  },
  data: {
    modal: function (
      title,
      content,
      parent = "body",
      contentIsHtml = false,
      ...buttons
    ) {
      if (content === undefined && title) {
        content = "" + title;
        title = "Alert";
      }

      let modalContent = new lib.html("div").class("modal-content");
      let modalHeader = new lib.html("div").class("modal-header");
      let modalBody = new lib.html("div").class("modal-body");
      modalContent.appendMany(modalHeader, modalBody);

      const x = new lib.html("div").class("modal").append(modalContent);

      new lib.html("span").text(title).appendTo(modalHeader);
      if (contentIsHtml === false) {
        new lib.html("span").html(content).appendTo(modalBody);
      } else {
        content.appendTo(modalBody);
      }
      new lib.html("div").class("flex-group").appendTo(modalBody);

      for (let i = 0; i < buttons.length; i++) {
        let button = buttons[i];
        if (!button.text || !button.callback)
          throw new Error("Invalid button configuration");

        const b = new lib.html("button").text(button.text).on("click", (e) => {
          x.class("closing");
          setTimeout(() => {
            x.cleanup();
            button.callback(e);
          }, 350);
        });

        if (button.type && button.type === "primary") b.class("primary");

        b.appendTo(modalContent.elm.querySelector(".flex-group"));
      }

      x.appendTo(parent);

      const focusableElements = x.elm.querySelectorAll(
        'a[href], button, textarea, input[type="text"], input[type="checkbox"], input[type="radio"], select'
      );
      this.elementsArray = Array.prototype.slice.call(focusableElements);
      this.elementsArray.forEach((el) => {
        el.setAttribute("tabindex", "0");
      });

      this.elementsArray[0].addEventListener("keydown", (e) => {
        if (e.key === "Tab" && e.shiftKey) {
          e.preventDefault();
          this.elementsArray[this.elementsArray.length - 1].focus();
        }
      });
      this.elementsArray[this.elementsArray.length - 1].addEventListener(
        "keydown",
        (e) => {
          if (e.key === "Tab" && !e.shiftKey) {
            e.preventDefault();
            this.elementsArray[0].focus();
          }
        }
      );
      this.elementsArray[0].focus();
    },
    alert: function (title, content, parent = "body") {
      return new Promise((res, _rej) => {
        this.modal(title, content, parent, false, {
          text: "OK",
          callback: (_) => res(true),
        });
      });
    },
    prompt: function (title, content, parent = "body") {
      return new Promise((res, _rej) => {
        this.modal(
          title,
          content,
          parent,
          false,
          {
            text: "Yes",
            type: "primary",
            callback: (_) => res(true),
          },
          {
            text: "No",
            callback: (_) => res(false),
          }
        );
      });
    },
    input: function (
      title,
      description,
      placeholder,
      parent = "body",
      isPassword = false,
      value = ''
    ) {
      let wrapper = new lib.html("div").class("col");
      /* span */ new lib.html("span").text(description).appendTo(wrapper);
      let input = new lib.html("input")
        .attr({ placeholder, value, type: isPassword === true ? "password" : "text" })
        .appendTo(wrapper);

      return new Promise((res, _rej) => {
        this.modal(
          title,
          wrapper,
          parent,
          true,
          {
            text: "OK",
            type: "primary",
            callback: (_) => {
              res(input.elm.value);
            },
          },
          {
            text: "Cancel",
            callback: (_) => res(false),
          }
        );
      });
    },
  },
};
