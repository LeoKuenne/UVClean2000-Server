<template>
  <div id="sidebar" title="Overview"
    class="flex flex-col p-5 w-min whitespace-nowrap primary-color text-white">
    <h1 class="text-xl font-bold">Overview</h1>
    <button
      @click="$emit('showDevices')"
      class="w-full mx-0 rounded border text-center
      border-white font-normal bg-transparent">
      Show Devices
    </button>
    <button
      @click="$emit('showGroups')"
      class="w-full mx-0 rounded border text-center
      border-white font-normal bg-transparent">
      Show Groups
    </button>
    <h1 class="text-xl font-bold pt-5">Controls</h1>
    <button
      @click="showAddForm"
      class="w-full mx-0 rounded border text-center
      border-white font-normal bg-transparent">
      Add UVCClean
    </button>
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
