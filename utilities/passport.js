let passport = require("passport");
let mongoose = require("mongoose");
let User = mongoose.model("User");
let LocalStrategy = require("passport-local").Strategy;

const { backend, GoogleClientSecret, GoogleClientID, FacebookClientSecret, FacebookClientID, AppleKeyID, AppleClientID, AppleTeamID, LinkedInSecret, LinkedInKey } = require("../config");
const { ErrorMessages } = require("../constants/CustomMessages");

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
          if (!user) return done(null, false, { error: ErrorMessages.userNotFound });
          else if (user && !user.hash) {
            if (user.googleId) return done(null, false, { error: ErrorMessages.userAlreadyRegisteredWithGoogle });
            else if (user.linkedinId) return done(null, false, { error: ErrorMessages.userAlreadyRegisteredWithLinkedIn });
            else return done(null, false, { error: ErrorMessages.userAlreadyRegisteredWithSocialLogin });
          } else if (!user.validPassword(password)) return done(null, false, { error: ErrorMessages.invalidCredentials });
          return done(null, user);
        })
        .catch(done);
    }
  )
);
