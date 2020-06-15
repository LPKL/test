import request from '@/utils/request'
/**
 * 数据流程pipeline保存
 * @param node_id
 */
export function createPipeline(data) {
  return request({
    url: '/pipelines/',
    method: 'post',
    data
  })
}

export function getAllPipelines(data) {
  return request({
    url: '/pipelines/',
    method: 'get',
    params: data
  })
}

/**
 * 获取单个pipeline详情信息
 * @param id
 * @param data
 */
export function getPipeline(id, data) {
  return request({
    url: '/pipelines/' + id + '/',
    method: 'get',
    params: data
  })
}
/**
 * 获取单个pipeline详情信息
 * @param id
 * @param data
 */
export function deletePipeline(id) {
  return request({
    url: '/pipelines/' + id + '/',
    method: 'delete'
  })
}
/**
 * 获取单个pipeline详情 panel信息
 * @param id
 * @param data
 */
export function getPipelinePanel(id, data) {
  return request({
    url: '/pipelines/' + id + '/panel/',
    method: 'get',
    params: data
  })
}
/**
 * 编辑pipeline
 * @param id
 * @param data
 */
export function updatePipeline(id, data) {
  return request({
    url: '/pipelines/' + id + '/',
    method: 'patch',
    data
  })
}

/**
 * 更新pipeline panel信息
 * @param id
 * @param data
 */
export function putPipelinePanel(id, data) {
  return request({
    url: '/pipelines/' + id + '/panel/',
    method: 'put',
    data
  })
}

/**
 * 搜索pipeline
 * @param query
 */
export function searchPipelines(query) {
  return request({
    url: '/pipelines/search/',
    method: 'get',
    params: query
  })
}

/**
 * 获取参数
 * @param query
 */
export function getPipelineParams(id, node_id, query) {
  return request({
    url: `/pipelines/${id}/nodes/${node_id}/parameters/`,
    method: 'get',
    params: query
  })
}

/**
 * 获取参数
 * @param query
 */
export function getPipelineIdsParams(id, query) {
  return request({
    url: `/pipelines/${id}/nodes/`,
    method: 'get',
    params: query
  })
}

/**
 * 更新参数
 * @param query
 */
export function updatePipelineParams(id, node_id, data) {
  return request({
    url: `/pipelines/${id}/nodes/${node_id}/parameters/`,
    method: 'post',
    data
  })
}

/**
 * 保存
 * @param query
 */
export function updatePipelineSave(id, data) {
  return request({
    url: `/pipelines/${id}/compiler/`,
    method: 'patch',
    data
  })
}

export function resetPipelineContent(id) {
  return request({
    url: `/pipelines/${id}/empty_temporary/`,
    method: 'delete'
  })
}

/**
 * 获取pipeline关联的实时源
 * @param id
 */
export function pipelineWithSource(id, data) {
  return request({
    url: `/pipelines/${id}/associate_datasources/`,
    method: 'post',
    data
  })
}

/**
 * 获取pipeline关联的实时源
 * @param id
 */
export function getPipelineForSource(id) {
  return request({
    url: `/pipelines/${id}/datasources/`,
    method: 'get'
  })
}

// 通过组合模型(pipeline)id获取dataset
export function getPipelineDatasetById(id) {
  return request({
    url: '/pipelines/' + id + '/dataset/',
    method: 'get'
  })
}
