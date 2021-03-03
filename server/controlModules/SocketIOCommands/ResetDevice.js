const MainLogger = require('../../Logger.js').logger;

const logger = MainLogger.child({ service: 'AddDeviceCommand' });

async function execute(db, io, mqtt, message) {
  logger.info('Event: device_reset: %o', message);

  if (message.serialnumber !== undefined && typeof message.serialnumber !== 'string') {
    throw new Error('Serialnumber must be defined and of type string');
  }

  await db.getDevice(message.serialnumber)
    .catch((e) => {
      throw e;
    }).then((databaseDevice) => {
      logger.info('Sending device reset mqtt message');

      mqtt.publish(`UVClean/${databaseDevice.serialnumber}/reset`, 'true');
    });
}

module.exports = function register(db, io, mqtt, ioSocket) {
  logger.info('Registering socketIO module');
  ioSocket.on('device_reset', async (message) => {
    try {
      await execute(db, io, mqtt, message);
    } catch (e) {
      logger.error(e);
      io.emit('error', { message: e.message });
    }
  });
};