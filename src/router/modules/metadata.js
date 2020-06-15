import Layout_m from '@/views/layout_m/Layout_m'
const metadataRouter = {
  path: '/manageCenter/metadatamanage',
  component: Layout_m,
  redirect: '/manageCenter/metadatamanage/index',
  name: 'MetadataManage',
  hidden: true,
  meta: {
    perm: 'm:manageCenter:metadataManage',
    title: 'metadataManage',
    platform: 'devplatform'
  },
  children: [
    {
      path: 'index',
      component: () => import('@/views/datamining/metamanage/index'),
      name: 'Metadata',
      meta: { perm: 'm:manageCenter:metadataManage:index', title: 'metadata', noCache: true }
    },
    {
      path: 'addfield',
      component: () => import('@/views/datamining/metamanage/components/addField'),
      name: 'AddField',
      meta: { perm: 'm:manageCenter:metadataManage:addfield', platform: 'devplatform', title: 'addField', nocache: true }
    }
  ]
}
export default metadataRouter
