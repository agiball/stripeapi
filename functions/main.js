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
  res.write("<h1>This is the api for the agiball!</h1>");
  res.end();
});

router.get("/redirectQr/:uuid", async (req, res) => {
  console.log(req.params.uuid);
  res.redirect("https://google.at");
});

app.use(bodyParser.json());
app.use("/.netlify/functions/main", router); // path must route to lambda

module.exports = app;
module.exports.handler = serverless(app);


