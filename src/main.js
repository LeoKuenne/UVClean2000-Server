import Vue from 'vue';
import App from './App.vue';
import router from './router/index';

Vue.config.productionTip = false;

// eslint-disable-next-line no-undef
const socket = io('http://192.168.4.10:3000');

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

    fetch('http://192.168.4.10:3000/devices').then((response) => response.json())
      .then((data) => {
        console.log(data);
        this.$dataStore.devices = data;
        console.log(this.$dataStore);
      });

    fetch('http://192.168.4.10:3000/groups').then((response) => response.json())
      .then((data) => {
        console.log(data);
        this.$dataStore.groups = data;
        console.log(this.$dataStore);
      });

    // Debug any messages that are coming from the backend
    socket.onAny((event, ...args) => {
      console.debug(`Debug: Event - ${event}`, args);
    });

    socket.on('device_added', (device) => {
      console.log('Event: device_added', device);
      this.$dataStore.devices.push(device);
    });

    socket.on('group_added', (group) => {
      console.log('Event: group_added', group);
      this.$dataStore.groups.push(group);
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
            case 'currentFanAlarm':
              dev.currentFanAlarm = `${props.newValue}`;
              break;
            case 'currentBodyAlarm':
              dev.currentBodyAlarm = `${props.newValue}`;
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
            case 'currentLampAlarm':
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

    socket.on('device_deleted', (serialnumber) => {
      console.log('Event: device_deleted', serialnumber);
      if (serialnumber !== undefined) {
        for (let i = 0; i < this.$dataStore.devices.length; i += 1) {
          if (serialnumber === this.$dataStore.devices[i].serialnumber) {
            this.$dataStore.devices.splice(i, 1);
          }
        }
      }
    });

    socket.on('group_deleted', (group) => {
      console.log('Event: group_deleted', group);
      if (group.id !== undefined) {
        for (let i = 0; i < this.$dataStore.groups.length; i += 1) {
          if (group.id === this.$dataStore.groups[i].id) {
            this.$dataStore.groups.splice(i, 1);
          }
        }
      }
    });
  },
}).$mount('#app');
