/* eslint-disable max-classes-per-file */
const { EventEmitter } = require('events');
const deviceDeletedModule = require('../../../server/controlModules/Event/DeviceDeletedModule');

it('Test wether the deviceDeletedModule has alle required methods', () => {
  expect(Object.keys(deviceDeletedModule).length).toBe(8);
  expect(deviceDeletedModule.name).toBe('Event - deviceDeleted');
  expect(deviceDeletedModule.socketIOModule).toBeDefined();
  expect(deviceDeletedModule.mqttClientModule).toBeDefined();
  expect(deviceDeletedModule.databaseModule).toBeDefined();
  expect(deviceDeletedModule.removeSocketIOModule).toBeDefined();
  expect(deviceDeletedModule.removeMQTTClientModule).toBeDefined();
  expect(deviceDeletedModule.removeDatabaseModule).toBeDefined();
});

describe('SocketIO Section', () => {
  it('socketIO Module emits device_deleted event on socket on deviceDeleted event on eventemitter', () => {
    const eventemitter = new EventEmitter();
    const socket = new EventEmitter();
    const fn = jest.fn();

    const serialnumber = '1';

    socket.on('device_deleted', fn);

    deviceDeletedModule.socketIOModule(eventemitter, socket, {});

    eventemitter.emit('deviceDeleted', serialnumber);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(serialnumber);
  });

  it('SocketIO Module gets removed with removeSocketIOModule', () => {
    const eventemitter = new EventEmitter();
    const socket = new EventEmitter();
    const fn = jest.fn();
    const spy = jest.spyOn(eventemitter, 'removeAllListeners');

    const serialnumber = '1';

    socket.on('device_deleted', fn);

    deviceDeletedModule.socketIOModule(eventemitter, socket, {});
    deviceDeletedModule.removeSocketIOModule(eventemitter, socket, {});
    expect(spy).toHaveBeenCalledTimes(1);

    eventemitter.emit('deviceDeleted', serialnumber);

    expect(fn).toHaveBeenCalledTimes(0);
  });
});

describe('MQTT Section', () => {
  it('MQTT Module unsubscribes from device when it is deleted', () => {
    const eventemitter = new EventEmitter();

    const mqttClient = {
      unsubscribe: jest.fn(),
    };

    const serialnumber = '1';

    deviceDeletedModule.mqttClientModule(eventemitter, mqttClient);
    eventemitter.emit('deviceDeleted', serialnumber);

    expect(mqttClient.unsubscribe).toHaveBeenCalledWith(`UVClean/${serialnumber}/#`);
  });
});
