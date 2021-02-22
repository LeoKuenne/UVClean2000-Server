const MainLogger = require('../../Logger.js').logger;

const logger = MainLogger.child({ service: 'GroupDeviceAddedModule' });

function socketIO(eventemitter, ioSocket, ioServer) {
  logger.info('Registering socketIO module');

  eventemitter.on('group_deviceAdded', (device, group) => {
    logger.info(`Sending group_deviceAdded to socket ${ioSocket.id}`, device, group);
    ioSocket.emit('group_deviceAdded', { device, group });
  });
}

function removeSocketIO(eventemitter, ioSocket, ioServer) {
  logger.info('Removing socketIO module');
  eventemitter.removeAllListeners('groupAdded');
}

function mqtt(eventemitter, mqttClient) {
  logger.info('Registering mqtt module');
}

function removeMQTT(eventemitter, ioSocket, ioServer) {
  logger.info('Removing mqtt module');
}

function database(eventemitter, db) {
  logger.info('Registering database module');
}

function removeDatabase(eventemitter, db) {
  logger.info('Removing database module');
}

function registerModules(eventemitter, ioSocket, ioServer, mqttClient, databaseAdapter) {
  socketIO(eventemitter, ioSocket, ioServer);
  mqttClient(eventemitter, mqttClient);
  databaseAdapter(eventemitter, databaseAdapter);
}

module.exports = {
  name: 'Event - groupDeviceAdded',
  registerModules,
  socketIOModule: socketIO,
  mqttClientModule: mqtt,
  databaseModule: database,
  removeSocketIOModule: removeSocketIO,
  removeMQTTClientModule: removeMQTT,
  removeDatabaseModule: removeDatabase,
};
