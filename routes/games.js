const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

router.get('/list', (req, res) => {
  const gamesPath = path.join(__dirname, '..', 'data', 'games.json');
  fs.readFile(gamesPath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Spiele konnten nicht geladen werden.' });
    }
    res.json(JSON.parse(data));
  });
});

module.exports = router;
