import Layout_m from '@/views/layout_m/Layout_m'

const deviceRouter = [
  // 故障管理路由及指定加载界面
  {
    path: '/faultmanagement',
    component: Layout_m,
    redirect: '/faultmanagement/index',
    hidden: true,
    meta: {
      perm: 'm:faultManagement:index',
      title: 'faultManagement',
      icon: 'faultmanagement',
      platform: 'runplatform'
    },
    children: [{
      path: 'index',
      component: () =>
          import('@/views/device/faultmanagement/index'),
      name: 'FaultManagement',
      meta: { perm: 'm:faultmanagement:index', title: 'faultManagement', icon: 'faultmanagement', noCache: true }
    },
    {
      path: 'faultreport',
      component: () => import('@/views/report/template/view'),
      name: 'FaultReportView'
      // meta: { title: 'FaultReportView', noCache: true }
    }]
  }
  // {
  //   path: '/deviceManage',
  //   component: Layout_m,
  //   // name: 'DeviceManage',
  //   meta: { perm: 'd', title: 'deviceManage', icon: 'devicemanage' },
  //   children: [
  //     {
  //       path: 'crewmessage',
  //       name: 'Crewmessage',
  //       component: () => import('@/views/device/devicemanage/crewmessage/index'),
  //       meta: { perm: 'd:crew', title: 'crewmessage', noCache: true }
  //     },
  //     {
  //       hidden: true,
  //       path: 'history',
  //       name: 'History',
  //       component: () => import('@/views/device/devicemanage/components/hisdb'),
  //       meta: { perm: 'd:his', title: 'historycrew', noCache: true }
  //     },
  //     {
  //       hidden: true,
  //       path: 'tablemes',
  //       name: 'Tablemes',
  //       component: () => import('@/views/device/devicemanage/components/histab'),
  //       meta: { perm: 'd:tab', title: 'tablemescrew', noCache: true }
  //     },
  //     {
  //       hidden: true,
  //       path: 'crewshi',
  //       name: 'Crewshi',
  //       component: () => import('@/views/device/devicemanage/components/shiorg'),
  //       meta: { perm: 'd:crewshi', title: 'crewshi', noCache: true }
  //     },
  //     {
  //       hidden: true,
  //       path: 'tabdetail',
  //       name: 'Tabdetail',
  //       component: () => import('@/views/device/devicemanage/hismessage/tabdetail'),
  //       meta: { perm: 'd:dbdetail', title: 'tabdetail', noCache: true }
  //     },
  //     {
  //       path: 'hismessage',
  //       component: () => import('@/views/device/devicemanage/hismessage/index'),
  //       name: 'Hismessage',
  //       meta: { perm: 'd:crew:hismessage', title: 'hismessage', noCache: true },
  //       redirect: '/devicemanage/hismessage/databaseinfo',
  //       children: [
  //         {
  //           path: 'databaseinfo',
  //           component: () => import('@/views/device/devicemanage/components/hisdb'),
  //           name: 'Databaseinfo',
  //           meta: { perm: 'd:crew:hismessage:db', title: 'databaseinfo', noCache: true }
  //         },
  //         {
  //           path: 'tableinfo',
  //           component: () => import('@/views/device/devicemanage/components/histab'),
  //           name: 'Tableinfo',
  //           meta: { perm: 'd:crew:hismessage:tf', title: 'tableinfo', noCache: true }
  //         }
  //       ]
  //     },
  //     {
  //       path: 'shimessage',
  //       name: 'Shimessage',
  //       component: () => import('@/views/device/devicemanage/components/shiorg'),
  //       meta: { perm: 'd:crew:shimessage', title: 'shimessage', noCache: true }
  //     }
  //   ]
  // }
]

export default deviceRouter
