const mongoose = require('mongoose');
const uvcDeviceModel = require('../../models/device.js');
const MongoDBAdapter = require('../../MongoDBAdapter.js');

let database;

it('MongoDBAdapter connects to database', async () => {
  database = new MongoDBAdapter(global.__MONGO_URI__, '');
  await database.connect();
  expect(database.db).toBeDefined();
  await database.close();
});

it.skip('MongoDBAdapter connects to wrong database and throws error', async () => {
  // ToDo: Rewrite! The test resolves as passed but the error is thrown
  // after the test suite completed.
  database = new MongoDBAdapter('mongodb://testdomain:64017', 'test');
  try {
    const r = await database.connect();
  } catch (e) {
    expect(e).toBe('MongooseServerSelectionError: getaddrinfo ENOTFOUND testdomain');
  }
});

// beforeEach(async () => {
//   await database.clearCollection('errors');
// });

describe('MongoDBAdapter Functions', () => {
  beforeAll(async () => {
    database = new MongoDBAdapter(global.__MONGO_URI__, '');
    await database.connect();
  });

  afterAll(async () => {
    await database.close();
  });

  describe('Device functions', () => {
    beforeEach(async () => {
      await database.clearCollection('devices');
    });

    it('addDevice adds a device correct and returns the object', async () => {
      const device = {
        _id: 'MongoDBAdapter_Test_1',
        name: 'Test Device 1',
      };

      const addedDevice = await database.addDevice(device);
      expect(addedDevice._id).toBe(device._id);
      expect(addedDevice.name).toBe(device.name);
    });

    it('addDevice throws an error if validation fails', async () => {
      const device = {
        name: 'Test Device 1',
      };

      await database.addDevice(device).catch((e) => {
        expect(e.toString()).toBe('ValidationError: _id: Path `_id` is required.');
      });
    });

    it('getDevice gets a device correct and returns the object', async () => {
      const device = {
        _id: 'MongoDBAdapter_Test_2',
        name: 'Test Device 1',
      };

      await database.addDevice(device);
      const returnedDevice = await database.getDevice(device._id);
      expect(returnedDevice._id).toBe(device._id);
      expect(returnedDevice.name).toBe(device.name);
    });

    it('getDevice throws error if deviceID is not string', async () => {
      await database.getDevice(null).catch((err) => {
        expect(err.toString()).toBe('Error: DeviceID has to be a string');
      });
    });

    it('getDevice throws error if device is not avalible', async () => {
      await database.getDevice('MongoDBAdapter_Test_3').catch((err) => {
        expect(err.toString()).toBe('Error: Device does not exists');
      });
    });

    it('updateDevice updates a device correct and returns the object', async () => {
      const device = {
        _id: 'MongoDBAdapter_Test_4',
        name: 'Test Device 2',
      };

      await database.addDevice(
        {
          _id: 'MongoDBAdapter_Test_4',
          name: 'Test Device 1',
        },
      );
      const updatedDevice = await database.updateDevice(device);
      expect(updatedDevice._id).toBe(device._id);
      expect(updatedDevice.name).toBe(device.name);
    });

    it('updateDevice throws error if device is not available', async () => {
      const device = {
        _id: 'MongoDBAdapter_Test_5',
        name: 'Test Device 2',
      };

      await database.updateDevice(device).catch((err) => {
        expect(err.toString()).toBe('Error: Device does not exists');
      });
    });

    it('updateDevice throws an error if validation fails', async () => {
      const device = {
        name: 'Test Device 1',
      };

      await database.updateDevice(device).catch((e) => {
        expect(e.toString()).toBe('Error: Device ID must be defined');
      });
    });

    it('deleteDevice deletes a device', async () => {
      const device = {
        _id: 'MongoDBAdapter_Test_6',
        name: 'Test Device 1',
      };

      await database.addDevice(device);
      await database.deleteDevice(device._id);
      await database.getDevice(device._id).catch((err) => {
        expect(err.toString()).toBe('Error: Device does not exists');
      });
    });

    it('deleteDevice throws error if device is not available', async () => {
      const device = {
        _id: 'MongoDBAdapter_Test_7',
        name: 'Test Device 1',
      };
      await database.deleteDevice(device._id).catch((err) => {
        expect(err.toString()).toBe('Error: Device does not exists');
      });
    });
  });

  describe('AirVolume functions', () => {
    beforeEach(async () => {
      await database.clearCollection('devices');
      await database.clearCollection('airVolume');
    });

    it('addAirVolume adds a AirVolume Document correct and returns the object', async () => {
      const airVolume = {
        device: '1',
        volume: 100,
      };

      const device = {
        _id: '1',
        name: 'Test Device 1',
      };

      await database.addDevice(device);

      const addedAirVolume = await database.addAirVolume(airVolume);
      expect(addedAirVolume.device).toBe(airVolume.device);
      expect(addedAirVolume.name).toBe(airVolume.name);

      const d = await database.getDevice(device._id);
      expect(d.currentAirVolume[0]).toStrictEqual(addedAirVolume._id);
    });

    it('addAirVolume throws an error if validation fails', async () => {
      const airVolume = {
        volume: 100,
      };

      await database.addAirVolume(airVolume).catch((e) => {
        expect(e.toString()).toBe('ValidationError: device: Path `device` is required.');
      });
    });

    it('addAirVolume throws an error if device does not exists', async () => {
      const airVolume = {
        device: '1',
        volume: 100,
      };

      await database.addAirVolume(airVolume).catch((e) => {
        expect(e.toString()).toBe('Error: Device does not exists');
      });
    });

    it('getDeviceResolved gets the device with the resolved fields (currentError and currentAirVolume) and returns the object', async () => {
      const device = {
        _id: 'MongoDBAdapter_Test_2',
        name: 'Test Device 1',
      };

      await database.addDevice(device);
      const returnedDevice = await database.getDevice(device._id);
      expect(returnedDevice._id).toBe(device._id);
      expect(returnedDevice.name).toBe(device.name);
    });
  });
});
