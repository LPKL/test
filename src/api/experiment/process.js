import request from '@/utils/request'
// 流程处理
export function sliderMenu() {
  return request({
    url: '/getuserconfig/tree/',
    method: 'post'
  })
}

export function sliderItem(data) {
  return request({
    url: '/getuserconfig/get_by_typeid/',
    method: 'post',
    data
  })
}
// yuchuli
export function etlfileDetail(query) {
  return request({
    url: '/etlfiledetail/',
    method: 'get',
    params: query
  })
}
export function getEtlOperate(id) {
  const data = new FormData()
  data.append('type_id', 20)
  data.append('model_type', 'ConfigETLOperate')
  data.append('user_id', id)
  return request({
    url: '/getuserconfig/get_by_typeid/',
    method: 'post',
    data
  })
}

export function runProjectEtl(data) {
  return request({
    url: '/runprojectetl/',
    method: 'post',
    data
  })
}

export function getPlans() {
  return request({
    url: '/modeletlplans/',
    method: 'get'
  })
}
export function upDatePlan(data, id) {
  return request({
    url: '/modeletlplans/' + id + '/',
    method: 'put',
    data
  })
}
export function deletePlan(id) {
  return request({
    url: '/modeletlplans/' + id + '/',
    method: 'delete'
  })
}
export function addPlan(data) {
  return request({
    url: '/modeletlplans/',
    method: 'post',
    data
  })
}
export function analyzeFuncs(query) {
  return request({
    url: '/configanalyzefuncs/',
    method: 'get',
    params: query
  })
}

export function analyzeFuncArgs(query) {
  return request({
    url: '/configanalyzeargs/',
    method: 'get',
    params: query
  })
}
/** 设置当前方案****/
export function setCurrentPlan(query) {
  return request({
    url: '/setdataetluseplan/',
    method: 'get',
    params: query
  })
}
