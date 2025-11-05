// server.js
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

require('./auth/steam');
require('./auth/discord');

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

const app = express();

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRoutes);
app.use('/auth/user', userRoutes);
app.use(express.static(__dirname + '/views'));

app.listen(3000, () => {
  console.log('✅ NobleGaming Auth-System läuft auf: http://localhost:3000/login.html');
});
