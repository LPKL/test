import request from '@/utils/request'
/**
 * 获取一个实时流
 */
export function getOneRealtimeFlow(originId, modelId) {
  return request({
    url: '/datasources/' + originId + '/models/' + modelId + '/streaming/',
    method: 'get'
  })
}
// 以上是部分更新的接口
/**
 * 文件列表信息获取
 */
//
//
//
//
//
//
//
//
//
// 修改文件列表信息
export function uploadDataList(data) {
  const p = { data_model: data.data_model }
  const str = JSON.stringify(p)
  return request({
    url: '/datasrc/hist/' + data.id + '/',
    method: 'put',
    data: str
  })
}
// 历史数据的查询
export function getDataList(query) {
  return request({
    url: '/datasrc/hist/',
    method: 'get',
    params: query
  })
}

// /**
//  * 关于hive表的操作
// 添加hive表
export function addHiveData(data) {
  return request({
    url: '/datasrc/hive/',
    method: 'post',
    data
  })
}
/**
 * 删除hive数据
 */
export function deleteHiveData(id) {
  return request({
    url: '/datasrc/hive/' + id + '/',
    method: 'delete'
  })
}
/**
 * 测试hive文件是否存在
 */
export function testHive(id) {
  return request({
    url: '/datasrc/hive/' + id + '/' + '?query_type=link',
    type: 'get'
  })
}
export function realDataList(query) {
  return request({
    url: '/configkafkas/',
    method: 'get',
    params: query
  })
}

/**
 * 删除文件操作
 */
export function delFile(id) {
  return request({
    url: '/configfiles/' + id + '/',
    method: 'delete'
  })
}

/**
 * 获取设备列表
 */
export function dataJzList(query) {
  return request({
    url: '/configjzs/',
    method: 'get',
    params: query
  })
}

/**
 * 获取数据库表列表
 */
export function dataTableList(query) {
  return request({
    url: '/configtables/',
    method: 'get',
    params: query
  })
}

/**
 * 获取数据库列表
 */
export function dataDbList(query) {
  return request({
    url: '/configdatabases/',
    method: 'get',
    params: query
  })
}
export function getJDTList(query) {
  return request({
    url: '/getjzdbtables/',
    method: 'get',
    params: query
  })
}

/**
 * 文件上传
 */
export function fileUpload(data) {
  return request({
    url: '/datasrc/hist/',
    method: 'post',
    data
  })
}
// export function fileUpload(data) {
//   return request({
//     url: '/datasrc/hist/',
//     method: 'post',
//     data
//   }, {
//     'Content-Type': 'multipart/form-data'
//   })
// }
/**
 * 删除数据源
 */
export function deleteOrigin(data) {
  const str = JSON.stringify(data)
  return request({
    url: '/datasrc/hist/' + data.id + '/',
    method: 'delete',
    data: str
  })
}
// /**
//  * 数据流程添加项目
//  */
// export function addModelProject(data) {
//   return request({
//     url: '/experiments/',
//     method: 'post',
//     data
//   })
// }

/**
 * 获取某设备的所有流程项目
 */
export function getModelProject(query) {
  console.log(query)
  return request({
    url: '/experiments/',
    method: 'get',
    params: query
  })
}

/**
 * 获取单个流程项目信息详情
 */
export function getOneModelProject(id) {
  return request({
    url: '/experiments/' + id + '/',
    method: 'get'
  })
}

/**
 * 更新某个流程项目
 */
export function upDateModelProject(data, id) {
  return request({
    url: '/experiments/' + id + '/',
    method: 'patch',
    data

  })
}

/**
 * 添加实时流程项目
 */
export function addRealProject(data) {
  return request({
    url: '/modelprojectrealtimes/',
    method: 'post',
    data
  })
}

/**
 * 流程节点数据可视化 chart save and get
 * @param method
 * @param data
 */
export function savegetDataVisualchart(method, data) {
  if (method === 'get') {
    return request({
      url: '/datavisualchart/',
      method: method,
      params: data
    })
  }
  return request({
    url: '/datavisualchart/',
    method: method,
    data
  })
}
/**
 * 获取所有流程项目列表
 */
export function getRealProject(query) {
  return request({
    url: '/modelprojectrealtimes/',
    method: 'get',
    params: query
  })
}

/**
 * 获取一个实时流程项目信息
 */
export function getOneRealProject(id) {
  return request({
    url: '/modelprojectrealtimes/' + id + '/',
    method: 'get'
  })
}

/**
 * 删除一个实时流程
 */
export function delRealProject(id) {
  return request({
    url: '/modelprojectrealtimes/' + id + '/',
    method: 'delete'
  })
}

/**
 * 更新一个实时流程
 */
export function upDateRealProject(data, id) {
  return request({
    url: '/modelprojectrealtimes/' + id + '/',
    method: 'put',
    data
  })
}
// 添加一个项目名
export function addDataProject(data) {
  return request({
    url: '/experiments/',
    method: 'post',
    data
  })
}

/**
 * 数据实验数据探查添加
 * @param id 实验id
 */
export function addDataExperiments(id, data) {
  return request({
    url: `/experiments/${id}/data_explorations/`,
    method: 'post',
    data
  })
}
// 获取所有的项目名称
export function getAllProject() {
  return request({
    url: '/experiments/current_user_all/',
    method: 'get'
  })
}
/**
 * 在此处运行流程
 */
export function getHistoryProjects() {
  return request({
    url: '/gethistoryprojects/',
    method: 'get'
  })
}

/**
 * 模型保存 authuser_id,project_id,node_id,flag
 * flag = "save_data"  # 两个值，save_data：表示数据保存 model_evaluation:模型评估 save_model:模型保存
 */
