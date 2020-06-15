import axios from 'axios'
// import { Message } from 'element-ui'
import store from '@/store'
// import request from '@/utils/request'
// import { getToken, getSessionkey } from '@/utils/auth'
import { getToken, setNewTokenWithExpire } from '@/utils/auth'
import { filterResponse } from '@/utils/index'
import { getTokenNew } from '@/api/system/login'
import baseUrl from '@/utils/baseUrl'

const { base_url } = baseUrl
const gloStatus = RegExp(/\/api\/token\/refresh\//)

// create an axios instance
const service = axios.create({
  baseURL: base_url
  // timeout: 600000 // request timeout todo 要不要超时设置时间待定 默认一直等待后端数据返回
})
const doLogout = () => {
  store.dispatch('FedLogOut').then(() => {
    store.dispatch('SetName', '')
    store.dispatch('SetStatus', '')
    store.dispatch('changeAction', 'dev_platform')
    // sessionStorage.setItem('store', JSON.stringify({})) // 消除vuex刷新初始化
    localStorage.clear()
    sessionStorage.clear()
    sessionStorage.setItem('islogout', '1')
    // this.$router.push({ path: '/' })
    location.reload()// In order to re-instantiate the vue-router object to avoid bugs
  })
}

service.interceptors.request.use(
  config => {
    // Do something before request is sent
    const url = config.url
    if (url.indexOf('/token/') !== -1) {
      return config
    }
    const access_token = getToken('a_t')
    const refresh_token = getToken('f_t')
    if (access_token && store.getters.token && !gloStatus.test(config.url)) {
      // 让每个请求携带token-- ['X-Token']为自定义key 请根据实际情况自行修改
      config.headers['Authorization'] = access_token
      // config.headers['session-key'] = getSessionkey()
      return config
    } else {
      if (!refresh_token) {
        doLogout()
      } else {
        // isRefreshingToken = true
        const data = {
          refresh: getToken('f_t')
        }
        return new Promise(resolve => {
          getTokenNew(data).then(res => {
            const access = 'Bearer ' + res.data.access
            const refresh = res.data.refresh
            setNewTokenWithExpire(access, refresh)
            // this.$store.dispatch('SetStoreToken', access)
            config.headers['Authorization'] = access
            store.commit('SET_TOKEN', access)
            store.commit('SET_FRESH_TOKEN', refresh)
            // isRefreshingToken = false
            resolve(config)
          }).catch(() => {
            doLogout()
          })
        })
      }
    }
    // 模型下载
    // if (config.url === '/datamodeldownload/') {
    //   config.headers['Content-Type'] = 'application/json; application/octet-stream'
    //   config['responseType'] = 'blob'
    // }
  },
  error => {
    // Do something with request error
    Promise.reject(error)
  }
)
// response interceptor
service.interceptors.response.use(
  response => {
    // 拦截返回数据
    return filterResponse(response)
  }, error => {
    const respErr = error.response
    console.log('error.response', respErr)
    const status = respErr ? respErr.status : null
    const requestUrl = error.request.responseURL
    const respData = respErr ? respErr.data : null
    const SERVER_INNER_ERR = typeof respData === 'string' ? respData : 'Unknown Server Error'
    const errInfo = { status, message: respData ? respData.message || SERVER_INNER_ERR : SERVER_INNER_ERR, response: respErr }

    if (status === 401 && requestUrl.indexOf('/api/token/refresh') >= 0) {
      doLogout()
    } else {
      if (status === 400) {
        const keys = Object.keys(respData)
        if (keys.length > 0) {
          errInfo.message = ''
          for (const k of keys) {
            if (Array.isArray(respData[k])) {
              errInfo.message += `${respData[k].join('; ')}\n`
            } else {
              errInfo.message += `${respData[k]}\n`
            }
          }
        }
      } else if (status === 401) {
        errInfo.message = respData.detail || SERVER_INNER_ERR
      }
      return Promise.reject(errInfo)
    }
  }
  /**
   * 下面的注释为通过在response里，自定义code来标示请求状态
   * 当code返回如下情况则说明权限有问题，登出并返回到登录页
   * 如想通过 xmlhttprequest 来状态码标识 逻辑可写在下面error中
   * 以下代码均为样例，请结合自生需求加以修改，若不需要，则可删除
   */
  // response => {
  //   const res = response.data
  //   if (res.code !== 20000) {
  //     Message({
  //       message: res.message,
  //       type: 'error',
  //       duration: 5 * 1000
  //     })
  //     // 50008:非法的token; 50012:其他客户端登录了;  50014:Token 过期了;
  //     if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
  //       // 请自行在引入 MessageBox
  //       // import { Message, MessageBox } from 'element-ui'
  //       MessageBox.confirm('你已被登出，可以取消继续留在该页面，或者重新登录', '确定登出', {
  //         confirmButtonText: '重新登录',
  //         cancelButtonText: '取消',
  //         type: 'warning'
  //       }).then(() => {
  //         store.dispatch('FedLogOut').then(() => {
  //           location.reload() // 为了重新实例化vue-router对象 避免bug
  //         })
  //       })
  //     }
  //     return Promise.reject('error')
  //   } else {
  //     return response.data
  //   }
  // },
  // error => {
  //   Message({
  //     message: error.message,
  //     type: 'error',
  //     duration: 5 * 1000
  //   })
  //   return Promise.reject(error)
  // }
)
export default service
