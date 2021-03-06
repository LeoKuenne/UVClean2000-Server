const MainLogger = require('../../Logger.js').logger;
const { encrypt } = require('./middleware/encrypt');

const logger = MainLogger.child({ service: 'AcknowledgeDeviceAlarmCommand' });

async function execute(db, io, mqtt, message) {
  logger.info('Event: device_acknowledgeAlarm: %o', message);

  if (message.serialnumber !== undefined && typeof message.serialnumber !== 'string') {
    throw new Error('Serialnumber must be defined and of type string');
  }
  const encryptedValue = encrypt('true');

  await db.getDevice(message.serialnumber)
    .catch((e) => {
      throw e;
    }).then((databaseDevice) => {
      logger.info('Sending device acknowledge alarm mqtt message');

      mqtt.publish(`UVClean/${databaseDevice.serialnumber}/acknowledge `, (config.mqtt.useEncryption) ? encryptedValue : 'true');
      io.emit('info', { message: `Acknowledgement send to device ${databaseDevice.serialnumber}` });
    });
}

module.exports = function register(server, db, io, mqtt, ioSocket) {
  logger.info('Registering socketIO module');
  ioSocket.on('device_acknowledgeAlarm', async (message) => {
    try {
      await execute(db, io, mqtt, message);
    } catch (e) {
      server.emit('error', { service: 'AcknowledgeDeviceAlarmCommand', error: e });
    }
  });
};
