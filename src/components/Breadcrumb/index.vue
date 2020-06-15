<template>
  <el-breadcrumb class="app-breadcrumb" separator-class="el-icon-arrow-right">
    <transition-group name="breadcrumb">
      <el-breadcrumb-item v-for="(item,index) in levelList" v-if="item.meta.title" :key="item.path">
        <span v-if="item.redirect==='noredirect'||index==levelList.length-1" class="no_redirect">{{ generateTitle(item.meta.title) }}</span>
        <router-link v-else :to="item.redirect||item.path" class="btn redirect">{{ generateTitle(item.meta.title) }}</router-link>
      </el-breadcrumb-item>
    </transition-group>
  </el-breadcrumb>
</template>

<script>
import { generateTitle } from '@/utils/i18n'

export default {
  data() {
    return {
      levelList: null
    }
  },
  watch: {
    $route() {
      this.getBreadcrumb()
    }
  },
  created() {
    this.getBreadcrumb()
  },
  methods: {
    generateTitle,
    getBreadcrumb() {
      let matched = this.$route.matched.filter(item => item.name)
      const first = matched[0]
      if (first && first.name.trim().toLocaleLowerCase() !== 'Index'.toLocaleLowerCase()) {
        matched = [].concat(matched)
      }
      this.levelList = matched
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.app-breadcrumb.el-breadcrumb {
  min-width: 400px;
  display: inline-block;
  font-size: 14px;
  line-height: 50px;
  margin-left: 10px;
  // font-family: sy_bold;
  font-weight: bold;
  .no_redirect {
    color: #666;
  }
  .redirect {
    // 让之前的路径项变灰
    color: #999;
    cursor: text;
  }
  .btn {
    cursor: pointer;
  }
}
</style>
