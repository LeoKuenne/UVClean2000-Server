/* eslint-disable max-classes-per-file */
const { EventEmitter } = require('events');
const groupStateChangedModule = require('../../../server/controlModules/Event/GroupStateChangedModule');

it('Test wether the groupStateChanged has alle required methods', () => {
  expect(Object.keys(groupStateChangedModule).length).toBe(8);
  expect(groupStateChangedModule.name).toBe('Event - groupStateChanged');
  expect(groupStateChangedModule.socketIOModule).toBeDefined();
  expect(groupStateChangedModule.mqttClientModule).toBeDefined();
  expect(groupStateChangedModule.databaseModule).toBeDefined();
  expect(groupStateChangedModule.removeSocketIOModule).toBeDefined();
  expect(groupStateChangedModule.removeMQTTClientModule).toBeDefined();
  expect(groupStateChangedModule.removeDatabaseModule).toBeDefined();
});

describe('SocketIO Section', () => {
  it('socketIO Module emits group_stateChanged event on socket on groupStateChanged event on eventemitter', () => {
    const eventemitter = new EventEmitter();
    const socket = new EventEmitter();
    const fn = jest.fn();

    const newState = {
      id: '1',
      prop: 'name',
      newValue: 'Test Group',
    };

    socket.on('group_stateChanged', fn);

    groupStateChangedModule.socketIOModule(eventemitter, socket, {});

    eventemitter.emit('groupStateChanged', newState);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(newState);
  });

  it('SocketIO Module gets removed with removeSocketIOModule', () => {
    const eventemitter = new EventEmitter();
    const socket = new EventEmitter();
    const fn = jest.fn();
    const spy = jest.spyOn(eventemitter, 'removeAllListeners');

    const newState = {
      id: '1',
      prop: 'name',
      newValue: 'Test Group',
    };

    socket.on('group_stateChanged', fn);

    groupStateChangedModule.socketIOModule(eventemitter, socket, {});
    groupStateChangedModule.removeSocketIOModule(eventemitter, socket, {});
    expect(spy).toHaveBeenCalledTimes(1);

    eventemitter.emit('groupStateChanged', newState);

    expect(fn).toHaveBeenCalledTimes(0);
  });
});
