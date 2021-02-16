/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
const { EventEmitter } = require('events');
const deviceStateChanged = require('../../../server/controlModules/Event/DeviceStateChangedModul');

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
  it('MQTT Module sends deviceStateChanged to eventemitter with correct props - engineState', (done) => {
    const eventemitter = new EventEmitter();

    class MQTTClient extends EventEmitter {
      subscribe(topic, cb) {
        cb();
      }
    }

    const mqttClient = new MQTTClient();

    eventemitter.on('deviceStateChanged', (device) => {
      expect(device.serialnumber).toBe('1');
      expect(device.prop).toBe('engineState');
      expect(device.newValue).toBe(false);
      done();
    });

    deviceStateChanged.mqttClientModule(eventemitter, mqttClient);
    mqttClient.emit('message', 'UVClean/1/changeState/engineState', false);
  });

  it('MQTT Module sends deviceStateChanged to eventemitter - alarm', (done) => {
    const eventemitter = new EventEmitter();

    class MQTTClient extends EventEmitter {
      subscribe(topic, cb) {
        cb();
      }
    }

    const mqttClient = new MQTTClient();

    eventemitter.on('deviceStateChanged', (device) => {
      expect(device.serialnumber).toBe('1');
      expect(device.prop).toBe('alarm');
      expect(device.lamp).toBe(1);
      expect(device.newValue).toBe('Alarm');
      done();
    });

    deviceStateChanged.mqttClientModule(eventemitter, mqttClient);
    mqttClient.emit('message', 'UVClean/1/changeState/alarm/1', 'Alarm');
  });

  it('MQTT Module sends deviceStateChanged to eventemitter - airVolume', (done) => {
    const eventemitter = new EventEmitter();

    class MQTTClient extends EventEmitter {
      subscribe(topic, cb) {
        cb();
      }
    }

    const mqttClient = new MQTTClient();

    eventemitter.on('deviceStateChanged', (newState) => {
      expect(newState.serialnumber).toBe('1');
      expect(newState.prop).toBe('currentAirVolume');
      expect(newState.newValue).toBe(100);
      done();
    });

    deviceStateChanged.mqttClientModule(eventemitter, mqttClient);
    mqttClient.emit('message', 'UVClean/1/changeState/airVolume', 100);
  });

  it('MQTT Module sends deviceStateChanged to eventemitter - tacho', (done) => {
    const eventemitter = new EventEmitter();

    class MQTTClient extends EventEmitter {
      subscribe(topic, cb) {
        cb();
      }
    }

    const mqttClient = new MQTTClient();

    eventemitter.on('deviceStateChanged', (newState) => {
      expect(newState.serialnumber).toBe('1');
      expect(newState.prop).toBe('tacho');
      expect(newState.newValue).toBe(100);
      done();
    });

    deviceStateChanged.mqttClientModule(eventemitter, mqttClient);
    mqttClient.emit('message', 'UVClean/1/changeState/tacho', 100);
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

  it('Database Module updates database according to the event - airVolume', () => {
    const eventemitter = new EventEmitter();
    const db = {
      addAirVolume: jest.fn(),
    };

    deviceStateChanged.databaseModule(eventemitter, db);

    eventemitter.emit('deviceStateChanged', {
      serialnumber: '1',
      prop: 'airVolume',
      newValue: 123,
    });

    expect(db.addAirVolume).toHaveBeenCalledWith({
      device: '1',
      volume: 123,
    });
  });
});
