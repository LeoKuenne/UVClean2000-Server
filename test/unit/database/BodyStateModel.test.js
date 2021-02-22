const mongoose = require('mongoose');
const BodyStateModel = require('../../../server/databaseAdapters/mongoDB/models/bodyState');

const bodyState = {
  device: '1',
  state: 'Test Error',
};

describe('bodyState Model Test', () => {
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

  it('create & save bodyState successfully', async () => {
    const validBodyState = new BodyStateModel(bodyState);
    const savedBodyState = await validBodyState.save();

    expect(savedBodyState._id).toBeDefined();
    expect(savedBodyState.device).toBe(bodyState.device);
    expect(savedBodyState.state).toBe(bodyState.state);
  });

  it('insert bodyState successfully, but the field not defined in schema should be undefined', async () => {
    bodyState.undefinedField = '';
    const bodyStateWithInvalidField = new BodyStateModel(bodyState);
    const savedBodyStateWithInvalidField = await bodyStateWithInvalidField.save();
    expect(savedBodyStateWithInvalidField._id).toBeDefined();
    expect(savedBodyStateWithInvalidField.undefinedField).toBeUndefined();
  });

  it('create bodyState without required field should failed', async () => {
    const bodyStateWithoutRequiredField = new BodyStateModel({ name: '3' });
    let err;
    try {
      const savedBodyStateWithoutRequiredField = await bodyStateWithoutRequiredField.save();
      error = savedBodyStateWithoutRequiredField;
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.device).toBeDefined();
  });
});
