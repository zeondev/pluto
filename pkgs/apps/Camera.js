export default {
  name: "Camera",
  description: "Camera application. Boilerplate.",
  ver: "v1.6.2",
  type: "process",
  exec: async function (Root) {
    let wrapper;
    let cameraWindow;
    let Html = Root.Lib.html;

    console.log("Hello from camera package", Root.Lib);

    const Win = (await Root.Lib.loadLibrary("WindowSystem")).win;
    let vfs = await Root.Lib.loadLibrary("VirtualFS");
    await vfs.importFS();

    cameraWindow = new Win({
      title: "Camera",
      pid: Root.PID,
      minHeight: 200,
      minWidth: 200,
      width: 670,
      height: 470,
      onclose: () => {
        Root.Lib.onEnd();
      },
    });

    Root.Lib.setOnEnd((_) => cameraWindow.close());

    wrapper = cameraWindow.window.querySelector(".win-content");

    Html.from(wrapper).style({
      display: "flex",
      "flex-direction": "column",
      "align-items": "center",
      // "justify-content": "center",
      height: "100%",
      padding: "10px",
      "box-sizing": "border-box",
    });

    let video = new Html("video")
      .attr({ autoplay: true })
      .style({
        width: "100%",
        height: "auto",
        "aspect-ratio": "16 / 9",
        "max-width": "100%",
        "max-height": "60vh",
        "object-fit": "cover",
        "background-color": "#000",
        display: "block",
        "margin-bottom": "10px",
        "border-radius": "8px",
        overflow: "hidden",
        "clip-path": "inset(0)", // ensures cropping if overflow
      })
      .appendTo(wrapper);
    let button = new Html("button")
      .html(Root.Lib.icons.camera)
      .appendTo(wrapper);
    let canvas = new Html("canvas")
      .attr({ style: "display: none;" })
      .appendTo(wrapper);

    let stream = null;

    async function initCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1920, height: 1080 },
        });
        video.elm.srcObject = stream;
        video.elm.play();
      } catch (error) {
        console.error("Error accessing camera:", error);
        wrapper.innerHTML =
          "<p>Error: Could not access camera. Please ensure camera permissions are granted.</p>";
      }
    }

    function takePhoto() {
      if (!stream) {
        console.error("Camera not initialized");
        return;
      }

      const context = canvas.elm.getContext("2d");
      const videoEl = video.elm;

      canvas.elm.width = videoEl.videoWidth;
      canvas.elm.height = videoEl.videoHeight;

      context.drawImage(videoEl, 0, 0, canvas.elm.width, canvas.elm.height);

      canvas.elm.toBlob(
        async (blob) => {
          try {
            const arrayBuffer = await blob.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);

            const base64String = btoa(String.fromCharCode(...uint8Array));
            const dataUrl = `data:image/jpeg;base64,${base64String}`;

            const filename = `photo_${new Date()
              .toISOString()
              .replace(/[:.]/g, "-")}.jpg`;
            const path = `Root/Pictures/${filename}`;

            await vfs.writeFile(path, dataUrl);
            console.log(`Photo saved to: ${path}`);

            let x = new Html("p")
              .html(`Saved photo as ${filename}`)
              .appendTo(wrapper);

            setTimeout(() => x.cleanup(), 3000); // remove after 3 seconds
          } catch (error) {
            console.error("Error saving photo to VFS:", error);
            let x = new Html("p")
              .html(`Error saving photo: ${error.message}`)
              .appendTo(wrapper);
            setTimeout(() => x.cleanup(), 3000); // remove after 3 seconds
          }
        },
        "image/jpeg",
        0.9
      );
    }

    button.on("click", takePhoto);

    initCamera();

    cameraWindow.onclose = () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      Root.Lib.onEnd();
    };

    return Root.Lib.setupReturns((m) => {
      console.log("Camera received message: " + m);
    });
  },
};
