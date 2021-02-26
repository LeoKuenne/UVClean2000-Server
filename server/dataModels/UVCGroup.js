const mongoose = require('mongoose');

const { Schema } = mongoose;

const uvcGroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  devices: [{ type: Schema.Types.ObjectId, ref: 'UVCDevice' }],
  alarmState: { type: Boolean, default: false },
  // engineState: { type: Boolean, default: false },
  // engineLevel: { type: Number, default: 0 },
  // currentLampAlarm: [{ type: Schema.Types.ObjectId, ref: 'AlarmState' }],
  // currentLampValue: [{ type: Schema.Types.ObjectId, ref: 'LampValue' }],
  // currentAirVolume: { type: Schema.Types.ObjectId, ref: 'AirVolume' },
});
const uvcGroupModel = mongoose.model('UVCGroup', uvcGroupSchema);

function checkAlarmState(group) {
  const deviceStates = group.devices.filter((device) => device.alarmState === true);
  if (deviceStates.length !== 0) {
    return true;
  }
  return false;
}

module.exports = {
  checkAlarmState,
  uvcGroupModel,
};
