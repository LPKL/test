<!--
时序预测图表type=line
自相关和偏自相关图type=bar
-->
<template>
  <div v-loading="loading" :id="id" :style="'width:'+width+';height:'+height+';margin-top: 2px;'"/>
</template>

<script>
import echarts from 'echarts'
import windowresize from './mixins/windowresize'
export default {
  name: 'ArimaChart',
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
    arimaData: {
      type: Array,
      default: null
    },
    chartType: {
      type: String,
      default: 'line'
    },
    name: {
      type: String,
      default: 'arima时序预测'
    },
    id: {
      type: String,
      default: 'arima'
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
    '$props.arimaData': {
      handler: function(newer, older) {
        const type = this.$props.chartType // 获取chart type
        this.chart.setOption(this.getOptions(type, newer))
      },
      deep: true
    }
  },
  mounted() {
    const json = this.$props.arimaData
    const chart = echarts.init(document.getElementById(this.$props.id))
    this.chart = chart
    const type = this.$props.chartType // 获取chart type
    chart.setOption(this.getOptions(type, json))
  },
  methods: {
    getOptions(type, json) {
      var base = -json.reduce(function(min, val) {
        return Math.floor(Math.min(min, val.l))
      }, Infinity)
      if (type === 'line') {
        return {
          title: {
            text: this.$props.name,
            left: 'center'
          },
          animation: false,
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          toolbox: {
            feature: {
              dataZoom: {
                yAxisIndex: 'none'
              },
              restore: {}
            }
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
              animation: false,
              label: {
                backgroundColor: '#ccc',
                borderColor: '#aaa',
                borderWidth: 1,
                shadowBlur: 0,
                shadowOffsetX: 0,
                shadowOffsetY: 0,
                textStyle: {
                  color: '#222'
                }
              }
            },
            formatter: function(params) {
              const temp = json[params[0].dataIndex]
              return params[0].name + '<br />' + (temp.u ? temp.u + '<br />' : '') + temp.value + (temp.l ? '<br />' + temp.l : '')
            }
          },
          xAxis: {
            type: 'category',
            data: json.map(function(item) {
              return item.date
            })
          },
          yAxis: {
            axisLabel: {
              formatter: function(val) {
                return (val - base)
              }
            },
            axisPointer: {
              label: {
                formatter: function(params) {
                  return (params.value - base).toFixed(1)
                }
              }
            },
            splitNumber: 3,
            splitLine: {
              show: false
            }
          },
          series: [{
            name: 'L',
            type: 'line',
            data: json.map(function(item) {
              return item.l + base
            }),
            lineStyle: {
              normal: {
                opacity: 0
              }
            },
            stack: 'confidence-band',
            symbol: 'none'
          }, {
            name: 'U',
            type: 'line',
            data: json.map(function(item) {
              return item.u - item.l
            }),
            lineStyle: {
              normal: {
                opacity: 0
              }
            },
            areaStyle: {
              normal: {
                color: '#bce3ef'
              }
            },
            stack: 'confidence-band',
            symbol: 'none'
          }, {
            type: type,
            data: json.map(function(item) {
              return item.value + base
            }),
            symbolSize: 8,
            itemStyle: {
              normal: {
                color: '#5cc4ce'
              }
            }
          }]
        }
      } else {
        return {
          title: {
            text: this.$props.name,
            left: 'center'
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          backgroundColor: '#ffffff',
          toolbox: {
            feature: {
              dataZoom: {
              },
              restore: {}
            }
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
              animation: false,
              label: {
                backgroundColor: '#ccc',
                borderColor: '#aaa',
                borderWidth: 1,
                shadowBlur: 0,
                shadowOffsetX: 0,
                shadowOffsetY: 0,
                textStyle: {
                  color: '#222'
                }
              }
            }
          },
          xAxis: {
            type: 'category',
            data: json[0].date
          },
          yAxis: {
            axisLabel: {
              formatter: function(val) {
                return val
              }
            },
            splitNumber: 3,
            splitLine: {
              show: false
            }
          },
          series: [{
            name: 'upper',
            type: 'line',
            data: json[0].u,
            lineStyle: {
              normal: {
                opacity: 0
              }
            },
            areaStyle: {
              normal: {
                color: '#c5dcec'
              }
            },
            stack: 'cb',
            symbol: 'none'
          }, {
            name: 'lower',
            type: 'line',
            data: json[0].l,
            lineStyle: {
              normal: {
                opacity: 0
              }
            },
            areaStyle: {
              normal: {
                color: '#c5dcec'
              }
            },
            stack: 'cb',
            symbol: 'none'
          }, {
            type: type,
            data: json[0].value,
            symbolSize: 4,
            barWidth: 6,
            itemStyle: {
              normal: {
                opacity: 0.6,
                color: '#3f3f3f'
              }
            }
          }, {
            name: 'scatter',
            type: 'scatter',
            data: json[0].value,
            itemStyle: {
              normal: {
                color: '#409EFF'
              }
            },
            symbolSize: 8
          }]
        }
      }
    }
  }
}
</script>

