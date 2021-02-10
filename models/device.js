const mongoose = require('mongoose');

const uvcDeviceSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, default: 'UVCClean Gerät' },
  state: { type: Boolean, default: true },
  engineLevel: { type: Number, default: 0 },
  lastError: { type: String },
  identifyMode: { type: Boolean, default: false },
  eventMode: { type: Boolean, default: false },
  rotationSpeed: { type: Number, default: 0 },
  airVolume: { type: Number, default: 0 },
});

const .UVCDevice = mongoose.model('UVCDevice', this.uvcDeviceSchema);
