<template>
  <div :class="classObj" class="app-wrapper" >
    <div v-if="device==='mobile'&&sidebar.opened" class="drawer-bg" @click="handleClickOutside"/>
    <div class="main-container-m">
      <navbar/>
      <SidebarLeftUser/>
      <app-main/>
    </div>
  </div>

</template>

<script>
import { AppMain, Navbar, SidebarLeftUser } from '@/views/layout_m/components'

export default {
  name: 'LayoutUser',
  components: {
    AppMain,
    Navbar,
    SidebarLeftUser
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
  created() {
    // this.$store.dispatch('changeAction', '')
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
.main-container-m {
  @include clearfix;
  width: 100%;
  display: flex;
}
</style>
