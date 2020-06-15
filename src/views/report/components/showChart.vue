<!-- 适用于显示 图形，接受的传参包括:图形配置信息（模型id， 故障相关信息）以API请求方式获得表格显示的行数据 -->
<template>
  <div v-show="showChart">
    <div style="text-align: center;padding-top: 5px;"><strong>{{ chartInfoText }}</strong></div>
    <MultipleScatterPlot
      v-if="multipleChart"
      :chart-type="dataType"
      :chart-data="scatterData"
      :x-name="multipleXNameText"
      :id="chartId"
      :ids="multipleShow"
      :time="errorAroundTime"
      :tool-box="toolBox"
      :multi-pages="false"
      sub-title=""
      mwidth="100%"
      @callback="multiScattercallback" />
    <BaseCharts
      v-else
      :chart-type="dataType"
      :chart-data="baseChartData"
      :chart-settings="chartSettings"
      :width="chartWidth"
      :mark-point="dataType !== 've-scatter' ? markPoint : null"
      :mark-line="markLine"
      :toolbox="toolBox"
      :chart-data-zoom="dataZoom" />
  </div>
</template>
<script>

import { getFaultModelDatas, getFaultAlertRuleItems } from '@/views/report/components/editorCommonMethod.js'
import { showDateTimeByCustomFormat, timeToTimestamp, timeToTimeRange } from '@/utils/index.js'
import chartcommon from '@/components/DataExplorer/mixin/chartcommon'
import BaseCharts from '@/components/Charts/BaseCharts'
import MultipleScatterPlot from '@/components/Charts/MultipleScatterPlot'

