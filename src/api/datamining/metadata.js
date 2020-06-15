import request from '@/utils/request'
// 获取元数据
export function getMetadata() {
  return request({
    url: '/metadatas/',
    method: 'get'
  })
}
// 添加元数据
export function addMetadata(data) {
  return request({
    url: '/metadatas/',
    method: 'post',
    data
  })
}
// 搜索元数据
export function searchMetadata(query) {
  return request({
    url: '/metadatas/search/',
    method: 'get',
    params: query
  })
}
// 编辑元数据
export function editMetadata(id, data) {
  return request({
    url: `/metadatas/${id}/`,
    method: 'patch',
    data
  })
}
// 删除某条元数据
export function deleteMetadata(id) {
  return request({
    url: `/metadatas/${id}/`,
    method: 'delete'
  })
}
// 获取某条元数据的所有字段
export function getMetadataFields(id, query) {
  return request({
    url: `/metadatas/${id}/fields/`,
    method: 'get',
    params: query
  })
}
export function getallFields(id) {
  return request({
    url: `/metadatas/${id}/fields/name/`,
    method: 'get'
  })
}
// 添加字段
export function addFieldsData(id, data) {
  return request({
    url: `/metadatas/${id}/fields/`,
    method: 'post',
    data
  })
}
// 编辑字段
export function editFields(metadata_id, field_id, data) {
  return request({
    url: `/metadatas/${metadata_id}/fields/${field_id}/`,
    method: 'patch',
    data
  })
}
// 删除单个字段
export function deleteSingleFileds(metadata_id, field_id) {
  return request({
    url: `/metadatas/${metadata_id}/fields/${field_id}/`,
    method: 'delete'
  })
}
// 搜索字段
export function searchFieldsName(metadata_id, query) {
  return request({
    url: `/metadatas/${metadata_id}/fields/search/`,
    method: 'get',
    params: query
  })
}
// 获取某条字段
export function getOneFieldData(field_id) {
  return request({
    url: `/metadatas/0/fields/${field_id}/`,
    method: 'get'
  })
}
// 批量删除字段
export function multipleDelete(metadata_id, data) {
  return request({
    url: `/metadatas/${metadata_id}/fields/`,
    method: 'delete',
    data
  })
}
// 批量移动字段
export function multipleMove(metadata_id, data) {
  return request({
    url: `/metadatas/${metadata_id}/fields/move/`,
    method: 'put',
    data
  })
}
// 用上传的csv文件去匹配元数据中的字段
export function getFieldsInSchema(data) {
  return request({
    url: '/metadatas/match/',
    method: 'post',
    data
  })
}
