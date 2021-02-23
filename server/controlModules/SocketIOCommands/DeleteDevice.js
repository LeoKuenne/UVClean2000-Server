const MainLogger = require('../../Logger.js').logger;

const logger = MainLogger.child({ service: 'DeleteDeviceCommand' });

async function execute(db, io, mqtt, message) {
  logger.info('Event: device_delete:', message);

  if (message.serialnumber !== undefined && typeof message.serialnumber !== 'string') {
    throw new Error('Serialnumber must be defined and of type string');
  }

  const device = {
    serialnumber: message.serialnumber,
  };

  await db.deleteDevice(device.serialnumber);
  logger.info('deleted device from database, sending device_deleted');

  mqtt.unsubscribe(`UVClean/${device.serialnumber}/#`);

  io.emit('device_deleted', {
    serialnumber: device.serialnumber,
  });
}

module.exports = function register(db, io, mqtt, ioSocket) {
  logger.info('Registering socketIO module');
  ioSocket.on('device_delete', async (message) => {
    try {
      await execute(db, io, mqtt, message);
    } catch (e) {
      logger.error(e);
      io.emit('error', { message: e.message });
    }
  });
};
