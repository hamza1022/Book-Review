let mongoose = require("mongoose");
let router = require("express").Router();
let passport = require("passport");
let User = mongoose.model("User");
let auth = require("../auth");
let { OkResponse, BadRequestResponse, UnauthorizedResponse } = require("express-http-response");

const { backend } = require("../../config");

//get user from email address
router.param("email", (req, res, next, email) => {
  User.findOne({ email }, (err, user) => {
    if (err) return next(new BadRequestResponse(err));
    if (!user) return next(new BadRequestResponse("User not found!", 423));
    req.userToUpdate = user;
    return next();
  });
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", { session: false }, function (err, user, info) {
    if (err) return next(new BadRequestResponse(err.message));
    if (!user) return next(new BadRequestResponse(info.error, 423));
    return next(new OkResponse({ user: user.toAuthJSON() }));
  })(req, res, next);
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", { session: false }, function (err, user, info) {
    if (err) return next(new BadRequestResponse(err.message));
    if (!user) return next(new BadRequestResponse("Invalid email or password!", 423));

    return next(new OkResponse({ user: user.toAuthJSON() }));
  })(req, res, next);
});

router.post("/signup", (req, res, next) => {
  User.findOne({ email: req.body.email }, (err, res) => {
    if (err) return next(new BadRequestResponse(err));
    if (res) return next(new BadRequestResponse("User already exists", 423));

    let user = new User();
    user.email = req.body.email;
    user.name = req.body.name;
    user.setPassword(req.body.password);

    user.save((err, res) => {
      if (err) return next(new BadRequestResponse(err));

      return next(new OkResponse(user.toAuthJSON()));
    });
  });
});

module.exports = router;
