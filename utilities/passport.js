let passport = require("passport");
let mongoose = require("mongoose");
let User = mongoose.model("User");
let LocalStrategy = require("passport-local").Strategy;

const { backend, GoogleClientSecret, GoogleClientID, FacebookClientSecret, FacebookClientID, AppleKeyID, AppleClientID, AppleTeamID, LinkedInSecret, LinkedInKey } = require("../config");

passport.use(
  new LocalStrategy(
    {
      usernameField: "user[email]",
      passwordField: "user[password]",
    },
    function (email, password, done) {
      User.findOne({
        email: { $regex: new RegExp("^" + email + "$", "i") },
      })
        .then(function (user) {
          if (!user) return done(null, false, { error: "No account is associated with this email!!" });
          else if (user && !user.hash) {
          } else if (!user.validPassword(password)) return done(null, false, { error: "Invalid Credentials" });
          return done(null, user);
        })
        .catch(done);
    }
  )
);
