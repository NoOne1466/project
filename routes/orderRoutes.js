const express = require("express");
const authController = require("../controllers/authController");
const orderController = require("../controllers/orderController");

const router = express.Router();

// router.route("/webhook").post(orderController.webhook);
router.use(authController.protect);

router.route("/").get(orderController.getAll).post(orderController.createOrder);
router.route("/me").get(orderController.getMyOrders);
router.route("/:id").post(orderController.refund);

module.exports = router;
