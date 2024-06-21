const express = require("express");
const contactController = require("../controllers/contactController");
const authController = require("../controllers/authController");
const router = express.Router();

router
  .route("/")
  .get(
    authController.protect,
    authController.restrictTo("User"),
    authController.restrictTo("Doctor"),
    authController.restrictToSuperAdmin,
    contactController.getAllContacts
  )
  .post(contactController.createContact);

module.exports = router;
