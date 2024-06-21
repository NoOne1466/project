const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital",
    required: true,
  },
  priceInCents: { type: Number, required: true },
  isPaid: { type: Boolean, required: true, default: false },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  paidAt: { type: Date },
  refundedAt: { type: Date },
  orderId: { type: String },
  transactionId: { type: String },
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
