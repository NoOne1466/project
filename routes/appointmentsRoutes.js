const express = require("express");
const appointmentController = require("../controllers/appointmentController");
const orderController = require("./../controllers/orderController");
const authController = require("./../controllers/authController");

const router = express.Router();

// router.use(authController.protect);

router.use(authController.protect);
router.route("/").get(appointmentController.getAllAppointments);
// .post(appointmentController.bookAppointment);

router
  .route("/:id")
  .patch(
    authController.protect,
    appointmentController.cancelAppointment,
    orderController.refund
  );

router
  .route("/getbyid/:id")
  .post(
    authController.protect,
    authController.restrictTo("User"),
    appointmentController.updateAppointmentStatus
  )
  // .delete(appointmentController.cancelAppointment)
  .get(appointmentController.getappointmentById);

router
  .route("/getCurrentAppointmentsForDoctor")
  .get(appointmentController.getCurrentDoctorAppointment);

router
  .route("/getCurrentAppointmentsForUser")
  .get(appointmentController.getCurrentUserAppointment);

module.exports = router;
