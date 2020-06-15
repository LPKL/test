import request from '@/utils/request'
// 故障报告接口
export function getFaultModelData(query) {
  return request({
    url: '/querytsdbdata/',
    method: 'get',
    params: query
  })
}
