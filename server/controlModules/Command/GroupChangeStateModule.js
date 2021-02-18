function socketIO(eventemitter, ioSocket, ioServer) {
  console.log(`${module.exports.name} registering socketIO module`);
  ioSocket.on('group_changeState', (newState) => {
    const groupNewState = {
      id: newState.id,
      prop: newState.prop,
      newValue: newState.newValue,
    };

    eventemitter.emit('groupChangeState', groupNewState);
  });
}

function removeSocketIO(eventemitter, ioSocket, ioServer) {
  console.log(`${module.exports.name} removing socketIO module`);
  ioSocket.removeAllListeners('group_changeState');
}

function mqtt(eventemitter, mqttClient) {
  console.log(`${module.exports.name} registering mqtt module`);
}

function removeMQTT(eventemitter, ioSocket, ioServer) {
  console.log(`${module.exports.name} removing mqtt module`);
}

function database(eventemitter, db) {
  console.log(`${module.exports.name} registering database module`);
  eventemitter.on('groupChangeState', async (newState) => {
    console.log(`Updating device ${newState.id} in database with new State`, newState);
    const device = {};
    let docGroup = null;

    switch (newState.prop) {
      case 'name':
        docGroup = await db.updateGroup({
          _id: newState.id,
          name: newState.newValue,
        });

        if (docGroup.name === newState.newValue) {
          eventemitter.emit('groupStateChanged', newState);
        }

        break;

      default:
        throw new Error(`GroupChangeState is not implementet for propertie ${newState.prop}`);
    }
  });
}

function removeDatabase(eventemitter, db) {
  console.log(`${module.exports.name} removing database module`);
  eventemitter.removeAllListeners('groupChangeState');
}

function registerModules(eventemitter, ioSocket, ioServer, mqttClient, databaseAdapter) {
  socketIO(eventemitter, ioSocket, ioServer);
  mqttClient(eventemitter, mqttClient);
  databaseAdapter(eventemitter, databaseAdapter);
}

module.exports = {
  name: 'Command - GroupChangeState',
  registerModules,
  socketIOModule: socketIO,
  mqttClientModule: mqtt,
  databaseModule: database,
  removeSocketIOModule: removeSocketIO,
  removeMQTTClientModule: removeMQTT,
  removeDatabaseModule: removeDatabase,
};
