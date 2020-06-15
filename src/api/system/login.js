import request from '@/utils/request'
/**
 * 登录
 * @param username
 * @param password
 */
export function loginByUsername(username, password) {
  const data = {
    'username': username,
    'password': password
  }
  return request({
    // url: '/login/',
    url: '/api/token/',
    method: 'post',
    data
  })
}
/**
 * 重新获取token
 */
export function getTokenNew(data) {
  return request({
    url: '/api/token/refresh/',
    method: 'post',
    data
  })
}
/**
 * 注销请求
 */
export function logout() {
  return request({
    url: '/login/logout',
    method: 'post'
  })
}
/**
 * 根据token获取用户信息
 * @param token
 */
export function getUserInfo() {
  return request({
    url: '/user/',
    method: 'get'
  })
}
/**
 * 获取未读条数
 */
export function getUnreadCount() {
  return request({
    url: '/unread/',
    method: 'get'
  })
}
