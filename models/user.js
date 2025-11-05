const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    trustScore: { type: Number, default: 100 },
    premium: { type: Boolean, default: false }
});

module.exports = mongoose.model('User', userSchema);
