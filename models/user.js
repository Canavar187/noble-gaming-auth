// ...existing code...
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  discordId: { type: String, index: true, sparse: true },
  steamId: { type: String, index: true, sparse: true },
  username: { type: String },
  avatar: { type: String },
  provider: { type: String },
  profileRaw: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
// ...existing code...