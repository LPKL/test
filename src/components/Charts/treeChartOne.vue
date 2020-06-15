<template>
  <div :class="className" :id="id" :style="{height:height,width:width}"/>
</template>

<script>
import echarts from 'echarts'
import resize from './mixins/resize'
// import treedata from '@/assets/chart-test/Decision_tree_structure'

export default {
  mixins: [resize],
  props: {
    chartData: {
      type: Array,
      default: null
    },
    className: {
      type: String,
      default: 'chart'
    },
    id: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '200px'
    },
    height: {
      type: String,
      default: '200px'
    }
  },
  data() {
    return {
      chart: null
    }
  },
  mounted() {
    this.initChart()
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    initChart() {
      this.chart = echarts.init(document.getElementById(this.id))
      this.chart.setOption({
        backgroundColor: '#394056',
        title: {
          top: 20,
          text: '决策树',
          textStyle: {
            fontWeight: 'normal',
            fontSize: 16,
            color: '#F1F1F3'
          },
          left: '3%'
        },
        tooltip: { // 提示框组件
          trigger: 'item',
          // formatter : '{b}',
          formatter: function(data) {
            var strs = data.name.split(' ')
            var str = ''
            for (var i = 0, s; s = strs[i++];) { // eslint-disable-line
              str += s + ' '
              if (!(i % 3)) {
                str += '</br>'
              }
            }
            return str
          },
          triggerOn: 'mousemove'
        },
        series: [{
          name: 'tree1',
          type: 'tree',
          // rootLocation: { x: 'center', y: 50 },
          // nodePadding: 1,
          orient: 'vertical',
          symbolSize: 20, // 标记的大小[50, 50]是方形
          symbol: 'roundRect',
          itemStyle: { // 节点，线条设置
            color: '#394056',
            borderColor: '#394056', // 设置为与背景色一样，就不会显示节点
            borderWidth: 1.5,
            borderType: 'solid',
            opacity: 1 // 透明度
          },
          label: {
            normal: {
              formatter: function(data) {
                var strs = data.name.split(' ')
                var str = ''
                for (var i = 0, s; s = strs[i++];) { // eslint-disable-line
                  if (i < 4) {
                    s.length > 8 ? s = s.substring(0, 8) + '..' : s
                    str += s + ' '
                    if (s.length <= 4) {
                      if (!(i % 2)) {
                        str += '\n'
                      }
                    } else {
                      if (!(i % 1)) {
                        str += '\n'
                      }
                    }
                  }
                }
                return '{box|' + (str.split('\n').length > 2 ? str + '...' : str) + '}'
                // return '{box|' + strs[0] + '}'
              },
              rich: {
                box: {
                  height: 20,
                  // width: 50,
                  color: '#fff',
                  padding: [0, 5],
                  align: 'center'
                }
              },
              color: '#fff',
              backgroundColor: '#5222ce',
              opacity: 0,
              borderRadius: 5,
              position: 'center', // 标签的位置。
              verticalAlign: 'middle', // 文字垂直对齐方式，默认自动。
              align: 'center', // 文字水平对齐方式，默认自动。
              fontSize: 12 // 文字的字体大小
            }
          },
          leaves: {
            label: {
              normal: {
                position: 'center',
                verticalAlign: 'middle',
                align: 'center',
                backgroundColor: '#7049f0'
              }
            }
          },
          initialTreeDepth: -1, // 设置为 -1 或者 null 或者 undefined，所有节点都将展开
          expandAndCollapse: true, // 子树折叠和展开的交互，默认打开
          data: this.chartData
        }]
      })
    }
  }
}
</script>
