<template>
  <div id="device" class="bg-gray-200 rounded-lg overflow-hidden m-5">
    <div class="bg-gray-300 p-2 items-center">
      <div class="flex flex-row justify-between items-center">
        <div>
          <h3 class="text-md font-bold text-gray-800">{{device.name}}</h3>
          <h4 class="text-sm text-gray-600">{{device.serialnumber}}</h4>
        </div>
        <button class="rounded border text-center px-5 m-0 border-gray-500 font-normal" @click="$emit('edit')">Edit</button>
      </div>
    </div>
    <div class="p-2 grid grid-cols-2 space-y-2 items-center">
        <label for="b_device_state">Devie State</label>
        <button id="b_device_state" class="bg-green-500 py-2">{{device.state}}</button>
        <label for="b_engine_state">Engine State</label>
        <button id="b_engine_state" class="bg-green-500 py-2">{{device.engine}}</button>
        <label for="b_eventmode">Eventmode</label>
        <button id="b_eventmode" class="bg-green-500 py-2">{{device.eventmode}}</button>
        <label for="b_identify">Identify</label>
        <button id="b_identify" class="bg-green-500 py-2" @click="$emit('deviceIdentify', device)">{{device.identify}}</button>
        <label for="s_engine_level">Engine Level</label>
        <select name="engine_level" id="s_engine_level" v-model="device.enginelevel">
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
        </select>
        <div id="vue-gauge"></div>
        <h4 class="pt-5 font-bold col-span-2">Statistics:</h4>
        <span>Error state</span>
        <span class="text-right">{{device.error}}</span>

        <span>Current Volume</span>
        <span class="text-right">{{device.current}} L/M^3</span>

        <span>Rotation speed</span>
        <span class="text-right">{{device.rotationspeed}} R/min</span>
    </div>
  </div>
</template>
<script>
export default { 
    name: 'UVCDevice',
    props: ['device'],
};
</script>