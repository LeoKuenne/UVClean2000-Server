const mongoose = require('mongoose');
const UVCDeviceModel = require('../../models/device');

const deviceData = {
  _id: '1',
  name: 'Device 1',
  state: true,
  engineLevel: 1,
  currentAlarm: [],
  identifyMode: false,
  eventMode: false,
  rotationSpeed: 100,
  airVolume: 200,
};

describe('UVCDevice Model Test', () => {
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
    const validUVCDevice = new UVCDeviceModel(deviceData);
    const savedUVCDevice = await validUVCDevice.save();

    expect(savedUVCDevice._id).toBeDefined();
    expect(savedUVCDevice._id).toBe(deviceData._id);
    expect(savedUVCDevice.name).toBe(deviceData.name);
    expect(savedUVCDevice.state).toBe(deviceData.state);
    expect(savedUVCDevice.engineLevel).toBe(deviceData.engineLevel);
    expect(savedUVCDevice.currentAlarm).toBeDefined();
    expect(savedUVCDevice.identifyMode).toBe(deviceData.identifyMode);
    expect(savedUVCDevice.eventMode).toBe(deviceData.eventMode);
    expect(savedUVCDevice.rotationSpeed).toBe(deviceData.rotationSpeed);
    expect(savedUVCDevice.airVolume).toBeUndefined();
  });

  it('create & save device successfully without all paramters', async () => {
    const device = {
      _id: '2',
      name: 'Device 1',
    };

    const validUVCDevice = new UVCDeviceModel(device);
    const savedUVCDevice = await validUVCDevice.save();

    expect(savedUVCDevice._id).toBeDefined();
    expect(savedUVCDevice._id).toBe(device._id);
    expect(savedUVCDevice.name).toBe(device.name);
    expect(savedUVCDevice.state).toBe(true);
    expect(savedUVCDevice.engineLevel).toBe(0);
    expect(savedUVCDevice.currentAlarm).toBeDefined();
    expect(savedUVCDevice.identifyMode).toBe(false);
    expect(savedUVCDevice.eventMode).toBe(false);
    expect(savedUVCDevice.rotationSpeed).toBe(0);
    expect(savedUVCDevice.currentAirVolume).toBeDefined();
  });

  it('insert device successfully, but the field not defined in schema should be undefined', async () => {
    deviceData._id = '3';
    deviceData.undefinedField = '';
    const deviceWithInvalidField = new UVCDeviceModel(deviceData);
    const savedDeviceWithInvalidField = await deviceWithInvalidField.save();
    expect(savedDeviceWithInvalidField._id).toBeDefined();
    expect(savedDeviceWithInvalidField._id).toBe(deviceData._id);
    expect(savedDeviceWithInvalidField.undefinedField).toBeUndefined();
  });

  it('create device without required field should failed', async () => {
    const deviceWithoutRequiredField = new UVCDeviceModel({ name: '3' });
    let err;
    try {
      const savedDeviceWithoutRequiredField = await deviceWithoutRequiredField.save();
      error = savedDeviceWithoutRequiredField;
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors._id).toBeDefined();
  });
});
