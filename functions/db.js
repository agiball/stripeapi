"use strict";
const express = require("express");
const serverless = require("serverless-http");
const app = express();
const bodyParser = require("body-parser");

const base45 = require("base45");
const cbor = require("cbor");
const pako = require("pako");

// MONGODB
const MongoClient = require("mongodb").MongoClient;


const MONGODB_URI = `mongodb+srv://agiAdmin:${process.env.MONGO_PASS}@agiball.g14rh.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

// Once we connect to the database once, we'll store that connection and reuse it so that we don't have to connect to the database on every request.

let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  // Connect to our MongoDB database hosted on MongoDB Atlas

  const client = await MongoClient.connect(MONGODB_URI);

  // Specify which database we want to use

  const db = await client.db("main");

  cachedDb = db;

  return db;
}

const router = express.Router();
router.get("/", (req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.write("<h1>This is the api for the agiball!</h1>");
  res.end();
});

router.get("/entries", async (req, res) => {
  const db = await connectToDatabase();
  const entriesRes = await db.collection("entries").findOne();

  res.send(entriesRes);
});

router.post("/entries", async (req, res) => {
  // Insert new entry. e.g. scan ticket qr
  const db = await connectToDatabase();
  const entriesRes = await db.collection("entries").insert(req.body.entry);

  res.send(entriesRes);
});

router.get("/redirectQr/:uuid", async (req, res) => {
  console.log(req.params.uuid);
  res.redirect("https://google.at");
});

app.use(bodyParser.json());
app.use("/.netlify/functions/db", router); // path must route to lambda

module.exports = app;
module.exports.handler = serverless(app);
