// ...existing code...
require('dotenv').config();
const mongoose = require('mongoose');

async function run() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI fehlt in .env');
    process.exit(1);
  }
  try {
    await mongoose.connect(uri);
    console.log('MongoDB: verbunden');
    const users = await mongoose.connection.db.collection('users').countDocuments();
    console.log('Users in collection:', users);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('DB-Verbindungsfehler:', err.message || err);
    process.exit(2);
  }
}

run();
// ...existing code...