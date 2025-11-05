// auth/steam.js
const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;
require('dotenv').config();

passport.use(new SteamStrategy(
  {
    returnURL: process.env.STEAM_RETURN_URL,
    realm: 'https://noble-gaming-auth.onrender.com/',
    apiKey: process.env.STEAM_API_KEY,
  },
  function (identifier, profile, done) {
    process.nextTick(function () {
      profile.identifier = identifier;
      return done(null, profile);
    });
  }
));

module.exports = passport;
