const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;

passport.use(new SteamStrategy(
  {
    returnURL: 'http://localhost:3000/auth/steam/callback',
    realm: 'http://localhost:3000/',
    apiKey: '1E53F5CEF6A100E7BB04547D35EEF04F'
  },
  (identifier, profile, done) => {
    const user = {
      id: profile.id,
      username: profile.displayName,
      avatar: profile.photos[2].value,
      provider: 'steam'
    };
    return done(null, user);
  }
));
