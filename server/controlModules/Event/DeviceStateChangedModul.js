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

    switch (newState.prop) {
      case 'airVolume':
        newState.prop = 'currentAirVolume';
        break;
      case 'lamp':
        newState.prop = 'currentLampValue';
        break;
      case 'alarm':
        newState.prop = 'currentAlarm';
        break;
      default:
        break;
    }

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
      case 'currentAlarm':
        db.setAlarmState({
          device: newState.serialnumber,
          lamp: newState.lamp,
          state: newState.newValue,
        });
        break;
      case 'currentLampValue':
        db.addLampValue({
          device: newState.serialnumber,
          lamp: newState.lamp,
          value: newState.newValue,
        });
        break;
      case 'tacho':
        db.addTacho({
          device: newState.serialnumber,
          tacho: newState.newValue,
        });
        break;
      case 'currentAirVolume':
        db.addAirVolume({
          device: newState.serialnumber,
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
