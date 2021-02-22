const MainLogger = require('../../Logger.js').logger;

const logger = MainLogger.child({ service: 'DeviceDeletedModule' });

function socketIO(eventemitter, ioSocket, ioServer) {
  logger.info('Registering socketIO module');

  eventemitter.on('deviceDeleted', (serialnumber) => {
    logger.info(`Sending device_deleted to socket ${ioSocket.id}`, serialnumber);
    ioSocket.emit('device_deleted', serialnumber);
  });
}

function removeSocketIO(eventemitter, ioSocket, ioServer) {
  logger.info('Removing socketIO module');
  eventemitter.removeAllListeners('deviceDeleted');
}

function mqtt(eventemitter, mqttClient) {
  logger.info('Registering mqtt module');
  eventemitter.on('deviceDeleted', (serialnumber) => {
    logger.info(`unsubscribing from UVClean/${serialnumber}/#`);
    mqttClient.unsubscribe(`UVClean/${serialnumber}/#`);
  });
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
  name: 'Event - deviceDeleted',
  registerModules,
  socketIOModule: socketIO,
  mqttClientModule: mqtt,
  databaseModule: database,
  removeSocketIOModule: removeSocketIO,
  removeMQTTClientModule: removeMQTT,
  removeDatabaseModule: removeDatabase,
};
