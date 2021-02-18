/* eslint-disable max-classes-per-file */
const { EventEmitter } = require('events');
const groupChangeState = require('../../../server/controlModules/Command/GroupChangeStateModule');

it('Test wether the groupChangeState has alle required methods', () => {
  expect(Object.keys(groupChangeState).length).toBe(8);
  expect(groupChangeState.name).toBe('Command - GroupChangeState');
  expect(groupChangeState.socketIOModule).toBeDefined();
  expect(groupChangeState.mqttClientModule).toBeDefined();
  expect(groupChangeState.databaseModule).toBeDefined();
  expect(groupChangeState.removeSocketIOModule).toBeDefined();
  expect(groupChangeState.removeMQTTClientModule).toBeDefined();
  expect(groupChangeState.removeDatabaseModule).toBeDefined();
});

describe('SocketIO Section', () => {
  it('socketIO Module emits groupChangeState event on eventemitter on group_changeState event on socket', () => {
    const eventemitter = {
      emit: jest.fn(),
      on: jest.fn(),
    };

    const ioServer = {};

    const testGroup = {
      id: 1,
      prop: 'name',
      newValue: 'Test Gruppe',
    };

    class SocketEmitter extends EventEmitter {}
    const socket = new SocketEmitter();

    groupChangeState.socketIOModule(eventemitter, socket, ioServer);
    socket.emit('group_changeState', testGroup);

    expect(eventemitter.emit).toHaveBeenCalledTimes(1);
    expect(eventemitter.emit).toHaveBeenCalledWith('groupChangeState', {
      id: 1,
      prop: 'name',
      newValue: 'Test Gruppe',
    });
  });

  it('SocketIO Module gets removed with removeSocketIOModule', () => {
    const eventemitter = {
      emit: jest.fn(),
      on: jest.fn(),
    };

    const ioServer = {};

    const testGroup = {
      id: 1,
      prop: 'name',
      newValue: 'Test Gruppe',
    };

    class SocketEmitter extends EventEmitter {}
    const socket = new SocketEmitter();
    jest.spyOn(socket, 'removeAllListeners');

    groupChangeState.socketIOModule(eventemitter, socket, ioServer);
    groupChangeState.removeSocketIOModule(eventemitter, socket, ioServer);
    expect(socket.removeAllListeners).toHaveBeenCalledTimes(1);
    socket.emit('group_changeState', testGroup);
    expect(eventemitter.emit).toHaveBeenCalledTimes(0);
  });
});

describe('Database Section', () => {
  it('Database Module updates database according to the event - name', (done) => {
    const eventemitter = new EventEmitter();
    const db = {
      updateGroup: (group) => group,
    };

    const spy = jest.spyOn(db, 'updateGroup');

    groupChangeState.databaseModule(eventemitter, db);

    eventemitter.emit('groupChangeState', {
      id: '1',
      prop: 'name',
      newValue: 'Test Gruppe',
    });

    eventemitter.on('groupStateChanged', (newState) => {
      expect(newState).toStrictEqual({
        id: '1',
        prop: 'name',
        newValue: 'Test Gruppe',
      });
      done();
    });

    expect(spy).toHaveBeenCalledWith({
      _id: '1',
      name: 'Test Gruppe',
    });
  });

  it('Database Module gets removed with removeDatabase', () => {
    const eventemitter = new EventEmitter();

    const db = {};

    const testGroup = {
      id: 1,
      prop: 'name',
      newValue: 'Test Gruppe',
    };

    const spy = jest.spyOn(eventemitter, 'removeAllListeners');
    const spy1 = jest.spyOn(eventemitter, 'emit');

    groupChangeState.databaseModule(eventemitter, db);
    groupChangeState.removeDatabaseModule(eventemitter, db);
    expect(spy).toHaveBeenCalledTimes(1);
    eventemitter.emit('groupChangeState', testGroup);
    expect(spy1).toHaveBeenCalledTimes(1);
  });
});
