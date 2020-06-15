/*
  报告模板模块与后台的数据交互，模板中自定义插件的相关功能实现函数，自定义组件写入模板的html代码处理等功能
*/
import $ from 'jquery'
import i18n from '@/lang'
import store from '@/store'
import { contentToJson } from '@/utils/htmlToJson'
import { getAllModel, getAllPipelineModel, getModelDatasetById } from '@/api/datamining/model'
import { getPipeline, getPipelineDatasetById } from '@/api/experiment/pipelines'
import { getTemplates, updateTemplate } from '@/api/report/template'
import { getFaultModelData } from '@/api/report/faultreport'
import { getMonthReportData } from '@/api/report/runreport'
import { getAtlasStandValue, getAllMetaDatasName, getAllMetadataFieldsName, getMetadataFieldInfo } from '@/api/algorithm/atlas'
import { addTemplateAttachment, addTemplateAttachmentFile } from '@/api/report/template'
import { getRealTimeOrigin } from '@/api/datamining/real/realorigin'
import jsonTableSetupSchemaData from '@/views/report/template/components/tableSetupSchema.json'
import jsonChartSetupSchemaData from '@/views/report/template/components/chartSetupSchema.json'
/**
**/
// 返回故障告警参与变量name数组
export function getFaultAlertRuleItems(cAlertRule) {
  var alertRuleItems = []
  if (cAlertRule.conditions.length !== 0) {
    alertRuleItems = cAlertRule.conditions
  } else if (cAlertRule.params.length !== 0) {
    alertRuleItems = cAlertRule.params
  }
  var alertRuleItemName = []
  for (var each_alert_rule of alertRuleItems) {
    alertRuleItemName.push(each_alert_rule.field)
  }
  return alertRuleItemName
}

// 模型信息
export function getModelInfo(modelid, callback) {
  getAllModel(undefined, modelid).then(res => {
    typeof callback === 'function' && callback({ 'result': 'success', 'data': res.data })
  }).catch(error => {
    typeof callback === 'function' && callback({ 'result': 'failed', 'data': error })
  })
}

// 同步返回模型属性信息
const getModelAttrsInfoById = function(modelid, modeltype) {
  return new Promise((resolve, reject) => {
    if (modeltype === 'model') {
      getAllModel(undefined, modelid).then(res => {
        resolve(res.data['attributes'][0])
      })
    } else if (modeltype === 'pipeline') {
      getPipeline(modelid).then(res => {
        resolve(res.data['attributes'][0])
      })
    }
  })
}

export async function getModelAttrsInfoObject(modelid, modeltype, callback) {
  const result = await getModelAttrsInfoById(modelid, modeltype)
  typeof callback === 'function' && callback({ 'result': 'success', 'data': result })
}

// 标准阈值
const getDatasetidByModel = function(modeltype, modelid) {
  return new Promise((resolve, reject) => {
    if (modeltype === 'model') {
      getModelDatasetById(modelid).then(res => {
        resolve(res.data)
      }).catch((error) => {
        console.log('getModelDatasetById error', error)
        resolve(-1)
      })
    } else if (modeltype === 'pipeline') {
      getPipelineDatasetById(modelid).then(res => {
        resolve(res.data)
      }).catch((error) => {
        console.log('getModelDatasetById error', error)
        resolve(-1)
      })
    }
  })
}
export async function getDatasetValue(modeltype, modelid, callback) {
  const result = await getDatasetidByModel(modeltype, modelid)
  typeof callback === 'function' && callback({ 'result': 'success', 'data': result })
}
export async function getAtlasValueString(key, datasetid, callback) {
  const result = await getAtlasValue(key, datasetid)
  typeof callback === 'function' && callback({ 'result': 'success', 'data': result })
}

// 上传附件
export function postTemplateAttachmentFile(postdata, callback) {
  addTemplateAttachmentFile(postdata).then(res => {
    typeof callback === 'function' && callback({ 'result': 'success', 'data': res.data })
  }).catch((error) => {
    console.log('postTemplateAttachmentFile error', error)
    typeof callback === 'function' && callback({ 'result': 'failed', 'data': error })
  })
}

// 创建附件记录
export function postTemplateAttachment(postdata, callback) {
  addTemplateAttachment(postdata).then(res => {
    const data = res.data
    typeof callback === 'function' && callback(data)
  })
}
// 获取故障时间点前后故障数据
export function getFaultModelDatas(postdata, callback) {
  getFaultModelData(postdata).then(res => {
    const data = res.data
    typeof callback === 'function' && callback({ 'result': 'success', 'data': data })
  }).catch((error) => {
    console.log('getFaultModelDatas error', error)
    typeof callback === 'function' && callback({ 'result': 'failed', 'data': error })
  })
}

export function getMonthReportDatas(postdata, callback) {
  getMonthReportData(postdata).then(res => {
    const data = res.data
    typeof callback === 'function' && callback(data)
  })
}

// 同步获取报告模板列表, 供模板复用功能使用
export function getTemplatesList(callback) {
  // 报告列表为 个人报表和所有已公开报表
  var allTemplateList = []
  getTemplates({ 'auth_user': store.state.user.id, 'type': 'personal' }).then(res => {
    allTemplateList = res.data.data
    getTemplates({ 'type': 'enterprise' }).then(res1 => {
      allTemplateList = allTemplateList.concat(res1.data.data)
      typeof callback === 'function' && callback(allTemplateList)
    }).catch((error) => {
      console.log('getTemplatesList enterprise error', error)
      typeof callback === 'function' && callback(allTemplateList)
    })
  }).catch((error) => {
    console.log('getTemplatesList personal', error)
    typeof callback === 'function' && callback(allTemplateList)
  })
  // getTemplates({ 'auth_user': context.$store.state.user.id }).then(res => {
  //   // 使用回调函数
  //   typeof callback === 'function' && callback(res.data.data)
  // })
}

// 返回模型变量参数及变量原始参数
export function getMultiModelItemName(modelAttrs, item) {
  let itemName = ''
  if (modelAttrs) {
    if (Object.prototype.hasOwnProperty.call(modelAttrs, 'influenceFields')) {
      const influenceValue = Object.values(modelAttrs.influenceFields)[0]
      if (Object.prototype.hasOwnProperty.call(influenceValue, item)) {
        itemName = influenceValue[item]
      }
    }
  }
  return itemName
}

// 返回模型变量个性化阈值
export function getThresholdValue(modelAttrs, item) {
  var valueString = '//'
  if (modelAttrs !== null) {
    for (var model_threshold_key in modelAttrs) {
      // TODO: 健康度阈值只对anomalyScore，prediction参数有意义
      if (item === 'anomalyScore') {
        if (Object.prototype.hasOwnProperty.call(modelAttrs, 'threshold_iForest')) {
          valueString = modelAttrs['threshold_iForest']
        }
      } else {
        var nnn = 'threshold_' + item
        if (nnn === model_threshold_key) {
          if (typeof modelAttrs[model_threshold_key] === 'object') {
            valueString = modelAttrs[model_threshold_key].join(',')
          } else {
            valueString = modelAttrs[model_threshold_key]
          }
        }
      }
    }
  }
  return valueString
}

