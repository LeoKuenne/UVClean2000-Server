import Vue from 'vue';
import App from './App.vue';
import router from './router/index';

Vue.config.productionTip = false;

// eslint-disable-next-line no-undef
const socket = io(`http://${process.env.VUE_APP_SERVER}:${process.env.VUE_APP_SERVER_PORT}`);

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
  async created() {
    window.onbeforeunload = () => {
      socket.emit('leave', this.username);
    };

    await this.fetchDataFromServer();

    socket.on('error', (error) => {
      console.error('error in backend', error);
      // alert(error.message);
    });

    socket.on('device_alarm', (alarmProp) => {
      console.log('Event: device_alarm', alarmProp);
      this.$dataStore.devices.filter((device) => {
        if (device.serialnumber === alarmProp.serialnumber) {
          const dev = device;
          dev.alarmState = `${alarmProp.alarmValue}` !== 'false';
        }
        return device;
      });
    });

    socket.on('group_deviceAlarm', (alarmProp) => {
      console.log('Event: group_deviceAlarm', alarmProp);
      this.$dataStore.groups.filter((group) => {
        if (group.id === alarmProp.group) {
          const grou = group;
          grou.alarmState = `${alarmProp.alarmValue}` !== 'false';
          group.devices.filter((dev) => {
            if (dev.serialnumber === alarmProp.serialnumber) {
              console.log(dev);
              // eslint-disable-next-line no-param-reassign
              dev.alarmState = `${alarmProp.alarmValue}` !== 'false';
              console.log(dev);
            }
            return dev;
          });
        }
        return group;
      });
    });

    socket.on('device_added', (device) => {
      console.log('Event: device_added', device);
      this.$dataStore.devices.push(device);
    });

    socket.on('device_deleted', async (device) => {
      console.log('Event: device_deleted', device);

      await this.fetchDataFromServer();
    });

    socket.on('group_added', (group) => {
      console.log('Event: group_added', group);
      this.$dataStore.groups.push(group);
    });

    socket.on('group_deleted', async () => {
      console.log('Event: group_deleted');
      await this.fetchDataFromServer();
    });

    socket.on('group_deviceAdded', async () => {
      console.log('Event: group_deviceAdded');

      await this.fetchDataFromServer();
    });

    socket.on('group_deviceDeleted', async (prop) => {
      console.log('Event: group_deviceDeleted', prop);

      await this.fetchDataFromServer();
    });

    socket.on('device_stateChanged', (props) => {
      // console.log('Event: device_stateChanged', props);

      this.$dataStore.devices.filter((device) => {
        if (device.serialnumber === props.serialnumber) {
          const dev = device;
          let propertie = '';
          switch (props.prop) {
            case 'name':
              dev.name = `${props.newValue}`;
              break;
            case 'currentFanState':
              dev[props.prop] = { state: `${props.newValue}` };
              break;
            case 'currentBodyState':
              dev[props.prop] = { state: `${props.newValue}` };
              break;
            case 'engineState':
            case 'eventMode':
            case 'identifyMode':
              dev[props.prop] = (`${props.newValue}` === 'true');
              break;
            case 'tacho':
              if (dev[props.prop] === undefined) {
                dev[props.prop] = { tacho: parseInt(props.newValue, 10) };
              } else {
                dev[props.prop].tacho = parseInt(props.newValue, 10);
              }
              break;
            case 'currentAirVolume':
              if (dev[props.prop] === undefined) {
                dev[props.prop] = { volume: parseInt(props.newValue, 10) };
              } else {
                dev[props.prop].volume = parseInt(props.newValue, 10);
              }
              break;
            case 'engineLevel':
              dev[props.prop] = parseInt(props.newValue, 10);
              break;
            case 'currentLampState':
              propertie = dev[props.prop];
              if (propertie[props.lamp - 1] === undefined) {
                propertie[props.lamp - 1] = { lamp: props.lamp, state: props.newValue };
              } else {
                propertie[props.lamp - 1].state = props.newValue;
              }
              break;
            case 'currentLampValue':
              propertie = dev[props.prop];
              if (propertie[props.lamp - 1] === undefined) {
                propertie[props.lamp - 1] = { lamp: props.lamp, value: props.newValue };
              } else {
                propertie[props.lamp - 1].value = props.newValue;
              }
              break;
            default:
              console.log(`Can not parse stateChanged message with prop ${props.prop}`);
              break;
          }
          return dev;
        }
        return false;
      });
      // console.log('Device that changed:', d);
    });

    socket.on('group_stateChanged', (props) => {
      console.log('Event: group_stateChanged', props);

      const g = this.$dataStore.groups.filter((group) => {
        if (group.id === props.id) {
          const dev = group;
          switch (props.prop) {
            case 'name':
              dev.name = `${props.newValue}`;
              break;
            default:
              console.log(`Can not parse stateChanged message with prop ${props.prop}`);
              break;
          }
          return dev;
        }
        return false;
      });
      console.log('Group that changed:', g);
    });
  },
  methods: {
    async fetchDataFromServer() {
      await fetch(`http://${process.env.VUE_APP_SERVER}:${process.env.VUE_APP_SERVER_PORT}/devices`).then((response) => response.json())
        .then((data) => {
          console.log(data);
          this.$dataStore.devices = data;
          console.log(this.$dataStore);
        });

      await fetch(`http://${process.env.VUE_APP_SERVER}:${process.env.VUE_APP_SERVER_PORT}/groups`).then((response) => response.json())
        .then((data) => {
          console.log(data);
          this.$dataStore.groups = data;
          console.log(this.$dataStore);
        });
    },
  },
}).$mount('#app');
