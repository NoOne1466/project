const ReviewHospitals = require("../models/reviewHospitalModel");
const Hospital = require("../models/hospitalModel");
const factory = require("./handlerFactory");
const catchAsync = require("./../utils/catchAsync");

exports.setDoctorUserIds = (req, res, next) => {
  // Allow nested routes
  req.body.user = req.model.id;
  console.log(req.body);
  console.log(req.model);
  next();
};

exports.getAllReviews = factory.getAll(ReviewHospitals);
// exports.getAllReviewsWithHospitalId = catchAsync(async (req, res, next) => {
//   next();
// });
exports.getReview = factory.getOne(ReviewHospitals);
exports.createReview = factory.createOne(ReviewHospitals);
exports.updateReview = factory.updateOne(ReviewHospitals);
exports.deleteReview = factory.deleteOne(ReviewHospitals);
