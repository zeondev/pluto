# Pluto Core 0.1 API Documentation

Written 2/13/23, updated 5/24/2023, may change with new updates

This document documents parts of the API

**The API along with this document may change periodically, so check again later if you are experiencing issues**

## `Root` object

This is passed when your package is ran. It is one argument to the asynchronous function.

Example package:

```js
export default {
  name: "Example",
  description: "Example app",
  ver: 1, // Compatible with core v1
  type: "process",
  exec: async function (Root) {
    // Root is a Root object
    // View the properties below
  },
};
```

- `Root.Lib`: instance of [Lib](#Lib)

Lib will help set up most of your package functions, from quickly making HTML elements and handling returns, to cleaning up the process and loading custom libraries.

- `Root.Core`: Core instance, null by default unless you have administrator privileges.

- `PID`: Process identifier

- `Token`: Process token (Lib uses this to identify it's actually your process trying to clean up, etc.)

## `Core` object

You only have access to this inside of packages when you have admin rights, otherwise it is always `null`. Check for that null core to make sure you can or can't run it.

- `version` - number that represents the core version, renders packages above it incompatible
- `processList` - array of Process objects
- `startPkg` - function to start any package by its category and name

## `Lib` object

- `launch(URL)`: Asynchronous function that launches an app via `URL`:  
  **Example**
  ```js
  Root.Lib.launch("apps:Admin");
  // Asks user for permission to start the app.
  // Other apps can be started without permission if
  // you have Core access (admin privileges)
  ```
- `loadLibrary`: Asynchronous function to load libraries (`lib:`); returns the module data:  
  **Example**

  ```js
  const Win = (await Root.Lib.loadLibrary("WindowSystem")).win;

  // Testing the Window library
  MyWindow = new Win({
    title: "Example App",
    content: "Hello",
    onclose: () => {
      onEnd();
    },
  });
  ```

- `loadComponent` - ditto, except for `components:` packages
- `html` - Html class

## Html

- `new Lib.html('element')` - Returns a new `<div>` when no parameters passed, otherwise a new instance of the element
  ```js
  const myElement = new Lib.html("div");
  ```
- `text(val)` - Set innerText of the element (not HTML)
  ```js
  myElement.text("Hello, world");
  ```
- `html(val)` - Set content of the element
  ```js
  myElement.html("my content <b>This supports HTML</b>");
  ```
- `cleanup()` - Clean up this Html element instance by removing the element
  ```js
  myElement.cleanup(); // Deletes the HTML element. This variable should be left unused after
  ```
- `class(...val)` - Class
  ```js
  myElement.class('class-name');
  // OR
  myElement.class('class-name', 'class-two', ...);
  ```
- `style(obj)` - Set key/value pair of styles in an object
  ```js
  myElement.style({
    color: "red",
    "background-color": "red",
  });
  ```
- `on(ev, cb)` - listen for event

  ```js
  function handleClick(e) {
    alert("Clicked at " + e.clientX + ", " + e.clientY);
  }

  myElement.on("click", handleClick);
  ```

- `un(ev, cb)` - unlisten for event
  ```js
  myElement.un("click", handleClick);
  ```
- `appendTo(parent)` - append
  ```js
  myElement.appendTo("body");
  myElement.appendTo(myElement2);
  ```
- `Lib.html.append(obj, parent)` - Alternate append
  ```js
  Lib.html.append(myElement, 'body'));
  ```

## Window library (Early stages)

The window library is not built-in to the Lib object as of now. Instead, it's a separate library. Below, you can see some example code of how to use the window library in your apps.

### Window library class documentation

Options

| Option          | Default                                     |
| --------------- | ------------------------------------------- | ------- |
| options.id      | 'win-window-' + Math.floor(Math.random() \* | 100000) |
| options.width   | 300                                         |
| options.height  | 200                                         |
| options.title   | 'Unknown'                                   |
| options.content | _`<empty string>`_                          |
| options.left    | 0                                           |
| options.top     | 0                                           |
| options.parent  | "body"                                      |
| options.onclose | function(){}                                |

### Importing the library into an app

```js
// Download the WindowSystem library using Root.Lib.loadLibrary
const Win = (await Root.Lib.loadLibrary("WindowSystem")).win;
```

Examples

```js
MyWindow = new Win({
  title: "Example App",
  content: "Hello",
  onclose: () => {
    alert("Window closed");
  },
});
```

```js
// Use it in combination with Lib.html:
MyWindow = new Win({
  title: "Example App",
  onclose: () => {
    alert("Window closed");
  },
});

// Grab the window's content
// (this call may be easier in a future update)
const wrapper = MyWindow.window.querySelector(".win-content");

/* Heading */
new Root.Lib.html("h1").text("Example App").appendTo(wrapper);
/* Paragraph */
new Root.Lib.html("p").html("This is my example app").appendTo(wrapper);
```

### Window library example code

```js
export default {
  name: "Window library demo",
  description: "Example of window library",
  ver: 1, // Compatible with core v1
  type: "process",
  exec: async function (Root) {
    let MyWindow;

    console.log("Hello!!", Root.Core);

    function onEnd() {
      // Cleaning up
      const result = Root.Lib.cleanup(Root.PID, Root.Token);
      if (result === true) {
        MyWindow.close();
        console.log("Cleanup Success! Token:", Root.Token);
      } else {
        console.log("Cleanup Failure. Token:", Root.Token);
      }
    }

    // Window library
    const Win = (await Root.Lib.loadLibrary("WindowSystem")).win;

    // Win is a class
    MyWindow = new Win({
      title: "Example App",
      content: "Hello",
      onclose: () => {
        onEnd();
      },
    });

    // Add some example content using Lib.html
    wrapper = MyWindow.window.querySelector(".win-content");

    /* Heading */
    new Root.Lib.html("h1").text("Example App").appendTo(wrapper);
    /* Paragraph */
    new Root.Lib.html("p")
      .html(
        "This is my example app, testing some features of WesBos 0.1.<br>I am made to support version " +
          this.ver
      )
      .appendTo(wrapper);

    // Set up the return function
    return Root.Lib.setupReturns(onEnd);
  },
};
```

To open this process in code:

- Save the file in one of the package folders under `pkgs/`.

`<Core instance>` is the Core instance (usually `c` when using DevTools)
`<folder>` is the name of the folder
`<name>` is the name of the .js file you put inside the folder (no .js extension)

```
<Core instance>.startPkg("<folder>:<name>")
```

## Virtual File System
