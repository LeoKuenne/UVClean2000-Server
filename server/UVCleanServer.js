const express = require('express');
const http = require('http');
const cors = require('cors');
const socketio = require('socket.io');
const mqtt = require('mqtt');
const EventEmitter = require('events');
const MongooseError = require('mongoose').Error;
const MongoDBAdapter = require('./databaseAdapters/mongoDB/MongoDBAdapter');
const controlModules = require('./controlModules/ControlModules').modules;

class UVCleanServer extends EventEmitter {
  constructor(config) {
    super();

    this.config = config;

    this.database = new MongoDBAdapter(this.config.database.mongoDB.uri,
      this.config.database.mongoDB.database);

    this.app = express();
    this.httpServer = http.createServer(this.app);
    this.io = socketio(this.httpServer, {
      cors: {
        origin: 'http://localhost:8080',
        methods: ['GET', 'POST'],
      },
    });

    // this.app.use(history());
    this.app.use(cors());

    this.app.use(express.static(`${__dirname}/dashboard/`));

    this.app.get('/', (req, res) => {
      res.sendFile(`${__dirname}/dashboard/dist/index.html`);
    });

    this.app.get('/devices', async (req, res) => {
      const db = await this.database.getDevices();

      res.json(db);
    });

    this.app.get('/serialnumbers', async (req, res) => {
      const db = await this.database.getSerialnumbers();

      res.json(db);
    });

    this.app.get('/device', async (req, res) => {
      const deviceID = req.query.device;
      const { propertie, from, to } = req.query;

      console.log(`Got GET request on /device with propertie=${propertie}, from=${from}, to=${to}`);

      let db = '';

      switch (propertie) {
        case 'airVolume':
          db = await this.database.getAirVolume(deviceID,
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

      console.log(`Got GET request on /timestamps with propertie=${propertie}, device=${device}`);

      if (device === undefined || device === '') {
        res.sendStatus(404);
        return;
      }

      let db = '';

      switch (propertie) {
        case 'airVolume':
          db = await this.database.getDurationOfAvailableData(device, 'currentAirVolume');
          break;
        default:
          res.sendStatus(404);
          return;
      }

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

      console.log(`Trying to connect to: mqtt://${this.config.mqtt.broker}:${this.config.mqtt.port}`);
      this.client = mqtt.connect(`mqtt://${this.config.mqtt.broker}:${this.config.mqtt.port}`);

      // Register all Database Modules
      controlModules.forEach((module) => {
        module.databaseModule(this, this.database);
      });

      this.client.on('connect', async () => {
        console.log(`Connected to: mqtt://${this.config.mqtt.broker}:${this.config.mqtt.port}`);

        // Register all MQTT Modules
        controlModules.forEach((module) => {
          module.mqttClientModule(this, this.client);
        });

        // Subscribe to all devices that already exists
        const db = await this.database.getDevices();
        db.forEach((device) => {
          console.log(`Subscribing to UVClean/${device.serialnumber}/#`);
          this.client.subscribe(`UVClean/${device.serialnumber}/#`);
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
            // module.removeSocketIOModule(this, socket, this.io);
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
