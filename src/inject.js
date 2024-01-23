window.addEventListener("pluto.boot", async () => {
  const Core = window.bootUpCore;
  console.log(Core);
  const app = await Core.startPkg("services:DesktopIntegration", true, true);
  Core.services.push(app);
});
