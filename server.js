// ...existing code...
require('dotenv').config();

const express = require('express');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const connectDB = require('./database');
const MongoStore = require('connect-mongo');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB().catch(err => {
  console.error('MongoDB connection error', err);
  process.exit(1);
});

// Trust proxy on Render/production so cookies work behind proxy
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Session Middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'noblegaming_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 * 7
  },
  store: process.env.MONGO_URI ? MongoStore.create({ mongoUrl: process.env.MONGO_URI }) : undefined
}));

// Rate limiter for auth endpoints
const AUTH_RATE_WINDOW_MS = Number(process.env.AUTH_RATE_WINDOW_MS || 60_000);
const AUTH_RATE_MAX = Number(process.env.AUTH_RATE_MAX || 30);
const authLimiter = rateLimit({
  windowMs: AUTH_RATE_WINDOW_MS,
  max: AUTH_RATE_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/auth', authLimiter);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Load passport configuration after session
require('./auth/user');
require('./auth/discord');
require('./auth/steam');

// Simple pages / routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));

/* Discord Auth */
app.get('/auth/discord', passport.authenticate('discord', { scope: ['identify'] }));
app.get('/auth/discord/callback',
  passport.authenticate('discord', { failureRedirect: '/login' }),
  (req, res) => { res.redirect('/welcome'); });

/* Steam Auth */
app.get('/auth/steam', passport.authenticate('steam', { failureRedirect: '/login' }), (req, res) => {});
app.get('/auth/steam/callback',
  passport.authenticate('steam', { failureRedirect: '/login' }),
  (req, res) => { res.redirect('/welcome'); });
app.get('/auth/steam/return',
  passport.authenticate('steam', { failureRedirect: '/login' }),
  (req, res) => { res.redirect('/welcome'); });

/* Welcome */
app.get('/welcome', (req, res) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) return res.redirect('/login');
  const user = req.user;
  const html = `
  <!doctype html><html><head><meta charset="utf-8"/><title>Welcome</title></head><body>
  <h1>Willkommen, ${escapeHtml(user.username || 'Player')}</h1>
  <img src="${escapeHtml(user.avatar || '/default-avatar.png')}" width="96" height="96" />
  <p>Provider: ${escapeHtml(user.provider || 'unknown')}</p>
  <p><a href="/logout">Logout</a></p>
  </body></html>`;
  res.send(html);
});

/* API route */
app.get('/api/user', (req, res) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) return res.status(401).json({ authenticated: false });
  res.json({ authenticated: true, user: req.user });
});

/* Logout */
app.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) return next(err);
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.redirect('/');
    });
  });
});

/* Health & ping (BasicAuth protected if HEALTH_USER/HEALTH_PASS set) */
// maintain last known DB state to respond quickly
let lastDbState = 0;
try {
  const mongoose = require('mongoose');
  if (mongoose && mongoose.connection) {
    lastDbState = mongoose.connection.readyState || 0;
    mongoose.connection.on('connected', () => { lastDbState = 1; console.log('Mongoose connected'); });
    mongoose.connection.on('disconnected', () => { lastDbState = 0; console.log('Mongoose disconnected'); });
    mongoose.connection.on('reconnected', () => { lastDbState = 1; console.log('Mongoose reconnected'); });
    mongoose.connection.on('error', (err) => { lastDbState = 0; console.error('Mongoose error', err && err.message); });
  }
} catch (e) {
  console.error('Health init mongoose read failed', e && e.message);
}

// BasicAuth middleware for /health
function basicAuth(req, res, next) {
  const user = process.env.HEALTH_USER;
  const pass = process.env.HEALTH_PASS;
  if (!user || !pass) return next(); // not configured -> allow
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="health"');
    return res.status(401).send('Authentication required');
  }
  const encoded = auth.split(' ')[1];
  const decoded = Buffer.from(encoded, 'base64').toString('utf8');
  const [u, p] = decoded.split(':');
  if (u === user && p === pass) return next();
  res.setHeader('WWW-Authenticate', 'Basic realm="health"');
  return res.status(401).send('Invalid credentials');
}

app.get('/ping', (req, res) => res.send('pong'));

app.get('/health', basicAuth, async (req, res) => {
  const start = Date.now();
  const okFast = lastDbState === 1;

  // lightweight async DB ping with 2s timeout
  const dbCheck = new Promise(resolve => {
    try {
      const mongoose = require('mongoose');
      if (mongoose && mongoose.connection && mongoose.connection.db) {
        mongoose.connection.db.admin().ping((err, result) => {
          if (err) return resolve({ ok: false, err: err.message });
          resolve({ ok: true, result });
        });
      } else {
        resolve({ ok: false, err: 'no-connection' });
      }
    } catch (e) {
      resolve({ ok: false, err: e.message });
    }
  });

  const timeout = new Promise(resolve => setTimeout(() => resolve({ ok: false, err: 'timeout' }), 2000));
  const checkResult = await Promise.race([dbCheck, timeout]);
  const elapsed = Date.now() - start;

  // NEW: consider healthy if last known DB connection is good OR db ping succeeded.
  const healthy = (okFast || checkResult.ok);

  const body = {
    status: healthy ? 'ok' : 'fail',
    lastDbState,
    dbCheck: checkResult.ok ? 'ok' : (checkResult.err || 'fail'),
    elapsedMs: elapsed,
    timestamp: new Date().toISOString()
  };

  // log only failures or slow checks
  if (!healthy || elapsed > 1000) {
    console.warn('Health check:', body);
  } else {
    console.log('Health ok', body);
  }

  res.status(healthy ? 200 : 503).json(body);
});

/* Generic error handler */
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).send('Internal Server Error');
});

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
// ...existing code...