const mongoose = require('mongoose');

const airVolume = new mongoose.Schema({
  device: { type: String, required: true },
  volume: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

const airVolumeModel = mongoose.model('AirVolume', airVolume);

module.exports = airVolumeModel;
