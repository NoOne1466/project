const mongoose = require("mongoose");
// const User = require("./userModel");
const Doctor = require("./doctorModel");
// const { path } = require("../app");

const reviewDoctorsSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Review can not be empty!"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    doctor: {
      type: mongoose.Schema.ObjectId,
      ref: "Doctor",
      required: [true, "Review must belong to a doctor."],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Add a unique constraint to ensure a doctor can review a user only once
reviewDoctorsSchema.index({ user: 1, doctor: 1 }, { unique: true });

reviewDoctorsSchema.pre(/^find/, function (next) {
  this.populate({
    path: "doctor",
    select: "name",
  }).populate({
    path: "user",
    select: "name email",
  });
  next();
});

reviewDoctorsSchema.statics.calcAverageRatings = async function (doctorId) {
  const stats = await this.aggregate([
    {
      $match: { doctor: doctorId },
    },
    {
      $group: {
        _id: "$doctor",
        nRatings: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  // console.log(stats);

  if (stats.length > 0) {
    await Doctor.findByIdAndUpdate(doctorId, {
      ratingsQuantity: stats[0].nRatings,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Doctor.findByIdAndUpdate(doctorId, {
      ratingsQuantity: 0,
      ratingsAverage: 0,
    });
  }
};

reviewDoctorsSchema.post("save", function () {
  // this points to current review
  this.constructor.calcAverageRatings(this.doctor);
});

reviewDoctorsSchema.post(/^findOneAnd/, async function (doc) {
  if (doc && doc.constructor.calcAverageRatings) {
    await doc.constructor.calcAverageRatings(doc.doctor._id);
  }
});

const ReviewDoctors = mongoose.model("ReviewDoctors", reviewDoctorsSchema);

module.exports = ReviewDoctors;
