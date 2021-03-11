const fs = require('fs');
const fernet = require('fernet');
const MainLogger = require('../../../Logger.js').logger;

const logger = MainLogger.child({ service: 'EncryptMiddleware' });

function encrypt(msg) {
  logger.info(`Encrypting ${msg}`);
  const secret = fernet.setSecret(fs.readFileSync('C:/workspace_nodejs/uvclean2000-server/server/ssl/fernetSecret.txt', { encoding: 'base64' }));
  const token = new fernet.Token({
    secret,
  });
  const message = token.encode(msg);

  if (message === msg) throw new Error(`Could not encode ${message}`);

  return message;
}

module.exports = {
  encrypt,
};
