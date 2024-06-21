const catchAsync = require("./../utils/catchAsync");
const APIFeatures = require("./../utils/apiFeatures");
const Doctor = require("./../models/doctorModel");
const factory = require("./handlerFactory.js");

exports.getDoctor = factory.getOne(Doctor);
exports.getAllDoctors = factory.getAll(Doctor);

// Do NOT update passwords with this!
exports.updateDoctor = factory.updateOne(Doctor);
exports.deleteDoctor = factory.deleteOne(Doctor);

// exports.createDoctor = factory.createOne(Doctor);

exports.getDoctorById = factory.getOne(Doctor);
exports.updateMe = factory.updateMe(Doctor);
exports.deleteMe = factory.deleteMe(Doctor);
exports.getMe = factory.getMe;

exports.homePage = factory.homePage;
