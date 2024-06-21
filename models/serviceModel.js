const mongoose = require("mongoose");
const validator = require("validator");

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please tell us the title of the service!"],
    },
    description: {
      type: String,
      required: true,
    },
    photo: {
      type: String,
      default: "img/defaultService.jpg",
    },
    moreInfo: {
      type: String,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Service = mongoose.model("Service", serviceSchema);

module.exports = Service;
