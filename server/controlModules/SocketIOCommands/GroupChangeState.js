const MainLogger = require('../../Logger.js').logger;

const logger = MainLogger.child({ service: 'GroupChangeStateCommand' });

async function execute(db, io, mqtt, message) {
  logger.info('Event: group_add: %o', message);

  if (message.serialnumber !== undefined && typeof message.serialnumber !== 'string') {
    throw new Error('Serialnumber must be defined and of type string');
  }

  if (message.prop !== undefined && typeof message.prop !== 'string') {
    throw new Error('Prop must be defined and of type string');
  }

  if (message.newValue !== undefined && typeof message.newValue !== 'string') {
    throw new Error('New value must be defined and of type string');
  }

  const newState = {
    id: message.id,
    prop: message.prop,
    newValue: message.newValue,
  };

  switch (newState.prop) {
    case 'name':
      await db.updateGroup({
        id: `${newState.id}`,
        name: newState.newValue,
      });

      io.emit('group_stateChanged', newState);

      break;

    default:
      throw new Error(`GroupChangeState is not implementet for propertie ${newState.prop}`);
  }
}

module.exports = function register(db, io, mqtt, ioSocket) {
  logger.info('Registering socketIO module');
  ioSocket.on('group_changeState', async (message) => {
    try {
      await execute(db, io, mqtt, message);
    } catch (e) {
      logger.error(e);
      io.emit('error', { message: e.message });
    }
  });
};
