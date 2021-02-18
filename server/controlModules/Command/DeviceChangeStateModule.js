function socketIO(eventemitter, ioSocket, ioServer) {
  console.log(`${module.exports.name} registering socketIO module`);
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
  console.log(`${module.exports.name} removing socketIO module`);
  ioSocket.removeAllListeners('device_changeState');
}

function mqtt(eventemitter, mqttClient) {
  console.log(`${module.exports.name} registering mqtt module`);
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
  console.log(`${module.exports.name} removing mqtt module`);
}

function database(eventemitter, db) {
  console.log(`${module.exports.name} registering database module`);
}

function removeDatabase(eventemitter, db) {
  console.log(`${module.exports.name} removing database module`);
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
