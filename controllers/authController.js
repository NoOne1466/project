const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("./../models/userModel");
const Doctor = require("./../models/doctorModel");
const Admin = require("./../models/adminModel");
const generatePassword = require("./../utils/passwordGenerator");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const sendEmail = require("./../utils/email");
// const { appendFile } = require("fs");

const getUser = async (id, req) => {
  let user;
  // get the user/doctor and send the type of schema in req.body
  user = await User.findById(id);
  // console.log(user);

  if (user) {
    req.userModel = "User";
    req.user = user;
    return user;
  }
  user = await Doctor.findById(id);
  // console.log(user);
  if (user) {
    req.userModel = "Doctor";
    req.doctor = user;
    return user;
  }

  user = await Admin.findById(id);
  // console.log(user);
  if (user) {
    req.userModel = "Admin";
    req.admin = user;
    return user;
  }
};

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  // remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: { user },
  });
};

exports.signup = (Model) =>
  catchAsync(async (req, res, next) => {
    const newUser = await Model.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      medicalId: req.body.medicalId,
      availableSlots: req.body.availableSlots,
      hospitals: req.body.hospitals,
    });

    createSendToken(newUser, 201, res);
  });

exports.login = (Model) =>
  catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
      return next(new AppError("Please provide email and password!", 400));
    }
    // 2) Check if user exists && password is correct
    const user = await Model.findOne({ email }).select("+password");
    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError("Incorrect email or password", 401));
    }

    // 3) If everything ok, send token to client
    createSendToken(user, 200, res);
  });

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  // Check if token exists in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  // Verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Check if user or doctor still exists
  // No Need To Check
  const currentUser = await getUser(decoded.id, req);
  // console.log(currentUser);
  if (!currentUser) {
    return next(
      new AppError(
        "The user/doctor belonging to this token does no longer exist.",
        401
      )
    );
  }

  // Check if user/doctor changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        "User/Doctor recently changed password! Please log in again.",
        401
      )
    );
  }

  // Grant access to the protected route
  // req.user = currentUser;
  // console.log(decoded);
  req.model = decoded;

  next();
});

exports.restrictTo = (Model) =>
  catchAsync(async (req, res, next) => {
    if (Model === req.userModel) {
      return next(new AppError("You do not have access to this route"));
    }
    next();
  });

exports.forgotPassword = (Model) =>
  catchAsync(async (req, res, next) => {
    // 1) Get user based on POSTed email
    const user = await Model.findOne({ email: req.body.email });
    if (!user) {
      return next(new AppError("There is no user with email address.", 404));
    }
    console.log(user);
    // 2) Generate the random reset token
    const OTP = user.createPasswordResetToken();
    console.log(OTP);
    await user.save({ validateBeforeSave: false });
    console.log(user);

    // 3) Send it to user's email

    const message = `Forgot your password? Use this OTP ${OTP} to change it if you did not forgot your password, please ignore this email!`;
    console.log(message);
    try {
      await sendEmail({
        email: user.email,
        subject: "Your password reset token (valid for 10 min)",
        message,
      });

      res.status(200).json({
        status: "success",
        message: "Token sent to email!",
      });
    } catch (err) {
      console.log(err);
      user.passwordResetToken = undefined;
      user.passwordResetOtp = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(
        new AppError("There was an error sending the email. Try again later!"),
        500
      );
    }
  });

exports.resetPassword = (Model) =>
  catchAsync(async (req, res, next) => {
    // console.log(Model.modelName);
    // 1) Get user based on the token
    const hashedOTP = crypto
      .createHash("sha256")
      .update(req.body.otp)
      .digest("hex");
    // console.log(hashedOTP);
    // console.log(hashedToken);
    // console.log(Model.modelName);
    // const x = await Model.findOne({ email: "user9@safwa.com" });
    // console.log(x);

    const user = await Model.findOne({
      passwordResetOtp: hashedOTP,
      passwordResetExpires: { $gt: Date.now() },
    });

    // console.log(req.params.token);
    // console.log(x.passwordResetToken, hashedToken);
    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
      throw new AppError("Token is invalid or has expired", 400);
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetOtp = undefined;
    user.passwordResetExpires = undefined;

    // 3) Update changedPasswordAt property for the user
    await user.save();

    // 4) Log the user in, send JWT
    createSendToken(user, 200, res);
  });

exports.updatePassword = (Model) =>
  catchAsync(async (req, res, next) => {
    // 1) Get user from collection
    const user = await Model.findById(req.model.id).select("+password");

    // 2) Check if POSTed current password is correct
    if (
      !(await user.correctPassword(req.body.passwordCurrent, user.password))
    ) {
      return next(new AppError("Your current password is wrong.", 401));
    }

    // 3) If so, update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    // User.findByIdAndUpdate will NOT work as intended!

    // 4) Log user in, send JWT
    createSendToken(user, 200, res);
  });

exports.restrictToSuperAdmin = (req, res, next) => {
  // Check if the logged-in admin has the role of super-admin
  // console.log(req.user);
  // console.log(req.doctor);
  // console.log(req.admin);

  if (req.doctor || req.user || req.admin.role !== "super-admin") {
    return next(
      new AppError("You do not have permission to perform this action", 403)
    );
  }

  // If the admin is a super-admin, proceed to the next middleware or route handler
  next();
};

exports.handleGoogleCallback = async (req, res) => {
  try {
    const { given_name, family_name, email } = req.user._json;
    console.log(given_name, family_name, email);
    let user = await User.findOne({ email });

    const defaultPassword = generatePassword();
    // console.log("password", defaultPassword);

    if (!user) {
      user = await User.create({
        firstName: given_name,
        lastName: family_name,
        email,
        password: defaultPassword,
        passwordConfirm: defaultPassword,
      });
    }

    createSendToken(user, 201, res);
  } catch (error) {
    console.error(error.message);
  }
};
