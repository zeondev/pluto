export default {
  name: "3x30n5StatusBar",
  description:
    "3x30n5's (exeon's) status bar. Simple and cool status bar for Pluto.",
  ver: 0.1, // Compatible with core 0.1
  type: "process",
  author: "tuxcs",
  exec: async function(Root) {
    let wrapper = new Root.Lib.html();

    console.log("booting up 3x30n5 status bar");

    function onEnd() {
      const result = Root.Lib.cleanup(Root.PID, Root.Token);
      if (result === true) {
        wrapper.cleanup();
      }
    }

    let owm = Root.Core.services.find((s) => s.name === "OpenWeatherMap");
    if (owm == undefined) {
      console.warn(
        "The REQUIRED OpenWeatherMap service was unable to be found when launched in the bar, please contact the developers or research the problem!"
      );
      return;
    }

    owm = owm.ref;

    function formatAMPM(date) {
      var hours = date.getHours();
      var minutes = date.getMinutes();
      var ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      minutes = minutes < 10 ? "0" + minutes : minutes;
      var strTime = hours + ":" + minutes + " " + ampm;
      return strTime;
    }

    function createBarItem(
      icon = "",
      value,
      optName = "barItem",
      iconEmoji = 0,
      appOpen = "apps:nul"
    ) {
      return new Root.Lib.html("div")
        .class("bar-item")
        .attr({ id: optName })
        .appendMany(
          iconEmoji == 0
            ? new Root.Lib.html("div")
              .html(Root.Lib.icons[icon])
              .class("bar-icon")
            : new Root.Lib.html("div").text(icon).class("bar-icon-emoji"),
          new Root.Lib.html("span").class("bar-text-value").text(value)
        ).on("click", () => {
          Root.Core.startPkg(appOpen);
        });
    }

    function createBarSeparator() {
      return new Root.Lib.html("div").class("separator");
    }

    let bar3x3 = new Root.Lib.html("div").class("bar-3x3").appendTo(wrapper);

    function updateBar() {
      bar3x3
        .html("") // Clear the content
        .appendMany(
          // comma separated new elements
          new Root.Lib.html("buttons")
            .class("transparent")
            .text("🪐")
            .style({ "font-size": "26px" })
            .on("click", () => {
              console.log("pluto clicked");
            }),
          createBarSeparator(),
          createBarItem(owm.codeToEmoji(), owm.weatherFFTemp(), "weather", 1, "apps:Weather"),
          createBarItem("clock", formatAMPM(new Date()), "clock")
        );
    }

    // rawgberry botok
    updateBar();

    setInterval(updateBar, 1000);

    return Root.Lib.setupReturns(onEnd, (m) => {
      if (m.type && m.type === "append") {
        wrapper.appendTo(m.elm);
      }
    });
  },
};
