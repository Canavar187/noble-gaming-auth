const express = require('express');
const passport = require('passport');
const router = express.Router();

// ✅ Steam Auth
router.get('/steam', passport.authenticate('steam'));
router.get('/steam/callback',
  passport.authenticate('steam', { failureRedirect: '/login.html' }),
  (req, res) => {
    res.redirect('/welcome.html');
  }
);

// ✅ Discord Auth
router.get('/discord', passport.authenticate('discord', {
  scope: ['identify']
}));
router.get('/discord/callback',
  passport.authenticate('discord', { failureRedirect: '/login.html' }),
  (req, res) => {
    res.redirect('/welcome.html');
  }
);

// ❌ Diese Route gehört in eine eigene Datei (user.js), nicht hier
// router.get('/user', ... )

// ✅ Logout
router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/login.html');
  });
});

module.exports = router;
