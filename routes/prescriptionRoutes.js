const express = require("express");
const prescriptionController = require("../controllers/prescriptionController");
const authController = require("../controllers/authController");
const Prescription = require("../models/prescriptionModel");

const router = express.Router();

router.use(authController.protect);

router.get(
  "/getAllPrescriptionForCurrentPerson",
  authController.protect,
  prescriptionController.getAllPrescriptionForCurrentPerson
);

router.post(
  "/add-prescription",
  authController.protect,
  authController.restrictTo("User"),
  prescriptionController.addPrescription
);
router.get(
  "/:id",
  authController.protect,
  authController.restrictTo("User"),
  prescriptionController.getPrescriptionById
);
router.get(
  "/",
  authController.protect,
  authController.restrictTo("Doctor"),
  authController.restrictTo("User"),
  prescriptionController.getAllPrescription
);

module.exports = router;
