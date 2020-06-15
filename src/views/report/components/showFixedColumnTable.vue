<!-- 适用于 固定 列 的表格，接受的传参包括: 表格列数据，（模型id， 故障相关信息）以API请求方式获得表格显示的行数据；行数目 -->
<template>
  <span>
    <p style="text-align: center;"><strong>{{ tabletitle }}</strong></p>
    <el-table :data="tableDataConfig" :style="tablestyle" :row-class-name="tableRowClassName" :empty-text="emptyText" size="smaill">
      <el-table-column v-for="(item, k) in tablehead" :key="k" :label="item.label" :prop="item.name"/>
    </el-table>
  </span>
</template>
<style>
  .el-table .warning-row {
    background: oldlace;
  }
</style>
<script>
import { getFaultModelDatas, getMonthReportDatas, getDatasetValue, getAtlasValueString, getFaultAlertRuleItems, getModelAttrsInfoObject, getMultiModelItemName, getThresholdValue, showStateString, getAlgorithmTypeByModelAttributes } from '@/views/report/components/editorCommonMethod.js'
import { timeToTimestamp, timeToTimeRange, timestampToBasicFormatTime } from '@/utils/index.js'
import { faultSearch } from '@/api/device/fault'
export default {
  name: 'ShowFixedColumnTable',
  props: {
    tableAttributes: {
      type: Object,
      default: null
    },
    reportType: {
      type: String,
      default: ''
    },
    faultConfigData: {
      type: Object,
      default: null
    },
    tgroupData: {
      type: Array,
      default: null
    }
  },
  data() {
    return {
      tableData: [],
      tableDataConfig: [],
      columns: [], // 变量参数
      columns_obj: [],
      modelid: '',
      modeltype: 'model',
      tabletype: '',
      tablestyle: '',
      highlightRowIndex: null,
      highlight: null,
      emptyText: this.$t('labels.not_available'),
      start_time: '',
      end_time: '',
      tablehead: {},
      tabletitle: '',
      rated: '', // 额定功率
      unit: '', // 额定功率单位
      getModelAttrs: {},
      runreport_faults: [],
      currentFaultErrorTime: '',
      currentFaultAlert: null,
      currentFaultModel: null,
      currentFaultConfigData: {}
    }
  },
  watch: {
    highlight(val) {
      this.highlightRowIndex = this.highlight
    }
  },
  created() {
    // console.log('table created', this.tableAttributes, this.faultConfigData, this.tgroupData)
    this.currentFaultConfigData = this.faultConfigData
    this.getTableData()
  },
  methods: {
    tableRowClassName({ row, rowIndex }) {
      if (rowIndex === this.highlightRowIndex) {
        return 'warning-row'
      }
      return ''
    },
    tableHeadNameToValue(name) {
      var returnname = ''
      for (const each_column_obj of this.columns_obj) {
        if (each_column_obj.label === name) {
          returnname = each_column_obj.name
        }
      }
      return returnname
    },
    commonFormatter(row) {
      var rulestring = []
      for (const v of Object.values(row.conditions)) {
        rulestring.push(v.field + ' ' + v.operator + ' ' + v.value)
      }
      return rulestring.join(',')
    },
    expertFormatter(row) {
      var rulestring = []
      for (const v of Object.values(row.params)) {
        if (v.object === 'value') {
          rulestring.push(v.name)
        } else {
          rulestring.push(v.name + '=' + v.field)
        }
      }
      rulestring.push(row.function)
      return rulestring.join(',')
    },
    setupSingleFaultReportTable(cFaultErrorTime, cAlertRule, cModel) {
      this.emptyText = this.$t('labels.loading')
      var _this = this
      if (this.tableAttributes['data-tabletype'] === 'adapt_fault') {
        // var _this = this
        this.tabletitle = this.$t('strings.template.custom_fault_table')
        // DONE: 自定义故障表格，多个表头的配置信息都在data-tablehead中, 根据故障，判断使用哪种表格，在此处重新组织新的表头
        // DONE：需要在此处组织新的columns(data-param),数据来源是告警规则监控的参数
        // DONE: 需要在此处重新获取modelid, deviceid, 均来源于故障信息
        // TODO: 区分月报，月报如何参与自适应表格
        this.tabletitle = this.$t('errors.unknown_type_fault')
        this.modeltype = 'model' // 就模型只有单模型，默认为model。新模型分为pipeline和model，在type中区分
        if (cModel.hasOwnProperty('type')) {
          if (cModel.type !== null) {
            this.modeltype = cModel.type
          }
        }
        getModelAttrsInfoObject(cModel.id, this.modeltype, function(back) {
          if (back.result === 'success') {
            _this.modelid = cModel.id
            _this.getModelAttrs = back.data
            if (_this.getModelAttrs && _this.getModelAttrs.length !== 0) {
              if (_this.getModelAttrs.hasOwnProperty('influenceFields')) {
                // var modeltypebyattr = getAlgorithmTypeByModelAttributes(Object.keys(_this.getModelAttrs['influenceFields'])[0])
                var modeltypebyattr = getAlgorithmTypeByModelAttributes(_this.getModelAttrs['influenceFields'])
                // faultModelType = { 'name': modeltypebyattr.value, 'value': Object.values(this.getModelAttrs['influenceFields'])[0] }
                // this.modelAttributes['modeltype'] = faultModelType
                _this.tabletype = modeltypebyattr.value
                // if (this.reportType === 'runreport') {
                //   this.tabletitle = '自适应故障汇总表'
                //   this.tablehead = [{ 'name': 'model_name', 'label': '模型名称' }, { 'name': 'variable', 'label': '变量名称' }, { 'name': 'result_value', 'label': '实测值' }, { 'name': 'result_time', 'label': '故障时间' }]
                // } else {
                // _this.tabletitle = cModel.name + this.$t('strings.template.model') + this.$t('strings.template.fault_table')
                _this.tabletitle = `${cModel.name}${_this.$t('strings.template.model')}${_this.$t('strings.template.fault_table')}`
                for (var each_type_tablehead_config in _this.tableAttributes['data-tablehead']) {
                  if (each_type_tablehead_config === 'adapt_column_' + _this.tabletype) {
                    _this.tablehead = _this.tableAttributes['data-tablehead'][each_type_tablehead_config]
                  }
                }
                _this.columns = []
                _this.columns = getFaultAlertRuleItems(cAlertRule)
                _this.setupTableByData(cFaultErrorTime, cModel)
              }
            }
          }
        })
      } else {
        this.tabletype = this.tableAttributes['data-tabletype']
        this.modelid = this.tableAttributes['data-model']
        this.modeltype = this.tableAttributes['data-model-type']
        this.tablehead = this.tableAttributes['data-tablehead']
        this.columns = this.tableAttributes['data-param']
        this.columns_obj = this.tableAttributes['data-param-obj']
        // tgroupdata是模板中table的json定义，包含caption，thead, tbody,将表格结构，已有数据先显示解析并显示出出来
        getModelAttrsInfoObject(this.modelid, this.modeltype, function(back) {
          if (back.result === 'success') {
            if (back.data) {
              _this.getModelAttrs = back.data
            }
          }
        })
        this.getTableDataConfig() // _this.getModelAttrs不是必须的，可以不再getModelAttrsInfoObject内执行
        this.setupTableByData(cFaultErrorTime, cModel)
      }
    },
    getTableDataConfig() {
      if (this.tgroupData !== null) {
        for (const group of this.tgroupData) {
          if (group.type === 'CAPTION') {
            this.tabletitle = group.text
          } else if (group.type === 'TBODY') {
            for (const group_tr of group.children) {
              if (group_tr.type === 'TR') {
                var newTableDataRow = {}
                for (const group_tr_td of group_tr.children) {
                  if (group_tr_td.type === 'TD') {
                    var cell_text = ''
                    for (const group_tr_td_item of group_tr_td.children) {
                      cell_text = cell_text + group_tr_td_item.text
                    }
                    newTableDataRow[group_tr_td.attributes.scope] = cell_text
                  }
                }
                // console.log('newTableDataRow', newTableDataRow)
                this.tableDataConfig.push(newTableDataRow)
              }
            }
          }
        }
      }
    },
    getTableData() {
      var _this = this
      if (this.tableAttributes.hasOwnProperty('style')) {
        this.tablestyle = this.tableAttributes['style']
        this.tablestyle += 'height:auto;'
      }
      this.rated = this.tableAttributes['data-rated']
      this.unit = this.tableAttributes['data-unit']

      // 区分faultreport/runreport
      // var runreport_tabletype = ['burden', 'fdl_sum', 'faultcollect']
      var faultreport_tabletype = ['parameter', 'personalized_threshold', 'spectrum', 'faultcollect', 'mahalanobis_distance', 'isolation_forest', 'adapt_fault']
      if (JSON.stringify(this.currentFaultConfigData) !== '{}') {
        if (this.reportType === 'runreport') {
          // 运行报告
          console.log('runreport')
          this.start_time = this.currentFaultConfigData['start_time']
          this.end_time = this.currentFaultConfigData['end_time']
          if (this.tableAttributes['data-tabletype'] === 'fdl_sum' || this.tableAttributes['data-tabletype'] === 'burden') {
            // 发电量,负荷分布需要不同的接口，其他类别将每条故障数据组织为faultconfigdata, 循环请求数据，生成表格
            this.tabletype = this.tableAttributes['data-tabletype']
            this.modelid = this.tableAttributes['data-model']
            this.modeltype = this.tableAttributes['data-model-type']
            this.tablehead = this.tableAttributes['data-tablehead']
            this.columns = this.tableAttributes['data-param']
            this.columns_obj = this.tableAttributes['data-param-obj']
            // 需要接口请求数据的表格类型
            var runreport_postdata = {
              'start_time': this.start_time,
              'end_time': this.end_time,
              // 'device_uuid': this.configData['device_uuid'], // 月报设备
              'report_type': this.tableAttributes['data-tabletype']
            }
            if (this.rated !== '') {
              runreport_postdata['rated'] = this.rated
            }
            if (this.unit !== '') {
              runreport_postdata['unit'] = this.unit
            }
            if (this.tableAttributes['data-tabletype'] === 'fdl_sum') {
              runreport_postdata['device_uuids'] = this.tableAttributes['data-device'].join(',')
            } else {
              runreport_postdata['device_uuids'] = this.currentFaultConfigData['device_uuid'] // TODO: 月报设备可多选
            }
            this.getTableDataConfig()
            // console.log('runreport_postdata', runreport_postdata)
            getMonthReportDatas(runreport_postdata, function(responseData) {
              // console.log('getMonthReportDatas', responseData, _this.tableAttributes['data-tabletype'], _this.tableAttributes['data-tablehead'])
              if (_this.tableAttributes['data-tabletype'] === 'burden') {
                // 负荷信息统计表
                for (const each_responsedata_burden of responseData) {
                  Object.keys(each_responsedata_burden['dps']).forEach(function(key, index) {
                    var each_burden_obj = {}
                    for (const each_tablehead_column of _this.tableAttributes['data-tablehead']) {
                      // console.log('getMonthReportDatas responseData', key, each_responsedata_burden['dps'][key], each_tablehead_column.name)
                      if (each_tablehead_column.name === 'key') {
                        each_burden_obj[each_tablehead_column.name] = key
                      } else {
                        each_burden_obj[each_tablehead_column.name] = each_responsedata_burden['dps'][key][each_tablehead_column.name]
                      }
                    }
                    _this.tableDataConfig.push(each_burden_obj)
                  })
                }
                // console.log('eeeee', _this.tableDataConfig)
              } else {
                // 发电量统计表
                for (const each_responsedata of responseData) {
                  for (const each_tablehead_column of _this.tableAttributes['data-tablehead']) {
                    // console.log('getMonthReportDatas responseData fdl', each_responsedata, each_tablehead_column)
                    for (var each_table_row = 0; each_table_row < _this.tableDataConfig.length; each_table_row++) {
                      if (_this.tableDataConfig[each_table_row]['device'] === each_responsedata['metric']) {
                        Object.keys(each_responsedata['dps']).forEach(function(key, index) {
                          if (index === 0) { // 一个变量参数只获取一个数据解析并展示
                            if (each_tablehead_column.name === key) {
                              _this.tableDataConfig[each_table_row][key] = each_responsedata['dps'][key]
                            }
                          }
                        })
                      }
                    }
                  }
                }
              }
            })
          } else if (this.tableAttributes['data-tabletype'] === 'faultcollect') {
            const fault_search_str = '?resolve=all' + '&fault_device=' + this.currentFaultConfigData['device_uuid'] + '&fault_at_begin=' + this.start_time + '&fault_at_end=' + this.end_time
            faultSearch(fault_search_str).then(res => {
              this.runreport_faults = res.data.data
              // console.log('getfaultdata list', this.runreport_faults)
              // 故障信息汇总表
              // TODO: 其他类型表格的月报如何组织？
              for (const each_faultdata1 of this.runreport_faults) {
                var show_alertrule_string = ''
                if (each_faultdata1.content.alert_rule.conditions.length !== 0) {
                  show_alertrule_string = this.commonFormatter(each_faultdata1.content.alert_rule)
                } else if (each_faultdata1.content.alert_rule.params.length !== 0) {
                  show_alertrule_string = this.expertFormatter(each_faultdata1.content.alert_rule)
                }
                this.currentFaultErrorTime = each_faultdata1.content.generated_at
                this.currentFaultModel = each_faultdata1.content.model
                this.currentFaultAlert = each_faultdata1.content.alert_rule
                this.currentFaultConfigData = {
                  'error_time': each_faultdata1.content.generated_at,
                  'device_uuid': each_faultdata1.content.device.name,
                  'model': each_faultdata1.content.model,
                  'alert_rule': each_faultdata1.content.alert_rule.name + '(' + show_alertrule_string + ')',
                  'state': showStateString(each_faultdata1.content.state),
                  'alert_rule_info': each_faultdata1.content.alert_rule
                }
                this.setupSingleFaultReportTable(this.currentFaultErrorTime, this.currentFaultAlert, this.currentFaultModel)
              }
            }).catch((error) => {
              this.emptyText = this.$t('errors.get_faild')
              console.log('faultsearch', error)
            })
          }
        } else if (this.reportType === 'faultreport') {
          // 故障报告
          // console.log('faultreport', this.currentFaultConfigData['alert_rule_info'])
          if (faultreport_tabletype.indexOf(this.tableAttributes['data-tabletype']) !== -1) {
            this.currentFaultErrorTime = this.currentFaultConfigData['error_time']
            this.currentFaultAlert = this.currentFaultConfigData['alert_rule_info']
            this.currentFaultModel = this.currentFaultConfigData['model']
            this.setupSingleFaultReportTable(this.currentFaultErrorTime, this.currentFaultAlert, this.currentFaultModel)
          } else {
            this.tabletitle = this.$t('strings.template.not_fault_table')
          }
        }
      }
    },
    setupTableByData(cFaultErrorTime, cModel) {
      // currentFaultErrorTime 为 this.faultConfigData['error_time'] 故障发生时间
      var _this = this
      // 故障报告
      if (this.tabletype === 'parameter') {
        // 参数监测仅在故障报告中有返回值, 开始结束时间安装表格设置中data-timerange指定在故障时间点的上下N分钟，计算得出
        this.start_time = timeToTimeRange('minute', '-', Number(this.tableAttributes['data-timerange']), cFaultErrorTime)
        this.end_time = timeToTimeRange('minute', '+', Number(this.tableAttributes['data-timerange']), cFaultErrorTime)
      } else {
        // 故障报告中的个性化阈值表，频谱表等，开始结束时间设置为故障时间点前后30秒，因故障时间点与实时流数据存储存在一定时间差
        this.start_time = timeToTimeRange('second', '-', 30, cFaultErrorTime)
        this.end_time = timeToTimeRange('second', '+', 30, cFaultErrorTime)
      }
      // 故障信息汇总表
      if (this.tabletype === 'faultcollect') {
        var faultcollect_obj = {}
        for (const each_tablehead_column of this.tablehead) {
          if (each_tablehead_column.name === 'model_name') {
            faultcollect_obj[each_tablehead_column.name] = this.currentFaultConfigData.model.name
          } else {
            faultcollect_obj[each_tablehead_column.name] = this.currentFaultConfigData[each_tablehead_column.name]
          }
        }
        this.tableDataConfig.push(faultcollect_obj)
      } else {
        var postdata = {
          'columns': this.columns.join(','),
          'start_time': this.start_time,
          'end_time': this.end_time,
          'device_uuid': this.currentFaultConfigData['device_uuid'],
          // 'model_id': this.modelid,
          'type': this.modeltype,
          'report_type': this.tabletype,
          'error_time': cFaultErrorTime
        }
        postdata[this.modeltype + '_id'] = this.modelid // model_id or pipeline_id, 根据type区别传参
        if (this.tabletype === 'parameter') {
          postdata['num_range'] = Number(this.tableAttributes['data-recordcount'])
        } else {
          postdata['num_range'] = 1
        }
        // console.log('postdata', postdata)
        getFaultModelDatas(postdata, function(back) {
          if (back.result === 'success') {
            _this.emptyText = ''
            var alltabledatas = back.data
            // console.log('getFaultModelDatas', alltabledatas, _this.tablehead)
            if (_this.tableAttributes['data-tabletype'] === 'adapt_fault') {
              let datasetid = null
              getDatasetValue(_this.modeltype, _this.modelid, function(back) {
                if (back.result === 'success') {
                  datasetid = back.data
                }
              })
              for (var each_getdatas1 of alltabledatas) {
                setTimeout(function() {
                  var newObj1 = {}
                  for (var each_tablehead1 of _this.tablehead) {
                    var tableheadtype = each_tablehead1.name.split('#')[0]
                    var tableheadname = each_tablehead1.name.split('#')[1]
                    Object.keys(each_getdatas1['dps']).forEach(function(key, index) {
                      if (index === 0) {
                        if (tableheadname === 'result_value') { // 报告模板表格arg_name=result_value的均为获取结果数值
                          newObj1[tableheadtype + '#result_value'] = each_getdatas1['dps'][key].toString()
                        } else if (tableheadname === 'result_time') {
                          newObj1[tableheadtype + '#result_time'] = timestampToBasicFormatTime(key)
                        }
                      }
                    })
                    if (tableheadname === 'model_name') {
                      newObj1['model_name'] = cModel.name
                    }
                    if (tableheadname === 'variable') {
                      var multiItemName = getMultiModelItemName(_this.getModelAttrs, each_getdatas1['metric'])
                      if (multiItemName !== '') {
                        multiItemName = `( ${multiItemName} )`
                      }
                      newObj1[tableheadtype + '#variable'] = each_getdatas1['metric'] + multiItemName
                    } else if (tableheadname === 'threshold_yz') {
                    // DONE: 采用公共函数实现获取阈值
                      newObj1[tableheadtype + '#threshold_yz'] = getThresholdValue(_this.getModelAttrs, each_getdatas1['metric'])
                    } else if (tableheadname === 'threshold_bz') {
                    // 标准阈值 TODO: 获取顺序
                      getAtlasValueString(each_getdatas1['metric'], datasetid, function(back) {
                        if (back.result === 'success') {
                          newObj1[tableheadtype + '#threshold_bz'] = back.data
                        }
                      })
                    }
                  }
                  setTimeout(function() {
                    console.log('adapt_fault table row', newObj1)
                    _this.tableDataConfig.push(newObj1)
                  }, 3000)
                }, 3500)
                // _this.tableDataConfig.push(newObj1)
              }
            } else {
              if (_this.tableDataConfig.length === 0) {
                var newColumnObj = {}
                var allTableShowLength = 0
                for (var each_column of alltabledatas) {
                  var each_column_values_array = Object.values(each_column['dps'])
                  if (each_column_values_array.length !== 0) {
                    allTableShowLength = each_column_values_array.length
                  }
                  newColumnObj[each_column['metric']] = each_column_values_array
                  // 高亮故障时间点error_time的数据行
                  if (!_this.highlight) {
                    Object.keys(each_column['dps']).forEach(function(key, index) {
                      if (key.toString() === timeToTimestamp(cFaultErrorTime).toString()) {
                        _this.highlight = index
                      }
                    })
                  }
                }
                for (var i = 0; i < allTableShowLength; i++) {
                  var newobj = {}
                  if (_this.columns_obj.length !== 0) {
                    for (var show_column_name of _this.columns_obj) {
                      if (newColumnObj[show_column_name.name]) {
                        if (newColumnObj[show_column_name.name].length === 0) {
                          newobj[show_column_name.name] = ''
                        } else {
                          newobj[show_column_name.name] = newColumnObj[show_column_name.name][i]
                        }
                      }
                    }
                    _this.tableDataConfig.push(newobj)
                  }
                }
              } else {
                // 对已存在的行中某cell赋值
                for (var each_table_row = 0; each_table_row < _this.tableDataConfig.length; each_table_row++) {
                  for (var each_getdatas of alltabledatas) {
                    var table_row_variable = _this.tableDataConfig[each_table_row]['variable']
                    // table_row_variable.split('//(')[0]针对模型训练时多参数作用生成一个参数的情况下，表格显示格式 新参数//(原多参数)
                    let metricString = each_getdatas['metric']
                    var multiItemName = getMultiModelItemName(_this.getModelAttrs, each_getdatas['metric'])
                    if (multiItemName !== '') {
                      multiItemName = `( ${multiItemName} )`
                      metricString = metricString + multiItemName
                    }
                    if (table_row_variable.split('//(')[0] === metricString) {
                      Object.keys(each_getdatas['dps']).forEach(function(key, index) {
                        if (index === 0) { // 一个变量参数只获取一个数据解析并展示
                          for (var cell_key in _this.tableDataConfig[each_table_row]) {
                            if (cell_key === 'result_value') { // 报告模板表格arg_name=result_value的均为获取结果数值
                              _this.tableDataConfig[each_table_row]['result_value'] = each_getdatas['dps'][key].toString()
                            }
                            if (cell_key === 'result_time') {
                              _this.tableDataConfig[each_table_row]['result_time'] = timestampToBasicFormatTime(key)
                            }
                          // if (cell_key.indexOf('-compare') !== -1) {
                          // // 比较是否超出阈值，arg_name中检测-compare
                          //   each_table_row[cell_key] = '是'error_time
                          //   var cell_yuzhi_name = cell_key.split('-')
                          //   // 数组
                          //   var cell_yuzhi_value = each_table_row[cell_yuzhi_name[0]].split(',')
                          //   console.log('cell_yuzhi_value', cell_yuzhi_value)
                          //   // TODO: 只有一个值时的比较
                          //   if (each_table_row['result_value'] >= cell_yuzhi_value[0] && each_table_row['result_value'] <= cell_yuzhi_value[1]) {
                          //     each_table_row[cell_key] = '否'
                          //   }
                          // }
                          }
                        }
                      })
                    }
                  }
                }
              }
            }
          } else if (back.result === 'failed') {
            _this.emptyText = _this.$t('errors.get_faild')
          }
        })
      }
    }
  }
}
</script>
