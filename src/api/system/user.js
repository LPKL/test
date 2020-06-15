/**
 * “用户管理”相关接口
 */
import request from '@/utils/request'
// 单个用户的操作
export function getSingleUser() {
  return request({
    url: '/user/',
    method: 'get'
  })
}
// 当前用户的修改
export function singleChange(data) {
  return request({
    url: '/user/',
    method: 'patch',
    data
  })
}
// 当前用户修改密码
export function siglePassdChange(data) {
  return request({
    url: '/user/password/',
    method: 'post',
    data
  })
}
//
//
//
//
//
//
//
export function queryUser(str) {
  return request({
    url: '/users/' + str,
    method: 'get'
  })
}
// 重置用户密码
export function resetUserPsd(id, data) {
  return request({
    url: '/users/' + id + '/password/reset/',
    method: 'post',
    data
  })
}
// 更新用户的信息
export function updateUser(id, data) {
  return request({
    url: '/users/' + id + '/',
    method: 'patch',
    data
  })
}
// 添加用户
export function addUser(data) {
  return request({
    url: '/users/',
    method: 'post',
    data
  })
}
// 删除用户
export function deleteUser(id) {
  return request({
    url: '/users/' + id + '/',
    method: 'delete'
  })
}

/**
   * 更新用户的群组
   * @param perm
   */
export function updateUserRoles(id, data) {
  return request({
    url: '/users/' + id + '/',
    method: 'put',
    data
  })
}
/**
 * 搜索用户
 * 目前使用
 */
export function searchUserMessage(data) {
  return request({
    url: '/users/search/' + data,
    method: 'get'
  })
}
/**
 * 测试用户名或者邮箱是否已经注册
 * */
export function registerTest(data) {
  return request({
    url: '/uniquever/' + data,
    method: 'get'
  })
}
/** 获取验证码**/
export function getVerCode(data) {
  return request({
    url: '/sendemail/',
    method: 'put',
    data
  })
}
/**
 * 验证邮箱的验证码是否输入的正确
 */
export function checkemailcode(str) {
  return request({
    url: '/verifyemail/' + str,
    method: 'get'
  })
}
/**
 * 系统配置数据的获取
 */
export function getSystemSet() {
  return request({
    url: '/messagenotices/',
    method: 'get'
  })
}
/**
 * 系统配置数据的修改
 */
export function editSystemSet(data) {
  return request({
    url: '/messagenotices/',
    method: 'put',
    data
  })
}
