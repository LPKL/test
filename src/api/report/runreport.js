import request from '@/utils/request'
// 监控设备
export function getDatasources() {
  return request({
    url: '/datasources/',
    method: 'get'
  })
}
// 运行报告搜索
export function getRunReports(query) {
  return request({
    url: '/reports/search/',
    method: 'get',
    params: query
  })
}
// 增加运行报告
export function createRunReport(data) {
  return request({
    url: '/reports/',
    method: 'post',
    data
  })
}
// 删除运行报告
export function deleteRunReport(id) {
  return request({
    url: '/reports/' + id + '/',
    method: 'delete'
  })
}
// 运行报告接口
export function getMonthReportData(query) {
  return request({
    url: '/getmonthreport/',
    method: 'get',
    params: query
  })
}
// 上传pdf
export function addFile(data) {
  return request({
    url: '/reports/uploadFile/',
    method: 'post',
    data
  })
}

