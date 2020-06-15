<template>
  <div class="sidebar-left">
    <div class="dot_switch" @click="toggleSideBar">
      <svg-icon class="normal" icon-class="dot_default"/>
      <svg-icon class="hover_style" icon-class="dot_hover"/>
      <svg-icon class="active" icon-class="dot_active"/>
    </div>
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <component :is="platform" />
    </el-scrollbar>
    <div class="edition">
      V
      <span>1.10.0</span>
    </div>
  </div>
</template>
<script>
import devplatform from '../menu/devplatform'
import runplatform from '../menu/runplatform'
import backplatform from '../menu/backplatform'
import { mapGetters } from 'vuex'
export default {
  components: {
    devplatform,
    runplatform,
    backplatform
  },
  computed: {
    platform() {
      return this.$store.state.tagsView.platform
    },
    ...mapGetters([
      'sidebar'
    ])
  },
  methods: {
    // 打开侧边栏的切换
    toggleSideBar() {
      // document.getElementsByClassName('normal')[0].style.display = 'none'
      // document.getElementsByClassName('hover_style')[0].style.display = 'none'
      // document.getElementsByClassName('active')[0].style.display = 'block'
      this.$store.dispatch('toggleSideBar')
      // this.$nextTick(() => {
      //   document.getElementsByClassName('normal')[0].style.display = 'block'
      //   document.getElementsByClassName('hover_style')[0].style.display = 'none'
      //   document.getElementsByClassName('active')[0].style.display = 'none'
      // })
    }
    // handleOver(evt) {
    //   if (evt.target.className === 'el-tooltip') {
    //     this.isCollapse = false
    //   }
    // },
    // handleLeave(evt) {
    //   // this.isCollapse = true
    //   // 目前的兼容方法
    //   const userAgent = navigator.userAgent // 取得浏览器的userAgent字符串
    //   const isIE = userAgent.indexOf('compatible') > -1 && userAgent.indexOf('MSIE') > -1 // 判断是否IE<11浏览器
    //   if (isIE) {
    //     if (evt.pageY <= 50 || evt.pageY >= 663 || evt.pageX >= 213) {
    //       this.isCollapse = true
    //     }
    //   } else {
    //     this.isCollapse = true
    //   }
    // }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
@import "src/assets/styles/variables.scss";
.showStyle {
  display: block;
}
.hideStyle {
  display: none;
}
.openSidebar {
  .dot_switch {
    left: 46%;
    transform: translateX(-50%)
  }
}
.sidebar-left {
  padding-top: 70px;
  position: relative;
  border-right: 1px solid #ddd;
  .dot_switch {
    position: absolute;
    right: 10px;
    z-index: 10;
    border-radius: 50%;
    .normal, .active, .hover_style {
      width: 18px;
      height: 18px;
    }
    cursor: pointer;
    .hover_style, .active {
      display: none;
    }
    &:hover {
      background-color: #f2f2f2;
      .hover_style {
        display: block;
      }
      .normal, .active {
        display: none;
      }
    }
  }
}
.sidebar-left-menu {
  // border-right: 1px solid $m_bd_c;
  min-height: calc(100vh - 80px);
  .el-menu-item{
    span{
      margin-left:28px;
    }
  }
  .el-submenu{
    &>.el-submenu__title {
      &>span {
        margin-left:28px;
        display: none;
      }
      &>i::before {
        .el-submenu__icon-arrow {
          display: none;
        }
      }
    }
  }
}
.sidebar-left-menu:not(.el-menu--collapse) {
  width: 213px;
  .el-submenu{
    span{
      display: inline-block;
    }
  }
}

.monitor {
  color: #909399;
  text-align: center;
  display: inline-block;
  width: 100%;
  font-size: 12px;
}
.leftD {
  margin-left: 20px;
}
// 版本
.edition {
  position: absolute;
  left:50%;
  bottom: 85px;
  transform: translateX(-50%);
  min-width: 33px;
  font-size: 12px;
  color: #999;
  font-style: italic;
}
.openSidebar {
  .switch {
    position: absolute;
    left:44%;
    bottom: 70%;
    transform: translateX(-50%);
    cursor: pointer;
    .normal {
      display: inline-block;
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
      }
    }
  }
}
.hideSidebar {
  .switch {
    position: absolute;
    right: 10%;
    bottom: 70%;
    cursor: pointer;
    .normal {
      display: inline-block;
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
      }
    }
  }
}
</style>

