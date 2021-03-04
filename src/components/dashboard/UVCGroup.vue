<template>
  <router-link :to="'groups?group=' + group.id" class="cursor-default">
    <div>
      <div
        :class="[group.alarmState ? 'bg-red-500' : 'bg-primary']"
        class="p-2 items-center text-white">
        <div class="flex flex-row justify-between items-center">
          <div>
            <h3 class="text-md font-bold">{{group.name}}</h3>
            <h4 class="text-sm text-gray-200">ID: {{group.id}}</h4>
          </div>
          <dropdownMenu
            class="text-primary"
            :showIcon="true"
            :menuItems="[ 'Edit', 'View chart', 'Add Devices' ]"
            @itemClicked="menuItemClicked($event)">
          </dropdownMenu>
        </div>
      </div>
      <div class="p-2">
        <h4 class="text-lg pt-2 font-bold col-span-2">Groupmembers:</h4>
        <div class="pl-2 space-y-1">
            <div
              v-for="device in group.devices"
              :key="device.serialnumber"
              class="p-2 rounded hover:underline cursor-pointer"
              :class="[device.alarmState ? 'bg-red-500 text-white' : 'bg-gray-200']">
              <router-link :to="'/dashboard/devices?device=' + device.serialnumber">
                <h5 class="font-semibold text-sm">{{device.name}}</h5>
                <h5 class="italic text-xs">SN: {{device.serialnumber}}</h5>
              </router-link>
            </div>
        </div>
      </div>
      <div class="p-2 grid grid-cols-2 space-y-2 items-center">
        <label for="b_group_state">Group Engine State</label>
        <button id="b_group_state"
          class="p-2 text-white hover:transform hover:scale-105 transition-all"
          v-bind:class="{
            'bg-green-500': group.engineState,
            'bg-red-500': !group.engineState,
            'bg-yellow-400': group.engineStateDevicesWithOtherState.length !== 0
            }"
          @click="$emit('changeState', {
            id: group.id,
            prop: 'engineState',
            newValue: !group.engineState
          })">
          {{state}}
        </button>
        <div class="col-span-2 px-2" v-if="group.engineStateDevicesWithOtherState.length !== 0">
          <span class="text-sm">Devices that have not these state:</span>
          <div class="pl-2 space-y-1">
            <div
              :class="[device.alarmState ? 'bg-red-500 text-white' : 'bg-gray-200']"
              class="p-2 rounded hover:underline cursor-pointer"
              v-for="device in group.engineStateDevicesWithOtherState"
              :key="device.serialnumber">
              <router-link :to="'/dashboard/devices?device=' + device.serialnumber">
                <h5 class="font-semibold text-xs">{{device.name}}</h5>
                <h5 class="italic text-xs">SN: {{device.serialnumber}}</h5>
              </router-link>
            </div>
          </div>
        </div>
        <label for="b_eventmode">Eventmode</label>
        <button id="b_eventmode"
          class="p-2 text-white hover:transform hover:scale-105 transition-all"
          v-bind:class="{
            'bg-green-500': group.eventMode,
            'bg-red-500': !group.eventMode,
            'bg-yellow-400': group.eventModeDevicesWithOtherState.length !== 0
            }"
          @click="$emit('changeState', {
            id: group.id,
            prop: 'eventMode',
            newValue: !group.eventMode
          })">
          {{eventMode}}
        </button>
        <div class="col-span-2 px-2" v-if="group.eventModeDevicesWithOtherState.length !== 0">
          <span class="text-sm">Devices that have not these state:</span>
          <div class="pl-2 space-y-1">
            <div
              :class="[device.alarmState ? 'bg-red-500 text-white' : 'bg-gray-200']"
              class="p-2 rounded hover:underline cursor-pointer"
              v-for="device in group.eventModeDevicesWithOtherState"
              :key="device.serialnumber">
              <router-link :to="'/dashboard/devices?device=' + device.serialnumber">
                <h5 class="font-semibold text-xs">{{device.name}}</h5>
                <h5 class="italic text-xs">SN: {{device.serialnumber}}</h5>
              </router-link>
            </div>
          </div>
        </div>
        <label for="s_engine_level">Engine Level</label>
        <select name="engine_level"
          class="p-2"
          id="s_engine_level"
          @change="$emit('changeState', {
            id: group.id,
            prop: 'engineLevel',
            newValue: $event.target.value
          })">
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>
      </div>
    </div>
  </router-link>
</template>
<script>
import DropdownMenu from './DropdownMenu.vue';

export default {
  name: 'UVCGroup',
  props: ['group'],
  components: {
    dropdownMenu: DropdownMenu,
  },
  methods: {
    menuItemClicked(event) {
      switch (event) {
        case 'Edit':
          this.$emit('edit', this.group);
          break;
        case 'View chart':
          this.$router.push({ name: 'GroupChart', query: { group: this.group.serialnumber } });
          break;
        case 'Add Devices':
          this.$emit('addDevices', this.group);
          break;
        default:
          break;
      }
    },
  },
  data() {
    return {
      showAlarmStates: true,
      showLampValues: true,
    };
  },
  computed: {
    state: {
      get() {
        return this.group.engineState ? 'On' : 'Off';
      },
      set() {
        return this.group.engineState ? 'On' : 'Off';
      },
    },
    eventMode: {
      get() {
        return this.group.eventMode ? 'On' : 'Off';
      },
      set() {
        return this.group.eventMode ? 'On' : 'Off';
      },
    },
  },
};
</script>

<style>
.slide-enter-active,
.slide-leave-active {
  @apply duration-200;
  @apply ease-in-out;
}

.slide-enter-to, .slide-leave {
   max-height: 100px;
   overflow: hidden;
}

.slide-enter, .slide-leave-to {
   overflow: hidden;
   max-height: 0;
}
</style>
