const MainLogger = require('../../Logger.js').logger;

const logger = MainLogger.child({ service: 'DeviceChangeStateModule' });

function socketIO(eventemitter, ioSocket, ioServer) {
  logger.info('Registering socketIO module');
  ioSocket.on('device_changeState', (newState) => {
    const device = {
      serialnumber: newState.serialnumber,
      prop: newState.prop,
      newValue: newState.newValue,
    };

    eventemitter.emit('deviceChangeState', device);
  });
}

function removeSocketIO(eventemitter, ioSocket, ioServer) {
  logger.info('Removing socketIO module');
  ioSocket.removeAllListeners('device_changeState');
}

function mqtt(eventemitter, mqttClient) {
  logger.info('Registering mqtt module');
  eventemitter.on('deviceChangeState', (device) => {
    let propertie = '';
    switch (device.prop) {
      case 'state':
        propertie = 'engineState';
        break;
      default:
        propertie = device.prop;
        break;
    }
    mqttClient.publish(`UVClean/${device.serialnumber}/changeState/${propertie}`, `${device.newValue}`);
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
  name: 'Command - DeviceChangeState',
  registerModules,
  socketIOModule: socketIO,
  mqttClientModule: mqtt,
  databaseModule: database,
  removeSocketIOModule: removeSocketIO,
  removeMQTTClientModule: removeMQTT,
  removeDatabaseModule: removeDatabase,
};
