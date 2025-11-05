// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  discordId: String,
  steamId: String,
  username: String,
  avatar: String,
  provider: String
});

module.exports = mongoose.model('User', userSchema);
