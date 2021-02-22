const UVCDevice = require('../../dataModels/UVCDevice');

const MainLogger = require('../../Logger.js').logger;

const logger = MainLogger.child({ service: 'DeviceStateChangedModule' });

function socketIO(eventemitter, ioSocket, ioServer) {
  logger.info('Registering socketIO module');
  eventemitter.on('deviceStateChanged', (device) => {
    ioSocket.emit('device_stateChanged', device);
  });
}

function removeSocketIO(eventemitter, ioSocket, ioServer) {
  logger.info('Removing socketIO module');
  eventemitter.removeAllListeners('deviceStateChanged');
}

function mqtt(eventemitter, mqttClient) {
  logger.info('Registering mqtt module');
  mqttClient.on('message', (topic, message) => {
    logger.info(`Got MQTT message at topic ${topic} with message ${message}`);
    const topicArray = topic.split('/');
    const event = topicArray[2];

    let newState = {};
    let parsed = null;

    switch (event) {
      case 'stateChanged':

        newState = {
          serialnumber: `${topicArray[1]}`,
          prop: `${topicArray[3]}`,
        };

        // MQQT Mapping: Topic naming to database naming and which topic should be interpreted
        switch (newState.prop) {
          case 'name':
            newState.prop = 'name';
            break;
          case 'engineState':
            newState.prop = 'engineState';
            break;
          case 'engineLevel':
            newState.prop = 'engineLevel';
            break;
          case 'airVolume':
            newState.prop = 'currentAirVolume';
            break;
          case 'lamp':
            newState.prop = 'currentLampValue';
            break;
          case 'identify':
            newState.prop = 'identifyMode';
            break;
          case 'eventMode':
            newState.prop = 'eventMode';
            break;
          case 'alarm':
            if (topicArray[4] === 'tempBody') {
              newState.prop = 'currentBodyState';
            } else if (topicArray[4] === 'tempFan') {
              newState.prop = 'currentFanState';
            } else {
              newState.prop = 'currentLampState';
            }

            break;
          case 'tacho':
            newState.prop = 'tacho';
            break;
          default:
            // Do not parse and interpret these change
            return;
        }

        parsed = UVCDevice.parseStates(newState.prop, topicArray[4], message);

        if (typeof parsed === 'object') {
          if (parsed.alarm !== undefined || parsed.lamp !== undefined) {
            newState.lamp = parsed.lamp;
            newState.newValue = parsed.value;
          }
        } else {
          newState.newValue = parsed;
        }

        eventemitter.emit('deviceStateChanged', newState);
        break;

      default:
        break;
    }
  });
}

function removeMQTT(eventemitter, mqttClient) {
  logger.info('Removing mqtt module');
  mqttClient.unsubscribe('UVClean/+/stateChanged/#');
}

function database(eventemitter, db) {
  logger.info('Registering database module');

  eventemitter.on('deviceStateChanged', (newState) => {
    logger.info(`Updating device ${newState.serialnumber} in database with new State`, newState);
    let device = {};

    switch (newState.prop) {
      case 'currentLampValue':
        db.addLampValue({
          device: newState.serialnumber,
          lamp: newState.lamp,
          value: newState.newValue,
        });
        break;
      case 'currentLampState':
        db.setAlarmState({
          device: newState.serialnumber,
          state: newState.newValue,
          lamp: newState.lamp,
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
      case 'currentFanState':
        db.addFanState({
          device: newState.serialnumber,
          state: newState.newValue,
        });
        break;
      case 'currentBodyState':
        db.addBodyState({
          device: newState.serialnumber,
          state: newState.newValue,
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
  logger.info('Removing database module');
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
