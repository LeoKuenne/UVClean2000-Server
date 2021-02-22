const express = require('express');
const http = require('http');
const cors = require('cors');
const socketio = require('socket.io');
const mqtt = require('mqtt');
const EventEmitter = require('events');
const MongooseError = require('mongoose').Error;
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

    this.app = express();
    this.httpServer = http.createServer(this.app);
    this.io = socketio(this.httpServer, {
      cors: {
        origin: `http://${config.http.cors}`,
        methods: ['GET', 'POST'],
      },
    });

    this.app.use(cors());

    this.app.use(express.static(`${__dirname}/dashboard/static`));

    this.app.get('/devices', async (req, res) => {
      const db = await this.database.getDevices();

      res.json(db);
    });

    this.app.get('/groups', async (req, res) => {
      const db = await this.database.getGroups();

      res.json(db);
    });

    this.app.get('/serialnumbers', async (req, res) => {
      const db = await this.database.getSerialnumbers();

      res.json(db);
    });

    this.app.get('/device', async (req, res) => {
      const deviceID = req.query.device;
      const { propertie, from, to } = req.query;

      logger.info(`Got GET request on /device with propertie=${propertie}, from=${from}, to=${to}`);

      let db = '';

      switch (propertie) {
        case 'airVolume':
          db = await this.database.getAirVolume(deviceID,
            (from === undefined || from === '') ? undefined : new Date(from),
            (to === undefined || to === '') ? undefined : new Date(to));
          break;
        case 'lampValues':
          db = await this.database.getLampValues(deviceID, undefined,
            (from === undefined || from === '') ? undefined : new Date(from),
            (to === undefined || to === '') ? undefined : new Date(to));
          break;
        case 'tacho':
          db = await this.database.getTachos(deviceID,
            (from === undefined || from === '') ? undefined : new Date(from),
            (to === undefined || to === '') ? undefined : new Date(to));
          break;
        default:
          res.sendStatus(404);
          break;
      }

      res.json(db);
    });

    this.app.get('/timestamps', async (req, res) => {
      const { propertie, device } = req.query;

      logger.info(`Got GET request on /timestamps with propertie=${propertie}, device=${device}`);

      if (device === undefined || device === '') {
        res.sendStatus(404);
        return;
      }

      let db = '';

      switch (propertie) {
        case 'airVolume':
          db = await this.database.getDurationOfAvailableData(device, 'currentAirVolume');
          break;
        case 'lampValues':
          db = await this.database.getDurationOfAvailableData(device, 'lampValues');
          break;
        case 'tacho':
          db = await this.database.getDurationOfAvailableData(device, 'tacho');
          break;
        default:
          res.sendStatus(404);
          return;
      }

      res.json(db);
    });
  }

  async stopServer() {
    logger.info('Shutting down...');

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
    logger.info({ level: 'info', message: 'Starting server' });
    try {
      await this.database.connect();

      this.httpServer.listen(this.config.http.port, () => {
        logger.info(`HTTP listening on ${this.config.http.port}`);
      });

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
