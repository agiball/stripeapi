"use strict";
const express = require("express");
const serverless = require("serverless-http");
const app = express();
const bodyParser = require("body-parser");

const base45 = require("base45");
const cbor = require("cbor");
const pako = require("pako");

const router = express.Router();
router.get("/", (req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.write("<h1>This is the api for the agiball jo!</h1>");
  res.end();
});

router.post("/validate", async (req, res) => {
  try {
    const decodedGreenpass = req.body.data;

    // Remove `HC1:` from the string
    const greenpassBody = decodedGreenpass.substr(4);

    // Data is Base45 encoded
    const decodedData = base45.decode(greenpassBody);

    // And zipped
    const output = pako.inflate(decodedData);

    const results = cbor.decodeAllSync(output);

    [headers1, headers2, cbor_data, signature] = results[0].value;

    const greenpassData = cbor.decodeAllSync(cbor_data);

    const result1 = JSON.parse(
      JSON.stringify(greenpassData[0].get(-260).get(1), null, 2)
    );
    console.log(result1);
    res.send({ result: result1 });
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
});

app.use(bodyParser.json());
app.use("/.netlify/functions/covid", router); // path must route to lambda

module.exports = app;
module.exports.handler = serverless(app);
