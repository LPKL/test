/**
  服务(模型服务等)相关接口API
 */

import request from '@/utils/request'

// // 获取服务列表
export function getServicesData(query) {
  return request({
    url: '/services/',
    method: 'get',
    params: query
  })
}
// 故障的搜索
export function getServicesSearchData(query) {
  return request({
    url: '/services/search/',
    method: 'get',
    params: query
  })
}
// 创建服务
export function postServiceData(data) {
  return request({
    url: '/services/',
    method: 'post',
    data
  })
}
// 编辑服务
export function patchServiceData(id, data) {
  return request({
    url: '/services/' + id + '/',
    method: 'patch',
    data
  })
}
// 删除服务
export function deleteServiceData(id) {
  return request({
    url: '/services/' + id + '/',
    method: 'delete'
  })
}
// 启动一条服务
export function putServiceEnable(id) {
  return request({
    url: '/services/' + id + '/enable/',
    method: 'put'
  })
}
// 关闭一条服务
export function putServiceDisable(id) {
  return request({
    url: '/services/' + id + '/disable/',
    method: 'put'
  })
}
// 更新一条服务（重新部署模型）
export function putServiceRedeploy(id) {
  return request({
    url: '/services/' + id + '/redeploy/',
    method: 'put'
  })
}
// 批量启动服务
export function putBatchServicesEnable(data) {
  return request({
    url: '/services/enable/',
    method: 'put',
    data
  })
}
// 批量关闭服务
export function putBatchServicesDisable(data) {
  return request({
    url: '/services/disable/',
    method: 'put',
    data
  })
}
// 批量更新服务
export function putBatchServicesRedeploy(data) {
  return request({
    url: '/services/redeploy/',
    method: 'put',
    data
  })
}

