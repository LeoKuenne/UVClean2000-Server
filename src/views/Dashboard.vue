<template>
  <div class="flex text-color">
    <Sidebar
      class="w-1/6"
      @showDevices="showDevices"
      @showGroups="showGroups">
    </Sidebar>
    <router-view
      class="w-5/6 h-full"
      @deviceAdd="deviceAdd($event)"
      @changeState="changeState($event)"
      @deviceUpdate="changeState($event)"
      @deviceDelete="deviceDelete($event)"
      @groupAdd="groupAdd($event)"
      @groupUpdate="groupChangeState($event)"
      @groupDelete="groupDelete($event)">
    </router-view>
    <!-- <component v-bind:is="currentViewComponent"
      class="flex-grow"
      ></component> -->
  </div>
</template>

<script>
import '../css/styles.css';
import Sidebar from '../components/dashboard/Sidebar.vue';

export default {
  name: 'Dashboard',
  components: {
    Sidebar,
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
    showGroups() {
      this.$router.push({ name: 'groups' });
    },
    changeState(newState) {
      this.$root.$data.socket.emit('device_changeState', newState);
    },
    deviceAdd(device) {
      this.$root.$data.socket.emit('device_add', device);
    },
    deviceDelete(serialnumber) {
      this.$root.$data.socket.emit('device_delete', { serialnumber });
    },
    groupAdd(name) {
      this.$root.$data.socket.emit('group_add', name);
    },
    groupDelete(id) {
      this.$root.$data.socket.emit('group_delete', { id });
    },
    groupChangeState(newState) {
      this.$root.$data.socket.emit('group_changeState', newState);
    },
  },
  created() {

  },
  data() {
    return {
      prop_showAddForm: false,
    };
  },
};
</script>
