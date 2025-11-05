require('dotenv').config(); // 🌱 Lade Umgebungsvariablen

const express = require('express');
const session = require('express-session');
const passport = require('passport');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

// 🔐 Session-Logik für Passport
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  done(null, { id }); // Für MVP – später mit Datenbank erweitern
});

// Lade Strategien
require('./auth/steam');
require('./auth/discord');

const app = express();

// 💾 Session-Konfiguration
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret',
  resave: false,
  saveUninitialized: false
}));

// 🛡️ Passport initialisieren
app.use(passport.initialize());
app.use(passport.session());

// 📁 Statische HTML-Seiten aus dem Ordner "views"
app.use(express.static(__dirname + '/views'));

// 🔁 Routes registrieren
app.use('/auth', authRoutes);
app.use('/auth/user', userRoutes);

// 🌐 Server starten
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Noble Gaming Auth-System läuft auf: http://localhost:${PORT}/login.html`);
});
