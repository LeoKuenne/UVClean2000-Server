<template>
  <div class="flex flex-col">
    <h1 class="text-xl font-bold pb-5">Add new Device</h1>
    <label for="add_devicename">Devicename</label>
    <input id="add_devicename"
      v-bind:value="editDevice.name"
      @input="device.name = $event.target.value"
      type="text"
      placeholder="UVCClean2000 Dach"
      class="rounded p-2 border-2 border-gray-500 mb-4">
    <label for="add_deviceserialnumber">Serialnumber</label>
    <input id="add_deviceserialnumber"
      v-bind:value="editDevice.serialnumber"
      v-bind:disabled="isEdit"
      @input="device.serialnumber = $event.target.value"
      type="text"
      placeholder="123456789"
      class="rounded p-2 border-2 border-gray-500 mb-4">
    <div class="">
        <button class="m-0 float-left"
          v-show="isEdit"
          v-on:click="$emit('delete', editDevice.serialnumber)">
          Delete
        </button>
        <div class="float-right">
            <button class="m-0 mr-2"
              v-on:click="$emit(isEdit ? 'update' : 'add', {
                serialnumber: (device.serialnumber === '') ?
                  editDevice.serialnumber : device.serialnumber,
                name: (device.name === '') ?  editDevice.name : device.name,
              })">
              {{okProp}}
            </button>
            <button class="m-0" v-on:click="$emit('close')">Close</button>
        </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'FormAddUVCDevice',
  props: ['editDevice', 'isEdit'],
  computed: {
    okProp() {
      return this.isEdit ? 'Update' : 'Add';
    },
  },
  data() {
    return {
      device: {
        name: '',
        serialnumber: '',
      },
    };
  },
  methods: {
  },
};
</script>
