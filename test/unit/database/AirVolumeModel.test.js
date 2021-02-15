const mongoose = require('mongoose');
const AirVolumeModel = require('../../../server/databaseAdapters/mongoDB/models/airVolume.js');

const airVolume = {
  device: '1',
  volume: 100,
};

describe('AirVolume Model Test', () => {
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

  it('create & save device successfully', async () => {
    const validAirVolume = new AirVolumeModel(airVolume);
    const savedAirVolume = await validAirVolume.save();

    expect(savedAirVolume._id).toBeDefined();
    expect(savedAirVolume.device).toBe(airVolume.device);
    expect(savedAirVolume.volume).toBe(airVolume.volume);
  });

  it('insert device successfully, but the field not defined in schema should be undefined', async () => {
    airVolume.undefinedField = '';
    const airVolumeWithInvalidField = new AirVolumeModel(airVolume);
    const savedAirVolumeWithInvalidField = await airVolumeWithInvalidField.save();
    expect(savedAirVolumeWithInvalidField._id).toBeDefined();
    expect(savedAirVolumeWithInvalidField.undefinedField).toBeUndefined();
  });

  it('create device without required field should failed', async () => {
    const airVolumeWithoutRequiredField = new AirVolumeModel({ name: '3' });
    let err;
    try {
      const savedAirVolumeWithoutRequiredField = await airVolumeWithoutRequiredField.save();
      error = savedAirVolumeWithoutRequiredField;
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.device).toBeDefined();
  });
});
