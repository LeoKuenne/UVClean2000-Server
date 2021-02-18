/* eslint-disable max-classes-per-file */
const { EventEmitter } = require('events');
const groupDeletedModule = require('../../../server/controlModules/Event/GroupDeletedModule');

it('Test wether the groupDeletedModule has alle required methods', () => {
  expect(Object.keys(groupDeletedModule).length).toBe(8);
  expect(groupDeletedModule.name).toBe('Event - groupDeleted');
  expect(groupDeletedModule.socketIOModule).toBeDefined();
  expect(groupDeletedModule.mqttClientModule).toBeDefined();
  expect(groupDeletedModule.databaseModule).toBeDefined();
  expect(groupDeletedModule.removeSocketIOModule).toBeDefined();
  expect(groupDeletedModule.removeMQTTClientModule).toBeDefined();
  expect(groupDeletedModule.removeDatabaseModule).toBeDefined();
});

describe('SocketIO Section', () => {
  it('socketIO Module emits group_deleted event on socket on groupDeleted event on eventemitter', () => {
    const eventemitter = new EventEmitter();
    const socket = new EventEmitter();
    const fn = jest.fn();

    socket.on('group_deleted', fn);

    groupDeletedModule.socketIOModule(eventemitter, socket, {});

    eventemitter.emit('groupDeleted', '1');

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('1');
  });

  it('SocketIO Module gets removed with removeSocketIOModule', () => {
    const eventemitter = new EventEmitter();
    const socket = new EventEmitter();
    const fn = jest.fn();
    const spy = jest.spyOn(eventemitter, 'removeAllListeners');

    socket.on('group_deleted', fn);

    groupDeletedModule.socketIOModule(eventemitter, socket, {});
    groupDeletedModule.removeSocketIOModule(eventemitter, socket, {});
    expect(spy).toHaveBeenCalledTimes(1);

    eventemitter.emit('groupDeleted', '1');

    expect(fn).toHaveBeenCalledTimes(0);
  });
});
