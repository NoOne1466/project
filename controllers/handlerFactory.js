const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const APIFeatures = require("./../utils/apiFeatures");
const Hospital = require("../models/hospitalModel");
const Doctor = require("../models/doctorModel");
const Order = require("./../models/orderModel");
// const User = require("../models/userModel");
const multer = require("multer");

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/img");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `user-${req.model.id}-${Date.now()}.${ext}`);
  },
});
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image, please upload only images", 400), false);
  }
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
exports.uploadPhoto = upload.single("photo");
exports.uploadArrayOfPhotos = upload.array("photo", 10);

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }

    // if (calculateRatings) {
    //   await calculateRatings(doc.hospital);
    // }

    res.status(204).json({
      status: "success",
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    // req.body.user = req.model.id;
    console.log("body", req.body);

    if (req.file) req.body.photo = `img/${req.file.filename}`;

    console.log("file", req.file);
    const doc = await Model.create(req.body);
    console.log("body after ", req.body);

    // console.log(req.body);

    res.status(201).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);

    if (popOptions) query = query.populate(popOptions);

    let doc = await query;

    console.log(Model.modelName);
    let newSplit = [];
    if (Model.modelName == "Doctor") {
      console.log(doc.splitAvailableSlots);
      for (const slot of doc.splitAvailableSlots) {
        const temp = await Order.findOne({
          isPaid: true,
          startTime: slot.slotTime,
          endTime: slot.endTime,
        });
        console.log("slot", temp);
        if (!temp) {
          console.log("no temp pushing");
          newSplit.push(slot);
        }
      }
    }
    // console.log("available ", newSplit);
    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        data: doc,
        onlyFreeSlots: newSplit,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // To allow for nested GET reviews on doc or user (hack)

    let filter = {};
    // if (req.params.doctorId) filter = { doctor: req.params.doctorId };
    // if (req.params.userId) filter = { user: req.params.userId };
    if (req.body.hospital) {
      filter.hospital = req.body.hospital;
    }
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    // const doc = await features.query.explain();
    const doc = await features.query;

    // SEND RESPONSE
    res.status(200).json({
      status: "success",
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });

exports.getMe = (req, res, next) => {
  console.log(req.userModel);
  if (req.userModel === "User") {
    console.log(req.userModel);
    req.params.id = req.user.id;
    // userModel;
    next();
  }
  if (req.userModel === "Doctor") {
    console.log(req.userModel);
    req.params.id = req.doctor.id;
    next();
  }
};

exports.updateMe = (Model) =>
  catchAsync(async (req, res, next) => {
    console.log(req.file);
    console.log(req.body);
    if (req.body.password || req.body.passwordConfirm) {
      // 1) Create error if user POSTs pass word data
      return next(
        new AppError(
          "This route is not for password updates. Please use /updateMyPassword.",
          400
        )
      );
    }

    // 2) Filtered out unwanted fields names that are not allowed to be updated
    const filteredBody = filterObj(
      req.body,
      "firstName",
      "lastName",
      "email",
      "availableSlots",
      "priceOfConsultationInCents",
      "location",
      "dateOfBirth",
      "phoneNumber",
      "gender",
      "speciality",
      "yearsOfExperience",
      "bio",
      "hospitals"
    );
    if (req.file) filteredBody.photo = `img/${req.file.filename}`;

    // Validate and update hospitals
    if (req.body.hospitals && Model.modelName == "Doctor") {
      console.log(req.body.hospitals);
      const hospitals = req.body.hospitals;
      const hospitalRecords = await Hospital.find({
        _id: { $in: hospitals },
      });

      if (hospitalRecords.length !== hospitals.length) {
        return next(
          new AppError(
            "One or more hospitals provided do not exist in the database",
            400
          )
        );
      }

      filteredBody.hospitals = hospitals;
    }

    // 3) Update user document
    // console.log(req.model);

    const updatedUser = await Model.findByIdAndUpdate(
      req.model.id,
      filteredBody,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedUser) {
      return next(
        new AppError(
          "The logged in user does not have permision for this route"
        )
      );
    }
    // console.log(updatedUser);

    res.status(200).json({
      status: "success",
      data: {
        user: updatedUser,
      },
    });
  });

exports.deleteMe = (Model) =>
  catchAsync(async (req, res, next) => {
    const user = await Model.findByIdAndUpdate(req.model.id, { active: false });
    if (!user) {
      return next(
        new AppError(
          "The logged in user does not have permision for this route"
        )
      );
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  });

exports.homePage = (req, res) => {
  res.send("Welcome to the homepage!");
};
