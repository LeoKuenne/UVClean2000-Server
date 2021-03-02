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

    this.app.get('/groupids', async (req, res) => {
      const db = await this.database.getGroupIDs();

      res.json(db);
    });

    this.app.get('/serialnumbers', async (req, res) => {
      const db = await this.database.getSerialnumbers();

      res.json(db);
    });

    this.app.get('/device', async (req, res) => {
      const serialnumber = req.query.device;
      const { propertie, from, to } = req.query;

      logger.info(`Got GET request on /device with propertie=${propertie}, from=${from}, to=${to}`);

      let db = '';

      switch (propertie) {
        case 'airVolume':
          db = await this.database.getAirVolume(serialnumber,
            (from === undefined || from === '') ? undefined : new Date(from),
            (to === undefined || to === '') ? undefined : new Date(to));
          break;
        case 'lampValues':
          db = await this.database.getLampValues(serialnumber, undefined,
            (from === undefined || from === '') ? undefined : new Date(from),
            (to === undefined || to === '') ? undefined : new Date(to));
          break;
        case 'tacho':
          db = await this.database.getTachos(serialnumber,
            (from === undefined || from === '') ? undefined : new Date(from),
            (to === undefined || to === '') ? undefined : new Date(to));
          break;
        default:
          res.sendStatus(404);
          return;
      }

      res.json(db);
    });

    this.app.get('/group', async (req, res) => {
      const groupID = req.query.group;
      const { propertie, from, to } = req.query;

      logger.info(`Got GET request on /group with propertie=${propertie}, from=${from}, to=${to}`);

      const db = [];
      try {
        const devices = await this.database.getDevicesInGroup(groupID);

        await Promise.all(devices.map(async (dev) => {
          switch (propertie) {
            case 'airVolume':
              db.push(await this.database.getAirVolume(dev.serialnumber,
                (from === undefined || from === '') ? undefined : new Date(from),
                (to === undefined || to === '') ? undefined : new Date(to)));
              break;
            case 'tacho':
              db.push(await this.database.getTachos(dev.serialnumber,
                (from === undefined || from === '') ? undefined : new Date(from),
                (to === undefined || to === '') ? undefined : new Date(to)));
              break;
            default:
              break;
          }
        }));

        res.json(db);
      } catch (error) {
        logger.error(error);
        res.sendStatus(500);
      }
    });

    this.app.get('/timestamps', async (req, res) => {
      const { propertie, device, group } = req.query;

      logger.info(`Got GET request on /timestamps with propertie=${propertie}, ${(device) ? `device=${device}` : `group=${group}`}`);

      if (device === undefined && group === undefined) {
        res.sendStatus(404);
        return;
      }

      let db = '';
      let prop = '';
      switch (propertie) {
        case 'airVolume':
          prop = 'currentAirVolume';
          break;
        case 'lampValues':
          prop = 'lampValues';
          break;
        case 'tacho':
          prop = 'tacho';
          break;
        default:
          res.sendStatus(404);
          return;
      }

      try {
        if (device) {
          db = await this.database.getDurationOfAvailableData(device, prop);
          res.json(db);
        } else if (group) {
          const devicesInGroup = await this.database.getDevicesInGroup(group);

          let durations = { from: '', to: '' };

          await Promise.all(devicesInGroup.map(async (dev) => {
            const duration = await this.database
              .getDurationOfAvailableData(dev.serialnumber, prop);

            if (durations.from === '') {
              durations = duration;
            } else {
              if (duration.from > durations.from) durations.from = duration.from;
              if (duration.to < durations.to) durations.to = duration.to;
            }
          }));

          res.json(durations);
        }
      } catch (error) {
        logger.error(error);
        if (error.message === 'No data available.') { res.sendStatus(404); return; }
        res.sendStatus(500, error);
      }
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
