const express = require("express");
const doctorController = require("../controllers/doctorController");
const authController = require("./../controllers/authController");
const Doctor = require("../models/doctorModel");
// const User = require("../models/userModel");
// const reviewDoctorsController = require("../controllers/reviewDoctorsController");
const reviewDoctorsRouter = require("./../routes/reviewDoctorsRoutes");
const factory = require("./../controllers/handlerFactory");

const router = express.Router();

router.route("/").get(
  // authController.protect,
  // authController.restrictTo("User"),
  doctorController.getAllDoctors
);
router.route("/:id").get(doctorController.getDoctor);

router.post("/signup", authController.signup(Doctor));
router.post("/login", authController.login(Doctor));
router.post("/forgotPassword", authController.forgotPassword(Doctor));
router.patch("/resetPassword", authController.resetPassword(Doctor));

// router
//   .route("/:doctorId/reviews")
//   .post(reviewDoctorsController.createNewReview);

router.use(authController.protect);
router.get(
  "/me",
  authController.protect,
  authController.restrictTo("User"),
  doctorController.getMe,
  doctorController.getDoctor
);

router.patch("/updateMyPassword", authController.updatePassword(Doctor));
router.patch("/updateMe", factory.uploadPhoto, doctorController.updateMe);
router.delete("/deleteMe", doctorController.deleteMe);
router.patch("/homePage", doctorController.homePage);

// .post(doctorController.createDoctor);

router
  .route("/:id")
  .patch(authController.restrictToSuperAdmin, doctorController.updateDoctor)
  .delete(authController.restrictToSuperAdmin, doctorController.deleteDoctor);

router.use("/:doctorId/reviews", reviewDoctorsRouter);

module.exports = router;
