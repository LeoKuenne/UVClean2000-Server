const fs = require('fs');

const file = fs.readFileSync('./server/UVCleanServer.config.json');
const config = JSON.parse(file);

console.log('Read config file UVCleanServer.config.json');

const { UVCleanServer } = require('./server/UVCleanServer.js');

const server = new UVCleanServer(config);

console.log('Starting server...');

server.startServer();

process.on('SIGINT', async () => {
  await server.stopServer();
  process.exit(1);
});
