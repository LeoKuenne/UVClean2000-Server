<template>
  <div id="sidebar"
    class="flex flex-col p-5 bg-gray-200 space-y-5">
    <div class="space-y-2">
      <h1 class="text-xl text-secondary font-bold">Overview</h1>
      <div
        :class="[this.$route.path === '/dashboard/devices' ?
          'text-gray-600 transform scale-105 font-semibold' : '']"
        @click="$emit('showDevices')"
        class="w-full text-left text-primary hover:text-gray-600 hover:transform hover:scale-105
          hover:font-semibold transition-all inline-flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="w-5 h-5 mx-2" viewBox="0 0 16 16">
          <path d="M11 2a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3h6zM5 1a4 4 0
            0 0-4 4v6a4 4 0 0 0 4 4h6a4 4 0 0 0 4-4V5a4 4 0 0 0-4-4H5z"/>
        </svg>
        Show Devices
      </div>
      <div
        @click="$emit('showGroups')"
        class="w-full text-left text-primary hover:text-gray-600 hover:transform hover:scale-105
          hover:font-semibold transition-all inline-flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="w-5 h-5 mx-2" viewBox="0 0 16 16">
          <path d="M2.5 3.5a.5.5 0 0 1 0-1h11a.5.5 0 0 1 0 1h-11zm2-2a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0
            1h-7zM0 13a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 16 13V6a1.5 1.5 0 0 0-1.5-1.5h-13A1.5
            1.5 0 0 0 0 6v7zm1.5.5A.5.5 0 0 1 1 13V6a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 .5.5v7a.5.5 0 0
            1-.5.5h-13z"/>
        </svg>
        Show Groups
      </div>
    </div>
    <div class="space-y-2">
      <h1 class="text-xl text-secondary font-bold pt-5">Controls</h1>
      <button
        @click="showAddForm"
        class="w-full text-left text-primary hover:text-gray-600 hover:transform hover:scale-105
          hover:font-semibold transition-all inline-flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="w-5 h-5 mx-2" viewBox="0 0 16 16">
          <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2
            0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
          <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1
            0-1h3v-3A.5.5 0 0 1 8 4z"/>
        </svg>
        Add UVClean Device
      </button>
    </div>
    <div v-show="prop_showAddForm"
      class="fixed top-0 left-0 h-full w-full
      bg-black bg-opacity-50 flex justify-center items-center">
      <FormAddUVCDevice
        @close="prop_showAddForm = false"
        @add="addDevice($event)"
        :isEdit="false"
        :editDevice="device"
        class="absolute w-1/2 bg-gray-100 rounded p-5 border-2 border-gray-400 shadow-lg">
      </FormAddUVCDevice>
<!--
        <FormAddUVCDevice
          @close="prop_showEditForm = false"
          @update="updateDevice($event)"
          @delete="deleteDevice($event)"
          :editDevice="prop_editDevice"
          :isEdit="true"
          class="absolute w-1/2 bg-gray-100 rounded p-5 border-2 border-gray-400 shadow-lg">
          </FormAddUVCDevice> -->
    </div>
  </div>
</template>
<script>
import FormAddUVCDevice from './FormAddUVCDevice.vue';

export default {
  data() {
    return {
      prop_showAddForm: false,
      device: {
        name: '',
        serialnumber: '',
      },
    };
  },
  components: {
    FormAddUVCDevice,
  },
  methods: {
    showAddForm() {
      this.prop_showAddForm = true;
    },
    addDevice(device) {
      this.$emit('deviceAdd', device);
      this.prop_showAddForm = false;
      // this.device = {
      //   name: '',
      //   serialnumber: '',
      // };
    },
  },

};
</script>
