const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;

passport.use(new SteamStrategy({
  returnURL: 'http://localhost:3000/auth/steam/callback',
  realm: 'http://localhost:3000/',
  apiKey: process.env.STEAM_API_KEY
}, (identifier, profile, done) => {
  const user = {
    id: profile.id,
    username: profile.displayName,
    avatar: profile.photos[2]?.value || '',
    provider: 'Steam'
  };
  return done(null, user);
}));
