const MainLogger = require('../../Logger.js').logger;

const logger = MainLogger.child({ service: 'AddDeviceModule' });

function socketIO(eventemitter, ioSocket, ioServer) {
  logger.info('Registering socketIO module');
  ioSocket.on('device_add', (props) => {
    logger.info('Event: device_add:', props);

    const device = {
      serialnumber: props.serialnumber,
      name: props.name,
    };

    eventemitter.emit('addDevice', device);
  });
}

function removeSocketIO(eventemitter, ioSocket, ioServer) {
  logger.info('Removing socketIO module');
  ioSocket.removeAllListeners('device_add');
}

function mqtt(eventemitter, mqttClient) {
  logger.info('Registering mqtt module');
}

function removeMQTT(eventemitter, ioSocket, ioServer) {
  logger.info('Removing mqtt module');
}

function database(eventemitter, db) {
  logger.info('Registering database module');

  eventemitter.on('addDevice', async (device) => {
    logger.info(`adding Device ${device.serialnumber} | ${device.name} to database`);
    await db.addDevice(device);
    await db.getDevice(device.serialnumber).then((dev) => {
      logger.info('added Device to database, sending deviceAdded event', dev);
      eventemitter.emit('deviceAdded', dev);
    }).catch((err) => {
      console.error(err);
    });
  });
}

function removeDatabase(eventemitter, db) {
  logger.info('Removing database module');
  eventemitter.removeAllListeners('addDevice');
}

function registerModules(eventemitter, ioSocket, ioServer, mqttClient, databaseAdapter) {
  socketIO(eventemitter, ioSocket, ioServer);
  mqttClient(eventemitter, mqttClient);
  databaseAdapter(eventemitter, databaseAdapter);
}

module.exports = {
  name: 'Command - AddDevice',
  registerModules,
  socketIOModule: socketIO,
  mqttClientModule: mqtt,
  databaseModule: database,
  removeSocketIOModule: removeSocketIO,
  removeMQTTClientModule: removeMQTT,
  removeDatabaseModule: removeDatabase,
};
