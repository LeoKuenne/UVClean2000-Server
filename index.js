const express = require('express');
const fs = require('fs');
const http = require('http');
const https = require('https');
const cors = require('cors');
const socketio = require('socket.io');
const mqtt = require('mqtt');
const MongoDBAdapter = require('./MongoDBAdapter');

const port = 3000;

const uri = 'mongodb://127.0.0.1:27017';
const database = 'uvclean-server';
const mongoDB = new MongoDBAdapter(uri, database);

const options = {
  key: fs.readFileSync('./ssl/localhost_key.pem'),
  cert: fs.readFileSync('./ssl/localhost_cert.pem'),
};

const app = express();
const httpServer = http.createServer(app);
const io = socketio(httpServer);

app.use(express.static(`${__dirname}/dist`));

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/dist/index.html`);
});

app.get('/devices', cors(), async (req, res) => {
  const db = await mongoDB.getDevices();

  res.json(db);
});

mongoDB.connect();

const mqttBroker = 'mqtt://192.168.5.60:1883';
const client = mqtt.connect(mqttBroker);
client.on('connect', () => {
  console.log('MQTT Client Connected.');

  // Subscribe to device/# and group/# Messages that are published on MQTT
  client.subscribe(['UVClean/#', 'group/#'], (err) => {
    if (err) console.log(err);
  });

  // Handle messages that are published on MQTT
  client.on('message', async (topic, message) => {
    console.log(`Event: MQTT-Message: ${topic} | ${message.toString()}`);

    const t = topic.split('/');
    const serialnumber = t[1];
    const event = t[2];
    let value = message.toString();
    let propertie = '';

    switch (event) {
      case 'state_changed':
        const prop = t[3];

        switch (prop) {
          case 'engineState':
            propertie = 'state';
            value = message.toString() === 'true';
            break;
          case 'eventMode':
            propertie = 'eventMode';
            value = message.toString() === 'true';
            break;
          case 'identifyMode':
            propertie = 'identifyMode';
            value = message.toString() === 'true';
            break;
          case 'dummyData':
            propertie = 'dummyData';
            value = message.toString() === 'true';
            break;
          case 'engineLevel':
            propertie = 'engineLevel';
            value = parseInt(message.toString(), 10);
            break;
          case 'Tacho':
            propertie = 'rotationSpeed';
            value = parseInt(message.toString(), 10);
            break;
          case 'airVolume':
            propertie = 'airVolume';
            value = parseInt(message.toString(), 10);
            break;
          case 'lastError':
            value = message.toString();
            break;
          default:
            return;
        }

        // Send MQTT messages to the frontend
        // No propper Parsing
        io.emit('device_stateChanged', {
          serialnumber,
          propertie,
          value,
        });

        // Save device_stateChanged events in database
        console.log('Event: stateChanged: Updating Database with:', propertie, value);
        const d = {};
        d.serialnumber = serialnumber;
        d[propertie] = value;

        await mongoDB.updateDevice(d);
        break;
      default:
        break;
    }
  });
});

io.on('connection', (socket) => {
  console.log('a dashboard connected');

  // Debug any messages that are coming from the frontend
  socket.onAny((event, ...args) => {
    console.debug(`Debug: Socket.io Message: ${event}`, args);
  });

  // Handle device_stateChange event from frontend
  socket.on('device_stateChange', async (props) => {
    console.log('Event: device_stateChange:', props);

    const { serialnumber } = props;
    let propertie = '';
    const { newValue } = props;

    switch (props.prop) {
      case 'state':
        propertie = 'engineState';
        break;
      case 'eventMode':
        propertie = 'eventMode';
        break;
      case 'engineLevel':
        propertie = 'engineLevel';
        break;
      case 'identify':
        propertie = 'identify';
        break;
      default:
        break;
    }

    // Publish stateChange messages for the device and changed propertie on MQTT
    client.publish(`UVClean/${props.serialnumber}/change_state/${propertie}`, `${newValue}`, (err) => {
      if (err) console.error(err);
    });
  });

  // Handle device_add event from frontend
  socket.on('device_add', async (props) => {
    console.log('Event: device_add:', props);

    const device = {
      serialnumber: props.serialnumber,
      name: props.name,
      state: false,
      engineLevel: 1,
      currentError: '',
      identifyMode: false,
      eventMode: false,
      rotationSpeed: 0,
      currentAirVolume: 0,
    };

    await mongoDB.addDevice(device).catch((err) => {
      console.error(err);
    });

    io.emit('device_added', device);
  });

  // Handle device_update event from frontend
  socket.on('device_update', async (device) => {
    console.log('Event: device_update:', device);

    await mongoDB.updateDevice(device);
    const d = await mongoDB.getDevice(`${device.serialnumber}`);

    io.emit('device_updated', d);
  });

  // Handle device_delete event from frontend
  socket.on('device_delete', async (serialnumber) => {
    console.log('Event: device_delete:', serialnumber);
    const d = await mongoDB.deleteDevice(serialnumber).catch((err) => {
      console.error(err);
    });

    if (d !== undefined) { io.emit('device_deleted', serialnumber); }
  });

  socket.on('disconnect', () => {
    console.log('a dashboard disconnected');
  });
});

httpServer.listen(port, () => {
  console.log(`listening on ${port}`);
});

// async function storeData() {
//   await mongoDB.storeDevice({ serialnumber: 'Test' });
//   const s = await mongoDB.getDevices();
//   console.log(s);
// }

// storeData();

/*
{
  .serialnumber,
  .name,
  .state,
  .engineLevel,
  .lastError,
  .identifyMode,
  .eventMode,
  .rotationSpeed,
  .airVolume,
}
*/