export default {
  name: 'ShowCharts',
  components: { BaseCharts, MultipleScatterPlot },
  extends: chartcommon,
  props: {
    dataType: {
      type: String,
      default: 've-line'
    },
    chartConfigData: {
      type: Object,
      default: null
    },
    faultConfigData: {
      type: Object,
      default: null
    },
    chartWidth: {
      type: String,
      default: '100%'
    },
    chartId: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      baseChartData: null,
      scatterData: [], // 块变量数据
      columns: [],
      chartSettings: {},
      pointData: {},
      markLine: {},
      toolBox: {
        feature: {
          dataZoom: {},
          restore: {}
          // saveAsImage: {}
        },
        right: '30px'
      },
      dataZoom: [],
      errorAroundTime: [],
      errorTimeRange: 0,
      errorRecordcount: 1,
      start_time: '',
      end_time: '',
      multipleChart: false,
      multipleShow: 1,
      multipleXNameText: '',
      chartInfoText: '',
      showModelName: this.chartConfigData['title'] + this.$t('strings.template.model'),
      modelid: '',
      modeltype: 'model',
      showChart: true
    }
  },
  computed: {
    markPoint() {
      return this.pointData
    }
  },
  created() {
    console.log('v-chart', this.chartConfigData, this.faultConfigData, this.dataType, this.chartWidth, this.chartId)
    if (Object.prototype.hasOwnProperty.call(this.faultConfigData, 'model')) {
      if (this.chartConfigData['title'] === '') {
        if (JSON.stringify(this.faultConfigData) !== '{}') {
          this.showModelName = this.faultConfigData.model.name + this.$t('strings.template.model')
        }
      }
      this.getChartData()
    } else {
      this.showChart = false // 通过有无模型model参数，判断运行报告 or 故障报告 运行报告统一不显示任何chart
    }
  },
  methods: {
    getChartData() {
      var chartcolumns = []
      var chartrows = []
      for (var each_data_param of this.chartConfigData['data-param']) {
        if (each_data_param.hasOwnProperty('track_show')) {
          this.multipleShow = Number(each_data_param['track_show'][0])
        } else if (each_data_param.hasOwnProperty('time_range')) {
          this.errorTimeRange = each_data_param['time_range'][0]
        } else if (each_data_param.hasOwnProperty('record_count')) {
          this.errorRecordcount = each_data_param['record_count'][0]
        } else {
          this.columns.push(each_data_param)
        }
      }
      this.modelid = this.chartConfigData['data-model']
      this.modeltype = this.chartConfigData['data-model-type']
      if (this.chartConfigData.alt === 'adapt_fault' && JSON.stringify(this.faultConfigData) !== '{}') {
        // 故障自适应图形，暂时只显示以时间为横轴，以多变量为竖轴的折线图, 在特殊图形插件中定义
        this.columns = []
        this.columns = getFaultAlertRuleItems(this.faultConfigData.alert_rule_info)
        this.showModelName = this.faultConfigData.model.name + this.$t('strings.template.title_model_alarm_params')
        this.modelid = this.faultConfigData.model.id
        this.modeltype = 'model'
        if (this.faultConfigData.model.hasOwnProperty('type')) {
          if (this.faultConfigData.model.type !== null) {
            this.modeltype = this.faultConfigData.model.type
          }
        }
      }
      if (this.dataType === 've-line' || this.dataType === 've-histogram') {
        // 折线图和柱状图，x轴默认为时间
        chartcolumns.push('time')
      }
      chartcolumns = chartcolumns.concat(this.columns)

      this.multipleChart = false
      // 特定图形的配置，包括个性化阈值，轴心轨迹，频谱
      if (this.chartConfigData.alt === 'personalized_threshold' && this.chartConfigData['data-parammark'] !== '') {
        // 个性化阈值，x轴为时间，y轴只允许一个变量，需要确定最大值max,最小值min, 模型属性中，选中变量的个性化阈值结果作为markline
        var chart_threshold_mark = JSON.parse(this.chartConfigData['data-parammark'])
        // console.log('this.chartConfigData', this.chartConfigData['data-param'], chart_threshold_mark)
        const thresData = this.setMarkLine(chart_threshold_mark, [this.chartConfigData['data-param'][0] + '0', this.chartConfigData['data-param'][0] + '1'])
        this.markLine = thresData
        this.chartSettings.min = [Math.min(...chart_threshold_mark)]
        this.chartSettings.max = [Math.max(...chart_threshold_mark)]
      } else if (this.chartConfigData.alt === 'axis_trajectory') {
        // 轴心轨迹图
        this.multipleChart = true
        this.multipleXNameText = this.columns.join('/') + this.$t('charts.axis_trajectory')
        this.toolBox = {}
      } else if (this.chartConfigData.alt === 'spectrum') {
        // 频谱图
        this.multipleChart = true
        this.multipleXNameText = this.columns.join('/') + this.$t('charts.spectrum') // TODO: 只显示y
        this.toolBox = { feature: { dataZoom: { yAxisIndex: 'none' }, restore: {}}}
        this.multipleShow = 1
      } else if (this.chartConfigData.alt === 'mahalanobis_distance') {
        // 马氏距离
        // // this.dataZoom = [{ type: 'slider', start: 0, end: 10 }]
        // this.chartSettings.min = [0]
        // this.chartSettings.xAxisType = 'value'
      }

      if (JSON.stringify(this.faultConfigData) !== '{}' && this.faultConfigData.hasOwnProperty('error_time')) {
        // chart 上方显示一些图表的基本信息,
        // 指定模型的，显示模型名称，未指定模型的显示故障模型名称
        this.chartInfoText = this.showModelName
        // 存在故障数据，根据故障数据通过API请求获取表格部分内容
        if (this.errorTimeRange === 0) {
          // 轴心轨迹，频谱图等在模板中未设定time_range, 不需要显示故障前后数据，只根据故障时间点数据绘制推行
          this.start_time = timeToTimeRange('second', '-', 30, this.faultConfigData['error_time'])
          this.end_time = timeToTimeRange('second', '+', 30, this.faultConfigData['error_time'])
        } else {
          this.start_time = timeToTimeRange('minute', '-', Number(this.errorTimeRange), this.faultConfigData['error_time'])
          this.end_time = timeToTimeRange('minute', '+', Number(this.errorTimeRange), this.faultConfigData['error_time'])
        }
        var postdata = {
          // 'time_range': Number(this.chartConfigData['data-timerange']),
          'num_range': Number(this.errorRecordcount),
          'columns': this.columns.join(','),
          'start_time': this.start_time,
          'end_time': this.end_time,
          'error_time': this.faultConfigData['error_time'],
          'device_uuid': this.faultConfigData['device_uuid'],
          // 'model_id': this.modelid
          'type': this.modeltype
        }
        postdata[this.modeltype + '_id'] = this.modelid
        var _this = this
        getFaultModelDatas(postdata, function(callback) {
          // console.log('allbackdatas', callback, _this.dataType)
          if (callback.result === 'success') {
            // api请求成功，解析返回数据，组织成chart需要格式
            var allbackdatas = callback.data
            if (allbackdatas && allbackdatas.length !== 0) {
              // TODO: 优化: markpoint 标记故障时间点的数据
              _this.pointData.data = []
              var errorTimePoint = ''
              if (_this.dataType === 've-line' || _this.dataType === 've-histogram') {
                errorTimePoint = showDateTimeByCustomFormat('%m/%d %H:%M:%S', _this.faultConfigData['error_time'])
              } else {
                errorTimePoint = allbackdatas[0]['dps'][timeToTimestamp(_this.faultConfigData['error_time']).toString()]
              }
              // console.log('errorTimePoint', errorTimePoint)
              _this.pointData.data = [{ value: 'T', name: 'errorTimePoint', coord: [errorTimePoint, 0] }]

              // TODO: 数据解析测试
              var newColumnObj = {}
              var each_column_keys_array = []
              var allDataShowLength = 0
              for (var each_column of allbackdatas) {
                var each_column_values_array = Object.values(each_column['dps'])
                each_column_keys_array = Object.keys(each_column['dps'])
                allDataShowLength = each_column_values_array.length
                newColumnObj[each_column['metric']] = each_column_values_array
              }

              if (_this.multipleChart) {
                // 快变量解析
                var xdata = newColumnObj[_this.columns[0]][0] // x轴变量
                var ydata = newColumnObj[_this.columns[1]][0] // y轴变量，都是单选项
                if (typeof xdata === 'string') {
                  xdata = xdata.split('/')
                }
                if (typeof ydata === 'string') {
                  ydata = ydata.split('/')
                }
                _this.scatterData = xdata.map((item, key) => [item, ydata[key]])
                // console.log('api scatterData', _this.scatterData)
              } else {
                // 普通绘图变量解析
                for (var i = 0; i < allDataShowLength; i++) {
                  var newobj = {}
                  if (_this.dataType === 've-line' || _this.dataType === 've-histogram') {
                  // 需要时间戳转成时间格式
                    newobj['time'] = showDateTimeByCustomFormat('%m/%d %H:%M:%S', each_column_keys_array[i] * 1000)
                  // _this.errorAroundTime.push(newobj['time'])
                  }
                  for (var show_column_name of _this.columns) {
                    newobj[show_column_name] = String(newColumnObj[show_column_name][i])
                    // TODO: 必要时更新个性化阈值的最大最小值
                    if (_this.chartConfigData.alt === 'personalized_threshold') {
                      if (newColumnObj[show_column_name][i] < _this.chartSettings.min) {
                        _this.chartSettings.min = newColumnObj[show_column_name][i]
                      }
                      if (newColumnObj[show_column_name][i] > _this.chartSettings.max) {
                        _this.chartSettings.max = newColumnObj[show_column_name][i]
                      }
                    }
                  }
                  chartrows.push(newobj)
                }
              }
            } else {
              // TODO: 不显示这个图 showchart = false
              // _this.chartInfoText = _this.showModelName + '图形数据获取为空'
              console.log('图形数据获取为空')
              _this.showChart = false
            }
          } else {
            // _this.chartInfoText = _this.showModelName + '图形数据获取失败'
            // TODO: 不显示这个图 showchart = false
            console.log('图形数据获取失败')
            _this.showChart = false
          }
          _this.baseChartData = { columns: chartcolumns, rows: chartrows }
          // console.log('getChartData normalChartData', _this.baseChartData)
        })
      } else {
        this.baseChartData = { columns: chartcolumns, rows: chartrows }
        this.chartInfoText = this.showModelName + this.$t('strings.template.chartdata_need_parameter')
      }
    }
  }
}
</script>

