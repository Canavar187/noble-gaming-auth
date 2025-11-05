const express = require('express');
const router = express.Router();
const Match = require('../models/match');

// Neues Match speichern
router.post('/', async (req, res) => {
    const match = new Match(req.body);
    await match.save();
    res.send({ message: 'Match gespeichert', match });
});

// Alle Matches abrufen
router.get('/', async (req, res) => {
    const matches = await Match.find();
    res.send(matches);
});

module.exports = router;
