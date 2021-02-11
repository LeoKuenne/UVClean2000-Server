const mongoose = require('mongoose');

const lastError = new mongoose.Schema({
  device: { type: String, required: true },
  error: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

const lastErrorModel = mongoose.model('LastError', lastError, 'errors');

module.exports = lastErrorModel;
