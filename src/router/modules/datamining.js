import Layout_m from '@/views/layout_m/Layout_m'
const dataminingRouter = [{
  path: '/manageCenter',
  component: Layout_m,
  redirect: '/manageCenter/dflowmanage',
  hidden: true,
  name: 'ManageCenter',
  meta: {
    perm: 'm:manageCenter',
    title: 'manageCenter',
    icon: 'manageCenter',
    platform: 'devplatform'
  },
  children: [
    // 实验管理
    {
      path: 'dflowmanage',
      component: () =>
          import('@/views/experiment/models/index'),
      name: 'DflowManage',
      meta: { perm: 'm:manageCenter:dflowmanage', title: 'dflowmanage', icon: 'dflowmanage', noCache: true }
    },
    // 模型管理
    {
      path: 'trainedindex/:page',
      component: () =>
          import('@/views/datamining/modelmanagement/TrainedIndex'),
      name: 'TrainedModel',
      meta: { perm: 'm:manageCenter:trainedindex', title: 'trainedModel', icon: 'trainedModel', noCache: true }
    },
    // pipeline管理
    {
      path: 'piplineindex/:page',
      name: 'PiplineModel',
      component: () =>
        import('@/views/datamining/modelmanagement/PiplineIndex'),
      meta: { perm: 'm:manageCenter:piplineindex', title: 'piplineModel', icon: 'trainedModel', noCache: true }
    },
    // 表结构管理
    {
      path: 'structure',
      name: 'Structure',
      component: () =>
        import('@/views/datamining/structureManage'),
      meta: { perm: 'm:manageCenter:structure', title: 'structure', icon: 'structureManage', noCache: true }
    }
    // 设备管理
    // {
    //   path: 'crewmessage',
    //   name: 'Crewmessage',
    //   component: () => import('@/views/device/devicemanage/crewmessage/index'),
    //   meta: { perm: 'm:manageCenter:crew', title: 'crewmessage', noCache: true }
    // },
    // {
    //   hidden: true,
    //   path: 'history',
    //   name: 'History',
    //   component: () => import('@/views/device/devicemanage/components/hisdb'),
    //   meta: { perm: 'm:manageCenter:his', title: 'historycrew', noCache: true }
    // },
    // {
    //   hidden: true,
    //   path: 'tablemes',
    //   name: 'Tablemes',
    //   component: () => import('@/views/device/devicemanage/components/histab'),
    //   meta: { perm: 'm:manageCenter:tab', title: 'tablemescrew', noCache: true }
    // },
    // {
    //   hidden: true,
    //   path: 'crewshi',
    //   name: 'Crewshi',
    //   component: () => import('@/views/device/devicemanage/components/shiorg'),
    //   meta: { perm: 'm:manageCenter:crewshi', title: 'crewshi', noCache: true }
    // },
    // {
    //   hidden: true,
    //   path: 'tabdetail',
    //   name: 'Tabdetail',
    //   component: () => import('@/views/device/devicemanage/hismessage/tabdetail'),
    //   meta: { perm: 'm:manageCenter:dbdetail', title: 'tabdetail', noCache: true }
    // },
    // {
    //   path: 'hismessage',
    //   component: () => import('@/views/device/devicemanage/hismessage/index'),
    //   name: 'Hismessage',
    //   meta: { perm: 'm:manageCenter:crew:hismessage', title: 'hismessage', noCache: true },
    //   redirect: '/devicemanage/hismessage/databaseinfo',
    //   children: [
    //     {
    //       path: 'databaseinfo',
    //       component: () => import('@/views/device/devicemanage/components/hisdb'),
    //       name: 'Databaseinfo',
    //       meta: { perm: 'm:manageCenter:crew:hismessage:db', title: 'databaseinfo', noCache: true }
    //     },
    //     {
    //       path: 'tableinfo',
    //       component: () => import('@/views/device/devicemanage/components/histab'),
    //       name: 'Tableinfo',
    //       meta: { perm: 'm:manageCenter:crew:hismessage:tf', title: 'tableinfo', noCache: true }
    //     }
    //   ]
    // },
    // {
    //   path: 'shimessage',
    //   name: 'Shimessage',
    //   component: () => import('@/views/device/devicemanage/components/shiorg'),
    //   meta: { perm: 'm:manageCenter:crew:shimessage', title: 'shimessage', noCache: true }
    // }
  ]
},
// 历史数据管理
{
  path: '/dfilemanage',
  component: Layout_m,
  redirect: '/dfilemanage/index',
  hidden: true,
  meta: {
    perm: 'm:dfilemanage',
    title: 'sourceconfig',
    icon: 'dfilemanage',
    platform: 'devplatform'
  },
  children: [{
    path: 'index',
    component: () =>
        import('@/views/datamining/historydata/index'),
    name: 'DfileManage',
    meta: { perm: 'm:dfilemanage:index', title: 'sourceconfig', icon: 'dfilemanage', noCache: true }
  }]
}]
export default dataminingRouter
