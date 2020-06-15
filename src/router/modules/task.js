/** When your routing table is too long, you can split it into small modules**/

import Layout_m from '@/views/layout_m/Layout_m'
const taskRouter = {
  path: '/taskmonitoring',
  component: Layout_m,
  redirect: '/taskmonitoring/list',
  name: 'Taskmonitoring',
  hidden: true,
  meta: {
    perm: 'm:taskmonitoring',
    title: 'taskmonitoring',
    icon: 'taskmonitoring',
    noCache: true,
    platform: 'devplatform'
  },
  children: [
    {
      path: 'list',
      component: () => import('@/views/device/taskmonitoring/list/index'),
      name: 'tasklist',
      meta: { perm: 'm:taskmonitoring:list', title: 'tasklist', icon: 'tasklist', noCache: true }
    },
    {
      path: 'taskdetail',
      component: () => import('@/views/device/taskmonitoring/taskdetail/index'),
      name: 'taskdetail',
      meta: { perm: 'm:taskmonitoring:taskdetail', title: 'taskdetail', icon: 'taskdetail', noCache: true }
    }]
}

export default taskRouter
