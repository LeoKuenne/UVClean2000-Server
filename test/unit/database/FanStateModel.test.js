const mongoose = require('mongoose');
const FanStateModel = require('../../../server/databaseAdapters/mongoDB/models/fanState');

const fanState = {
  device: '1',
  state: 'Test Error',
};

describe('fanState Model Test', () => {
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

  it('create & save fanState successfully', async () => {
    const validFanState = new FanStateModel(fanState);
    const savedFanState = await validFanState.save();

    expect(savedFanState._id).toBeDefined();
    expect(savedFanState.device).toBe(fanState.device);
    expect(savedFanState.state).toBe(fanState.state);
  });

  it('insert fanState successfully, but the field not defined in schema should be undefined', async () => {
    fanState.undefinedField = '';
    const fanStateWithInvalidField = new FanStateModel(fanState);
    const savedFanStateWithInvalidField = await fanStateWithInvalidField.save();
    expect(savedFanStateWithInvalidField._id).toBeDefined();
    expect(savedFanStateWithInvalidField.undefinedField).toBeUndefined();
  });

  it('create fanState without required field should failed', async () => {
    const fanStateWithoutRequiredField = new FanStateModel({ name: '3' });
    let err;
    try {
      const savedFanStateWithoutRequiredField = await fanStateWithoutRequiredField.save();
      error = savedFanStateWithoutRequiredField;
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.device).toBeDefined();
  });
});
