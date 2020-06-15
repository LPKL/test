/**
 * “消息推送”相关接口
 */
import request from '@/utils/request'

// 向服务器端发送创建好的消息
export function authInfos(data) {
  return request({
    url: '/authinfos/',
    method: 'post',
    data
  })
}

// 获取系统消息列表
export function getAuthInfos(query) {
  return request({
    url: '/authinfos/',
    method: 'get',
    params: query
  })
}

export function getAuthInfosCount(query) {
  return request({
    url: '/authinfos/?get_total',
    method: 'get',
    params: query
  })
}

// 获取故障消息列表
export function getErrorInfos(query) {
  return request({
    url: '/errorinfos/',
    method: 'get',
    params: query
  })
}

export function getErrorInfosCount(query) {
  return request({
    url: '/errorinfos/?get_total',
    method: 'get',
    params: query
  })
}

export function updateInfo(data) {
  return request({
    url: '/updateinfo/',
    method: 'put',
    data
  })
}

