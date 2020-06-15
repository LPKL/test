<!--
基础图表组件 基于v-charts库
散点图	ev-scatter
折线图	ev-line
柱状图	ev-histogram
条形图	ev-bar
饼图	ev-pie
热力图	ev-heatmap
图表默认宽度400px
-->
<template>
  <div v-loading="loading" :style="'display: inline-block;position:relative;width:'+width+';height:'+height">
    <el-dropdown v-show="isTc === true && (chartType === 've-line' || chartType === 've-scatter')" trigger="click" @command="handleOutputDropdownCommand" >
      <el-tooltip :disabled="(chartType === 've-scatter' && brushSelectedEvent.length === 0) ? false : true" content="框选数据后，才可执行该操作" placement="top" effect="dark">
        <el-button :class="(chartType === 've-scatter' && brushSelectedEvent.length === 0) ? 'moreOperatorButtonDisabled' : 'moreOperatorButton'">{{ chartType === 've-scatter' ? $t('strings.dataoutput.areaDataOutput') : $t('strings.dataoutput.dataOutput') }}
        </el-button>
      </el-tooltip>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item :disabled="(chartType === 've-scatter' && brushSelectedEvent.length === 0) ? true : false" :command="dataExplorerOutputData('toHistory')">{{ $t('strings.dataoutput.toHistory') }}</el-dropdown-item>
        <el-dropdown-item :disabled="(chartType === 've-scatter' && brushSelectedEvent.length === 0) ? true : false" :command="dataExplorerOutputData('toCSV')">{{ $t('strings.dataoutput.toLocal') }}</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <span v-if="text" style="position: absolute;top: 30%;height: 20px;line-height: 20px;right: 10%;z-index: 10;">{{ text }}</span>
    <component
      ref="basechart"
      :is="type"
      :data="allData"
      :mark-line="markLine"
      :mark-point="markPoint"
      :data-zoom="chartDataZoom"
      :toolbox="toolboxConfig"
      :settings="chartSettings"
      :title="title"
      :animation="animation"
      :colors="colors2"
      :extend="extendConfig"
      :set-option-opts="false"
      :width="width"
      :height="height"
      :background-color="backgroundColor"
      :tooltip="tooltip"
      :tooltip-visible="tooltipVisible"
      :legend-visible="legendVisible"
      :events="events"
      :brush="brush"
      :visual-map="chartVisualMap"
      :after-set-option="afterSetOption"/>
  </div>
