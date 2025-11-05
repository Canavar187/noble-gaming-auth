// auth/steam.js
const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;
const User = require('../models/User');
require('dotenv').config();

// Steam-Strategie
passport.use(new SteamStrategy({
  returnURL: process.env.STEAM_RETURN_URL,
  realm: 'https://noble-gaming-auth.onrender.com/',
  apiKey: process.env.STEAM_API_KEY
}, async (identifier, profile, done) => {
  try {
    // Überprüfen, ob Nutzer bereits in der Datenbank existiert
    let user = await User.findOne({ steamId: profile.id });

    // Wenn nicht vorhanden, neu anlegen
    if (!user) {
      user = await User.create({
        steamId: profile.id,
        username: profile.displayName,
        avatar: profile.photos && profile.photos.length > 0 ? profile.photos[2]?.value || profile.photos[0].value : null,
        provider: 'Steam'
      });
    }

    return done(null, user);
  } catch (err) {
    console.error('Fehler bei Steam-Login:', err);
    return done(err, null);
  }
}));

// Benutzer-Session speichern
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Benutzer-Session laden
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
