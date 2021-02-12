const mongoose = require('mongoose');
const AlarmStateModel = require('../../models/alarmState');

const alarmState = {
  device: '1',
  state: 'Test Error',
  lamp: 1,
};

describe('alarmState Model Test', () => {
  beforeAll(async () => {
    await mongoose.connect(`${global.__MONGO_URI__}`,
      {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
      }, (err) => {
        if (err) {
          console.error(err);
          process.exit(1);
        }
      });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('create & save alarmState successfully', async () => {
    const validAlarmState = new AlarmStateModel(alarmState);
    const savedAlarmState = await validAlarmState.save();

    expect(savedAlarmState._id).toBeDefined();
    expect(savedAlarmState.device).toBe(alarmState.device);
    expect(savedAlarmState.state).toBe(alarmState.state);
    expect(savedAlarmState.lamp).toBe(alarmState.lamp);
  });

  it('insert alarmState successfully, but the field not defined in schema should be undefined', async () => {
    alarmState.undefinedField = '';
    const alarmStateWithInvalidField = new AlarmStateModel(alarmState);
    const savedAlarmStateWithInvalidField = await alarmStateWithInvalidField.save();
    expect(savedAlarmStateWithInvalidField._id).toBeDefined();
    expect(savedAlarmStateWithInvalidField.undefinedField).toBeUndefined();
  });

  it('create alarmState without required field should failed', async () => {
    const alarmStateWithoutRequiredField = new AlarmStateModel({ name: '3' });
    let err;
    try {
      const savedAlarmStateWithoutRequiredField = await alarmStateWithoutRequiredField.save();
      error = savedAlarmStateWithoutRequiredField;
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.device).toBeDefined();
  });
});
