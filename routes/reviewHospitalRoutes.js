const express = require("express");
const reviewHospitalController = require("../controllers/reviewHospitalController");
const authController = require("../controllers/authController");
const factory = require("../controllers/handlerFactory");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(reviewHospitalController.getAllReviews)
  .post(
    authController.protect,
    factory.uploadPhoto,
    reviewHospitalController.setDoctorUserIds,
    reviewHospitalController.createReview
  );

router
  .route("/:id")
  .get(reviewHospitalController.getReview)
  .patch(reviewHospitalController.updateReview)
  .delete(reviewHospitalController.deleteReview);

module.exports = router;
