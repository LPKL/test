<!--
箱形图组件
-->
<template>
  <div :id="id" :style="'width:'+width+';height:'+height+';margin-top: 2px;'"/>
</template>

<script>
import echarts from 'echarts'
import _ from 'lodash'
import windowresize from './mixins/windowresize'
// import dataTool from 'echarts/extension/dataTool'
export default {
  name: 'BoxPlot',
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
        // boxData 变动重新渲染箱形图
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
      // 箱形图测试数据
      // var datahhh = dataTool.prepareBoxplotData([
      //   [850, 740, 900, 1070, 930, 850, 950, 980, 980, 880, 1000, 980, 930, 650, 760, 810, 1000, 1000, 960, 960],
      //   [960, 940, 960, 940, 880, 800, 850, 880, 900, 840, 830, 790, 810, 880, 880, 830, 800, 790, 760, 800],
      //   [880, 880, 880, 860, 720, 720, 620, 860, 970, 950, 880, 910, 850, 870, 840, 840, 850, 840, 840, 840],
      //   [890, 810, 810, 820, 800, 770, 760, 740, 750, 760, 910, 920, 890, 860, 880, 720, 840, 850, 850, 780],
      //   [890, 840, 780, 810, 760, 810, 790, 810, 820, 850, 870, 870, 810, 740, 810, 940, 950, 800, 810, 870]
      // ])
      this.chart = echarts.init(document.getElementById(this.$props.id))
      const axisData = Object.keys(boxDataTemp.box)
      const o = this.getOutlier(Object.values(boxDataTemp.box), axisData)
      const option = {
        tooltip: {
          trigger: 'item'
        },
        toolbox: {
          feature: {
            dataZoom: {
            },
            restore: {}
          },
          right: '30px'
        },
        backgroundColor: '#ffffff',
        xAxis: {
          type: 'category',
          data: axisData,
          boundaryGap: true,
          nameGap: 30,
          splitArea: {
            show: false
          },
          splitLine: {
            show: false
          }
        },
        yAxis: {
          type: 'value',
          splitArea: {
            show: true
          }
        },
        series: [
          {
            name: 'boxplot',
            type: 'boxplot',
            data: o.boxData,
            tooltip: {
              formatter: function(param) {
                const info = o.info
                const temp = info.map((item, key) => {
                  return item + ':' + param.data[key + 1]
                })
                temp.unshift(param.name)
                return temp.join('<br/>')
              }
            }
          },
          {
            name: 'outlier',
            type: 'scatter',
            symbolSize: 5,
            data: o.outliers
          }
        ]
      }
      this.chart.setOption(option)
    },
    /**
     * 整理箱形图所需数据
     * @param arr
     * @param axisData
     * @returns {{boxData: *, outliers: Array, info: *}}
     */
    getOutlier(arr, axisData) {
      let temp = []
      let info = null
      const arrtemp = _.cloneDeep(arr) // arr 会被改动所以这里使用了深拷贝
      const data = arrtemp.map((item, key) => {
        if (!_.isEmpty(item.outliers)) { // 合并异常值
          temp = temp.concat(item.outliers.map(it => {
            return [axisData[key], it]
          }))
        }
        delete item.outliers
        var sdic = Object.keys(item).sort(function(a, b) {
          return item[a] - item[b]
        })
        !info ? info = sdic : ''
        return Object.values(item).sort(function(a, b) {
          return a - b
        })
      })
      return { boxData: data, outliers: temp, info: info }
    }
  }
}
</script>

