<!-- 适用于显示 编辑器中一个换行标签内的复杂内容-->
<template>
  <component :is="dataType" :style="block_style" :class="block_class" :contenteditable="block_contenteditable">
    <template v-for="(item, k) in showData" >
      <component :key="k" :is="item.type" :style="item.style">{{ item.text }}
        <comp-chart v-if="item.type === 'span' && item.divtype === 'chart'" :data-type="item.chartType" :chart-config-data="item.chartConfigData" :fault-config-data="faultConfigData" :chart-width="item.width" :chart-id="item.chartId"/>
        <img v-if="item.type === 'span' && item.divtype === 'img'" :src="item.src" :width="item.width" :height="item.height" crossOrigin="anonymous">
        <inline-block v-if="item.children && item.children.length !== 0" :obj="item.children" :obj-style="item.style" :fault-config-data="faultConfigData"/>
      </component>
    </template>
  </component>
</template>
<script>
import inlineBlock from './inlineBlock'
import $ from 'jquery'
import { showDateTimeByCustomFormat } from '@/utils/index'
import showChart from './showChart'
import { getModelAttrsInfoObject, getFaultAlertRuleItems, getMultiModelItemName, getAlgorithmTypeByModelAttributes, showEditorVariableValueByKey } from '@/views/report/components/editorCommonMethod.js'

