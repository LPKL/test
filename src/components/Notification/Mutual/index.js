import Notification from './mutualNotifier'
import notify from './install'

export default (Vue) => {
  Vue.component(Notification.name, Notification)
  Vue.prototype.$mutualNotify = notify
  Vue.prototype.$isMutexing = notify.isMutexing
}
