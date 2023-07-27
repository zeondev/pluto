export default {
  name: "FPS",
  description: "Counts frame per seconds. Debug stuff.",
  ver: 1, // Compatible with core v1
  type: "process",
  exec: async function (Root) {
    let wrapper; // Lib.html | undefined

    console.log("Hello from example package", Root.Lib);
    Root.Lib.setOnEnd((_) => {wrapper.cleanup()})

    let Html = Root.Lib.html;
    wrapper = new Html("div")
      .style({
        position: "fixed",
        top: "10px",
        left: "10px",
        "font-size": "24px",
        color: "green",
      })
      .appendTo("body");

    let fpsCounter = wrapper.elm;
    let fps = 0;
    let lastCalledTime = Date.now();
    function requestLoop() {
      window.requestAnimationFrame(() => {
        fps++;
        let delta = (Date.now() - lastCalledTime) / 1000;
        if (delta >= 1) {
          lastCalledTime = Date.now();
          fpsCounter.innerText = `FPS: ${fps}`;
          if (fps >= 60) {
            fpsCounter.style.color = "green";
          } else if (fps >= 30) {
            fpsCounter.style.color = "orange";
          } else {
            fpsCounter.style.color = "red";
          }
          fps = 0;
        }
        requestLoop();
      });
    }
    requestLoop();

    return Root.Lib.setupReturns((m) => {
      console.log("Example received message: " + m);
    });
  },
};
