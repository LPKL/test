<!--
3d散点图
-->
<template>
  <div :style="'width:'+width+';height:'+height+';margin-top: 2px;'" >
    <div style="text-align: center;padding-top: 15px;"><span style="font-size: 12px;">{{ name }}</span></div>
    <div v-loading="loading" ref="scater3d" :id="id" :style="'width:'+width+';height:'+height+';'"/>
  </div>
</template>

<script>
import echarts from 'echarts'
import 'echarts-gl' // 3d echarts
import windowresize from './mixins/windowresize'

export default {
  name: 'Scatter3DChart',
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
    scatter3d: {
      type: Array,
      default: null
    },
    name: {
      type: String,
      default: '3D Scatter with Dataset'
    },
    id: {
      type: String,
      default: '3DScatter'
    },
    chartVisualMap: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      chart: null,
      options: null,
      loading: false
    }
  },
  watch: {
    '$props.scatter3d': {
      handler: function(newer, older) {
        if (this.chart) {
          this.chart.setOption(this.getOptions(newer))
        }
      },
      deep: true
    }
  },
  mounted() {
    const json = this.$props.scatter3d
    this.chart = echarts.init(this.$refs.scater3d)
    // this.chart = echarts.init(document.getElementById(this.$props.id))
    this.chart.setOption(this.getOptions(json))
  },
  methods: {
    getOptions(data) {
      var symbolSize = 2.5
      return {
        grid3D: {
          viewControl: {
            // 使用正交投影。
            projection: 'orthographic'
          }
        },
        xAxis3D: {
          type: 'category'
        },
        yAxis3D: {},
        zAxis3D: {},
        visualMap: this.chartVisualMap,
        dataset: {
          source: data
        },
        series: [
          {
            type: 'scatter3D',
            symbolSize: symbolSize,
            encode: {
              x: 'x',
              y: 'y',
              z: 'z',
              tooltip: [0, 1, 2, 3, 4]
            }
          }
        ]
      }
    }
  }
}
</script>

