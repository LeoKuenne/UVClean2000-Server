const express = require('express');
const http = require('http');
const cors = require('cors');
const socketio = require('socket.io');
const mqtt = require('mqtt');
const EventEmitter = require('events');
const MongooseError = require('mongoose').Error;
const MongoDBAdapter = require('./databaseAdapters/mongoDB/MongoDBAdapter');
const DeviceUpdateModule = require('./controlModules/Command/_UpdateDeviceModule');
const controlModules = require('./controlModules/ControlModules').modules;

console.log.bind('| UVCleanServer:');

class UVCleanServer extends EventEmitter {
  constructor(config) {
    super();

    this.config = config;

    this.database = new MongoDBAdapter(this.config.database.mongoDB.uri,
      this.config.database.mongoDB.database);

    this.app = express();
    this.httpServer = http.createServer(this.app);
    this.io = socketio(this.httpServer);

    this.app.use(express.static(`${__dirname}/dashboard/dist`));

    this.app.get('/', (req, res) => {
      res.sendFile(`${__dirname}/dashboard/dist/index.html`);
    });

    this.app.get('/devices', cors(), async (req, res) => {
      const db = await this.database.getDevices();

      res.json(db);
    });
  }

  async stopServer() {
    console.log('Shutting down...');

    await this.database.close();

    if (this.httpServer.listening) {
      this.httpServer.close((err) => {
        throw err;
      });
    }

    if (this.client !== undefined) { this.client.end(); }

    this.io.close();
  }

  async startServer() {
    try {
      await this.database.connect();

      this.httpServer.listen(this.config.http.port, () => {
        console.log(`HTTP listening on ${this.config.http.port}`);
      });

      this.client = mqtt.connect(`mqtt://${this.config.mqtt.broker}:${this.config.mqtt.port}`);

      // Register all Database Modules
      controlModules.forEach((module) => {
        module.databaseModule(this, this.database);
      });

      this.client.on('connect', () => {
        console.log('Connected to MQTT Server');

        // Register all MQTT Modules
        controlModules.forEach((module) => {
          module.mqttClientModule(this, this.client);
        });
      });

      // New Webbrowser connected to server
      this.io.on('connection', (socket) => {
        console.log('A dashboard connected');
        console.log(`Registering SocketIO Modules for socket ${socket.request.connection.remoteAddress}`);
        // Register all SocketIO Modules
        controlModules.forEach((module) => {
          module.socketIOModule(this, socket, this.io);
        });

        // Debug any messages that are coming from the frontend
        socket.onAny((event, ...args) => {
          console.debug(`Debug: Socket.io Message: ${event}`, args);
        });

        socket.on('disconnect', () => {
          console.log('A dashboard disconnected');
          // Remove all SocketIO Modules
          controlModules.forEach((module) => {
            module.removeSocketIOModule(this, socket, this.io);
          });
        });
      });
    } catch (e) {
      if (e instanceof MongooseError) {
        console.error('The MongoDB server is not reachable.', e.message);
      } else {
        console.error(e);
      }
      this.stopServer();
    }
  }
}

module.exports = {
  UVCleanServer,
};
