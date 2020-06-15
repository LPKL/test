import request from '@/utils/request'
// 开始
// 故障的获取
export function faultData(query) {
  return request({
    url: '/faults/' + query,
    method: 'get'
  })
}
// 故障的搜索
export function faultSearch(query) {
  return request({
    url: '/faults/search/' + query,
    method: 'get'
  })
}
/**
 * 获取一条故障信息
 */
export function faultDataId(id) {
  return request({
    url: '/faults/' + id + '/',
    method: 'get'
  })
}
// 故障的处理
export function handelFaultData(id, data) {
  return request({
    url: '/faults/' + id + '/' + 'handle/',
    method: 'put',
    data
  })
}
// 结束
/**
 * 获取故障列表
 */
export function faultDataList(query) {
  return request({
    url: '/errortotal/',
    method: 'get',
    params: query
  })
}
/**
 * 故障类型
 */
export function faultTypeList(query) {
  return request({
    url: '/errorlevel/',
    method: 'get',
    params: query
  })
}

/**
 * 故障模型
 */
export function faultModelList(query) {
  return request({
    url: '/modelsklearns/',
    method: 'get',
    params: query
  })
}

export function faultDataListCount(query) {
  return request({
    url: '/errortotal/?get_total',
    method: 'get',
    params: query
  })
}
// 下载pdf文件
// export function faultPdf() {
//   return request({
//     url: '/getfaultreport/',
//     method: 'get'
//     // data
//   })
// }
