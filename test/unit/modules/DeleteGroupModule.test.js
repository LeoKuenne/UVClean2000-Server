/* eslint-disable max-classes-per-file */
const { EventEmitter } = require('events');
const deleteGroupModule = require('../../../server/controlModules/Command/DeleteGroupModule');

it('Test wether the deleteGroupModule has alle required methods', () => {
  expect(Object.keys(deleteGroupModule).length).toBe(8);
  expect(deleteGroupModule.name).toBe('Command - DeleteGroup');
  expect(deleteGroupModule.socketIOModule).toBeDefined();
  expect(deleteGroupModule.mqttClientModule).toBeDefined();
  expect(deleteGroupModule.databaseModule).toBeDefined();
  expect(deleteGroupModule.removeSocketIOModule).toBeDefined();
  expect(deleteGroupModule.removeMQTTClientModule).toBeDefined();
  expect(deleteGroupModule.removeDatabaseModule).toBeDefined();
});

describe('SocketIO Section', () => {
  it('socketIO Module emits groupDelete event on eventemitter, on group_add event on socket', (done) => {
    const socket = new EventEmitter();
    const eventemitter = new EventEmitter();

    eventemitter.on('deleteGroup', (id) => {
      expect(id).toBe('1');
      done();
    });

    deleteGroupModule.socketIOModule(eventemitter, socket, {});

    socket.emit('group_delete', '1');
  });

  it('SocketIO Module gets removed with removeSocketIOModule', () => {
    const socket = new EventEmitter();
    const eventemitter = new EventEmitter();

    const spy = jest.spyOn(socket, 'removeAllListeners');
    const fn = jest.fn();

    eventemitter.on('deleteGroup', fn);

    deleteGroupModule.socketIOModule(eventemitter, socket, {});
    deleteGroupModule.removeSocketIOModule(eventemitter, socket, {});
    expect(spy).toHaveBeenCalledTimes(1);

    socket.emit('group_delete', '1');

    expect(fn).toHaveBeenCalledTimes(0);
  });
});

describe('Database Section', () => {
  it('database Module emits groupDeleted event and deletes group', (done) => {
    const database = {
      deleteGroup: (id) => new Promise((res, rej) => res({ id })),
      getGroup: (id) => new Promise((res, rej) => { throw new Error('Group does not exists'); }),
    };

    const eventemitter = new EventEmitter();
    eventemitter.on('groupDeleted', (id) => {
      expect(id).toBe('1');
      done();
    });

    deleteGroupModule.databaseModule(eventemitter, database);
    eventemitter.emit('deleteGroup', '1');
  });

  it('database Module gets removed with removeDatabaseModule', () => {
    const database = {};

    const fn = jest.fn();

    const eventemitter = new EventEmitter();
    eventemitter.on('groupDeleted', fn);

    const spy = jest.spyOn(eventemitter, 'removeAllListeners');

    deleteGroupModule.databaseModule(eventemitter, database);
    deleteGroupModule.removeDatabaseModule(eventemitter, database);
    expect(spy).toHaveBeenCalledTimes(1);

    eventemitter.emit('deleteGroup', '1');

    expect(fn).toHaveBeenCalledTimes(0);
  });
});
