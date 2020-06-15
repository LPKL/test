import { mount, createLocalVue } from '@vue/test-utils'
// import index1 from '@/views/service/model/index.vue'
import ServiceModelCreate from '@/views/service/model/components/ServiceModelCreate.vue'
// import index from '@/views/service/model/index.vue'
// import mountOption from '~/cores/vueinstance'

// jest.mock('getAllModel', jest.fn())
import mountOption from '~/cores/vueinstance'

// const $route = {
//   path: '/service/model'
// }

// const createCmp = propsData => mount(ServiceModelCreate, mountOption({ isVisable: true, { stubs: {
//         'form': createModelServiceFormStub,
//       }}, createModelServiceForm: { 'description': '2', 'enabled': true, 'model_id': '3', 'name': '1' }}), { propsData })
const createCmp = propsData => mount(ServiceModelCreate, mountOption({ isVisable: true }), { propsData })

describe('ServiceModelCreate.vue', () => {
  let cmp
  beforeEach(() => {
    // wrapper = mount(ServiceModelCreate, mountOption())
    jest.resetModules()
    jest.clearAllMocks()
  })

  // afterEach(() => {
  //   cmp.destroy()
  // })

  describe('Properties', () => {
    cmp = createCmp()
    it('props default', () => {
      expect(cmp.props().isVisable).toBe(true)
    })

    describe('Validation', () => {
      const props = createCmp().vm.$options.props
      it('prop default type', () => {
        expect(props.isVisable.type).toBe(Boolean)
      })
    })
  })

  describe('Events', () => {
    beforeEach(() => {
      cmp = createCmp({ isVisable: true })
    })

    // method closeDialog
    it('calls closeDialog when chanel button click', () => {
      const mockFn = jest.fn()
      cmp.setMethods({ closeDialog: mockFn })
      const cancelButton = cmp.find('.cancel')
      expect(cancelButton.text()).toBe('取消')
      cmp.find('.cancel').trigger('click')
      // cancelButton.vm.$emit('click')
      // expect(mockFn).toBeCalled()
      // expect(mockFn).toHaveBeenCalledWith(1)
    })

    it('triggers a closeDialog event when a closeDialog method is called', () => {
      const stub = jest.fn()
      cmp.vm.$on('closeDialog', stub)
      cmp.vm.closeDialog()
      expect(stub).toBeCalled()
      expect(stub).toHaveBeenCalledWith('create')
    })

    it('calls closeDialog when @closeDialog happens', () => {
      cmp.find(ServiceModelCreate).vm.$emit('closeDialog', 'create')
      expect(cmp.emitted()['closeDialog'][0]).toEqual(['create'])
    })

    // method createNewModelService
    it('calls handleClick when click on message', () => {
      const createNewModelService = jest.fn()
      cmp.setMethods({ createNewModelService })
      expect(cmp.find('.el-button--primary').text()).toBe('确定')
      // cmp.find('.el-button--primary').trigger('click')
      // expect(createNewModelService).toBeCalled()
      // expect(createNewModelService).toHaveBeenCalledWith(1)
    })

    it('triggers a message-clicked event when a handleClick method is called', async() => {
      const stub1 = jest.fn()
      cmp.setData({ createModelServiceForm: { 'description': '2', 'enabled': true, 'model_id': '3', 'name': '1' }})
      cmp.vm.$on('createdForm', stub1)
      cmp.vm.createNewModelService()
      // await cmp.vm.$refs.createModelServiceForm.validate()
      // expect(cmp.vm.$refs.createModelServiceForm.validate.errors.any()).toBe(true)
      expect(stub1).toBeCalled()
      expect(stub1).toHaveBeenCalledWith({ 'description': '2', 'enabled': true, 'model_id': '3', 'name': '1' })
    })
  })

  it('snapshot', () => {
    expect(cmp.element).toMatchSnapshot()
    // expect(wrapper.html()).toMatchSnapshot()
  })
})