// 同步方法获取模型参数的标准阈值
const getAtlasValue = function(bz_string, dataset_id) {
  // console.log('getAtlasValue', bz_string, dataset_id, typeof dataset_id)
  bz_string = bz_string.split('#')[0] // shangx#xxxfft等参数的标准值来自shangx
  return new Promise((resolve, reject) => {
    if (dataset_id !== null && dataset_id !== -1) {
      if (typeof dataset_id === 'object') {
        $.each(dataset_id, function(key, value) {
          getAtlasStandValue(value, { names: [bz_string] }).then(res => {
            // console.log(res)
            try {
              const otherData = res.data[0]
              const { standard_value } = typeof otherData.other === 'string' ? JSON.parse(otherData.other) : otherData.other
              if (standard_value.length === 0) {
                resolve('//')
              } else {
                var arr = []
                standard_value.some(t => {
                  if (t.value !== null) {
                    arr.push(`${t.name} : ${t.value}`)
                  }
                })
                resolve(arr.join('/'))
              }
            } catch (e) {
              console.log(e)
              resolve('//')
            }
          }).catch(error => {
            console.log(error)
            resolve('//')
          })
        })
      }
    } else {
      resolve('//')
    }
  })
  // return new Promise((resolve, reject) => {
  //   getAtlasStandValue(bz_string).then(res => {
  //     const entities = res.entities
  //     if (entities && entities[0]) {
  //       entities[0].classifications.some(it => {
  //         if (it.typeName !== 'details description') {
  //           // console.log('getAtlasValue', it.attributes, JSON.stringify(it.attributes))
  //           var arr = []
  //           for (const key in it.attributes) {
  //             if (it.attributes[key] !== null) {
  //               arr.push(`${key} : ${it.attributes[key]}`)
  //               // arr.push(key + ':' + it.attributes[key])
  //             }
  //           }
  //           resolve(arr.join('/'))
  //         }
  //       })
  //     }
  //     resolve('//')
  //   }).catch(error => {
  //     console.log(error)
  //     resolve('//')
  //   })
  // })
}

// 获得元数据列表，元数据属性
export function getOriginDataItems(type, showname, editor, metadataid, fieldid) {
  if (metadataid) {
    // 单个元数据，或单个元数据内的属性值
    if (type === 'origin_param') {
      // 单个元数据
      getAllMetadataFieldsName(metadataid).then(res => {
        var origin_name = showname
        var origin_paramData = []
        const origin_paramDataItems = res.data.map(item => {
          return { value: item.id.toString(), text: item.name }
        })
        if (origin_paramDataItems.length !== 0) {
          origin_paramData.push({ label: i18n.t('strings.template.origindata_attr'), name: type, items: origin_paramDataItems, type: 'selectbox' })
          OriginData_Dialog.open(false, editor, origin_paramData, type, origin_name, metadataid)
        } else {
          editor.notificationManager.open({
            text: editor.translate(i18n.t('strings.template.null_value')),
            type: 'warning',
            timeout: 3000
          })
        }
      }).catch(error => {
        console.log('getAllMetadataFieldsName error', error)
      })
    } else if (type === 'origin_param_attr') {
      // 单个元数据的属性参数
      getMetadataFieldInfo(metadataid, fieldid).then(res => {
        const fieldData = res.data
        var origin_param_name = showname + '\n' + fieldData.name
        var origin_param_attrData = []
        const origin_param_attrDataItems = []
        $.each(JSON.parse(fieldData.other), function(key, value) {
          if (key === 'standard_value') {
            const standard_value = typeof value === 'string' ? JSON.parse(value) : value
            $.each(standard_value, function(standard_value_key, standard_value_value) {
              if (standard_value_value.value !== null) {
                origin_param_attrDataItems.push({ value: standard_value_value.name + ',' + standard_value_value.value.toString(), text: standard_value_value.name })
              }
            })
          }
        })
        if (origin_param_attrDataItems.length !== 0) {
          origin_param_attrData.push({ label: i18n.t('strings.template.origindata_param_attr'), name: type, items: origin_param_attrDataItems, type: 'selectbox' })
          OriginData_Dialog.open(false, editor, origin_param_attrData, type, origin_param_name, metadataid)
        } else {
          editor.notificationManager.open({
            text: editor.translate(i18n.t('strings.template.null_value')),
            type: 'warning',
            timeout: 3000
          })
        }
      }).catch(error => {
        console.log('getMetadataFieldInfo error', error)
      })
    }
  } else {
    getAllMetaDatasName().then(res => {
      // console.log('getAllMetaDatasName', res)
      var originData = []
      const originDataItems = res.data.map(item => {
        return { value: item.id.toString(), text: item.name }
      })
      if (originDataItems.length !== 0) {
        originData.push({ label: i18n.t('strings.template.origindata'), name: type, items: originDataItems, type: 'selectbox' })
        OriginData_Dialog.open(true, editor, originData, type, showname)
      } else {
        editor.notificationManager.open({
          text: editor.translate(i18n.t('strings.template.null_value')),
          type: 'warning',
          timeout: 3000
        })
      }
    }).catch(error => {
      console.log('getAllMetaDatas error', error)
    })
  }
}

// 状态字符串显示
export function showStateString(state) {
  var statestr = ''
  var faultStatusData = {
    'unprocessed': i18n.t('strings.faultmanage.unprocessed'),
    'processing': i18n.t('strings.faultmanage.processing'),
    'processed': i18n.t('strings.faultmanage.processed'),
    'fault_free': i18n.t('strings.faultmanage.fault_free')
  }
  statestr = faultStatusData[state]
  return statestr
}
// tinymce编辑器中，通过plugin插入时定义的变量名称显示对应的变量值
export function showEditorVariableValueByKey(markobj, config) {
  var mark_value = ''
  var type = markobj['attributes']['data-type']
  if (markobj['attributes']) {
    if (Object.prototype.hasOwnProperty.call(markobj['attributes'], 'title')) {
      mark_value = markobj['attributes']['title']
    }
  }
  // var mark_value = '未获取'
  if (config === null) {
    return mark_value
  }
  if (type === 'origin_param_attr' || type === 'modeldata_variable_type') {
    if (Object.prototype.hasOwnProperty.call(markobj, 'children')) {
      mark_value = markobj['children'][0].text
    }
  }
  // if (fault !== null) {
  //   if (type === 'deviceName') {
  //     mark_value = fault.content.device.name
  //   } else if (type === 'modelName') {
  //     mark_value = fault.content.model.name
  //   }
  // }
  if (config !== {}) {
    if (type === 'mceDeviceName') {
      if (Object.prototype.hasOwnProperty.call(config, 'device_uuid')) {
        mark_value = config['device_uuid']
      }
    } else if (type === 'mceModelName') {
      if (Object.prototype.hasOwnProperty.call(config, 'model')) {
        mark_value = config['model'].name
      }
    } else if (type === 'mceFaultCode') {
      if (Object.prototype.hasOwnProperty.call(config, 'alert_rule_info')) {
        mark_value = `${config['alert_rule_info'].fault_code.code} ( ${config['alert_rule_info'].fault_code.name} )`
        // mark_value = config['alert_rule_info'].fault_code.code + '(' + config['alert_rule_info'].fault_code.name + ')'
      }
    } else if (type === 'mceFaultCodeInfo') {
      if (Object.prototype.hasOwnProperty.call(config, 'alert_rule_info')) {
        mark_value = `${i18n.t('labels.alarm.fault_desc')}： ${config['alert_rule_info'].fault_code.description} ** ${i18n.t('labels.alarm.fault_origin')}： ${config['alert_rule_info'].fault_code.reason} ** ${i18n.t('labels.alarm.action_opinion1')}： ${config['alert_rule_info'].fault_code.opinion}`
        // '故障描述' + config['alert_rule_info'].fault_code.description + '**故障原因： ' + config['alert_rule_info'].fault_code.reason + '**处理方法： ' + config['alert_rule_info'].fault_code.opinion
      }
    } else if (type === 'mceHandleInfo') {
      if (Object.prototype.hasOwnProperty.call(config, 'handle_info')) {
        mark_value = config['handle_info']
      }
    } else if (type === 'mceAlertRule') {
      if (Object.prototype.hasOwnProperty.call(config, 'alert_rule_info')) {
        var rules_arr = []
        for (var each_rule of config['alert_rule_info'].conditions) {
          rules_arr.push(`${each_rule.field} ${each_rule.operator} ${each_rule.value}`)
          // rules_arr.push(each_rule.field + ' ' + each_rule.operator + ' ' + each_rule.value)
        }
        mark_value = `${config['alert_rule_info'].name} ( ${rules_arr.join('/')} )`
        // mark_value = config['alert_rule_info'].name + '(' + rules_arr.join('/') + ')'
      }
    } else if (type === 'mceFaultState') {
      if (Object.prototype.hasOwnProperty.call(config, 'state')) {
        mark_value = config['state']
      }
    }
  }
  return mark_value
}

