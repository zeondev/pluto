const THEME_DATA_VERSION = 1;
let lib = {};
let Core = {};

const CURSOR_DEFAULT = `data:image/svg+xml,%3Csvg width='20' height='26' viewBox='0 0 20 26' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg filter='url(%23filter0_d_1104_663)'%3E%3Cpath d='M14.5 15.5L2 3V19.5L5.5 17L7.30828 21.9728C7.41041 22.2536 7.73448 22.3828 8.00178 22.2491L11.0885 20.7057C11.3211 20.5895 11.4257 20.3143 11.3291 20.0728L9.5 15.5H14.5Z' fill='black'/%3E%3Cpath d='M14.5 15.5L2 3V19.5L5.5 17L7.30828 21.9728C7.41041 22.2536 7.73448 22.3828 8.00178 22.2491L11.0885 20.7057C11.3211 20.5895 11.4257 20.3143 11.3291 20.0728L9.5 15.5H14.5Z' stroke='white' stroke-width='1.5'/%3E%3C/g%3E%3Cdefs%3E%3Cfilter id='filter0_d_1104_663' x='0.55' y='0.489453' width='18.4605' height='25.2633' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dx='1' dy='1'/%3E%3CfeGaussianBlur stdDeviation='0.85'/%3E%3CfeComposite in2='hardAlpha' operator='out'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.05 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_1104_663'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_1104_663' result='shape'/%3E%3C/filter%3E%3C/defs%3E%3C/svg%3E`;
const CURSOR_POINTER = `data:image/svg+xml,%3Csvg width='23' height='26' viewBox='0 0 23 26' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg filter='url(%23filter0_d_1104_682)'%3E%3Cpath d='M2.36495 13.635L2.17678 13.8232C2.06359 13.9364 2 14.0899 2 14.25C2 14.4101 2.06359 14.5636 2.17678 14.6768L6.5 19L8.5 21L9.35355 21.8536C9.44732 21.9473 9.5745 22 9.70711 22H17C19.2793 21.9375 19.0003 21.9999 19.4992 20.0032C19.4997 20.0012 19.5 19.9989 19.5 19.9968V11.6706C19.5 10.0694 17.4416 9.41611 16.5182 10.7242C16.5126 10.7322 16.5 10.7282 16.5 10.7185V10C16.5 9.01608 15.5361 8.32131 14.6026 8.63246L13.5182 8.99394C13.5092 8.99692 13.5 8.99026 13.5 8.98083V8C13.5 7.36506 12.9033 6.89917 12.2873 7.05317L10.5182 7.49545C10.5089 7.49776 10.5 7.49078 10.5 7.48126V6.75V3.25C10.5 2.55964 9.94036 2 9.25 2H9C8.44772 2 8 2.44772 8 3V15.4254C8 15.4597 7.96394 15.482 7.93328 15.4666L3.80328 13.4016C3.32357 13.1618 2.7442 13.2558 2.36495 13.635Z' fill='black'/%3E%3Cpath d='M10.5 11.5V6.75M10.5 6.75V3.25C10.5 2.55964 9.94036 2 9.25 2H9C8.44772 2 8 2.44772 8 3V3V15.4254C8 15.4597 7.96394 15.482 7.93328 15.4666L3.80328 13.4016C3.32357 13.1618 2.7442 13.2558 2.36495 13.635L2.17678 13.8232C2.06359 13.9364 2 14.0899 2 14.25V14.25C2 14.4101 2.06359 14.5636 2.17678 14.6768L6.5 19L8.5 21L9.35355 21.8536C9.44732 21.9473 9.5745 22 9.70711 22H17C19.2793 21.9375 19.0003 21.9999 19.4992 20.0032C19.4997 20.0012 19.5 19.9989 19.5 19.9968V11.6706C19.5 10.0694 17.4416 9.41611 16.5182 10.7242V10.7242C16.5126 10.7322 16.5 10.7282 16.5 10.7185V10M10.5 6.75V7.48126C10.5 7.49078 10.5089 7.49776 10.5182 7.49545L12.2873 7.05317C12.9033 6.89917 13.5 7.36506 13.5 8V8M13.5 8V10.5V11.5M13.5 8V8.98083C13.5 8.99026 13.5092 8.99692 13.5182 8.99394L14.6026 8.63246C15.5361 8.32131 16.5 9.01608 16.5 10V10M16.5 10V11.5' stroke='white' stroke-width='1.5' stroke-linecap='round'/%3E%3C/g%3E%3Cdefs%3E%3Cfilter id='filter0_d_1104_682' x='0.55' y='0.55' width='22.4' height='24.9' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dx='1' dy='1'/%3E%3CfeGaussianBlur stdDeviation='0.85'/%3E%3CfeComposite in2='hardAlpha' operator='out'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.05 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_1104_682'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_1104_682' result='shape'/%3E%3C/filter%3E%3C/defs%3E%3C/svg%3E`;
const CURSOR_TEXT = `data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg clip-path='url(%23clip0_1118_622)'%3E%3Cg filter='url(%23filter0_d_1118_622)'%3E%3Cpath d='M14 1H10.5H7V3.07692L9.1 4.07692V15.9231L7 16.9231V19H14V16.9231L11.9 15.9231V4.07692L14 3.07692V1Z' fill='black'/%3E%3Cpath d='M14 1H10.5H7V3.07692L9.1 4.07692V15.9231L7 16.9231V19H14V16.9231L11.9 15.9231V4.07692L14 3.07692V1Z' stroke='white' stroke-width='1.5' stroke-linecap='round'/%3E%3C/g%3E%3C/g%3E%3Cdefs%3E%3Cfilter id='filter0_d_1118_622' x='5.55' y='-0.45' width='11.9' height='22.9' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dx='1' dy='1'/%3E%3CfeGaussianBlur stdDeviation='0.85'/%3E%3CfeComposite in2='hardAlpha' operator='out'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.05 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_1118_622'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_1118_622' result='shape'/%3E%3C/filter%3E%3CclipPath id='clip0_1118_622'%3E%3Crect width='20' height='20' fill='white'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E`;

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

      let fill = "";
      let stroke = "white";
      let cursorInvert = false;

      if (theme.values !== undefined && theme.values !== null) {
        fill = theme.values.primary;
      }

      switch (theme.cssThemeDataset) {
        case "dark":
          fill = "hsl(222, 27%, 20%)";
          break;
        case "red":
          fill = "hsl(0, 81%, 21%)";
          break;
        case "green":
          fill = "hsl(131, 81%, 21%)";
          break;
        case "grey":
          // fill = "#124b31";
          fill = "#151515";
          break;
        case "light":
          fill = "#f3f3f3";
          cursorInvert = true;
          break;
      }

      if (cursorInvert === true) stroke = "black";

      function url(x) {
        return `url("${x}")`;
      }
      function stringify(str) {
        return url(
          str
            .replace("black", encodeURIComponent(fill))
            .replace("white", encodeURIComponent(stroke))
        );
      }

      document.documentElement.style.setProperty(
        "--cursor-default",
        stringify(CURSOR_DEFAULT)
      );
      document.documentElement.style.setProperty(
        "--cursor-pointer",
        stringify(CURSOR_POINTER)
      );
      document.documentElement.style.setProperty(
        "--cursor-text",
        stringify(CURSOR_TEXT)
      );
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
