const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const passport = require("passport");
const passportConfig = require("./middleware/passport");

const expressSession = require("express-session");
const userRoute = require("./routes/user");

const app = express();
require("dotenv").config();
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  next();
});
const sessionSecret = process.env.SESSION_SECRET || "USERSESSION";
app.use(
  expressSession({
    secret: sessionSecret,
    resave: true,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

passportConfig(passport);

app.use(userRoute);
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("connected");
    app.listen(3100);
  })
  .catch((err) => {
    console.log(err);
  });
