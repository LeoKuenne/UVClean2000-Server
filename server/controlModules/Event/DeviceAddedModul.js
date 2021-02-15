function socketIO(eventemitter, ioSocket, ioServer) {
  console.log(`${module.exports.name} registering socketIO module`);

  eventemitter.on('deviceAdded', (device) => {
    console.log('Sending device_added', device);
    ioSocket.emit('device_added', device);
  });
}

function removeSocketIO(eventemitter, ioSocket, ioServer) {
  console.log(`${module.exports.name} removing socketIO module`);
  eventemitter.removeAllListeners('deviceAdded');
}

function mqtt(eventemitter, mqttClient) {
  console.log(`${module.exports.name} registering mqtt module`);
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
  name: 'Event - deviceAdded',
  registerModules,
  socketIOModule: socketIO,
  mqttClientModule: mqtt,
  databaseModule: database,
  removeSocketIOModule: removeSocketIO,
  removeMQTTClientModule: removeMQTT,
  removeDatabaseModule: removeDatabase,
};
