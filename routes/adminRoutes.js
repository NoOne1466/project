const express = require("express");
const adminController = require("../controllers/adminController");
const authController = require("./../controllers/authController");
const Admin = require("../models/adminModel");
const router = express.Router();

router
  .route("/")
  .get(
    authController.protect,
    authController.restrictTo("User"),
    authController.restrictTo("Doctor"),
    adminController.getAllAdmins
  );

router.post("/signup", authController.signup(Admin));
router.post("/login", authController.login(Admin));
router.post("/forgotPassword", authController.forgotPassword(Admin));
router.patch("/resetPassword", authController.resetPassword(Admin));

// router
//   .route("/:adminId/reviews")
//   .post(reviewadminsController.createNewReview);

router.use(authController.protect);

router.get(
  "/me",
  authController.restrictTo("User"),
  authController.restrictTo("Doctor"),
  adminController.getMe,
  adminController.getAdmin
);

router.patch("/updateMyPassword", authController.updatePassword(Admin));
router.patch("/updateMe", adminController.updateMe);
router.delete("/deleteMe", adminController.deleteMe);
router.patch("/homePage", adminController.homePage);

// .post(adminController.createadmin);

router
  .route("/:id")
  .get(adminController.getAdmin)
  .patch(adminController.updateAdmin)
  .delete(adminController.deleteAdmin);

module.exports = router;
