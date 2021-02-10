const express = require('express');
const fs = require('fs');
const https = require('https');
const socketio = require('socket.io');
const mqtt = require('mqtt');
const MongoDBAdapter = require('./MongoDBAdapter');

const port = 3000;

const uri = 'mongodb://127.0.0.1:27017/';
const database = 'uvclean-test';
const mongoDB = new MongoDBAdapter(uri, database);

const options = {
  key: fs.readFileSync('./ssl/localhost_key.pem'),
  cert: fs.readFileSync('./ssl/localhost_cert.pem'),
};

const app = express();
const httpsServer = https.createServer(options, app);
const io = socketio(httpsServer);

app.use(express.static(`${__dirname}/dist`));

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/dist/index.html`);
});

app.get('/devices', async (req, res) => {
  const db = await mongoDB.getDevices();
  res.json(db);
});

const mqttBroker = 'mqtt://127.0.0.1:1883';
const client = mqtt.connect(mqttBroker);
client.on('connect', () => {
  console.log('MQTT Client Connected.');

  // Subscribe to device/# and group/# Messages that are published on MQTT
  client.subscribe(['device/#', 'group/#'], (err) => {
    if (err) console.log(err);
  });

  // Handle messages that are published on MQTT
  client.on('message', async (topic, message) => {
    console.log(`Event: MQTT-Message: ${topic} | ${message.toString()}`);

    const t = topic.split('/');
    const serialnumber = t[1];
    const event = t[2];
    let value = message.toString();

    switch (event) {
      case 'stateChanged':
        const prop = t[3];

        switch (prop) {
          case 'state':
          case 'eventMode':
          case 'identifyMode':
          case 'dummyData':
            value = message.toString() === 'true';
            break;
          case 'engineLevel':
          case 'rotationSpeed':
          case 'airVolume':
            value = parseInt(message.toString(), 10);
            break;
          case 'lastError':
            value = message.toString();
            break;
          default:
            break;
        }

        // Send MQTT messages to the frontend
        // No propper Parsing
        io.emit('device_stateChanged', {
          serialnumber,
          prop,
          value,
        });

        // Save device_stateChanged events in database
        console.log('Event: stateChanged: Updating Database with:', prop, value);
        const d = {};
        d.serialnumber = serialnumber;
        d[prop] = value;

        await mongoDB.updateDevice(d);
        break;

      case 'device_Added':
        io.emit('device_Added', {
          serialnumber,
          name: value,
        });
        break;
      case 'device_Updated':
        io.emit('device_Updated', {
          serialnumber,
          name: value,
        });
        break;
      case 'device_Deleted':
        io.emit('device_Deleted', {
          serialnumber,
          name: value,
        });
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

    // Publish stateChange messages for the device and changed propertie on MQTT
    client.publish(`device/${props.serialnumber}/stateChange/${props.prop}`, `${props.newValue}`, (err) => {
      if (err) console.error(err);
    });
  });

  // Handle device_add event from frontend
  socket.on('device_add', async (props) => {
    console.log('Event: device_add:', props);

    mongoDB.createDevice(props);
    try {
      const device = await mongoDB.getDevice(props.serialnumber);
      client.publish(`device/${device.serialnumber}/device_Added/`, device.name, (err) => {
        if (err) console.error(err);
      });
    } catch (e) {
      console.error(e);
    }
  });

  // Handle device_update event from frontend
  socket.on('device_update', async (device) => {
    console.log('Event: device_update:', device);

    mongoDB.updateDevice(device);
    try {
      const d = await mongoDB.getDevice(device.serialnumber);
      client.publish(`device/${device.serialnumber}/device_Updated/`, device.name, (err) => {
        if (err) console.error(err);
      });
    } catch (e) {
      console.error(e);
    }
  });

  // Handle device_delete event from frontend
  socket.on('device_delete', async (serialnumber) => {
    console.log('Event: device_delete:', serialnumber);

    mongoDB.deleteDevice(serialnumber);
    client.publish(`device/${serialnumber}/device_Deleted/`, serialnumber, (err) => {
      if (err) console.error(err);
    });
  });

  socket.on('disconnect', () => {
    console.log('a dashboard disconnected');
  });
});

httpsServer.listen(port, () => {
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
