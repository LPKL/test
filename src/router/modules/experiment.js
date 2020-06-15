import Layout_m from '@/views/layout_m/Layout_m'

const experimentRouter = [
  // 数据流程
  {
    path: '/newmodel',
    component: Layout_m,
    redirect: '/newmodel/index',
    meta: {
      perm: 'm:newmodel',
      title: 'newmodel',
      icon: 'newmodel',
      platform: 'devplatform'
    },
    hidden: true,
    children: [
      {
        path: 'index',
        component: () =>
          import('@/views/experiment/newmodel/index'),
        name: 'Newmodel',
        meta: { perm: 'm:newmodel:index', title: 'newmodel', icon: 'newmodel', noCache: true }
      },
      {
        path: 'pipeline',
        name: 'Pipeline',
        component: () => import('@/views/experiment/newmodel/pipeline'),
        meta: { perm: 'm:pipeline:index', title: 'pipeline', icon: 'newmodel', noCache: true }
      }
    ]
  }
]
export default experimentRouter
