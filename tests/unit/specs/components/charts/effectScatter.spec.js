import { shallowMount } from '@vue/test-utils'
import mountOption from '~/cores/vueinstance'
// import echarts from 'echarts'
import EffectScatter from '@/components/Charts/EffectScatter.vue'

// beforeAll(() => {
//   jest.spyOn(echarts, 'performPostUpdateFuncs')
//   // jest.mock('node_modules/echarts-gl/dist/echarts-gl.js')
// })
// let spy
// beforeAll(() => {
//   spy = jest.spyOn(echarts, 'getInstanceByDom').mockImplementation(() => {
//     return {
//       hideLoading: jest.fn(),
//       setOption: jest.fn(),
//       showLoading: jest.fn()
//     }
//   })
// })
// afterAll(() => {
//   spy.mockRestore()
// })
describe('EffectScatter.vue', () => {
  const scatter = [
    [10.0, 8.04],
    [8.0, 6.95],
    [13.0, 7.58],
    [9.0, 8.81],
    [11.0, 8.33],
    [14.0, 9.96],
    [6.0, 7.24],
    [4.0, 4.26],
    [12.0, 10.84],
    [7.0, 4.82],
    [5.0, 5.68]
  ]
  const id = 'idscatter'
  const xName = '温度'
  let wrapper
  beforeAll(() => {
    wrapper = shallowMount(EffectScatter, mountOption({ scatter, xName, id }, true))
  })
  afterAll(() => {
    wrapper.destroy()
  })
  it('图表实例化', () => {
    expect(wrapper.isVueInstance()).toBe(true)
  })
  it('chart图表属性检测', () => {
    const chart = wrapper.vm.chart.getOption()
    expect(chart.xAxis[0].name).toBe('温度')
    expect(chart.xAxis[0].type).toBe('category')
    expect(wrapper.vm.id).toEqual('idscatter')
  })
})
