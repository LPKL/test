<template>
  <div v-loading="loading" :id="chartID" :style="styleChartWrapper" />
</template>

<script>
import echarts from 'echarts'
import windowresize from './mixins/windowresize'

export default {
  name: 'HorizontalStackbar',
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
    toolbox: {
      type: Object,
      default: null
    },
    tooltip: {
      type: Object,
      default: null
    },
    grid: {
      type: Object,
      default: null
    },
    categorys: {
      // 转置了，y轴是category,x轴是value
      type: Array,
      default: () => { return [] }
    },
    stacks: {
      // legend和series name使用
      type: Array,
      default: () => {
        return []
      }
    },
    stackLabel: {
      // 堆叠文字设置
      type: Object,
      default: () => { return { show: true, position: 'insideRight' } }
    },
    stackData: {
      // 以stacks中的项作为series中的name
      type: Array,
      default: () => {
        return [
          [320, 302, 301, 334, 390, 330, 320],
          [120, 132, 101, 134, 90, 230, 210],
          [220, 182, 191, 234, 290, 330, 310],
          [150, 212, 201, 154, 190, 330, 410],
          [820, 832, 901, 934, 1290, 1330, 1320]
        ]
      }
    }
  },
  data() {
    return {
      chart: null,
      options: null,
      loading: true,
      mouseCurValue: null
    }
  },
  computed: {
    chartID() {
      return `chart_${this._uid}`
    },
    styleChartWrapper() {
      return {
        width: this.width,
        height: this.height,
        marginTop: '2px' }
    }
  },
  watch: {
    '$props.stackData': {
      handler: function(newer, older) {
        this.renderChart(newer)
      },
      deep: true
    }
  },
  mounted() {
    this.chart = echarts.init(document.getElementById(this.chartID))
    this.initOption()
    this.renderChart(this.stackData)
  },
  methods: {
    initOption() {
      const _self = this
      const tempOption = {
        tooltip: this.tooltip || {
          trigger: 'axis',
          axisPointer: { // 坐标轴指示器，坐标轴触发有效
            type: 'cross', // 默认为直线，可选为：'line' | 'shadow' | 'cross' |'none'
            label: {
              formatter: function(params) {
                if (params.seriesData.length === 0) {
                  _self.mouseCurValue = params.value
                }
              }
            }
          },
          formatter: function(params) {
            let res = ''; let sum = 0
            for (let i = 0; i < params.length; i++) {
              const series = params[i]
              sum += Number(series.data)
              if (sum >= _self.mouseCurValue) {
                res = series.axisValue + '<br/>' + series.marker + series.seriesName + ':' + series.data + '<br/>'
                // 可选高亮
                if (_self.chart) {
                  _self.chart.dispatchAction({
                    type: 'highlight',
                    seriesIndex: series.seriesIndex,
                    dataIndex: series.dataIndex
                  })
                }
                break
              }
            }
            return res
          }
        },
        toolbox: this.toolbox || {
          feature: {
            dataZoom: {
            },
            restore: {}
          },
          right: '30px'
        },
        legend: {
          data: this.stacks || []
        },
        grid: this.grid || {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value'
        },
        yAxis: {
          type: 'category',
          data: this.categorys
        }
      }
      this.options = tempOption
    },
    renderChart(stackData) {
      if (!this.chart || !this.options) { return }
      const series = []
      if (stackData && stackData.length === this.stacks.length) {
        this.stacks.forEach((c, i) => {
          series.push({
            name: c,
            type: 'bar',
            stack: 'stack',
            label: Object.assign({}, this.stackLabel),
            data: stackData[i]
          })
        })
      }
      this.options.series = series
      this.chart.setOption(this.options)
      this.loading = false
    }
  }
}
</script>
