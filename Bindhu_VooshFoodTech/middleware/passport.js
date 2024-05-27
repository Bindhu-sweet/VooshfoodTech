const FacebookStrategy = require("passport-facebook").Strategy;
const dotenv = require("dotenv");
dotenv.config();

module.exports = function(passport) {
  
    passport.use(
      new FacebookStrategy(
        {
          clientID: process.env.FACEBOOK_APP_ID,
          clientSecret: process.env.FACEBOOK_APP_SECRET,
          callbackURL: "http://localhost:3100/fb/auth",
          profileFields: [ "displayName", "name", "picture","email"]
        },
        (accessToken, refreshToken, profile, cb) => {
        
          cb(null, profile);
        }
      )
    );
  
    passport.serializeUser((user, cb) => {
      cb(null, user);
    });
  
    passport.deserializeUser((user, cb) => {
      cb(null, user);
    });
  };