const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get('/steam', passport.authenticate('steam'));
router.get('/steam/callback',
  passport.authenticate('steam', { failureRedirect: '/login.html' }),
  (req, res) => res.redirect('/welcome.html')
);

router.get('/discord', passport.authenticate('discord'));
router.get('/discord/callback',
  passport.authenticate('discord', { failureRedirect: '/login.html' }),
  (req, res) => res.redirect('/welcome.html')
);

router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/login.html');
  });
});

module.exports = router;
