const express = require('express');
const http = require('http');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const MainLogger = require('../Logger.js').logger;
const userMiddleware = require('./middleware/user');

const logger = MainLogger.child({ service: 'ExpressServer' });

module.exports = class ExpressServer {
  constructor(server, config, database) {
    this.config = config;
    this.database = database;

    this.app = express();
    this.httpServer = http.createServer(this.app);

    this.app.use(cors({
      origin: 'http://127.0.0.1:8080',
      credentials: true,
    }));
    this.app.use(express.json());

    const apiRouter = express.Router();

    this.app.use(cookieParser());

    this.app.use('/ui/login', express.static(`${__dirname}/sites/login.html`));
    this.app.use('/ui/managment', userMiddleware.isLoggedIn, express.static(`${__dirname}/sites/managment.html`));
    this.app.use('/static/', express.static(`${__dirname}/sites/static/`));

    this.app.post('/sign-up', userMiddleware.validateRegister, async (req, res, next) => {
      logger.info('Got valid request on sign-up route. Request: %o', req.body);
      try {
        await this.database.addUser({
          username: req.body.username,
          password: req.body.password,
          canEdit: false,
        });
        logger.info('Added User %s to database', req.body.username);

        return res.status(201).send({
          msg: 'Registered!',
        });
      } catch (error) {
        if (error.message === 'User already exists') {
          logger.info('User %s already exists in database', req.body.username);
          return res.status(401).send({
            msg: error.message,
          });
        }
        server.emit('error', { service: 'ExpressServer', error });
        return res.status(500).send({
          msg: error.message,
        });
      }
    });

    this.app.post('/login', async (req, res, next) => {
      logger.info('Got valid request on login route. Request: %o', req.body);
      try {
        const user = await this.database.getUser(req.body.username);
        logger.info('User exists in database');
        const match = await bcrypt.compare(req.body.password, user.password);

        if (match) {
          logger.info('Password matches with database entry');
          const token = jwt.sign({
            username: user.username,
            userId: user.id,
          },
          'SECRETKEY', {
            expiresIn: '1d',
          });

          res.cookie('UVCleanSID', token, { httpOnly: true, domain: '127.0.0.1' });
          logger.info('Responding with cookie "UVCleanSID", token, %o with user %o', { httpOnly: true, domain: '127.0.0.1' }, user);
          return res.status(201).send({
            user,
            url: `/ui/managment?user=${user.username}`,
          });
        }
        logger.info('Password does not match with database entry');
        return res.status(401).send({
          msg: 'Username or password is incorrect!',
        });
      } catch (error) {
        res.status(500).send({
          msg: error.message,
        });
        server.emit('error', { service: 'ExpressServer', error });
      }
    });

    apiRouter.get('/user', async (req, res) => {
      const { username } = req.query;
      logger.info(`Got GET request on /user with username=${username}`);
      if (!username) return res.sendStatus(404).send({ msg: 'No username provided' });
      try {
        const db = await this.database.getUser(username);
        return res.json({ user: { username: db.username, canEdit: db.canEdit } });
      } catch (error) {
        server.emit('error', { service: 'ExpressServer', error });
        return res.sendStatus(500);
      }
    });

    apiRouter.get('/devices', async (req, res) => {
      try {
        const db = await this.database.getDevices();
        res.json(db);
      } catch (error) {
        server.emit('error', { service: 'ExpressServer', error });
        res.sendStatus(500);
      }
    });

    apiRouter.get('/groups', async (req, res) => {
      try {
        const db = await this.database.getGroups();
        res.json(db);
      } catch (error) {
        server.emit('error', { service: 'ExpressServer', error });
        res.sendStatus(500);
      }
    });

    apiRouter.get('/groupids', async (req, res) => {
      try {
        const db = await this.database.getGroupIDs();
        res.json(db);
      } catch (error) {
        server.emit('error', { service: 'ExpressServer', error });
        res.sendStatus(500);
      }
    });

    apiRouter.get('/serialnumbers', async (req, res) => {
      try {
        const db = await this.database.getSerialnumbers();
        res.json(db);
      } catch (error) {
        server.emit('error', { service: 'ExpressServer', error });
        res.sendStatus(500);
      }
    });

    apiRouter.get('/device', async (req, res) => {
      const serialnumber = req.query.device;
      const { propertie, from, to } = req.query;

      logger.info(`Got GET request on /device with propertie=${propertie}, from=${from}, to=${to}`);

      let db = '';

      try {
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
      } catch (error) {
        server.emit('error', { service: 'ExpressServer', error });
        res.sendStatus(500);
      }

      res.json(db);
    });

    apiRouter.get('/group', async (req, res) => {
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
        server.emit('error', { service: 'ExpressServer', error });
        res.sendStatus(500);
      }
    });

    apiRouter.get('/timestamps', async (req, res) => {
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
        server.emit('error', { service: 'ExpressServer', error });
        if (error.message === 'No data available.') { res.sendStatus(404); return; }
        res.sendStatus(500, error);
      }
    });

    this.app.use('/api/', apiRouter);
  }

  startExpressServer() {
    this.httpServer.listen(this.config.port, () => {
      logger.info(`HTTP listening on ${this.config.port}`);
    });
  }

  stopExpressServer() {
    if (this.httpServer.listening) {
      this.httpServer.close((err) => {
        if (err !== undefined) {
          logger.error(err);
        }
      });
    }
  }
};
