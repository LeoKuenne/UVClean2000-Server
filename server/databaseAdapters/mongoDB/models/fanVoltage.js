const mongoose = require('mongoose');

const fanVoltage = new mongoose.Schema({
  device: { type: String, required: true },
  voltage: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

const FanVoltageModel = mongoose.model('FanVoltage', fanVoltage);

module.exports = FanVoltageModel;
