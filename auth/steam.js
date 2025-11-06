// ...existing code...
const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;
const User = require('../models/user');

passport.use(new SteamStrategy({
  returnURL: process.env.STEAM_RETURN_URL,
  realm: process.env.STEAM_REALM || process.env.STEAM_RETURN_URL || ('http://localhost:' + (process.env.PORT || 3000) + '/'),
  apiKey: process.env.STEAM_API_KEY
}, async (identifier, profile, done) => {
  try {
    if (!profile) {
      const err = new Error('Invalid Steam profile');
      console.error(err);
      return done(err, null);
    }

    // passport-steam may provide id in profile.id or profile._json.steamid
    const steamId = profile.id || (profile._json && profile._json.steamid) || null;
    const username = profile.displayName || `steam_${steamId}`;
    // profile.photos may contain multiple sizes; pick last or first
    const avatar = (profile.photos && profile.photos.length) ? (profile.photos[profile.photos.length - 1].value || profile.photos[0].value) : null;

    let user = await User.findOne({ steamId });

    if (!user) {
      user = await User.create({
        steamId,
        username,
        avatar,
        provider: 'Steam',
        profileRaw: profile
      });
      console.log(`Created Steam user ${username} (${steamId})`);
    } else {
      const needsUpdate = (user.username !== username) || (user.avatar !== avatar);
      if (needsUpdate) {
        user.username = username;
        user.avatar = avatar;
        await user.save();
        console.log(`Updated Steam user ${username} (${steamId})`);
      }
    }

    return done(null, user);
  } catch (err) {
    console.error('Steam strategy error:', err);
    return done(err, null);
  }
}));

module.exports = passport;
// ...existing code...