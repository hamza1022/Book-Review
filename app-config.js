let http = require("http"),
  sharp = require("sharp");
(path = require("path")),
  (express = require("express")),
  (bodyParser = require("body-parser")),
  (session = require("express-session")),
  (passport = require("passport")),
  (errorhandler = require("errorhandler")),
  (mongoose = require("mongoose")),
  (secret = require("./config").secret),
  (createLocaleMiddleware = require("express-locale")),
  (compression = require("compression")),
  (httpResponse = require("express-http-response"));
var cors = require("cors");

let isProduction = process.env.NODE_ENV === "production";

const { allowedOrigins, MONGODB_URI } = require("./config");

module.exports = (app) => {
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    next();
  });
  app.use(cors());
  app.use(compression());
  // Normal express config defaults
  app.use(require("morgan")("dev"));
  app.use(bodyParser.urlencoded({ extended: false, limit: "500mb" }));
  app.use(bodyParser.json({ limit: "500mb" }));
  // Get the user's locale, and set a default in case there's none
  app.use(
    createLocaleMiddleware({
      priority: ["accept-language", "default"],
      default: "en_US", // ko_KR
    })
  );

  app.use(require("method-override")());
  // console.log(__dirname);
  app.use(express.static(path.join(__dirname, "/public")));

  app.use(session({ secret: secret, cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false }));

  if (!isProduction) {
    app.use(errorhandler());
  }

  if (isProduction) {
    mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
  } else {
    mongoose
      .connect(`${MONGODB_URI}?retryWrites=false`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        // useFindAndModify: false,
        // useCreateIndex: true,
      })
      .catch((err) => {
        console.log(err);
      })
      .then(() => {
        console.log("connected to db in development environment");
      });
    mongoose.set("debug", true);
  }

  require("./models/User");
  require("./models/Book");

  // require("./utilities/passport");
  app.use(passport.initialize());

  app.use(require("./routes"));

  app.use(function (req, res, next) {
    let err = new Error("Not Found");
    err.status = 404;
    next(err);
  });

  app.use(httpResponse.Middleware);

  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      errors: {
        message: err.message,
        error: {},
      },
    });
  });
};
