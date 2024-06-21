const catchAsync = require("./../utils/catchAsync");
const APIFeatures = require("./../utils/apiFeatures");
const Hospital = require("./../models/hospitalModel");
const factory = require("./handlerFactory.js");

// exports.getHospital = factory.getOne(Hospital, { path: "reviews" });
exports.getAllHospital = factory.getAll(Hospital);

// Do NOT update passwords with this!
exports.createHospital = factory.createOne(Hospital);
exports.updateHospital = factory.updateOne(Hospital);
exports.deleteHospital = factory.deleteOne(Hospital);

exports.getHospitalById = factory.getOne(Hospital);
exports.updateMe = factory.updateMe(Hospital);
exports.deleteMe = factory.deleteMe(Hospital);
// exports.getMe = factory.getMe;
