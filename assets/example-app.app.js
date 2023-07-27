// Example gamepad app by datkat21

export default {
  name: "Gamepad",
  description: "game pad app",
  ver: 0.1, // Compatible with core 0.1
  type: "process",
  exec: async function (Root) {
    let wrapper; // Lib.html | undefined
    let MyWindow;

    const style = document.createElement("style");
    style.innerHTML = `
    .cursor {
      position: absolute;
      left: var(--x);
      top: var(--y);
      aspect-ratio: 8/9;
      width: 3vh;
      height: 3vh;
      overflow: visible;
      user-select: none;
      pointer-events: none;
      z-index: 999999999999999999999999999;
    
      --background-color: var(--bg-color);
      --border-color: var(--bdr-color);
    }
    
    .cursor::before,
    .cursor::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
    
    .cursor::before {
      mask-image: url("data:image/svg+xml,%3Csvg width='16' height='18' viewBox='0 0 16 18' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg clip-path='url(%23clip0_3364_2990)'%3E%3Cpath d='M1 2.55848C1 1.36055 2.27235 0.611842 3.29023 1.21081L14.2364 7.65201C15.2782 8.26501 15.2299 9.77252 14.2385 10.3475C14.0934 10.4317 13.9284 10.4727 13.7639 10.5058L8 11.6667C7.84392 11.7266 7.69852 11.8121 7.56958 11.9199L3.65498 16.4588C3.54868 16.582 3.43576 16.702 3.29646 16.7862C2.3114 17.3815 1 16.6698 1 15.4409L1 2.55848Z' fill='url(%23paint0_linear_3364_2990)'/%3E%3Cpath d='M7.62146 10.2128L7.58026 10.2211L7.54103 10.2361L7.46257 10.2663C7.15125 10.3857 6.86247 10.5559 6.60736 10.7692L6.54482 10.8215L6.51355 10.8477L6.48693 10.8785L2.5191 15.4791C2.51656 15.482 2.51411 15.4849 2.51175 15.4876C2.51011 15.4859 2.50883 15.4842 2.50781 15.4825C2.50649 15.4803 2.5 15.4692 2.5 15.4409L2.5 2.55848C2.5 2.52997 2.50652 2.51863 2.5078 2.51647C2.5098 2.51307 2.51254 2.51024 2.51677 2.50785C2.52166 2.50508 2.52656 2.5041 2.52955 2.50407C2.52988 2.50406 2.53014 2.50407 2.53033 2.50408L13.4757 8.9448C13.4828 8.94898 13.487 8.95346 13.4908 8.96066C13.4955 8.96955 13.4999 8.98396 13.5 9.00212C13.5 9.0127 13.4985 9.02193 13.4964 9.02941C13.4879 9.03122 13.4784 9.03319 13.4677 9.03533L7.62146 10.2128ZM8.14408 12.1477L13.8626 10.996C14.0336 10.9615 14.2683 10.9082 14.4894 10.78C15.8028 10.0183 15.8704 8.03336 14.49 7.22109L3.54381 0.779878C2.17829 -0.0236511 0.5 0.990544 0.5 2.55848V15.4409C0.5 17.053 2.23148 18.014 3.55506 17.2141C3.76681 17.0862 3.92305 16.9135 4.03361 16.7853L7.91895 12.2804C7.98838 12.2265 8.06405 12.1819 8.14408 12.1477Z' stroke='black'/%3E%3C/g%3E%3Cdefs%3E%3ClinearGradient id='paint0_linear_3364_2990' x1='0.999999' y1='-0.136851' x2='9.24679' y2='13.8778' gradientUnits='userSpaceOnUse'%3E%3Cstop/%3E%3Cstop offset='1'/%3E%3C/linearGradient%3E%3CclipPath id='clip0_3364_2990'%3E%3Crect width='16' height='18' fill='white'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E");
      mask-size: 100% 100%;
      -webkit-mask-size: 100% 100%;
      background-color: var(--background-color);
    }
    .cursor::after {
      mask-image: url("data:image/svg+xml,%3Csvg width='16' height='18' viewBox='0 0 16 18' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M7.72017 10.7029L13.5665 9.52549C13.6368 9.51132 13.6799 9.50074 13.711 9.49106C13.728 9.48575 13.7368 9.48209 13.7395 9.48089C14.0842 9.27816 14.0927 8.72774 13.7293 8.51387L2.78308 2.07266C2.46048 1.88283 2 2.10056 2 2.55848L2 15.4409C2 15.9024 2.46887 16.1154 2.77692 15.9317C2.77915 15.93 2.7866 15.9242 2.79972 15.9118C2.82275 15.8899 2.85226 15.8584 2.89773 15.8056L6.86556 11.2051L6.9281 11.1528C7.14115 10.9746 7.38214 10.8327 7.64171 10.7331L7.72017 10.7029ZM8 11.6667L13.7639 10.5058C13.9284 10.4727 14.0934 10.4317 14.2385 10.3475C15.2299 9.77252 15.2782 8.26501 14.2364 7.65201L3.29023 1.21081C2.27235 0.611842 1 1.36055 1 2.55848V15.4409C1 16.6698 2.3114 17.3815 3.29646 16.7862C3.43576 16.702 3.54868 16.582 3.65498 16.4588L7.56958 11.9199C7.69852 11.8121 7.84392 11.7266 8 11.6667Z' fill='white'/%3E%3C/svg%3E");
      mask-size: 100% 100%;
      -webkit-mask-size: 100% 100%;
      background-color: var(--border-color);
    }
    
    .cursor .label {
      position: absolute;
      top: calc(100% + 0.5vh);
      left: 0.5vh;
      font-size: 1.25vh;
      padding: 0.35vh 0.75vh;
      background-color: var(--bdr-color);
      color: var(--background-color);
      border-radius: 999px;
    }`;
    document.body.appendChild(style);

    class Cursor {
      constructor(bgColor, bdrColor, title = null) {
        this.originalName = title ?? "User";
        this.mouseCursor = new Root.Lib.html("div")
          .class("cursor")
          .appendTo("body")
          .style({
            "--bg-color": bgColor,
            "--bdr-color": bdrColor,
          });
        this.label = new Root.Lib.html("div")
          .class("label")
          .text(this.originalName)
          .appendTo(this.mouseCursor);
      }
      move(x, y) {
        this.mouseCursor.style({
          "--x": x + "px",
          "--y": y + "px",
        });
      }
      setName(name) {
        this.label.text(name);
      }
    }

    console.log("Hello from example package", Root.Lib);

    function onEnd() {
      console.log("Example process ended, attempting clean up...");
      const result = Root.Lib.cleanup(Root.PID, Root.Token);
      if (result === true) {
        console.log("Cleanup Success! Token:", Root.Token);
      } else {
        console.log("Cleanup Failure. Token:", Root.Token);
      }
    }

    function simulateMouseEventAtPosition(eventType, x, y) {
      // Get the element at the specified position
      const targetElement = document.elementFromPoint(x, y);

      // Create a new MouseEvent
      const mouseEvent = new MouseEvent(eventType, {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y,
      });

      // Dispatch the event on the target element
      if (targetElement) {
        targetElement.dispatchEvent(mouseEvent);
      }
    }

    const html = Root.Lib.html;

    const a = document.createElement("script");
    a.src = "/assets/gamecontroller.js";
    document.documentElement.appendChild(a);

    a.onload = function () {
      gameControl.on("connect", (gamepad) => {
        const cursor = new Cursor("var(--text)", "var(--neutral)");

        let cursorX = Math.floor(screen.width / 2);
        let cursorY = Math.floor(screen.height / 2);

        function move() {
          cursor.move(cursorX, cursorY);
          simulateMouseEventAtPosition(
            "mousemove",
            Math.floor(cursorX),
            Math.floor(cursorY)
          );
          simulateMouseEventAtPosition(
            "mouseover",
            Math.floor(cursorX),
            Math.floor(cursorY)
          );
        }

        console.log("A new gamepad was connected!");

        console.log(gamepad);

        let speed = 1;
        let increaseSpeed = (_) => {
          speed++;
          if (speed > 25) speed--;
        };
        let decreaseSpeed = (_) => {
          speed--;
          if (speed < 1) speed++;
        };

        // I want to detect 2 button0 presses within 0.5s and count that as a "dblclick" event
        let time = performance.now();
        let concurrentAPresses = 0;
        // hopefully this works?

        function checkstats() {
          const deadZoneMulti = 0.01;

          let posX =
            Math.abs(gamepad.axeValues[0][0]) > deadZoneMulti
              ? gamepad.axeValues[0][0]
              : 0;
          let posY =
            Math.abs(gamepad.axeValues[0][1]) > deadZoneMulti
              ? gamepad.axeValues[0][1]
              : 0;

          cursorX += posX * speed;
          cursorY += posY * speed;

          move();

          // console.log(gamepad.axeValues[0][0], cursorX, gamepad.axeValues[0][1], cursorY);
          // console.log(gamepad.pressed);
          requestAnimationFrame(checkstats);

          time = performance.now();
        }

        requestAnimationFrame(checkstats);

        gamepad.before("button4", (e) => {
          decreaseSpeed();
          cursor.setName(`${cursor.originalName} (${speed}x)`);
        });
        gamepad.before("button5", (e) => {
          increaseSpeed();
          cursor.setName(`${cursor.originalName} (${speed}x)`);
        });

        // gamepad.on('up', (e) => {
        //   cursorY--;
        //   move();
        // });
        // gamepad.on('down', (e) => {
        //   cursorY++;
        //   move();
        // });
        // gamepad.on('left', (e) => {
        //   cursorX--;
        //   move();
        // });
        // gamepad.on('right', (e) => {
        //   cursorX++;
        //   move();
        // });

        gamepad.before("button0", (e) => {
          simulateMouseEventAtPosition(
            "mousedown",
            Math.floor(cursorX),
            Math.floor(cursorY)
          );

          if (performance.now() - 500 < time) {
            concurrentAPresses++;
            if (concurrentAPresses === 2) {
              concurrentAPresses = 0;
              // count a dblclick
              simulateMouseEventAtPosition(
                "dblclick",
                Math.floor(cursorX),
                Math.floor(cursorY)
              );
            }
            // assume its been less than 500ms
          } else concurrentAPresses = 0;
        });
        gamepad.after("button0", (e) => {
          simulateMouseEventAtPosition(
            "mouseup",
            Math.floor(cursorX),
            Math.floor(cursorY)
          );
          simulateMouseEventAtPosition(
            "click",
            Math.floor(cursorX),
            Math.floor(cursorY)
          );
        });
      });
    };

    return Root.Lib.setupReturns(onEnd, (m) => {
      console.log("Example recieved message: " + m);
    });
  },
};

