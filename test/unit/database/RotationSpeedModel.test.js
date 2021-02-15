const mongoose = require('mongoose');
const RotationSpeedModel = require('../../../server/databaseAdapters/mongoDB/models/rotationSpeed');

const roationSpeed = {
  device: '1',
  rotationSpeed: 100,
};

describe('RotationSpeed Model Test', () => {
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

  it('create & save rotationSpeed successfully', async () => {
    const validRotationSpeed = new RotationSpeedModel(roationSpeed);
    const savedRotationSpeed = await validRotationSpeed.save();

    expect(savedRotationSpeed._id).toBeDefined();
    expect(savedRotationSpeed.rotationSpeed).toBe(roationSpeed.rotationSpeed);
    expect(savedRotationSpeed.device).toBe(roationSpeed.device);
  });

  it('insert rotationSpeed successfully, but the field not defined in schema should be undefined', async () => {
    roationSpeed.undefinedField = '';
    const rotationSpeedWithInvalidField = new RotationSpeedModel(roationSpeed);
    const savedRotationSpeedWithInvalidField = await rotationSpeedWithInvalidField.save();
    expect(savedRotationSpeedWithInvalidField._id).toBeDefined();
    expect(savedRotationSpeedWithInvalidField.undefinedField).toBeUndefined();
  });

  it('create rotationSpeed without required field should failed', async () => {
    const rotationSpeedWithoutRequiredField = new RotationSpeedModel({ name: '3' });
    let err;
    try {
      const savedRotationSpeedWithoutRequiredField = await rotationSpeedWithoutRequiredField.save();
      error = savedRotationSpeedWithoutRequiredField;
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.rotationSpeed).toBeDefined();
  });
});
