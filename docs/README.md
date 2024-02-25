# Pluto Documentation for version 1.6 (Elysium)

- [Pluto Documentation for version 1.6 (Elysium)](#pluto-documentation-for-version-15-elysium)
  - [Links to other useful documentation](#links-to-other-useful-documentation)
  - [How to initialize an application](#how-to-initialize-an-application)
    - [Export properties](#export-properties)
    - [Example App code](#example-app-code)
  - [What is Root?](#what-is-root)
  - [What are app permissions?](#what-are-app-permissions)
    - [Permissions](#permissions)
  - [Listening to events](#listening-to-events)
  - [Html library](#html-library)
    - [Examples](#examples)
    - [Methods](#methods)
  - [Using Services in your apps](#using-services-in-your-apps)
    - [Using the Account service](#using-the-account-service)
  - [Using libraries/components in your apps](#using-librariescomponents-in-your-apps)
  - [Recent breaking changes to apps](#recent-breaking-changes-to-apps)
    - [Tray usage](#tray-usage)

This documentation will help you understand how to make apps for Pluto, and include the API reference.

This guide may change often, so to help you in making applications, use the latest documentation for your version.

## Links to other useful documentation

There are some other docs in this folder that may be useful.

[VirtualFS Documentation](virtualFS.md)
[Libraries and Components](libs-and-components.md)
[Localization](localization.md)
[CSS Classes](css-classes.md)

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
    getProcessList: function();
    getString: async function(
      title: string,
      description
    );
    html: class Html;
    icons: Icons;
    langs: string[];
    launch: async function(app, parent);
    loadComponent: async function loadComponent(cmp);​​
    loadLibrary: async function loadLibrary(lib);​​
    onEnd: function onEnd();​​
    onEndCallback: function exec(_);​​
    randomString: function randomString(_)​​
    setOnEnd: function setOnEnd(onEndCallback);​​
    setupReturns: function setupReturns(onMessage, trayInfo);​​​​
    systemInfo: {
      version: number;
      versionString: string;
      codename: string;
    }
    updateProcDesc: function updateProcDesc(newDescription);​​
    updateProcTitle: function updateProcTitle(newTitle);
  };
  Core: Core | null;
  PID: number;
  Token: string;
  Services: null;
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

## Listening to events

This is an advanced process feature that allows you to listen to core events (package start, end, etc.) and respond to them.

Here's an example of it in use in an app:

```js
export default {
  name: "Spacedesktop",
  description: "A desktop replacement for Pluto",
  ver: 1, // Compatible with core v1
  type: "process",
  optInToEvents: true, // <-- Opt in to events
  privileges: [
    {
      privilege: "full",
      description: "Allow Spacedesktop to manage your desktop.",
    },
  ],
  exec: async function (Root) {
    // ...

    return Root.Lib.setupReturns((m) => {
      const { type, data } = m;

      console.log(type, data);

      // here!
      switch (type) {
        case "coreEvent":
          if (data.type === "pkgStart") {
            const name = data.data.proc.name;
            const pid = data.data.pid;

            // ...
          } else if (data.type === "pkgEnd") {
            const name = data.data.proc.name;
            const pid = data.data.pid;

            // ...
          }
          break;
      }
    });
  },
};
```

## Html library

The Html library is a class that can be initialized at any time to create HTML elements in a simple way.

**The examples here use the variable `Html`, it is recommended to assign the Html variable to Root.Lib.html like this:**

```js
const Html = Root.Lib.html;
```

You can also import Html from datkat21's source using unpkg:

```js
const Html = (await import("https://unpkg.com/@datkat21/html")).default;
```

This is recommended if you want to use the latest features of Html (e.g. prepend, prependMany, prependTo).  
This will ensure the Html library is always up to date, no matter the version of Pluto the app is running on.

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

**Note: Some methods may not be available in older versions of Pluto, and some methods may not work unless you use the [latest version of Html](#html-library).**

- `.style()`  
   Add inline styles
  ```js
  new Html("span").style({
    color: "red",
    // These are CSS style names,
    // so you will have to use dashes..
    "font-size": "18px",
    // Another example
    "backdrop-filter": "blur(4px)",
  });
  ```
- `.styleJs()`  
   Add inline styles (JS syntax)
  ```js
  new Html("span").styleJs({
    color: "red",
    fontSize: "18px",
    backdropFilter: "blur(4px)",
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
   Toggle a class (on/off)
  ```js
  new Html("span").class("my-class");
  // <span class="my-class"></span>
  ```
- `.classOn()`  
   Add a class (Recommended to use over `.class()`)
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
- `.id()`  
   Set the id of an element
  ```js
  new Html("div").id("my-id");
  // <div id="my-id"></div>
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
- `.prepend(elm)`
  Add a new element to the beginning of the element
  ```js
  const container = new Html("div").prepend(
    new Html("span").text("Hello, world!")
  );
  ```
- `.prependMany(...elms)`
  Add multiple elements to the start
  ```js
  new Html("div").prependMany(
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
- `.prependTo()`
  Prepend the element to the beginning of another element

  ```js
  new Html("div").prependTo("body");

  /*
  <body>
    <div></div>
    <p>Hello</p>
  </body>
  */
  ```

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
- `.appendTo()`
  Append the element to another element

  ```js
  new Html("div").appendTo("body");

  /*
  <body>
    <p>Hello</p>
    <div></div>
  </body>
  */
  ```

- `.cleanup()`  
  Destroy the element

  ```js
  const div = new Html("div").appendTo("body");

  // later
  div.cleanup();
  ```

- `.swapRef(elm)`  
  Swap the element reference with a new one

  ```js
  const div = new Html("div").appendTo("body");

  const div2 = document.querySelector("body > div.two");

  div.swapRef(div2); // div now references div2
  ```

- `.getText()`
  Get text of the element

  ```js
  const div = new Html("div").text("This is my text...");

  div.getText(); // 'This is my text...'
  ```

- `.getHtml()`
  Get HTML content of the element

  ```js
  const div = new Html("div").html("<p>This is my <b>HTML</b> content...</p>");

  div.getHtml(); // '<p>This is my <b>HTML</b> content...</p>'
  ```

- `.getValue()`
  Ditto, but for the value of an input tag.

## Using Services in your apps

Currently, there is only one usable service: Account. This service handles Zeon account status and login.

### Using the Account service

You will need the `services` privilege:

```js
export default {
  // ...
  privileges: [
    {
      privilege: "services",
      description: "Use the Zeon account service",
    },
  ],
  // ...
};
```

You can check in your app code for the service's existence:

```js
let service = Root.Core.services.find((x) => x.name === "Account");
if (service && service.ref) {
  // your code here
}
```

The Account service has the following methods:

- `async login(user, pass)`
  Log in to a Zeon account with its username and password. This is an asynchronous function.
- `logout()`
  Log out of the current Zeon account.
- `getUserData()`
  Retrieve current user account data. Returns invalid data if a user is not logged in. Check using `.onlineAccount` (true if logged in, false if not) on the returned object.

## Using libraries/components in your apps

[**Read more on the updated components and libraries documentation here.**](libs-and-components.md)

Libraries and components add extra functionality into your apps and make an easy, reusable way to do a certain thing.

For example, the VirtualFS library can be used to read the file system:

```js
// in-app
const vfs = await Root.Lib.loadLibrary("VirtualFS");
await vfs.importFS();

// Read a file
const fileContent = await vfs.readFile("Root/myFile.txt");
```

More documentation on VirtualFS [can be found here](virtualFS.md).


## Recent breaking changes to apps

- Early 1.2 Elysium core had a different way of ending apps.

  - This feature is now merged into the core so you will need to replace `onEnd()` with `Root.Lib.onEnd()`. To set your ending function you will need to do:

  ```js
  Root.Lib.setOnEnd((_) => {
    /* code here */
  });
  ```

  - Remember the process cleans up after itself so you only need to cleanup any elements or intervals you have made when initializing.

### Tray usage

- Early 1.6 core uses the second parameter of `setupReturns` to declare tray items.

  Pass in an argument as follows:

  ```js
  {
    icon: "/* SVG data for icon (in XML) */",
  },
  ```

  Clicking your tray item will send a `context-menu` message to your app.  
  Here's how to handle it (inside the first parameter of `setupReturns`):

  ```js
  if (m.type && m.type === "context-menu") {
    CtxMenu.new(m.x, m.y, [
      {
        item: "item text",
        select: async () => {
          // Your code
        },
      },
    ]);
  }
  ```
