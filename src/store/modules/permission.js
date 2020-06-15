import { asyncRouterMap, constantRouterMap } from '@/router'
import user from './user'
const btndata = require('../btndata2.json')
/**
 * 通过meta.role判断是否与当前用户权限匹配
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.indexOf(role) >= 0)
  } else {
    return true
  }
}

/**
 * 递归过滤异步路由表，返回符合用户角色权限的路由表
 * @param asyncRouterMap
 * @param roles
 */
function filterAsyncRouter(asyncRouterMap, roles) {
  const accessedRouters = asyncRouterMap.filter(route => {
    if (hasPermission(roles, route)) {
      if (route.children && route.children.length) {
        route.children = filterAsyncRouter(route.children, roles)
      }
      return true
    }
    return false
  })
  return accessedRouters
}

const permission = {
  state: {
    routers: constantRouterMap,
    addRouters: [],
    btnData: btndata
  },
  mutations: {
    SET_ROUTERS: (state, routers) => {
      if (user.state.is_super !== 1) {
        routers.forEach((item) => {
          if (item.path === '/system') {
            item.children = item.children.filter(val => val.name !== 'perm_manage')
          }
        })
      }
      state.addRouters = routers
      state.routers = constantRouterMap.concat(routers)
    },
    SET_BTNDATA: (state, btndata) => {
      state.btndata = btndata
    }
  },
  actions: {
    GenerateRoutes({ commit }, data) {
      return new Promise(resolve => {
        const { roles } = data
        let accessedRouters
        if (roles.indexOf('admin') >= 0) {
          accessedRouters = asyncRouterMap
        } else {
          accessedRouters = filterAsyncRouter(asyncRouterMap, roles)
        }
        commit('SET_ROUTERS', accessedRouters)
        resolve()
      })
    }
  }
}

export default permission
