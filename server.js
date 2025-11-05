const express = require('express');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ MongoDB verbinden
mongoose.connect(process.env.MONGODB_URI, {
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true
  }
}).then(() => {
  console.log("✅ MongoDB verbunden");

  // ⏬ Auth-Dateien erst nach erfolgreicher Verbindung laden!
  require('./auth/user');
  require('./auth/steam');
  require('./auth/discord');

  // ✅ Session-Konfiguration
  app.use(session({
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: false
  }));

  // ✅ Passport Middleware
  app.use(passport.initialize());
  app.use(passport.session());

  // ✅ Statische Dateien (HTML, CSS, etc.)
  app.use(express.static(path.join(__dirname, 'public')));

  // ✅ Seiten-Routen
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
  });

  app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/login.html'));
  });

  app.get('/welcome.html', (req, res) => {
    if (!req.isAuthenticated()) {
      return res.redirect('/login.html');
    }

    const user = req.user;

    res.send(`
      <h1>Willkommen, ${user.username || 'Unbekannt'}</h1>
      <p>Du bist eingeloggt über: ${user.provider || 'Unbekannt'}</p>
      <img src="${user.avatar || '#'}" alt="Profilbild" style="max-width: 150px;" />
      <br><br>
      <a href="/logout">Logout</a>
    `);
  });

  // ✅ Discord Auth
  app.get('/auth/discord', passport.authenticate('discord'));

  app.get('/auth/discord/callback',
    passport.authenticate('discord', { failureRedirect: '/login.html' }),
    (req, res) => {
      res.redirect('/welcome.html');
    }
  );

  // ✅ Steam Auth
  app.get('/auth/steam', passport.authenticate('steam', { failureRedirect: '/login.html' }));

  app.get('/auth/steam/callback',
    passport.authenticate('steam', { failureRedirect: '/login.html' }),
    (req, res) => {
      res.redirect('/welcome.html');
    }
  );

  // ✅ Logout
  app.get('/logout', (req, res) => {
    req.logout(() => {
      res.redirect('/');
    });
  });

  // ✅ Server starten
  app.listen(PORT, () => {
    console.log(`✅ NobleGaming Auth-System läuft auf: http://localhost:${PORT}/login.html`);
  });

}).catch(err => {
  console.error("❌ MongoDB Verbindungsfehler:", err);
});
