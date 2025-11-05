const express = require('express');
const session = require('express-session');
const passport = require('passport');
const dotenv = require('dotenv');
dotenv.config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

const app = express();

app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret',
  resave: false,
  saveUninitialized: false
}));

require('./auth/steam');
require('./auth/discord');

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(__dirname + '/views'));

app.get('/', (req, res) => {
  res.redirect('/login.html');
});

app.use('/auth', authRoutes);
app.use('/auth/user', userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ NobleGaming Auth-System läuft auf: http://localhost:${PORT}/login.html`);
});
