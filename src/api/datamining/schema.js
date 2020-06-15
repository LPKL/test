import request from '@/utils/request'
// 创建表结构
export function addSchemaData(data) {
  return request({
    url: '/schemas/',
    method: 'post',
    data
  })
}
// 修改表结构
export function editSchemaData(id, data) {
  return request({
    url: '/schemas/' + id + '/',
    method: 'put',
    data
  })
}
// 获取所有表结构
export function getAllSchema(query) {
  return request({
    url: '/schemas/',
    method: 'get',
    params: query
  })
}
// 删除一条表结构
export function deleteschema(schema_id) {
  return request({
    url: `/schemas/${schema_id}/`,
    method: 'delete'
  })
}
// 获取表结构的名字和id
export function getSchemaNameList() {
  return request({
    url: '/schemas/name/',
    method: 'get'
  })
}
