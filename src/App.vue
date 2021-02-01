<template>
  <div id="app" class="bg-gray-100 flex min-h-screen shadow-md">
    <Sidebar @showDevices="currentView = 'UVCDeviceList'" @showGroups="currentView = 'UVCGroupList'"></Sidebar>
    <component v-bind:is="currentViewComponent" :dataDevices="this.dataDevices"
      :dataGroups="this.dataDevices" class="flex-grow"></component>
  </div>
</template>

<script>
import './css/styles.css';
import Sidebar from './components/Sidebar.vue';
import UVCDeviceList from './components/UVCDeviceList.vue';
import UVCGroupList from './components/UVCGroupList.vue';

export default {
    name: 'App',
    components: {
        Sidebar,
        UVCDeviceList,
        UVCGroupList
    },
    computed: {
        currentViewComponent: function() {
            return this.currentView;
        }
    },
    methods: {
    },
    data: function() {
        return {
            newDevice: {
                name: '',
                serialnumber: ''
            },
            currentView: 'UVCDeviceList',
            dataDevices: {
                uvcclean01: {
                    name: 'Test 1',
                    serialnumber: 'SN:12485125',
                    state: 'on',
                    engine: 'on',
                    enginelevel: 3,
                    error: '',
                    current: 12,
                    rotationspeed: 200,
                    eventmode: 'on',
                    identify: 'off',
                },
                uvcclean02: {
                    name: 'Test 2',
                    serialnumber: 'SN:12485125',
                    state: 'on',
                    engine: 'on',
                    enginelevel: 3,
                    error: '',
                    current: 12,
                    rotationspeed: 200,
                    eventmode: 'on',
                    identify: 'off',
                },
                uvcclean03: {
                    name: 'Test 3',
                    serialnumber: 'SN:12485125',
                    state: 'on',
                    engine: 'on',
                    enginelevel: 3,
                    error: '',
                    current: 12,
                    rotationspeed: 200,
                    eventmode: 'on',
                    identify: 'off',
                },
                uvcclean04: {
                    name: 'Test 4',
                    serialnumber: 'SN:12485125',
                    state: 'on',
                    engine: 'on',
                    enginelevel: 3,
                    error: '',
                    current: 12,
                    rotationspeed: 200,
                    eventmode: 'on',
                    identify: 'off',
                },
                uvcclean05: {
                    name: 'Test 5',
                    serialnumber: 'SN:12485125',
                    state: 'on',
                    engine: 'on',
                    enginelevel: 3,
                    error: '',
                    current: 12,
                    rotationspeed: 200,
                    eventmode: 'on',
                    identify: 'off',
                },
            }
        };
    },
};
</script>
