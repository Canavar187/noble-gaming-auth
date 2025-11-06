// ...existing code...
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const User = require('../models/user');

const discordCallback = process.env.DISCORD_CALLBACK || (`${process.env.APP_URL || (`https://${process.env.RENDER_EXTERNAL_HOSTNAME || 'noble-gaming-auth.onrender.com'}`)}/auth/discord/callback`);

passport.use(new DiscordStrategy({
  clientID: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_SECRET,
  callbackURL: discordCallback,
  scope: ['identify']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    if (!profile || !profile.id) {
      const err = new Error('Invalid Discord profile');
      console.error(err);
      return done(err, null);
    }

    const discordId = profile.id;
    // build display name with discriminator when available
    const username = profile.username ? (profile.discriminator ? `${profile.username}#${profile.discriminator}` : profile.username) : `discord_${discordId}`;
    // avatar URL (if available)
    const avatar = profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : null;

    let user = await User.findOne({ discordId });

    if (!user) {
      user = await User.create({
        discordId,
        username,
        avatar,
        provider: 'Discord',
        profileRaw: profile
      });
      console.log(`Created Discord user ${username} (${discordId})`);
    } else {
      const needsUpdate = (user.username !== username) || (user.avatar !== avatar);
      if (needsUpdate) {
        user.username = username;
        user.avatar = avatar;
        await user.save();
        console.log(`Updated Discord user ${username} (${discordId})`);
      }
    }

    return done(null, user);
  } catch (err) {
    console.error('Discord strategy error:', err);
    return done(err, null);
  }
}));

module.exports = passport;
// ...existing code...