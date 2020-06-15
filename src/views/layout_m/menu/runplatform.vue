<template>
  <div class="sidebarLeft runBar">
    <el-menu
      :default-active="this.$route.matched[0].path"
      :collapse="sidebar.opened"
      :default-openeds="['/alarmConfig']"
      class="el-sidebar-left-menu"
      background-color="#fff"
      text-color="#999"
      active-text-color="#0f32b5"
      router>
      <!-- 监测概览 -->
      <!-- <el-menu-item index="/404">
        <svg-icon class="el-normal" icon-class="survey_monitor"/>
        <svg-icon class="el-active" icon-class="survey_monitor1"/>
        <span>{{ $t('route.overview') }}</span>
      </el-menu-item> -->
      <!-- 实时监测 -->
      <el-menu-item index="/realtmonitor" >
        <svg-icon class="el-normal" icon-class="realtime_monitor"/>
        <svg-icon class="el-active" icon-class="realtime_monitor1"/>
        <span>{{ $t('route.monitor') }}</span>
      </el-menu-item>
      <!-- 设备概览 -->
      <!--      <el-menu-item index="/404">-->
      <!--        <svg-icon class="el-normal" icon-class="device_overview"/>-->
      <!--        <svg-icon class="el-active" icon-class="device_overview1"/>-->
      <!--        <span>{{ $t('route.devicemonitor') }}</span>-->
      <!--      </el-menu-item>-->
      <!-- 故障中心 -->
      <el-menu-item index="/faultmanagement">
        <svg-icon class="el-normal" icon-class="fault_center"/>
        <svg-icon class="el-active" icon-class="fault_center1"/>
        <span>{{ $t('route.faultManagement') }}</span>
      </el-menu-item>
      <!-- 告警设置 -->
      <el-submenu index="/alarmConfig">
        <template slot="title">
          <svg-icon class="el-normal" icon-class="warning_setting"/>
          <svg-icon class="el-active" icon-class="warning_setting1"/>
          <span>{{ $t('route.alarmConfig') }}</span>
        </template>
        <!-- 告警规则设置 -->
        <el-menu-item index="/alarmConfig/alarmRules">
          <svg-icon class="el-normal" icon-class="warning_rule_setting"/>
          <svg-icon class="el-active" icon-class="warning_rule_setting1"/>
          <span>{{ $t('route.alarmRule') }}</span>
        </el-menu-item>
        <!-- 告警代码设置 -->
        <el-menu-item index="/alarmConfig/faultCodes">
          <template>
            <svg-icon class="el-normal" icon-class="warning_code_setting"/>
            <svg-icon class="el-active" icon-class="warning_code_setting1"/>
            <span>{{ $t('route.alarmCode') }}</span>
          </template>
        </el-menu-item>
      </el-submenu>
      <!-- 模板配置 -->
      <el-menu-item index="/template">
        <svg-icon class="el-normal" icon-class="template"/>
        <svg-icon class="el-active" icon-class="template1"/>
        <span>{{ $t('route.template') }}</span>
      </el-menu-item>
      <!-- 运行报告 -->
      <el-menu-item index="/runreport">
        <svg-icon class="el-normal" icon-class="run_report"/>
        <svg-icon class="el-active" icon-class="run_report1"/>
        <span>{{ $t('route.runReport') }}</span>
      </el-menu-item>
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
