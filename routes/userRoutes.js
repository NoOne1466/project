const express = require("express");
const User = require("../models/userModel");

const userController = require("../controllers/userController");
const authController = require("./../controllers/authController");
const reviewUsersRouter = require("./../routes/reviewUsersRoutes");
const factory = require("./../controllers/handlerFactory");
const favoriteController = require("../controllers/favoriteController");
// const reviewDoctor = require("../models/reviewDoctorsModel");

const router = express.Router();
router.get("/homePage", (req, res) => {
  res.send("Welcome to the homepage!");
});

router.post("/signup", authController.signup(User));
router.post("/login", authController.login(User));
router.post("/forgotPassword", authController.forgotPassword(User));
router.patch("/resetPassword", authController.resetPassword(User));

router.use(authController.protect);
router.get(
  "/me",
  authController.restrictTo("Doctor"),
  userController.getMe,
  userController.getUser
);
router.patch("/updateMyPassword", authController.updatePassword(User));
router.patch("/udpateMe", factory.uploadPhoto, userController.updateMe);
router.delete("/deleteMe", userController.deleteMe);

router
  .route("/")
  .get(authController.protect, userController.getAllUsers)
  .post(
    authController.protect,
    authController.restrictToSuperAdmin,
    userController.createUser
  );

// router.use("/:userId/reviews", reviewUsersRouter);

router
  .route("/:id")
  .get(userController.getUser)
  .patch(
    authController.restrictToSuperAdmin,
    userController.createUser,
    userController.updateUser
  )
  .delete(
    authController.restrictToSuperAdmin,
    userController.createUser,
    userController.deleteUser
  );

// Favorites routes
router
  .route("/favorites/Doctors")
  .get(favoriteController.getAllFavoritesDoctors);
router
  .route("/favorites/add-doctor-to-favorites")
  .post(favoriteController.addToFavorites);
router
  .route("/favorites/remove-doctor-from-favorites")
  .delete(favoriteController.removeFromFavorites);

router
  .route("/favorites/hospitals")
  .get(favoriteController.getAllFavoritesHospitals);

router
  .route("/favorites/add-hospital-to-favorites")
  .post(favoriteController.addToFavorites);

router
  .route("/favorites/remove-hospital-from-favorites")
  .delete(favoriteController.removeFromFavorites);

module.exports = router;
