export default {
  name: "Weather",
  description: "An epic weather app to check radar and more!",
  ver: 1, // Compatible with core v1
  type: "process",
  privileges: [
    {
      privilege: "services",
      description: "Get information from the weather service",
    },
  ],
  exec: async function (Root) {
    let wrapper; // Lib.html | undefined
    let MyWindow;

    console.log("Weather application started", Root.Lib);

    Root.Lib.setOnEnd(function () {
      MyWindow.close();
    });

    const Win = (await Root.Lib.loadLibrary("WindowSystem")).win;

    MyWindow = new Win({
      title: "Weather",
      content: "",
      pid: Root.PID,
      onclose: () => {
        Root.Lib.onEnd();
      },
    });

    wrapper = MyWindow.window.querySelector(".win-content");

    wrapper.classList.add("with-sidebar");

    // get the open weather map service, one liner
    let owm = Root.Core.services.find((s) => s.name === "OpenWeatherMap");
    if (owm == undefined) {
      console.warn(
        "The REQUIRED OpenWeatherMap service was unable to be found, please contact the developers or research the problem!"
      );
      return;
    }
    owm = owm.ref;

    /*
      // other functions can go here, available in .proc
      /// Gets and returns the set city in the city variable
      getCity,
      /// Gets and returns the set office in the office variable
      getZone,
      /// Gets and returns the set zone in the zone variable
      getOffice,
      /// get units
      getUnits,
      /// set units
      setUnits,
      /// Takes the icon code from OWM API Data and converts it into an emoji.
      codeToEmoji,
      /// Simplifies and returns alerts in active area (nws zone)
      activeAlertsInCurrentArea,
      /// Returns the title and description of the current weather status
      weatherNameDesc,
      /// Returns the current weather temperature but not formatted or floored
      weatherTemp,
      /// Returns a formatted temperature of the current weather
      weatherFFTemp,
      /// Returns the feels like temperature
      weatherFeelsLike,
      /// Returns the LO of the temperature
      weatherLo,
      /// Returns the HI of the temperature
      weatherHi,
      /// Returns the barometric pressure of the current location
      weatherBaroPressure,
      /// Returns the current humidity of the current location
      weatherHumidity,
      /// Returns the wind speed of the current location
      weatherWindSpeed,
      /// Returns the current wind degrees angle of the current location.
      weatherWindDeg,
      /// Returns the sunrise time of the current location
      weatherSunrise,
      /// Returns the sunset time of the current location
      weatherSunset,
      /// Returns the current visibility of the current location in percent
      weatherVisibilityPercent,
    */

    let Html = Root.Lib.html;

    let mainWeatherThing = new Html("div").class("weather-container");

    let weatherJumbo = new Html("div")
      .class("weather-jumbo")
      .append(mainWeatherThing)
      .appendTo(wrapper);

    let mainWeatherWrapper = new Html("div")
      .class("col", "wrapper", "gap-mid")
      .appendTo(mainWeatherThing);

    let cityCodeZoneLabel = new Html("span")
      .class("top-label")
      .text(owm.getZone() + " • " + owm.getOffice())
      .appendTo(mainWeatherWrapper);

    let cityLine = new Html("div")
      .class("label-bar")
      .appendMany(
        new Html("span").text(owm.getCity()),
        new Html("span").class("bar")
      )
      .appendTo(mainWeatherWrapper);

    let dataLine = new Html("div")
      .class("row", "weather-line")
      .appendTo(mainWeatherWrapper);

    let emoji = new Html("div")
      .class("weather-emoji")
      .text(owm.codeToEmoji())
      .appendTo(dataLine);

    let tempWrapper = new Html("div").class("col", "gap").appendTo(dataLine);

    let temp = new Html("div")
      .class("weather-header")
      .text(owm.weatherTemp().toFixed(0) + "°")
      .append(new Html("sup").text("F"))
      .appendTo(tempWrapper);

    let hiLo = new Html("span")
      .class("row", "gap-mid")
      .appendMany(
        new Html("span")
          .class("row", "gap-small")
          .appendMany(
            new Html("sup").text("LO"),
            new Html("span").text(owm.weatherHi().toFixed(0))
          ),
        new Html("span")
          .class("row", "gap-small")
          .appendMany(
            new Html("sup").text("HI"),
            new Html("span").text(owm.weatherHi().toFixed(0))
          )
      )
      .appendTo(tempWrapper);

    function calc() {
      let fs =
        (mainWeatherThing.elm.offsetWidth + mainWeatherThing.elm.offsetHeight) /
        1.4;

      let minFontSize = 14;
      let maxFontSize = 64;

      let dataLineSize = fs * 0.045;
      let hiLoSize = fs * 0.025;

      function maxMin(fs) {
        return Math.max(minFontSize, Math.min(fs, maxFontSize));
      }

      if (wrapper.offsetHeight < 174) {
        weatherJumbo.style({ height: "100%" });
      } else {
        weatherJumbo.style({ height: "174px" });
      }

      dataLine.style({ "font-size": maxMin(dataLineSize) + "px" });
      hiLo.style({ "font-size": maxMin(hiLoSize) + "px" });
    }

    MyWindow.options.onresize = calc;

    console.log(owm.activeAlertsInCurrentArea());

    let sunriseSunset = new Html("div")
      .class("row", "spaced-horizontally")
      .appendTo(wrapper);

    return Root.Lib.setupReturns((m) => {
      console.log("Example received message: " + m);
    });
  },
};
