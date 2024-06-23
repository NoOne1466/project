const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
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
  messages: [
    {
      sender: {
        type: String,
        enum: ["user", "doctor"],
        required: true,
      },
      message: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: Date,
  read: Boolean,
  delivered: Boolean,
  sent: Boolean,
  typing: Boolean,
});

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
