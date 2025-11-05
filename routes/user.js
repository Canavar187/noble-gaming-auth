const express = require('express');
const router = express.Router();

// API-Endpunkt: Aktuell eingeloggter Nutzer
router.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: 'Nicht eingeloggt' });
  }
});

module.exports = router;
