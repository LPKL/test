<!--
实时监测新页面
检查这些项
this.num
订阅str
-->
<template>
  <div v-loading="batchLoading" :element-loading-text="this.$t('strings.realtmonitor.loading')">
    <div style="padding: 10px;">
      <el-select v-model="sourceIndex" :placeholder="$t('strings.realtmonitor.select_source')" clearable class="new-input" style="width: 10%;min-width:8.3em;margin-right: 10px;">
        <el-option
          v-for="(value,key) in source_list"
          v-if="value.name"
          :key="key"
          :label="value.name"
          :value="value.id"
          auto-complete="on"/>
      </el-select>
      <select-rich
        v-model="moduleIndex"
        :options="module_list"
        :option-key="{ value: 'id', label: 'name' }"
        :combind-value="['id', 'name', 'type']"
        :filter-by="filterBy"
        :filterable="true"
        :clearable="true"
        style="display: inline-block;width: 10%;min-width:9.2em;margin-right: 10px;"
        placeholder="选择模型"
        empty-text="请至少选择一个模型类别"
      />
      <el-select v-model="cascadeIndex" :placeholder="$t('strings.flow.select_chart_type')" clearable class="new-input" style="width: 10%;min-width:9.2em;margin-right: 10px;" @change="cascadeIndexChange">
        <el-option
          v-for="(rt,ri) in cascadeData.arg_range"
          v-if="rt.arg_zname && rt.arg_name != 'abnormal_scatter'"
          :key="ri"
          :label="rt.arg_zname"
          :value="ri"
          auto-complete="on"/>
      </el-select>
      <el-button :loading="cascadeLoading" :title="$t('buttons.flow.add_chart')" type="primary" icon="el-icon-plus" @click="addCascade">{{ $t("buttons.flow.add_chart") }}</el-button>
      <!--<el-button :loading="cascadeLoading" type="primary" size="mini" icon="el-icon-plus" title="添加图表" @click="addCascadePoint">模拟实时(+1)</el-button>-->
      <el-button :loading="cascadeLoading" type="primary" icon="el-icon-check" title="save" @click="saveRealChart">{{ $t('buttons.save') }}</el-button>
      <Cascade v-if="cascadeIndexData" :data="cascadeIndexData" style="width: 100%;margin-top: 10px;" @updateComp="updateCascade"/>
    </div>
    <div style="border-top: 1px solid #ddd;padding-top: 10px;min-height: calc(100vh - 50px);overflow: scroll;">
      <div v-for="(chart,ic) in cascadeChartData" :key="chart.clientId" style="display: inline-block;position: relative;width: 48%;margin-right: 1%;">
        <!--todo markPoint只有这样才能显示 后期需要优化-->
        <div style="display: none">{{ chart }}</div>
        <Heatmap v-if="chart.heatdata" :box-data="chart.heatdata" :id="'heatmap'+ic" width="100%"/>
        <!--异常散点图-->
        <EffectScatter v-else-if="chart.scatterData" :scatter-data="chart.scatterData" :toolbox="chart.toolbox" :type="chart.type" :names="chart.names" :x-name="chart.xName" :id="'scatter'+ic" width="100%"/>
        <ArimaChart v-else-if="chart.arimadata" :arima-data="chart.arimadata" :name="chart.name" :id="'arima'+ic" :chart-type="chart.chartType" width="100%" />

        <!--基础图表组件-->
        <BaseCharts
          v-else
          :chart-type="chart.chartType"
          :chart-data="chart.chartData"
          :chart-settings="chart.chartSettings"
          :chart-data-zoom="chart.chartDataZoom"
          :toolbox="chart.toolbox?chart.toolbox:toolbox"
          :chart-extend="chart.chartExtend"
          :axis="chart.axis"
          :animation="chart.animation"
          :mark-point="chart.markPoint"
          :mark-line="chart.markLine"
          :tooltip-visible="chart.tooltipVisible"
          :legend-visible="chart.legendVisible"
          :events="chart.events"
          :text="chart.text"
          width="100%" />
        <i :title="$t('buttons.flow.delete_chart')" class="el-icon-close" style="position: absolute;right: 10px;top:-5px;color:red;" @click="deleteCass(ic)"/>
      </div>
      <div v-loading="cascadeLoading" style="display: inline-block;position: relative;width: 49%;">
        <div style="width:100%;height: 400px;" />
      </div>
    </div>
  </div>
