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
  res.write("<h1>This is the api for the agiball! Mongodb part</h1>");
  res.end();
});

/* ----- Entries ----- */
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

/* ----- Tickets ----- */
router.get("/tickets/:uuid", async (req, res) => {
  const uuid = req.params.uuid;
  const db = await connectToDatabase();
  const ticketRes = await db.collection("tickets").findOne({ uuid: uuid });

  if (ticketRes) res.send(ticketRes);
  else res.send({ success: false });
});
router.post("/tickets", async (req, res) => {
  const db = await connectToDatabase();
  const entriesRes = await db.collection("tickets").insert(req.body.ticket);

  res.send(entriesRes);
});
router.get("/ticketsByUser/:nuuid", async (req, res) => {
  const db = await connectToDatabase();
  await db
    .collection("tickets")
    .find({ nnuid: req.params.nuuid })
    .toArray(function (err, results) {
      console.log(results);
      res.send(results);
    });
});

/* ----- Partner ----- */
router.get("/partner", async (req, res) => {
  const db = await connectToDatabase();
  let partnerRes = [];
  await db
    .collection("partner")
    .find({})
    .toArray(function (err, results) {
      res.send(results);
    });
});
router.post("/partner", async (req, res) => {
  const db = await connectToDatabase();
  const partnerRes = await db.collection("partner").insert(req.body.partner);

  res.send(partnerRes);
});

/* ----- User ----- */
router.get("/user/:nuuid", async (req, res) => {
  const db = await connectToDatabase();
  const userRes = await db
    .collection("user")
    .findOne({ nuuid: req.params.nuuid });

  if (userRes) res.send(userRes);
  else res.send({ success: false });
});
router.post("/user", async (req, res) => {
  const db = await connectToDatabase();
  const userRes = await db.collection("user").insert(req.body.user);

  res.send(userRes);
});

/* ----- Ticket Qr Redirect ----- */
router.get("/redirectQr/:uuid", async (req, res) => {
  console.log(req.params.uuid);
  res.redirect("https://google.at");
});

app.use(bodyParser.json());
app.use("/.netlify/functions/db", router); // path must route to lambda

module.exports = app;
module.exports.handler = serverless(app);
