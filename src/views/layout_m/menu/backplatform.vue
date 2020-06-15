<template>
  <div class="sidebarLeft">
    <el-menu
      :default-active="this.$route.matched[1].path"
      :collapse="sidebar.opened"
      class="el-sidebar-left-menu"
      background-color="#fff"
      text-color="#999"
      active-text-color="#0f32b5"
      router>
      <!-- 标签配置 -->
      <!-- <el-menu-item index="/404" >
        <svg-icon class="normal" icon-class="tag_config"/>
        <svg-icon class="active" icon-class="tag_config1"/>
        <span>{{ $t('route.tagManage') }}</span>
      </el-menu-item> -->
      <!-- 权限配置 -->
      <!-- <el-menu-item index="/404">
        <svg-icon class="normal" icon-class="perm_config"/>
        <svg-icon class="active" icon-class="perm_config1"/>
        <span>{{ $t('route.permConfig') }}</span>
      </el-menu-item> -->
      <el-menu-item index="/system/user_manage">
        <svg-icon class="el-normal" icon-class="user_manage"/>
        <svg-icon class="el-active" icon-class="user_manage1"/>
        <span>{{ $t('route.userManage') }}</span>
      </el-menu-item>
      <!-- 用户管理 -->
      <!-- <el-submenu index="/system" class="submenu">
        <template slot="title">
          <svg-icon class="el-normal" icon-class="user_manage"/>
          <svg-icon class="el-active" icon-class="user_manage1"/>
          <span>{{ $t('route.userManage') }}</span>
        </template>
        用户管理
        <el-menu-item index="/system/user_manage">
          <svg-icon class="el-normal" icon-class="user_manage"/>
          <svg-icon class="el-active" icon-class="user_manage1"/>
          <span>{{ $t('route.userManage') }}</span>
        </el-menu-item>
        群组管理
        <el-menu-item index="/system/role_manage">
          <template slot="title">
            <svg-icon class="el-normal" icon-class="message_center"/>
            <svg-icon class="el-active" icon-class="message_center1"/>
            <span>{{ $t('route.roleManage') }}</span>
          </template>
        </el-menu-item>
        全限管理
        <el-menu-item index="/system/perm_manage">
          <template slot="title">
            <svg-icon class="el-normal" icon-class="perm_config"/>
            <svg-icon class="el-active" icon-class="perm_config1"/>
            <span>{{ $t('route.permManage') }}</span>
          </template>
        </el-menu-item>
      </el-submenu> -->
      <!-- 消息中心 -->
      <!-- <el-menu-item @click="messageCenter">
        <svg-icon class="el-normal" icon-class="message_center"/>
        <svg-icon class="el-active" icon-class="message_center1"/>
        <span>{{ $t('route.messageCenter') }}</span>
      </el-menu-item> -->
      <!-- 帮助中心 -->
      <!-- <el-menu-item index="/404">
        <svg-icon class="normal" icon-class="help_center"/>
        <svg-icon class="active" icon-class="help_center1"/>
        <span>{{ $t('route.helpCenter') }}</span>
      </el-menu-item> -->
    </el-menu>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'Run',
  computed: {
    ...mapGetters([
      'sidebar',
      'name',
      'avatar',
      'device'
    ])
  },
  methods: {
    messageCenter() {
      this.$store.dispatch('handleMessageShow', true)
    }
  }
}

