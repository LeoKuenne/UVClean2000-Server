const UVCDevice = require('../../dataModels/UVCDevice');

const MainLogger = require('../../Logger.js').logger;

const logger = MainLogger.child({ service: 'DeviceStateChangedEvent' });

async function getDevicesWithWrongState(groupID, prop, db) {
  const group = await db.getGroup(groupID);
  return group.devices.filter((dev) => dev[prop] !== group[prop]);
}

/**
 * Updates the list of devices that do not have the same state of the given
 * propertie that the group they belong to
 * @param {Object} database Database object
 * @param {String} groupID The group id of which the lists should be updated
 * @param {String} prop The propertie of which the list should be updated
 * @param {Array} devicesWrongState Array of serialnumbers of the devices
 */
async function updateGroupState(database, groupID, prop, devicesWrongState) {
  switch (prop) {
    case 'engineState':
      return database.updateGroupDevicesWithOtherState(groupID, 'engineState', devicesWrongState);
    case 'engineLevel':
      return database.updateGroupDevicesWithOtherState(groupID, 'engineLevel', devicesWrongState);
    case 'eventMode':
      return database.updateGroupDevicesWithOtherState(groupID, 'eventMode', devicesWrongState);
    default:
      return undefined;
  }
}

async function updateGroup(groupID, prop, db, io) {
  const devicesWrongState = await getDevicesWithWrongState(groupID, prop, db);
  const serialnumbers = [];
  devicesWrongState.forEach((device) => {
    serialnumbers.push(device.serialnumber);
  });

  await updateGroupState(db, groupID, prop, serialnumbers);
  const group = await db.getGroup(groupID);

  io.emit('group_stateChanged', {
    id: groupID,
    prop: `${prop}DevicesWithOtherState`,
    newValue: group[`${prop}DevicesWithOtherState`],
  });
}

function hasDeviceAlarm(databaseDevice, hasAlarm) {
  if (hasAlarm === true && databaseDevice.alarmState === false) {
    return true;
  }
  if (hasAlarm === false && databaseDevice.alarmState === true) {
    return false;
  }
  return undefined;
}

async function checkAlarm(db, io, newState) {
  // Alarm Checking
  const device = await db.getDevice(newState.serialnumber);
  const deviceShouldHaveAlarm = UVCDevice.checkAlarmState(device);
  const deviceGroup = (device.group.id !== undefined)
    ? await db.getGroup(device.group.id) : undefined;

  const alarmStateChangedToAlarm = hasDeviceAlarm(device, deviceShouldHaveAlarm);

  if (alarmStateChangedToAlarm === true && alarmStateChangedToAlarm !== undefined) {
    logger.warn(`Device ${newState.serialnumber} has a alarm`);
    await db.setDeviceAlarm(newState.serialnumber, true);
    io.emit('device_alarm', {
      serialnumber: newState.serialnumber,
      alarmValue: true,
    });
  } else if (alarmStateChangedToAlarm === false && alarmStateChangedToAlarm !== undefined) {
    logger.info(`Device ${newState.serialnumber} has no alarm anymore`);
    await db.setDeviceAlarm(newState.serialnumber, false);
    io.emit('device_alarm', {
      serialnumber: newState.serialnumber,
      alarmValue: false,
    });
  }

  if (device.group.id !== undefined) {
    const group = await db.getGroup(device.group.id);

    if (deviceGroup.alarmState !== group.alarmState) {
      logger.warn(`Group ${group.id} has ${group.alarmState ? 'a alarm' : 'no alarm anymore'}`);
      io.emit('group_deviceAlarm', {
        serialnumber: newState.serialnumber,
        group: group.id,
        alarmValue: group.alarmState,
      });
    }
  }
}

async function updateDatabase(db, newState) {
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
}

/**
 * Mapping the MQTT topic to the database schemas
 * @param {String} topic The MQTT topic
 * @returns {Object} Parsed Object with serialnumber, prop and subprop
 */
function mapMQTTTopicToDatabase(topic) {
  const topicArray = topic.split('/');

  if (topicArray.length < 4 || topicArray.length > 5) {
    throw new Error('Topic can not be parsed because it has the wrong format');
  }

  const serialnumber = topicArray[1];
  const prop = topicArray[3];
  const subprop = topicArray[4];

  switch (prop) {
    case 'name':
      return { serialnumber, prop: 'name' };
    case 'engineState':
      return { serialnumber, prop: 'engineState' };
    case 'engineLevel':
      return { serialnumber, prop: 'engineLevel' };
    case 'airVolume':
      return { serialnumber, prop: 'currentAirVolume' };
    case 'lamp':
      if (subprop === undefined) {
        throw new Error(`Can not parse state with propertie ${prop}`);
      } else if (!Number.isNaN(subprop)) {
        return { serialnumber, prop: 'currentLampValue', subprop: parseInt(subprop, 10) };
      } else {
        throw new Error(`Can not parse state with propertie ${prop}`);
      }
    case 'identify':
      return { serialnumber, prop: 'identifyMode' };
    case 'eventMode':
      return { serialnumber, prop: 'eventMode' };
    case 'alarm':
      if (subprop === undefined) {
        throw new Error(`Can not parse state with propertie ${prop}`);
      } else if (subprop === 'tempBody') {
        return { serialnumber, prop: 'currentBodyState' };
      } else if (subprop === 'tempFan') {
        return { serialnumber, prop: 'currentFanState' };
      } else if (!Number.isNaN(parseInt(subprop, 10))) {
        return { serialnumber, prop: 'currentLampState', subprop: parseInt(subprop, 10) };
      } else {
        throw new Error(`Can not parse state with propertie ${prop} with subpropertie ${subprop}`);
      }
    case 'tacho':
      return { serialnumber, prop: 'tacho' };
    default:
      throw new Error(`Can not parse state with propertie ${prop}`);
  }
}

async function execute(db, io, mqtt, topic, message) {
  logger.info(`Got MQTT message at topic ${topic} with message ${message}`);

  const props = mapMQTTTopicToDatabase(topic);

  const parsed = UVCDevice.parseStates(props.prop, props.subprop, message);

  const newState = {
    serialnumber: props.serialnumber,
    prop: props.prop,
    newValue: parsed.value,
  };

  if (parsed.alarm !== undefined || parsed.lamp !== undefined) {
    newState.lamp = parsed.lamp;
  }

  await updateDatabase(db, newState);

  await checkAlarm(db, io, newState);

  const device = await db.getDevice(newState.serialnumber);
  if (device.group._id) { await updateGroup(device.group._id.toString(), newState.prop, db, io); }

  io.emit('device_stateChanged', newState);
}

function register(db, io, mqtt) {
  logger.info('Registering socketIO module');
  mqtt.on('message', async (topic, message) => {
    if (topic.split('/')[2] !== 'stateChanged') return;
    try {
      await execute(db, io, mqtt, topic, message);
    } catch (e) {
      logger.error(e);
      console.error(e);
      io.emit('error', { message: e.message });
    }
  });
}
module.exports = {
  register,
  mapMQTTTopicToDatabase,
  checkAlarm,
  updateDatabase,
  execute,
  hasDeviceAlarm,
  getDevicesWithWrongState,
  updateGroup,
  updateGroupState,
};
