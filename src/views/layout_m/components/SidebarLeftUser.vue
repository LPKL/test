<template>
  <div class="sidebar-left">
    <el-menu
      :default-active="$route.path"
      :collapse="isCollapse"
      class="sidebar-left-menu"
      background-color="#fff"
      text-color="#999"
      active-text-color="#0f32b5"
      router>
      <el-menu-item-group>
        <el-menu-item index="/user/index">
          <template slot="title">
            <span class="usermessage">{{ $t('route.current_set') }}</span>
          </template>
        </el-menu-item>
        <el-menu-item index="/user/changePsd">
          <template slot="title">
            <span class="systemconfig">{{ $t('route.change_password') }}</span>
          </template>
        </el-menu-item>
      </el-menu-item-group>
    </el-menu>
  </div>
</template>
<script>
export default {
  data() {
    return {
      isCollapse: false,
      screenWidth: document.body.clientWidth // 屏幕宽度
    }
  },
  watch: {
    screenWidth(val) {
      this.screenWidth = val
      if (this.screenWidth < 768) { // 界面宽度缩放到xs状态时，收起sidebar
        this.isCollapse = true
      } else {
        this.isCollapse = false
      }
    }
  },
  mounted() {
    // 监听窗口大小
    window.onresize = () => {
      return (() => {
        this.screenWidth = document.body.clientWidth
      })()
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
@import "src/assets/styles/variables.scss";
// // 粗
// .font-center {
//   font-family: "webfontcenter" !important;
//   // font-size: 16px;
//   font-style: normal;
//   -webkit-font-smoothing: antialiased;
//   -moz-osx-font-smoothing: grayscale;
// }
.sidebar-left {
  padding-top: 80px;
  position: relative;
  border-right: 1px solid #ddd;
}
.sidebar-left-menu {
  // border-right: 1px solid $m_bd_c;
  // font-family: sy_regular;
  min-height: calc(100vh - 80px);
  .el-menu-item{
    span{
      margin-left:28px;
    }
  }
}
.el-menu {
  border-right: none;
}
.sidebar-left-menu:not(.el-menu--collapse) {
  width: 160px;
  // padding-left: 50px;
}
.config{
  display: inline-block;
  margin: 5px 3px 0 3px;
}
.systemconfig{
  font-size: 12px;
}
.usermessage{
  font-size: 12px;
}
</style>

