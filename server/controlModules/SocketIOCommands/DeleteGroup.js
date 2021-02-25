const MainLogger = require('../../Logger.js').logger;

const logger = MainLogger.child({ service: 'AddGroupCommand' });

async function execute(db, io, mqtt, message) {
  logger.info('Event: group_delete: %o', message);

  if (message.id !== undefined && typeof message.id !== 'string') {
    throw new Error('Name must be defined and of type string');
  }

  const group = {
    id: message.id,
  };

  const dbGroup = await db.deleteGroup(group);
  const docGroup = await db.getGroup(`${dbGroup.id}`).catch((e) => {
    if (e.message === 'Group does not exists') {
      logger.info('deleted group from database, sending group_deleted event');

      io.emit('group_deleted', { id: group.id });
    }
  });
}

module.exports = function register(db, io, mqtt, ioSocket) {
  logger.info('Registering socketIO module');
  ioSocket.on('group_delete', async (message) => {
    try {
      await execute(db, io, mqtt, message);
    } catch (e) {
      logger.error(e);
      io.emit('error', { message: e.message });
    }
  });
};