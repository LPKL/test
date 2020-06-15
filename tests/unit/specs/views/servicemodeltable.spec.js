import { mount, createLocalVue } from '@vue/test-utils'
// import index1 from '@/views/service/model/index.vue'
import ServiceModelTable from '@/views/service/model/components/ServiceModelTable.vue'

import mountOption from '~/cores/vueinstance'

// const $route = {
//   path: '/service/model'
// }
const mockDataList = [{
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
const mockShowModelDetailData = {
  name: 'modelname',
  desc: 'description',
  create_time: 'createtime',
  updated_time: 'updatetime'
}
const createCmp = propsData => mount(ServiceModelTable, mountOption({ dataList: mockDataList, showModelDetailData: mockShowModelDetailData }), { propsData })
describe('ServiceModelTable.vue', () => {
  let cmp
  beforeEach(() => {
    // cmp = jest.spyOn(console, 'log')
    jest.resetModules()
    jest.clearAllMocks()
    // wrapper = mount(ServiceModelTable, mountOption())
  })

  // afterEach(() => {
  //   cmp.destroy()
  // })

  describe('Properties', () => {
    // it('has a message property', () => {
    //   cmp = createCmp({ tableLoading: true })
    //   expect(cmp.props().tableLoading).toBe(true)
    // })
    cmp = createCmp()
    it('props default', () => {
      // cmp = createCmp({ tableLoading: true })
      expect(cmp.props().tableLoading).toBe(null)
      // expect(cmp.props().dataList).toBe(null)
      expect(cmp.props().page).toBe(1)
      // expect(cmp.props().showModelDetailData).toBe({ name: 'modelname', desc: 'description', create_time: 'createtime', updated_time: 'updatetime' })
    })

    // it("has a cat property, since it's added as an attribute", () => {
    //   cmp = createCmp({ cat: 'hey', message: 'hey' })
    //   expect(cmp.props().cat).toBeUndefined()
    // })

    describe('Validation', () => {
      const dataList = createCmp({ tableLoading: true }).vm.$options.props.dataList
      const props = createCmp().vm.$options.props

      it('dataList is of type string', () => {
        expect(dataList.type).toBe(Array)
        expect(props.tableLoading.type).toBe(Boolean)
        expect(props.page.type).toBe(Number)
        expect(props.showModelDetailData.type).toBe(Object)
      })

      it('dataList is required', () => {
        expect(dataList.required).toBeUndefined()
      })

      // it('message has at least length 2', () => {
      //   expect(message.validator && message.validator('a')).toBeFalsy()
      //   expect(message.validator && message.validator('aa')).toBeTruthy()
      // })
    })
  })

  describe('Events', () => {
    beforeEach(() => {
      // cmp = createCmp({ dataList })
      jest.resetModules()
      jest.clearAllMocks()
    })

    // it('calls handleClick when click on message', () => {
    //   const mockFn = jest.fn()
    //   cmp.setMethods({ 'lostFcous': mockFn })
    //   cmp.find(ServiceModelTable).trigger('blur') // ??

    //   expect(mockFn).toBeCalled() // false
    // })

    it('triggers a message-clicked event when a handleClick method is called', () => {
      const stub = jest.fn()
      cmp.vm.$on('editedTableCell', stub)
      cmp.vm.lostFcous()

      expect(stub).toBeCalled()
    })

    // it('calls handleMessageClick when @message-click happens', () => {
    //   cmp.find(ServiceModelTable).vm.$emit('editedTableCell', { 'name': '1111', 'description': '2222' })
    //   expect(cmp.emitted()['editedTableCell'][0]).toEqual([{ 'name': '1111', 'description': '2222' }])
    // })
  })

  // describe('ServiceModelTable.vue', () => {
  //   it('props default value', () => {
  //     expect(wrapper().hasProp('page', 1)).toBeTruthy()
  //     // expect(wrapper.isVueInstance()).toBe(true)
  //     const spy = jest.spyOn(console, 'error')
  //     // cmp = wrapper({ page: 1 })
  //     expect(spy).toBeCalledWith(expect.stringContaining('[Vue warn]: Invalid prop'))
  //     spy.mockReset() // or mockRestore() to completely remove the mock
  //   })
  // })

  it('snapshot', () => {
    expect(cmp.element).toMatchSnapshot()
    // expect(wrapper.html()).toMatchSnapshot()
  })
})

