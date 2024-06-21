const catchAsync = require("./../utils/catchAsync");
const APIFeatures = require("./../utils/apiFeatures");
const User = require("./../models/userModel");
const factory = require("./handlerFactory.js");

exports.getUser = factory.getOne(User); // { path: "reviews" }
exports.getAllUsers = factory.getAll(User);

// Do NOT update passwords with this!
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
exports.createUser = factory.createOne(User);
exports.updateMe = factory.updateMe(User);
exports.deleteMe = factory.deleteMe(User);
exports.getMe = factory.getMe;
exports.homePage = factory.homePage;
