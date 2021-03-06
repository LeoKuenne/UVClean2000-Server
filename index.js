const fs = require('fs');
const MainLogger = require('./server/Logger.js').logger;
const { setTransports } = require('./server/Logger.js');

const logger = MainLogger.child({ service: 'Startup' });

logger.info('Reading config file UVCleanServer.config.json');
const file = fs.readFileSync('./server/UVCleanServer.config.json');
const configFile = JSON.parse(file);

let config = {};
switch (configFile.env) {
  case 'production':
    config = configFile.production;
    logger.info('Loading config for production', config);
    break;
  case 'development':
    config = configFile.development;
    logger.info('Loading config for development', config);
    break;
  case 'staging':
    config = configFile.staging;
    logger.info('Loading config for staging', config);
    break;

  default:
    logger.info(`Could not load enviroment "${process.env.NODE_ENV}" from config file. Exiting`, config);
    process.exit(1);
    break;
}
config.env = configFile.env;
global.config = config;
setTransports();

const { UVCleanServer } = require('./server/UVCleanServer.js');

const server = new UVCleanServer();

logger.info('Starting UVCServer...');

server.startServer();

process.on('SIGINT', async () => {
  await server.stopServer();
  process.exit(1);
});
