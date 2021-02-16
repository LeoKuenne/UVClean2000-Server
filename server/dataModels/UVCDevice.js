const mongoose = require('mongoose');

const { Schema } = mongoose;

const uvcDeviceSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, default: 'UVCClean Gerät' },
  engineState: { type: Boolean, default: false },
  engineLevel: { type: Number, default: 0 },
  currentAlarm: [{ type: Schema.Types.ObjectId, ref: 'AlarmState' }],
  currentLampValue: [{ type: Schema.Types.ObjectId, ref: 'LampValue' }],
  identifyMode: { type: Boolean, default: false },
  eventMode: { type: Boolean, default: false },
  tacho: { type: Number, default: 0 },
  currentAirVolume: { type: Number, default: 0 },
});
const uvcDeviceModel = mongoose.model('UVCDevice', uvcDeviceSchema, 'devices');

function parseStates(propertie, subpropertie, value) {
  switch (propertie) {
    case 'engineState':
    case 'eventMode':
    case 'identifyMode':
      return (`${value}` === 'true');
    case 'tacho':
    case 'currentAirVolume':
    case 'engineLevel':
      return parseInt(value, 10);
    case 'alarm':
    case 'lamp':
      return {
        value: `${value}`,
        lamp: parseInt(subpropertie, 10),
      };
    default:
      // Throw error
      return {};
  }
}

module.exports = {
  parseStates,
  uvcDeviceModel,
};