export default {
  name: 'ShowCommonBlock',
  components: {
    'comp-chart': showChart,
    'inline-block': inlineBlock
  },
  props: {
    dataType: {
      type: String,
      default: null
    },
    blockData: {
      type: Array,
      default: null
    },
    blockAttributes: {
      type: Object,
      default: null
    },
    faultConfigData: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      showData: [],
      block_style: '',
      block_border: '',
      block_class: '',
      block_contenteditable: 'false'
    }
  },
  created() {
    // console.log('ShowVariable', this.blockData, this.dataType, this.blockAttributes, this.faultData)
    this.getBlockStyle()
    this.showVariable()
  },
  methods: {
    getChildren(obj_children) {
      var block_child = []
      if (!obj_children.length) {
        block_child.push(obj_children)
      } else {
        block_child = obj_children
      }
      return block_child
    },
    getBlockStyle() {
      if (!$.isEmptyObject(this.blockAttributes)) {
        if (this.blockAttributes.hasOwnProperty('style')) {
          this.block_style = this.blockAttributes['style']
        }
        if (this.blockAttributes.hasOwnProperty('border')) {
          this.block_border = this.blockAttributes['border']
        }
        if (this.blockAttributes.hasOwnProperty('class')) {
          this.block_class = this.blockAttributes['class']
        }
        if (this.blockAttributes.hasOwnProperty('contenteditable')) {
          this.block_contenteditable = this.blockAttributes['contenteditable']
        }
      }
    },
    setAxisChart(gchartAttributes, alertRuleItems, blockChildStyle, chartId, modelattrs) {
      // 轴心轨迹图需要在监控告警字段的折线图基础上，增加元数据轴心轨迹图如shangx,shangy; purified图如shangx#purified,shangy#purified
      // console.log('setAxisChart')
      // / purified数据的图
      let modeltype1 = 'model'
      if (this.faultConfigData['model'].hasOwnProperty('type')) {
        if (this.faultConfigData.model.type !== null) {
          modeltype1 = this.faultConfigData.model.type
        }
      }
      var axis_xy = []
      for (var each_column_md of alertRuleItems) {
        axis_xy = getMultiModelItemName(modelattrs, each_column_md)
      }
      axis_xy.push({ 'track_show': [8] })
      var newChart1 = {
        'style': gchartAttributes.style,
        'id': chartId + Math.floor(Math.random() * 1000),
        'class': gchartAttributes.class,
        'title': gchartAttributes.title,
        'src': gchartAttributes.src,
        'alt': 'axis_trajectory',
        'data-model': this.faultConfigData['model'].id,
        'data-model-type': modeltype1,
        'data-param': axis_xy,
        'data-parammark': gchartAttributes['data-parammark'],
        'data-charttype': 'scatter'
      }
      this.showData.push({ type: 'span', divtype: 'chart', chartType: 'scatter', chartConfigData: newChart1, style: blockChildStyle, chartId: newChart1.id })
      // 元数据的图
      var o_axis_xy = []
      for (var each_axis_xy of axis_xy) {
        if (each_axis_xy.hasOwnProperty('track_show')) {
          o_axis_xy.push(each_axis_xy)
        } else {
          o_axis_xy.push(each_axis_xy.replace('#purified', ''))
        }
      }
      var newChart2 = {
        'style': gchartAttributes.style,
        'id': chartId + Math.floor(Math.random() * 1000),
        'class': gchartAttributes.class,
        'title': gchartAttributes.title,
        'src': gchartAttributes.src,
        'alt': 'axis_trajectory',
        'data-model': this.faultConfigData['model'].id,
        'data-model-type': modeltype1,
        'data-param': o_axis_xy,
        'data-parammark': gchartAttributes['data-parammark'],
        'data-charttype': 'scatter'
      }
      this.showData.push({ type: 'span', divtype: 'chart', chartType: 'scatter', chartConfigData: newChart2, style: blockChildStyle, chartId: newChart2.id })
    },
    setSpectrumChart(gchartAttributes, alertRuleItems, blockChildStyle, chartId) {
      // 频谱图需要在监控告警字段的折线图基础上，增加监控字段fft_values值的频谱图
      console.log('setSpectrumChart')
      let modeltype2 = 'model'
      if (this.faultConfigData['model'].hasOwnProperty('type')) {
        if (this.faultConfigData.model.type !== null) {
          modeltype2 = this.faultConfigData.model.type
        }
      }
      var spectrum_y = ''
      for (var each_column_spectrum of alertRuleItems) {
        if (each_column_spectrum.indexOf('oneRatio')) {
          spectrum_y = each_column_spectrum.replace('oneRatio', 'fft_values')
        }
      }
      var newChart = {
        'style': gchartAttributes.style,
        'id': chartId + Math.floor(Math.random() * 1000),
        'class': gchartAttributes.class,
        'title': gchartAttributes.title,
        'src': gchartAttributes.src,
        'alt': 'spectrum',
        'data-model': this.faultConfigData['model'].id,
        'data-model-type': modeltype2,
        'data-param': ['freq_sequence', spectrum_y],
        'data-parammark': gchartAttributes['data-parammark'],
        'data-charttype': 'bar'
      }
      this.showData.push({ type: 'span', divtype: 'chart', chartType: 'bar', chartConfigData: newChart, style: blockChildStyle, chartId: newChart.id })
    },
    showVariable() {
      var _this = this
      $.each(this.blockData, function(key, obj) {
        var block_child_style = ''
        var chartType = ''
        var chartAttributes = null
        var chartId = 0
        if (obj.hasOwnProperty('attributes')) {
          chartAttributes = obj['attributes']
          if (chartAttributes.hasOwnProperty('style')) {
            block_child_style = chartAttributes['style']
          }
          if (chartAttributes.hasOwnProperty('data-charttype')) {
            chartType = chartAttributes['data-charttype']
          }
          if (chartAttributes.hasOwnProperty('id')) {
            chartId = Number(chartAttributes['id'])
          }
        }
        // var block_child = []
        // if (obj['children']) {
        //   if (!obj['children'].length) {
        //     block_child.push(obj['children'])
        //   } else {
        //     block_child = obj['children']
        //   }
        //   _this.nlists.push({ type: 'block', dataType: obj['type'], blockData: block, attributes: block_attributes, faultdata:fault_data })
        // }
        if (obj['type'] === 'TIME') {
          const timeFormat = obj['attributes']['data-format']
          if (obj['attributes']['data-type'] === 'faultTime') {
            var faultTime = ''
            // if (_this.faultData && _this.faultData.hasOwnProperty('content')) {
            //   faultTime = _this.faultData.content.faulted_at
            // }
            if (_this.faultConfigData.hasOwnProperty('error_time')) {
              faultTime = _this.faultConfigData['error_time']
            }
            let timeText = ''// obj.children[0]['text']
            if (faultTime !== '') {
              timeText = showDateTimeByCustomFormat(timeFormat, new Date(faultTime))
            } else {
              timeText = showDateTimeByCustomFormat(timeFormat)
            }
            _this.showData.push({ type: 'time', text: timeText })
          } else if (obj['attributes']['data-type'] === 'currentTime') {
            _this.showData.push({ type: 'time', text: showDateTimeByCustomFormat(timeFormat) })
          }
        } else if (obj['type'] === 'MARK') {
          // var mark_type = obj['attributes']['data-type']
          // var mark_value = showEditorVariableValueByKey(obj, _this.faultData)
          var mark_value = showEditorVariableValueByKey(obj, _this.faultConfigData) // **作为字符串内分行的标记，将字符串转为数组并分行显示
          var mark_value_arr = mark_value.split('**')
          for (var mark_value_path = 0; mark_value_path < mark_value_arr.length; mark_value_path++) {
            _this.showData.push({ type: 'b', text: mark_value_arr[mark_value_path] }) // 识别**作为字符串分行符
            if (mark_value_arr.length > 1) {
              _this.showData.push({ type: 'br' })
            }
          }
          // _this.showData.push({ type: 'b', text: mark_value }) // 通过函数获取变量
        } else if (obj['type'] === 'IMG') {
          // 图片和chart是可与文本进行混排的，外部标签为span（div会导致不必要的分行），结合divtype以供html识别
          _this.showData.push({ type: 'span', divtype: 'img', src: obj['attributes']['src'], width: obj['attributes']['width'], height: obj['attributes']['height'] }) // 通过函数获取变量
        } else if (obj['type'] === 'chart') {
          // 折线图对于所有类型都要画
          _this.showData.push({ type: 'span', divtype: 'chart', chartType: chartType, chartConfigData: chartAttributes, style: block_child_style, chartId: chartId })
          if (obj['attributes']['alt'] === 'adapt_fault' && JSON.stringify(_this.faultConfigData) !== '{}' && Object.prototype.hasOwnProperty.call(_this.faultConfigData, 'model')) {
            let modeltype = 'model'
            if (_this.faultConfigData.model.hasOwnProperty('type')) {
              if (_this.faultConfigData.model.type !== null) {
                modeltype = _this.faultConfigData.model.type
              }
            }
            getModelAttrsInfoObject(_this.faultConfigData['model'].id, modeltype, function(back) {
              if (back.result === 'success') {
                var getModelAttrs = back.data
                if (getModelAttrs && getModelAttrs.length !== 0) {
                  if (getModelAttrs.hasOwnProperty('influenceFields')) {
                    var modeltypebyattr = getAlgorithmTypeByModelAttributes(getModelAttrs['influenceFields'])
                    // console.log('getModelAttrs', modeltypebyattr)
                    var alertRuleItems = getFaultAlertRuleItems(_this.faultConfigData['alert_rule_info'])
                    if (modeltypebyattr.value === 'spectrum') {
                      _this.setSpectrumChart(obj['attributes'], alertRuleItems, block_child_style, chartId)
                    } else if (modeltypebyattr.value === 'axis_trajectory') {
                      _this.setAxisChart(obj['attributes'], alertRuleItems, block_child_style, chartId, getModelAttrs)
                    }
                  }
                }
              }
            })
          }
        } else {
          var li_text = ''
          var block_child = []
          if (obj['children']) {
            block_child = _this.getChildren(obj['children'])
          } else {
            li_text = obj['text']
          }
          _this.showData.push({ type: obj['type'], style: block_child_style, text: li_text, children: block_child })
          // _this.showData.push({ type: obj['type'], text: obj['text'], style: block_child_style })
        }
      })
      // console.log('sss', this.showData)
    }
  }
}
</script>

<style scoped>

</style>
