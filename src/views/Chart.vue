<script>
import { Line, mixins } from 'vue-chartjs';

const { reactiveProp } = mixins;

export default {
  extends: Line,
  mixins: [reactiveProp],
  props: ['options', 'cdata'],
  mounted() {
    this.renderLineChart();
  },
  computed: {
    data() {
      return this.chartData;
    },
  },
  methods: {
    renderLineChart() {
      this.renderChart(this.data, this.options);
    },
  },
  watch: {
    chartData() {
      // eslint-disable-next-line no-underscore-dangle
      this.$data._chart.update();
      console.log('chartData mutated');
    },
  },
};
</script>
