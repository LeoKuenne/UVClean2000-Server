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

    this.express = new ExpressServer(this, this.config.http, this.database);
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
      this.express.startExpressServer();

      this.io = socketio(this.express.httpServer, {
        cors: {
          origin: `http://${this.config.http.cors}`,
          methods: ['GET', 'POST'],
        },
      });

      this.on('error', (e) => {
        logger.error('%o', e);
        this.io.emit('error', { message: e.message });
      });

      // New Webbrowser connected to server
      this.io.on('connection', (socket) => {
        logger.info('A dashboard connected');
        logger.info(`Registering SocketIO Modules for socket ${socket.request.connection.remoteAddress}`);

        AddDevice(this, this.database, this.io, this.client, socket);
        DeleteDevice(this, this.database, this.io, this.client, socket);
        DeviceChangeState(this, this.database, this.io, this.client, socket);
        ResetDevice(this, this.database, this.io, this.client, socket);
        AcknowledgeDeviceAlarm(this, this.database, this.io, this.client, socket);
        AddGroup(this, this.database, this.io, this.client, socket);
        DeleteGroup(this, this.database, this.io, this.client, socket);
        GroupChangeState(this, this.database, this.io, this.client, socket);
        AddDeviceToGroup(this, this.database, this.io, this.client, socket);
        RemoveDeviceFromGroup(this, this.database, this.io, this.client, socket);

        // Debug any messages that are coming from the frontend
        socket.onAny((event, ...args) => {
          logger.debug(`Socket.io Message: ${event}, %o`, args);
        });

        socket.on('disconnect', () => {
          logger.info('A dashboard disconnected');
        });
      });

      this.database.on('open', async () => {
        logger.info('Emitting info event on socket io for database connected');
        this.io.emit('databaseConnected');
        try {
          if (this.client.connected) {
            const db = await this.database.getDevices();
            db.forEach((device) => {
              logger.info(`Subscribing to UVClean/${device.serialnumber}/#`);
              this.client.subscribe(`UVClean/${device.serialnumber}/#`);
            });
          }
        } catch (error) {
          this.emit('error', { service: 'UVCleanServer', error });
        }
      });

      this.database.on('disconnected', () => {
        logger.info('Emitting warn event on socket io for database disconnected');
        this.io.emit('warn', { message: 'Database disconnected' });
      });

      logger.info(`Trying to connect to: mqtt://${this.config.mqtt.broker}:${this.config.mqtt.port}`);
      this.client = mqtt.connect(`mqtt://${this.config.mqtt.broker}:${this.config.mqtt.port}`);

      // Register MQTT actions
      DeviceStateChanged.register(this, this.database, this.io, this.client);

      this.client.on('connect', async () => {
        logger.info(`Connected to: mqtt://${this.config.mqtt.broker}:${this.config.mqtt.port}`);
        this.io.emit('info', { message: 'MQTT Client connected' });
        try {
          // Subscribe to all devices that already exists if the database is connected
          if (this.database.isConnected()) {
            const db = await this.database.getDevices();
            db.forEach((device) => {
              logger.info(`Subscribing to UVClean/${device.serialnumber}/#`);
              this.client.subscribe(`UVClean/${device.serialnumber}/#`);
            });
          }
        } catch (error) {
          this.emit('error', { service: 'UVCleanServer', error });
        }
      });

      this.client.on('offline', async () => {
        logger.info(`Disconnected from: mqtt://${this.config.mqtt.broker}:${this.config.mqtt.port}`);
        this.io.emit('warn', { message: 'MQTT Client disconnected' });
      });

      await this.database.connect();
    } catch (e) {
      if (e instanceof MongooseError) {
        this.emit('error', { service: 'UVCleanServer', error: e });
      } else {
        logger.error(e);
      }
    }
  }
}

module.exports = {
  UVCleanServer,
};
