// const path = require("path");
const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
// const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const path = require("path");
const AppError = require("./utils/appError");
//const globalErrorHandler = require("./controllers/errorController");
const doctorRouter = require("./routes/doctorRoutes");
const userRouter = require("./routes/userRoutes");
const adminRouter = require("./routes/adminRoutes");

// const favoriteRouter = require("./routes/favoriteRoutes.js");
const reviewDoctorsRouter = require("./routes/reviewDoctorsRoutes");
const reviewUsersRouter = require("./routes/reviewUsersRoutes");
const reviewHospitalRouter = require("./routes/reviewHospitalRoutes");
const appointmentRouter = require("./routes/appointmentsRoutes.js");
const orderRouter = require("./routes/orderRoutes.js");
const hospitalRouter = require("./routes/hospitalRoutes.js");
const prescriptionRouter = require("./routes/prescriptionRoutes.js");
const contactRoutes = require("./routes/contactRoutes");
const googleAuthRoutes = require("./routes/googleAuthRoutes.js");
const chatRouter = require("./routes/chatRoutes");
const serviceRouter = require("./routes/serviceRoutes.js");
const webhookRouter = require("./routes/webhookRoutes.js");
// const viewRouter = require("./routes/viewRoutes");

//
const session = require("express-session");
const passport = require("passport");

//

// start express with const app
const app = express();

//
app.set("view engine", "ejs");

// Middleware
app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: "SECRET",
  })
);
app.use(passport.initialize());
app.use(passport.session());

//

app.use(express.static(path.join(__dirname, "public")));

// app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARES
// Serving static files
// app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});

app.use("/api", limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// // Prevent parameter pollution
// app.use(
//   hpp({
//     whitelist: [
//       "duration",
//       "ratingsQuantity",
//       "ratingsAverage",
//       "maxGroupSize",
//       "difficulty",
//       "price",
//     ],
//   })
// );

app.use(compression());
// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

// 3) ROUTES
// app.use("/", viewRouter);
app.head("/check", (req, res) => {
  res.status(200).send();
});
app.use("/api/v1/doctors", doctorRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/admins", adminRouter);
app.use("/api/v1/hospitals", hospitalRouter);
app.use("/api/v1/reviewsDoctors", reviewDoctorsRouter);
app.use("/api/v1/reviewsUsers", reviewUsersRouter);
app.use("/api/v1/reviews", reviewHospitalRouter);
app.use("/api/v1/appointments", appointmentRouter);
// app.use("/api/v1/favorites", favoriteRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/prescription", prescriptionRouter);
app.use("/api/v1/contact", contactRoutes);
app.use("/api/v1/chats", chatRouter);
app.use("/api/v1/service", serviceRouter);
app.use("/api/v1", webhookRouter);

app.use("/", googleAuthRoutes);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use((err, req, res, next) => {
  // console.log(err);
  res.status(err.statusCode || 500).json({
    status: err.status,
    message: err.message,
    error: err,
  });
});

module.exports = app;
