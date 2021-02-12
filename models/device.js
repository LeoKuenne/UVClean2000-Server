const mongoose = require('mongoose');

const { Schema } = mongoose;

const uvcDeviceSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, default: 'UVCClean Gerät' },
  state: { type: Boolean, default: true },
  engineLevel: { type: Number, default: 0 },
  currentAlarm: [{ type: Schema.Types.ObjectId, ref: 'AlarmState' }],
  identifyMode: { type: Boolean, default: false },
  eventMode: { type: Boolean, default: false },
  rotationSpeed: { type: Number, default: 0 },
  currentAirVolume: { type: Number, default: 0 },
});

const uvcDeviceModel = mongoose.model('UVCDevice', uvcDeviceSchema, 'devices');

module.exports = uvcDeviceModel;
