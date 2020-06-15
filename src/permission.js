import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css'// progress bar style
import { getToken } from '@/utils/auth' // getToken from cookie
NProgress.configure({ showSpinner: false })// NProgress Configuration

// permission judge function
function hasPermission(roles, permissionRoles) {
  if (roles.indexOf('admin') >= 0) return true // admin permission passed directly
  if (!permissionRoles) return true
  return new RegExp(permissionRoles).test(roles.toString())
}

const whiteList = ['/login', '/index', '/register']// no redirect whitelist

// router.beforeEach((to, from, next) => {
//   NProgress.start() // start progress bar
//   if (getToken()) { // determine if there has token
//     // if (getToken2() && getToken2() !== getToken() && from.path !== '/login') {
//     //   Message.warning('帐号变更了请刷新页面!')
//     //   setToken2(getToken())
//     // }
//     /* has token*/
//     if (to.path === '/login') {
//       next({ path: '/index' })
//       NProgress.done() // if current page is dashboard will not trigger	afterEach hook, so manually handle it
//     } else {
//       // if (store.getters.roles.length === 0) { // 判断当前用户是否已拉取完user_info信息(roles为空时会死循环)
//       if (store.getters.status !== 200) { // 判断当前用户是否已拉取完user_info信息
//         store.dispatch('GetUserInfo').then(res => { // 拉取user_info
//           debugger
//           // console.log(res)
//           const roles = res.data.data.roles // note: roles must be a array! such as: ['editor','develop']
//           store.dispatch('GenerateRoutes', { roles }).then(() => { // 根据roles权限生成可访问的路由表
//             router.addRoutes(store.getters.addRouters) // 动态添加可访问路由表
//             next({ ...to, replace: true }) // hack方法 确保addRoutes已完成 ,set the replace: true so the navigation will not leave a history record
//           })
//         }).catch((err) => {
//           console.log('GetUserInfo:', err)
//           store.dispatch('FedLogOut').then(() => {
//             Message.error(err || 'Verification failed, please login again')
//             next({ path: '/' })
//           })
//         })
//       } else {
//         //  next()
//         // 没有动态改变权限的需求可直接next() 删除下方权限判断 ↓
//         if (hasPermission(store.getters.roles, to.meta.perm)) {
//           next()
//         } else {
//           next({ path: '/401', replace: true, query: { noGoBack: true }})
//         }
//         // 可删 ↑
//       }
//     }
//   } else {
//     /* has no token*/
//     if (whiteList.indexOf(to.path) !== -1) { // 在免登录白名单，直接进入
//       next()
//     } else {
//       next(`/index?redirect=${to.path}`) // 否则全部重定向到登录页
//       NProgress.done() // if current page is login will not trigger afterEach hook, so manually handle it
//     }
//   }
// })
router.beforeEach((to, from, next) => {
  NProgress.start() // start progress bar
  if (getToken('f_t')) { // determine if there has token
    /* has token*/
    if (to.path === '/login') {
      next({ path: '/index' })
      NProgress.done() // if current page is dashboard will not trigger	afterEach hook, so manually handle it
    } else {
      // if (store.getters.roles.length === 0) { // 判断当前用户是否已拉取完user_info信息(roles为空时会死循环)
      if (store.getters.status !== 200) { // 判断当前用户是否已拉取完user_info信息
        Promise.all([store.dispatch('GetUserInfo'), store.dispatch('getCountUnread')]).then(res => {
          // const roles = 'm:sys,m:sys:user,m:sys:role,m:sys:perm,m:sys:assign_perm,m:newmodel:index,m:realtimeflow:index,m:realtmonitor:index,m:process:index,m:dfilemanage:index,m:dashboard:index,m:faultmanagement:index,m:messagemanagement:all,m:user,m:user:index,m:user:changePsd,m:taskmonitoring,m:taskmonitoring:list,m:taskmonitoring:taskdetail,m:algmanagement,m:algmanagement:create,m:algmanagement:edit,m:algmanagement:view,m:algmanagement:index,h,h:homeBanner,h:homeView,m:manageCenter,m:manageCenter:dflowmanage,m:manageCenter:trainedindex,m:manageCenter:crew,m:manageCenter:his,m:manageCenter:tab,m:manageCenter:crewshi,m:manageCenter:dbdetail,m:manageCenter:crew:hismessage,m:manageCenter:crew:hismessage:db,m:manageCenter:crew:hismessage:tf,m:manageCenter:crew:shimessage,m:sys,m:sys:user,m:sys:role,m:sys:perm,m:newmodel:index,m:realtimeflow:index,m:realtmonitor:index,m:sys:user,m:newmodel:index,m:process:index,m:dfilemanage:index,m:dflowmanage:index,m:dashboard:index,m:faultmanagement:index,m:sys,m:sys:user,m:sys:role,m:sys:perm,m:example,m:example:create,m:example:edit,m:example:list,m:newmodel:index,m:realtimeflow:index,m:realtmonitor:index,m:process:index,m:faultmanagement:index,m:modelmanagement,m:modelmanagement:preindex,m:modelmanagement:trainedindex,m:newmodel:index,m:process:index,m:dflowmanage:index,m:dashboard:index'
          const roles = ['admin', 'main']
          store.dispatch('GenerateRoutes', { roles }).then(() => { // 根据roles权限生成可访问的路由表
            router.addRoutes(store.getters.addRouters) // 动态添加可访问路由表
            next({ ...to, replace: true }) // hack方法 确保addRoutes已完成 ,set the replace: true so the navigation will not leave a history record
          })
        }).catch((err) => {
          console.log('GetUserInfo:', err)
          store.dispatch('FedLogOut').then(() => {
            Message.error(err || 'Verification failed, please login again')
            store.dispatch('SetName', '')
            store.dispatch('SetStatus', '')
            sessionStorage.setItem('store', JSON.stringify({})) // 消除vuex刷新初始化
            next({ path: '/' })
          })
        })
      } else {
        // // 没有拉取成功用户权限直接跳转404，不让访问
        // store.dispatch('FedLogOut').then(res => {
        //   next({ path: '/401', replace: true, query: { noGoBack: true }})
        // })
        // 没有动态改变权限的需求可直接next() 删除下方权限判断 ↓
        store.commit('CHANGE_PLATFORM', to.matched[0].meta.platform)
        // console.log('权限:', store.getters.roles, to.meta.perm)
        if (hasPermission(store.getters.roles, to.meta.perm)) {
          next()
        } else {
          next({ path: '/401', replace: true, query: { noGoBack: true }})
        }
        // 可删 ↑
      }
    }
  } else {
    /* has no token*/
    if (whiteList.indexOf(to.path) !== -1) { // 在免登录白名单，直接进入
      next()
    } else {
      next(`/index?redirect=${to.path}`) // 否则全部重定向到登录页
      // next('/index') // 否则全部重定向到登录页
      NProgress.done() // if current page is login will not trigger afterEach hook, so manually handle it
    }
  }
})

router.afterEach(() => {
  NProgress.done() // finish progress bar
})
