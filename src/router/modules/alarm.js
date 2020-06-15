/** When your routing table is too long, you can split it into small modules**/

// import Layout from '@/views/layout/Layout'
import Layout_m from '@/views/layout_m/Layout_m'
const alarmRouter = {
  path: '/alarmConfig',
  component: Layout_m,
  redirect: '/alarmConfig/alarmRules',
  name: 'AlarmConfig',
  hidden: true,
  meta: {
    perm: 'm:alarmConfig',
    title: 'alarmConfig',
    icon: 'chart',
    platform: 'runplatform'
  },
  children: [
    {
      path: 'alarmRules',
      component: () => import('@/views/device/alarm/AlarmRules'),
      name: 'alarmRules',
      meta: { title: 'alarmRules', noCache: true }
    },
    {
      path: 'faultCodes',
      component: () => import('@/views/device/alarm/AlarmFaultCodes'),
      name: 'faultCodes',
      meta: { title: 'faultCodes', noCache: true }
    }
  ]
}

export default alarmRouter
