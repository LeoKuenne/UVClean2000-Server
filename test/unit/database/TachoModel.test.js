const mongoose = require('mongoose');
const TachoModel = require('../../../server/databaseAdapters/mongoDB/models/tacho');

const roationSpeed = {
  device: '1',
  tacho: 100,
};

describe('Tacho Model Test', () => {
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

  it('create & save tacho successfully', async () => {
    const validTacho = new TachoModel(roationSpeed);
    const savedTacho = await validTacho.save();

    expect(savedTacho._id).toBeDefined();
    expect(savedTacho.tacho).toBe(roationSpeed.tacho);
    expect(savedTacho.device).toBe(roationSpeed.device);
  });

  it('insert tacho successfully, but the field not defined in schema should be undefined', async () => {
    roationSpeed.undefinedField = '';
    const tachoWithInvalidField = new TachoModel(roationSpeed);
    const savedTachoWithInvalidField = await tachoWithInvalidField.save();
    expect(savedTachoWithInvalidField._id).toBeDefined();
    expect(savedTachoWithInvalidField.undefinedField).toBeUndefined();
  });

  it('create tacho without required field should failed', async () => {
    const tachoWithoutRequiredField = new TachoModel({ name: '3' });
    let err;
    try {
      const savedTachoWithoutRequiredField = await tachoWithoutRequiredField.save();
      error = savedTachoWithoutRequiredField;
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.tacho).toBeDefined();
  });
});
