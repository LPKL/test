<template>
  <div>
    <template>
      <el-table
        v-loading="listLoading"
        :data="dataList"
        :height="tableHeight"
        :show-header="false"
        fit
        highlight-current-row
        style="width: 100%;overflow-y: auto;">
        <el-table-column min-width="100%">
          <template slot-scope="scope">
            <div v-for="item in cellDataStatus" :key="item.key" @click="rowClick(scope.row)">
              <span v-if="item.key == scope.row.id" :class="[item.status=='Y'?'readed':'unreaded']">
                {{ scope.row.attributes.title }}
              </span>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
        <el-pagination
          :current-page="listQuery.page"
          :page-size="listQuery.limit"
          :total="totalCount"
          background
          layout="prev, pager, next"
          style="float:left;"
          @current-change="handleCurrentChange"/>
        <el-button type="primary" style="float:right;" plain size="mini" @click="readAll()">{{ $t('buttons.messagemanage.read_all_message') }}</el-button>
      </div>
    </template>
  </div>

</template>
<script>
export default {
  props: {
    dataList: {
      type: Array,
      default: null
    },
    dataListStatus: {
      type: Array,
      default: null
    },
    listLoading: {
      type: Boolean,
      default: null
    },
    totalCount: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      cellDataStatus: this.dataListStatus,
      tableHeight: window.innerHeight * 0.5,
      // tableHeight: '50vh', //兼容性问题
      // 分页
      listQuery: {
        page: 1,
        limit: 10,
        sort: '+id'
      }
    }
  },
  methods: {
    // 点击下一页和点击页码时执行
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.$emit('myMessagelistPage', this.listQuery.page)
    },
    rowClick(row) {
      // console.log('rrrow click', row)
      this.$emit('aclickrow', row, this.tableHeight, 'auth')
    },
    readAll() {
      this.$emit('areadall', 'auth')
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
  .readed {
    color: #939393;
  }
  .unreaded {
    color: #000;
  }
</style>
