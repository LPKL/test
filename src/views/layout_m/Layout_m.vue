<template>
  <div :class="classObj" class="app-wrapper" >
    <div v-if="device==='mobile'&&sidebar.opened" class="drawer-bg" @click="handleClickOutside"/>
    <div class="main-container-m" >
      <navbar/>
      <sidebar-left class="font-regular"/>
      <app-main/>
    </div>
  </div>

</template>

<script>
import { AppMain, SidebarLeft, Navbar } from './components'

export default {
  name: 'LayoutM',
  components: {
    AppMain,
    SidebarLeft,
    Navbar
  },
  computed: {
    sidebar() {
      return this.$store.state.app.sidebar
    },
    device() {
      return this.$store.state.app.device
    },
    classObj() {
      return {
        hideSidebar: !this.sidebar.opened,
        openSidebar: this.sidebar.opened,
        withoutAnimation: this.sidebar.withoutAnimation,
        mobile: this.device === 'mobile'
      }
    }
  },

  methods: {
    handleClickOutside() {
      this.$store.dispatch('closeSideBar', { withoutAnimation: false })
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
@import "src/assets/styles/variables.scss";
@import "src/assets/styles/mixin.scss";
// 细
.font-normal {
  font-family: "webfontnormal" !important;
  // font-size: 16px;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
// 粗
.font-regular {
  font-family: "webfontregular" !important;
  // font-size: 16px;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.main-container-m {
  @include clearfix;
  width: 100%;
  min-width: 800px;
  position: relative;
  display: flex;
}
</style>
