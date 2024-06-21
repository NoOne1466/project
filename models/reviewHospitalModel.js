const mongoose = require("mongoose");
const User = require("./userModel");
const Hospital = require("./hospitalModel");

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Review cannot be empty!"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    hospital: {
      type: mongoose.Schema.ObjectId,
      ref: "Hospital",
      required: [true, "Review must belong to a hospital."],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user"],
    },
    photo: String,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Add a unique constraint to ensure a user can review a hospital only once
reviewSchema.index({ user: 1, hospital: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "hospital",
    select: "name location",
  }).populate({
    path: "user",
    select: "name email",
  }); /*  */
  next();
});

reviewSchema.statics.calcAverageRatings = async function (hospitalId) {
  const stats = await this.aggregate([
    {
      $match: { hospital: hospitalId },
    },
    {
      $group: {
        _id: "$hospital",
        nRatings: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  if (stats.length > 0) {
    await Hospital.findByIdAndUpdate(hospitalId, {
      ratingsQuantity: stats[0].nRatings,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Hospital.findByIdAndUpdate(hospitalId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.0, // Default average rating
    });
  }
};

reviewSchema.post("save", function () {
  // this points to current review
  this.constructor.calcAverageRatings(this.hospital);
});

reviewSchema.post(/^findOneAnd/, async function (doc) {
  if (doc) {
    await doc.constructor.calcAverageRatings(doc.hospital._id);
  }
});

const ReviewHospitals = mongoose.model("ReviewHospitals", reviewSchema);

module.exports = ReviewHospitals;
