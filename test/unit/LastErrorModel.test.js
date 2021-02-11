const mongoose = require('mongoose');
const LastErrorModel = require('../../models/lastError');

const lastError = {
  device: '1',
  error: 'Test Error',
};

describe('lastError Model Test', () => {
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

  it('create & save lastError successfully', async () => {
    const validLastError = new LastErrorModel(lastError);
    const savedLastError = await validLastError.save();

    expect(savedLastError._id).toBeDefined();
    expect(savedLastError.device).toBe(lastError.device);
    expect(savedLastError.error).toBe(lastError.error);
  });

  it('insert lastError successfully, but the field not defined in schema should be undefined', async () => {
    lastError.undefinedField = '';
    const lastErrorWithInvalidField = new LastErrorModel(lastError);
    const savedLastErrorWithInvalidField = await lastErrorWithInvalidField.save();
    expect(savedLastErrorWithInvalidField._id).toBeDefined();
    expect(savedLastErrorWithInvalidField.undefinedField).toBeUndefined();
  });

  it('create lastError without required field should failed', async () => {
    const lastErrorWithoutRequiredField = new LastErrorModel({ name: '3' });
    let err;
    try {
      const savedLastErrorWithoutRequiredField = await lastErrorWithoutRequiredField.save();
      error = savedLastErrorWithoutRequiredField;
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.device).toBeDefined();
  });
});
