const express = require("express");
const reviewHospitalController = require("../controllers/reviewHospitalController");
const authController = require("../controllers/authController");

const router = express.Router({ mergeParams: true });

router.route("/").get(reviewHospitalController.getAllReviews).post(
  authController.protect,
  // authController.restrictTo("user"),
  reviewHospitalController.createReview
);

router
  .route("/:id")
  .get(reviewHospitalController.getReview)
  .patch(authController.protect, reviewHospitalController.updateReview)
  .delete(authController.protect, reviewHospitalController.deleteReview);

module.exports = router;
