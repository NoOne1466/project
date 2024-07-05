const express = require("express");
const serviceController = require("../controllers/serviceController");
const authController = require("../controllers/authController");
const factory = require("../controllers/handlerFactory");
const router = express.Router();

router
  .route("/")
  .get(
    // authController.protect,
    // authController.restrictTo("User"),
    // authController.restrictTo("Doctor"),
    // authController.restrictToSuperAdmin,
    serviceController.getAllService
  )
  .post(
    authController.protect,
    authController.restrictTo("User"),
    authController.restrictTo("Doctor"),
    authController.restrictToSuperAdmin,
    factory.uploadPhoto,
    serviceController.createService
  );

router
  .route("/:id")
  .get(serviceController.getServiceWithId)
  .patch(
    authController.protect,
    authController.restrictTo("User"),
    authController.restrictTo("Doctor"),
    authController.restrictToSuperAdmin,
    factory.uploadPhoto,
    serviceController.updateService
  )
  .delete(
    authController.protect,
    authController.restrictTo("User"),
    authController.restrictTo("Doctor"),
    authController.restrictToSuperAdmin,
    serviceController.deleteService
  );

module.exports = router;
