<!--
 * @author cuichuanwa
 * @date 20-3-19 上午10:36
 * @description 统计信息查看图表
 -->
<template>
  <div style="width: 100%; height:100%;">
    <StatisticsUpper :result="chart.info" />
    <base-charts
      :chart-type="chart.chartType"
      :chart-data="chart.chartData"
      :chart-settings="chart.chartSettings"
      :chart-data-zoom="chart.chartDataZoom"
      :mark-line="chart.markLine"
      :toolbox="toolbox"
      :tooltip="tooltip"
      :chart-extend="chart.chartExtend"
      :axis="chart.axis"
      :legend-visible="chart.legend"
      :height="mheight"
      width="100%" />
  </div>
</template>

<script>
import StatisticsUpper from './components/StatisticsUpper'
import BaseCharts from './BaseCharts'
export default {
  name: 'StaticsInfo',
  components: { StatisticsUpper, BaseCharts },
  props: {
    chart: {
      type: Object,
      required: true
    },
    height: {
      type: String,
      required: true,
      default: '300px'
    },
    toolbox: {
      type: Object,
      default: null
    }
  },
  data() {
    const tooltip = { // 自定义tooltip
      formatter: (params) => {
        const index = params.dataIndex
        const d = this.$props.chart.proportion[index]
        const { name, data } = params
        return `${name}:<br/>count: ${data}<br/>percentage: ${d}`
      }
    }
    return {
      tooltip: tooltip,
      mheight: null
    }
  },
  mounted() {
    if (this.$props.height.slice(-2) === 'px') {
      this.mheight = this.$props.height.slice(0, -2) * 0.85 + 'px'
    } else {
      this.mheight = this.$props.height
    }
  }
}
</script>

<style scoped>

</style>
