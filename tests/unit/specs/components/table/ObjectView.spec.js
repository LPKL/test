/**
 * 完整测试示例
 * ObjectView测试用例完成
 */
import { shallowMount } from '@vue/test-utils'
import mountOption from '~/cores/vueinstance'
import ObjectView from '@/components/Table/ObjectView.vue'

describe('ObjectView.vue', () => {
  let wrapper
  beforeEach(() => {
    wrapper = shallowMount(ObjectView, mountOption({
      showData: {
        name1: 'abc',
        name2: '3dtest'
      }}))
  })
  it('简单测试', () => {
    const vm = wrapper.vm // 利用vm测试组件内属性和方法
    vm.$nextTick(() => {
      expect(vm.$props.showData.name1).toBe('abc')
      expect(typeof wrapper.find).toBe('function')
      const tablerow = wrapper.findAll('.tablerow div') // 测试dom属性
      expect(tablerow.at(3).text()).toBe('3dtest') // 找到最后一个div对比他的文本是否渲染正确
    })
  })
  it('生成快照', () => {
    expect(wrapper.element).toMatchSnapshot()
  })
})