export function getAlgorithmTypeByModelAttributes(attrmodel) {
  var attrmodelname = Object.keys(attrmodel)[0]
  // console.log('getAlgorithmTypeByModelAttributes', attrmodel, Object.keys(attrmodel)[0], Object.values(attrmodel)[0])
  var attrmodeltype = ''
  var attrmodeltypename = ''
  // ['parameter', 'threshold', 'frequency']
  if (attrmodelname === 'AnomalyDetection') {
    if (Object.prototype.hasOwnProperty.call(Object.values(attrmodel)[0], 'md_distance')) {
      attrmodeltype = 'mahalanobis_distance'
      attrmodeltypename = i18n.t('algorithmModel.mahalanobis_distance') // '马氏距离模型'
    } else {
      attrmodeltype = 'personalized_threshold'
      attrmodeltypename = i18n.t('algorithmModel.personalized_threshold') // '个性化阈值模型'
    }
  } else if (attrmodelname === 'IsolationForest') {
    attrmodeltype = 'isolation_forest'
    attrmodeltypename = i18n.t('algorithmModel.isolation_forest') // '健康度模型'
  } else if (attrmodelname === 'MDAnomalyDetection') {
    attrmodeltype = 'mahalanobis_distance'
    attrmodeltypename = i18n.t('algorithmModel.mahalanobis_distance')// '马氏距离模型'
  } else if (attrmodelname === 'Feather_fft') {
    attrmodeltype = 'spectrum'
    attrmodeltypename = i18n.t('algorithmModel.spectrum') // '频谱'
  } else if (attrmodelname === 'FrequencyJudge') {
    attrmodeltype = 'axis_trajectory'
    attrmodeltypename = i18n.t('algorithmModel.axis_trajectory') // '轴心轨迹模型'
  }
  return { 'name': attrmodeltypename, 'value': attrmodeltype }
}

/**
  定时自动保存的回调函数处理
  只有编辑面板存在改动时，才会触发autoSaveTemplate
  只会对编辑中的模板进行更新，对新建中的模板不会执行保存
  保存时将面板html内容转为特定json格式内容，转换完成后，更新服务器端模板存储
**/

export function autoSaveTemplate(editor, templateForm, templateId) {
  if (templateId && templateId !== -1) {
    templateForm.content_html = editor.getContent()
    contentToJson(templateForm.content_html).then(function(data) {
      templateForm.content_json = data
      updateTemplate(templateId, templateForm).then(res => {
        editor.notificationManager.open({
          text: editor.translate(i18n.t('messages.template.save_success')),
          type: 'success',
          timeout: 2000,
          closeButton: false
        })
      }).catch(error => {
        console.log('updateTemplate error', error)
      })
    })
  }
}

/**
  tinymce插件中引用model相关
  model_chart 图形需要提前关联模型和参数
  adapt_chart 故障自适应图形，图形不必事先关联模型和参数，将根据故障信息中获取故障模型，告警参数等数据绘制图形
  origindata_variable_type 元数据属性
  modeldata_variable_type 需要获取模型属性attribution变量
  special_table 特殊类型表格
 */
export function setModelDatas(modeltype, data, editorNodeIsImg, plugintype, editor, paramkey) {
  const modelParamValue = data[paramkey]
  if (modelParamValue) {
    if (paramkey === 'attributes') {
      // 模型属性 attributes是对象
      const modelAttributesList = []
      Object.getOwnPropertyNames(modelParamValue[0]).forEach(function(key) {
        if (key !== 'influenceFields') {
          modelAttributesList.push({ value: JSON.stringify(modelParamValue[0][key]), text: key })
        }
      })
      const data_panelitems = [{
        label: i18n.t('strings.template.model_attr'),
        name: plugintype,
        items: modelAttributesList,
        type: 'selectbox'
      }]
      ModelParams_Dialog.open(editor, data_panelitems, data.name, data.id, modeltype, plugintype)
    } else if (paramkey === 'columns_list_json') {
      // 模型参数 columns_list_json是数组
      const modelColumnsList = modelParamValue.map((item) => {
        if (item.name !== '') {
          // 空名称不显示
          let columnZname = item.name
          if (item.zname) {
            columnZname = item.zname
          }
          return { value: item.name, text: columnZname }
        }
      })
      if (editorNodeIsImg && editorNodeIsImg.nodeName === 'IMG' && plugintype === 'model_chart') {
        // chart图形关联模型
        // 打开第二个dialog，根据选中的模型，图形，配置xy轴等数据
        var modelChartPanelTabs = []
        jsonChartSetupSchemaData.arg_range.forEach(argRangeItem1 => {
          if (argRangeItem1.arg_name === editorNodeIsImg.alt) {
            const initModelChartDialogData = {}
            argRangeItem1.arg_range.forEach(argRangeItem2 => {
              initModelChartDialogData[argRangeItem2.arg_name] = argRangeItem2.arg_value
              // 解析已有图形的数据，看是否已经配置，将已配置信息作为open dialog的初始值
              if (editorNodeIsImg.getAttribute('data-param').length !== 0) {
                // TODO:
                for (var each_olddataparams of JSON.parse(editorNodeIsImg.getAttribute('data-param'))) {
                  if (each_olddataparams[argRangeItem2.arg_name]) {
                    for (var eachChartDataParam of each_olddataparams[argRangeItem2.arg_name]) {
                      if (argRangeItem2.arg_type === 'columns') {
                        initModelChartDialogData[argRangeItem2.arg_name + '---' + eachChartDataParam] = true
                      } else if (argRangeItem2.arg_type === 'list') {
                        initModelChartDialogData[argRangeItem2.arg_name] = eachChartDataParam
                      } else {
                        initModelChartDialogData[argRangeItem2.arg_name] = eachChartDataParam
                      }
                    }
                  }
                }
              }
              let argZname = argRangeItem2.arg_name
              if (argRangeItem2.arg_zname) {
                argZname = argRangeItem2.arg_zname
              }

              const eachItemsData = []
              if (argRangeItem2.arg_type === 'columns') {
                // 多选
                // DONE: 避免arg_name=x与获得的column list 里的值相同，arg_name应该设置的复杂一些
                // for (var eachModelColumn of modelColumnsList) {
                //   eachItemsData.push({ label: eachModelColumn.text, name: argRangeItem2.arg_name + '---' + eachModelColumn.value, type: 'checkbox' })
                // }
                modelColumnsList.forEach(item => {
                  eachItemsData.push({ label: item.text, name: argRangeItem2.arg_name + '---' + item.value, type: 'checkbox' })
                })
              } else if (argRangeItem2.arg_type === 'list') {
                // 单选
                eachItemsData.push({ label: argZname, name: argRangeItem2.arg_name, type: 'selectbox', items: modelColumnsList })
              } else {
                // 更多类型在dialog中的适配
                eachItemsData.push({ label: argZname, name: argRangeItem2.arg_name, type: argRangeItem2.arg_type })
                // initModelChartDialogData[argRangeItem2.arg_name] = argRangeItem2.arg_value
              }
              modelChartPanelTabs.push({ name: argRangeItem2.arg_name, title: argZname, items: eachItemsData })
            })
            Chart_ModelParams_Dialog.open(editor, modelChartPanelTabs, initModelChartDialogData, editorNodeIsImg.alt, data, modeltype)
          }
        })
      } else {
        // TODO: 非关联表格，图形的模型输出值（暂无使用位置）
        var modelPanelItems = [{ label: i18n.t('strings.template.model'), name: plugintype, items: modelColumnsList, type: 'selectbox' }]
        ModelParams_Dialog.open(editor, modelPanelItems, data.name, data.id, modeltype, plugintype)
      }
    }
  } else {
    editor.notificationManager.open({
      text: editor.translate(i18n.t('strings.template.none_model_attr')),
      type: 'error',
      timeout: 5000
    })
  }
}
export function getModelInfoData(plugintype, editor, modelid, modeltype, paramkey) {
  // 模型数据，根据类型分别返回结果
  var editorGetNode = editor.selection.getNode()
  var editorNodeIsImg = editor.dom.getParent(editor.selection.getStart(), 'img')
  if (modelid) {
    // 根据id，获取单一指定模型的具体信息
    if (modeltype === 'model') {
      getAllModel(undefined, modelid).then(res => {
        setModelDatas('model', res.data, editorNodeIsImg, plugintype, editor, paramkey)
      }).catch(error => {
        console.log('getAllModel', error)
      })
    } else if (modeltype === 'pipeline') {
      getPipeline(modelid).then(res => {
        setModelDatas('pipeline', res.data, editorNodeIsImg, plugintype, editor, paramkey)
      }).catch(error => {
        console.log('getPipeline', error)
      })
    }
  } else {
    // 获取所有模型信息
    if (plugintype === 'adapt_chart') {
      // adapt_chart类型不需要选择模型
      const adaptChartPanelTabs = []
      jsonChartSetupSchemaData.arg_range.forEach(argRangeItem1 => {
        if (argRangeItem1.arg_name === editorNodeIsImg.alt) {
          const initAdaptChartDialogData = {}
          argRangeItem1.arg_range.forEach(argRangeItem2 => {
            initAdaptChartDialogData[argRangeItem2.arg_name] = argRangeItem2.arg_value
            let argZname = argRangeItem2.arg_name
            if (argRangeItem2.arg_zname) {
              argZname = argRangeItem2.arg_zname
            }
            const eachItemsData = [{ label: argZname, name: argRangeItem2.arg_name, type: argRangeItem2.arg_type }]
            adaptChartPanelTabs.push({ name: argRangeItem2.arg_name, title: argZname, items: eachItemsData })
          })
          if (editorNodeIsImg.getAttribute('data-param') !== '') {
            for (var eachChartDataParam of JSON.parse(editorNodeIsImg.getAttribute('data-param'))) {
              if (Object.prototype.hasOwnProperty.call(eachChartDataParam, 'time_range')) {
                initAdaptChartDialogData['time_range'] = eachChartDataParam['time_range'][0]
              }
              if (Object.prototype.hasOwnProperty.call(eachChartDataParam, 'record_count')) {
                initAdaptChartDialogData['record_count'] = eachChartDataParam['record_count'][0]
              }
            }
          }
          var adaptChartModel = { 'name': '', 'id': -1 }
          Chart_ModelParams_Dialog.open(editor, adaptChartPanelTabs, initAdaptChartDialogData, editorNodeIsImg.alt, adaptChartModel)
        }
      })
    } else {
      getAllPipelineModel().then(res => {
        var modelItems = [{ value: '-1', text: i18n.t('strings.template.select_model') }]
        res.data.map((item) => {
          // if (item.type === 'pipeline') {
          modelItems.push({ value: item.id.toString() + '___' + item.type, text: item.name + '(' + item.type + ')' })
          // }
        })
        if (plugintype === 'special_table') {
          // 特殊表格，在显示模型列表前，需要显示表格类型列表
          const specialTableTypeItemsData = jsonTableSetupSchemaData.arg_range.map((item) => {
            return { value: item.arg_name, text: item.arg_zname }
          })
          SpecialTableType_Dialog.open(editor, specialTableTypeItemsData, modelItems)
        } else {
          // 其他只需要单独显示模型列表的dialog
          // 获取到模型后再打开dialog，防止无数据插入
          let initModelListDialogData = {}
          if (editorGetNode.getAttribute('data-model')) {
            initModelListDialogData = { model: editorGetNode.getAttribute('data-model') + '___' + editorGetNode.getAttribute('data-model-type') }
          }
          Model_Dialog.open(editor, modelItems, initModelListDialogData, plugintype)
        }
      }).catch(error => {
        console.log('getAllPipelineModel error', error)
      })
    }
  }
}

