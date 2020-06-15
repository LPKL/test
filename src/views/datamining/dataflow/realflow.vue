// 实时源
<template>
  <div class="tab_container">
    <el-tabs v-model="tabStatus">
      <el-tab-pane :label="$t('labels.flow.realtime_flow')" name="realFlow">
        <RealTimeFlow/>
      </el-tab-pane>
      <el-tab-pane :label="$t('labels.flow.period_flow')" name="periodFlow">
        <PeriodFlow/>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import RealTimeFlow from './realtime/RealTimeFlow'
import PeriodFlow from './period/periodflow'
export default {
  name: 'RealFlow',
  components: {
    RealTimeFlow,
    PeriodFlow
  },
  data() {
    return {
      tabStatus: 'realFlow'
    }
  }
}

</script>
<style rel="stylesheet/scss" lang="scss" scoped>
@import "src/assets/styles/new-base.scss";
</style>
