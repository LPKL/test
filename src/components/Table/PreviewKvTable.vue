<!--普通 table 组件 没有弹窗-->
<template>
  <div class="preview-kv-table clearfix" >
    <el-row>
      <el-col :span="18">
        <el-table
          :data="fileupEndData"
          :header-cell-style="{'font-size':'12px','padding':'0','height':'50px','border-bottom':'1px solid #409effb0','cursor': 'pointer'}"
          :cell-style="{'font-size':'12px','padding':'0','position': 'relative'}"
          height="633"
          border
          @header-click="headerClick">
          <el-table-column v-for="(header,index) of tableHeader" :label="header" :key="index" :render-header="renderHeader" align="center" width="120px" >
            <div slot-scope="scope">
              <div class="biz-customcol">
                <div class="biz-two-row">
                  <span >{{ scope.row[index] }}</span>
                </div>
              </div>
            </div>
          </el-table-column>
        </el-table>
      </el-col>
      <el-col :span="6">
        <el-collapse v-model="activeNames">
          <el-collapse-item title="Statistics" name="1" style="padding-left: 10px">
            <div v-for="(item,key) in statistics" :key="key" style="margin-left: 10px">{{ item.toString().replace(/,/,":") }}</div>
          </el-collapse-item>
          <el-collapse-item title="Visual" name="2" style="padding-left: 10px" >
            <div width="100%" style="margin: 0 20px">
              <component
                v-if="leftData"
                :is="charttype"
                :data="chartData"
                :theme="theme"
                :legend-visible="false"
                :set-option-opts="false"
                :grid="grid"
                :judge-width="true"
                width="100%"
                height="300px"/> <!-- 可以直接用这种方式添加配置项 如grid-->
            </div>
          </el-collapse-item>
        </el-collapse>
      </el-col>
    </el-row>
  </div>

</template>

