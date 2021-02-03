<template>
  <div class="p-5" id="devices">
      <h2 class="p-5 text-lg font-bold">Devices</h2>
      <div class="flex flex-row flex-wrap content-center justify-center">
          <UVCDevice
            v-for="device in devices"
            :key="device.name"
            :device="device"
            @edit="editDevice(device)"
            v-on="$listeners">
          </UVCDevice>
      </div>
      <div
        v-show="prop_showEditForm"
        class="fixed top-0 left-0 h-full w-full
        bg-black bg-opacity-50 flex justify-center items-center"
        >
        <FormAddUVCDevice
          @close="prop_showEditForm = false"
          :device="prop_editDevice"
          @edit="updateDevice"
          class="absolute w-1/2 bg-gray-100 rounded p-5 border-2 border-gray-400 shadow-lg">
          </FormAddUVCDevice>
      </div>
  </div>
</template>
<script>
import UVCDevice from './UVCDevice.vue';
import FormAddUVCDevice from './FormAddUVCDevice.vue';

export default {
  name: 'UVCDeviceList',
  components: {
    UVCDevice,
    FormAddUVCDevice,
  },
  props: ['devices'],
  methods: {
    editDevice(device) {
      this.prop_editDevice = device;
      this.prop_showEditForm = true;
    },
    updateDevice(device) {
      console.log(device);
    },
  },
  data() {
    return {
      prop_showEditForm: false,
      prop_editDevice: {
        name: '',
        serialnumber: '',
      },
    };
  },
};
</script>
