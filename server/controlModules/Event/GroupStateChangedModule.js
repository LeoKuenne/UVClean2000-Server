const MainLogger = require('../../Logger.js').logger;

const logger = MainLogger.child({ service: 'GroupStateChangedModule' });

function socketIO(eventemitter, ioSocket, ioServer) {
  logger.info('Registering socketIO module');
  eventemitter.on('groupStateChanged', (newState) => {
    ioSocket.emit('group_stateChanged', {
      id: newState.id,
      prop: newState.prop,
      newValue: newState.newValue,
    });
  });
}

function removeSocketIO(eventemitter, ioSocket, ioServer) {
  logger.info('Removing socketIO module');
  eventemitter.removeAllListeners('groupStateChanged');
}

function mqtt(eventemitter, mqttClient) {
}

function removeMQTT(eventemitter, mqttClient) {
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
  name: 'Event - groupStateChanged',
  registerModules,
  socketIOModule: socketIO,
  mqttClientModule: mqtt,
  databaseModule: database,
  removeSocketIOModule: removeSocketIO,
  removeMQTTClientModule: removeMQTT,
  removeDatabaseModule: removeDatabase,
};
