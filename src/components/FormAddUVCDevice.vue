<template>
  <div class="flex flex-col">
    <h1 class="text-xl font-bold pb-5">Add new Device</h1>
    <label for="add_devicename">Devicename</label>
    <input id="add_devicename" v-model="device.name" type="text" placeholder="UVCClean2000 Dach" class="rounded p-2 border-2 border-gray-500 mb-4">
    <label for="add_deviceserialnumber">Serialnumber</label>
    <input id="add_deviceserialnumber" v-model="device.serialnumber" type="text" placeholder="SN:123456789" class="rounded p-2 border-2 border-gray-500 mb-4">
    <!-- <label for="add_deviceipaddress">IP-Address</label>
    <input id="add_deviceipaddress" v-model="device.ipAddress" type="text" placeholder="192.168.1.10" class="rounded p-2 border-2 border-gray-500 mb-4">
    <label for="add_devicesubnet">Subnetmask</label>
    <input id="add_devicesubnet" v-model="device.subnet" type="text" placeholder="255.255.255.0" class="rounded p-2 border-2 border-gray-500 mb-4"> -->
    <div class="">
        <button class="m-0 float-left" v-show="isEdit" v-on:click="$emit('delete')">Delete</button>
        <div class="float-right">
            <button class="m-0 mr-2" v-on:click="$emit('add')">Add</button>
            <button class="m-0" v-on:click="$emit('close')">Close</button>
        </div>
    </div>
  </div>
</template>
<script>
export default {
    name: 'FormAddUVCDevice',
    props: ['device', 'isEdit'],
    data: function(){
        return {
        };
    },
    methods: {
    }
};
</script>