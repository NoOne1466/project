const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const Order = require("./../models/orderModel");

const availableSlotSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ],
    required: [true, "Please provide the day of the week"],
  },
  startTime: {
    type: String,
    required: [true, "Please provide the start time"],
  },
  endTime: {
    type: String,
    required: [true, "Please provide the end time"],
  },
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital",
    required: [true, "Please provide the hospital ID"],
  },
});

const doctorSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Please tell us your first name!"],
    },
    lastName: {
      type: String,
      required: [true, "Please tell us your last name!"],
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    photo: {
      type: String,
      default: "img/default.jpg",
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "Please confirm your password"],
      validate: {
        // This only works on CREATE and SAVE!!!
        validator: function (el) {
          return el === this.password;
        },
        message: "Passwords are not the same!",
      },
    },
    medicalId: {
      type: Number,
      required: [true, "Please provide your medical id"],
    },
    ratingsAverage: {
      type: Number,
      default: 4.0,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    availableSlots: [availableSlotSchema],
    yearsOfExperience: Number,
    location: String,
    phoneNumber: {
      type: Number,
      default: null,
    },
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ["male", "female"],
      default: null,
    },
    speciality: String,

    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetOtp: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    bio: String,
    priceOfConsultationInCents: {
      type: Number,
      default: 10000,
    },
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    chatOrders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ChatOrder",
      },
    ],
    hospitals: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hospital",
        required: [true, "Please provide the hospital(s)"],
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual populate
doctorSchema.virtual("reviews", {
  ref: "ReviewDoctors",
  foreignField: "doctor",
  localField: "_id",
});

doctorSchema.virtual("splitAvailableSlots").get(function () {
  const doctor = this;

  const getNextDayOfWeek = (day) => {
    const today = new Date();
    const resultDate = new Date(today.getTime());
    resultDate.setDate(today.getDate() + ((day + 7 - today.getDay()) % 7));
    return resultDate;
  };

  const slots = [];

  for (const slot of doctor.availableSlots) {
    const dayOfWeek = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ].indexOf(slot.day);
    const startDateTime = getNextDayOfWeek(dayOfWeek);
    const [startHour, startMinute] = slot.startTime.split(":").map(Number);
    const [endHour, endMinute] = slot.endTime.split(":").map(Number);

    startDateTime.setHours(startHour + 3, startMinute, 0, 0);
    const endDateTime = new Date(startDateTime);
    endDateTime.setHours(endHour + 3, endMinute, 0, 0);

    let currentTime = new Date(startDateTime);

    while (currentTime < endDateTime) {
      const nextSlotTime = new Date(currentTime.getTime() + 30 * 60 * 1000);
      const slotEndTime =
        nextSlotTime > endDateTime ? endDateTime : nextSlotTime;
      slots.push({
        hospital: slot.hospital,
        slotTime: new Date(currentTime),
        endTime: slotEndTime,
      });

      currentTime = nextSlotTime;
    }
  }

  return slots;
});

doctorSchema.pre("save", async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified("password")) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

doctorSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

doctorSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

doctorSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

doctorSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const otp = Math.floor(100000 + Math.random() * 900000);

  this.passwordResetOtp = crypto
    .createHash("sha256")
    .update(otp.toString())
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return otp;
};

const Doctor = mongoose.model("Doctor", doctorSchema);

module.exports = Doctor;
