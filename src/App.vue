<template>
  <div id="app" class="flex min-h-screen shadow-md text-color">
    <Sidebar
      @showDevices="currentView = 'UVCDeviceList'"
      @showGroups="currentView = 'UVCGroupList'"
      @deviceAdd="deviceAdd($event)">
    </Sidebar>
    <component v-bind:is="currentViewComponent"
      :devices="deviceList"
      :groups="this.$root.$data.dataGroups"
      class="flex-grow"
      @changeState="changeState($event)"
      @deviceUpdate="deviceUpdate($event)"
      @deviceDelete="deviceDelete($event)"></component>
  </div>
</template>

<script>
import './css/styles.css';
import Sidebar from './components/Sidebar.vue';
import UVCDeviceList from './components/UVCDeviceList.vue';
import UVCGroupList from './components/UVCGroupList.vue';

export default {
  name: 'App',
  components: {
    Sidebar,
    UVCDeviceList,
    UVCGroupList,
  },
  computed: {
    currentViewComponent() {
      return this.currentView;
    },
    deviceList() {
      console.log('DeviceList getter/setter');
      return this.$root.$data.dataDevices;
    },
  },
  methods: {
    changeState(prop) {
      this.$root.$data.socket.emit('device_changeState', prop);
    },
    deviceAdd(device) {
      this.$root.$data.socket.emit('device_add', device);
    },
    deviceUpdate(device) {
      this.$root.$data.socket.emit('device_update', device);
    },
    deviceDelete(serialnumber) {
      this.$root.$data.socket.emit('device_delete', serialnumber);
    },
  },
  created() {

  },
  data() {
    return {
      currentView: 'UVCDeviceList',
    };
  },
};
</script>
