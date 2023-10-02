let mongoose = require("mongoose");
let uniqueValidator = require("mongoose-unique-validator");
let crypto = require("crypto");
let jwt = require("jsonwebtoken");
let secret = require("../config").secret;
let backend = require("../config").backend;
const slug = require("slug");
const mongoosePaginate = require("mongoose-paginate-v2");
const faker = require("faker");

let UserSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, required: true },
    name: {
      type: String,
    },

    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },

    slug: {
      type: String,
      unique: true,
      required: true,
    },

    hash: { type: String, default: null },
    salt: String,
    isOtpVerified: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

UserSchema.plugin(uniqueValidator, { message: "is already taken." });
UserSchema.plugin(mongoosePaginate);
UserSchema.methods.validPassword = function (password) {
  let hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, "sha512").toString("hex");
  return this.hash === hash;
};

UserSchema.pre("validate", function (next) {
  if (!this.slug) {
    this.slugify();
  }
  next();
});

UserSchema.methods.slugify = function () {
  this.slug = slug(((Math.random() * Math.pow(36, 6)) | 0).toString(36));
};

UserSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString("hex");
  this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, "sha512").toString("hex");
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

var autoPopulate = function (next) {
  next();
};

UserSchema.pre("findOne", autoPopulate);
UserSchema.pre("find", autoPopulate);

UserSchema.methods.toJSON = function () {
  return {
    _id: this._id,
    fullName: this.fullName,
    email: this.email,
  };
};

function getName(user) {}

UserSchema.methods.toAuthJSON = function () {
  return {
    token: this.generateJWT(),
    fullName: this.fullName,
    email: this.email,
  };
};

module.exports = mongoose.model("User", UserSchema);
