function socketIO(eventemitter, ioSocket, ioServer) {
  console.log(`${module.exports.name} registering socketIO module`);
  ioSocket.on('device_add', (props) => {
    console.log('Event: device_add:', props);

    const device = {
      serialnumber: props.serialnumber,
      name: props.name,
      state: false,
      engineLevel: 1,
      currentError: '',
      identifyMode: false,
      eventMode: false,
      rotationSpeed: 0,
      currentAirVolume: 0,
    };

    eventemitter.emit('addDevice', device);
  });
}

function removeSocketIO(eventemitter, ioSocket, ioServer) {
  console.log(`${module.exports.name} removing socketIO module`);
  ioSocket.removeAllListeners('device_add');
}

function mqtt(eventemitter, mqttClient) {
  console.log(`${module.exports.name} registering mqtt module`);
}

function removeMQTT(eventemitter, ioSocket, ioServer) {
  console.log(`${module.exports.name} removing mqtt module`);
}

function database(eventemitter, db) {
  console.log(`${module.exports.name} registering database module`);

  eventemitter.on('addDevice', async (device) => {
    console.log(`adding Device ${device.serialnumber} | ${device.name} to database`);
    await db.addDevice(device).then(() => {
      console.log('added Device to database, sending deviceAdded event', device.serialnumber, device.name);
      eventemitter.emit('deviceAdded', device);
    }).catch((err) => {
      console.error(err);
    });
  });
}

function removeDatabase(eventemitter, db) {
  console.log(`${module.exports.name} removing database module`);
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
