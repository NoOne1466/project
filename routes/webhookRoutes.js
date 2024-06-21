const express = require("express");
const authController = require("../controllers/authController");
const orderController = require("../controllers/orderController");
const webhookController = require("../controllers/webhookController");

const router = express.Router();

router.route("/webhook").post(webhookController.webhook);

// module.exports = router;
