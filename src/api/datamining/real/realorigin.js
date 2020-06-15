import request from '@/utils/request'
/**
 * 删除实时源
 */
export function deleteRealTimeOrigin(id) {
  return request({
    url: '/datasources/' + id + '/',
    method: 'delete'
  })
}
/**
 * 实时源的搜索
 */
export function searchRealTimeOrigin(query) {
  return request({
    url: '/datasources/search/',
    method: 'get',
    params: query
  })
}
/**
 *获取实时源
 */
export function getRealTimeOrigin(query) {
  return request({
    url: '/datasources/',
    method: 'get',
    params: query
  })
}
/**
 * 创建实时源
 */
export function addRealTimeOrigin(data) {
  return request({
    url: '/datasources/',
    method: 'post',
    data
  })
}
/**
 * 表结构的获取schema
 */
export function getOriginData(str) {
  return request({
    url: '/schemas/',
    method: 'get'
  })
}
/**
 * 获取数据源的实时流程
 */
export function getRealTimeOriginFlow(id) {
  return request({
    url: '/datasources/' + id + '/streamings/',
    method: 'get'
  })
}
/**
 * 获取实时源已经关联的模型
 */
export function realTimeOriginHaveModel(id, query) {
  return request({
    url: '/datasources/' + id + '/models_and_pipelines/',
    method: 'get',
    params: query
  })
}
/**
 * 数据源关联模型的添加
 */
export function addRealTimeOriginModel(id, data) {
  return request({
    url: '/datasources/' + id + '/models/',
    method: 'put',
    data
  })
}
/**
 * 启动一个实时流
 */
export function startRealTimeFlow(originId, modelId) {
  return request({
    url: '/datasources/' + originId + '/models/' + modelId + '/streaming/start/',
    method: 'put'
  })
}
/**
 * 禁用一个实时流
 */
export function prohibitRealTimeFlow(originId, modelId) {
  return request({
    url: '/datasources/' + originId + '/models/' + modelId + '/streaming/disable/',
    method: 'put'
  })
}
/**
 * 重启一个实时流
 */
export function restartRealTimeFlow(originId, modelId) {
  return request({
    url: '/datasources/' + originId + '/models/' + modelId + '/streaming/restart/',
    method: 'put'
  })
}
/**
 * 删除一个实时流
 */
export function deleteRealTimeFlow(originId, modelId) {
  return request({
    url: '/datasources/' + originId + '/models/' + modelId + '/streaming/',
    method: 'delete'
  })
}
// 实时源关联模型的操作
export function originRelateModel(datasource_id) {
  return request({
    url: `datasources/${datasource_id}/models/`,
    method: 'get'
  })
}
