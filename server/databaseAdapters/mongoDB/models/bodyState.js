const mongoose = require('mongoose');

const bodyState = new mongoose.Schema({
  device: { type: String, required: true },
  state: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

const BodyStateModel = mongoose.model('BodyState', bodyState);

module.exports = BodyStateModel;
