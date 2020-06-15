<template>
  <pre :style="blockAttributes.style" contenteditable="true" class="text-wrapper">
    <template v-for="(item, item_key) in showBlockData">
      <component :key="item_key" :is="item.type !== undefined ? item.type : 'span'">{{ item.text }}
        <inline-block v-if="item.children && item.children.length !== 0" :obj="item.children" :obj-style="item.style" :fault-config-data="faultConfigData"/>
      </component>
    </template>
  </pre>
</template>
<script>

import $ from 'jquery'
import inlineBlock from './inlineBlock'
import { timeToTimeRange } from '@/utils/index.js'
import { getFaultModelDatas, getFaultAlertRuleItems, showEditorVariableValueByKey } from '@/views/report/components/editorCommonMethod.js'
import { showDateTimeByCustomFormat } from '@/utils/index'

export default {
  name: 'ShowModifiableText',
  components: {
    'inline-block': inlineBlock
  },
  props: {
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
      showtext: '',
      showBlockData: [],
      columns: [],
      modeltype: 'model'
    }
  },
  created() {
    // console.log('ShowInlineBlock', this.blockData, this.faultConfigData, this.blockAttributes)
    // this.showBlockData = this.blockData
    this.showVariable()
    this.setFaultData()
  },
  methods: {
    expertFormatter(data) {
      var rulestring = []
      for (const v of Object.values(data.params)) {
        if (v.object === 'value') {
          rulestring.push(v.name)
        } else {
          rulestring.push(v.name + '=' + v.field)
        }
      }
      rulestring.push(data.function) // function也是数组格式
      return rulestring.join(',')
    },
    setFaultData() {
      // this.showBlockData = this.blockData
      if (this.blockAttributes['data-type'] === 'modifiable-text-fault-analysis' && JSON.stringify(this.faultConfigData) !== '{}') {
        // 故障分析信息
        this.columns = []
        this.columns = getFaultAlertRuleItems(this.faultConfigData.alert_rule_info)
        if (JSON.stringify(this.faultConfigData) !== '{}') {
          this.getFaultReportResult()
        }
      }
    },
    getChildren(obj_children) {
      var block_child = []
      if (!obj_children.length) {
        block_child.push(obj_children)
      } else {
        block_child = obj_children
      }
      return block_child
    },
    getFaultReportResult() {
      var _this = this
      this.modeltype = 'model'
      if (this.faultConfigData.model.hasOwnProperty('type')) {
        if (this.faultConfigData.model.type !== null) {
          this.modeltype = this.faultConfigData.model.type
        }
      }
      var postdata = {
        'columns': this.columns.join(','),
        'start_time': timeToTimeRange('second', '-', 30, this.faultConfigData['error_time']),
        'end_time': timeToTimeRange('second', '+', 30, this.faultConfigData['error_time']),
        'device_uuid': this.faultConfigData['device_uuid'],
        // 'model_id': this.faultConfigData.model.id,
        'type': this.modeltype,
        'report_type': '',
        'error_time': this.faultConfigData['error_time'],
        'num_range': 1
      }
      postdata[this.modeltype + '_id'] = this.faultConfigData.model.id
      getFaultModelDatas(postdata, function(back) {
        if (back.result === 'success') {
          var alltabledatas = back.data
          // console.log('getFaultModelDatas fault result', alltabledatas)
          // 参数监测等未指定行的表
          for (var each_getdatas of alltabledatas) {
            var param_text = ''
            param_text = _this.$t('strings.parameter') + each_getdatas['metric']
            Object.keys(each_getdatas['dps']).forEach(function(key, index) {
              if (index === 0) {
                param_text = param_text + _this.$t('strings.template.errortime_value') + each_getdatas['dps'][key] + '\n'
                var alertRuleItems = []
                if (_this.faultConfigData.alert_rule_info.conditions.length !== 0) {
                  alertRuleItems = _this.faultConfigData.alert_rule_info.conditions
                  for (var each_alert_rule of alertRuleItems) {
                    if (each_alert_rule.field === each_getdatas['metric']) {
                      param_text = param_text + _this.$t('strings.template.alarm_rule_is') + each_alert_rule.field + each_alert_rule.operator + each_alert_rule.value + '.'
                    }
                  }
                } else if (_this.faultConfigData.alert_rule_info.params.length !== 0) {
                  param_text = param_text + _this.$t('strings.template.alarm_rule_is') + _this.expertFormatter(_this.faultConfigData.alert_rule_info) + '.'
                }
              }
            })
            _this.showBlockData.push({ 'type': 'span', 'text': param_text })
          }
        }
      })
    },
    showVariable() {
      var _this = this
      $.each(this.blockData, function(key, obj) {
        var block_child_style = ''
        var chartAttributes = null
        if (obj.hasOwnProperty('attributes')) {
          chartAttributes = obj['attributes']
          if (chartAttributes.hasOwnProperty('style')) {
            block_child_style = chartAttributes['style']
          }
        }
        if (obj['type'] === 'TIME') {
          const timeFormat = obj['attributes']['data-format']
          if (obj['attributes']['data-type'] === 'faultTime') {
            var faultTime = ''
            if (_this.faultConfigData.hasOwnProperty('error_time')) {
              faultTime = _this.faultConfigData['error_time']
            }
            let timeText = ''// obj.children[0]['text']
            if (faultTime !== '') {
              timeText = showDateTimeByCustomFormat(timeFormat, new Date(faultTime))
            } else {
              timeText = showDateTimeByCustomFormat(timeFormat)
            }
            _this.showBlockData.push({ type: 'time', text: timeText })
          } else if (obj['attributes']['data-type'] === 'currentTime') {
            _this.showBlockData.push({ type: 'time', text: showDateTimeByCustomFormat(timeFormat) })
          }
        } else if (obj['type'] === 'MARK') {
          var mark_value = showEditorVariableValueByKey(obj, _this.faultConfigData) // **作为字符串内分行的标记，将字符串转为数组并分行显示
          var mark_value_arr = mark_value.split('**')
          for (var mark_value_path = 0; mark_value_path < mark_value_arr.length; mark_value_path++) {
            _this.showBlockData.push({ type: 'b', text: mark_value_arr[mark_value_path] }) // 识别**作为字符串分行符
          }
        } else {
          var li_text = ''
          var block_child = []
          if (obj['children']) {
            block_child = _this.getChildren(obj['children'])
          } else {
            li_text = obj['text']
          }
          _this.showBlockData.push({ type: obj['type'], style: block_child_style, text: li_text, children: block_child })
        }
      })
      // console.log('ShowInlineBlock', _this.showBlockData)
    }
  }
}
</script>

<style scoped>
.text-wrapper {
  white-space: pre-wrap;
}

</style>
