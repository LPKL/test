/*
  通用messagebox的confirm类型提示框
  that: 调用vue实例, 必填
  func: 成功后执行的回调函数，必填，若无操作，此参数可填null  （失败回调统一只有提示信息，无操作函数）
  message: string 内容，必填
  title: string 标题，必填，若null默认为‘提示’,若填‘’则不显示
  type: string 消息类型，可影响提示类型图标，error, warning, info, success(无效的参数会被忽略)， 选填，默认为空
  confirmButton: object { show: true, class: 'error', text: '删除' }, 确定按钮的文本，选填，默认为‘确定’， 若为null，则不显示按钮
  cancelButton: object { show: true, class: 'error', title: '取消' }, 取消按钮的文本，选填，默认为‘取消’ 若为null 则不显示按钮
*/

export function commonConfirm(that, func, message, title, type, confirmButton, cancelButton) {
  that.$confirm(message, title == null ? that.$t('labels.reminder') : title, {
    showConfirmButton: confirmButton ? confirmButton.show : true,
    confirmButtonText: confirmButton ? confirmButton.text : that.$t('buttons.confirm'),
    confirmButtonClass: confirmButton ? confirmButton.class : '',
    showCancelButton: confirmButton ? cancelButton.show : true,
    cancelButtonText: confirmButton ? cancelButton.text : that.$t('buttons.cancel'),
    cancelButtonClass: confirmButton ? cancelButton.class : ''
  }).then(() => {
    console.log('commonConfirm')
    func()
  }).catch(() => {
    that.$message({
      type: 'info',
      message: that.$t('messages.cancel_operate'),
      duration: 2000
    })
  })
}
