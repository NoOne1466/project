const express = require("express");
const passport = require("passport");
const {
  renderAuthPage,
  handleSuccess,
  handleError,
  handleGoogleCallback,
} = require("../controllers/googleAuthController");

const authController = require("./../controllers/authController");
const router = express.Router();

// Routes
router.get("/", renderAuthPage);
router.get("/success", handleSuccess);
router.get("/error", handleError);
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/error" }),
  authController.handleGoogleCallback
);

module.exports = router;
