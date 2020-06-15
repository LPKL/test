<template>
  <div class="navbar">
    <div class="logo">
      <router-link to="/manageCenter" ><img src="@/assets/images/index/logo.png" alt=""></router-link>
    </div>
    <div class="zrtitle">
      <span class="title pos font-regular">{{ $t('homepage.mindex.nav_title') }}</span>
      <span class="br"/>
    </div>
    <div class="nb">
      <breadcrumb class="breadcrumb-container"/>
      <div class="platform">
        <div v-if="window.serverConfig.showPlatform&&(platform==='devplatform'||platform==='runplatform')" class="change">
          <div :class="{ 'active': platform === 'runplatform' }" class="run_platform" @click="toggleChange('/realtmonitor')"><span class="platform_title pos font-regular">运行平台</span></div>
          <div :class="{ 'active': platform === 'devplatform' }" class="dev_platform" @click="toggleChange('/newmodel/index')"><span class="platform_title pos font-regular">开发平台</span></div>
        </div>
        <div v-if="platform==='backplatform'||platform==='user_center'" class="backTo">
          <div class="back pos font-regular" @click="toggleChange('/newmodel/index')">{{ $t('route.backToFront') }}</div>
        </div>
      </div>
      <div class="useri">
        <div v-if = "islogin">
          <!-- @click="goMessageDetailPage('0')" -->
          <div class="useri-item notifyc" @click="handleMessage">
            <template>
              <div v-if="unreadCount && unreadCount !== 0" class="ring_box">
                <span :class="{ 'warning_num': unreadCount <=99, 'warning_num1': unreadCount > 99 }">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
                <i class="el-icon-bell" style="font-size: 18px"/>
              </div>
              <div v-else class="ring_box">
                <i class="el-icon-bell" style="font-size: 18px"/>
              </div>
              <!-- :title="$t('labels.messagemanage.message')" -->
              <el-dialog
                :m-type="mtype"
                :visible.sync="$store.state.tagsView.show"
                :append-to-body="true"
                :modal-append-to-body="false"
                :close-on-click-modal="false"
                width="65%"
                class="el-ringdialog"
                @open="handleOpen"
                @close="handleClose"><Message ref="message"/></el-dialog>
            </template>
          </div>
          <div class="useri-item name_box" >
            <span class = "dropdown-link font-regular">{{ islogin }}<i class = "el-icon-arrow-down el-icon--right arrow"/></span>
            <div class="menu_box font-regular">
              <div class="per_center"><span style="display:block;" @click="toggleChange('/user/index')">{{ $t('route.user') }}</span></div>
              <div><span style="display:block;" @click="toggleChange('/system/user_manage')">{{ $t('route.backmanage') }}</span></div>
              <div class="logout"><span style="display:block;" @click="logout">{{ $t('strings.login.logOut') }}</span></div>
            </div>
          </div>
        </div>
        <router-link v-else to = "/login" >{{ $t('strings.login.logIn') }}</router-link>
      </div>
    </div>
  </div>
