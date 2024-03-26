export default {
  name: "Audio Player",
  description: "Listen to your music in this app.",
  ver: "v1.6.2", // Supports minimum Core version of v1.6.2
  type: "process",
  exec: async function (Root) {
    let wrapper; // Lib.html | undefined
    let MyWindow;

    const Html = (await import("https://unpkg.com/@datkat21/html")).default;

    console.log("Hello from example package", Root.Lib);

    const NowPlaying = await Root.Lib.loadLibrary("NowPlaying");
    Root.Lib.setOnEnd(function () {
      setTimeout(() => {
        NowPlaying.disposePlayer();
      }, 1000);
      MyWindow.close();
    });

    const Win = (await Root.Lib.loadLibrary("WindowSystem")).win;

    MyWindow = new Win({
      title: "Audio Player",
      pid: Root.PID,
      width: 854,
      height: 480,
      onclose: () => {
        Root.Lib.onEnd();
      },
    });

    // initializing wrappers and vfs
    wrapper = MyWindow.window.querySelector(".win-content");

    const vfs = await Root.Lib.loadLibrary("VirtualFS");
    const FileDialog = await Root.Lib.loadLibrary("FileDialog");

    await vfs.importFS();

    wrapper.classList.add("with-sidebar", "row", "o-h", "h-100");

    const Sidebar = await Root.Lib.loadComponent("Sidebar");

    // this function won't return a module
    async function loadScript(url) {
      // script probably already exists
      if (Html.qs('script[src="' + url + '"]')) {
        return false;
      }

      // make new script
      new Html("script").html(await (await fetch(url)).text()).appendTo("body");
      return true;
    }

    await loadScript(
      "https://cdnjs.cloudflare.com/ajax/libs/jsmediatags/3.9.5/jsmediatags.min.js"
    );

    let jMediaTags = window.jsmediatags;
    console.log(jMediaTags);

    // this function opens the file and changes the title to the file name,
    // we load the file into a buffer
    let fileName = "";
    async function openFile(path) {
      let file;
      if (path) file = path;
      else file = await FileDialog.pickFile("Root");
      if (file === false) return;
      let result = updateAudio(await vfs.readFile(file));
      if (result === false) return;
      fileName = file.split("/").pop();
      MyWindow.window.querySelector(".win-titlebar .title").innerText =
        "Audio Player - " + fileName;
      MyWindow.focus();
    }

    // creates sidebar
    Sidebar.new(wrapper, [
      {
        onclick: async (_) => {
          openFile();
        },
        html: Root.Lib.icons.fileAudio,
        title: "Select Audio...",
      },
      {
        style: {
          "margin-top": "auto",
        },
        onclick: (_) => {
          alert("Not implemented");
        },
        html: Root.Lib.icons.help,
        title: "Help",
      },
    ]);

    // creates the wrapper that the image is in
    let vidWrapper = new Root.Lib.html("div")
      .class("ovh", "fg", "fc")
      .styleJs({
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        width: "100%",
        height: "100%",
      })
      .appendTo(wrapper);

    // creates the actual img element
    let metaDataDiv = new Root.Lib.html("div").appendTo(vidWrapper).styleJs({
      display: "flex",
      gap: "25px",
      alignItems: "center",
      justifyContent: "center",
    });
    let img = new Root.Lib.html("img").appendTo(metaDataDiv).styleJs({
      objectFit: "cover",
      width: "200px",
      height: "200px",
      borderRadius: "5px",
    });
    let texts = new Root.Lib.html("div").appendTo(metaDataDiv).styleJs({
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    });
    new Root.Lib.html("br").appendTo(vidWrapper);
    new Root.Lib.html("br").appendTo(vidWrapper);
    let audio = new Root.Lib.html("audio")
      .appendTo(vidWrapper)
      .style({
        width: "80%",
        "object-fit": "contain",
        border: "none",
      })
      .attr({ draggable: "false", controls: "on" });

    let playerCover = null;
    let playerSong = "";
    let playerArtist = "Unknown artist";

    // updates the video on the next load
    async function updateAudio(content) {
      playerSong = "";
      playerArtist = "Unknown artist";
      1;
      if (!content.startsWith("data:audio/") && !content.startsWith("blob:")) {
        Root.Modal.alert("Error", "This does not look like an audio file").then(
          (_) => {
            MyWindow.focus();
          }
        );
        return false;
      }
      setTimeout(async () => {
        console.log(fileName);
        playerSong = fileName;
        texts.clear();
        new Root.Lib.html("p").appendTo(texts).text("Now playing");
        let songName = new Root.Lib.html("h1").appendTo(texts).text(playerSong);
        let songArtist = new Root.Lib.html("p")
          .appendTo(texts)
          .text(playerArtist);
        const audioBlob = await (await fetch(content)).blob();
        jsmediatags.read(audioBlob, {
          onSuccess: function (tag) {
            console.log(tag);
            if ("title" in tag.tags) {
              playerSong = tag.tags.title;
            }
            if ("artist" in tag.tags) {
              playerArtist = tag.tags.artist;
            }
            if ("album" in tag.tags) {
              playerArtist = playerArtist + " • " + tag.tags.album;
            }
            if ("year" in tag.tags) {
              playerArtist = playerArtist + " • " + tag.tags.year;
            }
            if ("picture" in tag.tags) {
              let buf = new Uint8Array(tag.tags.picture.data);
              let blob = new Blob([buf]);
              console.log(blob);
              img.elm.src = URL.createObjectURL(blob);
              playerCover = URL.createObjectURL(blob);
              img.styleJs({ display: "flex" });
            } else {
              img.styleJs({ display: "none" });
            }
            songName.text(playerSong);
            songArtist.text(playerArtist);
            function isPlaying() {
              NowPlaying.setStatus({
                pid: Root.PID,
                coverArt: playerCover,
                mediaName: playerSong,
                mediaAuthor: playerArtist.split(" • ")[0],
                appName: "Audio Player",
                controls: [
                  {
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pause"><rect width="4" height="16" x="6" y="4"/><rect width="4" height="16" x="14" y="4"/></svg>',
                    callbackEvent: "pausePlay",
                  },
                ],
              });
            }
            function isPaused() {
              NowPlaying.setStatus({
                pid: Root.PID,
                coverArt: playerCover,
                mediaName: playerSong,
                mediaAuthor: playerArtist.split(" • ")[0],
                appName: "Audio Player",
                controls: [
                  {
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-play"><polygon points="6 3 20 12 6 21 6 3"/></svg>',
                    callbackEvent: "pausePlay",
                  },
                ],
              });
            }
            audio.on("playing", () => {
              isPlaying();
            });
            audio.on("pause", () => {
              isPaused();
            });
            if (!audio.elm.paused) {
              isPlaying();
            }
          },
          onError: function (error) {
            console.log(error);
            img.cleanup();
          },
        });
      }, 700);
      audio.elm.src = content;
      audio.elm.play();
    }

    return Root.Lib.setupReturns((m) => {
      if (typeof m === "object" && m.type && m.type === "loadFile" && m.path) {
        openFile(m.path);
      }
      if (
        typeof m === "object" &&
        m.type &&
        m.type === "mediaPlayerAction" &&
        m.command &&
        m.command === "pausePlay"
      ) {
        if (audio.elm.paused) {
          audio.elm.play();
        } else {
          audio.elm.pause();
        }
      }
    });
  },
};
