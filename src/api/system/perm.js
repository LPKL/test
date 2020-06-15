/**
 * “权限管理”相关接口
 */
import request from '@/utils/request'
/**
 * 添加权限
 * @param data
 */
export function addPerm(data) {
  return request({
    url: '/sys_perm',
    method: 'post',
    data
  })
}

/**
 * 同步菜单权限数据
 * @param data
 */
export function syncMenuPerms(permArr) {
  return request({
    url: '/register/',
    method: 'post',
    data: permArr
  })
}
/**
 * 同步接口权限数据
 * @param data
 */
export function syncApiPerms(permArr) {
  return request({
    url: '/sys_perm/sync/api',
    method: 'post',
    data: permArr
  })
}

/**
 * 删除权限
 * @param data
 */
export function deletePerm(data) {
  return request({
    url: '/sys_perm',
    method: 'delete',
    data
  })
}

/**
 * 更新权限
 * @param data
 */
export function updatePerm(data) {
  return request({
    url: '/sys_perm/info',
    method: 'patch',
    data
  })
}

/**
 * 查询接口权限元数据
 * @param perm
 */
export function listApiPermMetadata() {
  return request({
    url: '/authurls/',
    method: 'get'
  })
}

/**
 * 列出所有菜单、按钮、接口等权限
 * @param perm
 */
export function listAllPermissions() {
  return request({
    url: '/sys_perm/list/all',
    method: 'get'
  })
}

/**
 * 列出按钮权限，按parent字段分组
 * @param perm
 */
export function listBtnPermGroupByParent() {
  return request({
    url: '/sys_perm/list/btn_perm_map',
    method: 'get'
  })
}

/**
 * 搜索权限,以及分页显示的数据
 */
export function searchPermMessage(data) {
  return request({
    url: '/authperms/' + data,
    method: 'get'
  })
}
