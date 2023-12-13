/*!
    windowSystem.js
    by datkat21
*/

let mouseX = 0;
let mouseY = 0;
let mouseDown = false;
let winRef = null;
let isResizing = false;
let resizeType = "";
let initialWidth;
let initialHeight;
let initialLeft;
let initialTop;
let windowPid = -1;

let lib = {};
let core = {};
let Html;

function getWindowObjectById(id) {
  return core.windowsList.find((window) => window.options.id === id);
}

function getSnapIndicator() {
  if (!Html.qs("#snap-indicator")) {
    new Html("div").attr({ id: "snap-indicator" }).appendTo(".window-box");
  }
  return Html.qs("#snap-indicator");
}

export default {
  name: "Window System",
  description:
    "This is the base window system for Pluto. This library includes function to create and destroy windows.",
  ver: 1, // Compatible with core v1
  type: "library",
  init: function (l, c) {
    lib = l;
    core = c;
    if (!core.windowsList) core.windowsList = [];

    if (lib.html) {
      Html = lib.html;
    }
  },
  data: {
    // exported functions here
    getWindowObjectById,
    win: class Win {
      constructor(options) {
        if (options === undefined) {
          options = {};
        }
        this.options = options;
        if (!this.options.id) {
          this.options.id = "win-window-" + Math.floor(Math.random() * 100000);
        }
        if (!this.options.width) {
          this.options.width = 300;
        }
        if (!this.options.height) {
          this.options.height = 200;
        }
        if (!this.options.minWidth) {
          this.options.minWidth = 185;
        }
        if (!this.options.minHeight) {
          this.options.minHeight = 100;
        }
        if (!this.options.title) {
          this.options.title = "";
        }
        if (!this.options.content) {
          this.options.content = "";
        }
        if (!this.options.left) {
          this.options.left = "center";
        }
        if (!this.options.top) {
          this.options.top = "center";
        }
        if (!this.options.parent) {
          this.options.parent = "body";
        }
        if (!this.options.onclose) {
          this.options.onclose = function () {};
        }
        if (!this.options.onresize) {
          this.options.onresize = function () {};
        }
        if (this.options.resizable === undefined) {
          this.options.resizable = true;
        }
        if (this.options.autofocus === undefined) {
          this.options.autofocus = true;
        }
        if (this.options.pid === undefined) {
          this.options.pid = -1;
        }

        windowPid = this.options.pid;
        this.init();

        // may be useful?
        this.arrayId = core.windowsList.push(this);
      }

      init() {
        this.createWindow();
        this.bindEvent();
        this.state = "def";
      }

      createWindow() {
        // clone the #wsTemplate and append to body
        let wrapper = new lib.html().html(`<div class="win-window">
            <div class="win-titlebar">
                <div class="buttons">
                    <button class="win-btn win-minimize"></button>
                </div>
                <div class="outer-title"><div class="title"></div></div>
                <div class="buttons">
                    <button class="win-btn win-close"></button>
                </div>
            </div>
            <div class="win-content"></div>
            <div class="resize-grips">
              <div class="resize-grip" data-resize-type="top"></div>
              <div class="resize-grip" data-resize-type="left"></div>
              <div class="resize-grip" data-resize-type="right"></div>
              <div class="resize-grip" data-resize-type="bottom"></div>
              <div class="resize-grip" data-resize-type="top-left"></div>
              <div class="resize-grip" data-resize-type="top-right"></div>
              <div class="resize-grip" data-resize-type="bottom-left"></div>
              <div class="resize-grip" data-resize-type="bottom-right"></div>
            </div>
        </div>`);
        let thisWin = wrapper.elm.querySelector(".win-window");
        thisWin.style.position = "absolute";

        if (this.options.width > screen.width) {
          // this.maximize('top');
          this.options.width = screen.width - snapMargin * 8;
        }

        thisWin.id = this.options.id;
        thisWin.style.width = parseInt(this.options.width) + "px";
        thisWin.style.height = parseInt(this.options.height) + "px";
        if (this.options.left === "center")
          thisWin.style.left =
            (window.innerWidth - parseInt(this.options.width)) / 2 + "px";
        else thisWin.style.left = this.options.left;
        if (this.options.top === "center")
          thisWin.style.top =
            (window.innerHeight - parseInt(this.options.height)) / 2 + "px";
        else thisWin.style.top = this.options.top;

        if (this.options.resizable === false) {
          thisWin.querySelector(".resize-grips").remove();
        }

        let titlebar = thisWin.querySelector(".win-titlebar .title");
        titlebar.innerHTML = this.options.title;

        let content = thisWin.querySelector(".win-content");
        content.innerHTML = this.options.content;

        if (Html.qs(".window-box") === null) {
          new Html("div")
            .class("window-box")
            .append(new Html("div").attr({ id: "snap-indicator" }))
            .appendTo("body");
        }

        (
          document.querySelector(".window-box") ||
          document.querySelector(this.options.parent)
        ).appendChild(thisWin);

        thisWin.dataset.windowId = this.options.id;

        this.window = thisWin;

        if (this.options.autofocus === true) {
          focusWindow(this.window, this.options.pid);
        }
      }

      bindEvent() {
        // Add a new event listener for touchstart and mouseup events on the win-titlebar
        const titlebar = this.window.querySelector(".win-titlebar .title");
        let lastClickTime = 0;
        let lastClickCoords = { x: 0, y: 0 };
        let clickPerformance = null;
        titlebar.addEventListener("mouseup", (e) => {
          if (e.button !== 0) return;
          const currentTime = performance.now();
          if (
            currentTime - lastClickTime < 500 ||
            (clickPerformance && currentTime - clickPerformance < 500)
          ) {
            if (this.options.resizable === false) return;
            if (this.state !== "min") this.maximize();
            this.options.onresize && this.options.onresize("max");
          } else {
            lastClickTime = currentTime;
            lastClickCoords.x = e.clientX;
            lastClickCoords.y = e.clientY;
          }
        });
        this.window
          .querySelector(".win-minimize")
          .addEventListener("click", () => {
            this.minimize();
          });
        this.window
          .querySelector(".win-close")
          .addEventListener("click", async () => {
            let result = await this.options.onclose();
            if (result !== false) this.close();
          });

        function handleFocus(e) {
          var x = e.target.closest(".win-window");
          if (x == null) return;
          focusWindow(x);
        }

        this.window
          .querySelector(".win-content")
          .addEventListener("mousedown", handleFocus);
        this.window
          .querySelector(".win-content")
          .addEventListener("touchstart", handleFocus);

        // if (this.options.resizable === true) {
        //   // Add event listeners to the resize grips
        //   const resizeGrips = this.window.querySelectorAll(".resize-grip");
        //   resizeGrips.forEach((grip) => {
        //     grip.addEventListener("mousedown", startResize);
        //     grip.addEventListener("touchstart", startResize);
        //   });

        //   // Store the initial window dimensions and position
        //   let isResizing = false,
        //     resizeType = "",
        //     initialWidth,
        //     initialHeight,
        //     initialLeft,
        //     initialTop;
        //   var window = this.window;
        // }
      }

      focus() {
        focusWindow(this.window);
      }

      maximize(side) {
        if (side) {
          this.window.dataset.lastWidth = this.window.style.width;
          this.window.dataset.lastHeight = this.window.style.height;
          switch (side) {
            default:
            case "top":
              this.window.classList.toggle("max");
              // this.window.style.top = 0;
              // this.window.style.left = 0;
              break;
            case "left":
              this.window.style.width =
                Math.floor(this.window.parentNode.offsetWidth / 2) + "px";
              this.window.style.height =
                this.window.parentNode.offsetHeight - 54 + "px";
              this.window.style.top = 0;
              this.window.style.left = 0;
              this.window.classList.toggle("snapped");
              break;
            // Snap to right
            case "right":
              // Width is half width of parent
              this.window.style.width =
                Math.floor(this.window.parentNode.offsetWidth / 2) + "px";
              // Height is height of parent minus dock height
              this.window.style.height =
                this.window.parentNode.offsetHeight - 54 + "px";
              // Top is top of screen (0)
              this.window.style.top = 0;
              // Left is the parent width minus the new window width
              this.window.style.left =
                this.window.parentNode.offsetWidth -
                parseInt(this.window.style.width) +
                "px";
              // Make it known as snapped
              this.window.classList.toggle("snapped");
              break;
          }
        } else if (side === false) {
          // Reset
          if (this.state === "snap") {
            this.window.style.width = this.window.dataset.lastWidth;
            this.window.style.height = this.window.dataset.lastHeight;
            this.window.classList.remove("snapped");
          } else if (this.state === "max") {
            this.window.classList.remove("max");
            this.window.style.top = 0;
          }
          this.window.classList.remove("prep-pull");
        } else if (side === undefined) {
          // Legacy function call
          this.window.classList.toggle("max");
        }

        if (
          this.window.classList.contains("max") ||
          this.window.classList.contains("snapped")
        ) {
          Html.qs(".window-box").classOn("maximized-window");
        } else {
          Html.qs(".window-box").classOff("maximized-window");
        }

        if (this.window.classList.contains("snapped")) {
          this.state = "snap";
        } else if (this.window.classList.contains("max")) {
          this.state = "max";
        } else {
          this.state = "def";
        }
      }

      minimize() {
        this.window.classList.toggle("min");
        if (this.window.classList.contains("min")) {
          this.window.dataset.lastWidth = this.window.style.width;
          this.window.dataset.lastHeight = this.window.style.height;
          this.window.style.setProperty(
            "--last-height",
            `${this.window.style.height}`
          );
          this.window.style.width = "auto";
          this.window.style.height = "auto";
        } else {
          this.window.style.width = this.window.dataset.lastWidth;
          this.window.style.height = this.window.dataset.lastHeight;
        }
        this.state = this.window.classList.contains("min") ? "min" : "def";
        focusWindow(this.window);
      }

      close() {
        return new Promise((res, _rej) => {
          this.window.classList.add("closing");
          setTimeout(() => {
            this.window.remove();
            res(true);
          }, 500);
        });
      }

      setTitle(title) {
        this.window.querySelector(".win-titlebar .title").innerText = title;
      }
    },
    focusWindow,
  },
};

