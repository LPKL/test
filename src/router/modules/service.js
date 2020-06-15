/**
  服务（模型服务等）路由设计
  服务一级功能在前端‘开发平台’ TAB layout_m--devplatform
**/

import Layout_m from '@/views/layout_m/Layout_m'

const serviceRouter = [{
  path: '/service',
  component: Layout_m,
  redirect: '/service/model',
  hidden: true,
  meta: {
    perm: 'm:servermodel',
    title: 'serviceModel',
    icon: 'service',
    platform: 'devplatform'
  },
  // meta: { perm: 'm:servermodel', title: 'serviceModel', icon: 'faultmanagement' },
  children: [{
    path: 'model',
    component: () => import('@/views/service/model/index'),
    name: 'ServiceModel'
    // meta: { perm: 'm:servermodel:index', title: 'serviceModel', icon: 'faultmanagement', noCache: true }
  }]
}]

export default serviceRouter
