const express = require("express");
const reviewDoctorsController = require("../controllers/reviewDoctorsController");
const authController = require("../controllers/authController");
const ReviewDoctor = require("../models/reviewDoctorsModel");
const Doctor = require("../models/doctorModel");
const User = require("../models/userModel");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(
    // authController.protect,
    authController.restrictTo("Doctor"),
    reviewDoctorsController.getAllReviews
  )
  .post(
    authController.protect,
    authController.restrictTo("Doctor"),
    reviewDoctorsController.setDoctorUserIds,
    reviewDoctorsController.createNewReview
  );

router
  .route("/:id")
  // .get(reviewDoctorsController.getReview)
  .patch(reviewDoctorsController.updateReview)
  .delete(reviewDoctorsController.deleteReview);

module.exports = router;