</template>
<script>
// todo 实时监控参数选择时使用参数 后期需要后台获取
const PARAMS_JSON = JSON.parse(`{
    "arg_doc":"图表类型",
    "arg_name":"chart_type",
    "arg_type":"cascade",
    "arg_range":[
        {
            "arg_doc":"折线图",
            "arg_name":"line",
            "arg_range":[
                {
                    "arg_doc":"选择字段",
                    "arg_name":"y",
                    "arg_type":"columns",
                    "arg_range":null,
                    "arg_value":"",
                    "arg_zname":"Y-轴"
                }
            ],
            "arg_value":"",
            "arg_zname":"折线图"
        },
        {
            "arg_doc":"散点图",
            "arg_name":"scatter",
            "arg_range":[
                {
                    "arg_doc":"选择字段",
                    "arg_name":"x",
                    "arg_type":"list",
                    "arg_range":null,
                    "arg_value":"",
                    "arg_zname":"X-轴"
                },
                {
                    "arg_doc":"选择字段",
                    "arg_name":"y",
                    "arg_type":"columns",
                    "arg_range":null,
                    "arg_value":"",
                    "arg_zname":"Y-轴"
                }
            ],
            "arg_value":"",
            "arg_zname":"散点图"
        },
        {
            "arg_doc":"三维散点图",
            "arg_name":"abnormal_scatter",
            "arg_range":[
                {
                    "arg_doc":"选择字段",
                    "arg_name":"x",
                    "arg_type":"list",
                    "arg_range":null,
                    "arg_value":"",
                    "arg_zname":"X-轴"
                },
                {
                    "arg_doc":"选择字段",
                    "arg_name":"y",
                    "arg_type":"list",
                    "arg_range":null,
                    "arg_value":"",
                    "arg_zname":"Y-轴"
                },
                {
                    "arg_doc":"选择字段",
                    "arg_name":"z",
                    "arg_type":"list",
                    "arg_range":null,
                    "arg_value":"",
                    "arg_zname":"Z-轴"
                }
            ],
            "arg_value":"",
            "arg_zname":"三维散点图"
        },
        {
            "arg_doc":"个性化阈值",
            "arg_name":"personalized_threshold",
            "arg_range":[
                {
                    "arg_doc":"选择字段",
                    "arg_name":"y",
                    "arg_type":"list",
                    "arg_range":null,
                    "arg_value":"",
                    "arg_zname":"Y-轴"
                }
            ],
            "arg_value":"",
            "arg_zname":"个性化阈值"
        },
        {
            "arg_doc":"轴心轨迹",
            "arg_name":"axis_trajectory",
            "arg_range":[
                {
                    "arg_doc":"选择字段",
                    "arg_name":"x",
                    "arg_type":"list",
                    "arg_range":null,
                    "arg_value":"",
                    "arg_zname":"X-轴"
                },
                {
                    "arg_doc":"选择字段",
                    "arg_name":"y",
                    "arg_type":"list",
                    "arg_range":null,
                    "arg_value":"",
                    "arg_zname":"Y-轴"
                },
                {
                    "arg_doc":"输入",
                    "arg_name":"y",
                    "arg_type":"number",
                    "arg_range":null,
                    "arg_value":"0",
                    "arg_zname":"几秒一圈"
                }
            ],
            "arg_value":"",
            "arg_zname":"轴心轨迹"
        },
        {
            "arg_doc":"柱状图",
            "arg_name":"histogram",
            "arg_range":[
                {
                    "arg_doc":"选择字段",
                    "arg_name":"y",
                    "arg_type":"columns",
                    "arg_range":null,
                    "arg_value":"",
                    "arg_zname":"Y-轴"
                }
            ],
            "arg_value":"",
            "arg_zname":"柱状图"
        },
        {
            "arg_doc":"频谱图",
            "arg_name":"spectrum",
            "arg_range":[
                {
                    "arg_doc":"频率",
                    "arg_name":"x",
                    "arg_type":"list",
                    "arg_range":null,
                    "arg_value":"",
                    "arg_zname":"X-轴"
                },
                {
                    "arg_doc":"选择字段",
                    "arg_name":"y",
                    "arg_type":"columns",
                    "arg_range":null,
                    "arg_value":"",
                    "arg_zname":"特征列"
                }
            ],
            "arg_value":"",
            "arg_zname":"频谱图"
        },
        {
            "arg_doc":"仪表盘",
            "arg_name":"dash_board",
            "arg_range":[
                {
                    "arg_doc":"选择字段",
                    "arg_name":"x",
                    "arg_type":"list",
                    "arg_range":null,
                    "arg_value":"",
                    "arg_zname":"X-轴"
                }
            ],
            "arg_value":"",
            "arg_zname":"仪表盘"
        },
        {
            "arg_doc":"时序图",
            "arg_name":"timing_diagram",
            "arg_range":[],
            "arg_value":"",
            "arg_zname":"时序图"
        }
    ],
    "arg_value":"折线图",
    "arg_zname":"图表类型"
}`)

import Cascade from '@/components/ModelFlow/components/options/ParamCascade'
import BaseCharts from '@/components/Charts/BaseCharts' // 基础图表组件
import EffectScatter from '@/components/Charts/EffectScatter'
import ArimaChart from '@/components/Charts/ArimaChart'
import chartcommon from '@/components/DataExplorer/mixin/chartcommon'
import SelectRich from '@/components/SelectRich/index.vue'

import { realTimeMonitorChart } from '@/api/datamining/realtime'
import { getRealTimeOrigin } from '@/api/datamining/real/realorigin'
import { realTimeOriginHaveModel } from '@/api/datamining/real/realorigin'
import { getStreamingsStatus } from '@/api/datamining/real/realflow'
import { getAllModel } from '@/api/datamining/model'
import { getPipeline } from '@/api/experiment/pipelines'

import _ from 'lodash'
import { parseChartType, getRandomColor, transposeArr } from '@/utils/index'
// import { parseChartType, getRandomColor, getNumberRange } from '@/utils/index'

