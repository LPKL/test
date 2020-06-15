import { loginByUsername, logout, getUserInfo, getUnreadCount } from '@/api/system/login'
import { getToken, setTokenWithExpire, setAdminId, removeToken, setUnread } from '@/utils/auth'
import _ from 'lodash'
// import { Message } from 'element-ui'

import global from '@/mock/common.js'
const user = {
  state: {
    user: '',
    status: '',
    code: '',
    id: '',
    token: getToken('a_t'),
    fresh_token: getToken('f_t'),
    name: '',
    avatar: '',
    introduction: '',
    roles: [],
    email: '',
    info_num: 0,
    auth_info: '',
    error_num: 0,
    error_info: '',
    button_perms: '',
    group_id: '',
    is_super: ''
  },

  mutations: {
    SET_CODE: (state, code) => {
      state.code = code
    },
    SET_USERID: (state, id) => {
      state.id = id
    },
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_FRESH_TOKEN: (state, token) => {
      state.fresh_token = token
    },
    SET_INTRODUCTION: (state, introduction) => {
      state.introduction = introduction
    },
    SET_STATUS: (state, status) => {
      state.status = status
    },
    SET_NAME: (state, name) => {
      state.name = name
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    },
    SET_INFONUM: (state, info_num) => {
      state.info_num = info_num
    },
    SET_ERRORNUM: (state, error_num) => {
      state.error_num = error_num
    },
    SET_AUTHINFO: (state, auth_info) => {
      state.auth_info = auth_info
    },
    SET_ERRORINFO: (state, error_info) => {
      state.error_info = error_info
    },
    SET_EMAIL: (state, email) => {
      state.email = email
    },
    SET_BUTTON: (state, str) => {
      state.button_perms = str
    },
    SET_GROUP_ID: (state, group_id) => {
      state.group_id = group_id
    },
    SET_SUPER: (state, is_super) => {
      state.is_super = is_super
    }
  },

  actions: {
    // 用户名登录
    LoginByUsername({ commit }, userInfo) {
      const username = userInfo.username.trim()
      return new Promise((resolve, reject) => {
        loginByUsername(username, userInfo.password).then(response => {
          const data = response.data
          const token = 'Bearer ' + data.access
          const freshToken = data.refresh
          commit('SET_TOKEN', token)
          commit('SET_FRESH_TOKEN', freshToken)
          setTokenWithExpire(token, freshToken)
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 获取用户信息
    GetUserInfo({ commit, state }) {
      return new Promise((resolve, reject) => {
        getUserInfo().then(response => {
          if (response.status !== 200) { // 由于mockjs 不支持自定义状态码只能这样hack
            reject('status error is not 200')
          } else {
            const data = response.data
            const perms = 'm:sys,m:sys:user,m:sys:role,m:sys:perm,m:sys:assign_perm,m:user,m:user:index,m:user:changePsd,' +
                          'm:newmodel:index,m:realtimeflow:index,m:realtmonitor:index,m:process:index,m:dfilemanage:index,' +
                          'm:dashboard:index,m:faultmanagement:index,m:messagemanagement:all,m:taskmonitoring,m:taskmonitoring:list,m:taskmonitoring:taskdetail,' +
                          'm:algmanagement,m:algmanagement:create,m:algmanagement:edit,m:algmanagement:view,m:algmanagement:index,h,h:homeBanner,h:homeView,' +
                          'm:manageCenter,m:manageCenter:dflowmanage,m:manageCenter:trainedindex,m:manageCenter:piplineindex,m:manageCenter:crew,m:manageCenter:his,m:manageCenter:tab,' +
                          'm:manageCenter:crewshi,m:manageCenter:dbdetail,m:manageCenter:crew:hismessage,m:manageCenter:crew:hismessage:db,m:manageCenter:crew:hismessage:tf,' +
                          'm:manageCenter:crew:shimessage,m:dflowmanage:index,m:example,m:example:create,m:example:edit,m:example:list,' +
                          'm:modelmanagement,m:modelmanagement:preindex,m:modelmanagement:trainedindex,m:realtime,m:realtime:origin,m:realtime:flow,m:runreport:index,' +
                          'm:realtimeorigin,m:realtimeorigin:index,m:realtimeflow,m:realtimeflow:index,m:servermodel,m:servermodel:index,m:manageCenter:metadataManage:index,m:manageCenter:metadataManage:addfield,m:pipeline:index,' +
                          'm:manageCenter:structure,'
            let roles = ''
            roles = _.uniq(perms.split(',').slice(0, -1))
            // 验证返回的roles是否是一个非空数组
            // if (roles && data.roles.length > 0) {
            commit('SET_ROLES', roles)
            // } else {
            //   reject('getInfo: roles must be a non-null array !')
            // }
            commit('SET_NAME', data.username)
            commit('SET_USERID', data.id)
            // commit('SET_SUPER', data.attributes.is_superuser)
            commit('SET_STATUS', response.status)
            // 设置id
            global.id = data.id
            setAdminId(data.id)
            // commit('SET_GROUP_ID', data.user_group_id)
            // if (response.data.button_perms) {
            const btn = 'msys,muser,selectuser,adduser,userdetail,edituser,changeuser,deleteuser,mrole,selectgroup,addgroup,groupadduser,editgroup,changeperm,deletegroup,prole,permManage,selectperm,addperm,editperm,permdetail,deleteperm,mcreat,creatatl,crelease,cdraft,cuploadimg,cuploadfile,creatlist,ledit,mtab,monitor,newmodel,nselectdevice,nselectprocess,naddflow,nrunflow,nsaveflow,realtimeflow,rselectdevice,rselectproject,raddflow,rrunflow,rsaveflow,realtmonitor,retdevice,taskmonitoring,faultmegtab,runreport,process,dfilemanage,ddevice,dhpreview,dspreview,dsrealflow,dsflowmanage,file,dataflow,flowmanage,datapreview,delete,search,dfilehistab,dfileshitab,dHive,adddata,uploadfiles,existHdfs,hiveData,shiOrigin,dflowmanage,dfsearch,dfdevice,dfedit,dfdelete,dffile,dffedit,dfrelease,dffdelete,report,realflow,dashboard,configure,faultManagement,alldevice,alldfault,allalgorithm,timemodel,faultsearch,faultreset,faultdetail,example,createArticle,editArticle,articleList,user,modifying_data,changePsd,userdropdown,configcenter,datamanage,modelManagement,preModel,pretreatmodeledit,pretreatmodelaccredit,pretreatmodeldelete,trainedModel,trainedmodeledit,trainedmodelaccredit,trainedmodeldelete,algmanagement,AlgorithmView,AlgorithmEdit,AlgorithmDelete'
            commit('SET_BUTTON', btn)
            // } else {
            //   commit('SET_BUTTON', ',')
            // }
            // commit('SET_AVATAR', data.avatar)//头像
            // commit('SET_INTRODUCTION', data.introduction)//介绍
            // commit('SET_INFONUM', response.data.info_num) // 未读系统消息计数
            // commit('SET_INFONUM', getUnreadNum(data.unread_count))
            // commit('SET_AUTHINFO', response.data.auth_info)
            // commit('SET_ERRORNUM', getUnreadNum(data.unread_count)) // 未读故障消息计数
            // commit('SET_ERRORINFO', response.data.error_info)
            resolve(response)
          }
        }).catch(error => {
          reject(error)
        })
      })
    },
    // 获取未读消息数量
    getCountUnread({ commit, state }) {
      return new Promise((resolve, reject) => {
        getUnreadCount().then(res => {
          if (res.status !== 200) {
            reject('status error is not 200!')
          } else {
            commit('SET_ERRORNUM', res.data) // 未读故障消息计数
            setUnread(res.data)
            resolve(res)
          }
        }).catch(error => {
          reject(error)
        })
      })
    },
    // 改变按钮权限的值
    ChangeButtonPerms({ commit }, ppp) {
      commit('SET_BUTTON', ppp)
    },
    // 第三方验证登录
    // LoginByThirdparty({ commit, state }, code) {
    //   return new Promise((resolve, reject) => {
    //     commit('SET_CODE', code)
    //     loginByThirdparty(state.status, state.email, state.code).then(response => {
    //       commit('SET_TOKEN', response.data.token)
    //       setToken(response.data.token)
    //       resolve()
    //     }).catch(error => {
    //       reject(error)
    //     })
    //   })
    // },

    // 登出
    LogOut({ commit, state }) {
      return new Promise((resolve, reject) => {
        logout(state.token).then(() => {
          commit('SET_TOKEN', '')
          commit('SET_ROLES', [])
          removeToken()
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 前端 登出
    FedLogOut({ commit }) {
      return new Promise(resolve => {
        commit('SET_TOKEN', '')
        removeToken()
        resolve()
      })
    },

    // 动态修改权限
    ChangeRoles({ commit }, role) {
      return new Promise(resolve => {
        commit('SET_TOKEN', role)
        // setToken(role)
        getUserInfo(role).then(response => {
          const data = response.data
          commit('SET_ROLES', data.roles)
          commit('SET_NAME', data.name)
          commit('SET_AVATAR', data.avatar)
          commit('SET_INTRODUCTION', data.introduction)
          resolve()
        })
      })
    },
    // 设置邮箱
    SetEmail({ commit }, email) {
      commit('SET_EMAIL', email)
    },
    // 设置name
    SetName({ commit }, name) {
      commit('SET_NAME', name)
    },
    // 设置用户未读消息数量值
    SetInfoNum({ commit }, info_num) {
      commit('SET_INFONUM', info_num)
    },
    setMessageNum({ commit }, opreates) {
      commit('SET_ERRORNUM', opreates) // 未读故障消息计数
      setUnread(opreates)
    },
    // 设置状态
    SetStatus({ commit }, status) {
      commit('SET_STATUS', status)
    },
    // 设置token
    SetStoreToken({ commit }, status) {
      commit('SET_TOKEN', status)
    }
  }
}

export default user
