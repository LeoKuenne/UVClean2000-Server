const fs = require('fs');
const fernet = require('fernet');
const MainLogger = require('../../../Logger.js').logger;

const logger = MainLogger.child({ service: 'DecryptMiddleware' });

async function decrypt(server, db, io, mqtt, msg, next) {
  logger.info(`Encrpting ${msg.message}`);
  const secret = fernet.setSecret(fs.readFileSync('C:/workspace_nodejs/uvclean2000-server/server/ssl/fernetSecret.txt', { encoding: 'base64' }));
  const token = new fernet.Token({
    secret,
    token: msg.message,
    ttl: 0,
  });
  const message = token.decode();

  if (message === msg.message) throw new Error(`Could not decode ${message}`);
  msg.message = message;

  await next();
}

module.exports = {
  decrypt,
};
