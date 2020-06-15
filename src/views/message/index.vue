<template>
  <div>
    <el-container>
      <el-main style="padding:0 20px;">
        <el-row class="tac">
          <el-col :span="5">
            <el-menu
              v-model="mmType"
              mode="vertical"
              default-active="3"
              class="el-menu-vertical-demo"
              @select="handleSelect">
              <!-- <el-submenu index="1">
                <template slot="title">
                  <span>{{ $t('navbar.systemMessage') }}</span>
                </template>
                <el-menu-item index="1-1">
                  <span>{{ $t('navbar.systemMessage') }}
                    <el-badge v-show="myMessageNum != 0" :value="myMessageNum" class="mark"/>
                  </span>
                </el-menu-item>
                <el-menu-item index="1-2">
                  <span>{{ $t('navbar.systemMessage') }}
                    <el-badge v-show="myMessageNum != 0" :value="myMessageNum" class="mark"/>
                  </span>
                </el-menu-item>
              </el-submenu> -->
              <el-menu-item v-is-show="{name: 'faultmegtab'}" index="2">
                <span>{{ $t('labels.messagemanage.error_message') }}
                  <el-badge v-show="errorMessageNum != 0" :value="errorMessageNum" class="mark"/>
                </span>
              </el-menu-item>
              <el-menu-item index="3">
                <span>{{ $t('labels.messagemanage.system_message') }}
                  <el-badge v-show="myMessageNum != 0" :value="myMessageNum" class="mark"/>
                </span>
              </el-menu-item>
            </el-menu>
          </el-col>
          <el-col :span="19">
            <comp-mymessagedetail
              v-show="true ? myMessageId != 0 : myMessageId == 0"
              :detail-data="mymessagedetail"
              :view-style = "detailview"
              @backtolist = "backtolist"/>
            <comp-mymessagelist
              v-show="myMessageId == 0 && selectIndex == 3"
              :data-list="authDatalist"
              :data-list-status="authDataListStatus"
              :total-count="total"
              :list-loading="listLoading"
              @myMessagelistPage="getMyMessagelistPage"
              @aclickrow = "myMessageClickRow"
              @areadall = "setMyMessageReadAll"/>
            <comp-faultmessagedetail
              v-show="true ? faultMessageId != 0 : faultMessageId == 0"
              :detail-data = "errordetaildatalist"
              :view-style = "detailview"
              :detail-data-id = "faultMessageId"
              @backtolist = "faultbacktolist"
              @fddeleterow = "deleteFaultMessage"/>
            <comp-faultmessagelist
              v-show="faultMessageId == 0 && selectIndex == 2"
              :data-list="errorDatalist"
              :data-list-status="errorDataListStatus"
              :total-count="total2"
              :list-loading="listLoading2"
              @faultMessagelistPage="getFaultMessagelistPage"
              @fclickrow = "faultMessageClickRow"
              @fdeleterow = "deleteFaultMessage"
              @freadall = "setFaultMessageReadAll"
              @fdeleteall = "setFaultMessageDeleteAll"/>
          </el-col>
        </el-row>
      </el-main>
    </el-container>
  </div>
</template>

