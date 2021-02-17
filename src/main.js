import Vue from 'vue';
import App from './App.vue';
import router from './router/index';

Vue.config.productionTip = false;

// eslint-disable-next-line no-undef
const socket = io('http://localhost:3000');

const store = Vue.observable({
  devices: [],
  groups: [],
  user: '',
});

Vue.prototype.$dataStore = store;

new Vue({
  render: (h) => h(App),
  router,
  data: {
    socket,
  },
  created() {
    window.onbeforeunload = () => {
      socket.emit('leave', this.username);
    };

    fetch('http://localhost:3000/devices').then((response) => response.json())
      .then((data) => {
        console.log(data);
        this.$dataStore.devices = data;
        console.log(this.$dataStore);
      });

    socket.on('device_added', (device) => {
      console.log('Event: device_added', device);
      this.$dataStore.devices.push(device);
    });

    // Debug any messages that are coming from the backend
    socket.onAny((event, ...args) => {
      console.debug(`Debug: Event - ${event}`, args);
    });

    socket.on('device_stateChanged', (props) => {
      console.log('Event: device_stateChanged', props);

      const d = this.$dataStore.devices.filter((device) => {
        if (device.serialnumber === props.serialnumber) {
          const dev = device;
          let propertie = '';
          switch (props.prop) {
            case 'engineState':
            case 'eventMode':
            case 'identifyMode':
              dev[props.prop] = (`${props.newValue}` === 'true');
              break;
            case 'tacho':
            case 'currentAirVolume':
            case 'engineLevel':
              dev[props.prop] = parseInt(props.newValue, 10);
              break;
            case 'currentAlarm':
              propertie = dev[props.prop];
              propertie[props.lamp - 1].state = props.newValue;
              break;
            case 'currentLampValue':
              propertie = dev[props.prop];
              propertie[props.lamp - 1].value = parseInt(props.newValue, 10);
              break;
            default:
              break;
          }
          return dev;
        }
        return false;
      });
      console.log('Device that changed:', d);
    });

    // socket.on('device_updated', (device) => {
    //   console.log('Event: device_updated', device);
    //   const dev = this.dataDevices.filter((d) => device.serialnumber === d.serialnumber)[0];
    //   console.log(dev);
    //   if (dev !== undefined) { dev.name = device.name; }
    // });

    // socket.on('device_deleted', (serialnumber) => {
    //   console.log('Event: device_deleted', serialnumber);
    //   const dev = this.dataDevices.filter((d) => serialnumber === d.serialnumber)[0];
    //   const index = this.dataDevices.indexOf(dev);
    //   this.dataDevices.splice(index, 1);
    // });
  },
}).$mount('#app');
