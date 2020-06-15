/**
 * “任务监控”相关接口
 */
import request from '@/utils/request'
// 获取任务监控得数据
export function getTaskData(id, query) {
  const idx = id ? id + '/' : ''
  return request({
    url: '/getdetectionsession/' + idx,
    method: 'get',
    params: query
  })
}
// 获取任务详情数据数据
export function getTaskDetail(id, userid) {
  return request({
    url: '/getdetectionsession/' + id + '/',
    method: 'get',
    params: { authuser_id: userid }
  })
}
// 删除某条任务的数据
export function deleteTaskData(id, data) {
  return request({
    url: '/getdetectionsession/' + id + '/',
    method: 'delete',
    params: data
  })
}
