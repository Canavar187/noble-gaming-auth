NobleGamble – Auth System (Steam & Discord)

▶ Unterstützt Login via Steam & Discord (OAuth)
▶ Basierend auf Passport.js

Setup:
1. npm install express passport passport-steam passport-discord express-session
2. Steam API-Key + Discord Daten sind im Code hinterlegt ✅
3. Erstelle die Datei server.js mit folgendem Inhalt:

const express = require('express');
const session = require('express-session');
const passport = require('passport');

require('./auth/steam');
require('./auth/discord');

const authRoutes = require('./routes/auth');

const app = express();
app.use(session({ secret: 'noblegamble_secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRoutes);
app.use(express.static(__dirname + '/views'));

app.listen(3000, () => console.log('🔐 Auth system ready on http://localhost:3000/login.html'));

4. Starte mit: node server.js
