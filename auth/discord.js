// ...existing code...
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const User = require('../models/user');

function getDiscordAvatarUrl(profile) {
  if (profile && profile.avatar) {
    return `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`;
  }
  const disc = profile && profile.discriminator ? parseInt(profile.discriminator, 10) || 0 : 0;
  return `https://cdn.discordapp.com/embed/avatars/${disc % 5}.png`;
}

passport.use(new DiscordStrategy({
  clientID: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_SECRET,
  callbackURL: process.env.DISCORD_CALLBACK,
  scope: ['identify']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    if (!profile || !profile.id) {
      const err = new Error('Invalid Discord profile');
      console.error(err);
      return done(err, null);
    }

    const discordId = profile.id;
    const username = profile.username || `discord_${discordId}`;
    const avatar = getDiscordAvatarUrl(profile);

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