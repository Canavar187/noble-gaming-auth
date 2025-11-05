// database.js
const mongoose = require('mongoose');
require('dotenv').config();

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB verbunden');
  } catch (err) {
    console.error('❌ MongoDB Verbindung fehlgeschlagen:', err);
  }
}

module.exports = connectDB;
