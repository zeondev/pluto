const THEME_DATA_VERSION = 1;
let lib = {};
let Core = {};

export default {
  name: "Theme Lib",
  description: "Manages theme parsing and handling",
  ver: 1, // Compatible with core v1
  type: "library",
  init: function (l, c) {
    lib = l;
    Core = c;

    return this.data;
  },
  data: {
    THEME_DATA_VERSION,
    // exported functions here
    validateTheme: (theme) => {
      if (theme && theme.startsWith("{")) {
        // assume valid JSON
        try {
          /*ts*/ `
          interface themeData {
            // Version of theme API this theme is compatible with
            version: number;
            // Display name
            name: string;
            // Theme description
            description: string;
            // Color values (currently not supported)
            values: themeValues | null;
            // Override data-theme property if the theme is CSS-only.
            cssThemeDataset?: string;
            // Wallpaper (optional)
            wallpaper: string | null;
          }`;

          const themeData = JSON.parse(theme);

          /* Validating themeData object */
          if (themeData && typeof themeData === "object") {
            // Validate version property
            if (
              themeData.version &&
              typeof themeData.version === "number" &&
              themeData.version === THEME_DATA_VERSION
            ) {
              // Validate name property
              if (
                themeData.name &&
                typeof themeData.name === "string" &&
                themeData.name.trim() !== ""
              ) {
                // Validate description property
                if (
                  themeData.description &&
                  typeof themeData.description === "string" &&
                  themeData.description.trim() !== ""
                ) {
                  // Validate values and cssThemeDataset properties
                  if (
                    (themeData.values === null &&
                      themeData.cssThemeDataset &&
                      typeof themeData.cssThemeDataset === "string" &&
                      themeData.cssThemeDataset.trim() !== "") ||
                    (typeof themeData.values === "object" &&
                      Object.keys(themeData.values).length > 0)
                  ) {
                    // Validate wallpaper property
                    if (
                      themeData.wallpaper === null ||
                      (typeof themeData.wallpaper === "string" &&
                        themeData.wallpaper.trim() !== "")
                    ) {
                      return { success: true, data: themeData };
                    } else {
                      return {
                        success: false,
                        message: "Invalid wallpaper property",
                      };
                    }
                  } else {
                    return {
                      success: false,
                      message:
                        "Invalid values or cssThemeDataset property in theme data",
                    };
                  }
                } else {
                  return {
                    success: false,
                    message: "Invalid description property in theme data",
                  };
                }
              } else {
                return {
                  success: false,
                  message: "Invalid name property in theme data",
                };
              }
            } else {
              return {
                success: false,
                message: "Invalid version property in theme data",
              };
            }
          } else {
            return { success: false, message: "Invalid theme data" };
          }
        } catch (e) {
          // error
          return { success: false, message: "Failed to parse theme" };
        }
      } else return { success: false, message: "Failed to parse theme" };
    },
    setCurrentTheme: async (theme) => {
      const vfs = await lib.loadLibrary("VirtualFS");

      await vfs.importFS();

      try {
        const appearanceConfig = JSON.parse(
          await vfs.readFile("Root/Pluto/config/appearanceConfig.json")
        );
        if (
          typeof appearanceConfig.useThemeWallpaper !== undefined &&
          appearanceConfig.useThemeWallpaper === true
        ) {
          if (theme.wallpaper) {
            // Securely tell the desktop to change wallpaper
            const d = Core.processList.find((p) => p.name === "ui:Desktop");
            if (d !== undefined) {
              d.proc.send({
                type: "setWallpaper",
                data: theme.wallpaper,
              });
            }
          }
        }
      } catch (e) {
        stop(); // idk
      }

      if (theme.cssThemeDataset) {
        document.documentElement.style.cssText = "";
        document.documentElement.dataset.theme = theme.cssThemeDataset;
      } else {
        if (theme.values) {
          for (let value in theme.values) {
            document.documentElement.style.setProperty(
              "--" + value,
              theme.values[value]
            );
          }
        } else {
          document.documentElement.style.cssText = "";
        }
      }
    },
    setWallpaper: async (wallpaper) => {
      if (wallpaper) {
        // Securely tell the desktop to change wallpaper
        const d = Core.processList.find((p) => p.name === "ui:Desktop");
        if (d !== undefined) {
          return await d.proc.send({
            type: "setWallpaper",
            data: wallpaper,
          });
        }
      }
    },
  },
};
