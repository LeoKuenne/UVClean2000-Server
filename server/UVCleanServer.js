const socketio = require('socket.io');
const mqtt = require('mqtt');
const EventEmitter = require('events');
const MongooseError = require('mongoose').Error;
const ExpressServer = require('./ExpressServer');
const MongoDBAdapter = require('./databaseAdapters/mongoDB/MongoDBAdapter');
const MainLogger = require('./Logger.js').logger;
const AddDevice = require('./controlModules/SocketIOCommands/AddDevice');
const DeleteDevice = require('./controlModules/SocketIOCommands/DeleteDevice');
const DeviceChangeState = require('./controlModules/SocketIOCommands/DeviceChangeState');
const DeviceStateChanged = require('./controlModules/MQTTEvents/DeviceStateChanged');
const AddGroup = require('./controlModules/SocketIOCommands/AddGroup');
const DeleteGroup = require('./controlModules/SocketIOCommands/DeleteGroup');
const GroupChangeState = require('./controlModules/SocketIOCommands/GroupChangeState');
const AddDeviceToGroup = require('./controlModules/SocketIOCommands/AddDeviceToGroup');
const RemoveDeviceFromGroup = require('./controlModules/SocketIOCommands/RemoveDeviceFromGroup');
const ResetDevice = require('./controlModules/SocketIOCommands/ResetDevice');
const AcknowledgeDeviceAlarm = require('./controlModules/SocketIOCommands/AcknowledgeDeviceAlarm');

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

      // Register MQTT actions
      DeviceStateChanged.register(this.database, this.io, this.client);

      this.client.on('connect', async () => {
        logger.info(`Connected to: mqtt://${this.config.mqtt.broker}:${this.config.mqtt.port}`);

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

        AddDevice(this.database, this.io, this.client, socket);
        DeleteDevice(this.database, this.io, this.client, socket);
        DeviceChangeState(this.database, this.io, this.client, socket);
        ResetDevice(this.database, this.io, this.client, socket);
        AcknowledgeDeviceAlarm(this.database, this.io, this.client, socket);
        AddGroup(this.database, this.io, this.client, socket);
        DeleteGroup(this.database, this.io, this.client, socket);
        GroupChangeState(this.database, this.io, this.client, socket);
        AddDeviceToGroup(this.database, this.io, this.client, socket);
        RemoveDeviceFromGroup(this.database, this.io, this.client, socket);

        // Debug any messages that are coming from the frontend
        socket.onAny((event, ...args) => {
          logger.debug(`Socket.io Message: ${event}, %o`, args);
        });

        socket.on('disconnect', () => {
          logger.info('A dashboard disconnected');
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