<script>
// 向服务器端请求的API
import { getAuthInfos, getAuthInfosCount, getErrorInfos, getErrorInfosCount, updateInfo } from '@/api/message'
import { faultDataList } from '@/api/device/fault'
import MyMessageList from './components/MyMessageList'
import MyMessageDetail from './components/MyMessageDetail'
import FaultMessageList from './components/FaultMessageList'
import FaultMessageDetail from './components/FaultMessageDetail'
import { getMessageStatus, getUnreadNum } from '@/utils/auth'
export default {
  name: 'ReceiveMessage',
  components: {
    'comp-mymessagelist': MyMessageList,
    'comp-mymessagedetail': MyMessageDetail,
    'comp-faultmessagelist': FaultMessageList,
    'comp-faultmessagedetail': FaultMessageDetail
  },
  props: {
    mType: {
      type: String,
      default: '0'
    }
  },
  data() {
    return {
      // mType: this.$route.params.type,
      mmType: this.mType,
      sTitle: '',
      sInfo: '',
      sGroup: '', // 企业用户获得所有系统和企业消息
      authDatalist: null,
      authDataListStatus: null,
      errorDatalist: null,
      errorDataListStatus: null,
      total: 0,
      total2: 0,
      // hud
      listLoading: true,
      listLoading2: true,
      page: 1,
      page2: 1,
      // 选中条目后的详细信息id
      myMessageId: 0,
      faultMessageId: 0,
      detailview: {
        height: ''
      },
      mymessagedetail: null,
      errordetaildatalist: null,
      // menu选中，3是官方消息
      selectIndex: 3
    }
  },
  computed: {
    myMessageNum() {
      return Number(this.$store.state.user.info_num)
    },
    errorMessageNum() {
      // console.log('navbar error_num', this.$store.state.user.error_num)
      return Number(this.$store.state.user.error_num)
    }
  },
  created() {
    // console.log('mType', this.mmType)
    this.authDataListStatus = getMessageStatus(this.$store.state.user.auth_info)
    this.authInfosData(this.page, this.sTitle, this.sInfo, this.sGroup)
    this.errorDataListStatus = getMessageStatus(this.$store.state.user.error_info)
    this.errorInfosData(this.page2)
  },
  // updated() {
  //   console.log('messagemanagement index update')
  // },
  methods: {
    // 服务器端获取显示数据
    authInfosData: function(PageNum, Title, Informantion, Group) {
      getAuthInfos({
        'page': PageNum,
        'title': Title,
        'informantion': Informantion,
        'to_group': Group }).then(res => {
        const data = res.data.data
        // console.log('authInfosData data', data)
        for (var i = 0; i < data.length; i++) {
          let hasStatus = 0
          for (var j = 0; j < this.authDataListStatus.length; j++) {
            if (data[i].id === this.authDataListStatus[j].key) {
              hasStatus = 1
            }
          }
          if (hasStatus === 0) {
            data.splice(i, 1)
          }
        }
        this.authDatalist = data
        this.listLoading = false
      }).catch(error => {
        console.log('authInfosData ', error)
        this.listLoading = false
      })
      getAuthInfosCount({
        'page': PageNum,
        'title': Title,
        'informantion': Informantion,
        'to_group': Group }).then(res => {
        const data = res.data.data
        // console.log('authInfosData data count', data)
        this.total = Number(data)
      }).catch(error => {
        console.log('getAuthInfosCount ', error)
      })
    },
    errorInfosData: function(PageNum, Title, Informantion, Group) {
      getErrorInfos({
        'page': PageNum }).then(res => {
        const data = res.data.data
        // console.log('errorInfosData data', data)
        for (var i = 0; i < data.length; i++) {
          let hasErrorStatus = 0
          for (var j = 0; j < this.errorDataListStatus.length; j++) {
            if (Number(data[i].id) === Number(this.errorDataListStatus[j].key)) {
              hasErrorStatus = 1
            }
          }
          if (hasErrorStatus === 0) {
            data.splice(i, 1)
          }
        }
        this.errorDatalist = data
        this.listLoading2 = false
      }).catch(error => {
        console.log('errorInfosData ', error)
        this.listLoading2 = false
      })
      getErrorInfosCount({
        'page': PageNum }).then(res => {
        const data = res.data.data
        // console.log('errorInfosData data count', data)
        this.total2 = Number(data)
      }).catch(error => {
        console.log('getErrorInfosCount ', error)
      })
    },
    // 左侧导航消息类型切换，每次切换重新请求最新数据
    handleSelect(key, keyPath) {
      // console.log('handleSelect ', key, keyPath)
      this.myMessageId = 0
      this.faultMessageId = 0
      this.selectIndex = key
      if (key === '3') {
        // index = 3 官方消息
        console.log('system message')
        // 更新时机：每次dialog调出的时候请求消息状态字段，并请求各自第一页消息--childAction(),这样在menu切换的时候不再刷新，以防状态位和新获取的消息不一致
        // this.authDataListStatus = getMessageStatus(this.$store.state.user.auth_info)
        // this.authInfosData(this.page, this.sTitle, this.sInfo, this.sGroup)
      } else if (key === '2') {
        // index = 2 故障消息
        console.log('error message')
        // this.errorDataListStatus = getMessageStatus(this.$store.state.user.error_info)
        // this.errorInfosData(this.page2)
      }
    },
    childAction() {
      // 显示dialog就更新系统消息
      console.log('update message state')
      this.authDataListStatus = getMessageStatus(this.$store.state.user.auth_info)
      this.authInfosData(this.page, this.sTitle, this.sInfo, this.sGroup)
      this.errorDataListStatus = getMessageStatus(this.$store.state.user.error_info)
      this.errorInfosData(this.page2)
    },
    // 翻页
    getMyMessagelistPage: function(pagen) {
      // console.log('getMyMessagelistPage', pagen)
      this.page = pagen
      this.authInfosData(this.page, this.sTitle, this.sInfo, this.sGroup)
    },
    getFaultMessagelistPage: function(pagen) {
      // console.log('getFaultMessagelistPage', pagen)
      this.page2 = pagen
      this.errorInfosData(this.page2)
    },
    // 状态object重新转换成状态组合字符串
    statusArrToStr: function(statusArr) {
      let statusStr = ''
      for (var i = 0; i < statusArr.length; i++) {
        statusStr += statusArr[i].key
        statusStr += statusArr[i].status
      }
      // console.log('messageClickRow new status', statusStr)
      return statusStr
    },
    // 详情界面消失，返回列表界面
    backtolist: function(messageId) {
      this.myMessageId = messageId
    },
    faultbacktolist: function(messageId) {
      this.faultMessageId = messageId
    },
    // 已读，删除等设置，重构状态组合字符串，并回传到服务器端保存
    updateMessageStatus: function(mtype, type, listArr, rowid) {
      if (type === 'deleteall') {
        listArr = []
        if (mtype === 'error') {
          this.errorDatalist = []
        }
      } else {
        for (var i = 0; i < listArr.length; i++) {
          if (type === 'readall') {
            listArr[i].status = 'Y'
          } else {
            if (Number(rowid) === Number(listArr[i].key)) {
              if (type === 'read') {
                listArr[i].status = 'Y'
              } else if (type === 'delete') {
                listArr.splice(i, 1)
                if (mtype === 'error') {
                  for (var z = 0; z < this.errorDatalist.length; z++) {
                    if (Number(rowid) === Number(this.errorDatalist[z].id)) {
                      this.errorDatalist.splice(z, 1)
                    }
                  }
                }
              }
            }
          }
        }
      }
      let infopara = ''
      if (mtype === 'auth') {
        this.authDataListStatus = listArr
        infopara = this.statusArrToStr(this.authDataListStatus)
      } else if (mtype === 'error') {
        this.errorDataListStatus = listArr
        infopara = this.statusArrToStr(this.errorDataListStatus)
      }
      // console.log('updateMessageStatus', infopara)
      const tpara = {
        flag: mtype + '_info',
        info: infopara
      }
      updateInfo(tpara).then(res => {
        // console.log('updateinfo success', res.data)
        if (mtype === 'auth') {
          this.$store.state.user.auth_info = res.data.data.attributes.auth_info
          this.$store.state.user.info_num = getUnreadNum(this.$store.state.user.auth_info)
        } else if (mtype === 'error') {
          this.$store.state.user.error_info = res.data.data.attributes.error_info
          this.$store.state.user.error_num = getUnreadNum(this.$store.state.user.error_info)
        }
      }).catch((error) => {
        console.log('updateinfo', error)
        if (mtype === 'auth') {
          this.$store.state.user.auth_info = this.statusArrToStr(this.authDataListStatus)
          this.$store.state.user.info_num = getUnreadNum(this.$store.state.user.auth_info)
        } else if (mtype === 'error') {
          this.$store.state.user.error_info = this.statusArrToStr(this.errorDataListStatus)
          this.$store.state.user.error_num = getUnreadNum(this.$store.state.user.error_info)
        }
      })
    },
    // 消息列表操作，包括点击列表项显示详情，已读，删除设置等触发后的操作
    myMessageClickRow: function(row, height, messType) {
      this.myMessageId = row.id
      // console.log('myMessageClickRow', this.myMessageId)
      this.mymessagedetail = row
      this.updateMessageStatus(messType, 'read', this.authDataListStatus, row.id)
    },
    setMyMessageReadAll: function(messType) {
      this.updateMessageStatus(messType, 'readall', this.authDataListStatus)
    },
    getErrorInfoTableData: function(errorinfo) {
      faultDataList({
        'error_info': errorinfo }).then(res => {
        const data = res.data.data
        // console.log('faultmanagement faultDataList data', data)
        this.errordetaildatalist = data
        this.faultMessageId = Number(errorinfo)
        console.log('faultmanagement faultMessageId', this.faultMessageId)
      }).catch(error => {
        console.log('getErrorInfoTableData ', error)
      })
    },
    faultMessageClickRow: function(row, height, messType) {
      this.getErrorInfoTableData(row.id)
      this.updateMessageStatus(messType, 'read', this.errorDataListStatus, row.id)
    },
    setFaultMessageReadAll: function(messType) {
      this.updateMessageStatus(messType, 'readall', this.errorDataListStatus)
    },
    setFaultMessageDeleteAll: function(messType) {
      this.updateMessageStatus(messType, 'deleteall', this.errorDataListStatus)
    },
    deleteFaultMessage: function(rowid, messType) {
      // console.log('deleteFaultMessage id', rowid)
      this.updateMessageStatus(messType, 'delete', this.errorDataListStatus, rowid)
      this.faultMessageId = 0
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.el-main {
  padding-top: 0px;
}
.el-dialog__body {
  height: 70vh;
  overflow: auto;
}
.el-submenu .el-menu-item {
  min-width: 0px;
}
.el-menu-item.is-active {
  border-right: 2px solid #409EFF;
}
</style>

