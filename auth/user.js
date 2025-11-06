// ...existing code...
const passport = require('passport');
const User = require('../models/user');

passport.serializeUser((user, done) => {
  // store minimal info in session
  done(null, { id: user._id, provider: user.provider });
});

passport.deserializeUser(async (obj, done) => {
  try {
    if (!obj || !obj.id) return done(null, false);
    const user = await User.findById(obj.id).lean();
    if (!user) return done(null, false);
    return done(null, user);
  } catch (err) {
    console.error('DeserializeUser error:', err);
    return done(err, null);
  }
});

module.exports = passport;
// ...existing code...