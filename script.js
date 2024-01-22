let time = Math.round(Date.now() / 1000);

function refresh() {
  const c = window.c.processList.length;

  let u = {
    name: "Not logged in",
    // wes bos
    pfp: "https://zeon.dev/imgs/userpfps/ZaINfPfAPf3vrfkK.jpg",
  };

  function a() {
    var ac = window.c.services.find((c) => c.name === "Account");

    if (ac == undefined) return;

    const user = ac.ref.getUserData();

    if (user.onlineAccount === true) {
      u = {
        name: "Logged in as " +user.username,
        pfp: user.pfp,
      };
    }
  }

  a();

  /**
   * @type {import("@xhayper/discord-rpc").SetActivity}
   */
  const rpc = {
    details: "In the desktop",
    state: `${c} processes running`,
    buttons: [
      {
        label: "Try Pluto",
        url: "https://pluto.zeon.dev/",
      },
    ],
    largeImageKey: "icon",
    largeImageText: `Pluto v${window.c.version} (${window.c.codename})`,
    startTimestamp: time,
    smallImageKey: u.pfp,
    smallImageText: u.name,
  };

  window.host.updateRPC(rpc);
}

setTimeout(() => {
  refresh();
}, 5000);
setInterval(refresh, 10000);
