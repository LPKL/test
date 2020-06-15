import request from '@/utils/request'

export function getWSparams() {
  return request({
    url: '/getwebsocketuri/',
    method: 'get'
  })
}

// export function runCurrent(data) {
//   return request({
//     url: '/runprojecthistory/',
//     method: 'post',
//     data
//   })
// }

/**
 * 运行提交请求 1.8.0
 * @param id
 * @param data
 */
export function runCurrent(id, data) {
  return request({
    url: '/experiments/' + id + '/runs/',
    method: 'post',
    data
  })
}
