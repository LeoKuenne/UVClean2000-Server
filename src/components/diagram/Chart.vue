<script>
import { Line } from 'vue-chartjs';
import 'chartjs-adapter-luxon';

export default {
  extends: Line,
  props: ['chartData', 'options', 'showAllCharts'],
  mounted() {
    this.renderLineChart();
  },
  methods: {
    renderLineChart() {
      this.renderChart(this.chartData, this.options);
    },
  },
  watch: {
    showAllCharts() {
      // eslint-disable-next-line no-underscore-dangle
      this.$data._chart.data.datasets.forEach((dataset) => {
        // eslint-disable-next-line no-param-reassign
        dataset.hidden = this.showAllCharts;
      });
      // eslint-disable-next-line no-underscore-dangle
      this.$data._chart.update();
    },
  },
};
</script>
