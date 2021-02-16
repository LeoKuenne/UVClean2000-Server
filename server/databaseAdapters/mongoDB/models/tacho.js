const mongoose = require('mongoose');

const tacho = new mongoose.Schema({
  device: { type: String, required: true },
  tacho: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

const tachoModel = mongoose.model('Tacho', tacho, 'tacho');

module.exports = tachoModel;
