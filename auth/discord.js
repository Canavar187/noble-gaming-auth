const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;

passport.use(new DiscordStrategy({
  clientID: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  callbackURL: process.env.DISCORD_CALLBACK,
  scope: ['identify']
}, function(accessToken, refreshToken, profile, done) {
  const user = {
    id: profile.id,
    username: profile.username,
    avatar: `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`,
    provider: 'Discord'
  };
  return done(null, user);
}));
