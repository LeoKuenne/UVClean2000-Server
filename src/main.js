import Vue from 'vue';
import App from './App.vue';

Vue.config.productionTip = false;

// eslint-disable-next-line no-undef
const socket = io();

new Vue({
  render: (h) => h(App),
  data: {
    dataDevices: [
      {},
    ],
    dataGroups: [],
    socket,
  },
  created() {
    window.onbeforeunload = () => {
      socket.emit('leave', this.username);
    };

    fetch('/devices').then((response) => response.json())
      .then((data) => {
        console.log(data);
        this.dataDevices = data;
      });

    // Debug any messages that are coming from the backend
    socket.onAny((event, ...args) => {
      console.debug(`Debug: Event - ${event}`, args);
    });

    socket.on('device_stateChanged', (props) => {
      console.log('Event: device_stateChanged', props);
      const d = this.dataDevices.filter((device) => device.serialnumber === props.serialnumber)[0];
      console.log('Device that changed:', d);
      if (d !== undefined) { d[props.prop] = props.value; }
    });

    socket.on('device_Added', (device) => {
      console.log('Event: device_Added', device);
      this.dataDevices.push(device);
    });

    socket.on('device_Updated', (device) => {
      console.log('Event: device_Updated', device);
      const dev = this.dataDevices.filter((d) => device.serialnumber === d.serialnumber)[0];
      console.log(dev);
      if (dev !== undefined) { dev.name = device.name; }
    });

    socket.on('device_Deleted', (device) => {
      console.log('Event: device_Deleted', device);
      const dev = this.dataDevices.filter((d) => device.serialnumber === d.serialnumber)[0];
      const index = this.dataDevices.indexOf(dev);
      this.dataDevices.splice(index, 1);
    });
  },
}).$mount('#app');

/**
      {
        name: 'Test 2',
        serialnumber: 'SN:12485125',
        state: 'on',
        engine: 'on',
        enginelevel: 3,
        error: '',
        current: 12,
        rotationspeed: 200,
        eventmode: 'on',
        identify: 'off',
      },
      {
        name: 'Test 3',
        serialnumber: 'SN:12485125',
        state: 'on',
        engine: 'on',
        enginelevel: 3,
        error: '',
        current: 12,
        rotationspeed: 200,
        eventmode: 'on',
        identify: 'off',
      },
      {
        name: 'Test 4',
        serialnumber: 'SN:12485125',
        state: 'on',
        engine: 'on',
        enginelevel: 3,
        error: '',
        current: 12,
        rotationspeed: 200,
        eventmode: 'on',
        identify: 'off',
      },
      {
        name: 'Test 5',
        serialnumber: 'SN:12485125',
        state: 'on',
        engine: 'on',
        enginelevel: 3,
        error: '',
        current: 12,
        rotationspeed: 200,
        eventmode: 'on',
        identify: 'off',
      },
 *
 */
