let lib;

export default {
  name: "Loading Screen",
  description:
    "Displays a graphical loader while the bootloader is loading other content",
  ver: 1, // Compatible with core v1
  type: "library",
  init: function (l) {
    lib = l;
  },
  data: {
    loader: function (il = null) {
      const x = new lib.html("div")
        .html(
          '<div class="logo">pluto<span class="small-label superscript">indev</span></div><span>loading...</span>'
        )
        .class("loading-screen")
        .appendTo("body");

      setTimeout(() => {
        if (x.elm !== null) {
          // weird workaround
          x.elm.style.setProperty("cursor", "auto", "important");
          x.append(
            new lib.html("div")
              .styleJs({
                marginTop: "0.75rem",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                gap: "0.5rem",
              })
              .text("Is it taking too long to load?")
              .append(
                new lib.html("div")
                  .style({
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "0.5rem",
                  })
                  .appendMany(
                    new lib.html("button")
                      .text("Bypass loading screen")
                      .on("click", () => {
                        x.cleanup();
                      }),
                    new lib.html("button")
                      .text("Launch Basic Mode")
                      .on("click", () => {
                        if (il !== null) {
                          window.err = new Error(
                            "Manually got past loading screen."
                          );
                          il.launch("system:Basic");
                        }
                      })
                  )
              )
          );
        }
      }, 5000);

      return x;
    },
  },
};
