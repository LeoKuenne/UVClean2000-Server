const mongoose = require('mongoose');

const { Schema } = mongoose;

const uvcDeviceSchema = new mongoose.Schema({
  serialnumber: {
    type: String,
    required: true,
    validate: {
      validator: (v) => /[0-9]/.test(v),
      message: (props) => `${props.value} is not a valid serialnumber!`,
    },
  },
  name: { type: String, default: 'UVCClean Gerät' },
  group: { type: Schema.Types.ObjectId, ref: 'UVCGroup' },
  engineState: { type: Boolean, default: false },
  engineLevel: { type: Number, default: 0 },
  alarmState: { type: Boolean, default: false },
  currentBodyState: { type: Schema.Types.ObjectId, ref: 'BodyState' },
  currentFanState: { type: Schema.Types.ObjectId, ref: 'FanState' },
  currentLampState: [{ type: Schema.Types.ObjectId, ref: 'AlarmState' }],
  currentLampValue: [{ type: Schema.Types.ObjectId, ref: 'LampValue' }],
  identifyMode: { type: Boolean, default: false },
  eventMode: { type: Boolean, default: false },
  tacho: { type: Schema.Types.ObjectId, ref: 'Tacho' },
  currentAirVolume: { type: Schema.Types.ObjectId, ref: 'AirVolume' },
});
const uvcDeviceModel = mongoose.model('UVCDevice', uvcDeviceSchema);

function checkAlarmState(device) {
  const lampStates = device.currentLampState.filter((state) => state.state === 'Alarm');
  if (lampStates.length !== 0
      || device.currentFanState.state === 'Alarm'
      || device.currentBodyState.state === 'Alarm') {
    return true;
  }
  return false;
}

function parseStates(propertie, subpropertie, value) {
  switch (propertie) {
    case 'name':
    case 'currentBodyState':
    case 'currentFanState':
      return { value: `${value}` };
    case 'engineState':
    case 'eventMode':
    case 'identifyMode':
      return { value: (`${value}` === 'true') };
    case 'tacho':
    case 'currentAirVolume':
    case 'engineLevel':
      return { value: parseInt(value, 10) };
    case 'currentLampState':
      return {
        value: `${value}`,
        lamp: parseInt(subpropertie, 10),
      };
    case 'currentLampValue':
      return {
        value: parseInt(value, 10),
        lamp: parseInt(subpropertie, 10),
      };
    default:
      throw new Error(`State parsing is not implemented for propertie ${propertie}`);
  }
}

module.exports = {
  checkAlarmState,
  parseStates,
  uvcDeviceModel,
};
