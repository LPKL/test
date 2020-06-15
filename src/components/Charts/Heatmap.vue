<!--
热力图组件
-->
<template>
  <div :id="id" :style="'width:'+width+';height:'+height+';margin-top: 2px;'"/>
</template>

<script>
import echarts from 'echarts'
import windowresize from './mixins/windowresize'
// import dataTool from 'echarts/extension/dataTool'
export default {
  name: 'Heatmap',
  mixins: [windowresize],
  props: {
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '100%'
    },
    boxData: {
      type: Object,
      default: null
    },
    id: {
      type: String,
      default: 'boxplot'
    }
  },
  data() {
    return {
      chart: null
    }
  },
  watch: {
    '$props.boxData': {
      handler: function(newer, older) {
        console.log(newer)
        this.initChart(newer)
      },
      deep: true
    }
  },
  mounted() {
    this.initChart(this.$props.boxData)
  },
  methods: {
    initChart(boxDataTemp) {
      this.chart = echarts.init(document.getElementById(this.$props.id))
      const option = {
        animation: false,
        backgroundColor: '#ffffff',
        xAxis: {
          name: boxDataTemp.xyz[0],
          nameLocation: 'middle',
          type: 'value',
          nameTextStyle: {
            padding: [5, 0, 0, 0]
          }
        },
        yAxis: {
          name: boxDataTemp.xyz[1],
          type: 'value'
        },
        visualMap: {
          min: boxDataTemp.min,
          max: boxDataTemp.max,
          calculable: true,
          realtime: false,
          // bottom: '10%',
          inRange: {
            color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
          }
        },
        series: [{
          name: boxDataTemp.xyz[2],
          type: 'heatmap',
          data: boxDataTemp.data,
          itemStyle: {
            emphasis: {
              shadowBlur: 1,
              shadowColor: '#ccc'
            }
          }
        }]
      }
      this.chart.setOption(option)
    }
  }
}
</script>

