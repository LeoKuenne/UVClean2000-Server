<template>
  <div class="flex flex-row w-screen h-screen">
    <div class="flex flex-col p-5 primary-color text-white space-y-5">
      <h1 class="font-bold text-lg">Datavisualization</h1>
      <div class="w-full">
        <span>Choose the device:</span>
        <select name="device"
          id="device"
          class="text-black w-full p-2 rounded"
          v-model="selectedDevice">
          <option v-for="device in devices"
            :key="device"
            v-bind:value="device">
            {{ device }}
          </option>
        </select>
      </div>
      <div>
        <span>Choose the propertie:</span>
        <select name="propertie"
          id="propertie"
          class="text-black w-full p-2 rounded"
          v-model="selectedPropertie"
          @change="getDateDuration">
          <option value="airVolume">Air Volume</option>
        </select>
      </div>
      <div v-show="showDatepicker">
        <span>Choose the start date:</span>
        <datetime v-model="selectedDateFrom"
          :min-datetime="disabledDates.from"
          :max-datetime="selectedDateTo"
          :type="'datetime'"
          class="text-black w-full">
        </datetime>
        <span>Choose the end date:</span>
        <datetime v-model="selectedDateTo"
          :min-datetime="selectedDateFrom"
          :max-datetime="disabledDates.to"
          :type="'datetime'"
          class="text-black w-full">
        </datetime>
        <button
          class="w-full mx-0 rounded border text-center border-white font-normal bg-transparent"
          v-if="canRefresh"
          @click="refreshChart">
          Refresh
        </button>
      </div>
    </div>
    <div class="flex flex-grow w-full">
      <chart v-if="loaded"
      :chart-data="datacollection"
      :options="options"
      class="w-full p-10"></chart>
    </div>
  </div>
</template>

<script>
import { Datetime } from 'vue-datetime';
import '../css/datetime.css';
import Chart from './Chart.vue';

export default {
  components: {
    Chart,
    datetime: Datetime,
  },
  props: ['device', 'propertie', 'from', 'to'],
  data() {
    return {
      loaded: true,
      showDatepicker: true,
      selectedDevice: this.device,
      selectedPropertie: '',
      selectedDateFrom: '',
      selectedDateTo: '',
      devices: [],
      canRefresh: false,
      disabledDates: {

      },
      datacollection: {},
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          xAxes: [{
            type: 'time',
            distribution: 'series',
            time: {
              minUnit: 'second',
              displayFormats: {
                second: 'D.M.YY hh:mm:ss',
              },
            },
            ticks: {
              autoSkip: false,
              maxRotation: 90,
              minRotation: 90,
            },
          }],
          yAxes: [{
            ticks: {
              callback(value) {
                return `${value} m^3`;
              },
            },
          }],
        },
      },
    };
  },
  async created() {
    await this.fetchData();
  },
  watch: {
    $route() {
      this.fetchData();
    },
    selectedDateFrom(newDate) {
      this.canRefresh = (newDate !== this.from);
      this.selectedDateFrom = newDate;
    },
    selectedDateTo(newDate) {
      this.canRefresh = (newDate !== this.to);
      this.selectedDateTo = newDate;
    },
  },
  methods: {
    async fetchData() {
      await this.getDevices();

      if (this.device === undefined) return;
      if (this.propertie === undefined) return;
      if (this.from === undefined) return;
      if (this.to === undefined) return;

      this.loaded = false;

      let data = null;
      this.selectedDevice = this.device;

      this.selectedPropertie = this.propertie;
      await this.getDateDuration();

      this.selectedDateFrom = this.from;
      this.selectedDateTo = this.to;
      await fetch(`http://localhost:3000/device?device=${this.selectedDevice}&propertie=${this.propertie}&from=${this.from}&to=${this.to}`).then((response) => response.json())
        .then((response) => {
          data = response;
        });

      this.datacollection = {
        labels: [],
        datasets: [
          {
            label: this.device,
            backgroundColor: '#00666F',
            data: [],
            fill: false,
          },
        ],
      };

      data.forEach((event) => {
        this.datacollection.datasets[0].data.push({
          t: new Date(event.date),
          y: event.volume,
        });
      });
      this.loaded = true;
    },
    async refreshChart() {
      await this.$router.push({
        path: 'chart',
        query: {
          device: this.selectedDevice,
          propertie: this.selectedPropertie,
          from: this.selectedDateFrom,
          to: this.selectedDateTo,
        },
      });
    },
    async getDevices() {
      await fetch('http://localhost:3000/serialnumbers').then((response) => response.json())
        .then((data) => {
          this.devices = data;
        });
    },
    async getDateDuration() {
      await fetch(`http://localhost:3000/timestamps?device=${this.selectedDevice}&propertie=${this.selectedPropertie}`).then((response) => response.json())
        .then((data) => {
          this.disabledDates = {
            from: data.from,
            to: data.to,
          };

          this.selectedDateFrom = data.from;
          this.selectedDateTo = data.to;
        });
    },
  },
};

</script>
