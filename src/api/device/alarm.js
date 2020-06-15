import request from '@/utils/request'

/**
 * 获取告警配置管理数据相关
 */
// 获取告警规则列表
export function getAlarmRulesData(query) {
  return request({
    url: '/alter_rules/',
    method: 'get',
    params: query
  })
}
// 增加告警规则
export function postAlarmRuleData(data) {
  return request({
    url: '/alter_rules/',
    method: 'post',
    data
  })
}
// 更新告警规则
export function patchAlarmRuleData(id, data) {
  return request({
    url: '/alter_rules/' + id + '/',
    method: 'patch',
    data
  })
}
// 删除告警规则
export function deleteAlarmRuleData(id) {
  return request({
    url: '/alter_rules/' + id + '/',
    method: 'delete'
  })
}
// 获取故障代码列表
export function getFaultCodesData(query) {
  return request({
    url: '/fault_codes/',
    method: 'get',
    params: query
  })
}
// 增加故障代码
export function postFaultCodeData(data) {
  return request({
    url: '/fault_codes/',
    method: 'post',
    data
  })
}
// 更新故障代码
export function patchFaultCodeData(id, data) {
  return request({
    url: '/fault_codes/' + id + '/',
    method: 'patch',
    data
  })
}
// 删除故障代码
export function deleteFaultCodeData(id) {
  return request({
    url: '/fault_codes/' + id + '/',
    method: 'delete'
  })
}
// 批量删除故障代码
export function batchDeleteAlarmRules(query) {
  return request({
    url: '/batchoperations/',
    method: 'delete',
    params: query
  })
}
// 批量修改故障代码
export function batchUpdateAlarmRules(query, data) {
  return request({
    url: '/batchoperations/',
    method: 'put',
    params: query,
    data
  })
}

