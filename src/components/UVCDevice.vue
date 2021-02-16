<template>
  <div class="rounded-lg overflow-hidden m-5 w-80 border-primary-color border">
    <div class="primary-color p-2 items-center text-white">
      <div class="flex flex-row justify-between items-center">
        <div>
          <h3 class="text-md font-bold">{{device.name}}</h3>
          <h4 class="text-sm text-gray-200">SN: {{device.serialnumber}}</h4>
        </div>
        <button
          class="rounded border text-center px-5 m-0 border-white font-normal bg-transparent"
          @click="$emit('edit', device)">Edit</button>
      </div>
    </div>
    <div class="p-2 grid grid-cols-2 space-y-2 items-center">
      <label for="b_device_state">Devie State</label>
      <button id="b_device_state"
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
      <span class="text-right">{{device.currentAirVolume.volume}} L/M^3</span>

      <span>Rotation speed</span>
      <span class="text-right">{{device.tacho.tacho}} R/min</span>

      <h4 class="text-lg pt-5 font-bold col-span-2">Statistics:</h4>
      <div class="col-span-2 flex flex-col space-y-5 pb-5">
        <div class="">
          <div class="flex justify-between">
            <span class="font-semibold">Alarm states</span>
            <button
              class="bg-transparent text-color hover:bg-transparent
              font-normal border border-gray-500 rounded p-0 m-0 w-20 items-end"
              @click="showAlarmStates = !showAlarmStates"
              v-text="(showAlarmStates) ? 'Collapse' : 'Show'">
              Collapse
            </button>
          </div>
          <div v-if="showAlarmStates" class="col-span-2 grid grid-cols-4">
            <div class="w-20" v-for="(alarm, lamp) in device.currentAlarm" :key="lamp">
              {{alarm.lamp}}: {{alarm.state}}
            </div>
          </div>
        </div>

        <div class="col-span-2">
          <div class="flex justify-between">
            <span class="font-semibold">Lamp values</span>
            <button
              class="bg-transparent text-color hover:bg-transparent
              font-normal border border-gray-500 rounded p-0 m-0 w-20 items-end"
              @click="showLampValues = !showLampValues"
              v-text="(showLampValues) ? 'Collapse' : 'Show'">
              Collapse
            </button>
          </div>
          <div v-if="showLampValues" class="col-span-2  grid grid-cols-4">
            <div class="w-16" v-for="(lampValue, lamp) in device.currentLampValue" :key="lamp">
              {{lampValue.lamp}}: {{lampValue.value}} V,
            </div>
          </div>
        </div>
      </div>

      <span>Reset Device</span>
      <button>Reset</button>
    </div>
  </div>
</template>
<script>
export default {
  name: 'UVCDevice',
  props: ['device'],
  methods: {
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
