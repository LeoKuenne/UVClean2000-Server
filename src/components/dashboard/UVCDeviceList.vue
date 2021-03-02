<template>
  <div class="p-5 overflow-auto">
    <div class="flex items-center space-x-5">
      <h2 class="text-lg font-bold">Devices</h2>
      <button
        @click="showAddForm"
        class="flex text-left text-primary bg-white shadow items-center p-2
        hover:text-gray-600 hover:transform hover:scale-105
          hover:font-semibold transition-all">
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="w-5 h-5 mr-2" viewBox="0 0 16 16">
          <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2
            0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
          <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1
            0-1h3v-3A.5.5 0 0 1 8 4z"/>
        </svg>
        Add UVClean Device
      </button>
    </div>
    <!-- flex flex-wrap item-center justify-center  -->
    <router-link to="devices"
      class="cursor-default flex flex-wrap items-start"
      id="uvcdevicelist"
      @click="$route.query.device=''"
      tag="div">
      <UVCDevice
        @edit="editDevice($event)"
        @assignGroup="showGroupForm($event)"
        @changeState="changeDeviceState($event)"
        @acknowledgeAlarm="acknowledgeAlarm($event)"
        v-for="dev in $dataStore.devices"
        :key="dev.serialnumber"
        :device="dev"
        :ref="'device' + dev.serialnumber"
        :class="[(device === dev.serialnumber) ? 'transform scale-105': '']"
        class="m-5 w-96 border-primary border shadow-lg duration-200 flex-1">
      </UVCDevice>
    </router-link>
    <UVCForm
      :title="heading"
      :show="showEditForm"
      :errorMessage="errorMessage"
      @close="closeAddForm">
      <label for="add_devicename">Devicename</label>
      <input id="add_devicename"
        :value="formDevice.name"
        @input="formDevice.name = $event.target.value"
        type="text"
        placeholder="UVCClean2000 Dach"
        class="rounded p-2 border-2 border-gray-500 mb-4">
      <label for="add_deviceserialnumber">Serialnumber</label>
      <input id="add_deviceserialnumber"
        :value="formDevice.serialnumber"
        :disabled="isFormEdit"
        @input="formDevice.serialnumber = $event.target.value"
        type="text"
        placeholder="123456789"
        class="rounded p-2 border-2 border-gray-500 mb-4">
      <div class="">
        <button class="float-left p-2 font-semibold hover:transform hover:scale-105 transition-all
          text-red-500"
          v-show="isFormEdit"
          @click="deleteDevice(formDevice.serialnumber)">
          Delete
        </button>
        <div class="float-right space-x-2">
          <button class="font-semibold p-2 hover:transform hover:scale-105 transition-all
            bg-primary text-white"
            @click="(isFormEdit) ? updateDevice(formDevice) : addDevice(formDevice)">
            {{okProp}}
          </button>
          <button class="font-semibold hover:transform hover:scale-105 transition-all"
            @click="closeAddForm">
            Close
          </button>
        </div>
      </div>
    </UVCForm>

    <UVCForm
      :title="'Group Assignment'"
      :show="showGroupAssignmentForm"
      :errorMessage="errorMessage"
      @mounted="fetchGroups"
      @close="closeGroupForm">
      <h2><span class="font-bold">Device:</span> {{formDevice.name}}</h2>
      <div class="w-full flex items-center space-x-2">
        <label for="device" class="font-bold">Choose the group:</label>
        <select name="device"
          v-model="formSelectedGroup"
          id="device"
          class="text-black w-full p-2 rounded border border-primary">
          <option v-for="group in formGroups"
            :key="group.id"
            :value="group.id">
            {{group.name}}
          </option>
        </select>
      </div>
      <div class="items-center">
        <div class="float-left">
          <button
            @click="removeGroupAssignment"
            class="font-semibold p-2 text-red-500
            hover:transform hover:scale-105 transition-all">
            Remove assignment
          </button>
        </div>
        <div class="float-right space-x-2">
          <button
            @click="assignDeviceToGroup"
            class="font-semibold p-2 hover:transform hover:scale-105 transition-all
              bg-primary text-white">
            Assign
          </button>
          <button
            @click="closeGroupForm"
            class="font-semibold hover:transform hover:scale-105 transition-all">
            Close
          </button>
        </div>
      </div>
    </UVCForm>

  </div>
</template>
<script>
import UVCDevice from './UVCDevice.vue';
import UVCForm from '../UVCForm.vue';

