const express = require('express');
const { Server } = require('http');
const socketio = require('socket.io');

const port = 3000;

const MongoDBAdapter = require('./MongoDBAdapter');

const uri = 'mongodb://127.0.0.1:27017/';
const database = 'uvclean-test';

const mongoDB = new MongoDBAdapter(uri, database);

const app = express();
const http = Server(app);
const io = socketio(http);

app.use(express.static(`${__dirname}/dist`));

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/dist/index.html`);
});

io.on('connection', (socket) => {
  console.log('a dashboard connected');

  socket.onAny((event, ...args) => {
    console.log(`AnyEvent: got ${event}`, args);
  });

  socket.on('device_stateChange', async (props) => {
    console.log('got "device_stateChange" event with props:', props);

    const d = {};
    d.serialnumber = props.device;
    d[props.prop] = props.newValue;

    await mongoDB.updateDevice(d);

    io.emit('device_stateChanged', props);
  });

  socket.on('disconnect', () => {
    console.log('a dashboard disconnected');
  });
});

http.listen(port, () => {
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
