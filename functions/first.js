'use strict';
const express = require('express');
const serverless = require('serverless-http');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser);
app.get('/updatestate', (req, res) => {
  res.send({orderId: "100", sessionId: "a5sdf46a5sdf4"});
});

module.exports.handler = serverless(app);