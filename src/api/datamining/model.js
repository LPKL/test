import request from '@/utils/request'
// 获取所有模型
export function getAllModelData(query) {
  return request({
    url: '/models/',
    method: 'get',
    params: query
  })
}
/**
 * 获取模型可用的数据源
 */
export function getModelCanUseOrigin(id) {
  return request({
    url: '/models/' + id + '/relevant_datasources/',
    method: 'get'
  })
}
/**
 * 更新模型
 */
export function uploadModel(id, data) {
  return request({
    url: '/models/' + id + '/',
    method: 'patch',
    data
  })
}
/**
 * 搜索模型
 */
export function searchModel(query) {
  return request({
    url: '/models/search/',
    method: 'get',
    params: query
  })
}
/**
 * 获取该模型已关联的实时源
 */
export function getModelRelateOrigin(id) {
  return request({
    url: '/models/' + id + '/datasources/',
    method: 'get'
  })
}
// 以上是更新的接口
//
//
//
//
//
//
//
//
//
//
// 获取通过实时源过滤的模型
export function getHaveGuidModel(id) {
  return request({
    url: '/datasources/' + id + '/relevant_models/',
    method: 'get'
  })
}
/**
 * 获取所有模型
 */
// 获取当前用户所有可见模型数据，无分页
export function getCurrentUserAllModel() {
  return request({
    url: '/models/current_user_all/',
    method: 'get'
  })
}
// 获取所有用户可见模型数据，无分页
export function getAllUsersModel() {
  return request({
    url: '/models_and_pipelines/all/ ',
    method: 'get'
  })
}
export function getAllModel(query, id) {
  let temp = '/models/'
  id ? temp = temp + id + '/' : ''
  return request({
    url: temp,
    method: 'get',
    params: query
  })
}
// 查询模型数据
export function filterModel(query) {
  return request({
    url: '/models/' + '?fuzzy_model_name=' + query.fuzzy_model_name + '&page=' + query.page,
    method: 'get'
  })
}
/**
 * 删除模型
 */
export function deleteModel(id) {
  return request({
    url: '/models/' + id + '/',
    method: 'delete'
  })
}
/**
 * 获取模型管理数据相关
 */
export function preModelDataList(query) {
  return request({
    url: '/pretreatmodel/',
    method: 'get',
    params: query
  })
}
// 更新一个预处理模型
export function updatePretreatModel(data, id) {
  return request({
    url: '/pretreatmodel/' + id + '/',
    method: 'put',
    data
  })
}
// 删除一个预处理模型
export function delPretreatModel(id) {
  return request({
    url: '/pretreatmodel/' + id + '/',
    method: 'delete'
  })
}
// 获取已训练模型列表
export function trainedModelDataList(query) {
  return request({
    url: '/trainedmodel/',
    method: 'get',
    params: query
  })
}
// 更新一个已训练模型
export function updateTrainedModel(data, id) {
  return request({
    url: '/trainedmodel/' + id + '/',
    method: 'put',
    data
  })
}
// 删除一个已训练模型
export function delTrainedModel(id) {
  return request({
    url: '/trainedmodel/' + id + '/',
    method: 'delete'
  })
}

// 获取同组用户
export function authOrization(query) {
  return request({
    url: '/authorization/',
    method: 'get',
    params: query
  })
}

export function updateAuthOrization(data, id) {
  return request({
    url: '/authorization/' + id + '/',
    method: 'put',
    data
  })
}
/**
 * 模型的下载
 */
export function downloadModel(data) {
  return request({
    url: '/datamodeldownload/',
    method: 'post',
    data
  })
}

// 所有实时源
export function getDataSourceOrigin() {
  return request({
    url: '/datasources/all',
    method: 'get'
  })
}

/**
 * 获取所有用户创建的pipeline和model
 */
export function getAllPipelineModel() {
  return request({
    url: '/models_and_pipelines/all',
    method: 'get'
  })
}

/**
 * 获取当前用户用户创建的pipeline和model
 */
export function getCurPipelineModel() {
  return request({
    url: '/models_and_pipelines/current_user_all',
    method: 'get'
  })
}

// 通过模型(model)id获取dataset
export function getModelDatasetById(id) {
  return request({
    url: '/models/' + id + '/dataset/',
    method: 'get'
  })
}
