const mongoose = require('mongoose');

const alarmState = new mongoose.Schema({
  device: { type: String, required: true },
  lamp: { type: Number, required: true },
  state: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

const AlarmStateModel = mongoose.model('AlarmState', alarmState, 'alarms');

module.exports = AlarmStateModel;
