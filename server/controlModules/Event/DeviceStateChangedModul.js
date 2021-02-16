const UVCDevice = require('../../dataModels/UVCDevice');

function socketIO(eventemitter, ioSocket, ioServer) {
  console.log(`${module.exports.name} registering socketIO module`);
  eventemitter.on('deviceStateChanged', (device) => {
    ioSocket.emit('device_stateChanged', device);
  });
}

function removeSocketIO(eventemitter, ioSocket, ioServer) {
  console.log(`${module.exports.name} removing socketIO module`);
  eventemitter.removeAllListeners('deviceStateChanged');
}

function mqtt(eventemitter, mqttClient) {
  console.log(`${module.exports.name} registering mqtt module`);
  mqttClient.on('message', (topic, message) => {
    console.log(`Got MQTT message at topic ${topic} with message ${message}`);
    const topicArray = topic.split('/');
    const newState = {
      serialnumber: `${topicArray[1]}`,
      prop: `${topicArray[3]}`,
    };

    const parsed = UVCDevice.parseStates(newState.prop, topicArray[4], message);

    if (typeof parsed === 'object') {
      if (parsed.alarm !== undefined || parsed.lamp !== undefined) {
        newState.lamp = parsed.lamp;
        newState.newValue = parsed.value;
      }
    } else {
      newState.newValue = parsed;
    }

    eventemitter.emit('deviceStateChanged', newState);
  });
}

function removeMQTT(eventemitter, mqttClient) {
  console.log(`${module.exports.name} removing mqtt module`);
  mqttClient.unsubscribe('UVClean/+/stateChanged/#');
}

function database(eventemitter, db) {
  console.log(`${module.exports.name} registering database module`);

  eventemitter.on('deviceStateChanged', (newState) => {
    console.log(`Updating device ${newState.serialnumber} in database with new State`, newState);
    let device = {};

    switch (newState.prop) {
      case 'alarm':
        db.setAlarmState({
          serialnumber: newState.serialnumber,
          lamp: newState.lamp,
          alarm: newState.newValue,
        });
        break;
      case 'lamp':

        break;

      case 'airVolume':
        db.addAirVolume({
          serialnumber: newState.serialnumber,
          volume: newState.newValue,
        });
        break;

      default:
        device = {
          serialnumber: newState.serialnumber,
        };

        device[newState.prop] = newState.newValue;

        db.updateDevice(device);
        break;
    }
  });
}

function removeDatabase(eventemitter, db) {
  console.log(`${module.exports.name} removing database module`);
  eventemitter.removeAllListeners('deviceStateChanged');
}

function registerModules(eventemitter, ioSocket, ioServer, mqttClient, databaseAdapter) {
  socketIO(eventemitter, ioSocket, ioServer);
  mqttClient(eventemitter, mqttClient);
  databaseAdapter(eventemitter, databaseAdapter);
}

module.exports = {
  name: 'Event - deviceStateChanged',
  registerModules,
  socketIOModule: socketIO,
  mqttClientModule: mqtt,
  databaseModule: database,
  removeSocketIOModule: removeSocketIO,
  removeMQTTClientModule: removeMQTT,
  removeDatabaseModule: removeDatabase,
};
