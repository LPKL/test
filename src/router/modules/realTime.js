import Layout_m from '@/views/layout_m/Layout_m'
const realTimeRouter = [
  // 实时源
  {
    path: '/realTimeOrigin',
    component: Layout_m,
    hidden: true,
    redirect: '/realTimeOrigin/index',
    meta: {
      perm: 'm:realtimeorigin',
      title: 'datacontain',
      icon: 'realtimeorigin',
      platform: 'devplatform'
    },
    children: [{
      path: 'index',
      name: 'RealTime',
      component: () => import('@/views/datamining/dataflow/realdata'),
      meta: { perm: 'm:realtimeorigin:index', title: 'datacontain', icon: 'realtimeorigin', noCache: true }
    }]
  },
  // 实时流
  {
    path: '/realTimeFlow',
    component: Layout_m,
    hidden: true,
    redirect: '/realTimeFlow/index',
    meta: {
      perm: 'm:realtimeflow',
      title: 'flowcontain',
      icon: 'realtimeflow',
      platform: 'devplatform'
    },
    children: [{
      path: 'index',
      name: 'RealFlow',
      component: () => import('@/views/datamining/dataflow/realflow'),
      meta: { perm: 'm:realtimeflow:index', title: 'flowcontain', icon: 'realtimeflow', noCache: true }
    }]
  }, {
    path: '/realtime',
    component: Layout_m,
    redirect: '/realtime/realtimeorigin',
    hidden: true,
    name: 'realtime',
    meta: {
      perm: 'm:realtime',
      title: 'realtime',
      icon: 'realtime',
      platform: 'runplatform'
    },
    children: [
      // {
      //   path: 'index',
      //   name: 'RealTime',
      //   component: () => import('@/views/datamining/dataflow/realtime/index'),
      //   meta: { perm: 'm:realtime:index', title: 'realtime', icon: 'realtime' }
      // }
      {
        path: 'realtimeflow',
        name: 'RealTimeFlow',
        component: () => import('@/views/datamining/dataflow/realtime/RealTimeFlow'),
        meta: { perm: 'm:realtime:flow', title: 'realtimeflow', icon: 'realtimeflow' }
      },
      {
        path: 'realtimeorigin',
        name: 'RealTimeOrigin',
        component: () => import('@/views/datamining/dataflow/realtime/RealTimeOrigin'),
        meta: { perm: 'm:realtime:origin', title: 'realtimeorigin', icon: 'realtimeorigin' }
      }
    ]
  }, {
    //  实时监测
    path: '/realtmonitor',
    component: Layout_m,
    redirect: '/realtmonitor/index',
    hidden: true,
    meta: {
      perm: 'm:realtmonitor',
      title: 'monitor',
      icon: 'realtmonitor',
      platform: 'runplatform'
    },
    children: [{
      path: 'index',
      component: () =>
          import('@/views/datamining/realtmonitor/index'),
      name: 'Realtmonitor',
      meta: { perm: 'm:realtmonitor:index', title: 'monitor', icon: 'realtmonitor', noCache: true }
    }]
  }]
export default realTimeRouter
