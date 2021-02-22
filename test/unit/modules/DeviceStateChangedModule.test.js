/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
const { EventEmitter } = require('events');
const deviceStateChanged = require('../../../server/controlModules/Event/DeviceStateChangedModule');

it('Test wether the deviceChangeState has alle required methods', () => {
  expect(Object.keys(deviceStateChanged).length).toBe(8);
  expect(deviceStateChanged.name).toBe('Event - deviceStateChanged');
  expect(deviceStateChanged.socketIOModule).toBeDefined();
  expect(deviceStateChanged.mqttClientModule).toBeDefined();
  expect(deviceStateChanged.databaseModule).toBeDefined();
  expect(deviceStateChanged.removeSocketIOModule).toBeDefined();
  expect(deviceStateChanged.removeMQTTClientModule).toBeDefined();
  expect(deviceStateChanged.removeDatabaseModule).toBeDefined();
});

describe('SocketIO Section', () => {
  it('SocketIO emits a device_stateChanged', () => {
    const eventemitter = new EventEmitter();
    const socket = new EventEmitter();

    const device = {
      serialnumber: '1',
      prop: 'engineState',
      newValue: false,
    };

    socket.on('device_stateChanged', (newState) => {
      expect(newState.serialnumber).toBe(device.serialnumber);
      expect(newState.prop).toBe(device.prop);
      expect(newState.newValue).toBe(device.newValue);
    });

    deviceStateChanged.socketIOModule(eventemitter, socket, {});

    eventemitter.emit('deviceStateChanged', device);
  });

  it('SocketIO Module gets removed with removeSocketIOModule', () => {
    const eventemitter = new EventEmitter();
    const socket = new EventEmitter();

    const fn = jest.fn();
    const spy = jest.spyOn(eventemitter, 'removeAllListeners');

    const device = {
      serialnumber: '1',
      prop: 'engineState',
      newValue: false,
    };

    socket.on('device_stateChanged', fn);

    deviceStateChanged.socketIOModule(eventemitter, socket, {});
    deviceStateChanged.removeSocketIOModule(eventemitter, socket, {});

    expect(spy).toHaveBeenCalledTimes(1);

    eventemitter.emit('deviceStateChanged', device);

    expect(fn).toHaveBeenCalledTimes(0);
  });
});

describe('MQTT Section', () => {
  test.each([
    ['UVClean/1/stateChanged/engineState', false, { serialnumber: '1', prop: 'engineState', newValue: false }],
    ['UVClean/1/stateChanged/engineLevel', 1, { serialnumber: '1', prop: 'engineLevel', newValue: 1 }],
    ['UVClean/1/stateChanged/alarm/tempBody', 'Ok', { serialnumber: '1', prop: 'currentBodyAlarm', newValue: 'Ok' }],
    ['UVClean/1/stateChanged/alarm/tempFan', 'Ok', { serialnumber: '1', prop: 'currentFanState', newValue: 'Ok' }],
    ['UVClean/1/stateChanged/alarm/1', 'Ok', {
      serialnumber: '1', prop: 'currentLampState', lamp: 1, newValue: 'Ok',
    }],
    ['UVClean/1/stateChanged/lamp/1', 'Ok', {
      serialnumber: '1', prop: 'currentLampValue', lamp: 1, newValue: 'Ok',
    }],
    ['UVClean/1/stateChanged/identify', false, { serialnumber: '1', prop: 'identifyMode', newValue: false }],
    ['UVClean/1/stateChanged/eventMode', false, { serialnumber: '1', prop: 'eventMode', newValue: false }],
    ['UVClean/1/stateChanged/tacho', 10, { serialnumber: '1', prop: 'tacho', newValue: 10 }],
    ['UVClean/1/stateChanged/airVolume', 10, { serialnumber: '1', prop: 'currentAirVolume', newValue: 10 }],
  ])('MQTT Module gets %s, %s and sends deviceStateChanged to eventemitter with %o', (topic, message, result, done) => {
    const eventemitter = new EventEmitter();

    class MQTTClient extends EventEmitter {
      subscribe(topic, cb) {
        cb();
      }
    }

    const mqttClient = new MQTTClient();

    eventemitter.on('deviceStateChanged', (device) => {
      expect(device).toStrictEqual(result);
      done();
    });

    deviceStateChanged.mqttClientModule(eventemitter, mqttClient);
    mqttClient.emit('message', topic, message);
  });

  it('MQTT Module gets removed with removeMQTTClientModule', () => {
    const eventemitter = new EventEmitter();

    const mqttClient = {
      subscribe: jest.fn(),
      on: jest.fn(),
      unsubscribe: jest.fn(),
    };

    deviceStateChanged.mqttClientModule(eventemitter, mqttClient);
    expect(mqttClient.on).toHaveBeenCalledTimes(1);
    deviceStateChanged.removeMQTTClientModule(eventemitter, mqttClient);
    expect(mqttClient.unsubscribe).toHaveBeenCalledTimes(1);
  });
});

describe('Database Section', () => {
  test.only.each([
    [{ serialnumber: '1', prop: 'engineState', newValue: false },
      'updateDevice', { serialnumber: '1', engineState: false }],
    [{ serialnumber: '1', prop: 'engineLevel', newValue: 1 },
      'updateDevice', { serialnumber: '1', engineLevel: 1 }],
    [{ serialnumber: '1', prop: 'currentBodyAlarm', newValue: 'Ok' },
      'updateDevice', { serialnumber: '1', currentBodyAlarm: 'Ok' }],
    [{ serialnumber: '1', prop: 'currentFanState', newValue: 'Ok' },
      'addFanState', { device: '1', state: 'Ok' }],
    [{
      serialnumber: '1', prop: 'currentLampState', lamp: 1, newValue: 'Ok',
    },
    'setAlarmState', { device: '1', state: 'Ok', lamp: 1 }],
    [{
      serialnumber: '1', prop: 'currentLampValue', lamp: 1, newValue: 10,
    },
    'addLampValue', { device: '1', lamp: 1, value: 10 }],
    [{ serialnumber: '1', prop: 'identifyMode', newValue: false },
      'updateDevice', { serialnumber: '1', identifyMode: false }],
    [{ serialnumber: '1', prop: 'eventMode', newValue: false },
      'updateDevice', { serialnumber: '1', eventMode: false }],
    [{ serialnumber: '1', prop: 'tacho', newValue: 10 },
      'addTacho', { device: '1', tacho: 10 }],
    [{ serialnumber: '1', prop: 'currentAirVolume', newValue: 10 },
      'addAirVolume', { device: '1', volume: 10 }],
  ])('Database Module gets %o and updates the database with %s method and %o as parameter', (event, dbMethod, result) => {
    const eventemitter = new EventEmitter();

    const db = {};
    db[dbMethod] = jest.fn();

    deviceStateChanged.databaseModule(eventemitter, db);

    eventemitter.emit('deviceStateChanged', event);

    expect(db[dbMethod]).toHaveBeenCalledWith(result);
  });
});
