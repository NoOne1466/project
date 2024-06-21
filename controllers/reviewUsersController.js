const catchAsync = require("../utils/catchAsync.js");
const APIFeatures = require("../utils/apiFeatures.js");
const ReviewUsers = require("../models/reviewUsersModel.js");
const factory = require("./handlerFactory.js");

exports.setDoctorUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.user) req.body.user = req.params.userId;
  if (!req.body.doctor) req.body.doctor = req.doctor.id;
  next();
};

exports.getAllReviews = factory.getAll(ReviewUsers);
exports.createNewReview = factory.createOne(ReviewUsers);
exports.deleteReview = factory.deleteOne(ReviewUsers);

// exports.updateReview = factory.updateOne(ReviewUsers);
exports.updateReview = catchAsync(async (req, res, next) => {
  const doc = await ReviewUsers.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!doc) {
    return next(new AppError("No document found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      data: doc,
    },
  });
});
