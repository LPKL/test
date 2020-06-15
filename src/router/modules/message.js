import Layout_m from '@/views/layout_m/Layout_m'

const messageRouter = [
  // 消息管理路由及指定加载界面
  {
    path: '/receivemessage',
    component: Layout_m,
    hidden: true,
    meta: {
      perm: 'm:receivemessage',
      title: 'ReceiveMessage',
      icon: 'message',
      platform: 'runplatform'
    },
    children: [{
      path: 'index/:type',
      component: () =>
          import('@/views/message/index'),
      name: 'ReceiveMessage'
    }]
  },
  // 配置中心，创建消息，查看所有已发送
  {
    path: '/messagemanagement',
    component: Layout_m,
    redirect: '/messagemanagement/index',
    meta: {
      perm: 'm:messageanagement',
      title: 'messageManagement',
      icon: 'message',
      platform: 'devplatform'
    },
    children: [{
      path: 'index',
      component: () =>
          import('@/views/message/list'),
      name: 'AllMessage',
      meta: { perm: 'm:messagemanagement:all', title: 'allMessage', icon: 'list' }
    }
    ]
  }
]
export default messageRouter
