/**
 * 登录相关接口
 */
import request from '@/utils/request'

export function loginByUsername(username, password) {
  const data = {
    uname: username,
    pwd: password
  }
  return request({
    url: '/auth/login',
    method: 'post',
    data
  })
}

/**
 * 注销用户
 */
export function logout() {
  return request({
    url: '/auth/logout',
    method: 'post'
  })
}

/**
 * 根据token获取用户信息
 * @param token
 */
export function getUserInfo(token) {
  return request({
    url: '/auth/info',
    method: 'get',
    params: { token }
  })
}
