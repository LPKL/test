<!--
 * @author cuichuanwa
 * @date 20-3-18 下午5:31
 * @description 统计信息查看上部组件
 -->
<template>
  <section>
    <section v-if="result.featureType=='String'" class="chart_info" data-type="String">
      <p>
        <strong>{{ $t('term.enTozh.distinct_num') }}</strong>
        <span v-if="result.distinctNum_every">
          <el-tooltip placement="bottom" effect="light">
            <template slot="content">
              <PreviewTable :fileup-end-data="result.distinctNum_every" :table-header="header"/>
            </template>
            <a style="color: #3d65c9; text-decoration: underline;">{{ result.distinctNum + $t('labels.ge') }}</a>
          </el-tooltip>
        </span>
        <span v-else>{{ result.distinctNum + $t('labels.ge') }}</span>
      </p>
      <p><strong>{{ $t('term.enTozh.missing_value') }}</strong><span>{{ result.missingValueNum + $t('labels.ge') }}</span></p>
      <p><strong>{{ $t('term.enTozh.feature_type') }}</strong><span>{{ result.featureType }}</span></p>
    </section>
    <section v-else class="chart_info" data-type="Numeric">
      <p><strong>{{ $t('term.enTozh.mean') }}</strong><span>{{ result.mean }}</span> <strong>{{ $t('term.enTozh.stddev') }}</strong><span>{{ result.stddev }}</span></p>
      <p>
        <strong>{{ $t('term.enTozh.median') }}</strong>
        <span>{{ result['50%'] }}</span>
        <strong>{{ $t('term.enTozh.distinct_num') }}</strong>
        <span v-if="result.distinctNum_every">
          <el-tooltip placement="bottom" effect="light">
            <template slot="content">
              <PreviewTable :fileup-end-data="result.distinctNum_every" :table-header="header" height="300px"/>
            </template>
            <a style="color: #3d65c9; text-decoration: underline;">{{ result.distinctNum + $t('labels.ge') }}</a>
          </el-tooltip>
        </span>
        <span v-else>{{ result.distinctNum + $t('labels.ge') }}</span>
      </p>
      <p><strong>{{ $t('term.enTozh.max') }}</strong><span>{{ result.max }}</span> <strong>{{ $t('term.enTozh.missing_value') }}</strong><span>{{ result.missingValueNum + $t('labels.ge') }}</span></p>
      <p><strong>{{ $t('term.enTozh.min') }}</strong><span>{{ result.min }}</span> <strong>{{ $t('term.enTozh.feature_type') }}</strong><span>{{ result.featureType }}</span></p>
    </section>
  </section>
</template>

<script>
import PreviewTable from '@/components/Table/PreviewTable'
export default {
  name: 'StatisticsUpper',
  components: { PreviewTable },
  props: {
    result: {
      type: Object,
      default: () => {
        return {
          missingValueNum: 0,
          distinctNum: 28,
          featureType: 'Numeric',
          mean: 942.8832,
          stddev: 4.9275,
          min: '931.0',
          '50%': '943.0',
          max: '959.0'
        }
      }

    }
  },
  data() {
    const qu = this.$t('term.enTozh.missing_value')
    const count = this.$t('labels.count')
    return {
      header: [qu, count]
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .chart_info{
    p {
      display: table;
      width: 100%;
      margin: 5px;
      & > strong, & > span{
        display: table-cell;
      }
      & > strong{
        width: 10%;
      }
       & > span{
        width: 20%;
      }
    }
  }
</style>
