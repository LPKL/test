import request from '@/utils/request'

/**
 * 获取报告模板数据相关
 */
// 新，模板附件文件上传,如图片，PDF文件
export function addTemplateAttachmentFile(data) {
  return request({
    url: '/templates/attachments/files/',
    method: 'post',
    data
  })
}
// 新，新建模板附件，包括显示名称name，通过addTemplateAttachmentFile接口附件上传后的临时地址file_uuid，type参数等
export function addTemplateAttachment(data) {
  return request({
    url: '/templates/attachments/',
    method: 'post',
    data
  })
}
// 新，模板附件列表
export function getTemplateAttachmentList(query) {
  return request({
    url: '/templates/attachments/',
    method: 'get',
    params: query
  })
}
// 新，删除模板附件
export function deleteTemplateAttachment(id) {
  return request({
    url: '/templates/attachments/' + id + '/',
    method: 'delete'
  })
}
// 临时接口: 附件列表
export function getTemplateFilesList(query) {
  return request({
    url: '/template-files/',
    method: 'get',
    params: query
  })
}
// 临时接口: 上传附件，模板用图片，报告PDF等
export function addTemplateFile(data) {
  return request({
    url: '/template-files/',
    method: 'post',
    data
  })
}
// 临时接口: 删除附件
export function deleteTemplateFile(id) {
  return request({
    url: '/template-files/' + id + '/',
    method: 'delete'
  })
}
// 临时接口: 获取一个附件
export function getTemplateFileId(id) {
  return request({
    url: '/template-files/' + id,
    method: 'get'
  })
}
// 获取报告模板列表
export function getTemplates(query) {
  return request({
    url: '/templates/',
    method: 'get',
    params: query
  })
}
// 获取一个报告模板
export function getTemplateId(id) {
  return request({
    url: '/templates/' + id,
    method: 'get'
  })
}
// 增加报告模板
export function addTemplate(data) {
  return request({
    url: '/templates/',
    method: 'post',
    data
  })
}
// 更新报告模板
export function updateTemplate(id, data) {
  return request({
    url: '/templates/' + id + '/',
    method: 'patch',
    data
  })
}
// 删除报告模板
export function deleteTemplate(id) {
  return request({
    url: '/templates/' + id + '/',
    method: 'delete'
  })
}
// 批量删报告模板
export function batchDeleteTemplates(query) {
  return request({
    url: '/templates/',
    method: 'delete',
    params: query
  })
}
