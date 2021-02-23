const socketio = require('socket.io');
const mqtt = require('mqtt');
const EventEmitter = require('events');
const MongooseError = require('mongoose').Error;
const ExpressServer = require('./ExpressServer');
const MongoDBAdapter = require('./databaseAdapters/mongoDB/MongoDBAdapter');
const controlModules = require('./controlModules/ControlModules').modules;
const MainLogger = require('./Logger.js').logger;

const logger = MainLogger.child({ service: 'UVCleanServer' });

class UVCleanServer extends EventEmitter {
  constructor(config) {
    super();

    this.config = config;

    this.database = new MongoDBAdapter(`${this.config.database.mongoDB.uri}:${this.config.database.mongoDB.port}`,
      this.config.database.mongoDB.database);

    this.express = new ExpressServer(this.config.http, this.database);
    this.io = socketio(this.express.httpServer, {
      cors: {
        origin: `http://${config.http.cors}`,
        methods: ['GET', 'POST'],
      },
    });
  }

  async stopServer() {
    logger.info('Shutting down...');

    await this.database.close();

    this.express.stopExpressServer();

    if (this.client !== undefined) { this.client.end(); }

    this.io.close();
  }

  async startServer() {
    logger.info({ level: 'info', message: 'Starting server' });
    try {
      await this.database.connect();

      this.express.startExpressServer();

      logger.info(`Trying to connect to: mqtt://${this.config.mqtt.broker}:${this.config.mqtt.port}`);
      this.client = mqtt.connect(`mqtt://${this.config.mqtt.broker}:${this.config.mqtt.port}`);

      // Register all Database Modules
      controlModules.forEach((module) => {
        module.databaseModule(this, this.database);
      });

      this.client.on('connect', async () => {
        logger.info(`Connected to: mqtt://${this.config.mqtt.broker}:${this.config.mqtt.port}`);

        // Register all MQTT Modules
        controlModules.forEach((module) => {
          module.mqttClientModule(this, this.client);
        });

        // Subscribe to all devices that already exists
        const db = await this.database.getDevices();
        db.forEach((device) => {
          logger.info(`Subscribing to UVClean/${device.serialnumber}/#`);
          this.client.subscribe(`UVClean/${device.serialnumber}/#`);
        });
      });

      // New Webbrowser connected to server
      this.io.on('connection', (socket) => {
        logger.info('A dashboard connected');
        logger.info(`Registering SocketIO Modules for socket ${socket.request.connection.remoteAddress}`);
        // Register all SocketIO Modules
        controlModules.forEach((module) => {
          module.socketIOModule(this, socket, this.io);
        });

        // Debug any messages that are coming from the frontend
        socket.onAny((event, ...args) => {
          logger.debug(`Debug: Socket.io Message: ${event}`, args);
        });

        socket.on('disconnect', () => {
          logger.info('A dashboard disconnected');
          // Remove all SocketIO Modules
          controlModules.forEach((module) => {
            // module.removeSocketIOModule(this, socket, this.io);
          });
        });
      });
    } catch (e) {
      if (e instanceof MongooseError) {
        logger.error('The MongoDB server is not reachable.', e.message);
      } else {
        logger.error(e);
      }
      this.stopServer();
    }
  }
}

module.exports = {
  UVCleanServer,
};
