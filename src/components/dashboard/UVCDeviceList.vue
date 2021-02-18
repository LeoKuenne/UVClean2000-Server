<template>
  <div class="p-5 overflow-auto" id="devices">
    <div class="absolute p-2 items-center">
      <h2 class="text-lg font-bold">Devices</h2>
      <button
        @click="showAddForm"
        class="w-full text-left text-primary hover:text-gray-600 hover:transform hover:scale-105
          hover:font-semibold transition-all inline-flex items-center bg-white shadow p-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="w-5 h-5 mx-2" viewBox="0 0 16 16">
          <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2
            0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
          <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1
            0-1h3v-3A.5.5 0 0 1 8 4z"/>
        </svg>
        Add UVClean Device
      </button>
    </div>
    <div class="flex flex-row flex-wrap content-center justify-center">
        <UVCDevice
          @edit="editDevice($event)"
          v-on="$listeners"
          v-for="device in $dataStore.devices"
          :key="device.serialnumber"
          :device="device"
          class="shadow-lg">
        </UVCDevice>
    </div>
    <div
      v-show="showEditForm"
      class="fixed top-0 left-0 h-full w-full
      bg-black bg-opacity-50 flex justify-center items-center"
      >
      <FormUVCDevice
        @close="showEditForm = false"
        @update="updateDevice($event)"
        @delete="deleteDevice($event)"
        @add="addDevice($event)"
        :editDevice="formDevice"
        :isEdit="isFormEdit"
        class="absolute w-1/2 bg-gray-100 rounded p-5 border-2 border-gray-400 shadow-lg">
        </FormUVCDevice>
    </div>
  </div>
</template>
<script>
import UVCDevice from './UVCDevice.vue';
import FormUVCDevice from './FormUVCDevice.vue';

export default {
  name: 'UVCDeviceList',
  components: {
    UVCDevice,
    FormUVCDevice,
  },
  methods: {
    showAddForm() {
      this.formDevice = {
        name: '',
        serialnumber: '',
      };
      this.isFormEdit = false;
      this.showEditForm = true;
    },
    addDevice(device) {
      this.$emit('deviceAdd', device);
      this.showEditForm = false;
    },
    editDevice(device) {
      this.formDevice = device;
      this.isFormEdit = true;
      this.showEditForm = true;
    },
    updateDevice(device) {
      this.$emit('deviceUpdate', { serialnumber: device.serialnumber, prop: 'name', newValue: device.name });
      this.showEditForm = false;
    },
    deleteDevice(serialnumber) {
      this.$emit('deviceDelete', serialnumber);
      this.showEditForm = false;
    },
  },
  data() {
    return {
      showEditForm: false,
      isFormEdit: false,
      formDevice: {
        name: '',
        serialnumber: '',
      },
    };
  },
};
</script>
