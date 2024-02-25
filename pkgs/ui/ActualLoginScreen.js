function generateNoiseImage(width, height) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.width = width;
    canvas.height = height;

    const imageData = context.createImageData(width, height);

    for (let i = 0; i < imageData.data.length; i += 4) {
      const value = Math.floor(Math.random() * 256);

      imageData.data[i] = value; // Red channel
      imageData.data[i + 1] = value; // Green channel
      imageData.data[i + 2] = value; // Blue channel
      // imageData.data[i + 3] = 255; // Alpha channel
      const alpha = Math.min(Math.floor(value - Math.random() * 256), 4); // Calculate alpha value
      imageData.data[i + 3] = alpha; // Alpha channel
    }

    context.putImageData(imageData, 0, 0);

    canvas.toBlob((blob) => {
      const blobUrl = URL.createObjectURL(blob);
      resolve(blobUrl);
    });
  });
}

// export default {
//   name: "Example",
//   description: "Example application. Boilerplate.",
//   ver: 1, // Compatible with core v1
//   type: "process",
//   privileges: [{ privilege: "services", description: "I want service plz" }],

let lib, core;

export default {
  name: "Lock Screen",
  description: "Displays a background and locks the screen",
  ver: 1, // Compatible with core v1
  type: "library",
  init: function (l, c) {
    lib = l;
    core = c;
  },
  data: {
    launch: async function () {
      return new Promise(async (resolve, reject) => {
        let Html = lib.html;

        let time = new Html("span").class("display-heading").text("10:44");
        let date = new Html("span")
          .class("display-subheading")
          .text("Monday, May 29");
        let pastMinute;

        let image = await generateNoiseImage(screen.width, screen.height);

        function updateDate() {
          let x = new Date();
          let hours = x.getHours().toString().padStart(2, "0");
          let minutes = x.getMinutes().toString().padStart(2, "0");
          if (pastMinute === minutes) return;
          pastMinute = minutes;

          // Define the options for formatting the date
          const options = { weekday: "long", month: "long", day: "numeric" };

          // Format the date using the provided options
          const formatter = new Intl.DateTimeFormat("en-US", options);
          const parts = formatter.formatToParts(x);

          let weekday = parts.find((p) => p.type === "weekday").value;
          let month = parts.find((p) => p.type === "month").value;
          let day = parts.find((p) => p.type === "day").value;

          let timeString = `${hours}:${minutes}`;
          let dateString = `${weekday}, ${month} ${day}`;
          time.text(timeString);
          date.text(dateString);
        }

        let middleDiv = new Html("div")
          .class("row", "fc", "gap")
          .style({ margin: "auto" });

        let service = core.services.find((x) => x.name === "Account");

        async function initialScreen() {
          middleDiv.clear();

          if (!service && !service.ref) {
            bottomText.append(
              new Html("span").text(lib.getString("lockScreen_tapAnywhere"))
            );
          } else {
            const account = service.ref.getUserData();

            bottomText.append(
              new Html("span").text(lib.getString("lockScreenSelectMethod"))
            );

            middleDiv.appendMany(
              new Html("button")
                .classOn("col", "gap", "fc", "transparent", "padding")
                .appendMany(
                  new Html("img").attr({ src: account.pfp }).styleJs({
                    maxWidth: "6.5rem",
                    maxHeight: "6.5rem",
                    width: "8vmax",
                    height: "8vmax",
                    borderRadius: "50%",
                  }),
                  new Html("span")
                    .text("Local User")
                    .styleJs({ fontSize: "18px" })
                )
                .attr({ tabindex: "0" })
                .on("click", (e) => {
                  x.classOff("fadeInLong")
                    .classOn("fadeOutLong")
                    .on("animationend", () => {
                      x.cleanup();
                      resolve(true);
                    });
                  sessionStorage.setItem("skipLogin", true);
                })
                .styleJs({ marginTop: "auto", marginBottom: "auto" }),
              new Html("button")
                .classOn("col", "gap", "fc", "transparent", "padding")
                .appendMany(
                  new Html("img")
                    .attr({ src: "https://zeon.dev/imgs/zeonfull.png" })
                    .styleJs({
                      maxWidth: "6.5rem",
                      maxHeight: "6.5rem",
                      width: "8vmax",
                      height: "8vmax",
                      borderRadius: "50%",
                    }),
                  new Html("span")
                    .text("Zeon Account")
                    .styleJs({ fontSize: "18px" })
                )
                .attr({ tabindex: "0" })
                .on("click", (e) => {
                  bottomText.clear();

                  const userInput = new Html("input")
                    .attr({
                      type: "text",
                      placeholder: lib.getString("username"),
                    })
                    .styleJs({ transitionDuration: "0.25s" });
                  const passInput = new Html("input")
                    .attr({
                      type: "password",
                      placeholder: lib.getString("password"),
                    })
                    .styleJs({ transitionDuration: "0.25s" });

                  const checkLogin = async () => {
                    bigDiv.elm.querySelectorAll("input,button").forEach((e) => {
                      e.disabled = true;
                    });

                    userInput.elm.blur();
                    passInput.elm.blur();

                    passInput.styleJs({
                      borderColor: "var(--outline)",
                    });

                    let result = await service.ref.login(
                      userInput.elm.value || "X",
                      passInput.elm.value || "X"
                    );

                    bigDiv.elm.querySelectorAll("input,button").forEach((e) => {
                      e.disabled = false;
                    });

                    if (result.status === 200) {
                      passInput.styleJs({
                        borderColor: "var(--positive)",
                      });
                      x.classOff("fadeInLong")
                        .classOn("fadeOutLong")
                        .on("animationend", () => {
                          x.cleanup();
                          resolve(true);
                        });
                      sessionStorage.setItem("skipLogin", true);
                    } else {
                      passInput
                        .styleJs({
                          borderColor: "var(--negative)",
                        })
                        .classOff("shake");

                      requestAnimationFrame(() => {
                        passInput.classOn("shake");
                        // passInput.elm.focus();
                      });
                    }
                  };

                  userInput.on("keydown", (e) => {
                    if (e.key === "Enter") checkLogin();
                  });
                  passInput.on("keydown", (e) => {
                    if (e.key === "Enter") checkLogin();
                  });

                  const bigDiv = new Html("div")
                    .classOn("col", "gap", "fc", "transparent", "padding")
                    .appendMany(
                      new Html("button")
                        .html(`&larr; ${lib.getString("back")}`)
                        .on("click", initialScreen)
                        .attr({ tabindex: "0" })
                        .styleJs({ transitionDuration: "0.25s" }),
                      new Html("img")
                        .attr({ src: "https://zeon.dev/imgs/zeonfull.png" })
                        .styleJs({
                          maxWidth: "6.5rem",
                          maxHeight: "6.5rem",
                          width: "8vmax",
                          height: "8vmax",
                          borderRadius: "50%",
                        }),
                      new Html("span").text("Zeon Account").styleJs({
                        fontSize: "18px",
                        transitionDuration: "0.25s",
                      }),
                      userInput,
                      passInput,
                      new Html("button")
                        .class("primary")
                        .text(lib.getString("login"))
                        .attr({ tabindex: "0" })
                        .on("click", checkLogin),
                      new Html("button")
                        .html(lib.getString("dontHaveZeonAccount"))
                        .styleJs({ border: "1px solid var(--outline)" })
                        .attr({ tabindex: "0" })
                        .on("click", async () => {
                          window.open("https://zeon.dev/signup");
                        })
                        .styleJs({ transitionDuration: "0.25s" })
                    );

                  middleDiv.clear().appendMany(bigDiv);
                })
                .styleJs({ marginTop: "auto", marginBottom: "auto" })
            );
          }
        }

        let bottomText = new Html("span").class("mt-auto", "col", "fc", "gap");

        let bgString = `url(${image}), linear-gradient(to bottom, #000a, #000a)`;

        if (window.__DEBUG) {
          console.log("wallpaper", document.documentElement.dataset.wallpaper);
          console.log("bgString", bgString);
        }

        const x = new Html("div")
          .class("blur", "col", "gap", "display-padding")
          .styleJs({
            zIndex: "99999999",
          })
          .style({
            "--below-wallpaper": `url(${document.documentElement.dataset.wallpaper})`,
            "--above-wallpaper": bgString
          })
          .appendMany(
            new Html("div").class("col", "fc", "gap").appendMany(time, date),
            middleDiv,
            bottomText
          )
          .appendTo("body");

        initialScreen();

        x.classOn("fadeInLong");

        updateDate();

        setInterval(() => {
          updateDate();
        }, 1000);
      });
    },
  },
};
