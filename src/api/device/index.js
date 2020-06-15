import request from '@/utils/request'
// 获取所有的群组
export function allgroup() {
  const str = '?status=2'
  return request({
    url: '/authgroups/' + str + '/',
    method: 'get'
  })
}
// 设备信息处的搜索
export function searchDbNessage(str) {
  return request({
    url: '//',
    method: 'get'
  })
}
// 获取所有的设备信息
export function getdeviecinfo(val) {
  let str = '?status=1'
  val ? str += '&' + val : ''
  return request({
    url: '/configjzs/' + str,
    method: 'get'
  })
}
// 添加设备
export function addcrew(data) {
  return request({
    url: '/configjzs/',
    method: 'post',
    data
  })
}
// 删除设备
export function deletecrew(id) {
  return request({
    url: '/configjzs/' + id + '/',
    method: 'delete'
  })
}
// 更新设备信息
export function updatacrew(id, data) {
  return request({
    url: '/configjzs/' + id + '/',
    method: 'put',
    data
  })
}
// 获取历史数据下所有的数据库信息,以及设备的数据获取
export function getallhisdb(id) {
  const str = id ? '/configdatabases/' + id : '/configdatabases/'
  return request({
    url: str,
    method: 'get'
  })
}
// 数据库信息内做的添加操作
export function addhisdb(data) {
  return request({
    url: '/configdatabases/',
    method: 'post',
    data
  })
}
// 在历史数据下所有的数据库信息内做的修改操作
export function changedb(id, data) {
  return request({
    url: '/configdatabases/' + id + '/',
    method: 'put',
    data
  })
}
// 在历史数据下所有的数据库信息内做的删除操作
export function deletedb(id) {
  return request({
    url: '/configdatabases/' + id + '/',
    method: 'delete'
  })
}

// 获取历史数据下所有的数据表信息
export function getallshitab(id) {
  const str = id ? '/configtables/' + id : '/configtables/'
  return request({
    url: str,
    method: 'get'
  })
}

// 数据表信息下做的添加操作
export function addtab(data) {
  return request({
    url: '/configtables/',
    method: 'post',
    data
  })
}
// 数据表信息下做的修改操作
export function changetab(id, data) {
  return request({
    url: '/configtables/' + id + '/',
    method: 'put',
    data
  })
}
// 数据表信息下做的删除操作
export function deletetab(id) {
  return request({
    url: '/configtables/' + id + '/',
    method: 'delete'
  })
}

// 获取所有的实时数据
export function getallshi(id) {
  const str = id ? '/configkafkas/' + id : '/configkafkas/'
  return request({
    url: str,
    method: 'get'
  })
}
// 在所有的实时数据下做的添加操作
export function allshiadd(data) {
  return request({
    url: '/configkafkas/',
    method: 'post',
    data
  })
}
// 在所有的实时数据下做的修改操作
export function allshichange(id, data) {
  return request({
    url: '/configkafkas/' + id + '/',
    method: 'put',
    data
  })
}
// 在所有的实时数据下做的删除操作
export function allshidelete(id) {
  return request({
    url: '/configkafkas/' + id + '/',
    method: 'delete'
  })
}
/**
 * 测试数据库的英名有没有被使用
 *  */
export function testdbEname(str) {
  const temp = '?database_name=' + str
  return request({
    url: '/configdatabases/' + temp,
    method: 'get'
  })
}
/**
 * 测试数据表的英文名有没有被使用
 *  */
export function testtableEname(str) {
  const temp = '?table_name=' + str
  return request({
    url: '/configtables/' + temp,
    method: 'get'
  })
}
/**
 * 测试设备名有没有重名
 *  */
export function testJZname(str) {
  return request({
    url: '/configjzs/' + str,
    method: 'get'
  })
}
/**
 * 获取数据表的详情
 */
export function getTabDetail(str) {
  return request({
    url: '/configfields/' + str,
    method: 'get'
  })
}
/**
 * 获取实时数据的详情
 */
export function getShiDetail(str) {
  return request({
    url: '/configkafkafields/' + str,
    method: 'get'
  })
}
/**
 * 获取当前用户可用的文件列表
 *  */
export function getConfigFiles() {
  return request({
    url: '/configfiles/?status=1',
    method: 'get'
  })
}
/**
 * 添加实时数据
 */
export function addConfigFiles(data) {
  return request({
    url: '/configkafkas/?status=1',
    method: 'post',
    data
  })
}
