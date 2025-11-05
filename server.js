require('dotenv').config();

const express = require('express');
const session = require('express-session');
const passport = require('passport');

// Session-Logik
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser((id, done) => {
  done(null, { id });
});

// Authentifizierungsstrategien laden
require('./auth/steam');
require('./auth/discord');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user'); // Falls du user.js hast

const app = express();

// Session-Konfiguration
app.use(session({
  secret: process.env.SESSION_SECRET || 'noblegaming_default_secret',
  resave: false,
  saveUninitialized: false
}));

// Middleware für Passport
app.use(passport.initialize());
app.use(passport.session());

// Routen einbinden
app.use('/auth', authRoutes);
app.use('/auth/user', userRoutes); // Optional, wenn du /auth/user nutzt

// Statische Dateien im views-Ordner ausliefern
app.use(express.static(__dirname + '/views'));

// Root-Redirect → Loginseite
app.get('/', (req, res) => {
  res.redirect('/login.html');
});

// Server starten
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ NobleGaming Auth-System läuft auf: http://localhost:${PORT}/login.html`);
});
