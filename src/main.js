import Vue from 'vue';
import App from './App.vue';

Vue.config.productionTip = false;

// eslint-disable-next-line no-undef
const socket = io();

new Vue({
  render: (h) => h(App),
  data: {
    dataDevices: [
      {
        name: 'Test 1',
        serialnumber: 'SN:12485125',
        state: true,
        engineLevel: 3,
        lastError: '',
        identifyMode: false,
        eventMode: false,
        rotationSpeed: 120,
        airVolume: 12,
      },
    ],
    dataGroups: [],
    socket,
  },
  created() {
    window.onbeforeunload = () => {
      socket.emit('leave', this.username);
    };

    socket.on('device_stateChanged', (props) => {
      const d = this.dataDevices.filter((device) => device.serialnumber === props.device)[0];
      d[props.prop] = props.newValue;
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
