const EventEmitter = require('events');
const { register } = require('../../server/controlModules/MQTTEvents/DeviceStateChanged');
const MongoDBAdapter = require('../../server/databaseAdapters/mongoDB/MongoDBAdapter.js');

let database;

beforeAll(async () => {
  database = new MongoDBAdapter(global.__MONGO_URI__.replace('mongodb://', ''), '');
  await database.connect();
});

afterAll(async () => {
  await database.close();
});

describe('DeviceStateChanged MQTT Module', () => {
  afterEach(async () => {
    await database.clearCollection('uvcdevices');
    await database.clearCollection('uvcgroups');
    await database.clearCollection('airvolumes');
    await database.clearCollection('lampvalues');
    await database.clearCollection('fanstates');
    await database.clearCollection('bodystates');
    await database.clearCollection('tachos');
  });

  it.each([
    ['alarm/1', 'Ok', {
      lamp: 1, newValue: 'Ok', prop: 'currentLampState', serialnumber: '0002145702154',
    }],
    ['alarm/2', 'Ok', {
      lamp: 2, newValue: 'Ok', prop: 'currentLampState', serialnumber: '0002145702154',
    }],
    ['alarm/tempBody', 'Ok', {
      newValue: 'Ok', prop: 'currentBodyState', serialnumber: '0002145702154',
    }],
    ['alarm/tempFan', 'Ok', {
      newValue: 'Ok', prop: 'currentFanState', serialnumber: '0002145702154',
    }],
    ['engineState', true, {
      newValue: true, prop: 'engineState', serialnumber: '0002145702154',
    }],
    ['airVolume', 100, {
      newValue: 100, prop: 'currentAirVolume', serialnumber: '0002145702154',
    }],
    ['lamp/1', 100, {
      lamp: 1, newValue: 100, prop: 'currentLampValue', serialnumber: '0002145702154',
    }],
    ['identify', true, {
      newValue: true, prop: 'identifyMode', serialnumber: '0002145702154',
    }],
    ['eventMode', true, {
      newValue: true, prop: 'eventMode', serialnumber: '0002145702154',
    }],
  ])('Parses %s with %s accordingly', async (topic, message, result, done) => {
    const mqtt = new EventEmitter();

    const io = new EventEmitter();

    await database.addDevice({
      name: 'Test Gerat',
      serialnumber: '0002145702154',
    });

    register(database, io, mqtt);

    io.on('device_stateChanged', (prop) => {
      expect(prop).toEqual(result);
      done();
    });

    mqtt.emit('message', `UVClean/0002145702154/stateChanged/${topic}`, message);
  });

  it.each([
    ['alarm/1', 'Alarm', {
      serialnumber: '0002145702154', alarmValue: true,
    }, {
      lamp: 1, newValue: 'Alarm', prop: 'currentLampState', serialnumber: '0002145702154',
    }],
    ['alarm/tempBody', 'Alarm', {
      serialnumber: '0002145702154', alarmValue: true,
    }, {
      newValue: 'Alarm', prop: 'currentBodyState', serialnumber: '0002145702154',
    }],
    ['alarm/tempFan', 'Alarm', {
      serialnumber: '0002145702154', alarmValue: true,
    }, {
      newValue: 'Alarm', prop: 'currentFanState', serialnumber: '0002145702154',
    }],
  ])('Parses %s with %s accordingly and updates alarmState', async (topic, message, alarmResult, deviceResult, done) => {
    const mqtt = new EventEmitter();
    const io = new EventEmitter();
    register(database, io, mqtt);

    await database.addDevice({
      name: 'Test Gerat',
      serialnumber: '0002145702154',
    });

    io.on('device_alarm', async (prop) => {
      expect(prop).toEqual(alarmResult);
      const d = await database.getDevice('0002145702154');
      expect(d.alarmState).toBe(alarmResult.alarmValue);
      done();
    });

    io.on('device_stateChanged', (prop) => {
      expect(prop).toEqual(deviceResult);
    });

    mqtt.emit('message', `UVClean/0002145702154/stateChanged/${topic}`, message);
  });

  it.each([
    ['alarm/1', 'Alarm', {
      serialnumber: '0002145702154', alarmValue: true,
    }, {
      lamp: 1, newValue: 'Alarm', prop: 'currentLampState', serialnumber: '0002145702154',
    }],
    ['alarm/tempBody', 'Alarm', {
      serialnumber: '0002145702154', alarmValue: true,
    }, {
      newValue: 'Alarm', prop: 'currentBodyState', serialnumber: '0002145702154',
    }],
    ['alarm/tempFan', 'Alarm', {
      serialnumber: '0002145702154', alarmValue: true,
    }, {
      newValue: 'Alarm', prop: 'currentFanState', serialnumber: '0002145702154',
    }],
  ])('Parses %s with %s accordingly and updates alarmState in Group', async (topic, message, alarmResult, result, done) => {
    const mqtt = new EventEmitter();

    const io = new EventEmitter();

    await database.addDevice({
      name: 'Test Gerat',
      serialnumber: '0002145702154',
    });

    register(database, io, mqtt);

    const group = await database.addGroup({
      name: 'Test Group',
    });

    await database.addDeviceToGroup('0002145702154', `${group._id}`);

    mqtt.emit('message', `UVClean/0002145702154/stateChanged/${topic}`, message);

    io.on('device_alarm', (prop) => {
      expect(prop).toEqual(alarmResult);
    });

    io.on('group_deviceAlarm', (prop) => {
      expect(prop).toEqual({
        alarmValue: alarmResult.alarmValue,
        serialnumber: alarmResult.serialnumber,
        group: group._id.toString(),
      });
      done();
    });

    io.on('device_stateChanged', (prop) => {
      expect(prop).toEqual(result);
    });
  });
});

