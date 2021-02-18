/* eslint-disable max-classes-per-file */
const { EventEmitter } = require('events');
const addDeviceModule = require('../../../server/controlModules/Command/AddDeviceModule');

it('Test wether the addDeviceModule has alle required methods', () => {
  expect(Object.keys(addDeviceModule).length).toBe(8);
  expect(addDeviceModule.name).toBe('Command - AddDevice');
  expect(addDeviceModule.socketIOModule).toBeDefined();
  expect(addDeviceModule.mqttClientModule).toBeDefined();
  expect(addDeviceModule.databaseModule).toBeDefined();
  expect(addDeviceModule.removeSocketIOModule).toBeDefined();
  expect(addDeviceModule.removeMQTTClientModule).toBeDefined();
  expect(addDeviceModule.removeDatabaseModule).toBeDefined();
});

describe('SocketIO Section', () => {
  it('socketIO Module emits addDevice event on eventemitter on device_add event on socket', () => {
    const eventemitter = {
      emit: jest.fn(),
      on: jest.fn(),
    };

    const ioServer = {};

    const testDevice = {
      serialnumber: 1,
      name: 'Test',
    };

    class SocketEmitter extends EventEmitter {}
    const socket = new SocketEmitter();

    addDeviceModule.socketIOModule(eventemitter, socket, ioServer);
    socket.emit('device_add', testDevice);

    expect(eventemitter.emit).toHaveBeenCalledTimes(1);
    expect(eventemitter.emit).toHaveBeenCalledWith('addDevice', {
      name: 'Test',
      serialnumber: 1,
    });
  });

  it('SocketIO Module gets removed with removeSocketIOModule', () => {
    const eventemitter = {
      emit: jest.fn(),
      on: jest.fn(),
    };

    const ioServer = {};

    const testDevice = {
      serialnumber: 1,
      name: 'Test',
    };

    class SocketEmitter extends EventEmitter {}
    const socket = new SocketEmitter();
    jest.spyOn(socket, 'removeAllListeners');

    addDeviceModule.socketIOModule(eventemitter, socket, ioServer);
    addDeviceModule.removeSocketIOModule(eventemitter, socket, ioServer);
    expect(socket.removeAllListeners).toHaveBeenCalledTimes(1);
    socket.emit('device_add', testDevice);
    expect(eventemitter.emit).toHaveBeenCalledTimes(0);
  });
});

describe('Database Section', () => {
  it('Database Module saves Device on device_add event on eventemitter', (done) => {
    const database = {
      addDevice: (dev) => new Promise((res, rej) => res()),
      getDevice: (id) => new Promise((res, rej) => res({
        serialnumber: 1,
        name: 'Test',
      })),
    };

    class MyEmitter extends EventEmitter {}
    const eventemitter = new MyEmitter();

    const spy = jest.spyOn(eventemitter, 'emit');

    eventemitter.on('deviceAdded', (dev) => {
      expect(dev).toStrictEqual({
        serialnumber: 1,
        name: 'Test',
      });
      expect(spy).toHaveBeenCalledTimes(2);
      done();
    });

    addDeviceModule.databaseModule(eventemitter, database);
    eventemitter.emit('addDevice', {
      serialnumber: 1,
      name: 'Test',
    });
  });

  it('Database Module gets removed with removeDatabaseModule', () => {
    const database = {
      addDevice: (dev) => new Promise((res, rej) => res()),
    };

    class MyEmitter extends EventEmitter {}
    const eventemitter = new MyEmitter();
    const spy1 = jest.spyOn(eventemitter, 'removeAllListeners');
    const spy2 = jest.spyOn(eventemitter, 'emit');

    addDeviceModule.databaseModule(eventemitter, database);
    addDeviceModule.removeDatabaseModule(eventemitter, database);
    expect(spy1).toHaveBeenCalledTimes(1);
    eventemitter.emit('addDevice', {
      serialnumber: 1,
      name: 'Test',
    });
    expect(spy2).toHaveBeenCalledTimes(1);
  });
});
