const express = require("express");
const hospitalController = require("../controllers/hospitalController");
const authController = require("./../controllers/authController");
const Hospital = require("../models/hospitalModel");
const ReviewHospitals = require("../models/reviewHospitalModel");
const reviewHospitalRouter = require("./../routes/reviewHospitalRoutes");
const factory = require("./../controllers/handlerFactory");

const router = express.Router();

router
  .route("/")
  .get(hospitalController.getAllHospital)
  .post(
    authController.protect,
    authController.restrictTo("User"),
    authController.restrictTo("Doctor"),
    authController.restrictToSuperAdmin,
    factory.uploadArrayOfPhotos,
    hospitalController.createHospital
  );

router
  .route("/:id")
  .get(hospitalController.getHospitalById)
  .patch(
    authController.protect,
    authController.restrictTo("User"),
    authController.restrictTo("Doctor"),
    authController.restrictToSuperAdmin,
    factory.uploadArrayOfPhotos,
    hospitalController.updateHospital
  )
  .delete(
    authController.protect,
    authController.restrictTo("User"),
    authController.restrictTo("Doctor"),
    authController.restrictToSuperAdmin,
    hospitalController.deleteHospital
  );

router.use("/:hospitalId/reviews", reviewHospitalRouter);
module.exports = router;
