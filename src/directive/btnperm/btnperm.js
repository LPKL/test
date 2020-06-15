import store from '@/store'
/**
 * 返回绑定元素是否存在按钮权限
 * @param binding
 * @returns {boolean} 返回false指令元素将会被隐藏
 */
function ishavePerm(binding) {
  const btnperms = store.state.user.button_perms.split(',')
  return btnperms.some((item) => {
    const temp = (binding.value.name ? binding.value.name === item : false)
    return temp
  })
}
export default {
  // 只绑定一次 过滤指令元素和渲染出的元素一致组件
  bind(el, binding, vnode) {
    const test = ishavePerm(binding)
    if (!test) {
      if (el.id !== 'pane-null') {
        // el.remove()
        // 为了兼容ie
        el.parentNode.removeChild(el)
      }
    }
  },
  // 只能保证其父节点已经存在 但无法保证指令元素已经插入
  inserted() {
  },
  // 指令元素更新完成之后(此元素已经存在)进行执行
  // 指令不具备普遍性 如何还有像el-tabs式组建还需另外添加过滤条件
  componentUpdated(el, binding, vnode) {
    const test = ishavePerm(binding)
    // 绑定元素和渲染出的元素不一致操作
    try {
      if (!test && el.id) {
        // 此时是过滤的是el-tabs组件
        const index = el.id.split('-')
        const node = document.getElementById('tab-' + index[1])
        // node ? node.remove() : ''
        // 为了兼容ie
        node ? node.parentNode.removeChild(node) : ''
      }
    } catch (e) {
      console.log(e)
    }
  }
}
