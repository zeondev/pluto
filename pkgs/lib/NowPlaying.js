let lib = {};
let core = {};

export default {
  name: "Now Playing",
  description: "Now Playing status for media player",
  ver: 1,
  type: "library",
  init: function (l, c) {
    lib = l;
    core = c;
    if (!core.windowsList) core.windowsList = [];
  },
  data: {
    setStatus: function (data) {
      let player = {};
      if (sessionStorage.getItem("player")) {
        player = JSON.parse(sessionStorage.getItem("player"));
      }
      player = {
        pid: data.pid,
        coverArt: data.coverArt,
        mediaName: data.mediaName,
        mediaAuthor: data.mediaAuthor,
        appName: data.appName,
        controls: data.controls,
      };
      console.log(player);
      sessionStorage.setItem("player", JSON.stringify(player));
      addEventListener("beforeunload", () => {
        player = {};
        console.log(player);
        sessionStorage.setItem("player", JSON.stringify(player));
      });
    },
    disposePlayer: function () {
      let player = {};
      player = {};
      console.log(player);
      sessionStorage.setItem("player", JSON.stringify(player));
    },
  },
};
