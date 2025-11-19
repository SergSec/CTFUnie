const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

async function createApp(mongoUri) {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

  // Connect to provided mongoUri
  if (mongoUri) {
    await mongoose.connect(mongoUri, { dbName: 'Afyl_test' });
  }

  // Mount routes
  app.use('/api/auth', require('../routes/auth'));
  app.use('/api/users', require('../routes/users'));
  app.use('/api/cases', require('../routes/cases'));
  app.use('/api/consultations', require('../routes/consultations'));

  // simple error handler
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: 'error', error: err.message });
  });

  return app;
}

module.exports = { createApp };
