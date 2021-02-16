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
      await database.clearCollection('uvcdevices');
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
        expect(dbData[i].engineState).toBe(false);
        expect(dbData[i].engineLevel).toBe(0);
        expect(dbData[i].currentAlarm).toBeDefined();
        expect(dbData[i].currentLampValue).toBeDefined();
        expect(dbData[i].identifyMode).toBe(false);
        expect(dbData[i].eventMode).toBe(false);
        expect(dbData[i].tacho).toBe(0);
        expect(dbData[i].currentAirVolume).toBe(0);
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
      await database.clearCollection('uvcdevices');
      await database.clearCollection('airvolumes');
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
      expect(d.currentAirVolume._id).toStrictEqual(addedAirVolume._id);
      expect(d.currentAirVolume.volume).toStrictEqual(addedAirVolume.volume);
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
      await database.clearCollection('uvcdevices');
      await database.clearCollection('alarmstates');
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

  describe('LampValue functions', () => {
    beforeEach(async () => {
      await database.clearCollection('uvcdevices');
      await database.clearCollection('lampvalues');
    });

    it('addLampValue adds a LampValue Document correct and returns the object', async () => {
      const lampValue = {
        device: 'TestDevice',
        lamp: 1,
        value: 100,
      };

      const device = {
        serialnumber: 'TestDevice',
        name: 'Test Device 1',
      };

      await database.addDevice(device);

      const addedLampValue = await database.addLampValue(lampValue);
      expect(addedLampValue.device).toBe(lampValue.device);
      expect(addedLampValue.lamp).toBe(lampValue.lamp);
      expect(addedLampValue.state).toBe(lampValue.state);

      const d = await database.getDevice(device.serialnumber);
      expect(d.currentLampValue[lampValue.lamp - 1]._id).toStrictEqual(addedLampValue._id);
    });

    it('addLampValue throws an error if the validation fails', async () => {
      const lampValue = {
        lamp: 1,
        value: 100,
      };
      await database.addLampValue(lampValue).catch((e) => {
        expect(e.toString()).toBe('ValidationError: device: Path `device` is required.');
      });
    });

    it('addLampValue throws an error if the device does not exists', async () => {
      const lampValue = {
        device: 'TestDevice',
        lamp: 1,
        value: 100,
      };

      await database.addLampValue(lampValue).catch((e) => {
        expect(e.toString()).toBe('Error: Device does not exists');
      });
    });

    it('addLampValue changes the LampValue of a device proberly', async () => {
      const device = {
        serialnumber: 'TestDevice',
        name: 'Test Device 1',
      };

      await database.addDevice(device);

      const lampValues = [];
      for (let i = 1; i <= 10; i += 1) {
        lampValues.push({
          device: 'TestDevice',
          lamp: i,
          value: i * 10,
        });
      }

      await Promise.all(
        lampValues.map(async (a) => {
          await database.addLampValue(a);
        }),
      );

      const databaseDevice = await database.getDevice(device.serialnumber);

      for (let i = 1; i <= databaseDevice.currentLampValue.length; i += 1) {
        const lampValue = databaseDevice.currentLampValue[i - 1];
        expect(lampValue.lamp).toBe(i);
        expect(lampValue.value).toBe(lampValues[i - 1].value);
      }
    });

    it('getLampValues gets all LampValues of one device', async () => {
      const device = {
        serialnumber: 'TestDevice',
        name: 'Test Device 1',
      };

      await database.addDevice(device);

      const values = [];
      for (let i = 1; i <= 10; i += 1) {
        values.push({
          device: 'TestDevice',
          lamp: i,
          value: i * 10,
        });
      }

      await Promise.all(
        values.map(async (a) => {
          await database.addLampValue(a);
        }),
      );

      const lampValues = await database.getLampValues('TestDevice');

      expect(values.length).toBe(lampValues.length);

      for (let i = 0; i < values.length; i += 1) {
        expect(lampValues[i].device).toBe('TestDevice');
        expect(lampValues[i].lamp).toBe(values[i].lamp);
        expect(lampValues[i].value).toBe(values[i].value);
      }
    });

    it('getLampValues gets all LampValues of one device and one lamp', async () => {
      const device = {
        serialnumber: 'TestDevice',
        name: 'Test Device 1',
      };

      await database.addDevice(device);

      const values = [];
      for (let i = 1; i <= 10; i += 1) {
        values.push({
          device: 'TestDevice',
          lamp: i + (i % 2),
          value: i * 10,
        });
      }

      await Promise.all(
        values.map(async (a) => {
          await database.addLampValue(a);
        }),
      );

      const lampValues = [];

      for (let i = 0; i < 5; i += 1) {
        lampValues[i] = await database.getLampValues('TestDevice', (i + 1) * 2);
      }

      expect(lampValues.length).toBe(5);

      for (let i = 0; i < lampValues.length; i += 1) {
        const lampValuesAtLamp = lampValues[i];
        expect(lampValuesAtLamp.length).toBe(2);
        for (let j = 0; j < lampValuesAtLamp.length; j += 1) {
          const element = lampValuesAtLamp[j];
          expect(element.device).toBe('TestDevice');
          expect(element.lamp).toBe((i + 1) * 2);
          expect(element.value).toBe((i * 2 + j + 1) * 10);
        }
      }
    });
  });

  describe('Tacho functions', () => {
    beforeEach(async () => {
      await database.clearCollection('uvcdevices');
      await database.clearCollection('tachos');
    });

    it('addTacho adds a Tacho Document correct and returns the object', async () => {
      const tacho = {
        device: 'TestDevice',
        tacho: 1,
      };

      const device = {
        serialnumber: 'TestDevice',
        name: 'Test Device 1',
      };

      await database.addDevice(device);

      const addedTacho = await database.addTacho(tacho);
      expect(addedTacho.device).toBe(tacho.device);
      expect(addedTacho.tacho).toBe(tacho.tacho);

      const d = await database.getDevice(tacho.device);
      expect(d.tacho._id).toStrictEqual(addedTacho._id);
      expect(d.tacho.tacho).toStrictEqual(addedTacho.tacho);
    });

    it('addTacho throws an error if the validation fails', async () => {
      const tacho = {
        tacho: 1,
      };

      await database.addTacho(tacho).catch((e) => {
        expect(e.toString()).toBe('ValidationError: device: Path `device` is required.');
      });
    });

    it('setAlarmState throws an error if the device does not exists', async () => {
      const tacho = {
        device: 'TestDevice',
        tacho: 1,
      };

      await database.addTacho(tacho).catch((e) => {
        expect(e.toString()).toBe('Error: Device does not exists');
      });
    });

    it('getTachos gets all Tacho of one device', async () => {
      const device = {
        serialnumber: 'TestDevice',
        name: 'Test Device 1',
      };

      await database.addDevice(device);

      const tachos = [];
      for (let i = 1; i <= 10; i += 1) {
        tachos.push({
          device: 'TestDevice',
          tacho: i * 10,
        });
      }

      await Promise.all(
        tachos.map(async (a) => {
          await database.addTacho(a);
        }),
      );

      const docTachos = await database.getTachos('TestDevice');

      expect(docTachos.length).toBe(tachos.length);

      for (let i = 0; i < docTachos.length; i += 1) {
        expect(docTachos[i].device).toBe('TestDevice');
        expect(docTachos[i].tacho).toBe(tachos[i].tacho);
      }
    });
  });
});