export default {
  name: 'UVCDeviceList',
  components: {
    UVCDevice,
    UVCForm,
  },
  props: ['device'],
  watch: {
    device() {
      if (this.device !== undefined && this.device.match(/[0-9]/gm)) {
        this.scrollToElement(this.device);
      }
    },
  },
  mounted() {
    this.$nextTick(() => {
      if (this.device !== undefined && this.device.match(/[0-9]/gm)) {
        this.scrollToElement(this.device);
      }
    });
  },
  computed: {
    okProp() {
      return this.isFormEdit ? 'Update' : 'Add';
    },
    heading() {
      return this.isFormEdit ? 'Update Device' : 'Add Device';
    },
  },
  methods: {
    /**
     * Called if the device is selected in the query
     */
    scrollToElement(device) {
      const element = this.$refs[`device${device}`];
      if (element && element[0]) {
        element[0].$el.scrollIntoView({ behavior: 'smooth' });
      }
    },
    /**
     * Called by the group assignment form when its mounted
     */
    async fetchGroups() {
      await fetch(`http://${process.env.VUE_APP_SERVER}:${process.env.VUE_APP_SERVER_PORT}/groups`).then((response) => response.json())
        .then((response) => {
          this.formGroups = response;
        });
    },
    /**
     * Called by a device when it's wants to be edited
     */
    editDevice(device) {
      this.formDevice = {
        serialnumber: device.serialnumber,
        name: device.name,
      };
      this.isFormEdit = true;
      this.showEditForm = true;
    },
    /**
     * Called when the Add to group menu item is clicked
     */
    showGroupForm(device) {
      this.formDevice = {
        name: device.name,
        serialnumber: device.serialnumber,
        group: device.group,
      };
      // eslint-disable-next-line no-underscore-dangle
      this.formSelectedGroup = (device.group._id === undefined) ? '' : device.group._id;
      this.showGroupAssignmentForm = true;
    },
    /**
     * Called by the close events at the group
     */
    closeGroupForm() {
      this.formDevice = {
        name: '',
        serialnumber: '',
      };
      this.showGroupAssignmentForm = false;
    },
    /**
     * Called when the assign button of the group form is clicked
     */
    assignDeviceToGroup() {
      console.log({
        device: this.formDevice.serialnumber,
        group: this.formSelectedGroup,
      });

      if (this.formSelectedGroup === '') {
        this.errorMessage = 'You have to select a group to assign the device to.';
        return;
      }

      this.$root.$data.socket.emit('group_addDevice', {
        device: this.formDevice.serialnumber,
        group: this.formSelectedGroup,
      });
      this.showGroupAssignmentForm = false;
    },
    removeGroupAssignment() {
      console.log({
        device: this.formDevice.serialnumber,
        group: this.formDevice.group,
      });

      this.$root.$data.socket.emit('group_deviceDelete', {
        device: this.formDevice.serialnumber,
        group: this.formSelectedGroup,
      });
      this.showGroupAssignmentForm = false;
    },
    /**
     * Called by the Add UVClean Device button in the menu bar
     */
    showAddForm() {
      this.isFormEdit = false;
      this.showEditForm = true;
    },
    /**
     * Called by the close events from the modal
     */
    closeAddForm() {
      this.showEditForm = false;
      this.formDevice = {
        name: '',
        serialnumber: '',
      };
      this.errorMessage = '';
    },
    /**
     * Called when the Add button in the modal is pressed
     */
    addDevice(device) {
      if (device.name === '' || device.name.match(/[^0-9A-Za-z+ ]/gm) !== null) {
        this.errorMessage = `Name has to be vaild. Only numbers, letters and "+" are allowed.\n Invalid characters: ${device.name.match(/[^0-9A-Za-z+ ]/gm).join(',')}`;
        return;
      }

      if (device.serialnumber === '' || device.serialnumber.match(/[^0-9]/gm) !== null) {
        this.errorMessage = `Serialnumber has to be vaild. Only Numbers are allowed.\n Invalid characters: ${device.serialnumber.match(/[^0-9]/gm).join(',')}`;
        return;
      }

      this.$root.$data.socket.emit('device_add', {
        name: device.name,
        serialnumber: device.serialnumber,
      });
      this.showEditForm = false;
      this.errorMessage = '';
    },
    /**
     * Called when the Update button in the modal is pressed
     */
    updateDevice(device) {
      this.$root.$data.socket.emit('device_changeState', {
        serialnumber: device.serialnumber,
        prop: 'name',
        newValue: `${device.name}`,
      });
      this.showEditForm = false;
    },
    /**
     * Called when the Delete button in the modal is pressed
     */
    deleteDevice(serialnumber) {
      this.$root.$data.socket.emit('device_delete', { serialnumber: `${serialnumber}` });
      this.showEditForm = false;
    },
    /**
     * Called when any state in the devices should be changed
     */
    changeDeviceState(newState) {
      if (newState.serialnumber === undefined
        || newState.prop === undefined
        || newState.newValue === undefined) {
        console.log('New State can not be parsed', newState);
        return;
      }
      console.log(newState);

      this.$root.$data.socket.emit('device_changeState', {
        serialnumber: newState.serialnumber,
        prop: `${newState.prop}`,
        newValue: `${newState.newValue}`,
      });
    },
    /**
     * Called when the acknowledge button in the alarm popup is pressed
     */
    acknowledgeAlarm(device) {
      this.$root.$data.socket.emit('device_acknowledgeAlarm', {
        serialnumber: device.serialnumber,
      });
    },
  },
  data() {
    return {
      showEditForm: false,
      showGroupAssignmentForm: false,
      errorMessage: '',
      isFormEdit: false,
      formSelectedGroup: '',
      formGroups: [],
      formDevice: {
        name: '',
        serialnumber: '',
      },
      groupAssignmentOptions: {
        device: {
          name: '',
        },
      },
    };
  },
};
</script>
