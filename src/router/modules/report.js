/** When your routing table is too long, you can split it into small modules**/

// import Layout from '@/views/layout/Layout'
import Layout_m from '@/views/layout_m/Layout_m'
const reportRouter = [{
  path: '/template',
  redirect: '/template/index',
  component: Layout_m,
  meta: {
    perm: 'm:template:index',
    title: 'Template',
    icon: 'template',
    platform: 'runplatform'
  },
  hidden: true,
  // 模板配置页面
  children: [{
    hidden: true,
    path: 'editor',
    component: () => import('@/views/report/template/editor'),
    name: 'TemplateEditor'
  },
  {
    path: 'index',
    component: () => import('@/views/report/template/index'),
    name: 'Template'
  }]
}, {
  // 运行报告
  path: '/runreport',
  component: Layout_m,
  redirect: '/runreport/index',
  hidden: true,
  meta: {
    perm: 'm:runreport:index',
    title: 'runReport',
    icon: 'runreport',
    platform: 'runplatform'
  },
  children: [{
    path: 'index',
    component: () =>
        import('@/views/report/runreport/index'),
    name: 'RunReport',
    meta: { perm: 'm:runreport:index', title: 'runReport', icon: 'runreport', noCache: true }
  },
  {
    path: 'preview',
    component: () => import('@/views/report/runreport/view'),
    name: 'RunReportView'
    // meta: { title: 'RunReportView', noCache: true }
  }]
}]

export default reportRouter
