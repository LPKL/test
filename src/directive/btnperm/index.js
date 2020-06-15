import btnperm from './btnperm'
const install = function(Vue) {
  Vue.directive('is-show', btnperm)
}
if (window.Vue) {
  window['is-show'] = btnperm
  Vue.use(install); // eslint-disable-line
}

btnperm.install = install
export default btnperm
