/* eslint-disable max-classes-per-file */
const { EventEmitter } = require('events');
const deleteDeviceModule = require('../../../server/controlModules/Command/DeleteDeviceModul');

it('Test wether the deleteDeviceModule has alle required methods', () => {
  expect(Object.keys(deleteDeviceModule).length).toBe(8);
  expect(deleteDeviceModule.name).toBe('Command - DeleteDevice');
  expect(deleteDeviceModule.socketIOModule).toBeDefined();
  expect(deleteDeviceModule.mqttClientModule).toBeDefined();
  expect(deleteDeviceModule.databaseModule).toBeDefined();
  expect(deleteDeviceModule.removeSocketIOModule).toBeDefined();
  expect(deleteDeviceModule.removeMQTTClientModule).toBeDefined();
  expect(deleteDeviceModule.removeDatabaseModule).toBeDefined();
});

describe('SocketIO Section', () => {
  it('socketIO Module emits deviceDelete event on eventemitter, on device_add event on socket', (done) => {
    const socket = new EventEmitter();
    const eventemitter = new EventEmitter();

    const device = {
      serialnumber: '1',
      name: 'Test',
    };

    eventemitter.on('deleteDevice', (d) => {
      expect(d.serialnumber).toBe(device.serialnumber);
      done();
    });

    deleteDeviceModule.socketIOModule(eventemitter, socket, {});

    socket.emit('device_delete', device);
  });

  it('SocketIO Module gets removed with removeSocketIOModule', () => {
    const socket = new EventEmitter();
    const eventemitter = new EventEmitter();

    const spy = jest.spyOn(socket, 'removeAllListeners');
    const fn = jest.fn();

    const device = {
      serialnumber: '1',
      name: 'Test',
    };

    eventemitter.on('deleteDevice', fn);

    deleteDeviceModule.socketIOModule(eventemitter, socket, {});
    deleteDeviceModule.removeSocketIOModule(eventemitter, socket, {});
    expect(spy).toHaveBeenCalledTimes(1);

    socket.emit('device_delete', device);

    expect(fn).toHaveBeenCalledTimes(0);
  });
});

describe('Database Section', () => {
  it('database Module emits deviceDeleted event and deletes device', (done) => {
    const database = {
      deleteDevice: (serialnumber) => new Promise((res, rej) => res({ serialnumber })),
    };

    const eventemitter = new EventEmitter();
    eventemitter.on('deviceDeleted', (serialnumber) => {
      expect(serialnumber).toBe('1');
      done();
    });

    deleteDeviceModule.databaseModule(eventemitter, database);
    eventemitter.emit('deleteDevice', { serialnumber: '1' });
  });

  it('database Module gets removed with removeDatabaseModule', () => {
    const database = {};

    const fn = jest.fn();

    const eventemitter = new EventEmitter();
    eventemitter.on('deviceDeleted', fn);

    const spy = jest.spyOn(eventemitter, 'removeAllListeners');

    deleteDeviceModule.databaseModule(eventemitter, database);
    deleteDeviceModule.removeDatabaseModule(eventemitter, database);
    expect(spy).toHaveBeenCalledTimes(1);

    eventemitter.emit('deleteDevice', { serialnumber: '1' });

    expect(fn).toHaveBeenCalledTimes(0);
  });
});
