// ...existing code...
const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI not set in environment');
  }

  // Option: kurze Server‑Selection Timeout für schnellere Fehlermeldung in Health
  const serverSelectionTimeoutMS = Number(process.env.MONGO_SERVER_TIMEOUT_MS || 5000);

  // Connect without deprecated options (no useNewUrlParser / useUnifiedTopology)
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error', err && (err.message || err));
    throw err;
  }

  // Keep simple connection state logging for other modules (server.js reads mongoose.connection)
  mongoose.connection.on('connected', () => console.log('Mongoose connected'));
  mongoose.connection.on('disconnected', () => console.log('Mongoose disconnected'));
  mongoose.connection.on('reconnected', () => console.log('Mongoose reconnected'));
  mongoose.connection.on('error', (e) => console.error('Mongoose error', e && e.message));
}

module.exports = connectDB;
// ...existing code...