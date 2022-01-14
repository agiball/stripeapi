'use strict';
const express = require('express');
const serverless = require('serverless-http');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser);
app.get('/updatestate', (req, res) => {
  res.send('test');
});

module.exports.handler = serverless(app);