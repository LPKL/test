/**
 * “群组管理”相关接口
 */
import request from '@/utils/request'

/**
 * 添加群组
 * @param data
 */
export function addRole(data) {
  return request({
    url: '/authgroups/',
    method: 'post',
    data
  })
}

/**
 * 删除群组
 * @param data
 */
export function deleteRole(data) {
  let str = ''
  data.status ? str = '/authgroups/' + data.id + '/?status=' + data.status : str = '/authgroups/' + data.id + '/'
  return request({
    url: str,
    method: 'delete'
  })
}
/**
 * 验证群组名或者群组英文名是否已经被使用
 *  */
export function checkName(str) {
  return request({
    url: '/verifyfields/' + str,
    method: 'get'
  })
}
/**
 * 查询群组
 * @param queryParam
 * @param pagePara
 */
export function queryRole() {
  return request({
    url: '/authgroups/',
    method: 'get'
  })
}
/**
 * 更新群组
 * @param data
 */
export function updateRole(id, data) {
  return request({
    url: '/authgroups/' + id + '/',
    method: 'put',
    data
  })
}

/**
 * 更新群组的权限
 * @param perm
 */
export function updateRolePerms(id, data) {
  return request({
    url: '/updateurls/' + id + '/',
    method: 'post',
    data
  })
}
/**
 * 更新权限
 * 接口部分删除
 * @param perm
 */
export function deletePermApi(id, data) {
  return request({
    url: '/updateurls/' + id + '/',
    method: 'delete',
    data
  })
}
/**
 * 添加群组的权限
 * @param perm
 */
export function addRolePerm(data) {
  return request({
    url: '/authgroups/perm',
    method: 'post',
    data
  })
}

/**
 * 删除群组的权限
 * @param perm
 */
export function deleteRolePerm(data) {
  return request({
    url: '/authgroups/perm',
    method: 'delete',
    data
  })
}

/**
 * 查选群组的所有权限值
 * @param rid
 */
export function findRolePerms(rid) {
  return request({
    url: '/authgroups/' + rid + '/',
    method: 'get'
  })
}
/**
 * 获取所有权限
 * @param data
 */
export function getAllPerms(id, data) {
  const idx = id ? id + '/' : ''
  let mothed = ''
  data ? mothed = 'put' : mothed = 'get'
  return request({
    url: '/authperms/' + idx,
    method: mothed,
    data
  })
}

/**
 * 更新群组权限
 * @param perm
 */
export function updateGroupPerms(id, data) {
  return request({
    url: '/authgroups/' + id + '/',
    method: 'put',
    data
  })
}
/**
 * 删除群组权限
 * @param perm
 */
export function deleteroleperm(id, data) {
  return request({
    url: '/updateperms/' + id + '/',
    method: 'delete',
    data
  })
}
/**
 * 群组权限修改
 * 可以多选
 * @param perm
 */
export function updatePerms(id, data) {
  return request({
    url: '/updateperms/' + id + '/',
    method: 'post',
    data
  })
}

/**
 * 更新权限
 * 接口部分
 * @param perm
 */
export function updateperms(id, data) {
  return request({
    url: '/authperms/' + id + '/',
    method: 'put',
    data
  })
}
/**
 * 新增权限
 * @param perm
 */
export function addPerms(data) {
  return request({
    url: '/authperms/',
    method: 'post',
    data
  })
}
/**
 * 删除权限
 * @param perm
 */
export function deleteperms({ id }) {
  return request({
    url: '/authperms/' + id + '/',
    method: 'delete'
  })
}
/**
 * 获取所有的菜单
 * */
export function allMenus(id) {
  return request({
    url: '/authmenus/',
    method: 'get'
  })
}
/**
 * 群组的搜索以及对应页数展示的数据
 * */
export function searchRoleMessage(data) {
  return request({
    url: '/authgroups/' + data,
    method: 'get'
  })
}
/**
 * 获取当前登陆用户所在群组的权限
 */
export function getselfPerms() {
  return request({
    url: '/getgroupperm/',
    method: 'get'
  })
}
