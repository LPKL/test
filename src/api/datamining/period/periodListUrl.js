import request from '@/utils/request'
// 获取周期流程
export function getPeriodFlowList(query) {
  return request({
    url: '/periodic_datasources/streamings/',
    method: 'get',
    params: query
  })
}
// 启用某个周期流
export function runPeriodFlow(periodic_datasource_id, streaming_id) {
  return request({
    url: '/periodic_datasources/' + periodic_datasource_id + '/streamings/' + streaming_id + '/start/',
    method: 'put'
  })
}
// 禁用某个周期流
export function banPeriodFlow(periodic_datasource_id, streaming_id) {
  return request({
    url: '/periodic_datasources/' + periodic_datasource_id + '/streamings/' + streaming_id + '/disable/',
    method: 'put'
  })
}
// 搜索周期流
export function searchPeriodFlow(query) {
  return request({
    url: '/periodic_datasources/streamings/search/',
    method: 'get',
    params: query
  })
}
// 删除一个周期流程
export function deletePeriodFlow(periodic_datasource_id, streaming_id) {
  return request({
    url: '/periodic_datasources/' + periodic_datasource_id + '/streamings/' + streaming_id + '/',
    method: 'delete'
  })
}
