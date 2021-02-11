const mongoose = require('mongoose');

const { Schema } = mongoose;

const uvcDeviceSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, default: 'UVCClean Gerät' },
  state: { type: Boolean, default: true },
  engineLevel: { type: Number, default: 0 },
  currentError: [{ type: Schema.Types.ObjectId, ref: 'LastError' }],
  identifyMode: { type: Boolean, default: false },
  eventMode: { type: Boolean, default: false },
  rotationSpeed: { type: Number, default: 0 },
  currentAirVolume: [{ type: Schema.Types.ObjectId, ref: 'AirVolume' }],
});

const uvcDeviceModel = mongoose.model('UVCDevice', uvcDeviceSchema, 'devices');

module.exports = uvcDeviceModel;
