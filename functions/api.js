const express = require('express')
const serverless = require('serverless-http')

const app = express();
const router = express.Router();

router.get('/', async (req, res) => {
  return res.send('jo');
});

app.use('/.netlify/functions/express', router);
exports.handler = serverless(app);