const mongoose = require('mongoose');

const tvoc = new mongoose.Schema({
  device: { type: String, required: true },
  tvoc: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

const TVOCModel = mongoose.model('TVOC', tvoc);

module.exports = TVOCModel;
