const MainLogger = require('../../Logger.js').logger;

const logger = MainLogger.child({ service: 'GroupAddDeviceModule' });

function socketIO(eventemitter, ioSocket, ioServer) {
  logger.info('Registering socketIO module');
  ioSocket.on('group_addDevice', (props) => {
    logger.info('Event: group_addDevice ', props);

    const { device, group } = props;

    eventemitter.emit('group_AddDevice', device, group);
  });
}

function removeSocketIO(eventemitter, ioSocket, ioServer) {
  logger.info('Removing socketIO module');
  ioSocket.removeAllListeners('group_AddDevice');
}

function mqtt(eventemitter, mqttClient) {
  logger.info('Registering mqtt module');
}

function removeMQTT(eventemitter, ioSocket, ioServer) {
  logger.info('Removing mqtt module');
}

function database(eventemitter, db) {
  logger.info('Registering database module');
  eventemitter.on('group_AddDevice', async (device, group) => {
    db.addDeviceToGroup(device, group);
    const docDevice = await db.getDevice(device);
    const docGroup = await db.getGroup(group);
    eventemitter.emit('group_deviceAdded', docDevice, docGroup);
  });
}

function removeDatabase(eventemitter, db) {
  logger.info('Removing database module');
  eventemitter.removeAllListeners('group_AddDevice');
}

function registerModules(eventemitter, ioSocket, ioServer, mqttClient, databaseAdapter) {
  socketIO(eventemitter, ioSocket, ioServer);
  mqttClient(eventemitter, mqttClient);
  databaseAdapter(eventemitter, databaseAdapter);
}

module.exports = {
  name: 'Command - groupAddDevice',
  registerModules,
  socketIOModule: socketIO,
  mqttClientModule: mqtt,
  databaseModule: database,
  removeSocketIOModule: removeSocketIO,
  removeMQTTClientModule: removeMQTT,
  removeDatabaseModule: removeDatabase,
};
