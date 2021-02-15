/* eslint-disable max-classes-per-file */
const { EventEmitter } = require('events');
const deviceChangeState = require('../../../server/controlModules/Command/DeviceChangeStateModul');

it('Test wether the deviceChangeState has alle required methods', () => {
  expect(Object.keys(deviceChangeState).length).toBe(8);
  expect(deviceChangeState.name).toBe('Command - DeviceChangeState');
  expect(deviceChangeState.socketIOModule).toBeDefined();
  expect(deviceChangeState.mqttClientModule).toBeDefined();
  expect(deviceChangeState.databaseModule).toBeDefined();
  expect(deviceChangeState.removeSocketIOModule).toBeDefined();
  expect(deviceChangeState.removeMQTTClientModule).toBeDefined();
  expect(deviceChangeState.removeDatabaseModule).toBeDefined();
});

describe('SocketIO Section', () => {
  it('socketIO Module emits deviceChangeState event on eventemitter on device_changeState event on socket', () => {
    const eventemitter = {
      emit: jest.fn(),
      on: jest.fn(),
    };

    const ioServer = {};

    const testDevice = {
      serialnumber: 1,
      prop: 'state',
      newValue: true,
    };

    class SocketEmitter extends EventEmitter {}
    const socket = new SocketEmitter();

    deviceChangeState.socketIOModule(eventemitter, socket, ioServer);
    socket.emit('device_changeState', testDevice);

    expect(eventemitter.emit).toHaveBeenCalledTimes(1);
    expect(eventemitter.emit).toHaveBeenCalledWith('deviceChangeState', {
      serialnumber: 1,
      prop: 'state',
      newValue: true,
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

    deviceChangeState.socketIOModule(eventemitter, socket, ioServer);
    deviceChangeState.removeSocketIOModule(eventemitter, socket, ioServer);
    expect(socket.removeAllListeners).toHaveBeenCalledTimes(1);
    socket.emit('device_changeState', testDevice);
    expect(eventemitter.emit).toHaveBeenCalledTimes(0);
  });
});

describe('MQTT Section', () => {
  it('MQTT Module send changeState command to the topic', () => {
    const eventemitter = new EventEmitter();

    const mqttClient = {
      publish: jest.fn(),
    };

    deviceChangeState.mqttClientModule(eventemitter, mqttClient);
    eventemitter.emit('deviceChangeState', {
      serialnumber: 1,
      prop: 'state',
      newValue: true,
    });

    expect(mqttClient.publish).toHaveBeenCalledWith('UVClean/1/changeState/engineState', 'true');
  });
});
