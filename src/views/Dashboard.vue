<template>
  <div class="flex text-color">
    <Sidebar
      class="w-1/6"
      @showDevices="showDevices"
      @showGroups="currentView = 'UVCGroupList'"
      @deviceAdd="deviceAdd($event)">
    </Sidebar>
    <router-view class="w-5/6 h-full"></router-view>
    <!-- <component v-bind:is="currentViewComponent"
      class="flex-grow"
      @changeState="changeState($event)"
      @deviceUpdate="deviceUpdate($event)"
      @deviceDelete="deviceDelete($event)"></component> -->
  </div>
</template>

<script>
import '../css/styles.css';
import Sidebar from '../components/dashboard/Sidebar.vue';
// import UVCDeviceList from '../components/dashboard/UVCDeviceList.vue';
// import UVCGroupList from '../components/dashboard/UVCGroupList.vue';

export default {
  name: 'Dashboard',
  components: {
    Sidebar,
    // UVCDeviceList,
    // UVCGroupList,
  },
  computed: {
    currentViewComponent() {
      return this.currentView;
    },
    deviceList() {
      console.log('DeviceList getter/setter');
      return this.$root.$data.dataStore;
    },
  },
  methods: {
    showDevices() {
      this.$router.push({ name: 'devices' });
    },
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
      this.$root.$data.socket.emit('device_delete', { serialnumber });
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
