const mongoose = require('mongoose');

const { Schema } = mongoose;

const uvcGroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  devices: [{ type: Schema.Types.ObjectId, ref: 'UVCDevice' }],
  alarmState: { type: Boolean, default: false },
  engineState: { type: Boolean, default: false },
  engineStateDevicesWithOtherState: [{ type: Schema.Types.ObjectId, ref: 'UVCDevice' }],
  eventMode: { type: Boolean, default: false },
  eventModeDevicesWithOtherState: [{ type: Schema.Types.ObjectId, ref: 'UVCDevice' }],
  engineLevel: { type: Number, default: 0 },
  engineLevelDevicesWithOtherState: [{ type: Schema.Types.ObjectId, ref: 'UVCDevice' }],
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
