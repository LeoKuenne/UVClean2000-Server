<template>
  <div class="flex text-color">
    <Sidebar
      class="w-1/6"
      @showDevices="showDevices"
      @showGroups="showGroups">
    </Sidebar>
    <transition name="fade" mode="out-in">
      <router-view
        class="w-5/6 h-full"
        @groupAdd="groupAdd($event)"
        @groupUpdate="groupChangeState($event)"
        @groupDelete="groupDelete($event)">
      </router-view>
    </transition>
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
  },
  methods: {
    showDevices() {
      this.$router.push({ name: 'devices' });
    },
    showGroups() {
      this.$router.push({ name: 'groups' });
    },
    deviceAddGroup(props) {
      this.$root.$data.socket.emit('group_addDevice', { group: props.group, device: props.device });
    },
    deviceRemoveGroup(props) {
      this.$root.$data.socket.emit('group_deleteDevice', { group: props.group, device: props.device });
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

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity .2s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