function focusWindow(x) {
  let zIn = 0;
  let windows = document.querySelectorAll(".win-window");
  if (windows) {
    let zInAr = [];
    for (let i = 0; i < windows.length; i++) {
      windows[i].classList.remove("focus");
      zInAr.push(Number(windows[i].style.zIndex));
    }
    zInAr.forEach((element) => {
      if (zIn < element) {
        zIn = element;
      }
    });
  }
  x.style.zIndex = zIn + 2;
  x.classList.add("focus");

  // console.log("[WS]", x.id, windowsList);
}

function BeginWinDrag(e) {
  // Context menu
  if (e.target.closest(".ctx-menu") === null) {
    Html.qs(".ctx-menu") && Html.qs(".ctx-menu").cleanup();
  }

  // check if window can be selected
  if (!e.clientX && !e.touches) return;
  if (e.button && e.button !== 0) return;
  // get pointer position
  mouseX = e.clientX || e.touches[0].clientX;
  mouseY = e.clientY || e.touches[0].clientY;
  // get window title
  let x = document.elementFromPoint(mouseX, mouseY).closest(".title");
  if (x === null) {
    // Check if it's a resize grip element
    x = document.elementFromPoint(mouseX, mouseY).closest(".resize-grip");
    if (x) {
      // start resizing
      const windowElement = x.closest(".win-window");
      winRef = windowElement;
      return startResize(e);
    }
    return;
  }
  // get the window
  x = x.closest(".win-window");
  // focus it
  focusWindow(x);
  // prep for dragging
  if (!x.classList.contains("max") && !x.classList.contains("snapped")) {
    x.classList.add("dragging");
  } else {
    x.classList.add("prep-pull");
  }
  mouseDown = true;
  winRef = x;

  // if (!Html.qs(".debug")) {
  //   new Html("p")
  //     .class("debug")
  //     .styleJs({
  //       position: "fixed",
  //       bottom: "30vh",
  //     })
  //     .appendTo("body");
  // }
}

