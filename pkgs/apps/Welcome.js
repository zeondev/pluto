export default {
  name: "Welcome",
  description: "Sets up your system.",
  ver: 1, // Compatible with core v1
  type: "process",
  exec: async function (Root) {
    let wrapper; // Lib.html | undefined
    let MyWindow;

    console.log("Hello from example package", Root.Lib);

    const Win = (await Root.Lib.loadLibrary("WindowSystem")).win;

    // let width = 600;
    // let height = 350;
    // let left = (window.innerWidth - 600) / 2 + "px";
    // let top = (window.innerHeight - height) / 2 + "px";

    // if (window.innerWidth <= 600) {
    //   width = window.innerWidth - 2;
    //   left = 0;
    // }

    // Testing the html library
    MyWindow = new Win({
      title: "Welcome",
      content: "",
      pid: Root.PID,
      width: 600,
      height: 350,
      // width,
      // height,
      // left,
      // top,
      resizable: false,
      onclose: () => {
        Root.Lib.onEnd();
      },
    });

    Root.Lib.setOnEnd((_) => MyWindow.close());

    wrapper = MyWindow.window.querySelector(".win-content");

    wrapper.classList.add("col");
    wrapper.classList.add("o-h");

    let pages = {
      clear() {
        wrapper.innerHTML = "";
        /* Banner */ new Root.Lib.html("img")
          .attr({
            src: "./assets/banner.svg",
          })
          .style({
            position: "relative",
            inset: "-10px",
            "min-width": "400px",
            width: "calc(100% + 20px)",
            "max-height": "400px",
          })
          .appendTo(wrapper);
      },
      p1() {
        this.clear();

        new Root.Lib.html("h1").text("Welcome").appendTo(wrapper);
        new Root.Lib.html("p")
          .text(
            "Hey there! Welcome to Pluto, a new 'desktop environment' for the web.\n\nPress Next to enter setup."
          )
          .appendTo(wrapper);

        let btnRow = new Root.Lib.html("div")
          .class("row", "w-100", "mt-auto")
          .appendTo(wrapper);
        new Root.Lib.html("button")
          .text("Close")
          .appendTo(btnRow)
          .on("click", (e) => {
            Root.Lib.onEnd();
          });
        new Root.Lib.html("button")
          .text("Next")
          .appendTo(btnRow)
          .class("primary", "ml-auto")
          .on("click", (e) => {
            pages.p2();
          });
      },
      p2() {
        this.clear();

        new Root.Lib.html("h1").text("Let's get you set up").appendTo(wrapper);
        new Root.Lib.html("p")
          .text("Personalize your environment")
          .appendTo(wrapper);

        let btnRow = new Root.Lib.html("div")
          .class("row", "w-100", "mt-auto")
          .appendTo(wrapper);
        new Root.Lib.html("button")
          .text("Back")
          .appendTo(btnRow)
          .on("click", (e) => {
            pages.p1();
          });
        new Root.Lib.html("button")
          .text("Next")
          .appendTo(btnRow)
          .class("primary", "ml-auto")
          .on("click", (e) => {
            Root.Modal.alert(
              "Whoops",
              "This is currently not finished. Close the app and come back later.",
              wrapper
            );
          });
      },
    };

    pages.p1();

    return Root.Lib.setupReturns((m) => {
      console.log("Example received message: " + m);
    });
  },
};
