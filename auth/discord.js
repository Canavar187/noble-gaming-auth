const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;

passport.use(new DiscordStrategy({
    clientID: '1017149495789764638', // Deine Discord Client-ID
    clientSecret: 'fBaI4T1VsS7VZkkO4XRM9Z3o7fOsyjIo', // Dein Discord Client Secret
    callbackURL: 'http://localhost:3000/auth/discord/callback',
    scope: ['identify']
  },
  (accessToken, refreshToken, profile, done) => {
    const user = {
      id: profile.id,
      username: profile.username,
      avatar: `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`,
      provider: 'discord'
    };
    return done(null, user);
  }
));