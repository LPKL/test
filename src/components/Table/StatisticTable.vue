<!--数据统计组件-->
<template>
  <el-table
    v-loading="statistical_status==='executing'"
    :data="statistical"
    :header-cell-style="{'font-size':'12px'}"
    :cell-style="{'font-size':'12px'}"
    :height="mheight"
    class="statistic-table"
    element-loading-text="正在统计..."
    style="width:100%"
    border >
    <el-table-column v-for="(h,index) of header" :label="h.display_name" :key="index" min-width="120px" show-overflow-tooltip>
      <div slot-scope="scope">
        <span v-if="h.name === '_rowname'" style="font-weight:bold;">{{ scope.row[h.name] }} </span>
        <span v-else-if="scope.row['_rowmethod'] !=='chart'" >{{ scope.row[h.name] }}</span>
        <div v-else/>
      </div>
    </el-table-column>
  </el-table>
</template>

<script>
export default {
  name: 'StatisticTable',
  props: {
    mheight: {
      type: String,
      default: '100%'
    },
    stacticData: {
      type: Object,
      default: null
    },
    stacticState: {
      type: String,
      default: 'idle'
    },
    rowNames: {
      type: Array,
      default: () => {
        return [
          { method: 'distinctCounts', display: '去重值' },
          { method: 'dropnaCounts', display: '缺失值' },
          // { method: 'count', display: '数量' },
          { method: 'max', display: '最大值' },
          { method: 'min', display: '最小值' },
          { method: 'mean', display: '均值' },
          { method: 'stddev', display: '标准差' }
          // { method: 'chart', display: '统计图' }
        ]
      }
    },
    schema: {
      type: Array,
      default: () => {
        return [
          { name: 'time', type: 'timestamp', display_name: 'time' },
          { name: 'shangx', type: 'string', display_name: '上导x' }]
      }
    }
  },
  data() {
    return {
      id: '',
      statistical: [],
      statistical_status: 'success',
      statistic_time: '',
      header: []
    }
  },
  watch: {
    '$props.stacticData': {
      handler(newer) {
        this.parseData(newer)
        console.log('update parse data', this.statistical, this.header)
      },
      deep: true
    },
    '$props.schema': {
      handler(newer) {
        this.parseHeader(newer)
      },
      deep: true
    },
    '$props.stacticState': {
      handler(newer) {
        this.statistical_status = newer
      }
    }
  },
  mounted() {
    this.statistical_status = this.stacticState
    this.parseHeader(this.schema)
    this.parseData(this.stacticData)
  },
  methods: {
    // 转换统计数据
    parseData(stacticData) {
      console.log('before parse data', stacticData)
      if (!stacticData || !stacticData.statistical) {
        this.statistical = []
        this.statistic_time = ''
        return
      }
      const stacData = stacticData.statistical
      const parsedData = []
      console.log('parsed header', this.header)
      this.rowNames.forEach(c => {
        const row = { _rowmethod: c.method, _rowname: c.display }
        this.header.forEach((h, i) => {
          if (i > 0) {
            // header跳过左侧标题项
            row[h.name] = stacData[c.method] ? stacData[c.method][i - 1] : ''
          }
        })
        parsedData.push(row)
      })
      this.statistical = parsedData
      this.statistic_time = stacticData.statistical.statistic_time
      this.statistical_status = stacticData.statistical_status
    },
    // 转换表头
    parseHeader(schema) {
      if (!schema || schema.length === 0) {
        this.header = []
        return
      }
      this.header = [{ name: '_rowname', display_name: '' }, ...schema.map(c => {
        const item = { ...c }
        if (!c.display_name) {
          item.display_name = c.name
        }
        return item
      })]
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  /deep/ .statistic-table.el-table .cell {
    white-space:nowrap;
    text-overflow:ellipsis;
    overflow:hidden;
    line-height: 23px;
    height:24px;
    span{
      width: 100%;
      display: inline-block;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
</style>
