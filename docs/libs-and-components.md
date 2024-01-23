# Libraries and Components

[Back to README.md](README.md)

- [Libraries and Components](#libraries-and-components)
  - [Libraries](#libraries)
    - [CtxMenu](#ctxmenu)
    - [Notify](#notify)
  - [Components](#components)

There are a selection of libraries and components available.

## Libraries

You can load a library into your app with the following code:

```js
const lib = await Root.Lib.loadLibrary("libraryName");
```

Here is the list of available libraries:

- `CodeScanner`
- `CtxMenu`
- `FileDialog`
- `FileMappings`
- [`Notify`](#notify)
- `ThemeLib`
- [`VirtualFS`](virtualFS.md)
- [`WindowSystem`](README.md#example-app-code)

As of now, there is no documentation for most of these libraries.

Below is some vague documentation that should be easy enough to understand.

### CtxMenu

`.new(posX, posY, items = [{ item: "Nothing", select: () => null }], header = "", parent = document.body, isAbsolute = true )` - Show a context menu

### Notify

`.show(title, description, parent)` - Show a notification

## Components

Components are similar to libraries, but act like reusable functions to generate HTML elements.

You can load a component into your app with the following code:

```js
const cmp = await Root.Lib.loadComponent("componentName");
```

Here is the list of available components:

- `Card`
- `ImageButton`
- `SelectList`
- `Sidebar`
- `TextSidebar`
- `Tooltip`

None of these have documentation at the moment, but you can check the source code to see how some components are used in system apps.