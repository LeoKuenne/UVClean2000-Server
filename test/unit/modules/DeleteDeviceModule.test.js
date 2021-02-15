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