// 特殊表格的设置功能
export function setSpecialTable(editor) {
  // 已经配置过type，model等字段的表格，点击表格编辑按钮后，跳过第一步dialog，直接显示表格设置dialog
  const editorNodeIsTable = editor.dom.getParent(editor.selection.getStart(), 'table')
  if (editorNodeIsTable.getAttribute('data-tabletype')) {
    // 初始特定表格设置时，为data-tabletype赋值为special
    if (editorNodeIsTable.attributes['data-tabletype'].value === 'special') {
      getModelInfoData('special_table', editor)
    } else {
      // 部分表格需要选择模型中的参数
      var needModelTableType = ['parameter', 'personalized_threshold', 'spectrum', 'mahalanobis_distance', 'isolation_forest']
      if (needModelTableType.indexOf(editorNodeIsTable.getAttribute('data-tabletype')) !== -1) {
        if (editorNodeIsTable.getAttribute('data-model')) {
          if (editorNodeIsTable.getAttribute('data-tabletype') === 'personalized_threshold') {
            getDatasetValue(editorNodeIsTable.getAttribute('data-model-type'), editorNodeIsTable.getAttribute('data-model'), function(back) {
              specialTableConfig(editor, editorNodeIsTable.getAttribute('data-tabletype'), editorNodeIsTable.getAttribute('data-model'), editorNodeIsTable.getAttribute('data-model-type'), back.data)
            })
          } else {
            specialTableConfig(editor, editorNodeIsTable.getAttribute('data-tabletype'), editorNodeIsTable.getAttribute('data-model'), editorNodeIsTable.getAttribute('data-model-type'))
          }
        }
      } else {
        specialTableConfig(editor, editorNodeIsTable.getAttribute('data-tabletype'))
      }
    }
  } else {
    getModelInfoData('special_table', editor)
  }
}

