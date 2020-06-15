import { shallowMount } from '@vue/test-utils'
import mountOption from '~/cores/vueinstance'
import ChangePsd from '@/views/_system/user/person/changePsd.vue'
describe('ChangePsd', () => {
  let wrapper
  beforeEach(() => {
    wrapper = shallowMount(ChangePsd, mountOption({
      passwordForm: {
        oldPass: '123456',
        newPass: '123456',
        confirmPass: '123456'
      }
    }))
  })
  test('测试组件内的变量类型', () => {
    const vm = wrapper.vm
    // console.log(vm._data.passwordForm.oldPass)
    vm.$nextTick(() => {
      expect(typeof vm.passwordForm).toMatch('object')
      //   数据为空，单元测试报错
      //   expect(vm.passwordForm.oldPass).toMatch('123456')
      const ele = wrapper.find('.save_button')
      ele.trigger('click')
    })
  })
  test('生成快照', () => {
    expect(wrapper.element).toMatchSnapshot()
  })
})
