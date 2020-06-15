import '@babel/polyfill'
import Vue from 'vue'

import Cookies from 'js-cookie'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import Element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import '@/styles/index.scss' // global css

import App from '../App'
import router from '../../src/router'
import store from '../../src/store'
import i18n from '../../src/lang' // Internationalization
import './icons' // icon
import './assets/third-party/al_font_icon/iconfont.css' // 引入第三方icon
import './assets/third-party/iconFolder/iconfont.css' // 引入第三方icon
import '../../src/errorLog' // error log
import '../../src/permission' // permission control
// import './mock' // simulation data
import * as filters from '../../src/filters' // global filters
import btnperm from '../../src/directive/btnperm'
import elDragDialog from '../../src/directive/el-dragDialog'
import global from '@/mock/common.js'
import { getAdminId } from '@/utils/auth'
import htmlToPdf from '@/utils/htmlToPdf'
import baseUrl from '@/utils/baseUrl'

window.addEventListener('visibilitychange', function() { // 这个方法是监测浏览器窗口发生变化的时候执行
  if (this.location.hash === '#/register') return
  if (document.hidden === false && Number(global.id) !== Number(getAdminId())) {
    global.id = getAdminId() // 只有当初始创建的id不等于cookies里面的Id的时候去覆盖掉这个id
    location.reload()
  } // 不覆盖的话id永远都是我们设的初始值
})
// v-echarts 全局引入
import VCharts from 'v-charts'
Vue.use(VCharts)
// 页面内按钮权限全局指令
Vue.directive('is-show', btnperm)
// el-dialog可拖拽指令
Vue.use(elDragDialog)

const { baseSwUrl } = baseUrl
// socketio
import VueSocketio from 'vue-socket.io'

import io from 'socket.io-client'
const socketInstance = io(baseSwUrl, {
  rememberTransport: false,
  // transports: ['WebSocket', 'Flash Socket', 'AJAX long-polling']
  transports: ['websocket']
})

Vue.use(new VueSocketio({
  debug: false,
  connection: socketInstance
}))

Vue.use(htmlToPdf)
Vue.use(Element, {
  size: Cookies.get('size') || 'medium', // set element-ui default size
  i18n: (key, value) => i18n.t(key, value)
})
// register global utility filters.
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

// 设置为 false 以阻止 vue 在启动时生成生产提示。
Vue.config.productionTip = false

var vm = new Vue({
  el: '#app',
  router,
  store,
  i18n,
  render: h => h(App)
})

export default vm // 导出Vue实例，供其他js文件使用Vue实例
