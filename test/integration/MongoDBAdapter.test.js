/* eslint-disable no-underscore-dangle */
/* eslint-disable no-await-in-loop */
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
    await database.connect();
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
        serialnumber: 'MongoDBAdap1',
        name: 'Test Device 1',
      };

      const addedDevice = await database.addDevice(device);
      expect(addedDevice.serialnumber).toBe(device.serialnumber);
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
        serialnumber: 'MongoDBAdap1',
        name: 'Test Device 1',
      };

      await database.addDevice(device);
      const returnedDevice = await database.getDevice(device.serialnumber);
      expect(returnedDevice.serialnumber).toBe(device.serialnumber);
      expect(returnedDevice.name).toBe(device.name);
      expect(returnedDevice.group).toBeDefined();
      expect(returnedDevice.engineState).toBe(false);
      expect(returnedDevice.engineLevel).toBe(0);
      expect(returnedDevice.currentFanState).toStrictEqual({ state: '' });
      expect(returnedDevice.currentBodyState).toBeDefined();
      expect(returnedDevice.currentLampState).toBeDefined();
      expect(returnedDevice.currentLampValue).toBeDefined();
      expect(returnedDevice.identifyMode).toBe(false);
      expect(returnedDevice.eventMode).toBe(false);
      expect(returnedDevice.tacho).toStrictEqual({ tacho: 0 });
      expect(returnedDevice.currentAirVolume).toStrictEqual({ volume: 0 });
    });

    it('getDevice throws error if deviceID is not string', async () => {
      await database.getDevice(null).catch((err) => {
        expect(err.toString()).toBe('Error: Serialnumber has to be a string');
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
        expect(dbData[i].currentFanState).toStrictEqual({ state: '' });
        expect(dbData[i].currentBodyState).toBeDefined();
        expect(dbData[i].currentLampState).toBeDefined();
        expect(dbData[i].currentLampValue).toBeDefined();
        expect(dbData[i].identifyMode).toBe(false);
        expect(dbData[i].eventMode).toBe(false);
        expect(dbData[i].tacho).toStrictEqual({ tacho: 0 });
        expect(dbData[i].currentAirVolume).toStrictEqual({ volume: 0 });
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
      expect(updatedDevice.serialnumber).toBe(device.serialnumber);
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

  describe('Serialnumber functions', () => {
    beforeEach(async () => {
      await database.clearCollection('uvcdevices');
    });

    it('getSerialnumbers returns all Serialnumbers', async () => {
      for (let i = 0; i < 100; i += 1) {
        await database.addDevice({
          name: `${i}`,
          serialnumber: `${i}`,
        });
      }

      const serialnumbers = await database.getSerialnumbers();
      expect(serialnumbers.length).toBe(100);
      for (let i = 0; i < 100; i += 1) {
        expect(serialnumbers[i]).toBe(`${i}`);
      }
    });

    it('getSerialnumbers returns empty array if no devices exists', async () => {
      const serialnumbers = await database.getSerialnumbers();
      expect(serialnumbers.length).toBe(0);
      expect(serialnumbers).toStrictEqual([]);
    });
  });

  describe('AirVolume functions', () => {
    beforeEach(async () => {
      await database.clearCollection('uvcdevices');
      await database.clearCollection('airvolumes');
    });

    it('addAirVolume adds a AirVolume Document correct and returns the object', async () => {
      const airVolume = {
        device: '1',
        volume: 10,
      };

      const device = {
        serialnumber: '1',
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
        serialnumber: '1',
        name: 'Test Device 1',
      };

      await database.addDevice(device);

      const volumes = [];
      for (let i = 0; i < 10; i += 1) {
        volumes.push({
          device: '1',
          volume: 10 * i,
        });
      }

      await Promise.all(
        volumes.map(async (v) => {
          await database.addAirVolume(v);
        }),
      );

      const airVolumes = await database.getAirVolume('1');

      expect(volumes.length).toBe(airVolumes.length);

      for (let i = 0; i < volumes.length; i += 1) {
        expect(airVolumes[i].device).toBe('1');
        expect(airVolumes[i].volume).toBe(volumes[i].volume);
      }
    });

    it('getAirVolumes gets all AirVolumes of one device after a specific date', async () => {
      const device = {
        serialnumber: '1',
        name: 'Test Device 1',
      };

      await database.addDevice(device);

      const volumes = [];
      for (let i = 0; i < 10; i += 1) {
        volumes.push({
          device: '1',
          volume: 10 * i,
          date: new Date((i + 1) * 100000),
        });
      }

      await Promise.all(
        volumes.map(async (v) => {
          await database.addAirVolume(v);
        }),
      );

      const airVolumes = await database.getAirVolume('1', new Date((3) * 100000));

      expect(volumes.length - 2).toBe(airVolumes.length);

      for (let i = 2; i < volumes.length; i += 1) {
        expect(airVolumes[i - 2].device).toBe('1');
        expect(airVolumes[i - 2].volume).toBe(volumes[i].volume);
      }
    });

    it('getAirVolumes gets all AirVolumes of one device in a specific time range', async () => {
      const device = {
        serialnumber: '1',
        name: 'Test Device 1',
      };

      await database.addDevice(device);

      const volumes = [];
      for (let i = 0; i < 10; i += 1) {
        volumes.push({
          device: '1',
          volume: 10 * i,
          date: new Date((i + 1) * 100000),
        });
      }

      await Promise.all(
        volumes.map(async (v) => {
          await database.addAirVolume(v);
        }),
      );

      const airVolumes = await database.getAirVolume('1', new Date((3) * 100000), new Date((8) * 100000));

      expect(volumes.length - 4).toBe(airVolumes.length);

      for (let i = 2; i < airVolumes.length; i += 1) {
        expect(airVolumes[i - 2].device).toBe('1');
        expect(airVolumes[i - 2].volume).toBe(volumes[i].volume);
      }
    });

    it('getAirVolumes gets all AirVolumes of one device before a specific date', async () => {
      const device = {
        serialnumber: '1',
        name: 'Test Device 1',
      };

      await database.addDevice(device);

      const volumes = [];
      for (let i = 0; i < 10; i += 1) {
        volumes.push({
          device: '1',
          volume: 10 * i,
          date: new Date((i + 1) * 100000),
        });
      }

      await Promise.all(
        volumes.map(async (v) => {
          await database.addAirVolume(v);
        }),
      );

      const airVolumes = await database.getAirVolume('1', undefined, new Date((8) * 100000));

      expect(volumes.length - 2).toBe(airVolumes.length);

      for (let i = 0; i < airVolumes.length; i += 1) {
        expect(airVolumes[i].device).toBe('1');
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
        device: '1',
        lamp: 1,
        state: 'OK',
      };

      const device = {
        serialnumber: '1',
        name: 'Test Device 1',
      };

      await database.addDevice(device);

      const addedAlarmState = await database.setAlarmState(alarmState);
      expect(addedAlarmState.device).toBe(alarmState.device);
      expect(addedAlarmState.lamp).toBe(alarmState.lamp);
      expect(addedAlarmState.state).toBe(alarmState.state);

      const d = await database.getDevice(device.serialnumber);
      expect(d.currentLampState[alarmState.lamp - 1]._id).toStrictEqual(addedAlarmState._id);
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
        device: '1',
        lamp: 1,
        state: 'OK',
      };

      await database.setAlarmState(alarmState).catch((e) => {
        expect(e.toString()).toBe('Error: Device does not exists');
      });
    });

    it('setAlarmState changes the AlarmState of a device proberly', async () => {
      const device = {
        serialnumber: '1',
        name: 'Test Device 1',
      };

      await database.addDevice(device);

      const alarms = [];
      for (let i = 1; i <= 10; i += 1) {
        alarms.push({
          device: '1',
          lamp: i,
          state: (i % 2 === 1) ? 'OK' : 'Alarm',
        });
      }

      await Promise.all(
        alarms.map(async (a) => {
          await database.setAlarmState(a);
        }),
      );

      await database.getAlarmState(device.serialnumber);
      const databaseDevice = await database.getDevice(device.serialnumber);

      for (let i = 1; i <= databaseDevice.currentLampState.length; i += 1) {
        const alarmState = databaseDevice.currentLampState[i - 1];
        expect(alarmState.lamp).toBe(i);
        expect(alarmState.state).toBe(alarms[i - 1].state);
      }
    });

    it('getAlarmState gets all AlarmStates of one device', async () => {
      const device = {
        serialnumber: '1',
        name: 'Test Device 1',
      };

      await database.addDevice(device);

      const alarms = [];
      for (let i = 1; i <= 10; i += 1) {
        alarms.push({
          device: '1',
          lamp: i,
          state: (i % 2 === 1) ? 'OK' : 'Alarm',
        });
      }

      await Promise.all(
        alarms.map(async (a) => {
          await database.setAlarmState(a);
        }),
      );

      const alarmStates = await database.getAlarmState('1');

      expect(alarms.length).toBe(alarmStates.length);

      for (let i = 0; i < alarms.length; i += 1) {
        expect(alarmStates[i].device).toBe('1');
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
        device: '1',
        lamp: 1,
        value: 100,
      };

      const device = {
        serialnumber: '1',
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
        device: '1',
        lamp: 1,
        value: 100,
      };

      await database.addLampValue(lampValue).catch((e) => {
        expect(e.toString()).toBe('Error: Device does not exists');
      });
    });

    it('addLampValue changes the LampValue of a device proberly', async () => {
      const device = {
        serialnumber: '1',
        name: 'Test Device 1',
      };

      await database.addDevice(device);

      const lampValues = [];
      for (let i = 1; i <= 10; i += 1) {
        lampValues.push({
          device: '1',
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
        serialnumber: '1',
        name: 'Test Device 1',
      };

      await database.addDevice(device);

      const values = [];
      for (let i = 1; i <= 10; i += 1) {
        values.push({
          device: '123456789',
          lamp: i,
          value: i * 10,
        });
      }

      await Promise.all(
        values.map(async (a) => {
          await database.addLampValue(a);
        }),
      );

      const lampValues = await database.getLampValues('123456789');

      expect(values.length).toBe(lampValues.length);

      for (let i = 0; i < values.length; i += 1) {
        expect(lampValues[i].device).toBe('123456789');
        expect(lampValues[i].lamp).toBe(values[i].lamp);
        expect(lampValues[i].value).toBe(values[i].value);
      }
    });

    it('getLampValues gets all LampValues of one device and one lamp', async () => {
      const device = {
        serialnumber: '1',
        name: 'Test Device 1',
      };

      await database.addDevice(device);

      const values = [];
      for (let i = 1; i <= 10; i += 1) {
        values.push({
          device: '123456789',
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
        lampValues[i] = await database.getLampValues('123456789', `${(i + 1) * 2}`);
      }

      expect(lampValues.length).toBe(5);

      for (let i = 0; i < lampValues.length; i += 1) {
        const lampValuesAtLamp = lampValues[i];
        expect(lampValuesAtLamp.length).toBe(2);
        for (let j = 0; j < lampValuesAtLamp.length; j += 1) {
          const element = lampValuesAtLamp[j];
          expect(element.device).toBe('123456789');
          expect(element.lamp).toBe((i + 1) * 2);
          expect(element.value).toBe((i * 2 + j + 1) * 10);
        }
      }
    });

    it('getLampValues gets all LampValues of one device after a specific date', async () => {
      const device = {
        serialnumber: '1',
        name: 'Test Device 1',
      };

      await database.addDevice(device);

      const values = [];
      for (let i = 1; i <= 10; i += 1) {
        values.push({
          device: '123456789',
          lamp: i,
          value: i * 10,
          date: new Date((i) * 10000),
        });
      }

      await Promise.all(
        values.map(async (a) => {
          await database.addLampValue(a);
        }),
      );

      const lampValues = await database.getLampValues('123456789', undefined, new Date(3 * 10000));

      expect(lampValues.length).toBe(values.length - 2);

      for (let i = 0; i < lampValues.length; i += 1) {
        expect(lampValues[i].device).toBe('123456789');
        expect(lampValues[i].lamp).toBe(values[i + 2].lamp);
        expect(lampValues[i].value).toBe(values[i + 2].value);
      }
    });

    it('getLampValues gets all LampValues of one device before a specific date', async () => {
      const device = {
        serialnumber: '1',
        name: 'Test Device 1',
      };

      await database.addDevice(device);

      const values = [];
      for (let i = 1; i <= 10; i += 1) {
        values.push({
          device: '123456789',
          lamp: i,
          value: i * 10,
          date: new Date((i) * 10000),
        });
      }

      await Promise.all(
        values.map(async (a) => {
          await database.addLampValue(a);
        }),
      );

      const lampValues = await database.getLampValues('123456789', undefined, undefined, new Date(7 * 10000));

      expect(lampValues.length).toBe(values.length - 3);

      for (let i = 0; i < lampValues.length; i += 1) {
        expect(lampValues[i].device).toBe('123456789');
        expect(lampValues[i].lamp).toBe(values[i].lamp);
        expect(lampValues[i].value).toBe(values[i].value);
      }
    });

    it('getLampValues gets all LampValues of one device in a specific time range', async () => {
      const device = {
        serialnumber: '1',
        name: 'Test Device 1',
      };

      await database.addDevice(device);

      const values = [];
      for (let i = 1; i <= 10; i += 1) {
        values.push({
          device: '123456789',
          lamp: i,
          value: i * 10,
          date: new Date((i) * 10000),
        });
      }

      await Promise.all(
        values.map(async (a) => {
          await database.addLampValue(a);
        }),
      );

      const lampValues = await database.getLampValues('123456789', undefined, new Date(3 * 10000), new Date(7 * 10000));

      expect(lampValues.length).toBe(values.length - 5);

      for (let i = 0; i < lampValues.length; i += 1) {
        expect(lampValues[i].device).toBe('123456789');
        expect(lampValues[i].lamp).toBe(values[i + 2].lamp);
        expect(lampValues[i].value).toBe(values[i + 2].value);
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
        device: '123456789',
        tacho: 1,
      };

      const device = {
        serialnumber: '123456789',
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
        device: '123456789',
        tacho: 1,
      };

      await database.addTacho(tacho).catch((e) => {
        expect(e.toString()).toBe('Error: Device does not exists');
      });
    });

    it('getTachos gets all Tacho of one device', async () => {
      const device = {
        serialnumber: '123456789',
        name: 'Test Device 1',
      };

      await database.addDevice(device);

      const tachos = [];
      for (let i = 1; i <= 10; i += 1) {
        tachos.push({
          device: '123456789',
          tacho: i * 10,
        });
      }

      await Promise.all(
        tachos.map(async (a) => {
          await database.addTacho(a);
        }),
      );

      const docTachos = await database.getTachos('123456789');

      expect(docTachos.length).toBe(tachos.length);

      for (let i = 0; i < docTachos.length; i += 1) {
        expect(docTachos[i].device).toBe('123456789');
        expect(docTachos[i].tacho).toBe(tachos[i].tacho);
      }
    });

    it('getTachos gets all Tacho of one device before a specific date', async () => {
      const device = {
        serialnumber: '123456789',
        name: 'Test Device 1',
      };

      await database.addDevice(device);

      const tachos = [];
      for (let i = 1; i <= 10; i += 1) {
        tachos.push({
          device: '123456789',
          tacho: i * 10,
          date: new Date(i * 10000),
        });
      }

      await Promise.all(
        tachos.map(async (a) => {
          await database.addTacho(a);
        }),
      );

      const docTachos = await database.getTachos('123456789', new Date(3 * 10000));

      expect(docTachos.length).toBe(tachos.length - 2);

      for (let i = 0; i < docTachos.length; i += 1) {
        expect(docTachos[i].device).toBe('123456789');
        expect(docTachos[i].tacho).toBe(tachos[i + 2].tacho);
      }
    });

    it('getTachos gets all Tacho of one device after a specific date', async () => {
      const device = {
        serialnumber: '123456789',
        name: 'Test Device 1',
      };

      await database.addDevice(device);

      const tachos = [];
      for (let i = 1; i <= 10; i += 1) {
        tachos.push({
          device: '123456789',
          tacho: i * 10,
          date: new Date(i * 10000),
        });
      }

      await Promise.all(
        tachos.map(async (a) => {
          await database.addTacho(a);
        }),
      );

      const docTachos = await database.getTachos('123456789', undefined, new Date(7 * 10000));

      expect(docTachos.length).toBe(tachos.length - 3);

      for (let i = 0; i < docTachos.length; i += 1) {
        expect(docTachos[i].device).toBe('123456789');
        expect(docTachos[i].tacho).toBe(tachos[i].tacho);
      }
    });

    it('getTachos gets all Tacho of one device in a specific time range', async () => {
      const device = {
        serialnumber: '123456789',
        name: 'Test Device 1',
      };

      await database.addDevice(device);

      const tachos = [];
      for (let i = 1; i <= 10; i += 1) {
        tachos.push({
          device: '123456789',
          tacho: i * 10,
          date: new Date(i * 10000),
        });
      }

      await Promise.all(
        tachos.map(async (a) => {
          await database.addTacho(a);
        }),
      );

      const docTachos = await database.getTachos('123456789', new Date(3 * 10000), new Date(7 * 10000));

      expect(docTachos.length).toBe(tachos.length - 5);

      for (let i = 0; i < docTachos.length; i += 1) {
        expect(docTachos[i].device).toBe('123456789');
        expect(docTachos[i].tacho).toBe(tachos[i + 2].tacho);
      }
    });
  });

  describe('FanState functions', () => {
    beforeEach(async () => {
      await database.clearCollection('uvcdevices');
      await database.clearCollection('fanstates');
    });

    it('addFanState adds a FanState Document correct and returns the object', async () => {
      const fanState = {
        device: '123456789',
        state: '1',
      };

      const device = {
        serialnumber: '123456789',
        name: 'Test Device 1',
      };

      await database.addDevice(device);

      const addedFanState = await database.addFanState(fanState);
      expect(addedFanState.device).toBe(fanState.device);
      expect(addedFanState.state).toBe(fanState.state);

      const d = await database.getDevice(fanState.device);
      console.log(d);
      expect(d.currentFanState.state).toStrictEqual(addedFanState.state);
    });

    it('addFanState throws an error if the validation fails', async () => {
      const fanState = {
        state: '1',
      };

      await database.addFanState(fanState).catch((e) => {
        expect(e.toString()).toBe('ValidationError: device: Path `device` is required.');
      });
    });

    it('addFanState throws an error if the device does not exists', async () => {
      const fanState = {
        device: '123456789',
        state: '1',
      };

      await database.addFanState(fanState).catch((e) => {
        expect(e.toString()).toBe('Error: Device does not exists');
      });
    });

    it('getFanStates gets all FanState of one device', async () => {
      const device = {
        serialnumber: '123456789',
        name: 'Test Device 1',
      };

      await database.addDevice(device);

      const fanStates = [];
      for (let i = 1; i <= 10; i += 1) {
        fanStates.push({
          device: '123456789',
          state: `${i * 10}`,
        });
      }

      await Promise.all(
        fanStates.map(async (a) => {
          await database.addFanState(a);
        }),
      );

      const docFanStates = await database.getFanStates('123456789');

      expect(docFanStates.length).toBe(fanStates.length);

      for (let i = 0; i < docFanStates.length; i += 1) {
        expect(docFanStates[i].device).toBe('123456789');
        expect(docFanStates[i].state).toBe(fanStates[i].state);
      }
    });

    it('getFanStates gets all FanState of one device before a specific date', async () => {
      const device = {
        serialnumber: '123456789',
        name: 'Test Device 1',
      };

      await database.addDevice(device);

      const fanStates = [];
      for (let i = 1; i <= 10; i += 1) {
        fanStates.push({
          device: '123456789',
          state: `${i * 10}`,
          date: new Date(i * 10000),
        });
      }

      await Promise.all(
        fanStates.map(async (a) => {
          await database.addFanState(a);
        }),
      );

      const docFanStates = await database.getFanStates('123456789', new Date(3 * 10000));

      expect(docFanStates.length).toBe(fanStates.length - 2);

      for (let i = 0; i < docFanStates.length; i += 1) {
        expect(docFanStates[i].device).toBe('123456789');
        expect(docFanStates[i].state).toBe(fanStates[i + 2].state);
      }
    });

    it('getFanStates gets all FanState of one device after a specific date', async () => {
      const device = {
        serialnumber: '123456789',
        name: 'Test Device 1',
      };

      await database.addDevice(device);

      const fanStates = [];
      for (let i = 1; i <= 10; i += 1) {
        fanStates.push({
          device: '123456789',
          state: `${i * 10}`,
          date: new Date(i * 10000),
        });
      }

      await Promise.all(
        fanStates.map(async (a) => {
          await database.addFanState(a);
        }),
      );

      const docFanStates = await database.getFanStates('123456789', undefined, new Date(7 * 10000));

      expect(docFanStates.length).toBe(fanStates.length - 3);

      for (let i = 0; i < docFanStates.length; i += 1) {
        expect(docFanStates[i].device).toBe('123456789');
        expect(docFanStates[i].state).toBe(fanStates[i].state);
      }
    });

    it('getFanStates gets all FanState of one device in a specific time range', async () => {
      const device = {
        serialnumber: '123456789',
        name: 'Test Device 1',
      };

      await database.addDevice(device);

      const fanStates = [];
      for (let i = 1; i <= 10; i += 1) {
        fanStates.push({
          device: '123456789',
          state: i * 10,
          date: new Date(i * 10000),
        });
      }

      await Promise.all(
        fanStates.map(async (a) => {
          await database.addFanState(a);
        }),
      );

      const docFanStates = await database.getFanStates('123456789', new Date(3 * 10000), new Date(7 * 10000));

      expect(docFanStates.length).toBe(fanStates.length - 5);

      for (let i = 0; i < docFanStates.length; i += 1) {
        expect(docFanStates[i].device).toBe('123456789');
        expect(docFanStates[i].fanState).toBe(fanStates[i + 2].fanState);
      }
    });
  });

  describe('BodyState functions', () => {
    beforeEach(async () => {
      await database.clearCollection('uvcdevices');
      await database.clearCollection('bodystates');
    });

    it('addBodyState adds a BodyState Document correct and returns the object', async () => {
      const bodyState = {
        device: '123456789',
        state: '1',
      };

      const device = {
        serialnumber: '123456789',
        name: 'Test Device 1',
      };

      await database.addDevice(device);

      const addedBodyState = await database.addBodyState(bodyState);
      expect(addedBodyState.device).toBe(bodyState.device);
      expect(addedBodyState.state).toBe(bodyState.state);

      const d = await database.getDevice(bodyState.device);
      console.log(d);
      expect(d.currentBodyState.state).toStrictEqual(addedBodyState.state);
    });

    it('addBodyState throws an error if the validation fails', async () => {
      const bodyState = {
        state: '1',
      };

      await database.addBodyState(bodyState).catch((e) => {
        expect(e.toString()).toBe('ValidationError: device: Path `device` is required.');
      });
    });

    it('addBodyState throws an error if the device does not exists', async () => {
      const bodyState = {
        device: '123456789',
        state: '1',
      };

      await database.addBodyState(bodyState).catch((e) => {
        expect(e.toString()).toBe('Error: Device does not exists');
      });
    });

    it('getBodyStates gets all BodyState of one device', async () => {
      const device = {
        serialnumber: '123456789',
        name: 'Test Device 1',
      };

      await database.addDevice(device);

      const bodyStates = [];
      for (let i = 1; i <= 10; i += 1) {
        bodyStates.push({
          device: '123456789',
          state: `${i * 10}`,
        });
      }

      await Promise.all(
        bodyStates.map(async (a) => {
          await database.addBodyState(a);
        }),
      );

      const docBodyStates = await database.getBodyStates('123456789');

      expect(docBodyStates.length).toBe(bodyStates.length);

      for (let i = 0; i < docBodyStates.length; i += 1) {
        expect(docBodyStates[i].device).toBe('123456789');
        expect(docBodyStates[i].state).toBe(bodyStates[i].state);
      }
    });

    it('getBodyStates gets all BodyState of one device before a specific date', async () => {
      const device = {
        serialnumber: '123456789',
        name: 'Test Device 1',
      };

      await database.addDevice(device);

      const bodyStates = [];
      for (let i = 1; i <= 10; i += 1) {
        bodyStates.push({
          device: '123456789',
          state: `${i * 10}`,
          date: new Date(i * 10000),
        });
      }

      await Promise.all(
        bodyStates.map(async (a) => {
          await database.addBodyState(a);
        }),
      );

      const docBodyStates = await database.getBodyStates('123456789', new Date(3 * 10000));

      expect(docBodyStates.length).toBe(bodyStates.length - 2);

      for (let i = 0; i < docBodyStates.length; i += 1) {
        expect(docBodyStates[i].device).toBe('123456789');
        expect(docBodyStates[i].state).toBe(bodyStates[i + 2].state);
      }
    });

    it('getBodyStates gets all BodyState of one device after a specific date', async () => {
      const device = {
        serialnumber: '123456789',
        name: 'Test Device 1',
      };

      await database.addDevice(device);

      const bodyStates = [];
      for (let i = 1; i <= 10; i += 1) {
        bodyStates.push({
          device: '123456789',
          state: `${i * 10}`,
          date: new Date(i * 10000),
        });
      }

      await Promise.all(
        bodyStates.map(async (a) => {
          await database.addBodyState(a);
        }),
      );

      const docBodyStates = await database.getBodyStates('123456789', undefined, new Date(7 * 10000));

      expect(docBodyStates.length).toBe(bodyStates.length - 3);

      for (let i = 0; i < docBodyStates.length; i += 1) {
        expect(docBodyStates[i].device).toBe('123456789');
        expect(docBodyStates[i].state).toBe(bodyStates[i].state);
      }
    });

    it('getBodyStates gets all BodyState of one device in a specific time range', async () => {
      const device = {
        serialnumber: '123456789',
        name: 'Test Device 1',
      };

      await database.addDevice(device);

      const bodyStates = [];
      for (let i = 1; i <= 10; i += 1) {
        bodyStates.push({
          device: '123456789',
          state: i * 10,
          date: new Date(i * 10000),
        });
      }

      await Promise.all(
        bodyStates.map(async (a) => {
          await database.addBodyState(a);
        }),
      );

      const docBodyStates = await database.getBodyStates('123456789', new Date(3 * 10000), new Date(7 * 10000));

      expect(docBodyStates.length).toBe(bodyStates.length - 5);

      for (let i = 0; i < docBodyStates.length; i += 1) {
        expect(docBodyStates[i].device).toBe('123456789');
        expect(docBodyStates[i].bodyState).toBe(bodyStates[i + 2].bodyState);
      }
    });
  });

  describe('getDurationOfAvailableData', () => {
    beforeEach(async () => {
      await database.clearCollection('uvcdevices');
      await database.clearCollection('airvolumes');
      await database.clearCollection('lampvalues');
      await database.clearCollection('tachos');
    });

    it('Returns the latest currentAirVolume Date', async () => {
      await database.addDevice({
        name: 'Test Device',
        serialnumber: '1',
      });

      for (let i = 0; i < 10; i += 1) {
        await database.addAirVolume({
          volume: i,
          device: '1',
          date: new Date((i + 1) * 100),
        });
      }
      const duration = await database.getDurationOfAvailableData('1', 'currentAirVolume');
      expect(duration).toStrictEqual({
        to: new Date(10 * 100),
        from: new Date(100),
      });
    });

    it('Returns undefined if no currentAirVolume Document for that device exists', async () => {
      await database.addDevice({
        name: 'Test Device',
        serialnumber: '1',
      });
      const latestDuration = await database.getDurationOfAvailableData('1', 'currentAirVolume');
      expect(latestDuration).toBeUndefined();
    });

    it('Returns the latest lampValues Date', async () => {
      await database.addDevice({
        name: 'Test Device',
        serialnumber: '1',
      });

      for (let i = 0; i < 10; i += 1) {
        await database.addLampValue({
          lamp: (i + 1),
          value: 10,
          device: '1',
          date: new Date((i + 1) * 100),
        });
      }
      const duration = await database.getDurationOfAvailableData('1', 'lampValues');
      expect(duration).toStrictEqual({
        to: new Date(10 * 100),
        from: new Date(100),
      });
    });

    it('Returns undefined if no lampValues Document for that device exists', async () => {
      await database.addDevice({
        name: 'Test Device',
        serialnumber: '1',
      });
      const latestDuration = await database.getDurationOfAvailableData('1', 'lampValues');
      expect(latestDuration).toBeUndefined();
    });

    it('Returns the latest tacho Date', async () => {
      await database.addDevice({
        name: 'Test Device',
        serialnumber: '1',
      });

      for (let i = 0; i < 10; i += 1) {
        await database.addTacho({
          tacho: 10,
          device: '1',
          date: new Date((i + 1) * 100),
        });
      }
      const duration = await database.getDurationOfAvailableData('1', 'tacho');
      expect(duration).toStrictEqual({
        to: new Date(10 * 100),
        from: new Date(100),
      });
    });

    it('Returns undefined if no tacho Document for that device exists', async () => {
      await database.addDevice({
        name: 'Test Device',
        serialnumber: '1',
      });
      const latestDuration = await database.getDurationOfAvailableData('1', 'tacho');
      expect(latestDuration).toBeUndefined();
    });
  });

  describe('Group functions', () => {
    beforeEach(async () => {
      await database.clearCollection('uvcgroups');
      await database.clearCollection('uvcdevices');
    });

    it('addGroup adds a group correct and returns the object', async () => {
      const group = {
        name: 'Test Group 1',
      };

      const addedGroup = await database.addGroup(group);
      expect(addedGroup._id).toBeDefined();
      expect(addedGroup.name).toBe(group.name);
    });

    it('addGroup throws an error if validation fails', async () => {
      const device = {
      };

      await database.addGroup(device).catch((e) => {
        expect(e.toString()).toBe('Error: Name must be defined.');
      });
    });

    it('getGroup gets a group correct and returns the object', async () => {
      const group = {
        name: 'Test Group 1',
      };

      const docGroup = await database.addGroup(group);
      const returnedGroup = await database.getGroup(`${docGroup._id}`);
      expect(returnedGroup.name).toBe(group.name);
      expect(returnedGroup.devices.length).toBe(0);
    });

    it('getGroup throws error if name is not string', async () => {
      await database.getGroup(null).catch((err) => {
        expect(err.toString()).toBe('Error: GroupID has to be a string');
      });
    });

    it('getGroup throws error if group is not avalible', async () => {
      await database.getGroup('602e5dde6a51ff41b0625057').catch((err) => {
        expect(err.toString()).toBe('Error: Group does not exists');
      });
    });

    it('getGroups gets all groups', async () => {
      for (let i = 0; i < 10; i += 1) {
        await database.addGroup(
          {
            name: `Test Group ${i + 1}`,
          },
        );
      }

      const dbData = await database.getGroups().catch((err) => {
        console.error(err);
      });

      for (let i = 0; i < dbData.length; i += 1) {
        expect(dbData[i].name).toBe(`Test Group ${i + 1}`);
        expect(dbData[i].devices.length).toBe(0);
      }
    });

    it('updateGroup updates a group correct and returns the object', async () => {
      const docGroup = await database.addGroup({
        name: 'Test Group 1',
      });

      const group = {
        id: `${docGroup._id}`,
        name: 'Test Group 2',
      };

      const updatedGroup = await database.updateGroup(group);
      expect(updatedGroup.name).toBe(group.name);
    });

    it('updateGroup throws error if group is not available', async () => {
      const group = {
        id: '602e5dde6a51ff41b0625057',
        name: 'Test Group 2',
      };

      await database.updateGroup(group).catch((err) => {
        expect(err.toString()).toBe('Error: Group does not exists');
      });
    });

    it('updateGroup throws an error if validation fails', async () => {
      const group = {};

      await database.updateGroup(group).catch((e) => {
        expect(e.toString()).toBe('Error: id must be defined.');
      });
    });

    it('deleteGroup deletes a group', async () => {
      const group = {
        name: 'Test Group 1',
      };

      const docGroup = await database.addGroup(group);
      group.id = `${docGroup._id}`;

      await database.deleteGroup(group);
      await database.getGroup(group.id).catch((err) => {
        expect(err.toString()).toBe('Error: Group does not exists');
      });
    });

    it('deleteGroup throws error if Group is not available', async () => {
      await database.deleteGroup({ id: '602e5dde6a51ff41b0625057' }).catch((err) => {
        expect(err.toString()).toBe('Error: Group does not exists');
      });
    });

    it('addDeviceToGroup throws an error if devices does not exists', async () => {
      await database.addDeviceToGroup('602e5dde6a51ff41b0625057', '602e5dde6a51ff41b0625057').catch((err) => {
        expect(err.toString()).toBe('Error: Device does not exists');
      });
    });

    it('addDeviceToGroup throws an error if group does not exists', async () => {
      const device = await database.addDevice({
        serialnumber: 'T1',
        name: 'TestDevice',
      });

      await database.addDeviceToGroup(device.serialnumber, '000000000000000000000000').catch((err) => {
        console.log(err);
        expect(err.toString()).toBe('Error: Group does not exists');
      });
    });

    it('addDeviceToGroup adds an device to the group', async () => {
      const device = await database.addDevice({
        serialnumber: '1',
        name: 'TestDevice',
      });
      const group = await database.addGroup({
        name: 'Test Group',
      });
      await database.addDeviceToGroup(device.serialnumber, `${group.id}`);
      const docGroup = await database.getGroup(`${group.id}`);
      expect(docGroup.devices.length).toBe(1);
      expect(docGroup.devices[0]).toBe(device.serialnumber);
    });

    it('addDeviceToGroup adds an multiple devices to the group', async () => {
      const group = await database.addGroup({
        name: 'Test Group',
      });

      const devices = [];
      for (let i = 0; i < 10; i += 1) {
        devices.push({
          serialnumber: `1${i}`,
          name: `TestDevice ${i}`,
        });
        const docDevice = await database.addDevice(devices[i]);
        await database.addDeviceToGroup(docDevice.serialnumber, `${group._id}`);
      }

      const docGroup = await database.getGroup(`${group._id}`);
      expect(docGroup.devices.length).toBe(10);
      for (let i = 0; i < 10; i += 1) {
        expect(docGroup.devices[i]).toBe(devices[i].serialnumber);
      }
    });

    it('addDeviceToGroup sets the group of that device', async () => {
      const device = await database.addDevice({
        serialnumber: '1',
        name: 'TestDevice',
      });
      const group = await database.addGroup({
        name: 'Test Group',
      });
      await database.addDeviceToGroup(device.serialnumber, `${group._id}`);
      const docDevice = await database.getDevice(device.serialnumber);
      expect(docDevice.group).toBe(`${group._id}`);
    });

    it('addDeviceToGroup sets the group of multiple devices', async () => {
      const group = await database.addGroup({
        name: 'Test Group',
      });

      const devices = [];
      for (let i = 0; i < 10; i += 1) {
        devices.push({
          serialnumber: `1${i}`,
          name: `TestDevice ${i}`,
        });
        const docDevice = await database.addDevice(devices[i]);
        await database.addDeviceToGroup(docDevice.serialnumber, `${group._id}`);
      }

      const docDevices = await database.getDevices();
      expect(docDevices.length).toBe(10);
      for (let i = 0; i < 10; i += 1) {
        expect(docDevices[i].group).toBe(`${group._id}`);
      }
    });

    it('deleteDeviceFromGroup deletes an device from the group', async () => {
      const device = await database.addDevice({
        serialnumber: '1',
        name: 'TestDevice',
      });
      const group = await database.addGroup({
        name: 'Test Group',
      });
      await database.addDeviceToGroup(device.serialnumber, `${group._id}`);
      await database.deleteDeviceFromGroup(device.serialnumber, `${group._id}`);
      const docGroup = await database.getGroup(`${group._id}`);
      expect(docGroup.devices.length).toBe(0);
    });

    it('deleteDeviceFromGroup deletes an multiple devices from the group', async () => {
      const group = await database.addGroup({
        name: 'Test Group',
      });

      const devices = [];
      for (let i = 0; i < 10; i += 1) {
        devices.push({
          serialnumber: `1${i}`,
          name: `TestDevice ${i}`,
        });
        const docDevice = await database.addDevice(devices[i]);
        await database.addDeviceToGroup(docDevice.serialnumber, `${group._id}`);
      }

      await database.deleteDeviceFromGroup('15', `${group._id}`);
      await database.deleteDeviceFromGroup('16', `${group._id}`);

      const docGroup = await database.getGroup(`${group._id}`);
      expect(docGroup.devices.length).toBe(8);
      for (let i = 0; i < 10; i += 1) {
        if (i === 5 || i === 6) return;
        expect(docGroup.devices[i]).toBe(devices[i].serialnumber);
      }
    });
  });
});
