import { shallowMount } from '@vue/test-utils'
import mountOption from '~/cores/vueinstance'
import MatrixView from '@/components/Table/MatrixView.vue'

describe('MatrixView.vue', () => {
  const tableData = [[1, 2, 3, 4], [1, 2, 3, 4], [1, 2, 3, 4], [1, 2, 3, 4]]
  const prex = ['a', 'b', 'c', 'd']
  let wrapper
  beforeAll(() => {
    wrapper = shallowMount(MatrixView, mountOption({ tableData, prex }))
  })
  it('简单测试', () => {
    const vm = wrapper.vm
    expect(vm.$props.prex[0]).toBe('a')
    expect(wrapper.classes()).toContain('matrix')
    const span = wrapper.findAll('.matrix p span')
    expect(span.at(0).text()).toBe('1.000')
    expect(span.at(span.length - 1).text()).toBe('4.000')
  })
  afterAll(() => {
    wrapper.distory()
  })
})
