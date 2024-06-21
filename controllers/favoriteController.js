const Favorite = require("../models/favoriteModel");
const FavoriteHospital = require("../models/favoriteHospitalModel.js");
const AppError = require("./../utils/appError");
const factory = require("./handlerFactory.js");
const Doctor = require("../models/doctorModel.js");
const catchAsync = require("../utils/catchAsync.js");

exports.getAllFavoritesDoctors = factory.getAll(Favorite);
exports.getAllFavoritesHospitals = factory.getAll(FavoriteHospital);

const toFavoriteFunction = async (
  res,
  user,
  toFavorite,
  Model,
  modelType,
  next
) => {
  try {
    console.log("res:", res);
    console.log("user:", user);
    console.log("toFavorite:", toFavorite);
    console.log("Model:", Model);
    console.log("modelType:", modelType);

    let query = { user: user };
    if (modelType === "doctor") {
      query.doctor = toFavorite;
    } else if (modelType === "hospital") {
      query.hospital = toFavorite;
    }

    // Check if the toFavorite is already in favoritess
    const existingFavorite = await Model.findOne(query);
    console.log(existingFavorite);

    if (existingFavorite) {
      // Doctor is already in favorites, you may want to remove it or handle accordingly
      return next(
        new AppError(`This ${modelType} is already in favorites`, 400)
      );
    }

    // Add the doctor to favorites
    console.log(query);
    const favorite = await Model.create(query);

    res.status(201).json({ status: "success", data: favorite });
  } catch (error) {
    return next(new AppError(`We encountered an error ${error.message}`, 404));
  }
};

exports.addToFavorites = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  if (req.body.doctorId && req.body.hospitalId) {
    return next(new AppError("Your input data is corrupted", 400));
  }
  if (req.body.doctorId) {
    const { doctorId } = req.body;
    await toFavoriteFunction(res, userId, doctorId, Favorite, "doctor", next);
    return;
  }
  if (req.body.hospitalId) {
    const { hospitalId } = req.body;
    await toFavoriteFunction(
      res,
      userId,
      hospitalId,
      FavoriteHospital,
      "hospital",
      next
    );
    return;
  }
});

exports.removeFromFavorites = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  if (req.body.doctorId && req.body.hospitalId) {
    return next(new AppError("Your input data is corrupted", 400));
  }
  if (req.body.doctorId) {
    // Remove the doctor from favorites
    await Favorite.findOneAndDelete({
      user: userId,
      doctor: req.body.doctorId,
    });
  }
  if (req.body.hospitalId) {
    // Remove the hospital from favorites
    await FavoriteHospital.findOneAndDelete({
      user: userId,
      hospital: req.body.hospitalId,
    });
  }
  // Send the success response
  res.status(200).json({
    status: "success",
    data: "has been removed from favorites",
  });
});
