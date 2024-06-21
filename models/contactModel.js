// models/contactModel.js

const mongoose = require("mongoose");
const validator = require("validator");

const contactSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "Please provide your first name"],
  },
  lastName: {
    type: String,
    required: [true, "Please provide your last name"],
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  phoneNumber: {
    type: String,
    required: [true, "Please provide your phone number"],
  },
  topic: {
    type: String,
    required: [true, "Please provide a topic"],
  },
  message: {
    type: String,
    required: [true, "Please provide a message"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Contact = mongoose.model("Contact", contactSchema);

module.exports = Contact;
