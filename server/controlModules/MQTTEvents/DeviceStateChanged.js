const UVCDevice = require('../../dataModels/UVCDevice');

const MainLogger = require('../../Logger.js').logger;

const logger = MainLogger.child({ service: 'DeviceStateChangedEvent' });

async function execute(db, io, mqtt, topic, message) {
  logger.info(`Got MQTT message at topic ${topic} with message ${message}`);
  const topicArray = topic.split('/');
  const event = topicArray[2];

  let newState = {};
  let parsed = null;

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
      if (topicArray[4] === undefined) {
        throw new Error(`Can not parse state with propertie ${newState.prop}`);
      } else if (topicArray[4] === 'tempBody') {
        newState.prop = 'currentBodyState';
      } else if (topicArray[4] === 'tempFan') {
        newState.prop = 'currentFanState';
      } else if (!Number.isNaN(topicArray[4])) {
        newState.prop = 'currentLampState';
      } else {
        throw new Error(`Can not parse state with propertie ${newState.prop}`);
      }
      break;
    case 'tacho':
      newState.prop = 'tacho';
      break;
    default:
      throw new Error(`Can not parse state with propertie ${newState.prop}`);
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

  logger.info(`Updating device ${newState.serialnumber} in database with new State`, newState);
  let device = {};

  switch (newState.prop) {
    case 'currentLampValue':
      await db.addLampValue({
        device: newState.serialnumber,
        lamp: newState.lamp,
        value: newState.newValue,
      });
      break;
    case 'currentLampState':
      await db.setLampState({
        device: newState.serialnumber,
        state: newState.newValue,
        lamp: newState.lamp,
      });
      break;
    case 'tacho':
      await db.addTacho({
        device: newState.serialnumber,
        tacho: newState.newValue,
      });
      break;
    case 'currentAirVolume':
      await db.addAirVolume({
        device: newState.serialnumber,
        volume: newState.newValue,
      });
      break;
    case 'currentFanState':
      await db.addFanState({
        device: newState.serialnumber,
        state: newState.newValue,
      });
      break;
    case 'currentBodyState':
      await db.addBodyState({
        device: newState.serialnumber,
        state: newState.newValue,
      });
      break;

    default:
      device = {
        serialnumber: newState.serialnumber,
      };

      device[newState.prop] = newState.newValue;

      await db.updateDevice(device);
      break;
  }

  // Alarm Checking
  const updatedDevice = await db.getDevice(newState.serialnumber);
  const hasAlarm = UVCDevice.checkAlarmState(updatedDevice);

  console.log(updatedDevice, hasAlarm);

  if (hasAlarm && !await db.getDeviceAlarm(newState.serialnumber)) {
    logger.warn(`Device ${newState.serialnumber} has a alarm`);
    io.emit('device_alarm', {
      serialnumber: newState.serialnumber,
      alarmValue: true,
    });
    db.setDeviceAlarm(newState.serialnumber, true);

    // if (updatedDevice.group.id !== undefined) {
    //   io.emit('device_alarm', {
    //     serialnumber: newState.serialnumber,
    //     alarmValue: true,
    //   });
    //   db.setGroupAlarm(newState.serialnumber, true);
    // }
  } else if (!hasAlarm && await db.getDeviceAlarm(newState.serialnumber)) {
    logger.info(`Device ${newState.serialnumber} has no alarm anymore`);
    io.emit('device_alarm', {
      serialnumber: newState.serialnumber,
      alarmValue: false,
    });
    db.setDeviceAlarm(newState.serialnumber, false);
  }

  io.emit('device_stateChanged', newState);
}

module.exports = function register(db, io, mqtt) {
  logger.info('Registering socketIO module');
  mqtt.on('message', async (topic, message) => {
    if (topic.split('/')[2] !== 'stateChanged') return;
    try {
      await execute(db, io, mqtt, topic, message);
    } catch (e) {
      logger.error(e);
      io.emit('error', { message: e.message });
    }
  });
};
