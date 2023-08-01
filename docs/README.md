# Pluto Documentation for version 1.3 (Elysium)

- [Pluto Documentation for version 1.3 (Elysium)](#pluto-documentation-for-version-13-elysium)
  - [How to initialize an application](#how-to-initialize-an-application)
    - [Export properties](#export-properties)
    - [Example App code](#example-app-code)
  - [What is Root?](#what-is-root)
  - [What are app permissions?](#what-are-app-permissions)
    - [Permissions](#permissions)
  - [Html library](#html-library)
    - [Examples](#examples)
    - [Methods](#methods)
  - [Using libraries/components in your apps](#using-librariescomponents-in-your-apps)
  - [Recent breaking changes to apps](#recent-breaking-changes-to-apps)

This documentation will help you understand how to make apps for Pluto, and include the API reference.

This guide may change often, so to help you in making applications, use the latest documentation for your version.

## How to initialize an application

### Export properties

In every application you must define the following properties in your export:

- An application name
  - defined as `name` in the export
- A description
  - defined as `description` in the export
- The version it is compatible with
  - defined as `ver` in the export
- The type of application
  - defined as `type` in the export
- Executable JavaScript code
  - defined as `exec` in the export
  - `exec` **MUST** be an async function and contain a single argument named Root.

If your app doesn't meet to these specifications your app may not be permitted to run.

This simple example app launches a window from the library and appends a `h1`, a `p` tag, and a couple of `button` elements to the window's content. These appended elements take use of our `Html` library that is recommended to be used in every app, if you want to know more about the `Html` library [click here](#html-library).

### Example App code

Here is a template for a simple example app.

You are allowed to copy this example app.

```js
export default {
  name: "Example",
  description: "Example application. Boilerplate.",
  ver: 1, // Compatible with core v1
  type: "process",
  exec: async function (Root) {
    let wrapper;
    let MyWindow;

    console.log("Hello from example package", Root.Lib);

    const Win = (await Root.Lib.loadLibrary("WindowSystem")).win;

    MyWindow = new Win({
      title: "Example App",
      content: "Hello",
      pid: Root.PID,
      onclose: () => {
        Root.Lib.onEnd();
      },
    });

    Root.Lib.setOnEnd((_) => MyWindow.close());

    wrapper = MyWindow.window.querySelector(".win-content");

    /* Heading */ new Root.Lib.html("h1").text("Example App").appendTo(wrapper);
    /* Paragraph */ new Root.Lib.html("p")
      .html("Hi welcome to the example app")
      .appendTo(wrapper);
    /* Button */ new Root.Lib.html("button")
      .text("Hello, world")
      .appendTo(wrapper)
      .on("click", (e) => {
        Root.Modal.alert(
          `Hello!\nCursor Position: ${e.clientX}, ${e.clientY}\nMy PID: ${Root.PID}\nMy Token: ${Root.Token}`
        );
      });
    /* Close Button */ new Root.Lib.html("button")
      .text("End Process")
      .appendTo(wrapper)
      .on("click", (e) => {
        Root.Lib.onEnd();
      });

    return Root.Lib.setupReturns((m) => {
      console.log("Example received message: " + m);
    });
  },
};
```

## What is Root?

Root is the global object given to applications when they are executed.
What exactly is given through this object depends on the permissions of your app.
Here's a breakdown of what the Root object looks like:

```ts
interface Root {
  Lib: {
    html: class Html;
    icons: Icons;
    systemInfo: {
      version: number;
      versionString: string;
      codename: string;
    }
  };
  Core: Core | null;
  PID: number;
  Token: string;
  Modal: {
    modal:
      async function(
        title: string,
        description: string,
        parent?: Html | HTMLElement,
        contentIsHtml: boolean = false,
        buttons: Button[]
      );
    // For modal, using the below functions are recommended as they simplify the modal experience
    alert:
      async function(
        title: string,
        description: string,
        parent?: Html | HTMLElement
      );
    prompt:
      async function(
        title: string,
        description: string,
        parent?: Html | HTMLElement
      );
    input:
      async function(
        title: string,
        description: string,
        placeholder: string,
        parent?: Html | HTMLElement,
        isPassword: boolean = false
      );
  };
  Services: Service[];
}
```

## What are app permissions?

App permissions (referred to as Privileges in the core) are what your app defines to allow certain parts of the core to be passed to your app.
As an app developer you need to adapt your application to every limitation because the user allows or denies these permissions for security purposes.

### Permissions

The current permissions available to you are:

- `startPkg`
  - Start other applications
- `processList`
  - View and control other processes
- `knownPackageList`
  - Know installed packages
- `services`
  - Interact with system services
- `full`
  - Full system access (gives you the entire core to use)

Your app can request to use any permissions by appending a privilege object to the `privileges` item in your export, like this:

```js
privileges: [
  {
    // The privilege to be granted
    privilege: "services",
    // Your reasoning for requesting this privilege
    description: "Access system services",
  },
],
```

## Html library

The Html library is a class that can be initialized at any time to create HTML elements in a simple way.

**The examples here use the variable `Html`, it is recommended to assign the Html variable to Root.Lib.html like this:**

```js
const Html = Root.Lib.html;
```

### Examples

For example, I'll show how some layouts can be created in HTML vs the Html class:

```html
<div class="card">
  <span class="h1">This is a heading!</span>
  <span>This is my paragraph text</span>
</div>
```

In Html:

```js
new Html("div")
  .class("card")
  .appendMany(
    new Html("span").class("h1").text("This is a heading!"),
    new Html("span").text("This is my paragraph text")
  );
```

You also have to define where to place the element, using the `.appendTo()` method. Here's an example:

```js
const container = new Html("div").appendTo("body");
// A new div that gets appended to the <body> tag

new Html("span")
  .class("h1")
  .text("Hello, this goes into the container!")
  .appendTo(container);
```

This will create the following layout:

```html
<body>
  <div>
    <span class="h1"> Hello, this goes into the container! </span>
  </div>
</body>
```

### Methods

There are a few more advanced methods to how the Html class works:

- `.style()`  
   Add inline styles
  ```js
  new Html("span").style({
    color: "red",
    // These are CSS style names,
    // so you will have to use dashes..
    "font-size": "18px",
  });
  ```
- `.attr()`  
   Set attributes for the element
  ```js
  new Html("span").attr({
    id: "MySpan",
  });
  // <span id="MySpan"></span>
  ```
- `.class()`  
   Toggle a class
  ```js
  new Html("span").class("my-class");
  // <span class="my-class"></span>
  ```
- `.classOn()`  
   Add a class
  ```js
  new Html("span").classOn("my-class");
  // <span class="my-class"></span>
  ```
- `.classOff()`  
   Remove a class
  ```js
  new Html("span").classOff("my-class");
  // <span></span>
  ```
- `.on(eventName, eventHandler)`  
   Add an event listener

  ```js
  function myEvent(e) {
    console.log(e);
  }

  new Html("span").on("click", myEvent);

  // or

  new Html("span").on("click", function (e) {
    console.log(e);
  });
  ```

- `.un(eventName, eventHandler)`  
   Remove an event listener (if a function is available)

  ```js
  function myEvent(e) {
    console.log(e);
  }

  new Html("span").un("click", myEvent);
  ```

- `.append(elm)`
  Add a new element inside the element
  ```js
  const container = new Html("div").append(
    new Html("span").text("Hello, world!")
  );
  ```
- `.appendMany(...elms)`
  Add multiple elements
  ```js
  new Html("div").appendMany(
    new Html("span").class("h1").text("Hello!"),
    new Html("span").text("Hi!")
  );
  /*
  <div>
    <span class="h1">Hello!</span>
    <span>Hi!</span>
  </div>
  */
  ```
- `.cleanup()`  
  Destroy the element

  ```js
  const div = new Html("div").appendTo("body");

  // later
  div.cleanup();
  ```

## Using libraries/components in your apps

Libraries and components add extra functionality into your apps and make a easy, reusable way to do a certain thing.

Read the [Libraries and Components documentation](docs/libs-and-components.md).

For example, the VirtualFS library can be used to read the file system:

```js
// in-app
const vfs = await Root.Lib.loadLibrary("VirtualFS");
await vfs.importFS();

// Read a file
const fileContent = await vfs.readFile("Root/myFile.txt");
```

More documentation on VirtualFS [can be found here](docs/virtualFS.md).

## Recent breaking changes to apps

- Early 1.2 Elysium core had a different way of ending apps.

  - This feature is now merged into the core so you will need to replace `onEnd()` with `Root.Lib.onEnd()`. To set your ending function you will need to do:

  ```js
  Root.Lib.setOnEnd((_) => {
    /* code here */
  });
  ```

  - Remember the process cleans up after itself so you only need to cleanup any elements or intervals you have made when initializing.
