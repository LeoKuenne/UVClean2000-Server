const MainLogger = require('../../logger.js').logger;

const logger = MainLogger.child({ service: 'DeleteGroupModule' });

function socketIO(eventemitter, ioSocket, ioServer) {
  logger.info('Registering socketIO module');
  ioSocket.on('group_delete', (id) => {
    eventemitter.emit('deleteGroup', id);
  });
}

function removeSocketIO(eventemitter, ioSocket, ioServer) {
  logger.info('Removing socketIO module');
  ioSocket.removeAllListeners('group_delete');
}

function mqtt(eventemitter, mqttClient) {
  logger.info('Registering mqtt module');
}

function removeMQTT(eventemitter, ioSocket, ioServer) {
  logger.info('Removing mqtt module');
}

function database(eventemitter, db) {
  logger.info('Registering database module');
  eventemitter.on('deleteGroup', async (group) => {
    const dbGroup = await db.deleteGroup(group);
    const docGroup = await db.getGroup(`${dbGroup.id}`).catch((e) => {
      logger.info(e);
      if (e.message === 'Group does not exists') {
        eventemitter.emit('groupDeleted', group);
      }
    }).catch((err) => {
      console.error(err);
    });
  });
}

function removeDatabase(eventemitter, db) {
  logger.info('Removing database module');
  eventemitter.removeAllListeners('deleteGroup');
}

function registerModules(eventemitter, ioSocket, ioServer, mqttClient, databaseAdapter) {
  socketIO(eventemitter, ioSocket, ioServer);
  mqttClient(eventemitter, mqttClient);
  databaseAdapter(eventemitter, databaseAdapter);
}

module.exports = {
  name: 'Command - DeleteGroup',
  registerModules,
  socketIOModule: socketIO,
  mqttClientModule: mqtt,
  databaseModule: database,
  removeSocketIOModule: removeSocketIO,
  removeMQTTClientModule: removeMQTT,
  removeDatabaseModule: removeDatabase,
};
