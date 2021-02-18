/* eslint-disable max-classes-per-file */
const { EventEmitter } = require('events');
const groupAddedModule = require('../../../server/controlModules/Event/GroupAddedModule');

it('Test wether the groupAddedModule has alle required methods', () => {
  expect(Object.keys(groupAddedModule).length).toBe(8);
  expect(groupAddedModule.name).toBe('Event - groupAdded');
  expect(groupAddedModule.socketIOModule).toBeDefined();
  expect(groupAddedModule.mqttClientModule).toBeDefined();
  expect(groupAddedModule.databaseModule).toBeDefined();
  expect(groupAddedModule.removeSocketIOModule).toBeDefined();
  expect(groupAddedModule.removeMQTTClientModule).toBeDefined();
  expect(groupAddedModule.removeDatabaseModule).toBeDefined();
});

describe('SocketIO Section', () => {
  it('socketIO Module emits group_added event on socket on groupAdded event on eventemitter', () => {
    const eventemitter = new EventEmitter();
    const socket = new EventEmitter();
    const fn = jest.fn();

    const group = {
      serialnumber: 1,
      name: 'Test',
    };

    socket.on('group_added', fn);

    groupAddedModule.socketIOModule(eventemitter, socket, {});

    eventemitter.emit('groupAdded', group);

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('SocketIO Module gets removed with removeSocketIOModule', () => {
    const eventemitter = new EventEmitter();
    const socket = new EventEmitter();
    const fn = jest.fn();
    const spy = jest.spyOn(eventemitter, 'removeAllListeners');

    const group = {
      serialnumber: 1,
      name: 'Test',
    };

    socket.on('group_added', fn);

    groupAddedModule.socketIOModule(eventemitter, socket, {});
    groupAddedModule.removeSocketIOModule(eventemitter, socket, {});
    expect(spy).toHaveBeenCalledTimes(1);

    eventemitter.emit('groupAdded', group);

    expect(fn).toHaveBeenCalledTimes(0);
  });
});
