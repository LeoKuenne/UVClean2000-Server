/* eslint-disable max-classes-per-file */
const { EventEmitter } = require('events');
const addGroupModule = require('../../../server/controlModules/Command/AddGroupModule');

it('Test wether the addGroupModule has alle required methods', () => {
  expect(Object.keys(addGroupModule).length).toBe(8);
  expect(addGroupModule.name).toBe('Command - AddGroup');
  expect(addGroupModule.socketIOModule).toBeDefined();
  expect(addGroupModule.mqttClientModule).toBeDefined();
  expect(addGroupModule.databaseModule).toBeDefined();
  expect(addGroupModule.removeSocketIOModule).toBeDefined();
  expect(addGroupModule.removeMQTTClientModule).toBeDefined();
  expect(addGroupModule.removeDatabaseModule).toBeDefined();
});

describe('SocketIO Section', () => {
  it('socketIO Module emits addGroup event on eventemitter on group_add event on socket', () => {
    const eventemitter = {
      emit: jest.fn(),
      on: jest.fn(),
    };

    const ioServer = {};

    class SocketEmitter extends EventEmitter {}
    const socket = new SocketEmitter();

    addGroupModule.socketIOModule(eventemitter, socket, ioServer);
    socket.emit('group_add', 'Test Group');

    expect(eventemitter.emit).toHaveBeenCalledTimes(1);
    expect(eventemitter.emit).toHaveBeenCalledWith('addGroup', 'Test Group');
  });

  it('SocketIO Module gets removed with removeSocketIOModule', () => {
    const eventemitter = {
      emit: jest.fn(),
      on: jest.fn(),
    };

    const ioServer = {};

    class SocketEmitter extends EventEmitter {}
    const socket = new SocketEmitter();
    jest.spyOn(socket, 'removeAllListeners');

    addGroupModule.socketIOModule(eventemitter, socket, ioServer);
    addGroupModule.removeSocketIOModule(eventemitter, socket, ioServer);
    expect(socket.removeAllListeners).toHaveBeenCalledTimes(1);
    socket.emit('group_add', 'Test Group');
    expect(eventemitter.emit).toHaveBeenCalledTimes(0);
  });
});

describe('Database Section', () => {
  it('Database Module saves Group on group_add event on eventemitter', (done) => {
    const database = {
      addGroup: (name) => new Promise((res, rej) => res({ _id: '123', name })),
      getGroup: (id) => new Promise((res, rej) => res({
        _id: '1',
        name: 'Test',
      })),
    };

    class MyEmitter extends EventEmitter {}
    const eventemitter = new MyEmitter();

    const spy = jest.spyOn(eventemitter, 'emit');

    eventemitter.on('groupAdded', (dev) => {
      expect(dev).toStrictEqual({
        id: '1',
        name: 'Test',
      });
      expect(spy).toHaveBeenCalledTimes(2);
      done();
    });

    addGroupModule.databaseModule(eventemitter, database);
    eventemitter.emit('addGroup', 'Test');
  });

  it('Database Module gets removed with removeDatabaseModule', () => {
    const database = {
      addGroup: (dev) => new Promise((res, rej) => res()),
    };

    class MyEmitter extends EventEmitter {}
    const eventemitter = new MyEmitter();
    const spy1 = jest.spyOn(eventemitter, 'removeAllListeners');
    const spy2 = jest.spyOn(eventemitter, 'emit');

    addGroupModule.databaseModule(eventemitter, database);
    addGroupModule.removeDatabaseModule(eventemitter, database);
    expect(spy1).toHaveBeenCalledTimes(1);
    eventemitter.emit('addGroup', 'Test');
    expect(spy2).toHaveBeenCalledTimes(1);
  });
});
