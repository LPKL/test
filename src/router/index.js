import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)
/* Router Modules */
import taskRouter from './modules/task'
import dataminingRouter from './modules/datamining'
import algorithmRouter from './modules/algorithm'
import alarmRouter from './modules/alarm'
import reportRouter from './modules/report'
import realTimeRouter from './modules/realTime'
import sysRouter from './modules/system'
import messageRouter from './modules/message'
import experimentRouter from './modules/experiment'
import deviceRouter from './modules/device'
import serviceRouter from './modules/service'
import metadataRouter from './modules/metadata'
export const constantRouterMap = [
  {
    path: '/index',
    component: () =>
      import('@/views/index/index'),
    hidden: true
  },

  {
    path: '/login',
    component: () =>
      import('@/views/_system/login/index'),
    hidden: true
  },
  {
    path: '/register',
    component: () =>
      import('@/views/_system/user/person/register/index'),
    hidden: true
  },
  {
    path: '/auth-redirect',
    component: () =>
      import('@/views/_system/login/authredirect'),
    hidden: true
  },
  {
    path: '/404',
    component: () =>
      import('@/views/_system/errorPage/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () =>
      import('@/views/_system/errorPage/401'),
    hidden: true
  },
  /* 默认进入首页 */
  {
    path: '',
    component: () =>
      import('@/views/index/index'),
    hidden: true
  }
]

export default new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})

export const asyncRouterMap = [
  ...sysRouter,
  ...realTimeRouter,
  ...messageRouter,
  ...experimentRouter,
  ...deviceRouter,
  ...dataminingRouter,
  ...reportRouter,
  metadataRouter,
  taskRouter,
  algorithmRouter,
  alarmRouter,
  ...serviceRouter,
  { path: '*', redirect: '/404', hidden: true }
]
