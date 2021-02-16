/* eslint-disable max-classes-per-file */
const { EventEmitter } = require('events');
const deviceAddedModule = require('../../../server/controlModules/Event/DeviceAddedModul');

it('Test wether the deviceAddedModule has alle required methods', () => {
  expect(Object.keys(deviceAddedModule).length).toBe(8);
  expect(deviceAddedModule.name).toBe('Event - deviceAdded');
  expect(deviceAddedModule.socketIOModule).toBeDefined();
  expect(deviceAddedModule.mqttClientModule).toBeDefined();
  expect(deviceAddedModule.databaseModule).toBeDefined();
  expect(deviceAddedModule.removeSocketIOModule).toBeDefined();
  expect(deviceAddedModule.removeMQTTClientModule).toBeDefined();
  expect(deviceAddedModule.removeDatabaseModule).toBeDefined();
});

describe('SocketIO Section', () => {
  it('socketIO Module emits device_added event on socket on device_add event on eventemitter', () => {
    const eventemitter = new EventEmitter();
    const socket = new EventEmitter();
    const fn = jest.fn();

    const device = {
      serialnumber: 1,
      name: 'Test',
    };

    socket.on('device_added', fn);

    deviceAddedModule.socketIOModule(eventemitter, socket, {});

    eventemitter.emit('deviceAdded', device);

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('SocketIO Module gets removed with removeSocketIOModule', () => {
    const eventemitter = new EventEmitter();
    const socket = new EventEmitter();
    const fn = jest.fn();
    const spy = jest.spyOn(eventemitter, 'removeAllListeners');

    const device = {
      serialnumber: 1,
      name: 'Test',
    };

    socket.on('device_added', fn);

    deviceAddedModule.socketIOModule(eventemitter, socket, {});
    deviceAddedModule.removeSocketIOModule(eventemitter, socket, {});
    expect(spy).toHaveBeenCalledTimes(1);

    eventemitter.emit('deviceAdded', device);

    expect(fn).toHaveBeenCalledTimes(0);
  });
});

describe('MQTT Section', () => {
  it('MQTT Module subscribes to device when it is added', () => {
    const eventemitter = new EventEmitter();

    const mqttClient = {
      subscribe: jest.fn(),
    };

    const device = {
      serialnumber: '1',
      name: 'Test',
    };

    deviceAddedModule.mqttClientModule(eventemitter, mqttClient);
    eventemitter.emit('deviceAdded', device);

    expect(mqttClient.subscribe).toHaveBeenCalledWith(`UVClean/${device.serialnumber}/#`);
  });
});