describe('Iterating over different states', () => {
  const mqtt = new EventEmitter();
  const io = new EventEmitter();
  let group = null;
  const deviceAlarm = jest.fn();
  const groupAlarm = jest.fn();

  beforeAll(async () => {
    register(database, io, mqtt);
    await database.addDevice({
      name: 'Test Gerat',
      serialnumber: '1',
    });

    await database.addDevice({
      name: 'Test Gerat',
      serialnumber: '2',
    });

    group = await database.addGroup({
      name: 'Test Group',
    });

    await database.addDeviceToGroup('1', `${group._id}`);
    await database.addDeviceToGroup('2', `${group._id}`);
  });

  afterEach(() => {
    io.removeAllListeners('device_alarm');
    io.removeAllListeners('group_deviceAlarm');
  });

  it.each([
    ['alarm/1', 'Alarm', true],
    ['alarm/1', 'Ok', false],
    ['alarm/1', 'Ok', null],
    ['alarm/1', 'Alarm', true],
    ['alarm/1', 'Alarm', null],
    ['alarm/2', 'Alarm', null],
    ['alarm/1', 'Ok', null],
    ['alarm/2', 'Ok', false],
    ['alarm/1', 'Alarm', true],
  ])('Device AlarmState: Setting topic %s to %s, expected devicealarm %s', (topic, message, deviceResult, done) => {
    io.on('device_alarm', (option) => {
      if (deviceResult === null) {
        deviceAlarm();
      } else {
        try {
          expect(option).toEqual({
            alarmValue: deviceResult,
            serialnumber: '1',
          });
        } catch (e) {
          done(e);
        }
      }
    });

    mqtt.emit('message', `UVClean/1/stateChanged/${topic}`, message);

    io.on('device_stateChanged', () => {
      if (deviceResult === null) {
        expect(deviceAlarm).not.toHaveBeenCalled();
      }
      done();
    });
  });

  it.each([
    ['1', 'alarm/1', 'Alarm', true],
    ['1', 'alarm/1', 'Ok', false],
    ['2', 'alarm/1', 'Ok', null],
    ['2', 'alarm/1', 'Alarm', true],
    ['1', 'alarm/1', 'Alarm', null],
    ['1', 'alarm/2', 'Alarm', null],
    ['2', 'alarm/1', 'Alarm', null],
    ['2', 'alarm/2', 'Alarm', null],
    ['1', 'alarm/1', 'Ok', null],
    ['1', 'alarm/2', 'Ok', null],
    ['2', 'alarm/1', 'Ok', null],
    ['2', 'alarm/2', 'Ok', false],
  ])('Group AlarmState: Setting device %s, topic %s to %s, expected groupalarm %s', (device, topic, message, groupResult, done) => {
    io.on('group_deviceAlarm', (option) => {
      if (groupResult === null) {
        groupAlarm();
      } else {
        try {
          expect(option).toEqual({
            alarmValue: groupResult,
            group: group._id.toString(),
            serialnumber: device,
          });
        } catch (e) {
          done(e);
        }
      }
    });

    mqtt.emit('message', `UVClean/${device}/stateChanged/${topic}`, message);

    io.on('device_stateChanged', () => {
      if (groupResult === null) {
        expect(groupAlarm).not.toHaveBeenCalled();
      }
      done();
    });
  });
});
