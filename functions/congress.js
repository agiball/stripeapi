const express = require("express");
const serverless = require("serverless-http");
const app = express();
const bodyParser = require("body-parser");
const router = express.Router();

const json = {
  congress: {
    classes: {
      a: {
        sections: [
          {
            name: "A1",
            tables: [
              {
                families: [
                  {
                    lastname: "Mayr",
                  },
                ],
                seats: [
                  {
                    familiy: "Mayr",
                    isBought: false,
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  },
};

router.get("/tables", async (req, res) => {
  res.send(json);
});

app.use(bodyParser.json());
app.use("/.netlify/functions/congress", router); // path must route to lambda

module.exports = app;
module.exports.handler = serverless(app);
