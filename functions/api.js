"use strict";
const express = require("express");
const serverless = require("serverless-http");
const app = express();
const bodyParser = require("body-parser");
const stripe = require("stripe")(process.env.STRIPE_PRIVATE);

const router = express.Router();
router.get("/", (req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.write("<h1>This is the api for the agiball!</h1>");
  res.end();
});

const BASE_URL = "https://agistripe.netlify.app";
/* create the checkout session and redirect it to the client */
router.post("/checkout", async (req, res) => {
  try {
    const order_items = [];
    for (let i = 0; i < req.body.items.length; i++) {
      order_items.push({
        price: req.body.items[i].price,
        quantity: req.body.items[i].quantity,
      });
    }
    let success_url = "";
    let cancel_url = "";
    if (req.body.platform === "web") {
      success_url = `${BASE_URL}/.netlify/functions/api/payment/success?platform=web`;
      cancel_url = `${BASE_URL}/.netlify/functions/api/payment/cancel?platform=web`;
    } else {
      success_url = `${BASE_URL}/.netlify/functions/api/payment/success`;
      cancel_url = `${BASE_URL}/.netlify/functions/api/payment/cancel`;
    }

    // TODO: CREATE Database object
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "klarna", "sofort"],
      success_url,
      cancel_url,
      line_items: order_items,
      mode: "payment",
      customer_email: req.body.costumer.email,
    });

    res.send({ sessionId: session.id });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

/* actually show the checkout page */
router.get("/web/checkout/redirect", async (req, res) => {
  const checkoutHtmlPage = (stripePublicKey, sessionId) => {
    return `<html>
      <body>
        <!-- Load Stripe.js on your website. -->
        <script src="https://js.stripe.com/v3"></script>
        <h1>Redirecting you to Checkout...</h1>
        <div id="error-message"></div>
        <script>
          (function () {
            var stripe = Stripe('${stripePublicKey}');
            window.onload = function () {
              stripe.redirectToCheckout({
                sessionId: '${sessionId}'
              })
              .then(function (result) {
                if (result.error) {
                  var displayError = document.getElementById('error-message');
                  displayError.textContent = result.error.message;
                }
              });
            };
          })();
        </script>
      </body>
    </html>`;
  };
  res.send(checkoutHtmlPage(process.env.STRIPE_PUBLIC, req.query.sessionId));
});

/* handle success and cancel */
router.get("/payment/success", (req, res) => {
  if (req.query.platform === "web") {
    const checkoutSuccessHtmlPage = `
    <html>
      <body>
        <h1>Payment Success</h1>
        <script>
          window.close();
        </script>
      </body>
    </html>`;
    res.send(checkoutSuccessHtmlPage);
  } else res.json({ success: true });
});

router.get("/payment/cancel", (req, res) => {
  if (req.query.platform === "web") {
    const checkoutCanceledHtmlPage = `
    <html>
      <body>
        <h1>Payment Canceled</h1>
        <script>
          window.close();
        </script>
      </body>
    </html>`;
    res.send(checkoutCanceledHtmlPage);
  } else res.json({ success: false });
});

/* webhook for handling actual fulfilment */
router.post("/stripe/webhook", async (req, res) => {
  try {
    const sig = req.headers["stripe-signature"];
    let event;
    event = stripe.webhooks.constructEvent(req.body, sig, stripeWebhookSecret);
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      console.log(session);
      // Fulfill the purchase...
      // TODO: UPDATE Database entry const updatedOrder = await database.updateOrderPaymentStatus(session.client_reference_id, 'paid');
    }
  } catch (err) {
    console.log(err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  res.json({ received: true });
});

app.use(bodyParser.json());
app.use("/stripe/webhook", express.raw({ type: "*/*" }));
app.use("/.netlify/functions/api", router); // path must route to lambda

module.exports = app;
module.exports.handler = serverless(app);
