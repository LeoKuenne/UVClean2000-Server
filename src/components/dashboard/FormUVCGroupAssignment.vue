<template>
  <div class="flex flex-col text-color space-y-2 whitespace-nowrap">
    <h1 class="text-xl font-bold pb-5">Group Assignment</h1>
    <h2><span class="font-bold">Device:</span> {{options.device.name}}</h2>
    <div class="w-full flex items-center space-x-2">
      <label for="device" class="font-bold">Choose the group:</label>
      <select name="device"
        v-model="selectedGroup"
        id="device"
        class="text-black w-full p-2 rounded border border-primary">
        <option value="none">None</option>
        <option v-for="group in groups"
          :key="group.id"
          v-bind:value="group.id">
          {{ group.name }}
        </option>
      </select>
    </div>
    <div class="w-full">
      <div class="float-left space-x-2">
        <button
          @click="$emit('remove', {
            mode: 'deviceAssign',
            device: options.device.serialnumber,
            group: options.device.group,
          })"
          class="font-semibold hover:transform hover:scale-105 transition-all">
          Remove assignment
        </button>
      </div>
      <div class="float-right space-x-2">
        <button
          @click="$emit('assign', {
            mode: 'deviceAssign',
            device: options.device.serialnumber,
            group: (selectedGroup === 'none') ? options.device.group : selectedGroup,
          })"
          class="font-semibold hover:transform hover:scale-105 transition-all">
          Assign
        </button>
        <button
          @click="$emit('close')"
          class="font-semibold hover:transform hover:scale-105 transition-all">
          Close
        </button>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'FormUVCGroupAssignment',
  props: ['options'],
  computed: {
  },
  data() {
    return {
      groups: [],
      selectedGroup: 'none',
    };
  },
  methods: {
  },
  async created() {
    await fetch(`http://${process.env.VUE_APP_SERVER}:${process.env.VUE_APP_SERVER_PORT}/groups`).then((response) => response.json())
      .then((response) => {
        this.groups = response;
      });
  },
};
</script>