<script>
import $ from 'jquery'
import { transposeArr } from '@/utils/index'
export default {
  name: 'PreviewTable',
  props: {
    fileupEndData: {
      type: Array,
      default: null
    },
    tableHeader: {
      type: Array,
      default: null
    },
    leftData: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      statistics: null,
      visual: null,
      activeNames: ['1', '2'],
      charttype: 've-histogram',
      chartData: {
        columns: ['key', 'count'],
        rows: []
      },
      grid: { containLabel: true },
      operates: [],
      rate: [],
      theme: {
        color: [
          '#409eff',
          '#409ef2',
          '#7bd9a5',
          '#d0648a',
          '#f58db2',
          '#f2b3c9'
        ],
        'categoryAxis': {
          'axisLine': {
            'show': true,
            'lineStyle': {
              'color': '#dee0e0'
            }
          },
          'axisTick': {
            'show': false,
            'lineStyle': {
              'color': '#d1ddde'
            }
          },
          'axisLabel': {
            'show': true,
            'textStyle': {
              'color': '#333'
            }
          },
          'splitLine': {
            'show': false,
            'lineStyle': {
              'color': [
                '#ccc'
              ]
            }
          },
          'splitArea': {
            'show': false,
            'areaStyle': {
              'color': [
                'rgba(250,250,250,0.3)',
                'rgba(200,200,200,0.3)'
              ]
            }
          }
        },
        'valueAxis': {
          'axisLine': {
            'show': true,
            'lineStyle': {
              'color': '#ede8e8'
            }
          },
          'axisTick': {
            'show': false,
            'lineStyle': {
              'color': '#333'
            }
          },
          'axisLabel': {
            'show': true,
            'textStyle': {
              'color': '#333'
            }
          },
          'splitLine': {
            'show': false,
            'lineStyle': {
              'color': [
                '#ccc'
              ]
            }
          },
          'splitArea': {
            'show': false,
            'areaStyle': {
              'color': [
                'rgba(250,250,250,0.3)',
                'rgba(200,200,200,0.3)'
              ]
            }
          }
        },
        'logAxis': {
          'axisLine': {
            'show': true,
            'lineStyle': {
              'color': '#e1ebeb'
            }
          },
          'axisTick': {
            'show': true,
            'lineStyle': {
              'color': '#333'
            }
          },
          'axisLabel': {
            'show': true,
            'textStyle': {
              'color': '#333'
            }
          },
          'splitLine': {
            'show': true,
            'lineStyle': {
              'color': [
                '#ccc'
              ]
            }
          },
          'splitArea': {
            'show': false,
            'areaStyle': {
              'color': [
                'rgba(250,250,250,0.3)',
                'rgba(200,200,200,0.3)'
              ]
            }
          }
        },
        'timeAxis': {
          'axisLine': {
            'show': true,
            'lineStyle': {
              'color': '#ccdcde'
            }
          },
          'axisTick': {
            'show': true,
            'lineStyle': {
              'color': '#333'
            }
          },
          'axisLabel': {
            'show': true,
            'textStyle': {
              'color': '#333'
            }
          },
          'splitLine': {
            'show': true,
            'lineStyle': {
              'color': [
                '#ccc'
              ]
            }
          },
          'splitArea': {
            'show': false,
            'areaStyle': {
              'color': [
                'rgba(250,250,250,0.3)',
                'rgba(200,200,200,0.3)'
              ]
            }
          }
        }
      }
    }
  },
  mounted() {
    if (this.$props.leftData) {
      this.statistics = this.$props.leftData.statistics[0]
      const vs = this.$props.leftData.histogram[0]
      const vs1 = vs[0]
      const vs2 = vs[1]
      this.resetVs(vs1, vs2)
      console.log('初次更新')
      console.log(this.chartData)
      this.rate = transposeArr(this.$props.fileupEndData)
      setTimeout(() => {
        const firstclass = $('.preview-kv-table th')[0].getAttribute('class').split(' ')[0]
        $('.preview-kv-table td.' + firstclass).css({ backgroundColor: '#cadbecb3' })
        $('.preview-kv-table th.' + firstclass).css({ backgroundColor: '#409effb0', color: '#2196F3' })
      }, 300)
    }
  },
  updated() {
    console.log('update')
    this.rate = transposeArr(this.$props.fileupEndData)
  },
  methods: {
    headerClick(column, event) {
      const cs = column.id
      $('.preview-kv-table td').css({ backgroundColor: '#fff', color: '#909399' })
      $('.preview-kv-table th').css({ backgroundColor: '#fff', color: '#909399' })
      $('.preview-kv-table td.' + cs).css({ backgroundColor: '#cadbecb3' })
      $('.preview-kv-table th.' + cs).css({ backgroundColor: '#409effb0', color: '#2196F3' })
      if (this.$props.leftData) {
        const index = this.$props.tableHeader.indexOf(column.label)
        this.statistics = this.$props.leftData.statistics[index]
        const vs = this.$props.leftData.histogram[index]
        const vs1 = vs[0]
        const vs2 = vs[1]
        this.resetVs(vs1, vs2)
      }
    },
    resetVs(arr, arr2) {
      const temp = []
      let i = 0
      arr.reduce(function(pre, cur) {
        temp.push({ 'key': pre + '-' + cur, 'count': arr2[i] })
        i++
        return cur
      })
      this.chartData.rows = temp
    },
    /** table中各字段svg预览和header数据 h=createElement**/
    renderHeader(h, { column, $index }) {
      const dtemp = this.rate[$index]
      const tda = dtemp.map((item, key) => {
        return { key: key, value: item }
      })
      const operates = this.operates
      const temp = []
      operates.map((v, k) => {
        temp.push(h('el-dropdown-item', {
          attrs: { command: k },
          style: 'line-height: 11px;padding:4px 20px;font-size: 11px;border-top:1px solid #ebeef5',
          divided: true
        }, v.func.operate_zname))
      })
      const d = [
        h('span', {}, column.label)
      ]

      return h('div', { style: 'width:100%;padding:0' }, [
        h('section', { style: 'text-overflow: unset;' }, d), h('section', { style: { height: '60px' }}, [
          h('v-chart', { props: { forceFit: 'true',
            height: '60', scale: this.scale,
            data: tda, padding: 'auto',
            renderer: 'svg' },
          style: 'width:100%;padding:0;text-overflow: initial;',
          class: 'tabChart' }, [
            // h('v-tooltip', { props: {
            //   crosshairs: 'false',
            //   inPlot: 'false',
            //   position: 'top',
            //   g2Tooltip: { 'padding': 'inherit', 'font-size': '11px' },
            //   g2TooltipTitle: { 'line-height': '15px', 'margin-bottom': '0' },
            //   g2TooltipList: { 'line-height': '15px' }
            // }}),
            h('v-line', { attrs: { position: 'key*value' }})
          ])
        ])])
    },
    /** 返回dataset数据**/
    getDataSet(data, num) {
      // const dv = new DataSet.View().source(data)
      // dv.transform({
      //   // type: 'bin.line',
      //   // field: 'depth',
      //   // binWidth: num,
      //   as: ['depth', 'count']
      // })
      // return dv.rows
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" >
  .el-table .cell {
    white-space:nowrap;
    text-overflow:ellipsis;
    overflow:hidden;
  }
  .header-cell-style{
    background-color: green;
  }
</style>
