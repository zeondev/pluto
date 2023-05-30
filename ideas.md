# Window system

The window system turns into the gui frontend like X11 or Wayland, processes can choose if they don't want to display something or they do. Processes can tell the window system to display as a window, a fullscreen app without draggability, or a dead window that never gets shown.

# Core

When an app gets launched in a container (iframe) it gets the core, the same core that everything else uses, but when the core gets launched in a container it bypasses the bootloader and the login screen and cuts straight to the package you are trying to load.

# New Plans

- More desktop-like UI features and libraries
  - MenuBar library
  -
- Core assets and caching
