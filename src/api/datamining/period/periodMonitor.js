import request from '@/utils/request'
// 获取全部周期流
export function getPeriodStreamings(query) {
  return request({
    url: '/periodic_datasources/streamings/',
    method: 'get',
    params: query
  })
}
// 获取所有周期流的运行详情
export function getPeriodMonitors(query) {
  return request({
    url: '/periodic_datasources/streamings/runs/',
    method: 'get',
    params: query
  })
}
// 获取一个周期流的运行详情
// periodic_datasources/:periodic_datasource_id/streamings/:streaming_id/runs
export function getPeriodMonitorDetails(periodic_datasource_id, streaming_id, query) {
  return request({
    url: '/periodic_datasources/' + periodic_datasource_id + '/streamings/' + streaming_id + '/runs/',
    method: 'get',
    params: query
  })
}
// 获取周期数据源
export function getDatasources() {
  return request({
    url: '/periodic_datasources/',
    method: 'get'
  })
}
// 重启一个周期流
export function restartPeriodRun(periodic_datasource_id, streaming_id, run_id) {
  return request({
    url: '/periodic_datasources/' + periodic_datasource_id + '/streamings/' + streaming_id + '/runs/' + run_id + '/restart/',
    method: 'put'
  })
}
// 周期流运行详情内数据探查添加
export function addPeriodMonitorRunDataExperiments(periodic_datasource_id, streaming_id, run_id, data) {
  return request({
    url: '/periodic_datasources/' + periodic_datasource_id + '/streamings/' + streaming_id + '/runs/' + run_id + '/data_exploration/',
    method: 'post',
    data
  })
}

// 周期流运行详情内数据探查图形配置参数
export function getPeriodMonitorRunDataExperiments(periodic_datasource_id, streaming_id, run_id, query) {
  return request({
    url: '/periodic_datasources/' + periodic_datasource_id + '/streamings/' + streaming_id + '/runs/' + run_id + '/data_exploration/',
    method: 'get',
    params: query
  })
}

// 周期流运行详情内数据探查配置保存
export function updatePeriodMonitorRunDataExperiments(periodic_datasource_id, streaming_id, run_id, data) {
  return request({
    url: '/periodic_datasources/' + periodic_datasource_id + '/streamings/' + streaming_id + '/runs/' + run_id + '/data_exploration/',
    method: 'patch',
    data
  })
}