export default{
  name: 'RealMonitor',
  components: { EffectScatter, Cascade, BaseCharts, ArimaChart, SelectRich },
  extends: chartcommon,
  data: function() {
    return {
      batchLoading: false,
      // socket: socketio('http://realtime-push-server.css-ai-pro.10.28.0.241.xip.io/'),
      num: 50, // 图表容纳点数测试会更改
      loading: false,
      drivce: '',
      module_list: [],
      source_list: null,
      moduleIndex: null,
      sourceIndex: null,
      moduleName: null,
      m: 0,
      realtimeStr: null,
      socketColumns: {},
      socketColumnsIndex: {},
      socketChartIndex: {}, // 保存添加的图表名称 图表定制渲染时使用
      socketAllData: {}, // {订阅str:每次发过来的内容} 监听变化分发给每个图表
      socketIndexs: {},
      colors_abnormal: {}, // 异常值 值颜色缓存 {值:颜色}
      colors_abnormal2: {}, // 异常值 值颜色缓存 {值:颜色}
      popColumns: {}, // 异常指标
      dashboardScopeSample: {}, // 仪表盘范围记录temp
      itemstyle: {
        'normal': {
          lineStyle: { 'width': 1 },
          color: (param) => {
            return getRandomColor()
          }
        }
      },
      zxDrawSpeed: {}, // 轴心轨迹图绘图间隔时间
      zxRunning: {}, // 轴心轨迹图正在绘制的多圈图形队列
      modelAttributes: null,
      chartKey: 0,
      model_type: null,
      filterBy: { key: 'type', value: [{ label: '单独模型', value: 'model' }, { label: '组合模型', value: 'pipeline' }], single: false }

    }
  },
  watch: {
    // 监听源变化
    sourceIndex: function(id) {
      this.resetRealParams('source')
      realTimeOriginHaveModel(id, { tag: '0' }).then(res => {
        console.log(res)
        this.module_list = res.data
      }).catch(err => {
        console.log(err)
        this.module_list = []
      })
    },
    /** *深度监听socket数据变化 分发到各图表**/
    m: function(m) {
      Object.keys(this.socketIndexs).some(item => {
        // 判断当前的数据订阅来源
        if (this.realtimeStr === this.socketIndexs[item]) {
          this.setRealMonitChart(item, this.socketAllData[this.socketIndexs[item]], this.socketColumns[item], this.socketColumnsIndex[item], this.socketChartIndex[item])
        }
      })
    },
    // 监听模型变化
    moduleIndex: function(v) {
      const { id, name, type } = v
      console.log(name)
      this.resetRealParams('module')
      this.model_type = type
      if (type === 'pipeline') { // 获取组合模型详情
        getPipeline(id).then(res => {
          this.setColumns(res)
        }).catch(err => {
          this.$message.error(this.$t('strings.monitorAbout.monitor_model_get_faild'))
          console.log(err)
        })
      } else { // 获取单模型详情
        id && getAllModel(undefined, id).then(res => {
          this.setColumns(res)
        }).catch(err => {
          this.$message.error(this.$t('strings.monitorAbout.monitor_model_get_faild'))
          console.log(err)
        })
      }
    }
  },
  mounted() {
    this.cascadeData = PARAMS_JSON
    this.updatecasAllTemp = []
    getRealTimeOrigin().then(res => {
      const data = res.data.data
      this.source_list = data
    })
    // 加载已经保存的图表
    this.loadRealChart()
  },
  // 离开页面销毁订阅
  beforeDestroy() {
    for (const item in this.socketIndexs) {
      this.$socket.emit('leave', this.socketIndexs[item])
    }
    // this.sockets.unsubscribe('message')
    // 重置data数据
    Object.assign(this.$data, this.$options.data())
  },

  methods: {

    /**
       * 重写cascadeIndexData函数
       ** */
    cascadeIndexChange() {
      if (!this.provData) {
        this.cascadeIndex = null
        this.$message.error('字段获取失败，请重试')
        return false
      }
      if (this.provData.indexOf('processed_time') < 0) {
        this.provData.unshift('processed_time')
        // this.provData.unshift({ 'name': 'processed_time', 'zname': 'processed_time', 'type': 'time', 'index': -1 })
      }
      const temp = this.cascadeData.arg_range[this.cascadeIndex].arg_range.map(item => {
        if (item.arg_type !== 'number') {
          item.arg_value = null
        }
        // item.arg_value = null
        return item
      })
      this.cascadeIndexData = {
        args: temp,
        provData: this.provData,
        provids: [],
        index: null
      }
    },
    /**
       * 重写添加函数
       */
    async addCascade() {
      const { id } = this.moduleIndex
      if ((!id && id !== 0) || (!this.cascadeIndex && this.cascadeIndex !== 0) || _.isEmpty(this.cascadeIndexData)) {
        this.$message.error(this.$t('messages.flow.incomplete_param'))
        return false
      }
      // 检查模型是否运行中
      let timeCount = 0
      this.batchLoading = true
      await new Promise((resolve) => {
        const timer = setInterval(async() => {
          timeCount++
          try {
            const res = await getStreamingsStatus({ datasource_id: this.sourceIndex, id: id, model_type: this.model_type })
            clearInterval(timer)
            const status = res.data.batch_status
            // batch_status:404:batch不存在，"staring":正在启动，"running":正在运行，"204":运行异常
            if (status === 'running') {
              resolve()
              clearInterval(timer)
              this.batchLoading = false
            } else if (status === 'starting') {
              if (timeCount > 10) {
                this.$message.error(this.$t('strings.realtmonitor.overTime'))
                this.batchLoading = false
                clearInterval(timer)
              }
              console.log('实时流程正在启动中')
            } else if (status === 'un_start') {
              this.$message.error(this.$t('strings.realtmonitor.un_start'))
              clearInterval(timer)
              this.batchLoading = false
            } else {
              this.$message.error(this.$t('strings.realtmonitor.start_failure'))
              clearInterval(timer)
              this.batchLoading = false
            }
          } catch (err) {
            console.log(err)
            this.batchLoading = false
            this.$message.error(this.$t('strings.realtmonitor.not_exist'))
            clearInterval(timer)
          }
        }, 1000)
      })
      this.batchLoading = false
      // end
      let rows = JSON.parse('[]')
      const setting = { 'xAxisName': ['processed_time'],
        'xAxisType': 'category',
        'symbolSize': 8,
        'heatColor': ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
      }
      let chartextends = {}
      let chartOtherData = {}
      if (this.moduleName && this.sourceIndex) {
        const type = this.cascadeData.arg_range[this.cascadeIndex].arg_name
        const type_zname = this.cascadeData.arg_range[this.cascadeIndex].arg_zname
        const columns = this.resetXYZ(this.cascadeData.arg_range[this.cascadeIndex])
        /** todo 时序预测图暂时不需要任何参数 ***/
        if (!columns && type !== 'timing_diagram') {
          this.$message.error(this.$t('messages.realm.select_columns'))
          return false
        }
        const columnsIndex = type !== 'timing_diagram' ? this.getColumnsIndex(columns) : []
        setting.xAxisName = [columns[0]]
        if (type) {
          const s = this.source_list.filter(item => {
            if (item.id === this.sourceIndex) {
              return item
            }
          }) // 获取原表示
          const str = '/devices/' + s[0].identifier + '/' + this.model_type + 's/' + this.moduleName
          if (type === 'scatter' && !this.isacTime(columns[0])) {
            setting.xAxisType = 'value'
          }
          if (type === 'abnormal_scatter') {
            // const popColumn = columns.pop()
            const popColumn = columns[columns.length - 1]
            this.popColumns[this.cascadeChartData.length] = popColumn
            setting.yAxisName = [columns[1]]
            rows = JSON.parse('{}') // 根据异常点的散点图，异常指标决定Y轴颜色的需求，将散点图形数据源改为双维度形式{'key':[]}
            rows[setting.yAxisName] = []
            // 异常点颜色设置
            const itemstyle = {
              'normal': {
                color: (param) => {
                  if (param.data) {
                    if (this.colors_abnormal2[param.data.value[2]]) {
                      return this.colors_abnormal2[param.data.value[2]]
                    } else {
                      try {
                        const ycIndex = this.getColumnsIndex([popColumn])[0]
                        const test = this.socketAllData[str].data
                        const ycValue = test[ycIndex]
                        let color = null
                        if (this.colors_abnormal[ycValue]) {
                          color = this.colors_abnormal[ycValue]
                        } else {
                          color = getRandomColor()
                          this.colors_abnormal[ycValue] = color
                          if (this.colors_abnormal2[param.data.value[2]]) {
                            return color
                          } else {
                            this.colors_abnormal2[param.data.value[2]] = color
                          }
                        }
                        return color
                      } catch (e) {
                        console.log(e)
                      }
                    }
                  }
                }
              }
            }
            setting.itemStyle = itemstyle
          }
          if (type === 'dash_board') {
            // 仪表盘
            this.dashboardScopeSample[this.cascadeChartData.length] = []
            setting.seriesMap = { 'processed_time': { min: 0, max: 0, axisLabel: { show: true }, detail: { offsetCenter: [0, '80%'] }}}
            setting.labelMap = { 'processed_time': columns[1] }
            setting.dataName = { 'processed_time': columns[1] }
          }
          if (type === 'axis_trajectory') {
            // 轴心轨迹
            this.zxDrawSpeed[this.cascadeChartData.length] = columns.pop() // 轴心轨迹绘图的频率
            setting.symbolSize = 6
            // setting.grid = { 'show': false }
            chartextends = { 'xAxis': { scale: true }, 'yAxis': { scale: true }} // 这里会xy轴值会自适应数据显示
            // setting.itemStyle = { 'opacity': 1 }
            this.zxRunning[this.cascadeChartData.length] = []
            chartOtherData = { 'zxDrawSpeed': this.zxDrawSpeed[this.cascadeChartData.length] }
            // tooltipVis = false
            // legendVis = false
            columns[1] = columns[0] + '-' + columns[1]
            setting.xAxisName = null
            setting.xAxisType = 'value'
          }
          if (type === 'spectrum') {
            setting.xAxisType = 'category'
          }

          // 图例样式
          chartextends.legend = {
            // orient: 'vertical',
            itemGap: 5,
            itemWidth: 13,
            itemHeight: 7,
            padding: 2,
            formatter: function(name) {
              return _.truncate(name, { 'length': 20 })
            },
            tooltip: {
              show: true
            },
            textStyle: {
              fontSzie: 9
            }
          }
          // 坐标轴名称与x轴文字堆叠
          if (['line', 'scatter', 'abnormal_scatter'].indexOf(type) >= 0) {
            chartextends.xAxis = {
              ...chartextends.xAxis,
              nameGap: 30,
              name: setting.xAxisName || 'processed_time'
            }
            // chartextends.yAxis = {
            //   name: setting.yAxisName,
            //   nameLocation: 'middle',
            //   nameGap: 20,
            //   nameTextStyle: { align: 'right', verticalAlign: 'middle' }
            // }

            chartextends.grid = {
              left: '30'
            }
          }

          let temp = {
            chartType: parseChartType(type),
            chartData: { columns: columns, rows: rows },
            chartDataZoom: [],
            chartSettings: setting,
            chartExtend: chartextends,
            animation: { animation: false },
            // tooltipVisible: tooltipVis, // 是否显示图示上方的tooltip
            // legendVisible: legendVis, // 是否显示弹出的数据节点说明框
            otherData: chartOtherData
          }
          if (type === 'line') {
            const cindex = this.cascadeChartData.length
            temp.events = {
              legendselectchanged: (e) => {
                const item = this.cascadeChartData[cindex]
                const colIndex = columnsIndex[columns.indexOf(e.name)]
                const nt = item['markPoint']
                this.$set(item, 'legendSelectInfo', e.selected)
                if (nt) {
                  nt.data.forEach(c => {
                    if (c.colIndex === colIndex) {
                      c.symbolSize = e.selected[e.name] ? 20 : 0
                    }
                  })
                  // 强制重绘，否则异常点不消除
                  item.chartData.rows = item.chartData.rows.concat()
                }
              }
            }
          }
          if (type === 'personalized_threshold') {
            //  个性化阈值
            try {
              const thres = columns.slice(1).map(item => { return 'threshold_' + item })
              const thresColumes = []
              const thresValues = []
              thres.some(item => {
                this.modelAttributes[item] && this.modelAttributes[item].some((it, k) => {
                  thresColumes.push(item + k)
                  thresValues.push(it)
                })
              })
              const thresData = this.setMarkLine(thresValues, thresColumes)
              temp.markLine = thresData
              // 设置图表最大值最小值
              thresValues[0] && (temp.chartSettings = this.resetSetting(columns, null, Math.min(...thresValues), Math.max(...thresValues), columns))
            } catch (e) {
              console.log('unfounded threshold', e)
            }
          }
          // 实时监测图区域小 legend和toolbox挤在一起，toolbox不需要显示(频谱图除外)
          if (type !== 'spectrum') {
            temp.toolbox = {
              show: false
            }
          }
          if (type === 'scatter') {
            temp = { scatterData: {}}
            if (!this.isacTime(columns[0])) {
              temp['type'] = 'value'
            }
            temp['xName'] = columns[0]
            temp['names'] = columns.slice(1)
          }

          temp.clientId = this.chartKey
          this.chartKey += 1
          if (type === 'timing_diagram') {
            temp = { arimadata: [{ value: 0, date: 0, l: 0, u: 0 }], name: '时序预测', type: 'line', clientId: this.chartKey }
          }
          this.cascadeChartData.push(temp)
          this.addSocketio(str, columns, columnsIndex, type_zname)
        } else {
          this.$message.error(this.$t('strings.flow.select_chart_type'))
        }
      } else {
        this.$message.error(this.$t('strings.realtmonitor.realmodel_error'))
      }
    },
    returnDataList(data) {
      this.module_list = data.module_list
    },
    resetRealParams(changedIndex) {
      if (changedIndex === 'source') {
        this.moduleIndex = null // 重置模型
        this.cascadeIndex = null // 重置参数
        this.cascadeIndexData = {} // 重置参数
      } else if (changedIndex === 'module') {
        this.cascadeIndex = null
        this.cascadeIndexData = {}
      }
    },
    /**
       * 设置获取所有所选择的字段 包括后面要用到的time 字段
       **/
    resetXYZ(chartdata) {
      const range = chartdata.arg_range
      let cols = []
      if (!range.length) {
        return false
      }
      for (let i = 0, len = range.length; i < len; i++) {
        var rangevalue = range[i].arg_value
        if (range[i].arg_type === 'number') {
          rangevalue = range[i].arg_value.toString()
        }
        if (_.isEmpty(rangevalue)) {
          return false
        }
      }
      if (range.length > 1) {
        range.some((item) => {
          cols = _.isArray(item.arg_value) ? cols.concat(item.arg_value) : cols.concat([item.arg_value])
        })
      } else {
        cols = ['processed_time'].concat(range[0].arg_value)
      }
      return cols
    },
    /**
       * 获取每个字段和实时数据源中的对应下标
       *
       **/
    getColumnsIndex(cols) {
      return cols.map((item, key) => {
        return this.provData.indexOf(item) - 1
      })
    },
    addSocketio(str, columns, columnsIndex, chartIndex) {
      const cindex = this.cascadeChartData.length - 1
      this.socketIndexs[cindex] = str
      this.socketColumns[cindex] = columns
      this.socketColumnsIndex[cindex] = columnsIndex
      this.socketChartIndex[cindex] = chartIndex
      console.log(str)
      this.$socket.emit('join', str)
      // this.sockets.subscribe('message', (data) => {
      //   if (data.model) {
      //     this.socketAllData[str] = data
      //     this.realtimeStr = str
      //     this.m++
      //   }
      // })
    },
    /**
       * 分发订阅数据到每个图表
       * 参数依次表示 图表下标,socketio订阅返回数据,模型字段,选取的字段下标array,选取的图表类型下标
       * todo chartIndex用来定制图表渲染 代表添加图表时图表类型中文名称
       */
    setRealMonitChart(cindex, data, columns, columnsIndex, chartIndex) {
      const item = this.cascadeChartData[cindex]
      try {
        if (chartIndex === '频谱图') {
          this.realPuChart(cindex, data, columns, columnsIndex)
          return false
        }
        if (chartIndex === '散点图') {
          this.effectScatterChart(cindex, data, columns, columnsIndex)
          return false
        }
        if (chartIndex === '时序图') {
          this.arimaChart(cindex, data, columns, columnsIndex)
          return false
        }
        const test = data.data // 数据部分
        if (!item) {
          return false
        }
        let temp = []
        // 三维散点图(异常值) 特殊处理
        if (chartIndex === '三维散点图') {
          temp = item.chartData.rows[this.cascadeChartData[cindex].chartSettings.yAxisName]
        } else {
          temp = item.chartData.rows
        }
        const next = {}
        // 异常点
        const abnormalData = data.abnormal
        const ab = [] // 异常点
        // columns多了一个time字段 对应数据下标-1
        columnsIndex.some((it, key) => {
          if (it < 0) {
            next['processed_time'] = data.processed_at
          } else {
            if (abnormalData === 1) {
              // if (abnormalData === 1) {
              ab.push({ data: test[it], colIndex: it, colName: columns[key] })
            }
            next[columns[key]] = test[it]
          }
        })
        const coord = Object.values(next)[0]
        const abnormal = ab.map(el => {
          let symbolSize
          if (!item.legendSelectInfo) {
            symbolSize = 20
          } else {
            symbolSize = item.legendSelectInfo[el.colName] ? 20 : 0
          }
          return {
            processtime: coord,
            symbolSize,
            coord: [coord, el.data],
            colIndex: el.colIndex
          }
        })
        if (chartIndex === '轴心轨迹') {
          if (this.zxDrawSpeed[cindex] === undefined) {
            if (item.hasOwnProperty('otherData')) {
              this.zxDrawSpeed[cindex] = item.otherData.zxDrawSpeed
            } else {
              this.zxDrawSpeed[cindex] = '0.8' // 未设置轴心轨迹绘制频率时，默认0.8s每圈
            }
          }
          const zxdata = Object.values(next)
          const dataxarr = typeof zxdata[0] === 'string' ? zxdata[0].split('/') : zxdata[0]
          const datayarr = typeof zxdata[1] === 'string' ? zxdata[1].split('/') : zxdata[1]
          // chartExtend已经设置了scale: true 不需要设置最大值最小值
          // if (item.chartSettings.min === 0) {
          //   // this.cascadeChartData[cindex].chartSettings.min = Math.ceil(datayarr[0] * 0.95)
          //   // this.cascadeChartData[cindex].chartSettings.max = Math.ceil(datayarr[0] * 1.05)
          //   // this.cascadeChartData[cindex].chartExtend = { 'xAxis': { 'max': Math.ceil(dataxarr[0] * 1.05), 'min': Math.ceil(dataxarr[0] * 0.95), 'type': 'value' }}
          //   // item.chartSettings.xAxisType = 'value'
          //   item.chartSettings.min = getNumberRange(datayarr)[0]
          //   item.chartSettings.max = getNumberRange(datayarr)[1]
          //   item.chartExtend = { 'xAxis': { 'max': getNumberRange(dataxarr)[1], 'min': getNumberRange(dataxarr)[0], 'type': 'value' }}
          // }
          for (let existTimerCount = 0; existTimerCount <= 8; existTimerCount++) {
            clearInterval(this.zxRunning[cindex][existTimerCount])
          }
          const each_range_dot = parseInt(dataxarr.length / 8) // 每一圈的点数
          for (let rangeCount = 0; rangeCount < 8; rangeCount++) {
            this.zxRunning[cindex][rangeCount] = setTimeout(() => {
              const zxShowChartData = []
              for (let dotCount = each_range_dot * rangeCount; dotCount < each_range_dot * (rangeCount + 1); dotCount++) {
                zxShowChartData.push({ [columns[0]]: dataxarr[dotCount], [columns[1]]: datayarr[dotCount] })
              }
              this.cascadeChartData[cindex].chartData.rows = zxShowChartData
            }, (rangeCount + 1) * this.zxDrawSpeed[cindex] * 1000)
          }
        }
        if (chartIndex === '仪表盘') {
          // 对于仪表盘来说，监控字段的范围目前无法获取，范围策略：首次显示为以第一个节点为中心的范围，十个节点后，取是个节点范围的最大值作为新的范围
          // 采用进一法
          if (this.dashboardScopeSample[cindex].length < 10) {
            if (typeof next[columns[1]] === 'number' && !isNaN(next[columns[1]]) && next[columns[1]] > 0) {
              if (this.cascadeChartData[cindex].chartSettings.seriesMap['processed_time'].max === 0) {
                this.cascadeChartData[cindex].chartSettings.seriesMap['processed_time'].max = Math.ceil(next[columns[1]] * 2)
              }
              this.dashboardScopeSample[cindex].push({ 'min': 0, 'max': Math.ceil(next[columns[1]] * 2) })
            } else {
              if (this.cascadeChartData[cindex].chartSettings.seriesMap['processed_time'].min === 0) {
                this.cascadeChartData[cindex].chartSettings.seriesMap['processed_time'].min = Math.ceil(next[columns[1]] * 2)
              }
              this.dashboardScopeSample[cindex].push({ 'min': Math.ceil(next[columns[1]] * 2), 'max': 0 })
            }
          }
          if (this.dashboardScopeSample[cindex].length === 10) {
            const minsum = []
            const maxsum = []
            for (let i = 0; i < 10; i++) {
              minsum.push(this.dashboardScopeSample[cindex][i].min)
              maxsum.push(this.dashboardScopeSample[cindex][i].max)
            }
            this.cascadeChartData[cindex].chartSettings.seriesMap = {
              'processed_time': {
                min: Math.ceil(minsum.sort((a, b) => a - b)[0]),
                max: Math.ceil(maxsum.sort((a, b) => a - b).reverse()[0]),
                axisLabel: { show: true }, detail: { offsetCenter: [0, '80%'] }
              }
            }
          }
          next['processed_time'] = 'processed_time'
          this.cascadeChartData[cindex].chartData.rows = [next]
        } else {
          temp.push(next)
          // 显示限制 柱状图只显示一个值
          let delv = null
          const nt = item['markPoint']
          if (temp.length > this.num || (chartIndex === '柱状图' && temp.length > 1)) {
            delv = temp.shift()
            if (nt && nt._tag) {
              // 删除气泡操作 todo还需要优化
              const tags = nt._tag
              // Object.values(tags).some((item, key) => {
              // if (_.isEqual(item.processed_at, delv.processed_at)) {
              //   console.log('异常气泡删除', delv)
              //   nt.data.splice(0, 1)
              //   return false
              // }
              // })
              // const markedPoints = []
              // nt.data.forEach((c, idx) => {
              //   if (c.processtime === delv.processed_time) {
              //     markedPoints.push(idx)
              //   }
              // })
              // if (markedPoints.length > 0) {
              //   markedPoints.forEach(c => {
              //     nt.data.splice(c, 1)
              //   })
              // }
              const indxToRemove = nt.data.findIndex(c => c.processtime === delv.processed_time)
              nt.data.splice(indxToRemove, columns.length - 1)
              tags.splice(0, 1)

              // this.cascadeChartData[cindex]['markPoint'] = { data: nt.data, symbolSize: 28, itemStyle: { color: '#c60928' }, _tag: tags }
            }
          }
          // 气泡形式显示异常值信息
          if (chartIndex === '折线图' && !_.isEmpty(abnormal)) {
            // 添加气泡操作
            if (nt && nt._tag) {
              // const tags = nt._tag
              // tags.push(next)
              nt.data = nt.data.concat(abnormal)
              nt._tag.push(next)
              // this.cascadeChartData[cindex]['markPoint'] = { data: nt.data.concat(abnormal), symbolSize: 28, itemStyle: { color: '#c60928' }, _tag: tags }
            } else {
              this.cascadeChartData[cindex]['markPoint'] = { data: abnormal, symbolSize: 28, itemStyle: { color: '#c60928' }, _tag: [next] }
            }
          }
          if (chartIndex === '个性化阈值') {
            // 如果实时值大于起初的最大值或小于最小值 则更新此时的最大值和最小值
            // const newTh = Object.values(next)[1]
            const oSet = this.cascadeChartData[cindex].chartSettings
            // if (set.max && newTh > set.max[0]) {
            //   set.max = [newTh]
            // }
            // if (set.min && newTh < set.min[0]) {
            //   set.min = [newTh]
            // }
            this.cascadeChartData[cindex].chartSettings = oSet
          }
          if (chartIndex === '三维散点图') {
            this.cascadeChartData[cindex].chartData.rows[this.cascadeChartData[cindex].chartSettings.yAxisName] = temp
          } else {
            this.cascadeChartData[cindex].chartData.rows = temp
          }
        }
      } catch (e) {
        console.log(data)
        console.log(e)
      }
    },
    /** *实时频谱显示*/
    realPuChart(cindex, data, columns, columnsIndex) {
      const test = data.data // 数据部分
      let haveTime = false
      const temp = test[columnsIndex[0]].map((item, key) => {
        const a = {}
        columnsIndex.some((it, k) => {
          if (it < 0) {
            haveTime = true
          }
          a[columns[k]] = test[it][key]
        })
        return a
      })
      if (haveTime) {
        this.$message.error('params x is error')
        return false
      }

      console.log(columnsIndex)
      const one = columnsIndex.filter((item, key) => { if (key > 0) { return item } }).map(item => { return test[item + 1] })
      this.cascadeChartData[cindex].chartData.rows = temp
      this.cascadeChartData[cindex].chartDataZoom = [{ type: 'slider', start: 0, end: 10 }]
      this.cascadeChartData[cindex].text = !_.isEmpty(one) ? '1倍频占比: ' + one : ''
      return false
    },
    /**
       * 异常散点图实时绘制
       */
    effectScatterChart(cindex, data, columns, columnsIndex) {
      const item = this.cascadeChartData[cindex]
      const temp = item.scatterData
      const test = data.data // 数据部分

      let next = []
      if (_.isEmpty(temp)) {
        temp['data'] = [...Array(columnsIndex.length - 1)].map(a => 0)
      }
      let effect = temp['effect']
      let effindex = temp['effindex']
      if (!effect) { effect = [] }
      if (!effindex) { effindex = {} }
      next = temp['data'].map((itm, key) => {
        if (!itm) { itm = [] }
        let t = null
        let abnormalT = null
        if (columnsIndex[0] < 0) {
          t = [data.processed_at, test[columnsIndex[key + 1]]]
        } else {
          t = [test[columnsIndex[0]], test[columnsIndex[key + 1]]]
        }
        if (data.abnormal === 1) {
          // if (itm.length % 3) {
          abnormalT = [...t]
          effect.push(abnormalT)
          const effkey = t[0] + '_' + t[1]
          if (!effindex[effkey]) {
            effindex[effkey] = 1
          } else {
            effindex[effkey] += 1
          }
        }
        itm.push(t)
        // 点数限制
        if (itm.length > this.num) {
          const delEffect = itm.shift()
          const effkey = delEffect[0] + '_' + delEffect[1]
          if (effindex[effkey]) {
            effect.shift()
            if (effindex[effkey] > 1) {
              effindex[effkey] -= 1
            } else {
              delete effindex[effkey]
            }
          }
        }
        return itm
      })
      this.cascadeChartData[cindex]['scatterData'] = { data: next, effect: effect, effindex: effindex }
    },
    /**
       * 重写删除操作 增加socketio删除订阅功能
       * @param index
       */
    deleteCass(index) {
      const str = this.socketIndexs[index] // 此时删除的订阅内容
      this.resetCassDelet(index)
      const socketIndexValues = Object.values(this.socketIndexs)
      this.unsubscribeChart(socketIndexValues, str)
    },
    /**
       * 删除已经绘制图表重置一些变量
       */
    resetCassDelet(index) {
      this.cascadeChartData.splice(index, 1)
      this.updatecasAllTemp.splice(index, 1)
      // 重置索引
      delete this.socketIndexs[index] // 删除订阅索引
      delete this.socketColumns[index]
      delete this.socketColumnsIndex[index]
      delete this.socketChartIndex[index]

      this.socketIndexs = this.resetSocketIndex(index, this.socketIndexs)
      this.socketColumns = this.resetSocketIndex(index, this.socketColumns)
      this.socketColumnsIndex = this.resetSocketIndex(index, this.socketColumnsIndex)
      this.socketChartIndex = this.resetSocketIndex(index, this.socketChartIndex)
      // 重置结束
    },
    /**
       * 取消订阅操作方法
       */
    unsubscribeChart(socketIndexValues, str) {
      // 检查是否还存在调用的
      if (socketIndexValues.indexOf(str) < 0) {
        console.log('取消订阅')
        // 关闭此订阅
        this.$socket.emit('leave', str)
      } else {
        console.log('此订阅还有使用,不能取消订阅')
      }
    },
    /**
       * 重置索引统一调用
       * @param index 要删除的索引
       * @param socketindex对象副本
       * @param socketIndexValues 对象value数组
       */
    resetSocketIndex(index, socketindex) {
      // 已经删除索引之后 重置socketIndexs
      const socketIndexValues = Object.values(socketindex)
      const keys = Object.keys(socketindex).map(item => {
        if (item > index) {
          return item - 1
        } else {
          return item
        }
      })
      const newSocketIndexs = {}
      socketIndexValues.map((item, key) => {
        newSocketIndexs[keys[key]] = item
      })
      return newSocketIndexs
      // 重置结束
    },
    /**
       * 加载已经保存的图表
       */
    loadRealChart() {
      realTimeMonitorChart().then(res => {
        const active = res.data.active
        // const active = ['/devices/hd/models/mmd0826']
        if (!Object.prototype.hasOwnProperty.call(res.data, 'data')) {
          console.log('realmonitor loadRealChart false', res.data)
          return false
        }
        const data = JSON.parse(res.data.data.chart_conf_json)
        // 增加图例点击事件
        data.charts.forEach((v, idx) => {
          if (v.chartType === 've-line') {
            v.events = {
              legendselectchanged: (e) => {
                const columnsIndex = data.socketColumnsIndex[idx]
                const columns = data.socketColumns[idx]
                const colIndex = columnsIndex[columns.indexOf(e.name)]
                const nt = v['markPoint']
                this.$set(v, 'legendSelectInfo', e.selected)
                if (nt) {
                  nt.data.forEach(c => {
                    if (c.colIndex === colIndex) {
                      c.symbolSize = e.selected[e.name] ? 20 : 0
                    }
                  })
                  // 强制重绘，否则异常点不消除
                  v.chartData.rows = v.chartData.rows.concat()
                }
              }
            }
          }
        })
        this.cascadeChartData = data.charts
        this.socketIndexs = data.socketIndexs
        this.socketColumns = data.socketColumns
        this.socketColumnsIndex = data.socketColumnsIndex
        this.socketChartIndex = data.socketChartIndex
        for (const chart_index in this.socketChartIndex) {
          // 轴心轨迹图正在绘制的多圈图形队列需要进行初始化
          if (this.socketChartIndex[chart_index] === '轴心轨迹') {
            this.zxRunning[chart_index] = []
          }
        }
        // // 过滤已经保存的订阅内容
        for (const i in data.socketIndexs) {
          const str = data.socketIndexs[i]
          // if (Object.values(data.socketIndexs).indexOf(str) === i * 1) {
          //   this.sockets.subscribe(str, (data) => {
          //     this.socketAllData[str] = data
          //     this.realtimeStr = str
          //     this.m++
          //   })
          // }
          // 判断实时订阅是否已经开启 todo 待测试
          if (active.indexOf(str) >= 0) {
            // 防止重复订阅
            if (Object.values(data.socketIndexs).indexOf(str) === i * 1) {
              this.$socket.emit('join', str)
              // this.sockets.subscribe('message', (data) => {
              //   if (data.model) {
              //     this.socketAllData[str] = data
              //     this.realtimeStr = str
              //     this.m++
              //   }
              // })
            }
          } else {
            if (Object.keys(data.socketIndexs).indexOf(i) !== i * 1) {
              this.resetCassDelet(i - i)
            } else {
              this.resetCassDelet(i)
            }
          }
        }
      }).catch(err => {
        console.log(err)
      })
    },
    /**
       * arima 时序预测
       **/
    arimaChart(cindex, data, columns) {
      /**
         * 0: "0"
         * 1: {data: Array(55), device_id: "sanxia_24", collected_at: "2019-12-22 14:13:28", model: "三峡_轴心轨迹", abnormal: 0, …}
         * 2: (2) ["processed_time", "flow", __ob__: Observer]
         * */
      // 转置数组
      const result = transposeArr(data.data)
      columns = data.data_columns
      const [alltime, prediction, prediction_l, prediction_u, , x] = result
      const atemp = alltime.map((item, key) => {
        const value = x[key] * 1 || prediction[key] * 1
        if (!x[key + 1] && x[key]) {
          return {
            value: value,
            date: item,
            l: value,
            u: value
          }
        }
        return {
          value: value,
          date: item,
          l: prediction_l[key] ? prediction_l[key] * 1 : 0,
          u: prediction_u[key] ? prediction_u[key] * 1 : 0
        }
      })
      this.cascadeChartData[cindex].arimadata = atemp
      this.cascadeChartData[cindex].name = columns[5] + '时序图'
    },
    /**
       * 保存功能
       */
    saveRealChart() {
      const charts = _.cloneDeep(this.cascadeChartData)
      const atemp = charts.map(item => {
        // 清空图表数据用于保存
        if (item.legendSelectInfo) {
          delete item.legendSelectInfo
        }
        item.markPoint = null
        if (item.chartData) {
          item.chartData.rows = []
          return item
        }
        // 特殊图散点图处理
        if (item.scatterData) {
          item.scatterData.data = item.scatterData.data.map(item => { return [] })
          item.scatterData.effect = []
          item.scatterData.effindex = {}
          return item
        }
        return item
      })
      let data = {
        charts: atemp,
        socketIndexs: this.socketIndexs,
        socketColumns: this.socketColumns,
        socketColumnsIndex: this.socketColumnsIndex,
        socketChartIndex: this.socketChartIndex
      }
      if (_.isEmpty(atemp)) {
        data = {
          charts: [],
          socketIndexs: {},
          socketColumns: {},
          socketColumnsIndex: {},
          socketChartIndex: {}
        }
      }
      realTimeMonitorChart({
        chart_conf_json: JSON.stringify(data),
        user_id: this.$store.getters.id
      }).then(res => {
        if (res.status === 200) {
          this.$message.success(this.$t('messages.realm.save_chart'))
        }
      }).catch(err => {
        console.log(err)
      })
    },
    setColumns(res) {
      const data = res.data
      this.moduleName = data.name
      this.modelAttributes = data.attributes
      let cols = []
      try {
        cols = data.columns_list_json.map(item => { return item.name })
      } catch (e) {
        console.log(e)
        this.$message.warning(this.$t('strings.monitorAbout.monitor_model_warning'))
      }
      this.provData = cols
    }
  },
  sockets: {
    // 查看socket是否渲染成功
    connect() {
      console.log('实时监测socket')
    },
    disconnect() {
      console.log('检测socket已经断开链接!')
      console.log(this.$socket.connected)
    },
    reconnect() {
      console.log('socket重新链接')
    },
    message(data) { // todo 数据返回过快会出现严重问题
      console.log('socket data', data)// 接收的消息
      if (data.model) {
        const str = '/devices/' + data.device_id + '/' + data.model_type + 's/' + data.model
        this.socketAllData[str] = data
        this.realtimeStr = str
        this.m++
      }
    }
  }
}
</script>