let snapMargin = 2;
let snapBoxMargin = 12;

function animateSnapIndicator(id, oldPosition, newPosition) {
  let snapIndicator = getSnapIndicator();

  if (snapIndicator.elm.dataset.id === id) return;

  snapIndicator.classOff("animated").styleJs(oldPosition);

  // Delay before the animation
  setTimeout(() => {
    snapIndicator
      // Make it animated
      .classOn("animated")
      // Move it to the new position
      .styleJs(newPosition);
  }, 1);

  snapIndicator.elm.dataset.id = id;
}
function hideSnapIndicator() {
  getSnapIndicator().attr({ "data-id": "none" }).style({ opacity: 0 });
  // .classOff("animated");
}

function WinDrag(e) {
  // if a window is dragging
  if (winRef !== null) {
    // check if pressed and not resizing
    if (
      mouseDown &&
      !isResizing &&
      !winRef.classList.contains("max") &&
      !winRef.classList.contains("snapped")
    ) {
      // get cursor position
      if (!e.clientX && !e.touches) return;
      let x = e.clientX || e.touches[0].clientX;
      let y = e.clientY || e.touches[0].clientY;
      // subtract new position from old
      let dx = x - mouseX;
      let dy = y - mouseY;

      // relative to window?
      let newPositionX = parseInt(winRef.style.left) + dx;
      let newPositionY = parseInt(winRef.style.top) + dy;
      if (newPositionX < 0) {
        newPositionX = 0;
      }
      if (newPositionY < 0) {
        newPositionY = 0;
      }

      // actual window position
      let prevPositionX = parseInt(winRef.style.left);
      let prevPositionY = parseInt(winRef.style.top);

      // move window
      winRef.style.left = newPositionX + "px";
      winRef.style.top = newPositionY + "px";

      // edges check
      if (newPositionY < snapMargin) {
        // Html.qs(".debug").text("snap: top");
        animateSnapIndicator(
          "top",
          {
            opacity: 1,
            top: winRef.style.top,
            left: winRef.style.left,
            width: winRef.style.width,
            height: winRef.style.height,
          },
          {
            opacity: 1,
            width: winRef.parentNode.offsetWidth - snapBoxMargin * 2 + "px",
            height:
              winRef.parentNode.offsetHeight - (snapBoxMargin * 2 + 48) + "px",
            top: `${snapBoxMargin}px`,
            left: `${snapBoxMargin}px`,
          }
        );
        winRef.dataset.snapPos = "top";
      } else if (newPositionX < snapMargin) {
        // Html.qs(".debug").text("snap: left");
        animateSnapIndicator(
          "top",
          {
            opacity: 1,
            top: winRef.style.top,
            left: winRef.style.left,
            width: winRef.style.width,
            height: winRef.style.height,
          },
          {
            opacity: 1,
            width: Math.floor(winRef.parentNode.offsetWidth / 2) + "px",
            height:
              winRef.parentNode.offsetHeight - (snapBoxMargin * 2 + 48) + "px",
            top: `${snapBoxMargin}px`,
            left: `${snapBoxMargin}px`,
          }
        );
        winRef.dataset.snapPos = "left";
      } else if (
        newPositionX + winRef.offsetWidth >
        winRef.parentNode.offsetWidth - snapMargin
      ) {
        // Html.qs(".debug").text("snap: right");
        animateSnapIndicator(
          "top",
          {
            opacity: 1,
            top: winRef.style.top,
            left: winRef.style.left,
            width: winRef.style.width,
            height: winRef.style.height,
          },
          {
            opacity: 1,
            width:
              Math.floor(winRef.parentNode.offsetWidth / 2) -
              snapBoxMargin * 2 +
              "px",
            height:
              winRef.parentNode.offsetHeight - (snapBoxMargin * 2 + 48) + "px",
            top: `${snapBoxMargin}px`,
            left:
              winRef.parentNode.offsetWidth -
              Math.floor(winRef.parentNode.offsetWidth / 2) +
              snapBoxMargin +
              "px",
          }
        );
        winRef.dataset.snapPos = "right";
      } else {
        // Html.qs(".debug").text("snap: NONE");
        hideSnapIndicator();
        winRef.dataset.snapPos = "";
      }

      // if position is different then set it
      if (prevPositionX !== newPositionX) {
        mouseX = x;
      }
      if (prevPositionY !== newPositionY) {
        mouseY = y;
      }

      // prevent window from going off screen
      let maxRight = window.innerWidth - parseInt(winRef.clientWidth);
      let maxBottom = window.innerHeight - parseInt(winRef.clientHeight);

      // actually prevent it
      if (parseInt(winRef.style.left) > maxRight) {
        winRef.style.left = maxRight + "px";
      }
      if (parseInt(winRef.style.top) > maxBottom) {
        winRef.style.top = maxBottom + "px";
      }
    } else if (
      mouseDown &&
      !isResizing &&
      winRef.classList.contains("prep-pull")
    ) {
      // Prep pull means to un-maximize
      let wo = getWindowObjectById(winRef.dataset.windowId);
      winRef.classList.add("dragging");
      wo.maximize(false);
      // Position window at middle of cursor:
      // X = CurX - (WindowWidth / 2)
      winRef.style.left = Math.floor(e.clientX - winRef.offsetWidth / 2) + "px";
    } else if (isResizing) {
      // otherwise begin resizing
      resize(e);
    }
  }
}
function EndWinDrag() {
  if (winRef) {
    winRef.classList.remove("dragging");

    if (winRef.dataset.snapPos !== "") {
      let snapPos = winRef.dataset.snapPos;

      // Html.qs(".debug").text("snap NOW!");
      getSnapIndicator().style({ opacity: 0 });

      let wo = getWindowObjectById(winRef.dataset.windowId);

      switch (snapPos) {
        case "top":
          wo.maximize("top");
          break;
        case "left":
          wo.maximize("left");
          break;
        case "right":
          wo.maximize("right");
          break;
      }

      winRef.dataset.snapPos = "";
    }
  }

  if (isResizing) {
    stopResize();
  } else {
    mouseDown = false;
  }

  winRef = null;
}

