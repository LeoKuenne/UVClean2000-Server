<template>
  <div class="m-5 w-96 border-primary border">
    <div class="bg-primary p-2 items-center text-white">
      <div class="flex flex-row justify-between items-center">
        <div>
          <h3 class="text-md font-bold">{{device.name}}</h3>
          <h4 class="text-sm text-gray-200">SN: {{device.serialnumber}}</h4>
        </div>
        <dropdownMenu
          class="text-primary"
          :menuItems="[ 'Edit', 'View chart' ]"
          @itemClicked="menuItemClicked($event)">
        </dropdownMenu>
      </div>
    </div>
    <div class="p-2 grid grid-cols-2 space-y-2 items-center">
      <label for="b_device_state">Devie State</label>
      <button id="b_device_state"
        class="p-2 text-white hover:transform hover:scale-105 transition-all"
        v-bind:class="{ 'bg-green-500': device.engineState, 'bg-red-500': !device.engineState }"
        @click="$emit('changeState', {
          serialnumber: device.serialnumber,
          prop: 'engineState',
          newValue: !device.engineState
        })">
        {{state}}
      </button>
      <label for="b_eventmode">Eventmode</label>
      <button id="b_eventmode"
        class="p-2 text-white hover:transform hover:scale-105 transition-all"
        v-bind:class="{ 'bg-green-500': device.eventMode, 'bg-red-500': !device.eventMode }"
        @click="$emit('changeState', {
          serialnumber: device.serialnumber,
          prop: 'eventMode',
          newValue: !device.eventMode
        })">
        {{eventMode}}
      </button>

      <label for="b_identify">Identify</label>
      <button id="b_identify"
        class="p-2 text-white hover:transform hover:scale-105 transition-all"
        v-bind:class="{ 'bg-green-500': device.identifyMode, 'bg-red-500': !device.identifyMode }"
        @click="$emit('changeState', {
          serialnumber: device.serialnumber,
          prop: 'identifyMode',
          newValue: !device.identifyMode
        })">
        {{identifyMode}}
      </button>
      <label for="s_engine_level">Engine Level</label>
      <select name="engine_level"
        id="s_engine_level"
        @change="$emit('changeState', {
          serialnumber: device.serialnumber,
          prop: 'engineLevel',
          newValue: $event.target.value
        })">
        <option value="0">0</option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5</option>
      </select>

      <span>Current Volume</span>
      <span class="text-right" v-if="device.currentAirVolume">
        {{device.currentAirVolume.volume}} L/M^3
      </span>

      <span>Rotation speed</span>
      <span class="text-right" v-if="device.tacho">{{device.tacho.tacho}} R/min</span>

      <h4 class="text-lg pt-5 font-bold col-span-2">Statistics:</h4>
      <div class="col-span-2 flex justify-between">
        <span class="font-semibold">Body Temperature Alarm</span>
        <span class="text-right" v-if="device.tacho">{{device.currentBodyAlarm}}</span>
      </div>
      <div class="col-span-2 flex justify-between">
        <span class="font-semibold">Fan Temperature Alarm</span>
        <span class="text-right" v-if="device.currentFanState">
          {{device.currentFanState.state}}
        </span>
      </div>
      <div class="col-span-2 flex flex-col space-y-5 pb-5">
        <div class="">
          <div class="flex justify-between">
            <span class="font-semibold">Alarm states</span>
            <button
              class="bg-transparent text-color hover:bg-transparent py-0 m-0 hover:transform
                hover:scale-105 transition-all"
              @click="showAlarmStates = !showAlarmStates">
              <svg v-if="!showAlarmStates"
                xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="w-6 h-6" viewBox="0 0 16 16">
                <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133
                  13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168
                  2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83
                  1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12
                  0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7
                  0 3.5 3.5 0 0 1-7 0z"/>
              </svg>
              <svg v-if="showAlarmStates"
                xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="w-6 h-6" viewBox="0 0 16 16">
                <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0
                  0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168
                  2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83
                  1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/>
                <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829
                  2.829l.822.822zm-2.943 1.299l.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5
                  2.5 0 0 0 2.829 2.829z"/>
                <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172
                  8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8
                  12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3
                  13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884l-12-12
                  .708-.708 12 12-.708.708z"/>
              </svg>
            </button>
          </div>
          <transition name="slide">
            <div v-if="showAlarmStates" class="col-span-2 grid grid-cols-4">
              <div class="w-20" v-for="(alarm, lamp) in device.currentLampAlarm" :key="lamp">
                {{alarm.lamp}}: {{alarm.state}}
              </div>
            </div>
          </transition>
        </div>

        <div class="col-span-2">
          <div class="flex justify-between">
            <span class="font-semibold">Lamp values</span>
            <button
              class="bg-transparent text-color hover:bg-transparent py-0 m-0 hover:transform
                hover:scale-105 transition-all"
              @click="showLampValues = !showLampValues">
              <svg v-if="!showLampValues"
                xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="w-6 h-6" viewBox="0 0 16 16">
                <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133
                  13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168
                  2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83
                  1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12
                  0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7
                  0 3.5 3.5 0 0 1-7 0z"/>
              </svg>
              <svg v-if="showLampValues"
                xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="w-6 h-6" viewBox="0 0 16 16">
                <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0
                  0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168
                  2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83
                  1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/>
                <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829
                  2.829l.822.822zm-2.943 1.299l.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5
                  2.5 0 0 0 2.829 2.829z"/>
                <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172
                  8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8
                  12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3
                  13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884l-12-12
                  .708-.708 12 12-.708.708z"/>
              </svg>
            </button>
          </div>
          <transition name="slide">
            <div v-if="showLampValues" class="col-span-2  grid grid-cols-4">
              <div class="w-16" v-for="(lampValue, lamp) in device.currentLampValue" :key="lamp">
                {{lampValue.lamp}}: {{lampValue.value}} V,
              </div>
            </div>
          </transition>
        </div>
      </div>

      <span>Reset Device</span>
      <button class="bg-red-500 p-2 font-semibold text-white hover:transform hover:scale-105
        transition-all">
        Reset
      </button>
    </div>
  </div>
</template>
<script>
import DropdownMenu from './DropdownMenu.vue';

export default {
  name: 'UVCDevice',
  props: ['device'],
  components: {
    dropdownMenu: DropdownMenu,
  },
  methods: {
    menuItemClicked(event) {
      switch (event) {
        case 'Edit':
          this.$emit('edit', this.device);
          break;
        case 'View chart':
          this.$router.push({ path: '/chart', query: { device: this.device.serialnumber } });
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
        return this.device.engineState ? 'An' : 'Aus';
      },
      set() {
        return this.device.engineState ? 'An' : 'Aus';
      },
    },
    eventMode: {
      get() {
        return this.device.eventMode ? 'An' : 'Aus';
      },
      set() {
        return this.device.eventMode ? 'An' : 'Aus';
      },
    },
    identifyMode: {
      get() {
        return this.device.identifyMode ? 'An' : 'Aus';
      },
      set() {
        return this.device.identifyMode ? 'An' : 'Aus';
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
