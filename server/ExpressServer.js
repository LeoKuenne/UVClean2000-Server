const express = require('express');
const http = require('http');
const cors = require('cors');
const MainLogger = require('./Logger.js').logger;

const logger = MainLogger.child({ service: 'ExpressServer' });

module.exports = class ExpressServer {
  constructor(config, database) {
    this.config = config;
    this.database = database;

    this.app = express();
    this.httpServer = http.createServer(this.app);

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
          return;
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
      console.log(db);

      res.json(db);
    });
  }

  startExpressServer() {
    this.httpServer.listen(this.config.port, () => {
      logger.info(`HTTP listening on ${this.config.port}`);
    });
  }

  stopExpressServer() {
    if (this.httpServer.listening) {
      this.httpServer.close((err) => {
        if (err !== undefined) console.error(err);
      });
    }
  }
};
