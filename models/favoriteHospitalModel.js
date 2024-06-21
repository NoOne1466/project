const mongoose = require("mongoose");

const favoriteHospitalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "Favorite must belong to a user"],
  },
  hospital: {
    type: mongoose.Schema.ObjectId,
    ref: "Hospital",
    required: [true, "Favorite must belong to a hospital"],
  },
});

const FavoriteHospital = mongoose.model(
  "FavoriteHospital",
  favoriteHospitalSchema
);

module.exports = FavoriteHospital;
