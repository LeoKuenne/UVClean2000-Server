const mongoose = require('mongoose');

const lampValue = new mongoose.Schema({
  device: { type: String, required: true },
  lamp: { type: Number, required: true },
  value: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

const LampValueModel = mongoose.model('LampValue', lampValue, 'lampValues');

module.exports = LampValueModel;
