import { shallowMount, createLocalVue } from '@vue/test-utils'
import index from '@/views/service/model/index.vue'
// import ServiceModelTable from '@/views/service/model/components/ServiceModelTable.vue'

import Element from 'element-ui'
// import i18n from './lang'
// import Vue from 'vue'
// import Cookies from 'js-cookie'
import mountOption from '~/cores/vueinstance'

// Vue.use(Element, {
//   size: Cookies.get('size') || 'medium', // set element-ui default size
//   i18n: (key, value) => i18n.t(key, value)
// })

// jest.mock('getServicesData', jest.fn())

const localVue = createLocalVue()
localVue.use(Element)

const $route = {
  path: '/service/model'
}

describe('index.vue', () => {
  let wrapper
  beforeEach(() => {
    wrapper = shallowMount(index, mountOption({
      localVue,
      stubs: ['el-button'],
      mocks: {
        $route
      }
    }))
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('点击添加服务按钮', () => {
    const mockFn = jest.fn()
    wrapper.setMethods({
      'openDialog': mockFn
    })
    // wrapper.vm.$on('click', mockFn)
    const createbutton = wrapper.find({ ref: 'addServiceButton' })
    // createbutton.trigger('click')
    createbutton.vm.$emit('click')
    expect(mockFn).toBeCalled()
    expect(mockFn).toHaveBeenCalledWith('create')
  })

  it('显示添加服务dialog', () => {
    wrapper.vm.openDialog('create')
    // expect(wrapper.vm.showCreateComp).toBe(true)
    expect(wrapper.vm.showCreateComp).toBeTruthy()
    expect(wrapper.vm.showEditComp).toBe(false)
    expect(wrapper.vm.showClientComp).toBe(false)
    expect(wrapper.vm.showTestComp).toBe(false)
  })
  // // 测试function
  // it('openDialog', () => {
  //   const mockFn = jest.fn()
  //   // 设置 Wrapper vm 的方法并强制更新。
  //   wrapper.setMethods({
  //     'openDialog': mockFn
  //   })
  //   wrapper.vm.openDialog('create')
  //   // expect(mockFn).toBeCalled()
  //   // expect(mockFn).toHaveBeenCalledTimes(1)
  //   expect(wrapper.vm.showCreateComp).toBeTruthy()
  //   const span = wrapper.find('.el-dialog__title')
  //   expect(span.text()).toBe('添加服务')

  //   wrapper.destroy()
  // })
  it('snapshot', () => {
    expect(wrapper.element).toMatchSnapshot()
    // expect(wrapper.html()).toMatchSnapshot()
  })
})

// describe('ServiceModelTable.vue', () => {
//   it('表格组件props测试', () => {
//     const tableProps = {
//       // dataList: [],
//       tableLoading: true
//       // page: 1,
//       // showModelDetailData: { 'name': '111' }
//     }
//     const wrapper = shallowMount(ServiceModelTable, {
//       propsData: tableProps
//     })
//     // 断言已经获取到props
//     // expect(wrapper.props().dataList).toBe([])
//     expect(wrapper.props().tableLoading).toBe(true)
//     // expect(wrapper.props().page).toBe(1)
//     // expect(wrapper.props().page).toBe({ 'name': '111' })
//     wrapper.destroy()
//   })
// })
