const MainLogger = require('../../logger.js').logger;

const logger = MainLogger.child({ service: 'DeviceAddedModule' });

function socketIO(eventemitter, ioSocket, ioServer) {
  logger.info('Registering socketIO module');

  eventemitter.on('deviceAdded', (device) => {
    logger.info(`Sending device_added to socket ${ioSocket.id}`, device);
    ioSocket.emit('device_added', device);
  });
}

function removeSocketIO(eventemitter, ioSocket, ioServer) {
  logger.info('Removing socketIO module');
  eventemitter.removeAllListeners('deviceAdded');
}

function mqtt(eventemitter, mqttClient) {
  logger.info('Registering mqtt module');
  eventemitter.on('deviceAdded', (device) => {
    logger.info(`subscribe from UVClean/${device.serialnumber}/#`);
    mqttClient.subscribe(`UVClean/${device.serialnumber}/#`);
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
  name: 'Event - deviceAdded',
  registerModules,
  socketIOModule: socketIO,
  mqttClientModule: mqtt,
  databaseModule: database,
  removeSocketIOModule: removeSocketIO,
  removeMQTTClientModule: removeMQTT,
  removeDatabaseModule: removeDatabase,
};
