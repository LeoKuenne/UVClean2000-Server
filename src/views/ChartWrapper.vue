<template>
  <div class="relativ">
    <div class="absolute right-0">
      <button
        class="bg-primary p-2 text-white m-2"
        @click="showSettingPanel = true">
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="h-5 w-5" viewBox="0 0 16 16">
          <path fill-rule="evenodd"
          d="M11.5 2a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM9.05 3a2.5 2.5 0 0 1 4.9 0H16v1h-2.05a2.5
          2.5 0 0 1-4.9 0H0V3h9.05zM4.5 7a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM2.05 8a2.5 2.5 0 0 1
          4.9 0H16v1H6.95a2.5 2.5 0 0 1-4.9 0H0V8h2.05zm9.45 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0
          0-3zm-2.45 1a2.5 2.5 0 0 1 4.9 0H16v1h-2.05a2.5 2.5 0 0 1-4.9 0H0v-1h9.05z"/>
        </svg>
      </button>
    </div>
    <div v-if="showSettingPanel"
      class="fixed top-0 left-0 h-screen w-screen
      bg-black bg-opacity-50 flex justify-center items-center">
      <div class="absolute flex flex-col p-5 bg-secondary space-y-5">
        <div class="flex justify-between items-center">
          <h1 class="font-bold text-xl">Datavisualization</h1>
          <button class="bg-transparent hover:bg-transparent p-0 m-0"
            @click="showSettingPanel = false">
            <svg
              xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="w-6 h-6 text-black" viewBox="0 0 16 16">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1
                .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646
                2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>
          </button>
        </div>
        <div class="w-full">
          <label for="device">Choose the device:</label>
          <select name="device"
            id="device"
            class="text-black w-full p-2 rounded border border-primary"
            v-model="selectedDevice"
            @change="showPropertie = true">
            <option v-for="device in devices"
              :key="device"
              v-bind:value="device">
              {{ device }}
            </option>
          </select>
        </div>
        <div :class="[showPropertie ? 'visible' : 'invisible' ] ">
          <label for="propertie">Choose the propertie:</label>
          <select name="propertie"
            id="propertie"
            class="text-black w-full p-2 rounded border border-primary"
            v-model="selectedPropertie"
            @change="getDateDuration">
            <option value="airVolume">Air Volume</option>
            <option value="lampValues">Lamp Values</option>
            <option value="tacho">Tachos</option>
          </select>
        </div>
        <div :class="[showDatepicker ? 'visible' : 'invisible' ] ">
          <label for="dateFrom">Choose the start date:</label>
          <div class="text-black w-full pb-5">
            <datetime id="dateFrom"
              v-model="selectedDateFrom"
              :min-datetime="disabledDates.from"
              :max-datetime="selectedDateTo"
              :type="'datetime'"
              class="border border-primary">
            </datetime>
          </div>
          <label for="dateTo">Choose the end date:</label>
          <div class="text-black w-full">
            <datetime id="dateTo"
              v-model="selectedDateTo"
              :min-datetime="selectedDateFrom"
              :max-datetime="disabledDates.to"
              :type="'datetime'"
              class="border border-primary">
            </datetime>
          </div>
          <button
            :class="[canRefresh ? 'visible' : 'invisible' ] "
            class="text-primary w-full text-center font-bold pt-5 hover:transform hover:scale-105
              transition-all"
            @click="refreshChart">
            Refresh
          </button>
        </div>
      </div>
    </div>
    <div class="h-full w-full">
      <chart v-if="loaded"
      :chart-data="datacollection"
      :options="options"
      :style="chartStyles"
      class="p-16"></chart>
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
      showPropertie: false,
      showDatepicker: false,
      showSettingPanel: true,
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
                return `${value}`;
              },
            },
          }],
        },
      },
    };
  },
  computed: {
    chartStyles() {
      return {
        height: '100%',
        width: '100%',
        position: 'relativ',
      };
    },
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
    outsideSettingPanelClicked() {
      this.showSettingPanel = false;
    },
    async fetchData() {
      await this.getDevices();

      if (this.device === undefined) return;
      if (this.propertie === undefined) return;
      if (this.from === undefined) return;
      if (this.to === undefined) return;

      this.loaded = false;
      this.showSettingPanel = false;

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

      const lamps = [];

      switch (this.propertie) {
        case 'airVolume':
          this.datacollection = {
            labels: [],
            datasets: [
              {
                label: this.device,
                backgroundColor: '#00666F',
                borderColor: '#00666F',
                borderWidth: 1,
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
          break;
        case 'lampValues':
          this.datacollection = {
            labels: [],
            datasets: [],
          };

          for (let i = 0; i < 16; i += 1) {
            const color = `rgba(0,${50 + (((255 - 50) / 16) * i)},${80 + (((255 - 80) / 16) * i)})`;
            lamps.push({
              label: `${this.device} | Lamp ${i + 1}`,
              backgroundColor: color,
              borderColor: color,
              borderWidth: 1,
              data: [],
              fill: false,
            });
          }
          data.forEach((event) => {
            lamps[event.lamp - 1].data.push({
              t: new Date(event.date),
              y: event.value,
            });
          });

          this.datacollection.datasets = lamps;

          break;
        case 'tacho':
          this.datacollection = {
            labels: [],
            datasets: [
              {
                label: this.device,
                backgroundColor: '#00666F',
                borderColor: '#00666F',
                borderWidth: 1,
                data: [],
                fill: false,
              },
            ],
          };

          data.forEach((event) => {
            this.datacollection.datasets[0].data.push({
              t: new Date(event.date),
              y: event.tacho,
            });
          });
          break;

        default:
          break;
      }

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
          this.showDatepicker = true;
        });
    },
  },
};

</script>
