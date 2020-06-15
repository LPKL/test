<template>
  <div class="sidebarLeftt">
    <el-menu
      :default-active="this.$route.matched[1].path"
      :collapse="sidebar.opened"
      :default-openeds="['/manageCenter/dflowmanage', '/realtime/realtimeorigin']"
      menu-trigger="click"
      class="el-sidebar-left-menu"
      background-color="#fff"
      text-color="#999"
      active-text-color="#0f32b5"
      router>
      <!-- 工作台 -->
      <!-- <el-menu-item index="/404" class="menu-item">
        <svg-icon class="normal" icon-class="workbench"/>
        <svg-icon class="active" icon-class="workbench1"/>
        <span>{{ $t('route.workbench') }}</span>
      </el-menu-item> -->
      <!-- 数据实验 需求放到第一个 -->
      <el-menu-item index="/newmodel/index">
        <svg-icon class="el-normal" icon-class="dataFlow"/>
        <svg-icon class="el-active" icon-class="dataFlow1"/>
        <span>{{ $t('route.newmodel') }}</span>
      </el-menu-item>
      <!-- 数据源配置 -->
      <el-menu-item index="/dfilemanage/index">
        <svg-icon class="el-normal" icon-class="dataConfig"/>
        <svg-icon class="el-active" icon-class="dataConfig1"/>
        <span>{{ $t('route.sourceconfig') }}</span>
      </el-menu-item>
      <!-- 实时源 -->
      <el-menu-item index="/realTimeOrigin/index">
        <svg-icon class="el-normal" icon-class="flowManage"/>
        <svg-icon class="el-active" icon-class="flowManage1"/>
        <span>{{ $t('route.dataAbout') }}</span>
      </el-menu-item>
      <!-- 实时流程 -->
      <el-menu-item index="/realTimeFlow/index">
        <svg-icon class="el-normal" icon-class="modelManage"/>
        <svg-icon class="el-active" icon-class="modelManage1"/>
        <span>{{ $t('route.flowAbout') }}</span>
      </el-menu-item>
      <!-- 模型服务 -->
      <el-menu-item index="/service/model">
        <svg-icon class="el-normal" icon-class="service_d"/>
        <svg-icon class="el-active" icon-class="service_c"/>
        <span>{{ $t('route.serviceAbout') }}</span>
      </el-menu-item>
      <!-- 管理中心 -->
      <el-submenu ref="manageCenter" index="/manageCenter/dflowmanage">
        <template slot="title">
          <svg-icon class="el-normal" icon-class="manageCenter"/>
          <svg-icon class="el-active" icon-class="manageCenter1"/>
          <span>{{ $t('route.manageCenter') }}</span>
        </template>
        <!-- 流程管理 -->
        <el-menu-item index="/manageCenter/dflowmanage">
          <svg-icon class="el-normal" icon-class="flowManage"/>
          <svg-icon class="el-active" icon-class="flowManage1"/>
          <span>{{ $t('route.dflowmanage') }}</span>
        </el-menu-item>
        <!-- 模型管理 -->
        <el-menu-item index="/manageCenter/trainedindex/1">
          <svg-icon class="el-normal" icon-class="modelManage"/>
          <svg-icon class="el-active" icon-class="modelManage1"/>
          <span>{{ $t('route.modelManagement') }}</span>
        </el-menu-item>
        <!-- pipline管理 -->
        <el-menu-item index="/manageCenter/piplineindex/1">
          <svg-icon class="el-normal" icon-class="modelManage"/>
          <svg-icon class="el-active" icon-class="modelManage1"/>
          <span>{{ $t('route.piplineModel') }}</span>
        </el-menu-item>
        <!-- 算法管理 -->
        <el-menu-item index="/algmanagement/index">
          <svg-icon class="el-normal" icon-class="algorithmManage"/>
          <svg-icon class="el-active" icon-class="algorithmManage1"/>
          <span>{{ $t('route.Algmanagement') }}</span>
        </el-menu-item>
        <!-- 元数据管理 -->
        <el-menu-item index="/manageCenter/metadatamanage/index">
          <svg-icon class="el-normal" icon-class="taskMonitor"/>
          <svg-icon class="el-active" icon-class="taskMonitor1"/>
          <span>{{ $t('route.metadataManage') }}</span>
        </el-menu-item>
        <!-- 表结构管理 -->
        <el-menu-item index="/manageCenter/structure">
          <svg-icon class="el-normal" icon-class="taskMonitor"/>
          <svg-icon class="el-active" icon-class="taskMonitor1"/>
          <span>{{ $t('route.structure') }}</span>
        </el-menu-item>
      </el-submenu>
      <!-- 任务监测 -->
      <el-menu-item index="/taskmonitoring/list">
        <svg-icon class="el-normal" icon-class="taskMonitor"/>
        <svg-icon class="el-active" icon-class="taskMonitor1"/>
        <span>{{ $t('route.taskmonitoring') }}</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'Develop',
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
      span {
        // font-family: sy_regular;
      }
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
