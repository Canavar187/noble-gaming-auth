// ...existing code...
const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;
const User = require('../models/user');

// Build a safe app URL and default return path.
// Uses RENDER_EXTERNAL_HOSTNAME or APP_URL if provided in env, otherwise falls back to known Render hostname.
const appHost = process.env.APP_URL || (`https://${process.env.RENDER_EXTERNAL_HOSTNAME || 'noble-gaming-auth.onrender.com'}`);
const appUrl = appHost.replace(/\/$/, '');
const defaultReturn = `${appUrl}/auth/steam/callback`;
// Allow explicit override via STEAM_RETURN_URL env var
const returnURL = process.env.STEAM_RETURN_URL || defaultReturn;
const realm = process.env.STEAM_REALM || appUrl;

passport.use(new SteamStrategy({
  returnURL,
  realm,
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