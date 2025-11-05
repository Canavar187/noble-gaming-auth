const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
    game: String,
    map: String,
    date: Date,
    result: String,
    stats: Object,
    players: [String]
});

module.exports = mongoose.model('Match', matchSchema);
