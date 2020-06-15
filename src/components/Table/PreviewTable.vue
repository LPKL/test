<!--普通 table 组件 没有弹窗-->
<template>
  <el-row :gutter="20">
    <el-col :span="24" >
      <el-table
        :data="fileupEndData"
        :header-cell-style="{'font-size':'12px'}"
        :cell-style="{'font-size':'12px'}"
        :style="compStyle"
        stripe
        border >
        <el-table-column v-for="(header,index) of tableHeader" :label="header" :key="index" min-width="120px">
          <div slot-scope="scope">
            <div class="biz-customcol">
              <div class="biz-two-row">
                <span >{{ scope.row[index] }}</span>
              </div>
            </div>
          </div>
        </el-table-column>
      </el-table>
      <div v-show="$attrs.r" class="pre-table-footer">{{ allname + ': ' + $attrs.c + rowname + ' ' + $attrs.r + colname }} </div>
    </el-col>
  </el-row>
</template>

<script>
export default {
  name: 'PreviewTable',
  props: {
    fileupEndData: {
      type: Array,
      default: null
    },
    tableHeader: {
      type: Array,
      default: null
    },
    height: {
      type: String,
      default: '400px'
    }
  },
  data() {
    return {
      allname: '',
      colname: '',
      rowname: '',
      textH: '18',
      mheight: '400px'
    }
  },
  computed: {
    compStyle() {
      return { width: '100%', height: this.mheight, fontSize: '20px' }
    }
  },
  watch: {
    '$props.height': {
      handler(newer, older) {
        this.setHeight(newer)
      }
    }
  },
  mounted() {
    this.allname = this.$t('strings.all')
    this.colname = this.$t('strings.col')
    this.rowname = this.$t('strings.row')
    this.setHeight(this.$props.height)
  },
  methods: {
    setHeight(h) {
      if (h.slice(-2) !== 'px') {
        this.mheight = h
        return
      }
      this.mheight = h.slice(0, -2) - this.textH + 'px'
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  /deep/ .el-table .cell {
    white-space:nowrap;
    text-overflow:ellipsis;
    overflow:hidden;
  }
  .pre-table-footer {
    text-align: center;
    line-height: 18px;
  }
</style>
