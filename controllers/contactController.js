const Contact = require("../models/contactModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory.js");

exports.getAllContacts = factory.getAll(Contact);
exports.createContact = factory.createOne(Contact);
