const passport = require("passport");
const User = require("./../models/userModel");
const generatePassword = require("./../utils/passwordGenerator");

let userProfile;

// Google OAuth Strategy
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://corhema.onrender.com/auth/google/callback",
      // callbackURL: "http://localhost:3000/auth/google/callback",
    },
    function (accessToken, refreshToken, profile, done) {
      userProfile = profile;
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((obj, cb) => {
  cb(null, obj);
});

const renderAuthPage = (req, res) => {
  res.render("pages/auth");
};

const handleSuccess = (req, res) => {
  console.log("success");
  res.send(userProfile);
};

const handleError = (req, res) => {
  res.send("error logging in");
};

module.exports = {
  renderAuthPage,
  handleSuccess,
  handleError,
  userProfile,
};
