const Prescription = require("../models/prescriptionModel");
const User = require("../models/userModel");
const Doctor = require("../models/doctorModel");
const Appointment = require("../models/appointmentModel");
const catchAsync = require("../utils/catchAsync");
const factory = require("../controllers/handlerFactory");
const AppError = require("../utils/appError");

exports.getPrescriptionById = factory.getOne(Prescription);
exports.getAllPrescription = factory.getAll(Prescription);
exports.addPrescription = catchAsync(async (req, res, next) => {
  console.log("x");
  const { userId, medication, dosage, instructions, diagnosis, symptoms } =
    req.body;
  if (!userId || !medication || !dosage || !diagnosis || !symptoms) {
    throw new AppError("Your input data is corrupted", 400);
  }

  // console.log(req.doctor.id);
  const user = await User.findById(userId);
  // console.log(user);
  if (!user) throw new AppError("There is no user with that id", 404);
  // console.log(user.id);

  const appointment = await Appointment.findOne({
    doctor: req.doctor.id,
    user: user.id,
  });
  if (!appointment) {
    throw new AppError("The user is not related to the doctor", 404);
  }

  // console.log(appointment);
  const prescription = new Prescription({
    user: userId,
    doctor: req.doctor.id,
    diagnosis,
    symptoms,
    medication,
    dosage,
    instructions,
  });

  await prescription.save();

  res.status(201).json({
    status: "success",
    data: {
      prescription,
    },
  });
});
