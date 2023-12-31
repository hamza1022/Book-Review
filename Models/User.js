let mongoose = require("mongoose");
let uniqueValidator = require("mongoose-unique-validator");
let crypto = require("crypto");
let jwt = require("jsonwebtoken");
const mongoosePaginate = require("mongoose-paginate-v2");
const { publicPics, secret } = require("../config");

let UserSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, required: true },
    name: { type: String },
    hash: { type: String, default: null },
    salt: String,
  },
  { timestamps: true }
);

UserSchema.plugin(uniqueValidator, { message: "Taken" });
UserSchema.plugin(mongoosePaginate);

UserSchema.methods.validPassword = function (password) {
  let hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, "sha512").toString("hex");
  return this.hash === hash;
};

UserSchema.methods.setOTP = function () {
  this.otp = Math.floor(1000 + Math.random() * 9000);
  this.otpExpires = Date.now() + 3600000; // 1 hour
};
UserSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString("hex");
  this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, "sha512").toString("hex");
};

UserSchema.methods.generatePasswordRestToken = function () {
  this.resetPasswordToken = crypto.randomBytes(20).toString("hex");
};

UserSchema.methods.generateMailToken = function () {
  this.mailToken = crypto.randomBytes(10).toString("hex");
};

UserSchema.methods.generateJWT = function () {
  let today = new Date();
  let exp = new Date(today);
  exp.setDate(today.getDate() + 60);

  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      exp: parseInt(exp.getTime() / 1000),
    },
    secret
  );
};

const autoPopulate = function (next) {
  next();
};

UserSchema.pre("findOne", autoPopulate);
UserSchema.pre("find", autoPopulate);

UserSchema.methods.toAuthJSON = function () {
  return {
    _id: this._id,
    email: this.email,
    name: this.name,
    token: this.generateJWT(),
  };
};

UserSchema.methods.toJSON = function () {
  return {
    _id: this._id,
    email: this.email,
    name: this.name,
  };
};

module.exports = mongoose.model("User", UserSchema);
