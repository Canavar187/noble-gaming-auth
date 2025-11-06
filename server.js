// ...existing code...
require('dotenv').config();

const express = require('express');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const connectDB = require('./database');
const MongoStore = require('connect-mongo');

const app = express();
const PORT = process.env.PORT || 3000;

// DB verbinden
connectDB().catch(err => {
  console.error('MongoDB connection error', err);
  process.exit(1);
});

// Trust proxy on render/production so cookies work behind proxy
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Session Middleware (use Mongo session store for persistence)
app.use(session({
  secret: process.env.SESSION_SECRET || 'noblegaming_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  },
  store: process.env.MONGO_URI ? MongoStore.create({ mongoUrl: process.env.MONGO_URI }) : undefined
}));

// Passport init (serialize/deserialize defined in auth/user.js)
app.use(passport.initialize());
app.use(passport.session());

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Load passport serialization and strategies AFTER session & passport init
require('./auth/user');      // defines passport.serializeUser / deserializeUser
require('./auth/discord');   // registers 'discord' strategy
require('./auth/steam');     // registers 'steam' strategy

// Routes
app.get('/', (req, res) => {
  // Serve login or index based on presence of public/index.html
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

/* Discord Auth */
app.get('/auth/discord', passport.authenticate('discord', { scope: ['identify'] }));
app.get('/auth/discord/callback',
  passport.authenticate('discord', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/welcome');
  });

/* Steam Auth */
// Note: passport-steam expects callback route to match returnURL in strategy
app.get('/auth/steam', passport.authenticate('steam', { failureRedirect: '/login' }), (req, res) => {
  // steam uses a redirect, not reached normally
});

// Alias: accept both /auth/steam/callback and /auth/steam/return
app.get('/auth/steam/callback',
  passport.authenticate('steam', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/welcome');
  });

app.get('/auth/steam/return',
  passport.authenticate('steam', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/welcome');
  });

/* Welcome route (dynamic server-side, simple template) */
app.get('/welcome', (req, res) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.redirect('/login');
  }
  const user = req.user;
  const html = `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>Welcome - Noble Gaming</title>
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <style>
        body{font-family:Arial,Helvetica,sans-serif;background:#0b0b0f;color:#eee;display:flex;align-items:center;justify-content:center;height:100vh;margin:0}
        .card{background:#121217;padding:24px;border-radius:8px;box-shadow:0 6px 18px rgba(0,0,0,.5);max-width:720px;width:100%}
        .avatar{width:96px;height:96px;border-radius:50%;object-fit:cover}
      </style>
    </head>
    <body>
      <div class="card">
        <h1>Willkommen, ${escapeHtml(user.username || 'Player')}</h1>
        <img src="${escapeHtml(user.avatar || '/default-avatar.png')}" alt="avatar" class="avatar" />
        <p>Provider: ${escapeHtml(user.provider || 'unknown')}</p>
        <p><strong>ID:</strong> ${escapeHtml(user.discordId || user.steamId || user._id)}</p>
        <p><a href="/logout">Logout</a></p>
      </div>
    </body>
  </html>`;
  res.send(html);
});

app.get('/api/user', (req, res) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) return res.status(401).json({ authenticated: false });
  res.json({ authenticated: true, user: req.user });
});

app.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) return next(err);
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.redirect('/');
    });
  });
});

// Generic error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).send('Internal Server Error');
});

// simple html escape to avoid injection
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
// ...existing code...