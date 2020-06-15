/**
 * 消息中心接口
 */
import request from '@/utils/request'

/**
 * 获取消息
 */
export function getMessage(query) {
  return request({
    url: '/notifications/',
    method: 'get',
    params: query
  })
}
/**
 * 获取某一条推送消息的详情
 */
export function getMessageId(id) {
  return request({
    url: '/notifications/' + id,
    method: 'get'
  })
}
/**
 * 标记一条数据
 */
export function markSingle(id) {
  return request({
    url: '/notifications/' + id + '/read/',
    method: 'put'
  })
}
/**
 * 标记多条数据为已读
 */
export function markMultiple(data) {
  return request({
    url: '/notifications/read',
    method: 'put',
    data
  })
}
/**
 * 标记全部
 */
export function markAll() {
  return request({
    url: '/notifications/read/all',
    method: 'put'
  })
}
/**
 * 删除一条通知
 */
export function deleteData(id) {
  return request({
    url: '/notifications/' + id,
    method: 'delete'
  })
}
/**
 * 批量删除操作
 */
export function deleteDatas(data) {
  return request({
    url: '/notifications/',
    method: 'delete',
    data
  })
}