</template>
<script>
import { isEmpty, clone, cloneDeep } from 'lodash'
export default {
  name: 'BaseCharts',
  props: {
    chartType: {
      type: String,
      default: 've-line'
    },
    chartSettings: {
      type: Object,
      default: null
    },
    chartExtend: {
      type: Object,
      default: null
    },
    chartData: {
      type: Object,
      default: null
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '100%'
    },
    text: {
      type: String,
      default: null
    },
    chartDataZoom: {
      type: Array,
      default: () => { return [{ type: 'slider' }] }
    },
    animation: {
      type: Object,
      default: null
    },
    toolbox: {
      type: Object,
      default: null
    },
    tooltip: {
      type: Object,
      default: null
    },
    markLine: {
      type: Object,
      default: null
    },
    markPoint: {
      type: Object,
      default: null
    },
    tooltipVisible: {
      type: Boolean,
      default: true
    },
    legendVisible: {
      type: Boolean,
      default: true
    },
    brush: {
      type: Object,
      default: null
    },
    title: {
      type: Object,
      default: () => {
        return {
          textAlign: 'left',
          text: '',
          textStyle: {
            fontSize: 12,
            fontWeight: 'normal'
          }
        }
      }
    },
    isTc: {
      type: Boolean,
      default: false
    },
    chartVisualMap: {
      type: Object,
      default: null
    }
  },
  data() {
    var that = this
    this.events = {
      datazoom: function(e) {
        // that.datazoomEvent = [e.start, e.end]
        console.log('datazoom', e)
        // 直接调整x轴时候为scale（start，end为1-100的相对位置），通过缩放改变x轴的时候为value（连续型数据时startvalue为数据本身，离散型时为x的下标）
        if (e.hasOwnProperty('batch')) {
          if (e.batch[0].hasOwnProperty('startValue')) {
            that.datazoomEvent = { 'value': [e.batch[0].startValue, e.batch[0].endValue] }
          } else {
            // 增加了inside 类型的平移 dataZoomId: "series 1 0"
            that.datazoomEvent = { 'scale': [e.batch[0].start, e.batch[0].end] }
          }
        } else {
          that.datazoomEvent = { 'scale': [e.start, e.end] }
        }
        console.log(that.datazoomEvent)
      },
      brushSelected: (n) => {
        if (n.batch.length !== 0) {
          that.brushSelectedEvent = n.batch[0].selected[0].dataIndex
        }
      }
    }
    return {
      loading: true,
      ctype: false,
      type: null,
      allData: null,
      count: 0,
      colors: ['#c23531', '#2f4554', '#61a0a8', '#d48265', '#91c7ae', '#749f83', '#ca8622', '#bda29a', '#6e7074', '#546570', '#c4ccd3'],
      colors2: ['#c1232b', '#27727b', '#fcce10', '#e87c25', '#b5c334', '#fe8463', '#9bca63', '#fad860', '#f3a43b', '#60c0dd', '#d7504b', '#c6e579', '#f4e001', '#f0805a', '#26c0c0'],
      backgroundColor: '#ffffff',
      extendConfig: null,
      toolboxConfig: null,
      brushSelectedEvent: [],
      datazoomEvent: { 'scale': [0, 10] },
      xAxisDataRange: []
    }
  },
  watch: {
    '$props.chartData': {
      handler: function(newer, older) {
        if (!isEmpty(newer)) {
          this.loading = false
        }
        this.allData = cloneDeep(newer)
      },
      deep: true,
      immediate: true
    }
  },
  created() {
    const str = clone(this.$props.chartType)
    const strs = str.split('_')
    this.allData = cloneDeep(this.$props.chartData)
    strs[1] && strs[1] === 'add' ? this.setChartAdd(this.$props.chartData, strs[0]) : this.type = this.$props.chartType

    // 扩展配置
    if (this.type === 've-line') {
      // y轴预留boundaryGap：CSSAI-868
      this.toolboxConfig = cloneDeep(this.toolbox)
      if (this.toolboxConfig && this.toolboxConfig.feature && this.toolboxConfig.feature.dataZoom) {
        this.toolboxConfig.feature.dataZoom.yAxisIndex = false
      }

      this.extendConfig = Object.assign({}, this.chartExtend,
      // { yAxis: { boundaryGap: [0, '20%'] }})
        { yAxis: { max: function(value) {
          return Math.ceil(value.max * 1.2)
        } }})
    } else {
      this.toolboxConfig = this.toolbox
      this.extendConfig = this.chartExtend
    }

    // this.allData = this.$props.chartData
    // this.type = this.$props.chartType
  },
  updated() {
    this.type = this.$props.chartType
  },
  methods: {
    resizechart() {
      if (this.$refs.basechart) {
        this.$refs.basechart.resize()
      }
    },
    afterSetOption(chartObj) {
      const chartXAxisData = chartObj.getModel().getOption().xAxis[0].data
      var xmax = Math.max.apply(null, chartXAxisData)
      var xmin = Math.min.apply(null, chartXAxisData)
      this.xAxisDataRange = [xmin, xmax]
    },
    handleOutputDropdownCommand(command) {
      this.$emit('dataBaseChartExplorerOutputData', command, this.datazoomEvent, this.brushSelectedEvent, this.xAxisDataRange)
    },
    dataExplorerOutputData(type) {
      return {
        'type': type,
        'chart': {
          'chartType': this.chartType,
          'chartData': this.chartData,
          'chartSettings': this.chartSettings
        }
      }
    },
    setChartAdd(data, type) {
      this.type = type
      this.ctype = true
    }
  }
}
</script>

<style scoped>

</style>
