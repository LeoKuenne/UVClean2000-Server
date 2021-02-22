const MainLogger = require('../../Logger.js').logger;

const logger = MainLogger.child({ service: 'GroupDeleteDeviceModule' });

function socketIO(eventemitter, ioSocket, ioServer) {
  logger.info('Registering socketIO module');
  ioSocket.on('group_deleteDevice', (props) => {
    logger.info('Event: group_deleteDevice ', props);

    const { device, group } = props;

    eventemitter.emit('group_DeleteDevice', device, group);
  });
}

function removeSocketIO(eventemitter, ioSocket, ioServer) {
  logger.info('Removing socketIO module');
  ioSocket.removeAllListeners('group_DeleteDevice');
}

function mqtt(eventemitter, mqttClient) {
  logger.info('Registering mqtt module');
}

function removeMQTT(eventemitter, ioSocket, ioServer) {
  logger.info('Removing mqtt module');
}

function database(eventemitter, db) {
  logger.info('Registering database module');
  eventemitter.on('group_DeleteDevice', async (device, group) => {
    db.deleteDeviceFromGroup(device, group);
    const docDevice = await db.getDevice(device);
    const docGroup = await db.getGroup(group);
    eventemitter.emit('group_deviceDeleted', docDevice, docGroup);
  });
}

function removeDatabase(eventemitter, db) {
  logger.info('Removing database module');
  eventemitter.removeAllListeners('group_DeleteDevice');
}

function registerModules(eventemitter, ioSocket, ioServer, mqttClient, databaseAdapter) {
  socketIO(eventemitter, ioSocket, ioServer);
  mqttClient(eventemitter, mqttClient);
  databaseAdapter(eventemitter, databaseAdapter);
}

module.exports = {
  name: 'Command - groupDeleteDevice',
  registerModules,
  socketIOModule: socketIO,
  mqttClientModule: mqtt,
  databaseModule: database,
  removeSocketIOModule: removeSocketIO,
  removeMQTTClientModule: removeMQTT,
  removeDatabaseModule: removeDatabase,
};
