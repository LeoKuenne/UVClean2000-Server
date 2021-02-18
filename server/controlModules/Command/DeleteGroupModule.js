function socketIO(eventemitter, ioSocket, ioServer) {
  console.log(`${module.exports.name} registering socketIO module`);
  ioSocket.on('group_delete', (id) => {
    eventemitter.emit('deleteGroup', id);
  });
}

function removeSocketIO(eventemitter, ioSocket, ioServer) {
  console.log(`${module.exports.name} removing socketIO module`);
  ioSocket.removeAllListeners('group_delete');
}

function mqtt(eventemitter, mqttClient) {
  console.log(`${module.exports.name} registering mqtt module`);
}

function removeMQTT(eventemitter, ioSocket, ioServer) {
  console.log(`${module.exports.name} removing mqtt module`);
}

function database(eventemitter, db) {
  console.log(`${module.exports.name} registering database module`);
  eventemitter.on('deleteGroup', async (group) => {
    const dbGroup = await db.deleteGroup(group);
    const docGroup = await db.getGroup(`${dbGroup.id}`).catch((e) => {
      console.log(e);
      if (e.message === 'Group does not exists') {
        eventemitter.emit('groupDeleted', group);
      }
    }).catch((err) => {
      console.error(err);
    });
  });
}

function removeDatabase(eventemitter, db) {
  console.log(`${module.exports.name} removing database module`);
  eventemitter.removeAllListeners('deleteGroup');
}

function registerModules(eventemitter, ioSocket, ioServer, mqttClient, databaseAdapter) {
  socketIO(eventemitter, ioSocket, ioServer);
  mqttClient(eventemitter, mqttClient);
  databaseAdapter(eventemitter, databaseAdapter);
}

module.exports = {
  name: 'Command - DeleteGroup',
  registerModules,
  socketIOModule: socketIO,
  mqttClientModule: mqtt,
  databaseModule: database,
  removeSocketIOModule: removeSocketIO,
  removeMQTTClientModule: removeMQTT,
  removeDatabaseModule: removeDatabase,
};
