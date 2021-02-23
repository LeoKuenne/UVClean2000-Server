const mongoose = require('mongoose');

const { Schema } = mongoose;

const uvcGroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  devices: [{ type: Schema.Types.ObjectId, ref: 'UVCDevice' }],
  // engineState: { type: Boolean, default: false },
  // engineLevel: { type: Number, default: 0 },
  // currentLampAlarm: [{ type: Schema.Types.ObjectId, ref: 'AlarmState' }],
  // currentLampValue: [{ type: Schema.Types.ObjectId, ref: 'LampValue' }],
  // currentAirVolume: { type: Schema.Types.ObjectId, ref: 'AirVolume' },
});
const uvcGroupModel = mongoose.model('UVCGroup', uvcGroupSchema);

module.exports = {
  uvcGroupModel,
};
