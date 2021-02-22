const mongoose = require('mongoose');

const { Schema } = mongoose;

const uvcDeviceSchema = new mongoose.Schema({
  _id: {
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

function parseStates(propertie, subpropertie, value) {
  switch (propertie) {
    case 'name':
    case 'currentBodyState':
    case 'currentFanState':
      return `${value}`;
    case 'engineState':
    case 'eventMode':
    case 'identifyMode':
      return (`${value}` === 'true');
    case 'tacho':
    case 'currentAirVolume':
    case 'engineLevel':
      return parseInt(value, 10);
    case 'currentLampState':
    case 'currentLampValue':
      return {
        value: `${value}`,
        lamp: parseInt(subpropertie, 10),
      };
    default:
      throw new Error(`State parsing is not implemented for propertie ${propertie}`);
  }
}

module.exports = {
  parseStates,
  uvcDeviceModel,
};