// 选择表格类型后，根据schema_table.json中的json配置，针对不同类型表格配置功能dialog
export function specialTableConfig(editor, tabletype, modelid, modeltype, datasetid) {
  const editorNodeIsTable = editor.dom.getParent(editor.selection.getStart(), 'table')
  var table_config_title = '' // 表格配置dialog中显示的标题：选择的表格类型中文（模型名称）
  var table_panelTabs = []
  // TODO: 未成功网络请求的处理
  // 发电量，负荷分布表格类型需要机组信息，无需模型参数
  var initSpecialTableDialogData = {}
  initSpecialTableDialogData['rated'] = editorNodeIsTable.getAttribute('data-rated')
  initSpecialTableDialogData['recordcount'] = editorNodeIsTable.getAttribute('data-recordcount')
  initSpecialTableDialogData['timerange'] = editorNodeIsTable.getAttribute('data-timerange')
  initSpecialTableDialogData['unit'] = editorNodeIsTable.getAttribute('data-unit')
  if (editorNodeIsTable.getAttribute('data-tablehead')) {
    if (tabletype === 'adapt_fault') {
      // 列变量的记忆
      for (const adaptFaultTableHeadItem of Object.values(JSON.parse(editorNodeIsTable.getAttribute('data-tablehead')))) {
        if (adaptFaultTableHeadItem.length !== 0) {
          for (const adaptFaultTableHeadItemItem of adaptFaultTableHeadItem) {
            initSpecialTableDialogData[adaptFaultTableHeadItemItem.name] = true
          }
        }
      }
    } else {
      for (const tableHeadItem of JSON.parse(editorNodeIsTable.getAttribute('data-tablehead'))) {
        initSpecialTableDialogData[tableHeadItem.name] = true
      }
    }
  }
  if (editorNodeIsTable.getAttribute('data-device')) {
    for (const deviceItem of JSON.parse(editorNodeIsTable.getAttribute('data-device'))) {
      initSpecialTableDialogData[deviceItem] = true
    }
  }

  var need_jizu_tabletype = ['burden', 'fdl_sum', 'faultcollect', 'adapt_fault']
  if (need_jizu_tabletype.indexOf(tabletype) !== -1) {
    // TODO: getRealTimeOrigin获取的机组列表是否根据权限显示权限
    getRealTimeOrigin().then(res => {
      // console.log('getRealTimeOrigin', res.data)
      const getDevicesData = res.data.data.map((item) => {
        // TODO: 中文名称是否来源于schema.name参数, 但是name是数组类型？
        return { name: item.name, zname: item.schema.name[0] }
      })
      editorNodeIsTable.setAttribute('data-model', -1)
      editorNodeIsTable.setAttribute('data-model-type', 'model')
      jsonTableSetupSchemaData.arg_range.map(item => {
        if (item.arg_name === tabletype) {
        // initDialogData = {}
          table_config_title = item.arg_zname
          item.arg_range.map(value => {
            var bodyitems = []
            if (value.arg_range !== null) {
              value.arg_range.map(column_value => {
                if (column_value.arg_type === 'checkbox' && editorNodeIsTable.getAttribute('data-tablehead') === '') {
                  if (column_value.arg_value === 'true') {
                    initSpecialTableDialogData[column_value.arg_name] = true
                  }
                }
                bodyitems.push({ label: column_value.arg_zname, name: column_value.arg_name, type: column_value.arg_type, value: column_value.arg_value })
              })
            } else {
              if (value.arg_name === 'device') {
                if (value.arg_type === 'checkbox') {
                  getDevicesData.forEach(item => {
                    bodyitems.push({ label: item.zname, name: item.name, type: value.arg_type })
                  })
                } else if (value.arg_type === 'selectbox') {
                  const deviceItems = getDevicesData.map((item) => {
                    return { value: item.name, text: item.zname }
                  })
                  bodyitems.push({ label: value.arg_zname, name: value.arg_name, type: value.arg_type, items: deviceItems })
                }
              } else if (value.arg_name === 'unit') {
              // 额定功率的选择selectbox，兆瓦在默认位
                const unit_items = [{
                  value: 'MW', text: i18n.t('strings.template.mw') // '兆瓦'
                }, {
                  value: 'KW', text: i18n.t('strings.template.kw') // '千瓦'
                }]
                bodyitems.push({ label: value.arg_zname, name: value.arg_name, type: value.arg_type, items: unit_items })
              } else {
                bodyitems.push({ label: value.arg_zname, name: value.arg_name, type: value.arg_type })
              }
            }
            table_panelTabs.push({ name: value.arg_name, title: value.arg_zname, items: bodyitems, table: value.arg_table })
          })
          SpecialTableConfig_Dialog.open(editor, table_panelTabs, table_config_title, tabletype, initSpecialTableDialogData)
        }
      })
    })
  } else {
    editorNodeIsTable.setAttribute('data-model', modelid)
    editorNodeIsTable.setAttribute('data-model-type', modeltype)
    // 需要模型参数数据的表格设置，先请求参数后展示设置界面
    if (modeltype === 'model') {
      getAllModel(undefined, modelid).then(res => {
        // console.log('model info', res)
        // 阈值，需要个性化阈值信息
        var modelattributes = res.data.attributes[0]
        table_config_title = res.data.name
        // DONE: 去重，否则在selectbox显示错误
        const getModelColumnsData = res.data.columns_list_json.reduce((prev, cur) => {
          let columnZname = cur.name
          if (cur.zname) {
            columnZname = cur.zname
          }
          var newcur = { value: cur.name, text: columnZname }
          if (prev.findIndex(item => item.value === cur.name) === -1 && cur.name !== '') {
            prev.push(newcur)
          }
          return prev
        }, [])
        // console.log('99', getModelColumnsData)
        jsonTableSetupSchemaData.arg_range.map(item => {
          if (item.arg_name === tabletype) {
            table_config_title += '-' + item.arg_zname
            item.arg_range.map(value => {
              var bodyitems = []
              if (value.arg_range !== null) {
                value.arg_range.map(column_value => {
                  // 根据json中定义，若arg_vaule==true, 则此CheckBox总为选中状态
                  if (column_value.arg_type === 'checkbox' && editorNodeIsTable.getAttribute('data-param') === '') {
                    if (column_value.arg_value === 'true') {
                      initSpecialTableDialogData[column_value.arg_name] = true
                    }
                  }
                  bodyitems.push({ label: column_value.arg_zname, name: column_value.arg_name, type: column_value.arg_type, value: column_value.arg_value })
                })
              } else {
                if (value.arg_name === 'model_params') {
                  // 模型参数
                  if (value.arg_type === 'checkbox') {
                    // json中配置value为true的，初始化值时同样设定
                    getModelColumnsData.forEach(item => {
                      bodyitems.push({ label: item.text, name: item.value, type: value.arg_type })
                    })
                  } else if (value.arg_type === 'selectbox') {
                    bodyitems.push({ label: value.arg_zname, name: value.arg_name, type: value.arg_type, items: getModelColumnsData })
                  }
                } else {
                  bodyitems.push({ label: value.arg_zname, name: value.arg_name, type: value.arg_type })
                }
              }
              table_panelTabs.push({ name: value.arg_name, title: value.arg_zname, items: bodyitems, table: value.arg_table })
            })
            // 已配置过信息的在dialog的初始化
            if (editorNodeIsTable.getAttribute('data-param')) {
              for (var each_set_modelparams of JSON.parse(editorNodeIsTable.getAttribute('data-param'))) {
                initSpecialTableDialogData[each_set_modelparams] = true
              }
            }
            // console.log('model init', tabletype, initDialogData)
            SpecialTableConfig_Dialog.open(editor, table_panelTabs, table_config_title, tabletype, initSpecialTableDialogData, modelattributes, datasetid)
          }
        })
      })
    } else if (modeltype === 'pipeline') {
      getPipeline(modelid).then(res => {
        // 阈值，需要个性化阈值信息
        var modelattributes = res.data.attributes[0]
        table_config_title = res.data.name
        // DONE: 去重，否则在selectbox显示错误
        const getModelColumnsData = res.data.columns_list_json.reduce((prev, cur) => {
          let columnZname = cur.name
          if (cur.zname) {
            columnZname = cur.zname
          }
          var newcur = { value: cur.name, text: columnZname }
          if (prev.findIndex(item => item.value === cur.name) === -1 && cur.name !== '') {
            prev.push(newcur)
          }
          return prev
        }, [])
        // console.log('99', getModelColumnsData)
        jsonTableSetupSchemaData.arg_range.map(item => {
          if (item.arg_name === tabletype) {
            table_config_title += '-' + item.arg_zname
            item.arg_range.map(value => {
              var bodyitems = []
              if (value.arg_range !== null) {
                value.arg_range.map(column_value => {
                  // 根据json中定义，若arg_vaule==true, 则此CheckBox总为选中状态
                  if (column_value.arg_type === 'checkbox' && editorNodeIsTable.getAttribute('data-param') === '') {
                    if (column_value.arg_value === 'true') {
                      initSpecialTableDialogData[column_value.arg_name] = true
                    }
                  }
                  bodyitems.push({ label: column_value.arg_zname, name: column_value.arg_name, type: column_value.arg_type, value: column_value.arg_value })
                })
              } else {
                if (value.arg_name === 'model_params') {
                  // 模型参数
                  if (value.arg_type === 'checkbox') {
                    // json中配置value为true的，初始化值时同样设定
                    getModelColumnsData.forEach(item => {
                      bodyitems.push({ label: item.text, name: item.value, type: value.arg_type })
                    })
                  } else if (value.arg_type === 'selectbox') {
                    bodyitems.push({ label: value.arg_zname, name: value.arg_name, type: value.arg_type, items: getModelColumnsData })
                  }
                } else {
                  bodyitems.push({ label: value.arg_zname, name: value.arg_name, type: value.arg_type })
                }
              }
              table_panelTabs.push({ name: value.arg_name, title: value.arg_zname, items: bodyitems, table: value.arg_table })
            })
            // 已配置过信息的在dialog的初始化
            if (editorNodeIsTable.getAttribute('data-param')) {
              for (var each_set_modelparams of JSON.parse(editorNodeIsTable.getAttribute('data-param'))) {
                initSpecialTableDialogData[each_set_modelparams] = true
              }
            }
            // console.log('model init', tabletype, initDialogData)
            SpecialTableConfig_Dialog.open(editor, table_panelTabs, table_config_title, tabletype, initSpecialTableDialogData, modelattributes, datasetid)
          }
        })
      })
    }
  }
}
// 完成特定类型的表格配置后，在编辑区组织html代码，存储表格配置相关信息
async function insertOrUpdateSpecialTable(editor, tabletype, tableconfig, tabletitle, modelattributes, datasetid) {
  var table_elem = editor.dom.getParent(editor.selection.getStart(), 'table')
  var need_setattr_normal = ['timerange', 'recordcount', 'rated', 'unit']
  if (tabletype === 'adapt_fault') {
    // 自定义表格
    // DONE: 重新打开表格配置dialog时的init
    table_elem.setAttribute('data-tabletype', tabletype)
    if (!table_elem.caption) {
      table_elem.createCaption()
    }
    table_elem.caption.innerHTML = i18n.t('strings.template.custom_fault_table') // '故障自适应表'
    var adapt_tablehead = {}
    for (var each_adapt_config_name in tableconfig) {
      // if (each_adapt_config_name === 'adapt_timerange') {
      //   table_elem.setAttribute('data-timerange', tableconfig[each_adapt_config_name][0].name)
      // } else if (each_adapt_config_name === 'adapt_recordcount') {
      //   table_elem.setAttribute('data-recordcount', tableconfig[each_adapt_config_name][0].name)
      // } else {
      //   adapt_tablehead[each_adapt_config_name] = tableconfig[each_adapt_config_name]
      // }
      adapt_tablehead[each_adapt_config_name] = tableconfig[each_adapt_config_name]
    }
    table_elem.setAttribute('data-tablehead', JSON.stringify(adapt_tablehead))
  } else {
    table_elem.deleteTHead()
    // 删除tbody
    if (table_elem.tBodies.length !== 0) {
      for (var each_table_body = 0; each_table_body < table_elem.tBodies.length; each_table_body++) {
        var rowLength = table_elem.tBodies[each_table_body].rows.length
        for (var row_num = 0; row_num < rowLength; row_num++) {
          table_elem.deleteRow(row_num)
          rowLength = rowLength - 1
          row_num = row_num - 1
        }
      }
    }

    table_elem.setAttribute('data-tabletype', tabletype)
    // table_elem.deleteCaption()
    if (!table_elem.caption) {
      table_elem.createCaption()
    }
    table_elem.caption.innerHTML = `${tabletitle}  ${i18n.t('strings.table')}` //  tabletitle + '表' 默认关联模型表格的标题
    for (var each_config_name in tableconfig) {
      if (need_setattr_normal.indexOf(each_config_name) !== -1) {
        table_elem.setAttribute('data-' + each_config_name, tableconfig[each_config_name][0].name)
      } else if (each_config_name === 'device') {
        if (Object.prototype.hasOwnProperty.call(tableconfig, 'device')) {
          const setDeviceData = tableconfig['device'].map(item => item.name)
          table_elem.setAttribute('data-device', JSON.stringify(setDeviceData))
        }
      }
    }
    // thead
    var tableconfig_column = []
    if (tableconfig['column']) {
      tableconfig_column = tableconfig['column']
    }

    var setTableHead = []
    var thead = table_elem.createTHead()
    var tbody = window.document.createElement('tbody')
    var theadtr = window.document.createElement('tr')

    for (const each_column of tableconfig_column) {
    // console.log('each_column', each_column)
      var td = window.document.createElement('th')
      td.innerHTML = each_column.label
      td.scope = each_column.name
      td.setAttribute('data-scope', each_column.name)
      theadtr.appendChild(td)
      // setTableHead.push(each_column.name)
      setTableHead.push(each_column)
    }
    thead.appendChild(theadtr)
    table_elem.appendChild(thead)
    // tbody.appendChild(tr)
    // table_elem.appendChild(tbody)
    table_elem.setAttribute('data-tablehead', JSON.stringify(setTableHead))

    // console.log('eererere', tableconfig_column, tableconfig['row'])
    if (tableconfig['row'] && tableconfig['row'].length !== 0) {
      for (var row_key = 0; row_key < tableconfig['row'].length; row_key++) {
        var row_value = tableconfig['row'][row_key]
        // console.log('row', row_key, row_value)
        // newrow 新增行, +1表示从紧接thead后
        // var newrow = table_elem.insertRow(row_key + 1)
        var tbodytr = window.document.createElement('tr')
        for (var cell_key = 0; cell_key < tableconfig_column.length; cell_key++) {
          var tbodytd = window.document.createElement('td')
          var cell_value = tableconfig_column[cell_key]
          // console.log('cell', cell_key, cell_value)
          var insert_cell_string = ''
          if (cell_value.name === 'variable') {
            // 变量名称
            var multiItemName = getMultiModelItemName(modelattributes, row_value.label)
            if (multiItemName !== '') {
              multiItemName = `( ${multiItemName} )` // '(' + multiItemName + ')'
            }
            insert_cell_string = `${row_value.label}${multiItemName}` // row_value.label + multiItemName
          } else if (cell_value.name === 'device') {
            // 机组名称
            insert_cell_string = row_value.label
          } else if (cell_value.name === 'threshold_bz') {
          // 获取个性化阈值表标准值
            const result = await getAtlasValue(row_value.name, datasetid) // 同步获取值，之后再执行其他操作
            insert_cell_string = result
          } else if (cell_value.name === 'threshold_yz') {
            // 阈值，包括个性化阈值或健康度阈值等
            insert_cell_string = '//'
            if (modelattributes !== null) {
              insert_cell_string = getThresholdValue(modelattributes, row_value.name)
            }
          }
          // newrow.insertCell(cell_key).innerHTML = insert_cell_string
          tbodytd.innerHTML = insert_cell_string
          tbodytd.scope = cell_value.name
          tbodytr.appendChild(tbodytd)
        }
        tbody.appendChild(tbodytr)
      }
    // table_elem.appendChild(tbody)
    }
    table_elem.appendChild(tbody)
  }
}
// 特定表格除外的自定义组件，完成功能配置dialog后，在编辑区组织html代码，存储表格配置相关信息
var insertOrUpdateContext = function(editor, modelid, modeltype, modelname, modelparams, modelparamsmark, type) {
  // console.log('insertOrUpdateContext', type, modelid, modelname, modelparams, modelparamsmark)
  modeltype = modeltype === undefined ? 'model' : modeltype
  var elem = editor.selection.getNode()
  var modelElm = editor.dom.getParent(editor.selection.getStart(), 'mark')
  if (type === 'model_chart') {
    // 特定表格
    elem.setAttribute('data-model', modelid)
    elem.setAttribute('data-model-type', modeltype)
    elem.setAttribute('data-param', modelparams)
    elem.setAttribute('data-parammark', modelparamsmark)
    elem.title = modelname// 利用元素title属性，实现鼠标在图形上，显示关联的模型和属性
  } else if (type === 'data-model-params') {
    // 有模型，选择参数
    if (modelElm) {
      modelElm.setAttribute('data-param', modelparams)
      var old_modelparam = modelElm.textContent.split('-')
      modelElm.textContent = `( ${old_modelparam[0]} - ${modelparams} )` // old_modelparam[0] + '-' + modelparams
    }
  } else if (type === 'origin_param_attr') {
    // 元数据参数
    elem.innerHTML = '&nbsp;'
    var new_origindata_mark_node = document.createElement('mark')
    new_origindata_mark_node.setAttribute('contenteditable', 'false')
    new_origindata_mark_node.setAttribute('data-type', type)
    new_origindata_mark_node.title = modelname// 变量详细信息
    new_origindata_mark_node.textContent = modelparams
    elem.appendChild(new_origindata_mark_node)
  } else {
    // 针对绑定变量的参数
    if (modelElm) {
      modelElm.setAttribute('data-model', modelid)
      modelElm.setAttribute('data-model-type', modeltype)
      modelElm.setAttribute('data-param', modelparams)
      modelElm.setAttribute('data-type', type)
      modelElm.title = `( ${modelname} - ${modelparams} )` // modelname + '-' + modelparams
      modelElm.textContent = modelparams
    } else {
      elem.innerHTML = '&nbsp;'
      var new_modelparamvalue_mark_node = document.createElement('mark')
      new_modelparamvalue_mark_node.setAttribute('contenteditable', 'false')
      new_modelparamvalue_mark_node.setAttribute('data-model', modelid)
      new_modelparamvalue_mark_node.setAttribute('data-model-type', modeltype)
      new_modelparamvalue_mark_node.setAttribute('data-param', modelparams)
      new_modelparamvalue_mark_node.setAttribute('data-type', type)
      new_modelparamvalue_mark_node.title = `( ${modelname} - ${modelparams} )` // modelname + '-' + modelparams
      new_modelparamvalue_mark_node.textContent = modelparams
      elem.appendChild(new_modelparamvalue_mark_node)
    }
  }
}
/*
自定义组件的dialog
*/

