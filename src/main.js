import Vue from 'vue';
import App from './App.vue';

Vue.config.productionTip = false;

// eslint-disable-next-line no-undef
const socket = io('http://localhost:3000');

new Vue({
  render: (h) => h(App),
  data: {
    dataDevices: [
      { name: 'Test', serialnumber: '123456789' },
    ],
    dataGroups: [],
    socket,
  },
  created() {
    window.onbeforeunload = () => {
      socket.emit('leave', this.username);
    };

    fetch('http://localhost:3000/devices').then((response) => response.json())
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
      const d = this.dataDevices.filter((device) => {
        if (device.serialnumber === props.serialnumber) {
          const dev = device;
          switch (props.prop) {
            case 'engineState':
            case 'eventMode':
            case 'identifyMode':
              dev[props.prop] = (`${props.newValue}` === 'true');
              break;
            case 'tacho':
            case 'airVolume':
            case 'engineLevel':
              dev[props.prop] = parseInt(props.newValue, 10);
              break;
              // case 'alarm':
              // case 'lamp':
              //   return {
              //     value: `${value}`,
              //     lamp: parseInt(subpropertie, 10),
              //   };
            default:
              break;
          }
          return dev;
        }
        return false;
      });
      console.log('Device that changed:', d);
    });

    socket.on('device_added', (device) => {
      console.log('Event: device_added', device);
      this.dataDevices.push(device);
    });

    socket.on('device_updated', (device) => {
      console.log('Event: device_updated', device);
      const dev = this.dataDevices.filter((d) => device.serialnumber === d.serialnumber)[0];
      console.log(dev);
      if (dev !== undefined) { dev.name = device.name; }
    });

    socket.on('device_deleted', (serialnumber) => {
      console.log('Event: device_deleted', serialnumber);
      const dev = this.dataDevices.filter((d) => serialnumber === d.serialnumber)[0];
      const index = this.dataDevices.indexOf(dev);
      this.dataDevices.splice(index, 1);
    });
  },
}).$mount('#app');
