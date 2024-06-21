const mongoose = require("mongoose");

const chatOrderSchema = new mongoose.Schema({
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
  priceInCents: { type: Number, required: true },
  isPaid: { type: Boolean, required: true, default: false },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  paidAt: { type: Date },
  refundedAt: { type: Date },
  orderId: { type: String },
  transactionId: { type: String },
});

const ChatOrder = mongoose.model("ChatOrder", chatOrderSchema);

module.exports = ChatOrder;
