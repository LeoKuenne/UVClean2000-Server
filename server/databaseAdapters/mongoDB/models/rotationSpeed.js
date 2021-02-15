const mongoose = require('mongoose');

const rotationSpeed = new mongoose.Schema({
  device: { type: String, required: true },
  rotationSpeed: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

const rotationSpeedModel = mongoose.model('RotationSpeed', rotationSpeed, 'rotationSpeed');

module.exports = rotationSpeedModel;
