const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;

passport.use(new SteamStrategy({
  returnURL: process.env.STEAM_CALLBACK,
  realm: process.env.STEAM_REALM,
  apiKey: process.env.STEAM_API_KEY
}, function(identifier, profile, done) {
  const user = {
    id: profile.id,
    username: profile.displayName,
    avatar: profile.photos[2].value,
    provider: 'Steam'
  };
  return done(null, user);
}));
