/** When your routing table is too long, you can split it into small modules**/

import Layout_m from '@/views/layout_m/Layout_m'

const algorithmRouter = {
  path: '/algmanagement',
  component: Layout_m,
  redirect: '/algmanagement/index',
  meta: {
    perm: 'm:algmanagement',
    title: 'Algmanagement',
    icon: 'alg',
    platform: 'devplatform'
  },
  children: [{
    hidden: true,
    path: 'create',
    component: () => import('@/views/algorithm/create'),
    name: 'AlgorithmCreate',
    meta: { perm: 'm:algmanagement:create', title: 'AlgorithmCreate', icon: 'create' }
  },
  {
    hidden: true,
    path: 'edit',
    component: () => import('@/views/algorithm/edit'),
    name: 'AlgorithmEdit',
    meta: { perm: 'm:algmanagement:edit', title: 'AlgorithmEdit', icon: 'edit' }
  },
  {
    hidden: true,
    // path: 'view/:id(\\d+)',
    path: 'view',
    component: () => import('@/views/algorithm/view'),
    name: 'AlgorithmView',
    meta: { perm: 'm:algmanagement:view', title: 'AlgorithmView', icon: 'view' }
  },
  {
    path: 'index',
    component: () => import('@/views/algorithm/index'),
    name: 'AlgorithmTreeIndex',
    meta: { perm: 'm:algmanagement:index', title: 'AlgorithmList', icon: 'alg' }
  }]
}

export default algorithmRouter
