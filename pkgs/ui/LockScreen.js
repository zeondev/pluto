let lib;

function generateNoiseImage(width, height) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.width = width;
    canvas.height = height;

    const imageData = context.createImageData(width, height);

    for (let i = 0; i < imageData.data.length; i += 4) {
      const value = Math.floor(Math.random() * 256);

      imageData.data[i] = value; // Red channel
      imageData.data[i + 1] = value; // Green channel
      imageData.data[i + 2] = value; // Blue channel
      // imageData.data[i + 3] = 255; // Alpha channel
      const alpha = Math.min(Math.floor(value - Math.random() * 256), 4); // Calculate alpha value
      imageData.data[i + 3] = alpha; // Alpha channel
    }

    context.putImageData(imageData, 0, 0);

    canvas.toBlob((blob) => {
      const blobUrl = URL.createObjectURL(blob);
      resolve(blobUrl);
    });
  });
}

export default {
  name: "Lock Screen",
  description: "Displays a background and locks the screen",
  ver: 1, // Compatible with core v1
  type: "library",
  init: function (l) {
    lib = l;
  },
  data: {
    loader: async function () {
      let Html = lib.html;

      let time = new Html("span").class("display-heading").text("10:44");
      let date = new Html("span")
        .class("display-subheading")
        .text("Monday, May 29");
      let pastMinute;

      let image = await generateNoiseImage(screen.width, screen.height);

      function updateDate() {
        let x = new Date();
        let hours = x.getHours().toString().padStart(2, "0");
        let minutes = x.getMinutes().toString().padStart(2, "0");
        if (pastMinute === minutes) return;
        pastMinute = minutes;

        // Define the options for formatting the date
        const options = { weekday: "long", month: "long", day: "numeric" };

        // Format the date using the provided options
        const formatter = new Intl.DateTimeFormat("en-US", options);
        const parts = formatter.formatToParts(x);

        let weekday = parts.find((p) => p.type === "weekday").value;
        let month = parts.find((p) => p.type === "month").value;
        let day = parts.find((p) => p.type === "day").value;

        let timeString = `${hours}:${minutes}`;
        let dateString = `${weekday}, ${month} ${day}`;
        time.text(timeString);
        date.text(dateString);
      }

      const x = new Html("div")
        .class("blur", "col", "gap", "display-padding")
        .styleJs({ zIndex: "99999999", backgroundImage: `url(${image})` })
        .appendMany(
          new Html("div").class("col", "fc", "gap").appendMany(time, date),

          new Html("span")
            .class("mt-auto")
            .text(lib.getString("lockScreen_tapAnywhere"))
        )
        .on("click", (e) => {
          x.cleanup();
        })
        .appendTo("body");

      updateDate();

      return x;
    },
  },
};
