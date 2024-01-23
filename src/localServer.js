const express = require("express");
const { readFileSync } = require("fs");
const https = require("https");

let baseUrl, urls;

function init(bUrl) {
  baseUrl = bUrl;
  urls = [
    `${baseUrl}/pkgs/lib/VirtualFS.js`,
    `${baseUrl}/pkgs/lib/FileMappings.js`,
    `${baseUrl}/pkgs/services/DesktopIntegration.js`,
  ];
}

/**
 * Start a local web server for electron request proxy handling.
 */
function launch() {
  const webserver = express();

  // Create GET route to serve 'Hello World'
  webserver.get("/pluto/*", (req, res) => {
    const url = req.query.url;

    console.log("[DBG] Determined URL:", url);

    res.header("Access-Control-Allow-Origin", "*");

    doRequestWork(
      {
        url,
        headers: req.headers,
        method: req.method,
        body: req.body,
      },
      (resp = { statusCode: 200, data: "", mimeType: "", headers: "" }) => {
        if (resp.statusCode) {
          res.status(resp.statusCode);
        }

        if (resp.headers) {
          for (const key of resp.headers) {
            res.header(key, resp.headers[key]);
          }
        }

        if (resp.mimeType) {
          res.header("content-type", resp.mimeType);
        }

        if (resp.data) {
          res.send(resp.data);
          console.log("Successfully sent response for", url);
        } else {
          res.send("No data :(");
        }
      }
    );
  });

  // Activate webserver by calling .listen(port, callback);
  webserver.listen(1930, () => console.log("[LOG] Local webserver started"));
}

function doRequestWork(req, callback) {
  if (urls.includes(req.url)) {
    console.log('redirecting', req.url);
    callback({
      statusCode: 200,
      data: readFileSync(`./${req.url.replace(`${baseUrl}/`, "")}`), //__dirname + "/local.html"),
      mimeType: "application/javascript; charset=utf-8",
    });
  } else {
    const rq = https
      .request(
        req.url,
        {
          method: req.method,
          headers: req.headers,
        },
        (res) => {
          let data = [];
          res.on("data", (chunk) => {
            data.push(chunk);
          });
          res.on("end", () => {
            callback({
              statusCode: res.statusCode,
              headers: Object.assign(res.headers, {
                "x-frame-options": [""],
              }),
              data: Buffer.concat(data),
            });
          });
        }
      )
      .on("error", (err) => {
        console.log("Error: ", err.message);
      });

    if (req.method.toLowerCase() === "post") {
      rq.write(req.body);
      //   rq.write(req.uploadData[0].bytes.toString());
    }

    rq.end();
  }
}

module.exports = { init, launch };
