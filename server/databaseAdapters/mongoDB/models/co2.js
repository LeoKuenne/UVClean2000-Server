const mongoose = require('mongoose');

const co2 = new mongoose.Schema({
  device: { type: String, required: true },
  co2: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

const CO2Model = mongoose.model('CO2', co2);

module.exports = CO2Model;
