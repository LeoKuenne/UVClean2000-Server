<template>
  <div id="app" class="bg-gray-100 flex min-h-screen shadow-md">
    <Sidebar
      @showDevices="currentView = 'UVCDeviceList'"
      @showGroups="currentView = 'UVCGroupList'">
    </Sidebar>
    <component v-bind:is="currentViewComponent"
      :devices="this.$root.$data.dataDevices"
      :groups="this.$root.$data.dataGroups"
      class="flex-grow"
      @stateChanged='stateChanged($event)'></component>
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
  },
  methods: {
    stateChanged(prop) {
      this.$root.$data.socket.emit('device_stateChange', prop);
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
