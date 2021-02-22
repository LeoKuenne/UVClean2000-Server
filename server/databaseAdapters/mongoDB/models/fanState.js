const mongoose = require('mongoose');

const fanState = new mongoose.Schema({
  device: { type: String, required: true },
  state: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

const FanStateModel = mongoose.model('FanState', fanState);

module.exports = FanStateModel;
