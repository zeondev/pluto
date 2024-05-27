function makeId(length) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

export default {
  name: "Basic UI / Panic Mode",
  description: "Functions as a Recovery UI",
  ver: "v1.6.2", // Supports minimum Core version of v1.6.2
  type: "process",
  exec: async function (Root) {
    let wrapper; // Lib.html | undefined
    let MyWindow;

    Root.Lib.setOnEnd((_) => {
      wrapper.cleanup();
    });

    let Html = Root.Lib.html;
    wrapper = new Html("div")
      .appendTo("body")
      .class("desktop", "fadeIn")
      .style({
        display: "flex",
        "flex-direction": "column",
        "justify-content": "center",
        "align-items": "center",
        position: "absolute",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        background: "var(--unfocused)",
      });

    console.log(wrapper);

    const vfs = await Root.Lib.loadLibrary("VirtualFS");
    await vfs.importFS();

    // await vfs.writeFile(
    //   "Root/Pluto/panics/pluto_" + makeId(16) + ".panic",
    //   err + "\n\n" + err.stack + "\n\n\n" + new Date().toString()
    // );

    await vfs.writeFile(
      "Root/Pluto/panics/pluto_" + makeId(16) + ".panic",
      JSON.stringify({
        reason: window.err.message,
        stack: window.err.stack,
        date: new Date().toString(),
      })
    );

    function makeRecoveryCardButton(
      heading,
      subtitle,
      onSelect,
      icon,
      dangerous = false
    ) {
      const btn = new Html("button")
        .style({
          display: "flex",
          "justify-content": "flex-start",
          background: `var(--${dangerous ? "negative-dark" : "header"})`,
          "border-radius": "12px",
          border: `1px solid var(--${
            dangerous ? "negative-light" : "outline"
          })`,
          "align-items": "center",
          padding: "20px",
          gap: "16px",
          cursor: "pointer",
        })
        .appendMany(
          new Html("div")
            .style({
              width: "36px",
              height: "36px",
            })
            .html(icon),
          new Html("div")
            .style({
              display: "flex",
              "flex-direction": "column",
              "align-items": "flex-start",
            })
            .appendMany(
              new Html("span")
                .style({ "font-size": "16px", "font-weight": "550" })
                .text(heading),
              new Html("span").text(subtitle)
            )
        )
        .on("click", async () => {
          if (dangerous) {
            const result = await Root.Modal.prompt(
              "This is a dangerous action, are you sure you want to do this?"
            );

            if (result !== true) return;
          }

          onSelect();
        });

      // just for the pointer to work...
      btn.elm.style.setProperty("cursor", "pointer", "important");

      return btn;
    }

    function fadeOut() {
      return new Promise((resolve) => {
        wrapper
          .classOff("fadeIn")
          .classOn("fadeOut")
          .style({ "pointer-events": "none" })
          .on("animationend", () => {
            Root.Lib.onEnd();
            resolve(true);
          });
      });
    }

    const recoveryOptionsListing = new Html("div").class("col", "gap");

    function renderItemList(side) {
      switch (side) {
        case "normal":
          recoveryOptionsListing.clear().appendMany(
            makeRecoveryCardButton(
              "Continue to Pluto",
              "Attempt to resume the normal boot process.",
              async () => {
                await fadeOut();
                Root.Core.startPkg("ui:Desktop");
              },
              `<svg width="36" height="36" viewBox="0 0 37 37" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.5 6.5V30.5" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M15.5 6.5L30.5 18.5L15.5 30.5V6.5Z" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`
            ),
            makeRecoveryCardButton(
              "File Explorer",
              "Find files that might have caused this panic.",
              () => Root.Core.startPkg("apps:FileManager", true, true),
              `<svg width="37" height="37" viewBox="0 0 37 37" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M30.5 30.5C31.2956 30.5 32.0587 30.1839 32.6213 29.6213C33.1839 29.0587 33.5 28.2956 33.5 27.5V12.5C33.5 11.7044 33.1839 10.9413 32.6213 10.3787C32.0587 9.81607 31.2956 9.5 30.5 9.5H18.65C18.1483 9.50492 17.6533 9.38392 17.2105 9.14807C16.7676 8.91222 16.3909 8.56906 16.115 8.15L14.9 6.35C14.6268 5.9352 14.255 5.59472 13.8177 5.35909C13.3805 5.12347 12.8917 5.00008 12.395 5H6.5C5.70435 5 4.94129 5.31607 4.37868 5.87868C3.81607 6.44129 3.5 7.20435 3.5 8V27.5C3.5 28.2956 3.81607 29.0587 4.37868 29.6213C4.94129 30.1839 5.70435 30.5 6.5 30.5H30.5Z" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`
            ),
            makeRecoveryCardButton(
              "Report a bug",
              "Report the issue to the developers on GitHub.",
              () => window.open("https://github.com/zeondev/pluto/issues/new"),
              `<svg width="37" height="37" viewBox="0 0 37 37" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.5 3.5L15.32 6.32" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M21.6802 6.32L24.5002 3.5" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M14.0001 11.1941V9.69408C13.9729 9.0862 14.0692 8.47911 14.283 7.90945C14.4969 7.33979 14.824 6.81938 15.2446 6.3796C15.6651 5.93983 16.1704 5.58982 16.7299 5.35069C17.2894 5.11156 17.8916 4.98828 18.5001 4.98828C19.1086 4.98828 19.7108 5.11156 20.2703 5.35069C20.8298 5.58982 21.3351 5.93983 21.7557 6.3796C22.1762 6.81938 22.5033 7.33979 22.7172 7.90945C22.931 8.47911 23.0273 9.0862 23.0001 9.69408V11.1941" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M18.5 30.5C13.55 30.5 9.5 26.45 9.5 21.5V17C9.5 15.4087 10.1321 13.8826 11.2574 12.7574C12.3826 11.6321 13.9087 11 15.5 11H21.5C23.0913 11 24.6174 11.6321 25.7426 12.7574C26.8679 13.8826 27.5 15.4087 27.5 17V21.5C27.5 26.45 23.45 30.5 18.5 30.5Z" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M18.5 30.5V17" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M10.295 14C7.4 13.7 5 11.15 5 8" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M9.5 20H3.5" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 32C5 28.85 7.55 26.15 10.7 26" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M31.9551 8C31.9551 11.15 29.5551 13.7 26.7051 14" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M33.5 20H27.5" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M26.2998 26C29.4498 26.15 31.9998 28.85 31.9998 32" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`
            ),
            makeRecoveryCardButton(
              "Advanced options",
              "Access other options.",
              () => {
                renderItemList("advanced");
              },
              `<svg width="37" height="37" viewBox="0 0 37 37" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M29 5H8C6.34315 5 5 6.34315 5 8V29C5 30.6569 6.34315 32 8 32H29C30.6569 32 32 30.6569 32 29V8C32 6.34315 30.6569 5 29 5Z" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M15.5 12.5L21.5 18.5L15.5 24.5" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`
            )
          );

          break;
        case "advanced":
          recoveryOptionsListing.clear().appendMany(
            makeRecoveryCardButton(
              "Back",
              "Back to normal options.",
              () => {
                renderItemList("normal");
              },
              `<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 28.5L7.5 18L18 7.5" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M28.5 18H7.5" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`
            ),
            makeRecoveryCardButton(
              "Task Manager",
              "Launch and manage processes on the system.",
              () => Root.Core.startPkg("apps:TaskManager", true, true),
              `<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M27 6H9C7.34315 6 6 7.34315 6 9V27C6 28.6569 7.34315 30 9 30H27C28.6569 30 30 28.6569 30 27V9C30 7.34315 28.6569 6 27 6Z" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 13.5H15C14.1716 13.5 13.5 14.1716 13.5 15V21C13.5 21.8284 14.1716 22.5 15 22.5H21C21.8284 22.5 22.5 21.8284 22.5 21V15C22.5 14.1716 21.8284 13.5 21 13.5Z" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M22.5 3V6" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M22.5 30V33" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 22.5H6" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 13.5H6" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M30 22.5H33" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M30 13.5H33" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M13.5 3V6" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M13.5 30V33" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`
            ),
            makeRecoveryCardButton(
              "Browser",
              "Browse the internet for solutions.",
              () => Root.Core.startPkg("apps:Browser", true, true),
              `<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 33C26.2843 33 33 26.2843 33 18C33 9.71573 26.2843 3 18 3C9.71573 3 3 9.71573 3 18C3 26.2843 9.71573 33 18 33Z" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M18 3C14.1484 7.04423 12 12.4151 12 18C12 23.5849 14.1484 28.9558 18 33C21.8516 28.9558 24 23.5849 24 18C24 12.4151 21.8516 7.04423 18 3Z" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 18H33" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`
            ),
            makeRecoveryCardButton(
              "Terminal",
              "Launch the Terminal.",
              () => Root.Core.startPkg("apps:Terminal", true, true),
              `<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.99951 25.5078L14.9995 16.5078L5.99951 7.50781" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M18 28.4922H30" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`
            ),
            makeRecoveryCardButton(
              "System Wipe",
              "Fixes all issues by completely wiping the system.",
              async () => {
                // prompt the user if they really want to do this
                const result = await Root.Modal.prompt(
                  "This will completely wipe the system. Are you sure you want to do this?"
                );

                if (result !== true) return;

                // wipe the system
                let fs = await vfs.importFS(true);
                await vfs.save();

                // Remove any potential offending localStorage/forage entries
                localStorage.clear();
                sessionStorage.clear();

                // prompt the user if they want to restart their system
                const result2 = await Root.Modal.prompt(
                  "System wipe complete. Restart now?"
                );

                if (result2 === true) {
                  await fadeOut();
                  location.reload();
                }
              },
              `<svg width="37" height="37" viewBox="0 0 37 37" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M30.5 30.5C31.2956 30.5 32.0587 30.1839 32.6213 29.6213C33.1839 29.0587 33.5 28.2956 33.5 27.5V12.5C33.5 11.7044 33.1839 10.9413 32.6213 10.3787C32.0587 9.81607 31.2956 9.5 30.5 9.5H18.65C18.1483 9.50492 17.6533 9.38392 17.2105 9.14807C16.7676 8.91222 16.3909 8.56906 16.115 8.15L14.9 6.35C14.6268 5.9352 14.255 5.59472 13.8177 5.35909C13.3805 5.12347 12.8917 5.00008 12.395 5H6.5C5.70435 5 4.94129 5.31607 4.37868 5.87868C3.81607 6.44129 3.5 7.20435 3.5 8V27.5C3.5 28.2956 3.81607 29.0587 4.37868 29.6213C4.94129 30.1839 5.70435 30.5 6.5 30.5H30.5Z" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
              true
            )
          );
          break;
      }
    }

    let fmIsOpen = false,
      fmProc = null;

    renderItemList("normal");

    // Better UI incoming
    const recoveryWindow = new Html("div")
      .class("win-window-decorative")
      .style({ position: "unset" })
      .append(
        new Html("div")
          .class("win-content", "col")
          .style({
            padding: "24px",
            gap: "8px",
          })
          .appendMany(
            new Html("h1").class("m-0").text("Recovery"),
            new Html("p")
              .class("m-0")
              .text(
                "Your system encountered an error that it was unable to recover from."
              ),
            new Html("a")
              .class("m-0")
              .styleJs({
                cursor: "pointer",
                display: "inline",
                textDecoration: "underline",
                width: "max-content",
                color: "var(--text)",
              })
              .text("View the error log")
              .on("click", () => {
                Root.Core.startPkg("apps:PanicViewer", true, true);
              }),
            new Html("hr"),
            recoveryOptionsListing
          )
      )
      .appendTo(wrapper);

    return Root.Lib.setupReturns((m) => {
      console.log("Example received message: " + m);
    });
  },
};
