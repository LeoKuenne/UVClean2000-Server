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
    ['UVClean/1/stateChanged/alarm/tempFan', 'Ok', { serialnumber: '1', prop: 'currentFanAlarm', newValue: 'Ok' }],
    ['UVClean/1/stateChanged/alarm/1', 'Ok', {
      serialnumber: '1', prop: 'currentLampAlarm', lamp: 1, newValue: 'Ok',
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
  it('Database Module updates database according to the event - engineState / default', () => {
    const eventemitter = new EventEmitter();
    const db = {
      updateDevice: jest.fn(),
    };

    deviceStateChanged.databaseModule(eventemitter, db);

    eventemitter.emit('deviceStateChanged', {
      serialnumber: '1',
      prop: 'engineState',
      newValue: true,
    });

    expect(db.updateDevice).toHaveBeenCalledWith({
      serialnumber: '1',
      engineState: true,
    });
  });

  it('Database Module updates database according to the event - alarm', () => {
    const eventemitter = new EventEmitter();
    const db = {
      setAlarmState: jest.fn(),
    };

    deviceStateChanged.databaseModule(eventemitter, db);

    eventemitter.emit('deviceStateChanged', {
      serialnumber: '1',
      prop: 'alarm',
      newValue: 'Alarm',
      lamp: 1,
    });

    expect(db.setAlarmState).toHaveBeenCalledWith({
      device: '1',
      state: 'Alarm',
      lamp: 1,
    });
  });

  it('Database Module updates database according to the event - currentAirVolume', () => {
    const eventemitter = new EventEmitter();
    const db = {
      addAirVolume: jest.fn(),
    };

    deviceStateChanged.databaseModule(eventemitter, db);

    eventemitter.emit('deviceStateChanged', {
      serialnumber: '1',
      prop: 'currentAirVolume',
      newValue: 123,
    });

    expect(db.addAirVolume).toHaveBeenCalledWith({
      device: '1',
      volume: 123,
    });
  });
});