export function runCurrentNodesSave(data) {
  return request({
    url: '/models/',
    method: 'post',
    data
  })
}

/**
 * 旧 数据预览，模型可视化，模型评估，预测数据和评估结果
 * 历史建模右键操作-数据另存、模型评估 authuser_id,project_id,node_id,flag
 * flag = "save_data"  # 两个值，save_data：表示数据保存 model_evaluation:模型评估 save_model:模型保存
 */
export function runCurrentNodes(data) {
  return request({
    url: '/runcurrentnodes/',
    method: 'post',
    data
  })
}

/**
 * 1.7.0新接口
 * 数据探查配置信息获取
 */
export function getDataExpConf(id, query) {
  return request({
    url: `/experiments/${id}/data_explorations/`,
    method: 'get',
    params: query
  })
}

/**
 * 数据流程节点运行完数据保存请求
 * @param node_id
 */
export function saveDataFlowNode(node_id, data) {
  return request({
    url: '/menuoptions/' + node_id + '/save_data/',
    method: 'post',
    data
  })
}

/**
 * 数据流程节点获取可用字段（包含特征列等新生字段）
 * @param experiment_id node_id
 */
export function getFlowNodeAvailableFields(experiment_id, node_id) {
  return request({
    url: '/experiments/' + experiment_id + '/nodes/' + node_id + '/output_schema/',
    method: 'get'
  })
}

/**
 * 流程管理处的操作
 * 数据流程
 * @param query
 */
export function getManageModelProjects(query) {
  return request({
    url: '/experiments/current_user/',
    method: 'get',
    params: query
  })
}
/**
 * 数据流程的搜索操作
 */
export function filterDataProject(data) {
  return request({
    url: '/experiments/search/',
    method: 'get',
    params: data
  })
}
/**
 *数据流程的删除操作
 */
export function deleteManageProject(id) {
  return request({
    url: '/experiments/' + id + '/',
    method: 'delete'
  })
}

/**
 * 实时流程数据的获取
 * @param query
 */
export function getShiProject(query) {
  return request({
    url: '/realtimeproject/',
    method: 'get',
    params: query
  })
}
/**
 * 实时流程数据的搜索
 */
export function filterShiProject(query) {
  const str = '?fuzzy_real_src_name=' + query.fuzzy_real_src_name + '&page=' + query.page
  return request({
    url: '/realtimeproject/' + str,
    method: 'get'
  })
}
/**
 * 实时流程的删除
 */
export function deleteShiProject(id) {
  return request({
    url: '/realtimeproject/' + id + '/',
    method: 'delete'
  })
}
/**
 * 历史流程预览数据
 * @param query
 */
export function modelProjectDataPreviews(query) {
  return request({
    url: '/modelprojectdatapreviews/',
    method: 'get',
    params: query
  })
}

/**
 * 获取数据管理文件预览
 * @param query (file_id=?)
 */
export function getFileDataPreviews(query) {
  return request({
    url: '/getfiledatapreviews/',
    method: 'get',
    params: query
  })
}

export function getHistoryDataPreview(query) {
  return request({
    url: '/gethistorydatapreviewviews/',
    method: 'get',
    params: query
  })
}
/**
 * 获取参数或数据时使用
 * GET：project_id node_id  type  tree_id；
 * @param query
 */
// export function getTreeNodeIdParams(exp_id, node_id, query) {
//   const data = { project_id: exp_id, node_id: node_id, ...query }
//   return request({
//     url: '/clicknode/',
//     method: 'get',
//     params: data
//   })
// }

/**
 * 更新参数时使用
 * POST:project_id node_id type tree_id  func_args
 * @param data
 */
// export function updateTreeNodeIdParams(exp_id, node_id, d) {
//   const data = { project_id: exp_id, node_id: node_id, ...d }
//   return request({
//     url: '/clicknode/',
//     method: 'post',
//     data
//   })
// }
// /**
//  * 获取参数或数据时使用
//  * GET：project_id node_id  type  tree_id；
//  * @param query
//  */
export function getTreeNodeIdParams(exp_id, node_id, query) {
  return request({
    url: '/experiment/' + exp_id + '/node/' + node_id + '/',
    method: 'get',
    params: query
  })
}

// /**
//  * 更新参数时使用
//  * POST:project_id node_id type tree_id  func_args
//  * @param data
//  */
export function updateTreeNodeIdParams(exp_id, node_id, data) {
  return request({
    url: '/experiment/' + exp_id + '/node/' + node_id + '/parameters/',
    method: 'post',
    data
  })
}
/**
 * 创建实验节点post
 * POST：project_id node_id  data；
 * @param query
 */
export function createExperimentNode(exp_id, node_id, data) {
  return request({
    url: '/experiment/' + exp_id + '/node/' + node_id + '/',
    method: 'post',
    data
  })
}
/**
 * 获取右键菜单请求 todo 废弃
 * get:experiment_id node_id
 * @param data
 */
export function getRightKeyMenu(query) {
  return request({
    url: '/getrcmenu/',
    method: 'get',
    params: query
  })
}
/**
 * 获取右键菜单请求
 * get:experiment_id node_id
 * @param data
 */
export function getMenuOption(query) {
  return request({
    url: '/menuoptions/',
    method: 'get',
    params: query
  })
}
/**
 * 查询实时流程的某条数据
 */
export function getShiSingle(str) {
  return request({
    url: '/realtimeproject/' + str,
    method: 'get'
  })
}
/**
 * 删除文件操作
 */
export function delNodesParams(pro_id, node_id, data) {
  return request({
    url: '/experiment/' + pro_id + '/node/' + node_id + '/parameters/',
    method: 'delete',
    data
  })
}
