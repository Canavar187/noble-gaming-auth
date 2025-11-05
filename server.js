const express = require('express');
const session = require('express-session');
const passport = require('passport');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user'); // ✅ User-Routen importieren

const app = express(); // 🛠️ App-Initialisierung vor allen uses!

// Serialisierung für Sessions
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Auth-Strategien laden
require('./auth/steam');
require('./auth/discord');

// Session konfigurieren
app.use(session({
  secret: 'noblegamble_secret',
  resave: false,
  saveUninitialized: false
}));

// Passport initialisieren
app.use(passport.initialize());
app.use(passport.session());

// Auth- & User-Routen aktivieren
app.use('/auth', authRoutes);
app.use('/auth/user', userRoutes); // ✅ Muss nach `app` definiert sein

// Statische Dateien bereitstellen (z. B. login.html, welcome.html, etc.)
app.use(express.static(__dirname + '/views'));

// Server starten
app.listen(3000, () => {
  console.log('✅ NobleGamble Auth-System läuft auf: http://localhost:3000/login.html');
});
