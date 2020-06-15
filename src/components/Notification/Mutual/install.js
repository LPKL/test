import Vue from 'vue'
import router from '@/router'
import store from '@/store'
import Component from './func'
import { Message } from 'element-ui'

const NotificationConstructor = Vue.extend(Component)
const instances = []
const MUTEX_TIME_OUT = 60000
let seed = 1
// computed height
let verticalOffset = 70
const OFFSET_START = 70
const OFFSET_GAP = 24

const removeNotifier = (ins) => {
  const idxItem = instances.indexOf(ins)
  if (idxItem >= 0) {
    instances.splice(idxItem, 1)
  }
}

const relayItems = () => {
  verticalOffset = OFFSET_START
  instances.forEach((item) => {
    // component gap
    if (item.visible) {
      item.verticalOffset = verticalOffset
      verticalOffset += item.$el.offsetHeight + OFFSET_GAP
    }
  })
}

const notify = (options, events) => {
  if (Vue.prototype.$isServer) return

  const {
    autoClose,
    autoCloseOnSuccess,
    ...rest
  } = options

  const {
    onClose,
    onStateChange,
    onRedirect
  } = events || {}

  if (!rest.content && rest.mutex) {
    rest.content = `${store.getters['mutex/runningMessage']({ type: rest.mutex.type, operate: rest.mutex.operate })}`
  }
  const instance = new NotificationConstructor({
    propsData: {
      ...rest
    },
    data: {
      autoClose: autoClose === undefined ? false : autoClose,
      autoCloseOnSuccess: autoCloseOnSuccess === undefined ? false : autoCloseOnSuccess
    }
  })

  instance.id = `mutualnotification_${seed++}`
  instance.vm = instance.$mount()

  document.body.appendChild(instance.vm.$el)

  verticalOffset = OFFSET_START
  instances.forEach((item) => {
    verticalOffset += item.$el.offsetHeight + OFFSET_GAP
  })

  instance.verticalOffset = verticalOffset
  store.dispatch('mutex/add', rest.mutex)

  instance.$on('close', (vm) => {
    vm.visible = false
    vm.$nextTick(() => {
      relayItems()
    })
    if (typeof onClose === 'function') {
      onClose.call(vm)
      if (vm.state !== 'running') {
        removeNotifier(instance)
      }
    }
  }).$on('stateChange', (vm, status) => {
    if (!vm.visible) {
      vm.visible = true
      vm.$nextTick(() => {
        relayItems()
      })
    }
    if (status === 'done' && vm.autoCloseOnSuccess !== false) {
      setTimeout(() => {
        vm.visible = false
      }, vm.autoCloseOnSuccess)
    }
    store.dispatch('mutex/remove', rest.mutex)
    if (typeof onStateChange === 'function') {
      onStateChange.call(vm, status)
    }
  }).$on('redirect', (vm, rout) => {
    vm.visible = false
    if (typeof onRedirect === 'function' && rout) {
      // store.dispath('mutex/remove', vm.mutex)
      router.push({ path: rout.path })
      onRedirect.call(vm, rout)
      removeNotifier(instance)
    }
  })

  instances.push(instance)
  return instance.vm
}

notify.isMutexing = (type) => {
  const mutexing = store.getters['mutex/runningInfo'](type)
  if (mutexing) {
    const timeNow = new Date().getTime()
    if (timeNow - mutexing.starttime > MUTEX_TIME_OUT) {
      Message.error(`${store.getters['mutex/runningMessage'](mutexing)}执行超时！`)
      store.dispatch('mutex/remove', mutexing)
      return false
    }
    Message.error(`正在执行${store.getters['mutex/runningMessage'](mutexing)},请收到完成提示后再试！` || `${mutexing.type}:${mutexing.operate} is running!`)
    return true
  }
  return false
}

export default notify
