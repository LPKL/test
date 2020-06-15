/**
 * atlas相关接口
 */
import request from '@/utils/request'
/**
 * 获取atlas 标准值
 */
export function getAtlasStandValue(id, data) {
  return request({
    url: '/datasets/' + id + '/schema/',
    method: 'post',
    data
  })
}

// 获取元数据名称和id列表，不分页
export function getAllMetaDatasName() {
  return request({
    url: '/metadatas/name',
    method: 'get'
  })
}
// 获取单一元数据的所有字段名称和id列表，不分页
export function getAllMetadataFieldsName(metadata_id) {
  return request({
    url: '/metadatas/' + metadata_id + '/fields/name',
    method: 'get'
  })
}
// 获取单一元数据的字段详情
export function getMetadataFieldInfo(metadata_id, field_id) {
  return request({
    url: '/metadatas/' + metadata_id + '/fields/' + field_id,
    method: 'get'
  })
}