</script>
<style rel="stylesheet/scss" lang="scss" scoped>
@import "src/assets/styles/variables.scss";
.openSidebar {
  .el-sidebar-left-menu {
    position: relative;
    // border-right: 1px solid $m_bd_c;
    min-height: calc(100vh - 80px);
    border-right: none!important;
    padding-top: 30px;
    .el-menu-item{
      height: 40px;
      line-height: 40px;
      li {
        line-height: 40px;
      }
      &:hover {
        border-right: 4px solid #0f32b5;
        span {
          color: #0f32b5;
        }
        .el-normal {
          display: none;
        }
        .el-active {
          display: inline-block;
          width: 20px;
          height: 20px;
        }
      }
      .el-normal {
        display: inline-block;
        width: 20px;
        height: 20px;
        vertical-align: sub;
      }
      .el-active {
        display: none;
        vertical-align: sub;
      }
      span{
        margin-left:20px;
        font-size: 12px;
        // color: #999;
        vertical-align: top;
      }
    }
    .is-active {
      border-right: 4px solid #0f32b5!important;
      .el-normal {
        display: none;
      }
      .el-active {
        display: inline-block;
        width: 20px;
        height: 20px;
      }
    }
    .el-submenu{
      &:hover {
        border-right: 4px solid #0f32b5;
      }
      .el-normal {
        display: inline-block;
        width: 20px;
        height: 20px;
        vertical-align: sub;
      }
      .el-active {
        display: none;
        vertical-align: sub;
      }
      span{
        vertical-align: top;
      }
      .is-active {
        border-right: 4px solid #0f32b5;
        .el-normal {
          display: none;
        }
        .el-active {
          display: inline-block;
          width: 20px;
          height: 20px;
        }
      }
      &>.el-menu {
        background-color: #f2f2f2!important;
        li:nth-of-type(1) {
          border-bottom: 1px solid #fff;
        }
        li:nth-of-type(2) {
          border-bottom: 1px solid #fff;
        }
        li {
          padding-left: 32px!important;
          background-color: #f2f2f2!important;
        }
      }
      /deep/ .el-submenu__title {
        height: 40px;
        line-height: 40px;
      }
      &>.el-submenu__title {
        &:hover {
          span {
            color: #0f32b5;
          }
          .el-normal {
            display: none;
          }
          .el-active {
            display: inline-block;
            width: 20px;
            height: 20px;
          }
      }
        &>span {
          margin-left:20px;
          display: none;
          font-size: 12px!important;
          color: #999;
        }
        &>i::before {
          .el-submenu__icon-arrow {
            display: none;
          }
        }
      }
    }
  }
  .el-sidebar-left-menu:not(.el-menu--collapse) {
    width: 160px;
    .el-submenu{
      span{
        display: inline-block;
      }
    }
  }
  .switch {
    position: absolute;
    left:44%;
    transform: translateX(-50%);
    margin-top: 50px;
    cursor: pointer;
    .normal {
      display: inline-block;
      width: 12px!important;
      height: 12px!important;
    }
    .active {
      display: none;
    }
    &:hover {
      .normal {
        display: none;
      }
      .active {
        display: inline-block;
        width: 16px;
        height: 16px;
      }
    }
  }
}
.hideSidebar {
  .el-sidebar-left-menu {
    position: relative;
    min-height: calc(100vh - 80px);
    padding-top: 30px;
    // font-family: sy_regular;
    .el-menu-item{
      height: 40px;
      line-height: 40px;
      &:hover {
        span {
          color: #0f32b5;
        }
        .el-normal {
          display: none;
        }
        .el-active {
          display: inline-block;
          width: 20px;
          height: 20px;
        }
      }
      .el-normal {
        display: inline-block;
        width: 20px;
        height: 20px;
        vertical-align: sub;
      }
      .el-active {
        display: none;
        vertical-align: sub;
      }
      span{
        margin-left:20px;
        font-size: 12px;
        // color: #999;
        vertical-align: top;
      }
    }
    .is-active {
      .el-normal {
        display: none;
      }
      .el-active {
        display: inline-block;
        width: 20px;
        height: 20px;
      }
    }
    .el-submenu{
      .el-active {
        display: none;
        vertical-align: sub;
      }
      .el-normal {
        display: inline-block;
        width: 20px;
        height: 20px;
        vertical-align: sub;
      }
      span{
        vertical-align: top;
      }
      .is-active {
        .el-normal {
          display: none;
        }
        .el-active {
          display: inline-block;
          width: 20px;
          height: 20px;
        }
      }
      &>.el-menu {
        background-color: #f2f2f2!important;
        li:nth-of-type(1) {
          border-bottom: 1px solid #fff;
        }
        li:nth-of-type(2) {
          border-bottom: 1px solid #fff;
        }
        li {
          padding-left: 32px!important;
          background-color: #f2f2f2!important;
        }
      }
      /deep/ .el-submenu__title {
        height: 40px;
        line-height: 40px;
      }
      &>.el-submenu__title {
        &:hover {
          span {
            color: #0f32b5;
          }
          .el-normal {
            display: none;
          }
          .el-active {
            display: inline-block;
            width: 20px;
            height: 20px;
          }
      }
        &>span {
          margin-left:20px;
          // display: none;
          font-size: 12px!important;
          color: #999;
        }
        &>i::before {
          .el-submenu__icon-arrow {
            display: none;
          }
        }
      }
    }
  }
  .el-menu {
    border-right: none;
  }
  .el-sidebar-left-menu:not(.el-menu--collapse) {
    width: 160px;
    .el-submenu{
      span{
        display: inline-block;
      }
    }
  }
}
</style>

