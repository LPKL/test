import request from '@/utils/request'
/**
 * 删除一个实时流
 */
export function deleteRealTimeFlow(flow_id) {
  return request({
    url: `/streamings/${flow_id}/`,
    method: 'delete'
  })
}
/**
 * 搜索实时流程
 */
export function realtimeFlowSearch(query) {
  return request({
    url: '/streamings/search/',
    method: 'get',
    params: query
  })
}
/**
 * 获取所有的实时流程
 */
export function getRealtimeFlowData(query) {
  return request({
    url: '/streamings/',
    method: 'get',
    params: query
  })
}
/**
 * 重启一个实时流
 */
export function restartRealTimeFlow(id) {
  return request({
    url: '/streamings/' + id + '/restart/',
    method: 'put'
  })
}
/**
 * 启动一个实时流
 */
export function startRealTimeFlow(id) {
  return request({
    url: '/streamings/' + id + '/start/',
    method: 'put'
  })
}
/**
 * 禁用一个实时流
 */
export function prohibitRealTimeFlow(id) {
  return request({
    url: '/streamings/' + id + '/disable/',
    method: 'put'
  })
}
/**
 * 查询实时流程的某条数据
 */
export function getShiStatus(did, mid) {
  return request({
    url: '/datasources/' + did + '/models/' + mid + '/streaming/status/',
    method: 'get'
  })
}
/**
 * 新 查询实时流程的某条数据
 */
export function getStreamingsStatus(query) {
  return request({
    url: '/streamings/status/',
    method: 'get',
    params: query
  })
}