// 选择模型dialog, 内容为模型列表
export function open_model_dialog(editor, modellist, initdata, nodetype) {
  editor.windowManager.open({
    title: i18n.t('strings.template.model_list'),
    size: 'normal',
    body: {
      type: 'panel',
      items: [{
        label: i18n.t('strings.template.model'),
        name: 'model',
        type: 'selectbox',
        items: modellist
      }]
    },
    initialData: initdata,
    buttons: [
      {
        type: 'cancel',
        name: 'cancel',
        text: 'Cancel'
      },
      {
        type: 'submit',
        name: 'save',
        text: 'Save',
        primary: true
      }
    ],
    // onChange: (dialogApi, details) => {
    //   var data = dialogApi.getData()
    //   console.log('onChange data', data, initdata.model)
    //   // if (data.model === initdata.model) {
    //   //   // 保留已选中的结果
    //   // }
    // },
    onSubmit: function(dialogApi, details) {
      var data = dialogApi.getData()
      // console.log('onChange data', data, modellist, nodetype)
      if (data.model !== '-1') {
        dialogApi.close()
        // 选中模型后，继续选择模型参数
        const datamodelidandtype = data.model.split('___')
        if (nodetype === 'modeldata_variable_type') {
          // 模型参数
          getModelInfoData(nodetype, editor, datamodelidandtype[0], datamodelidandtype[1], 'attributes')
        } else {
          // 模型output
          getModelInfoData(nodetype, editor, datamodelidandtype[0], datamodelidandtype[1], 'columns_list_json')
        }
      }
    }
  })
}

