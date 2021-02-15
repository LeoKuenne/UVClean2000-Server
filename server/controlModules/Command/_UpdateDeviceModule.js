function socketIO(eventemitter, ioSocket, ioServer) {
  console.log(`${module.exports.name} registering socketIO module`);
  ioSocket.on('device_update', async (device) => {
    console.log('Event: device_update:', device);
    const newDevice = {
      serialnumber: device.serialnumber,
      propertie: 'name',
      newValue: device.name,
    };

    eventemitter.emit('deviceUpdate', newDevice);
  });
}

function removeSocketIO(eventemitter, ioSocket, ioServer) {
  console.log(`${module.exports.name} removing socketIO module`);
}

function mqtt(eventemitter, mqttClient) {
  console.log(`${module.exports.name} registering mqtt module`);
  eventemitter.on('deviceUpdate', (device) => {
    mqttClient.publish(`UVClean/${device.serialnumber}/change_state/${device.propertie}`, `${device.newValue}`, (err) => {
      if (err) console.error(err);
    });
  });
}

function database(eventemitter, database) {
  console.log(`${module.exports.name} registering database module`);
}

function registerModules(eventemitter, ioSocket, ioServer, mqttClient, databaseAdapter) {
  socketIO(eventemitter, ioSocket, ioServer);
  mqtt(eventemitter, mqttClient);
  database(eventemitter, databaseAdapter);
}

module.exports = {
  name: 'Command - UpdateDevice',
  registerModules,
  socketIOModule: socketIO,
  mqttClientModule: mqtt,
  databaseModule: database,
  removeSocketIOModule: removeSocketIO,
};
