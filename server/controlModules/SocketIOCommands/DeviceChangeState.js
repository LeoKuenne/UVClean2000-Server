const MainLogger = require('../../Logger.js').logger;

const logger = MainLogger.child({ service: 'DeviceChangeStateCommand' });

async function execute(db, io, mqtt, message) {
  logger.info('Event: device_changeState: %o', message);

  if (message.serialnumber !== undefined && typeof message.serialnumber !== 'string') {
    throw new Error('Serialnumber must be defined and of type string');
  }

  if (message.prop !== undefined && typeof message.prop !== 'string') {
    throw new Error('Prop must be defined and of type string');
  }

  if (message.newValue !== undefined && typeof message.newValue !== 'string') {
    throw new Error('New value must be defined and of type string');
  }

  const device = {
    serialnumber: message.serialnumber,
    prop: message.prop,
    newValue: message.newValue,
  };

  let propertie = '';
  switch (device.prop) {
    case 'engineState':
      propertie = 'engineState';
      break;
    case 'name':
      propertie = 'name';
      break;
    case 'eventMode':
      propertie = 'eventMode';
      break;
    case 'identifyMode':
      propertie = 'identify';
      break;
    case 'engineLevel':
      propertie = 'engineLevel';
      break;
    default:
      throw new Error(`Can not parse state ${device.prop} for MQTT`);
  }
  mqtt.publish(`UVClean/${device.serialnumber}/changeState/${propertie}`, `${device.newValue}`);
}

module.exports = function register(db, io, mqtt, ioSocket) {
  logger.info('Registering socketIO module');
  ioSocket.on('device_changeState', async (message) => {
    try {
      await execute(db, io, mqtt, message);
    } catch (e) {
      logger.error(e);
      io.emit('error', { message: e.message });
    }
  });
};
