<template>
  <div>
    <vertical-buttons :cfg-btns="cfgSnoopingGroup" @itemClick="transferChartType"/>
    <div class="snooping">
      <div class="snooping-charttype">
        <el-date-picker
          v-if="explorerType === 'periodMonitorRun'"
          v-model="periodicTimeRange"
          :picker-options="pickerPeriodMonitorDateOptions"
          :clearable="false"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="yyyy-MM-dd HH:mm"
          value-format="yyyy-MM-dd HH:mm"/>
        <el-select v-if="reuseNodeDataKey !== null" v-model="reuseSelectedNodeDataKey" multiple placeholder="选择组" style="width: 100%;margin-right: 10px;">
          <el-option
            v-for="reuseNodeDataKeyItem in reuseNodeDataKey"
            :key="reuseNodeDataKeyItem"
            :label="reuseNodeDataKeyItem"
            :value="reuseNodeDataKeyItem"
            auto-complete="on"/>
        </el-select>
        <el-select v-model="cascadeIndex" :placeholder="chartPlaceholder" style="width: 10%;margin-right: 10px;" @change="cascadeIndexChange">
          <el-option
            v-for="(rt,ri) in cascadeDataWithZName"
            :key="ri"
            :label="rt.arg_zname"
            :value="ri"
            auto-complete="on"/>
        </el-select>
        <Cascade v-if="cascadeIndexData" ref="cascadeParams" :data="cascadeIndexData" class="snooping-cascade" @updateComp="updateCascade"/>
        <el-button :disabled="addButtonDisabled" :title="$t('buttons.flow.add_chart')" :type="addButtonDisabled?'default':'primary'" :loading="cascadeLoading" icon="el-icon-plus" size="small" @click="addCascade">{{ $t('buttons.flow.add_chart') }}</el-button>
        <el-button :disabled="saveButtonDisabled" :type="saveButtonDisabled?'default':'primary'" :loading="cascadeLoading" icon="el-icon-check" size="small" @click="drawSaveCascade">{{ $t('buttons.save') }}</el-button>
      </div>
      <div :style="'border-top: 1px solid #ddd;padding-top: 10px;overflow: scroll;height:'+ cascheight">
        <div
          v-base-drag="!!chart.isfullsize"
          v-for="(chart,ic) in cascadeChartData"
          :key="ic"
          :class="{'snoop-chart-item': true, fullsized: chart.isfullsize}"
          data-origpaddingtop="8">
          <el-dropdown v-show="explorerType === 'modelFlow' && chart.preheader && !chart.isfullsize" trigger="click" @command="handleOutputDropdownCommand" >
            <el-button class="moreOperatorButton">{{ $t('strings.dataoutput.dataOutput') }}</el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item :command="dataExplorerOutputData('toHistory', chart)">{{ $t('strings.dataoutput.toHistory') }}</el-dropdown-item>
              <el-dropdown-item :command="dataExplorerOutputData('toCSV', chart)">{{ $t('strings.dataoutput.toLocal') }}</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <div v-if="chart.tabledata" :style="'height: '+commentHeight+';position: relative;'">
            <object-view :show-data="chart.tabledata" width="100%" />
          </div>
          <box-plot v-else-if="chart.boxdata" :box-data="chart.boxdata" :id="'boxplotde'+ic" height="calc(100% - 20px)" width="100%" />
          <heatmap v-else-if="chart.heatdata" :box-data="chart.heatdata" :id="'heatmapde'+ic" height="100%" width="100%" />
          <matrix-view v-else-if="chart.matrix" :prex="chart.prex" :is-concat="chart.isConcat" :table-data="chart.matrix" height="100%" />
          <base-el-table v-else-if="chart.elheader" :header-data="chart.elheader" :table-data="chart.eltabledata" :table-title="chart.eltabletitle" height="100%" />
          <preview-table v-else-if="chart.preheader" :fileup-end-data="chart.preview" :table-header="chart.preheader" :c="chart.c" :r="chart.r" height="100%" width="100%" />
          <multiple-scatter-plot
            v-else-if="chart.multiScatter"
            :chart-data="chart.multiScatter"
            :chart-type="chart.chartType"
            :tool-box="chart.toolBox"
            :x-name="chart.xName"
            :sub-title="chart.subTitle"
            :ids="chart.len"
            :id="ic"
            :time="chart.time"
            mheight="100%"
            mwidth="100%"
            @callback="multiScattercallback"/>
          <arima-chart v-else-if="chart.arimadata" :arima-data="chart.arimadata" :name="chart.name" :chart-type="chart.chartType" :id="'arimade'+ic" height="calc(100% - 20px)" width="100%" />
          <scatter3-d-chart v-else-if="chart.scatter3D" :scatter3d="chart.scatter3D" :name="chart.name" :id="'scatter3Dde'+ic" :chart-visual-map="chart.chartVisualMap" height="calc(100% - 20px)" width="100%" />
          <el-card v-else-if="chart.chartType === 'card'" style="height:100%" shadow="hover" v-html="chart.innerHtml" />
          <statics-info v-else-if="chart.staticsInfo" :chart="chart.staticsInfo" :toolbox="chart.toolbox?chart.toolbox:toolbox" height="100%" />
          <base-charts
            v-else
            :ref="'chartItem_'+ ic"
            :chart-type="chart.chartType"
            :chart-data="chart.chartData"
            :chart-settings="chart.chartSettings"
            :chart-data-zoom="chart.chartDataZoom"
            :mark-line="chart.markLine"
            :toolbox="chart.toolbox?chart.toolbox:toolbox"
            :chart-extend="chart.chartExtend"
            :axis="chart.axis"
            :brush="chart.chartBrush"
            :is-tc="explorerType === 'modelFlow' ? true : false"
            :chart-visual-map="chart.chartVisualMap"
            height="calc(100% - 40px)"
            width="100%"
            @dataBaseChartExplorerOutputData="getDataBaseChartExplorerOutputData"/>
          <!-- is-tc是否为数据探查图表标记位，探查图表才有“导出”功能 -->
          <i :title="$t('buttons.flow.delete_chart')" class="el-icon-close chart-item-close" @click="deleteCass(ic)"/>
          <i :title="$t('buttons.flow.full_size')" :class="{ 'chart-item-fullsize':true, 'el-icon-full-screen': !chart.isfullsize,'el-icon-copy-document':chart.isfullsize}" @click="fullsize(ic)"/>
        </div>
        <div v-loading="cascadeLoading" style="display: inline-block;position: relative;width: 49%;">
          <div :style="'width:100%;height: ' + commentHeight" />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import ChartCommon from './mixin/chartcommon'