</template>
<script>
require('@/components/ModelFlow/resoult/js/jquery/1.11.3/jquery.min.js')
import Breadcrumb from '@/components/Breadcrumb'
import store from '@/store'
import Message from '@/views/message/messageCenter'
export default {
  components: {
    Breadcrumb,
    Message
  },
  data() {
    return {
      window: window,
      isCollapse: true,
      wsuri: null,
      ws: null,
      dialogVisible: false,
      mtype: '0'
    }
  },
  computed: {
    islogin() {
      return store.getters.name
    },
    unreadCount() {
      return Number(this.$store.getters.error_num)
    },
    platform() {
      return this.$store.state.tagsView.platform
    }
  },
  created() {
    console.log('加入故障socket')
    // 订阅故障消息通知 小铃铛数字改变
    const str = '/users/' + this.$store.getters.id + '/notifications'
    this.$socket.emit('join', str)
  },
  beforeDestroy() {
    console.log('退出故障socket')
    const str = '/users/' + this.$store.getters.id + '/notifications'
    this.$socket.emit('leave', str)
  },
  methods: {
    // 平台切换的操作
    toggleChange(val) {
      this.$router.push(val)
    },
    // 点开消息
    handleMessage() {
      this.$store.dispatch('handleMessageShow', true)
    },
    handleOpen() {
      this.$nextTick(() => {
        this.$refs['message'].getMessageData()
      })
    },
    handleClose() {
      this.$refs['message'].$refs.multipleTable.clearSelection()
      this.$refs['message']._data.markData.notification_ids = []
      this.$store.dispatch('handleMessageShow', false)
    },
    logout() {
      this.$store.dispatch('FedLogOut').then(() => {
        this.$store.dispatch('SetName', '')
        this.$store.dispatch('SetStatus', '')
        this.$store.dispatch('changeAction', 'devplatform')
        localStorage.clear()
        sessionStorage.clear()
        sessionStorage.setItem('islogout', '1')
        this.$router.push({ path: '/' })
        location.reload()// In order to re-instantiate the vue-router object to avoid bugs
      })
    }
  },
  sockets: {
    // 查看socket是否渲染成功
    connect() {
      console.log('故障消息链接')
    },
    disconnect() {
      const interval = setInterval(() => {
        console.log('socket已经断开链接?', !this.$socket.connected)
        if (!this.$socket.connected) {
          this.$socket.connect()
        } else {
          clearInterval(interval)
        }
      }, 1000)
      this.$socket.emit('join', '/users/' + this.$store.getters.id + '/notifications')
    },
    reconnect() {
      console.log('socket重新链接')
    },
    message(data) {
      if (data.title) {
        this.$notify({
          title: data.title,
          message: (data.body ? data.body : '请去故障页面查看详细信息')
        })
        const num = Number(this.$store.getters.error_num) + 1
        this.$store.dispatch('setMessageNum', num)
        console.log('故障消息数据', data)// 接收的消息
      }
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
@import "src/assets/styles/variables.scss";
@import "src/assets/styles/mixin.scss";
// 粗
.font-regular {
  // font-family: sy_regular;
}
.el-ringdialog {
  /deep/ .el-dialog {
    min-width: 1060px;
    margin-top: 50px!important;
    padding: 32px;
    border-radius: 16px;
    background-color: #f4f4f4;
    .el-dialog__header {
      // display: none;
      padding: 0;
    }
    .el-dialog__body {
      padding: 0;
      height: 785px;
    }
  }
}
.selected {
  color: #1e1e1e;
}
.pos {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  cursor: pointer;
}
.active {
  color: #1e1e1e!important;
}
.line {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
}
.navbar {
  height: 55px;
  min-width:860px;
  box-shadow: #ccc 0 1px 2px 0;
  @include clearfix;
    position: fixed;
    top: 0;
    width: 100%;
    background-color: #fff;
    z-index: 10;
  .logo,
  .nb,
  .zrtitle {
    height: 100%;
    display: inline-block;
    float: left;
    // border-right: 1px solid $m_bd_c;
    // border-bottom: 1px solid $m_bd_c;
  }
  .zrtitle {
    position: relative;
    .title {
      margin-top: 0;
      font-size: 20px;
      color: #1e1e1e;
    }
    .br {
      display: inline-block;
      height: 28px;
      width: 1px;
      background-color: #999;
      position: absolute;
      right: 0;
    }
  }
  .logo {
    width: 47px;
    position: relative;
    @include clearfix;
    border-right: none;
    margin-left: 17px;
    img {
      width: 100%;
      height: 22px;
      position: absolute;
      top: 0;
      bottom: 0;
      margin: auto;
    }
  }
  .nb {
    position: absolute;
    top: 0;
    right: 0;
    display: inline-block;
    width: calc(100% - 230px);
    // min-width: 800px;
    // border-bottom: 1px solid $m_bd_c;
    border-right: none;
    .breadcrumb-container {
      position: absolute;
      left: 0;
      top: 50%;
      transform: translate(0, -50%)
    }
    .useri{
      position: absolute;
      right: 40px;
      top:16px;
      &-item{
        display: inline-block;
        cursor: pointer;
      }
      .notifyc {
        position: relative;
        top: 3px;
        .ring_box {
          font-size: 18px;
          img {
            width: 14px;
            height: 14px;
            position: absolute;
            top: -3px;
            left: 11px;
          }
          .warning_num {
            display: inline-block;
            background-color: #c60928;
            border-radius: 50%;
            width: 15px;
            height: 15px;
            line-height: 15px;
            font-weight: bold;
            text-align: center;
            font-size: 9px;
            right: -6px;
            top: -6px;
            color: #fff;
            position: absolute;
            z-index: 100;
          }
          .warning_num1 {
            display: inline-block;
            color: #c60928;
            width: 15px;
            height: 15px;
            line-height: 15px;
            font-weight: 700;
            text-align: center;
            font-size: 12px;
            right: -6px;
            top: -6px;
            position: absolute;
            z-index: 100;
          }
        }
      }
      .name_box {
        min-width: 120px;
        text-align: center;
        height: 49px;
        &:hover {
          .menu_box {
            display: block;
          }
        }
        .dropdown-link {
          font-size: 14px;
          color: #1e1e1e;
          .arrow {
            margin-left: 8px;
          }
        }
        .menu_box {
          display: none;
          position: absolute;
          top: 42px;
          right: 0;
          // min-width: 100px;
          box-shadow:2PX 2PX 4PX #ccc;
          div {
            min-width: 100px;
            height: 44px;
            line-height: 44px;
            font-size: 14px;
            color: #3f3f3f;
            background-color: #fff;
            text-align: center;
            box-sizing: border-box;
            padding-top:3PX;
            &:hover{
              background: #f2f2f2;
              border-top: 3PX solid transparent;
              padding-top: 0;
            }
          }
          .per_center {
            border-bottom: 0.5px solid #f2f2f2;
          }
          .logout {
            border-top: 0.5px solid #f2f2f2;
          }
        }
      }
    }
    .platform {
      width: 185px;
      height: 100%;
      // min-width: 216px;
      position: absolute;
      top: 0;
      right: 300PX;
      text-align: center;
      .change {
        height: 100%;
        position: relative;
        .run_platform {
          border-top: 4px solid #fff;
          &:hover {
            border-top: 4px solid #c60928;
          }
          position: absolute;
          top: 0;
          left: 0;
          width: 50%;
          height: 100%;
          color: #999;
          cursor: pointer;
          position: relative;
          &:hover {
            background-color: #f2f2f2!important;
            color: #1e1e1e;
            // font-weight: 600;
          }
        }
        .dev_platform {
          border-top: 4px solid #fff;
          &:hover {
            border-top: 4px solid #c60928;
          }
          position: absolute;
          top: 0;
          right: 0;
          width: 50%;
          height: 100%;
          color: #999;
          cursor: pointer;
          &:hover {
            background-color: #f2f2f2!important;
            color: #1e1e1e;
            // font-weight: 600;
          }
        }
        .platform_title {
          font-size: 16px;
          width: 100%;
          display: block;
          word-break:keep-all;
          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
        }
      }
      .backTo {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        text-align: center;
        color: #409EFF;
        .back {
          font-size: 14px;
          width: 100%;
          word-break:keep-all;
          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
        }
      }
    }
  }
  .zrtitle {
    width: 150px;
    text-align: center;
    span {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      display: inline-block;
      font-size: 14px;
      margin-top: 16px;
      color: #666;
      font-weight: 600;
    }
  }
}
</style>
