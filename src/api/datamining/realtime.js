import request from '@/utils/request'

/**
 * 获取实时流程左侧树形结构
 */
export function getRealTree() {
  return request({
    url: '/getrealtimetree/',
    method: 'post'
  })
}
/**
 * 实时流程运行操作即实时监测请求开始
 * @param data
 */
export function runRealTree(data) {
  return request({
    url: '/realtimetopologypysparks/',
    method: 'get',
    params: data
  })
}

/**
 * 实时流程右侧kafka字段、方案、算法模型信息显示
 * @param data = project_id,authuser_id
 */

export function getRealflowData(data) {
  return request({
    url: '/realtimepageargs/',
    method: 'get',
    params: data
  })
}

/**
 * 实时流程管理操作
 * data:{
 *   pro_id:流程ＩＤ
 *   jz_id：设备id
 *   flag： 0->stop //停止运行
 *         1->run //运行
 *         2->stop all //停止所有
 * }
 * @param data
 */
export function setRealProjectStatus(data) {
  return request({
    url: '/rpsc/',
    method: 'post',
    data
  })
}

/**
 * 切换监测设备
 * @param data
 */
export function changeCurrentMonitor(data) {
  return request({
    url: '/realchangejz/',
    method: 'post',
    data
  })
}

/**
 * 实时监测保存,获取功能
 * @param data
 */
export function realTimeMonitorChart(data) {
  let temp = {}
  if (!data) {
    temp = {
      url: '/realtimemonitorchart/',
      method: 'get'
    }
    return request(temp)
  } else {
    return request({
      url: '/realtimemonitorchart/',
      method: 'post',
      data
    })
  }
}
