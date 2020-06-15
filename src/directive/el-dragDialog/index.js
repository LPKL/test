import drag from './drag'
import baseDrag from './basedrag'

const install = function(Vue) {
  Vue.directive('el-drag-dialog', drag)
  Vue.directive('base-drag', baseDrag)
}

if (window.Vue) {
  window['el-drag-dialog'] = drag
  window['base-drag'] = baseDrag
  Vue.use(install); // eslint-disable-line
}

drag.install = install
export default drag
