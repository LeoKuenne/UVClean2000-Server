const MainLogger = require('../logger.js').logger;

const logger = MainLogger.child({ service: 'Module' });

function socketIO(eventemitter, ioSocket, ioServer) {
  logger.info(`${module.exports.name} registering socketIO module`);
}

function removeSocketIO(eventemitter, ioSocket, ioServer) {
  logger.info(`${module.exports.name} removing socketIO module`);
}

function mqtt(eventemitter, mqttClient) {
  logger.info(`${module.exports.name} registering mqtt module`);
}

function removeMQTT(eventemitter, ioSocket, ioServer) {
  logger.info(`${module.exports.name} removing mqtt module`);
}

function database(eventemitter, db) {
  logger.info(`${module.exports.name} registering database module`);
  });
}

function removeDatabase(eventemitter, db) {
  logger.info(`${module.exports.name} removing database module`);
}

function registerModules(eventemitter, ioSocket, ioServer, mqttClient, databaseAdapter) {
  socketIO(eventemitter, ioSocket, ioServer);
  mqttClient(eventemitter, mqttClient);
  databaseAdapter(eventemitter, databaseAdapter);
}

module.exports = {
  name: 'Blueprint',
  registerModules,
  socketIOModule: socketIO,
  mqttClientModule: mqtt,
  databaseModule: database,
  removeSocketIOModule: removeSocketIO,
  removeMQTTClientModule: removeMQTT,
  removeDatabaseModule: removeDatabase,
};
