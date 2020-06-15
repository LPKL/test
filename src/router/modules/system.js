import Layout_m from '@/views/layout_m/Layout_m'
import Layout_user from '@/views/layout_m/Layout_user' // 个人中心

const sysRouter = [
  {
    path: '/error',
    component: Layout_m,
    hidden: true,
    redirect: 'noredirect',
    name: 'ErrorPages',
    meta: {
      title: 'errorPages',
      icon: '404'
    },
    children: [{
      path: '401',
      component: () =>
            import('@/views/_system/errorPage/401'),
      name: 'Page401',
      meta: { title: 'page401', noCache: true }
    },
    {
      path: '404',
      component: () =>
            import('@/views/_system/errorPage/404'),
      name: 'Page404',
      meta: { title: 'page404', noCache: true }
    }
    ]
  },
  {
    path: '/system',
    component: Layout_m,
    redirect: '/system/user_manage',
    meta: {
      perm: 'm:sys',
      title: 'msys',
      icon: 'chart',
      platform: 'backplatform'
    },
    children: [
      {
        path: 'user_manage',
        name: 'user_manage',
        component: () => import('@/views/_system/user/index'),
        meta: { perm: 'm:sys:user', title: 'muser', noCache: true }
      }
    ]
  },
  // 用户信息部分的添加
  {
    path: '/user',
    component: Layout_user,
    // name: 'Usermessage',
    hidden: true,
    meta: {
      perm: 'm:user',
      title: 'user',
      noCache: true,
      platform: 'backplatform'
    },
    children: [{
      path: 'index',
      component: () =>
          import('@/views/_system/user/person/index'),
      name: 'Usermessage',
      meta: { perm: 'm:user:index', title: 'normal_setting', noCache: true }
    },
    {
      path: 'changePsd',
      component: () =>
          import('@/views/_system/user/person/changePsd'),
      name: 'Systemconfig',
      meta: { perm: 'm:user:changePsd', title: 'changePsd', noCache: true }
    }
    ]
  }
]

export default sysRouter