// 图标的模型参数选择，根据图表配置，多个panel
export function open_chart_modelparams_dialog(editor, paneltabsitem, initdata, charttype, model, modeltype) {
// var open1 = function(editor, paneltabsitem, modelname, modelid, initdata) {
  editor.windowManager.open({
    title: model.name,
    size: 'normal',
    body: {
      type: 'tabpanel',
      tabs: paneltabsitem
    },
    initialData: initdata,
    buttons: [
      {
        type: 'cancel',
        name: 'cancel',
        text: 'Cancel'
      },
      {
        type: 'submit',
        name: 'save',
        text: 'Save',
        primary: true
      }
    ],
    onSubmit: function(dialogApi) {
      // 将选中的值封装成[{key:x, value:[]},{key:y, value:[]},...]形式，TODO: 实际格式待讨论
      var data = dialogApi.getData()
      // console.log('onSubmit data', data, model, charttype)
      var chartParams = []
      var chartParamsmark = []
      var chartParamsString = ''
      for (var i = 0; i < paneltabsitem.length; i++) {
        if (paneltabsitem[i].items) {
          var paramItem = paneltabsitem[i].items
          var paramValue = []
          for (var itemx = 0; itemx < paramItem.length; itemx++) {
            var paramItemName = paramItem[itemx].name
            // console.log('paramItemName', paramItemName)
            if (paramItem[itemx].type === 'selectbox') {
              if (charttype === 'personalized_threshold') {
                for (var model_attr in model.attributes[0]) {
                  if (model_attr === 'threshold_' + data[paramItemName]) {
                    chartParamsmark = model.attributes[0][model_attr]
                  }
                }
              }
              // for (var each_paramitem in paramItem[itemx].items) {
              //   if (data[paramItemName] === paramItem[itemx].items[each_paramitem].text) {
              //     //
              //     chartParamsmark.push(Number(each_paramitem))
              //   }
              // }
              paramValue.push(data[paramItemName])
            } else if (paramItem[itemx].type === 'checkbox') {
              var checkbox_paramItemName = paramItemName.split('---')[1]
              if (data[paramItemName] === true) {
                paramValue.push(checkbox_paramItemName)
                //
                // chartParamsmark.push(itemx)
              }
            } else {
              paramValue.push(data[paramItemName])
            }
          }
        }
        if (chartParamsString.length === 0) {
          chartParamsString = paneltabsitem[i].name + ':' + paramValue.join('-')
        } else {
          chartParamsString = chartParamsString + ',' + paneltabsitem[i].name + ':' + paramValue.join('-')
        }
        // chartParams.push({ key: paneltabsitem[i].name, value: paramValue })
        var eachchartParams = {}
        eachchartParams[paneltabsitem[i].name] = paramValue
        chartParams.push(eachchartParams)
      }
      // console.log('55', chartParams, JSON.stringify(chartParams))
      dialogApi.close()
      insertOrUpdateContext(editor, model.id, modeltype, model.name, JSON.stringify(chartParams), JSON.stringify(chartParamsmark), 'model_chart')
      // 将图形xy轴信息格式化
      // TODO: 将配置信息打印到图形界面上
    }
  })
}

// 选择模型内的参数作为数据变量，单选
export function open_modelparams_dialog(editor, items, modelname, modelid, modeltype, nodetype) {
  editor.windowManager.open({
    title: modelname,
    size: 'normal',
    body: {
      type: 'panel',
      items: items
    },
    buttons: [
      {
        type: 'cancel',
        name: 'cancel',
        text: 'Cancel'
      },
      {
        type: 'submit',
        name: 'save',
        text: 'Save',
        primary: true
      }
    ],
    onSubmit: function(dialogApi) {
      // console.log('Dialog3', dialogApi.getData(), dialogApi.getData()[nodetype], nodetype)
      insertOrUpdateContext(editor, modelid, modeltype, modelname, dialogApi.getData()[nodetype], '', nodetype)
      dialogApi.close()
    }
  })
}

