import { shallowMount } from '@vue/test-utils'
import LangSelect from '@/components/LangSelect'
import mountOption from '~/cores/vueinstance'

describe('语言选择组件', () => {
  let wrapper
  const msg = '中文 English'
  beforeEach(() => {
    wrapper = shallowMount(LangSelect, mountOption({ msg }))
  })
  test('语言选择文字内容', () => {
    expect(wrapper.text()).toMatch(msg)
  })
  test('选择中文后的变量', () => {
    const vm = wrapper.vm
    vm.handleSetLanguage('zh')
    expect(vm.language).toMatch('zh')
    expect(vm.$i18n.locale).toMatch('zh')
    expect(vm.$store.getters.language).toMatch('zh')
  })
  test('语言选择快照', () => {
    expect(wrapper.element).toMatchSnapshot()
  })
})

// import Vue from 'vue'
// import LangSelect from '@/components/LangSelect'
// // import App from '@/App.vue'

// describe('App.test.js', () => {
//   let Cmp, vm

//   beforeEach(() => {
//     Cmp = Vue.extend(LangSelect) // Create a copy of the original component
//     vm = new Cmp({
//       data: {
//         // Replace data value with this fake data
//         messages: ['Cat']
//       }
//     }).$mount()// Instances and mounts the component
//   })

//   it('equals messages to ["Cat"]', () => {
//     expect(vm.messages).toEqual(['Cat'])
//   })
// })
