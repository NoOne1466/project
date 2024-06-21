const mongoose = require("mongoose");
const validator = require("validator");

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please tell us your first name!"],
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    location: {
      type: String,
      required: [true, "Please provide the hospital location"],
    },
    ratingsAverage: {
      type: Number,
      default: 4.0,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
    },
    photo: {
      type: [String],
      default: "img/defaultHospital.jpg",
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual populate
hospitalSchema.virtual("reviews", {
  ref: "ReviewHospitals",
  foreignField: "hospital",
  localField: "_id",
});

// Calculate average ratings
hospitalSchema.statics.calcAverageRatings = async function (hospitalId) {
  const stats = await this.aggregate([
    {
      $match: { _id: hospitalId },
    },
    {
      $lookup: {
        from: "reviewhospitals",
        localField: "_id",
        foreignField: "hospital",
        as: "reviews",
      },
    },
    {
      $unwind: "$reviews",
    },
    {
      $group: {
        _id: "$_id",
        nRatings: { $sum: 1 },
        avgRating: { $avg: "$reviews.rating" },
      },
    },
  ]);

  if (stats.length > 0) {
    await this.findByIdAndUpdate(hospitalId, {
      ratingsQuantity: stats[0].nRatings,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await this.findByIdAndUpdate(hospitalId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.0, // Default average rating
    });
  }
};

const Hospital = mongoose.model("Hospital", hospitalSchema);

module.exports = Hospital;
