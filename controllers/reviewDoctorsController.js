const catchAsync = require("../utils/catchAsync.js");
const APIFeatures = require("../utils/apiFeatures.js");
const ReviewDoctors = require("../models/reviewDoctorsModel.js");
const factory = require("./handlerFactory.js");

exports.setDoctorUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.doctor) req.body.doctor = req.params.doctorId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getAllReviews = factory.getAll(ReviewDoctors);
exports.createNewReview = factory.createOne(ReviewDoctors);
exports.getReview = factory.getOne(ReviewDoctors);
exports.updateReview = factory.updateOne(ReviewDoctors);
exports.deleteReview = factory.deleteOne(ReviewDoctors);
