import request from '@/utils/request'

// 保存实验数据到历史数据
export function saveExperimentDataSet(experiment_id, node_id, data) {
  return request({
    url: '/experiments/' + experiment_id + '/nodes/' + node_id + '/data_save/dataset',
    method: 'post',
    data
  })
}

// 下载实验数据到CSV
export function downloadExperimentData(experiment_id, node_id, data) {
  return request({
    url: '/experiments/' + experiment_id + '/nodes/' + node_id + '/data_save/csv',
    method: 'post',
    data,
    responseType: 'blob'
  })
}

// 保存探查数据到历史数据
export function saveExplorDataSet(experiment_id, node_id, data) {
  return request({
    url: '/experiments/' + experiment_id + '/nodes/' + node_id + '/data_explor/export/dataset',
    method: 'post',
    data
  })
}
// 下载探查数据到CSV
export function downloadExplorData(experiment_id, node_id, data) {
  return request({
    url: '/experiments/' + experiment_id + '/nodes/' + node_id + '/data_explor/export/csv',
    method: 'post',
    data,
    responseType: 'blob'
  })
}
