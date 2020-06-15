import { mount, createLocalVue } from '@vue/test-utils'
import index1 from '@/views/service/model/index.vue'
import ServiceModelTable from '@/views/service/model/components/ServiceModelTable.vue'
import ServiceModelClient from '@/views/service/model/components/ServiceModelClient.vue'
import ServiceModelTest from '@/views/service/model/components/ServiceModelTest.vue'
import ServiceModelEdit from '@/views/service/model/components/ServiceModelEdit.vue'
import ServiceModelCreate from '@/views/service/model/components/ServiceModelCreate.vue'

import mountOption from '~/cores/vueinstance'

// import request from '@/utils/request'
// jest.mock('getServicesData', jest.fn())

// const $route = {
//   path: '/service/model'
// }
const dataList = [{
  id: '100',
  editname: false, // 点击cell编辑时可用，TODO: API获取datalist，后复制...在其中增加editname, editdesc作为key
  editdescription: false,
  name: '服务1',
  created_at: '2016-05-02',
  updated_at: '2016-05-03',
  model: {
    id: '1',
    name: 'model1'
  },
  creater: '王小虎',
  batch_status: 'error',
  description: '上海市普陀区金沙江路 1518 弄',
  publish: false
}, {
  id: '101',
  editname: false,
  editdescription: false,
  name: '服务2',
  created_at: '2019-05-02',
  updated_at: '2019-05-03',
  model: {
    id: '2',
    name: 'model2'
  },
  creater: '王小虎2',
  batch_status: 'deploying',
  description: '上海市普陀区金沙江路 1518 弄2',
  publish: true
}]

describe('index.vue', () => {
  let wrapper
  beforeAll(() => {
    wrapper = jest.spyOn(console, 'log')
  })
  beforeEach(() => {
    // wrapper = mount(index1)
    wrapper = mount(index1, mountOption())
    wrapper.setData({ serviceModelDataList: dataList })
    jest.resetModules()
    jest.clearAllMocks()
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('base settinng', () => {
    expect(wrapper.name()).toBe('ServiceModel')
  })
  // 测试组件结构（子组件引用等）
  it('index and components are vue instances', () => {
    expect(wrapper.isVueInstance()).toBe(true)
    expect(wrapper.find(ServiceModelTable).isVueInstance()).toBe(true)
    expect(wrapper.find(ServiceModelTable).name()).toBe('ServiceModelTable')
    expect(wrapper.find(ServiceModelTest).isVueInstance()).toBe(true)
    expect(wrapper.find(ServiceModelClient).isVueInstance()).toBe(true)
    expect(wrapper.find(ServiceModelCreate).isVueInstance()).toBe(true)
    expect(wrapper.find(ServiceModelEdit).isVueInstance()).toBe(true)
  })
  it('contain components', () => {
    expect(wrapper.contains(ServiceModelTable)).toBe(true)
    expect(wrapper.contains(ServiceModelTest)).toBe(true)
    expect(wrapper.contains(ServiceModelClient)).toBe(true)
    expect(wrapper.contains(ServiceModelCreate)).toBe(true)
    expect(wrapper.contains(ServiceModelEdit)).toBe(true)
  })
  it('create view has class', () => {
    expect(wrapper.find(ServiceModelCreate).exists()).toBe(true)
    expect(wrapper.find(ServiceModelCreate).isEmpty()).toBe(false)

    expect(wrapper.find(ServiceModelCreate).attributes().class).toBe('app_container')
    // expect(wrapper.find(ServiceModelCreate).attributes().class).toBe('addDialog') // error了
    // expect(wrapper.find(ServiceModelCreate).hasClass('addDialog')).toBe(false)
    // expect(wrapper.find(ServiceModelCreate).hasClass('dialog-footer')).toBe(false)
    // expect(wrapper.find(ServiceModelCreate).hasClass('cancel')).toBe(false)

    // expect(wrapper.find(ServiceModelCreate).classes()).toContain('addDialog')
    // expect(wrapper.find('.addDialog').text()).toBe('添加服务')
  })

  // it('calls getEditedFormData when editedTableCell happens', () => {
  //   const mockFn = jest.fn()
  //   wrapper.setMethods({ 'getEditedFormData': mockFn })
  //   wrapper.find(ServiceModelTable).vm.$emit('editedTableCell', { 'name': '11', 'description': '22' })
  //   // expect(mockFn).toHaveBeenCalledTimes(1)
  //   expect(mockFn).toBeCalled()
  //   expect(mockFn).toHaveBeenCalledWith('create')
  //   // expect(mockFn).toBeCalledWith({ 'name': '11', 'description': '222' })
  // })
  it('calls getCreatedFormData when createdForm happens', () => {
    const mockFn = jest.fn()
    wrapper.setMethods({ 'getCreatedFormData': mockFn })
    wrapper.find(ServiceModelCreate).vm.$emit('createdForm', { 'name': '11', 'description': '22' })
    expect(mockFn).toBeCalled()
    expect(mockFn).toHaveBeenCalledWith({ 'name': '11', 'description': '22' })
  })

  it('snapshot', () => {
    expect(wrapper.element).toMatchSnapshot()
    // expect(wrapper.html()).toMatchSnapshot()
  })
})