import Cascade from '@/components/ModelFlow/components/options/ParamCascade'
import BaseCharts from '@/components/Charts/BaseCharts' // 基础图表组件
import ObjectView from '@/components/Table/ObjectView'
import BoxPlot from '@/components/Charts/BoxPlot'
import Heatmap from '@/components/Charts/Heatmap'
import MultipleScatterPlot from '@/components/Charts/MultipleScatterPlot'
import PreviewTable from '@/components/Table/PreviewTable'
import BaseElTable from '@/components/Table/BaseElTable'
import MatrixView from '@/components/Table/MatrixView'
import ArimaChart from '@/components/Charts/ArimaChart'
import Scatter3DChart from '@/components/Charts/Scatter3DChart'
import StaticsInfo from '@/components/Charts/StaticsInfo'
import VerticalButtons from '@/components/VButtons'
import _ from 'lodash'
export default {
  name: 'DataExplorer',
  components: { Cascade, BaseCharts, ObjectView, BoxPlot, Heatmap, PreviewTable, BaseElTable,
    MatrixView, MultipleScatterPlot, ArimaChart, Scatter3DChart, StaticsInfo, VerticalButtons },
  extends: ChartCommon,
  props: {
    // 组件传入属性规则设定
    nodeId: {
      type: String,
      default: ''
    },
    // datakey 在数据分割成多个数据集时需要传入,单个数据集时不需要传入
    dataKey: {
      type: String,
      default: undefined
    },
    explorerType: { // 数据探查类型，modelFlow数据实验；periodMonitorRun周期任务的运行记录数据监测
      type: String,
      default: 'modelFlow'
    },
    streamingId: {
      type: Number,
      default: 0
    },
    periodicDatasourceId: {
      type: Number,
      default: 0
    },
    runId: {
      type: Number,
      default: 0
    },
    periodicDataStartedAt: {
      type: String,
      default: ''
    },
    periodicDataEndedAt: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      newPeriodicDataStartedAt: this.periodicDataStartedAt,
      newPeriodicDataEndedAt: this.periodicDataEndedAt,
      // pickerPeriodMonitorDateOptions:{}
      // periodicTimeRange: [this.periodicDataStartedAt, this.periodicDataEndedAt],
      pickerPeriodMonitorDateOptions: {
        disabledDate: (time) => {
          if (new Date(this.periodicDataStartedAt) <= new Date(this.periodicDataEndedAt)) {
            // 周期流started-at和ended-at范围内的时间为可选时间段，超出范围设定为不可选择
            return (time < new Date(this.periodicDataStartedAt) || time > new Date(this.periodicDataEndedAt))
          }
        }
      },
      fullsizedItem: null,
      commentHeight: (window.innerHeight * 0.5 < 500 ? 500 : window.innerHeight * 0.5) + 'px', // 数据可视化图表统一高度 最小高度400px
      chartPlaceholder: this.$t('strings.flow.select_chart_type'),
      saveButtonDisabled: false,
      chartBrush: null
    }
  },
  computed: {
    addButtonDisabled() {
      if (this.cascadeIndex === null || this.cascadeIndex === '' || !this.updatecas) {
        return true
      } else {
        // 参数都填写，添加按钮方可变为可点击状态
        let paramsnull = false
        const chartType = this.cascadeData[Object.keys(this.transferChart)[0]].arg_range[this.cascadeIndex].arg_name
        this.updatecas.some(item => {
          if (_.isEmpty(item.arg_value) && !_.isNumber(item.arg_value)) {
            if (chartType === 'scatter') {
              if (item.arg_name === 'x' || item.arg_name === 'y') {
                paramsnull = true
              }
            } else if (chartType === 'line') {
              if (item.arg_name === 'y') { paramsnull = true }
            } else if (chartType === 'sequence_stat') {
              if (item.arg_name !== 'timecol') { paramsnull = true }
            } else if (chartType === 'staticsInfo') {
              if (item.arg_name !== 'bin') { paramsnull = true }
            } else if (chartType === 'distribution_test') {
              if (item.arg_name === 'statistical_columns') { paramsnull = true }
            } else {
              paramsnull = true
            }
          }
        })
        if (paramsnull) {
          return true
        } else {
          return false
        }
      }
    },
    // saveButtonDisabled() {
    //   // 至少建立一个图表，保存按钮方可变为可点击状态
    //   if (this.cascadeChartData.length === 0) {
    //     return true
    //   }
    //   return false
    // }
    periodicTimeRange: {
      get: function() {
        return [this.newPeriodicDataStartedAt, this.newPeriodicDataEndedAt]
      },
      set: function(newValue) {
        if (newValue) {
          [this.newPeriodicDataStartedAt, this.newPeriodicDataEndedAt] = newValue
        }
      }
    }
  },
  watch: {
    '$props.nodeId': {
      handler: function(newer, older) {
        this.cascadeIndexId = newer
      },
      immediate: true
    },
    '$props.periodicDataStartedAt': {
      handler: function(newer, older) {
        this.newPeriodicDataStartedAt = newer
      },
      immediate: true,
      deep: true
    },
    '$props.periodicDataEndedAt': {
      handler: function(newer, older) {
        this.newPeriodicDataEndedAt = newer
      },
      immediate: true,
      deep: true
    }
  },
  mounted() {
    this.cfgSnoopingGroup = [
      { key: '0', type: 'primary', label: this.$t('buttons.flow.select_chart') },
      { key: '1', type: 'normal', label: this.$t('buttons.flow.select_func') }]

    this.cascheight = (window.innerHeight - 220) + 'px'
  },
  methods: {
    transferChartType(type) {
      this.transferChart = {}
      this.transferChart[type] = 'primary'
      this.cascadeIndex = null
      if (type === '0') {
        this.chartPlaceholder = this.$t('strings.flow.select_chart_type')
      } else {
        this.chartPlaceholder = this.$t('strings.flow.select_chart_type2')
      }
    }
  }
}
</script>
<style  rel="stylesheet/scss" lang="scss" scoped>
  $pgBorder:#e4e7ed;
  .matrix{
    display: inline-block;
    width: 100%;
    max-height: 500px;
    overflow: auto;
    p{
      white-space: nowrap;
      &:first-child span{
        border-bottom: 1px solid $pgBorder;
      }
      margin: 0;
    }
    span{
      background-color: #bbb;
      &:first-child{
        border-right: 1px solid $pgBorder;
      }
      padding:20px 10px;
      min-width: 13%;
      display: inline-block;
      text-align: center;
    }
  }
  </style>
  <style  rel="stylesheet/scss" lang="scss" >
  $elementGap:24px;
  $boxLeft:48px;
  .modelflow-datasnooping{
    .el-dialog{
      margin-top:6vh !important;
      width: 94%;
      height: 90vh;
      overflow:hidden!important;
      border-radius:16px;
      border-left:5px solid #3d65c9;
      .el-dialog__header{
        padding: $elementGap $elementGap 0 $boxLeft*1.5;
      }
      .el-dialog__body{
        padding: $elementGap 0 $boxLeft;

        .vertical-button-group{
          position: absolute;
          top: 60px;
          left: 0;
          z-index: 1;
        }
        .snooping{
          margin-left: $boxLeft*1.5;
          .snooping-charttype{
            margin-bottom: $elementGap;
            button.el-button--small{
              vertical-align: middle;
              font-size: 14px;
            }
            .snooping-cascade{
              display:inline-block;
              vertical-align: middle;
              margin:0 1em;
              button.el-button--mini{
              vertical-align: middle;
              font-size: 12px;
            }
            }
          }
          .snoop-chart-item {
            float: left;
            position: relative;
            width: 49%;
            padding: 8px;
            box-sizing: border-box;
            height: 580px;
            margin-bottom: 20px;
            overflow: hidden;
            // transition: width,height .5s linear;
            // -webkit-transition: width,height .5s linear;
            .chart-item-close{
              position: absolute;
              right: 6px;
              top:6px;
              color: rgb(144, 147, 153);
              cursor:pointer;
              &:hover{
                color:#ff0000
              }
            }
            .chart-item-fullsize{
              position: absolute;
              right: 30px;
              top:6px;
              color: rgb(144, 147, 153);
              cursor:pointer;
              &:hover{
                color: #0f32b5;
              }
            }
            &.fullsized {
              width: 1200px;
              height: 900px;
              position:fixed;
              margin:auto;
              top: 0;
              left: 0;
              right:0;
              bottom: 0;
              float:none;
              border-top: 1px solid #ccc;
              border-radius:16px;
              background: #fff;
              z-index: 2003;
              box-shadow: 0 0 6px #ccc;
              .chart-item-close{
                display: none;
              }
              .chart-item-fullsize{
                right: 12px;
              }
            }
            &:hover {
              overflow: overlay;
            }
          }
        }
        .moreOperatorButton {
          width: 128px;
          margin-bottom: 2px;
          border-radius: 12px;
          border: 1px solid #0f32b5;
          color: #0f32b5;
          text-align: center;
          background-color: #f4f7fa;
          &:hover {
            background-color: #f4f7fa;
          }
          &:active {
            background-color: #f4f7fa;
          }
        }
        .moreOperatorButtonDisabled {
          width: 128px;
          margin-bottom: 2px;
          border-radius: 12px;
          color: #999999;
          border: 1px solid #b7b7b7;
          text-align: center;
          background-color: #fff;
          &:hover {
            border-color: #b7b7b7;
            background-color: #fff;
            color: #999999;
          }
          &:active {
            border-color: #b7b7b7;
            background-color: #fff;
            color: #999999;
          }
        }
      }
    }
  }
</style>
