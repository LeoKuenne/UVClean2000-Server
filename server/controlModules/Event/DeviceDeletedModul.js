function socketIO(eventemitter, ioSocket, ioServer) {
  console.log(`${module.exports.name} registering socketIO module`);

  eventemitter.on('deviceDeleted', (device) => {
    console.log('Sending device_deleted', device);
    ioSocket.emit('device_deleted', device);
  });
}

function removeSocketIO(eventemitter, ioSocket, ioServer) {
  console.log(`${module.exports.name} removing socketIO module`);
  eventemitter.removeAllListeners('deviceDeleted');
}

function mqtt(eventemitter, mqttClient) {
  console.log(`${module.exports.name} registering mqtt module`);
  eventemitter.on('deviceDeleted', (device) => {
    mqttClient.unsubscribe(`UVClean/${device.serialnumber}/#`);
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
  name: 'Event - deviceDeleted',
  registerModules,
  socketIOModule: socketIO,
  mqttClientModule: mqtt,
  databaseModule: database,
  removeSocketIOModule: removeSocketIO,
  removeMQTTClientModule: removeMQTT,
  removeDatabaseModule: removeDatabase,
};
