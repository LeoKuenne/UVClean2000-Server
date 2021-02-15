const mongoose = require('mongoose');
const MongoDBAdapter = require('../../server/databaseAdapters/mongoDB/MongoDBAdapter.js');

let database;

it('MongoDBAdapter connects to database', async () => {
  database = new MongoDBAdapter(global.__MONGO_URI__.replace('mongodb://', ''), '');
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
    database = new MongoDBAdapter(global.__MONGO_URI__.replace('mongodb://', ''), '');
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
        serialnumber: 'MongoDBAdapter_Test_1',
        name: 'Test Device 1',
      };

      const addedDevice = await database.addDevice(device);
      expect(addedDevice._id).toBe(device.serialnumber);
      expect(addedDevice.name).toBe(device.name);
    });

    it('addDevice throws an error if validation fails', async () => {
      const device = {
        name: 'Test Device 1',
      };

      await database.addDevice(device).catch((e) => {
        expect(e.toString()).toBe('Error: Serialnumber must be defined.');
      });
    });

    it('getDevice gets a device correct and returns the object', async () => {
      const device = {
        serialnumber: 'MongoDBAdapter_Test_2',
        name: 'Test Device 1',
      };

      await database.addDevice(device);
      const returnedDevice = await database.getDevice(device.serialnumber);
      expect(returnedDevice.serialnumber).toBe(device.serialnumber);
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

    it('getDevices gets all devices', async () => {
      await database.addDevice(
        {
          serialnumber: 'MongoDBAdapter_Test_1',
          name: 'Test Device 1',
        },
      );

      await database.addDevice(
        {
          serialnumber: 'MongoDBAdapter_Test_2',
          name: 'Test Device 2',
        },
      );

      await database.addDevice(
        {
          serialnumber: 'MongoDBAdapter_Test_3',
          name: 'Test Device 3',
        },
      );

      const dbData = await database.getDevices().catch((err) => {
        console.error(err);
      });

      for (let i = 0; i < dbData.length; i += 1) {
        expect(dbData[i].serialnumber).toBe(`MongoDBAdapter_Test_${i + 1}`);
        expect(dbData[i].name).toBe(`Test Device ${i + 1}`);
      }
    });

    it('updateDevice updates a device correct and returns the object', async () => {
      const device = {
        serialnumber: 'MongoDBAdapter_Test_4',
        name: 'Test Device 2',
      };

      await database.addDevice(
        {
          serialnumber: 'MongoDBAdapter_Test_4',
          name: 'Test Device 1',
        },
      );
      const updatedDevice = await database.updateDevice(device);
      expect(updatedDevice._id).toBe(device.serialnumber);
      expect(updatedDevice.name).toBe(device.name);
    });

    it('updateDevice throws error if device is not available', async () => {
      const device = {
        serialnumber: 'MongoDBAdapter_Test_4',
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
        expect(e.toString()).toBe('Error: Serialnumber must be defined.');
      });
    });

    it('deleteDevice deletes a device', async () => {
      const device = {
        serialnumber: 'MongoDBAdapter_Test_4',
        name: 'Test Device 1',
      };

      await database.addDevice(device);
      await database.deleteDevice(device.serialnumber);
      await database.getDevice(device.serialnumber).catch((err) => {
        expect(err.toString()).toBe('Error: Device does not exists');
      });
    });

    it('deleteDevice throws error if device is not available', async () => {
      const device = {
        serialnumber: 'MongoDBAdapter_Test_7',
        name: 'Test Device 1',
      };
      await database.deleteDevice(device.serialnumber).catch((err) => {
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
        device: 'TestDevice',
        volume: 10,
      };

      const device = {
        serialnumber: 'TestDevice',
        name: 'Test Device 1',
      };

      await database.addDevice(device);

      const addedAirVolume = await database.addAirVolume(airVolume);
      expect(addedAirVolume.device).toBe(airVolume.device);
      expect(addedAirVolume.volume).toBe(airVolume.volume);

      const d = await database.getDevice(device.serialnumber);
      expect(d.currentAirVolume).toBe(airVolume.volume);
    });

    it('addAirVolume throws an error if validation fails', async () => {
      const airVolume = {
        volume: 20,
      };

      await database.addAirVolume(airVolume).catch((e) => {
        expect(e.toString()).toBe('ValidationError: device: Path `device` is required.');
      });
    });

    it('addAirVolume throws an error if device does not exists', async () => {
      const airVolume = {
        device: 'TestDevice',
        volume: 50,
      };

      await database.addAirVolume(airVolume).catch((e) => {
        expect(e.toString()).toBe('Error: Device does not exists');
      });
    });

    it('getAirVolumes gets all AirVolumes of one device', async () => {
      const device = {
        serialnumber: 'TestDevice',
        name: 'Test Device 1',
      };

      await database.addDevice(device);

      const volumes = [];
      for (let i = 0; i < 10; i += 1) {
        volumes.push({
          device: 'TestDevice',
          volume: 10 * i,
        });
      }

      await Promise.all(
        volumes.map(async (v) => {
          await database.addAirVolume(v);
        }),
      );

      const airVolumes = await database.getAirVolume('TestDevice');

      expect(volumes.length).toBe(airVolumes.length);

      for (let i = 0; i < volumes.length; i += 1) {
        expect(airVolumes[i].device).toBe('TestDevice');
        expect(airVolumes[i].volume).toBe(volumes[i].volume);
      }
    });
  });

  describe('AlarmState functions', () => {
    beforeEach(async () => {
      await database.clearCollection('devices');
      await database.clearCollection('alarms');
    });

    it('setAlarmState adds a AlarmState Document correct and returns the object', async () => {
      const alarmState = {
        device: 'TestDevice',
        lamp: 1,
        state: 'OK',
      };

      const device = {
        serialnumber: 'TestDevice',
        name: 'Test Device 1',
      };

      await database.addDevice(device);

      const addedAlarmState = await database.setAlarmState(alarmState);
      expect(addedAlarmState.device).toBe(alarmState.device);
      expect(addedAlarmState.lamp).toBe(alarmState.lamp);
      expect(addedAlarmState.state).toBe(alarmState.state);

      const d = await database.getDevice(device.serialnumber);
      expect(d.currentAlarm[alarmState.lamp - 1]._id).toStrictEqual(addedAlarmState._id);
    });

    it('setAlarmState throws an error if the validation fails', async () => {
      const alarmState = {
        lamp: 1,
        state: 'OK',
      };
      await database.setAlarmState(alarmState).catch((e) => {
        expect(e.toString()).toBe('ValidationError: device: Path `device` is required.');
      });
    });

    it('setAlarmState throws an error if the device does not exists', async () => {
      const alarmState = {
        device: 'TestDevice',
        lamp: 1,
        state: 'OK',
      };

      await database.setAlarmState(alarmState).catch((e) => {
        expect(e.toString()).toBe('Error: Device does not exists');
      });
    });

    it('setAlarmState changes the AlarmState of a device proberly', async () => {
      const device = {
        serialnumber: 'TestDevice',
        name: 'Test Device 1',
      };

      await database.addDevice(device);

      const alarms = [];
      for (let i = 1; i <= 10; i += 1) {
        alarms.push({
          device: 'TestDevice',
          lamp: i,
          state: (i % 2 === 1) ? 'OK' : 'Alarm',
        });
      }

      await Promise.all(
        alarms.map(async (a) => {
          await database.setAlarmState(a);
        }),
      );

      const databaseAlarmStates = await database.getAlarmState(device.serialnumber);
      const databaseDevice = await database.getDevice(device.serialnumber);

      for (let i = 1; i <= databaseDevice.currentAlarm.length; i += 1) {
        const alarmState = databaseDevice.currentAlarm[i - 1];
        expect(alarmState.lamp).toBe(i);
        expect(alarmState.state).toBe(alarms[i - 1].state);
      }
    });

    it('getAlarmState gets all AlarmStates of one device', async () => {
      const device = {
        serialnumber: 'TestDevice',
        name: 'Test Device 1',
      };

      await database.addDevice(device);

      const alarms = [];
      for (let i = 1; i <= 10; i += 1) {
        alarms.push({
          device: 'TestDevice',
          lamp: i,
          state: (i % 2 === 1) ? 'OK' : 'Alarm',
        });
      }

      await Promise.all(
        alarms.map(async (a) => {
          await database.setAlarmState(a);
        }),
      );

      const alarmStates = await database.getAlarmState('TestDevice');

      expect(alarms.length).toBe(alarmStates.length);

      for (let i = 0; i < alarms.length; i += 1) {
        expect(alarmStates[i].device).toBe('TestDevice');
        expect(alarmStates[i].lamp).toBe(alarms[i].lamp);
        expect(alarmStates[i].state).toBe(alarms[i].state);
      }
    });
  });

  describe('RotationSpeed functions', () => {
    beforeEach(async () => {
      await database.clearCollection('devices');
      await database.clearCollection('rotationSpeed');
    });

    it('addRotationSpeed adds a RotationSpeed Document correct and returns the object', async () => {
      const rotationSpeed = {
        device: 'TestDevice',
        rotationSpeed: 1,
      };

      const device = {
        serialnumber: 'TestDevice',
        name: 'Test Device 1',
      };

      await database.addDevice(device);

      const addedRotationSpeed = await database.addRotationSpeed(rotationSpeed);
      expect(addedRotationSpeed.device).toBe(rotationSpeed.device);
      expect(addedRotationSpeed.rotationSpeed).toBe(rotationSpeed.rotationSpeed);

      const d = await database.getDevice(rotationSpeed.device);
      expect(d.rotationSpeed).toStrictEqual(rotationSpeed.rotationSpeed);
    });

    it('addRotationSpeed throws an error if the validation fails', async () => {
      const rotationSpeed = {
        rotationSpeed: 1,
      };

      await database.addRotationSpeed(rotationSpeed).catch((e) => {
        expect(e.toString()).toBe('ValidationError: device: Path `device` is required.');
      });
    });

    it('setAlarmState throws an error if the device does not exists', async () => {
      const rotationSpeed = {
        device: 'TestDevice',
        rotationSpeed: 1,
      };

      await database.addRotationSpeed(rotationSpeed).catch((e) => {
        expect(e.toString()).toBe('Error: Device does not exists');
      });
    });

    it('getRotationSpeeds gets all RotationSpeed of one device', async () => {
      const device = {
        serialnumber: 'TestDevice',
        name: 'Test Device 1',
      };

      await database.addDevice(device);

      const rotationSpeeds = [];
      for (let i = 1; i <= 10; i += 1) {
        rotationSpeeds.push({
          device: 'TestDevice',
          rotationSpeed: i * 10,
        });
      }

      await Promise.all(
        rotationSpeeds.map(async (a) => {
          await database.addRotationSpeed(a);
        }),
      );

      const docRotationSpeeds = await database.getRotationSpeeds('TestDevice');

      expect(docRotationSpeeds.length).toBe(rotationSpeeds.length);

      for (let i = 0; i < docRotationSpeeds.length; i += 1) {
        expect(docRotationSpeeds[i].device).toBe('TestDevice');
        expect(docRotationSpeeds[i].rotationSpeed).toBe(rotationSpeeds[i].rotationSpeed);
      }
    });
  });
});
