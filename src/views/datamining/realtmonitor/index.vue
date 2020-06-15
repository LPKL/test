<template>
  <div class="tab_container">
    <el-tabs v-model="activeTab" @tab-click="handleTabClick">
      <el-tab-pane :label="$t('labels.monitorAbout.realtime_monitor')" name="realmoniter">
        <real-monitor />
      </el-tab-pane>
      <el-tab-pane :label="$t('labels.monitorAbout.period_monitor')" name="cyclemonitor">
        <cycle-monitor />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import RealMonitor from './realmonitor'
import CycleMonitor from './cyclemonitor'

export default{
  components: { RealMonitor, CycleMonitor },
  data: function() {
    return {
      activeTab: 'realmoniter'
    }
  },
  created() {
    const routeActiveTab = this.$route.params.activeTab
    if (routeActiveTab !== undefined) {
      this.activeTab = routeActiveTab || 'realmonitor'
    }
  },
  methods: {
    handleTabClick() {
      console.log('tab clicked')
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>

  /deep/ .el-tabs--border-card>.el-tabs__content{
    padding: 0;
  }
  /deep/ .el-tabs--border-card>.el-tabs__header{
    background: #f4f4f4;
    border-bottom: none;
  }
</style>
