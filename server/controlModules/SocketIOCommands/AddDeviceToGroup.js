const MainLogger = require('../../Logger.js').logger;

const logger = MainLogger.child({ service: 'AddDeviceToGroupCommand' });

async function execute(db, io, mqtt, message) {
  logger.info('Event: group_addDevice: %o', message);
  const { device, group } = message;

  if (device !== undefined && typeof device !== 'string') {
    throw new Error('Device must be defined and of type string');
  }

  if (group !== undefined && typeof group !== 'string') {
    throw new Error('Group must be defined and of type string');
  }

  db.addDeviceToGroup(device, group);
  const docDevice = await db.getDevice(device);
  const docGroup = await db.getGroup(group);
  io.emit('group_deviceAdded', docDevice, docGroup);
}

module.exports = function register(db, io, mqtt, ioSocket) {
  logger.info('Registering socketIO module');
  ioSocket.on('group_addDevice', async (message) => {
    try {
      await execute(db, io, mqtt, message);
    } catch (e) {
      logger.error(e);
      io.emit('error', { message: e.message });
    }
  });
};
