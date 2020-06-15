import { createLocalVue } from '@vue/test-utils'
import ElementUI from 'element-ui'
import echarts from 'echarts'
import VCharts from 'v-charts'
import store from '@/store'
import Vuex from 'vuex'
import i18n from '@/lang'
import './icons' // icon

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(ElementUI)
localVue.use(echarts)
localVue.use(VCharts)

export default (props, dom) => {
  return {
    propsData: props,
    store,
    i18n,
    attachToDocument: !!dom,
    localVue
  }
}
