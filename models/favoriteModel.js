const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "Favorite must belong to a user"],
  },
  doctor: {
    type: mongoose.Schema.ObjectId,
    ref: "Doctor",
    required: [true, "Favorite must belong to a doctor"],
  },
});

const Favorite = mongoose.model("Favorite", favoriteSchema);

module.exports = Favorite;
