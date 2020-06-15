import request from '@/utils/request'

/**
 * 获取算法管理数据相关
 */

// 单一算法内容的增删改操作接口
export function postAlgorithmData(data) {
  return request({
    url: '/setalgstructure/',
    method: 'post',
    data
  })
}
// 获取算法数据接口
export function getAlgorithmData(query) {
  return request({
    url: '/getalgstructure/',
    method: 'get',
    params: query
  })
}
// 完整算法树数据接口
export function postAlgorithmTreeData() {
  return request({
    url: '/getuserconfig/treealg/',
    method: 'post'
  })
}
// 算法树中目录增删改操作接口
export function postAlgorithmTreeFolderNodeData(data) {
  return request({
    url: '/getuserconfig/setalgtree/',
    method: 'post',
    data
  })
}