document.addEventListener("mousedown", BeginWinDrag);
document.addEventListener("touchstart", BeginWinDrag);

document.addEventListener("mouseup", EndWinDrag);
document.addEventListener("touchend", EndWinDrag);

document.addEventListener("mousemove", WinDrag);
document.addEventListener("touchmove", WinDrag);

function handleFocus(e) {
  var x = e.target.closest(".win-window");
  if (x == null) return;
  focusWindow(x);
}

function startResize(event) {
  // Set the resizing flag
  isResizing = true;

  handleFocus(event);

  // Store the initial dimensions and position of the window
  initialWidth = winRef.offsetWidth;
  initialHeight = winRef.offsetHeight;
  initialLeft = winRef.offsetLeft;
  initialTop = winRef.offsetTop;

  // Store the type of grip being used for resizing
  resizeType = event.target.getAttribute("data-resize-type");

  // Add event listeners to handle resizing
  document.addEventListener("mousemove", resize);
  document.addEventListener("touchmove", resize);
  document.addEventListener("mouseup", stopResize);
  document.addEventListener("touchend", stopResize);

  winRef.classList.add("dragging");
}

const minWidth = 185; // Set minimum width (in pixels)
const minHeight = 100; // Set minimum height (in pixels)

function resize(event) {
  if (isResizing) {
    const dx = (event.clientX || event.touches[0].clientX) - mouseX;
    const dy = (event.clientY || event.touches[0].clientY) - mouseY;

    let wo = getWindowObjectById(winRef.dataset.windowId);

    let mw = wo.options.minWidth || minWidth;
    let mh = wo.options.minHeight || minHeight;

    switch (resizeType) {
      case "top-left":
        const newWidthTopLeft = Math.max(initialWidth - dx, mw);
        const newHeightTopLeft = Math.max(initialHeight - dy, mh);
        winRef.style.width = newWidthTopLeft + "px";
        winRef.style.height = newHeightTopLeft + "px";
        if (newWidthTopLeft > mw) {
          winRef.style.left = initialLeft + dx + "px";
        }
        if (newHeightTopLeft > mh) {
          winRef.style.top = initialTop + dy + "px";
        }
        break;
      case "top":
        const newHeightTop = Math.max(initialHeight - dy, mh);
        winRef.style.height = newHeightTop + "px";
        if (newHeightTop > mh) {
          winRef.style.top = initialTop + dy + "px";
        }
        break;
      case "top-right":
        const newWidthTopRight = Math.max(initialWidth + dx, mw);
        const newHeightTopRight = Math.max(initialHeight - dy, mh);
        winRef.style.width = newWidthTopRight + "px";
        winRef.style.height = newHeightTopRight + "px";
        if (newHeightTopRight > mh) {
          winRef.style.top = initialTop + dy + "px";
        }
        break;
      case "left":
        const newWidthLeft = Math.max(initialWidth - dx, mw);
        winRef.style.width = newWidthLeft + "px";
        if (newWidthLeft > mw) {
          winRef.style.left = initialLeft + dx + "px";
        }
        break;
      case "right":
        const newWidthRight = Math.max(initialWidth + dx, mw);
        winRef.style.width = newWidthRight + "px";
        break;
      case "bottom-left":
        const newWidthBottomLeft = Math.max(initialWidth - dx, mw);
        const newHeightBottomLeft = Math.max(initialHeight + dy, mh);
        winRef.style.width = newWidthBottomLeft + "px";
        winRef.style.height = newHeightBottomLeft + "px";
        if (newWidthBottomLeft > mw) {
          winRef.style.left = initialLeft + dx + "px";
        }
        break;
      case "bottom":
        const newHeightBottom = Math.max(initialHeight + dy, mh);
        winRef.style.height = newHeightBottom + "px";
        break;
      case "bottom-right":
        const newWidthBottomRight = Math.max(initialWidth + dx, mw);
        const newHeightBottomRight = Math.max(initialHeight + dy, mh);
        winRef.style.width = newWidthBottomRight + "px";
        winRef.style.height = newHeightBottomRight + "px";
        break;
    }

    if (wo.options.onresize) {
      wo.options.onresize(resizeType);
    }
  }
}

function stopResize() {
  // Clear the resizing flag
  isResizing = false;

  winRef.classList.remove("dragging");

  // Remove the event listeners for resizing
  document.removeEventListener("mousemove", resize);
  document.removeEventListener("touchmove", resize);
  document.removeEventListener("mouseup", stopResize);
  document.removeEventListener("touchend", stopResize);
}
