import request from '@/utils/request'
/**
 * 获取所有的数据集
 */
export function getAlldataFile(query) {
  return request({
    url: '/datasets/',
    method: 'get',
    params: query
  })
}
/**
 * 删除一条数据集
 */
export function deleteDataFile(id) {
  return request({
    url: '/datasets/' + id + '/',
    method: 'delete'
  })
}
// 上传一个csv文件
export function uploadCsvData(data) {
  return request({
    url: '/datasets/upload',
    method: 'post',
    data
  })
}
/**
 * 创建数据集
 */
export function addDataList(data) {
  return request({
    url: '/datasets/',
    method: 'post',
    data
  })
}
// 移除上传的csv文件
export function remoteCsvFile(str) {
  return request({
    url: '/datasets/files/' + str + '/',
    method: 'delete'
  })
}
// 数据预览
export function previewFileData(id) {
  return request({
    url: '/datasets/' + id + '/preview/',
    method: 'get'
  })
}
// 执行数据统计
export function statisticRun(id) {
  return request({
    url: '/datasets/' + id + '/statistic/',
    method: 'put'
  })
}
// 数据统计结果
export function statisticFileData(id) {
  return request({
    url: '/datasets/' + id + '/statistic/',
    method: 'get'
  })
}
// api整理
/**
 * 表结构的获取schema
 */
export function getOriginData(str) {
  return request({
    url: '/schemas/',
    method: 'get'
  })
}
// 获取schema的名称
export function getSchemaName() {
  return request({
    url: '/schemas/name/',
    method: 'get'
  })
}
// 通过id过去schema
export function getSchemaById(schema_id) {
  return request({
    url: `/schemas/${schema_id}/`,
    method: 'get'
  })
}
// 获取数据表名
export function getDataFile(name) {
  return request({
    url: '/databases/' + name + '/tables/',
    method: 'get'
  })
}
// 获取一个schema
export function getOneSchema(data, str) {
  const schemaUrl = str ? '/databases/' + data.database_name + '/tables/' + data.table_name + '/schema/' + '?' + str : '/databases/' + data.database_name + '/tables/' + data.table_name + '/schema/'
  return request({
    url: schemaUrl,
    method: 'get'
  })
}
// 获取表结构名字列表
export function getSchemaNameList() {
  return request({
    url: '/schemas/name/',
    method: 'get'
  })
}
/**
 * 关于hive表的操作
 */
// 获取数据库
export function getDataBase(query) {
  return request({
    url: '/databases/',
    method: 'get',
    params: query
  })
}
export function dataList(query) {
  return request({
    url: '/datasrc/hist/',
    method: 'get',
    params: query
  })
}
// 新创建的数据集的名称是否重复
export function nameIsUsed(data) {
  return request({
    url: '/datasets/verify/',
    method: 'post',
    data
  })
}
