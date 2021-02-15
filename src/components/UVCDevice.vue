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

      <h4 class="pt-5 font-bold col-span-2">Statistics:</h4>
      <span>Error state</span>
      <span class="text-right">{{device.lastError}}</span>

      <span>Current Volume</span>
      <span class="text-right">{{device.airVolume}} L/M^3</span>

      <span>Rotation speed</span>
      <span class="text-right">{{device.rotationSpeed}} R/min</span>
    </div>
  </div>
</template>
<script>
export default {
  name: 'UVCDevice',
  props: ['device'],
  methods: {
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
