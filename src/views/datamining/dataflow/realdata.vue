// 实时源
<template>
  <div class="tab_container">
    <el-tabs v-model="tabStatus">
      <el-tab-pane :label="$t('labels.period.realtime_data')" name="realOrigin">
        <RealTimeOrigin/>
      </el-tab-pane>
      <el-tab-pane :label="$t('labels.period.period_data')" name="periodData">
        <PeriodData/>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import RealTimeOrigin from './realtime/RealTimeOrigin'
import PeriodData from './period/perioddata'
export default {
  name: 'RealTime',
  components: {
    RealTimeOrigin,
    PeriodData
  },
  data() {
    return {
      tabStatus: 'realOrigin'
    }
  }
}

</script>
<style rel="stylesheet/scss" lang="scss" scoped>
@import "src/assets/styles/new-base.scss";
</style>
