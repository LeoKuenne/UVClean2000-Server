/* eslint-disable no-await-in-loop */
/* eslint-disable no-underscore-dangle */
const supertest = require('supertest');
const ExpressServer = require('../../server/ExpressServer');
const MongoDBAdapter = require('../../server/databaseAdapters/mongoDB/MongoDBAdapter.js');

let request = null;

let expressServer = null;
let database = null;

beforeAll(async () => {
  database = new MongoDBAdapter(global.__MONGO_URI__.replace('mongodb://', ''), '');
  await database.connect();
  expressServer = new ExpressServer({
    port: 80,
  }, database);
  expressServer.startExpressServer();
  request = supertest(expressServer.app);
});

afterAll(async () => {
  await database.close();
  expressServer.stopExpressServer();
});

describe('Express Route testing', () => {
  beforeEach(() => {
    database.clearCollection('uvcdevices');
    database.clearCollection('uvcgroups');
  });

  it('GET /devices', async (done) => {
    const devices = [];
    for (let i = 0; i < 10; i += 1) {
      devices.push({
        serialnumber: `${i}`,
        name: `Test ${i}`,
        group: 'undefined',
        engineState: false,
        engineLevel: 0,
        currentBodyState: { state: '' },
        currentFanState: { state: '' },
        currentLampState: [],
        currentLampValue: [],
        identifyMode: false,
        eventMode: false,
        tacho: { tacho: 0 },
        currentAirVolume: { volume: 0 },
      });
      await database.addDevice({ serialnumber: `${i}`, name: `Test ${i}` });
    }

    const res = await request.get('/devices');
    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual(devices);
    done();
  });

  it('GET /groups', async (done) => {
    const groups = [];
    for (let i = 0; i < 10; i += 1) {
      const group = await database.addGroup({ name: `Test ${i}` });

      groups.push({
        devices: [],
        id: `${group._id}`,
        name: `Test ${i}`,
      });
    }

    const res = await request.get('/groups');
    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual(groups);
    done();
  });

  it('GET /serialnumbers', async (done) => {
    const serialnumbers = [];
    for (let i = 0; i < 10; i += 1) {
      serialnumbers.push(`${i}`);
      await database.addDevice({ serialnumber: `${i}`, name: `Test ${i}` });
    }

    const res = await request.get('/serialnumbers');
    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual(serialnumbers);
    done();
  });

  it('GET /device responses with 404 if no propertie is queried', async (done) => {
    const device = {
      serialnumber: '1',
      name: 'Test 1',
    };
    await database.addDevice(device);

    const res = await request.get('/device').query({ device: '1' });
    expect(res.status).toBe(404);
    done();
  });

  it('GET /device responses with all properties', async (done) => {
    const device = {
      serialnumber: '1',
      name: 'Test 1',
    };
    await database.addDevice(device);

    const volumes = [];
    for (let i = 0; i < 10; i += 1) {
      volumes.push({
        device: '1',
        volume: 10 * i,
        date: new Date(i * 10000),
      });
    }

    await Promise.all(
      volumes.map(async (v) => {
        await database.addAirVolume(v);
      }),
    );

    const res = await request.get('/device')
      .query({ device: '1' })
      .query({ propertie: 'airVolume' });
    expect(res.status).toBe(200);
    for (let i = 0; i < 10; i += 1) {
      expect(res.body[i].device).toBe(device.serialnumber);
      expect(res.body[i].volume).toBe(volumes[i].volume);
      expect(res.body[i].date).toBe(volumes[i].date.toISOString());
    }
    done();
  });

  it('GET /timestamps responses with all', async (done) => {
    const device = {
      serialnumber: '1',
      name: 'Test 1',
    };
    await database.addDevice(device);

    const volumes = [];
    for (let i = 0; i < 10; i += 1) {
      volumes.push({
        device: '1',
        volume: 10 * i,
        date: new Date(i * 10000),
      });
    }

    await Promise.all(
      volumes.map(async (v) => {
        await database.addAirVolume(v);
      }),
    );

    const res = await request.get('/timestamps')
      .query({ device: '1' })
      .query({ propertie: 'airVolume' });
    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({
      from: new Date(0).toISOString(),
      to: new Date(9 * 10000).toISOString(),
    });
    done();
  });
});