// 元数据dialog
export function open_origindata_dialog(backbutton, editor, panelData, paneltype, panelTitle, tableid) {
  editor.windowManager.open({
    title: panelTitle,
    size: 'normal',
    body: {
      type: 'panel',
      items: panelData
    },
    // initialData: initdata,
    buttons: [
      {
        type: 'cancel',
        name: 'cancel',
        text: 'Cancel'
      },
      {
        type: 'submit',
        name: 'save',
        text: 'Save',
        primary: true
      },
      {
        type: 'custom',
        name: 'back',
        text: i18n.t('buttons.back'),
        align: 'start',
        disabled: backbutton
      }
    ],
    onAction: (dialogApi, details) => {
      // 返回上一级
      if (details.name === 'back') {
        dialogApi.close()
        if (paneltype === 'origin_param') {
          getOriginDataItems('origin', i18n.t('strings.template.origindata'), editor)
        } else if (paneltype === 'origin_param_attr') {
          getOriginDataItems('origin_param', i18n.t('strings.template.origindata'), editor, tableid)
        }
      }
    },
    onSubmit: function(dialogApi) {
      // console.log('open_origindata_dialog submit', paneltype, dialogApi.getData(), dialogApi.getData()[paneltype], tableid)
      dialogApi.close()
      if (paneltype === 'origin') {
        $.each(panelData[0].items, function(key, value) {
          if (value.value === dialogApi.getData()[paneltype].toString()) {
            panelTitle = panelTitle + '\n' + value.text
          }
        })
        getOriginDataItems('origin_param', panelTitle, editor, dialogApi.getData()[paneltype])
      } else if (paneltype === 'origin_param') {
        getOriginDataItems('origin_param_attr', panelTitle, editor, tableid, dialogApi.getData()[paneltype])
      } else if (paneltype === 'origin_param_attr') {
        // 元数据属性基本不变，可视为常量
        var attr_val_arr = dialogApi.getData()[paneltype].split(',')
        var showtitle = panelTitle + '\n' + attr_val_arr[0]
        insertOrUpdateContext(editor, 0, 'none', showtitle, attr_val_arr[1], '', paneltype)

        // var attr_val_arr = dialogApi.getData()[paneltype].split(',')
        // var elem = editor.selection.getNode()
        // var new_origindata_mark_node = document.createElement('mark')
        // new_origindata_mark_node.setAttribute('contenteditable', 'false')
        // new_origindata_mark_node.setAttribute('data-type', paneltype)
        // new_origindata_mark_node.title = panelTitle + '/' + attr_val_arr[0]// 变量详细信息
        // new_origindata_mark_node.textContent = attr_val_arr[1]
        // elem.appendChild(new_origindata_mark_node)
      }
    }
  })
}
// 特定表格初始化dialog
export function open_specialtable_type_dialog(editor, tabletypeItems, modelItems) {
  editor.windowManager.open({
    title: i18n.t('strings.template.special_table_type'),
    size: 'normal',
    body: {
      type: 'panel',
      items: [{
        label: i18n.t('strings.template.specialtable_type'),
        name: 'tabletype',
        type: 'selectbox',
        items: tabletypeItems
      },
      {
        label: i18n.t('strings.template.specialtable_model'),
        name: 'model',
        type: 'selectbox',
        items: modelItems,
        disabled: true
      }]
    },
    buttons: [
      {
        type: 'cancel',
        name: 'cancel',
        text: 'Cancel'
      },
      {
        type: 'submit',
        name: 'save',
        text: 'Save',
        primary: true
      }
    ],
    onChange: function(dialogApi, details) {
      // 'parameter', 'threshold', 'spectrum' 需要选择模型才可以进行下一步，其他类别disabled 模型选择
      var data = dialogApi.getData()
      var need_model_tabletype = ['parameter', 'personalized_threshold', 'spectrum', 'mahalanobis_distance', 'isolation_forest']
      var toggle = need_model_tabletype.indexOf(data.tabletype) !== -1 ? dialogApi.enable : dialogApi.disable
      toggle('model')
      if (need_model_tabletype.indexOf(data.tabletype) === -1) {
        dialogApi.setData({ model: '-1' })
      }
    },
    onSubmit: function(dialogApi, details) {
      var next_step = false
      var data = dialogApi.getData()
      var table_elem = editor.dom.getParent(editor.selection.getStart(), 'table')
      // console.log('open_specialtable_type_dialog data', data.tabletype, data.model)
      // TODO: 根据disabled 状态判断
      var need_model_tabletype = ['parameter', 'personalized_threshold', 'spectrum', 'mahalanobis_distance', 'isolation_forest']
      if (need_model_tabletype.indexOf(data.tabletype) !== -1) {
        // 需要选择模型的表格类别，若未选择，则弹出提示
        if (data.model === '-1') {
          // context.$message.warning(context.$t('strings.template.need_parameter'))
          next_step = false
        } else {
          next_step = true
        }
      } else {
        next_step = true
      }
      if (next_step === true) {
        table_elem.setAttribute('data-tabletype', data.tabletype)
        var datamodelid = '-1'
        var datamodeltype = 'model'
        if (data.model.indexOf('___') !== -1) {
          datamodelid = data.model.split('___')[0]
          datamodeltype = data.model.split('___')[1]
        }
        if (data.tabletype === 'personalized_threshold') {
          getDatasetValue(datamodeltype, datamodelid, function(back) {
            specialTableConfig(editor, data.tabletype, datamodelid, datamodeltype, back.data)
          })
        } else {
          specialTableConfig(editor, data.tabletype, datamodelid, datamodeltype)
        }
        dialogApi.close()
      }
    }
  })
}
// 根据表格类型，自适应表格配置dialog
export function open_specialtable_config_dialog(editor, paneltabsitem, typename, type, initdata, modelattributes, datasetid) {
  editor.windowManager.open({
    title: typename,
    size: 'normal',
    body: {
      type: 'tabpanel',
      tabs: paneltabsitem
    },
    initialData: initdata,
    buttons: [
      {
        type: 'cancel',
        name: 'cancel',
        text: 'Cancel'
      },
      {
        type: 'submit',
        name: 'save',
        text: 'Save',
        primary: true
      }
    ],
    onSubmit: function(dialogApi) {
      var data = dialogApi.getData()
      var config_value = {} // 表格配置信息json，行column：， 列row：
      var config_value_modelparam = []
      var config_value_modelparam_obj = []
      var config_value_device = []

      for (var each_tab of paneltabsitem) {
        var each_tab_config = []
        for (var each_items of each_tab.items) {
          if (each_items.type === 'checkbox') {
            if (data[each_items.name] === true) {
              // each_tab_config.push(each_items.name)
              each_tab_config.push({ 'name': each_items.name, 'label': each_items.label })
              if (each_tab.name === 'model_params') {
                // 模型信息单独拿出来，网络请求参数的时候更方便
                config_value_modelparam.push(each_items.name)
                config_value_modelparam_obj.push(each_items)
              }
              if (each_tab.name === 'device') {
                // 模型信息单独拿出来，网络请求参数的时候更方便
                config_value_device.push(each_items.name)
              }
            }
          } else {
            each_tab_config.push({ 'name': data[each_items.name], 'label': each_items.label })
          }
        }
        // 存储时转为字符串，以逗号分格
        // config_value[each_tab.table] = each_tab_config.join(',')
        if (type === 'adapt_fault') {
          // console.log('open adapt_fault', type, typename)
          config_value['adapt_' + each_tab.name] = each_tab_config
        } else {
          config_value[each_tab.table] = each_tab_config
        }
        // config_value[each_tab.table] = each_tab_config
      }
      // console.log('open_specialtable_config_dialog', config_value, config_value_modelparam, modelattributes)
      var table_elem = editor.dom.getParent(editor.selection.getStart(), 'table')
      table_elem.setAttribute('data-param', JSON.stringify(config_value_modelparam))
      table_elem.setAttribute('data-param-obj', JSON.stringify(config_value_modelparam_obj))
      table_elem.setAttribute('data-device', JSON.stringify(config_value_device))
      insertOrUpdateSpecialTable(editor, type, config_value, typename, modelattributes, datasetid)
      dialogApi.close()
    }
  })
}
var Model_Dialog = { open: open_model_dialog }
var Chart_ModelParams_Dialog = { open: open_chart_modelparams_dialog }
var ModelParams_Dialog = { open: open_modelparams_dialog }
var OriginData_Dialog = { open: open_origindata_dialog }
var SpecialTableType_Dialog = { open: open_specialtable_type_dialog }
var SpecialTableConfig_Dialog = { open: open_specialtable_config_dialog }

