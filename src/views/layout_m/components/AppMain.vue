<template>
  <section class="app-main">
    <transition name="fade-transform" mode="out-in">
      <keep-alive :include="cachedViews">
        <router-view :key="key"/>
      </keep-alive>
    </transition>
  </section>
</template>

<script>
export default {
  name: 'AppMain',
  computed: {
    cachedViews() {
      return this.$store.state.tagsView.cachedViews
    },
    key() {
      return this.$route.fullPath
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
 @import "src/assets/styles/variables.scss";
.app-main {
  overflow: hidden;
  padding-top: 55px;
  flex: 1;
  background-color: #f4f4f4;
  display: flex;
  flex-direction: column;
  >div{
    flex:1;
  }
}
</style>

