import request from '@/utils/request'
// 获取周期数据
export function getPeriodData(query) {
  return request({
    url: '/periodic_datasources/',
    method: 'get',
    params: query
  })
}
// 添加周期数据
export function addPeriodData(data) {
  return request({
    url: '/periodic_datasources/',
    method: 'post',
    data
  })
}
// 搜索周期数据
export function searchPeriodData(query) {
  return request({
    url: '/periodic_datasources/search/',
    method: 'get',
    params: query
  })
}
// 删除周期数据
export function deletePeriodData(id) {
  return request({
    url: '/periodic_datasources/' + id + '/',
    method: 'delete'
  })
}
// 创建周期流,此处的id为当前这条周期数据的id
export function addPeriodFlow(id, data) {
  return request({
    url: '/periodic_datasources/' + id + '/streamings/',
    method: 'post',
    data
  })
}
// 获取某条周期数据的周期流
export function getPeriodDataFlow(id) {
  return request({
    url: '/periodic_datasources/' + id + '/streamings/',
    method: 'get'
  })
}
