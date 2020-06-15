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
        <el-table-column property="attributes.title" min-width="85%">
          <template slot-scope="scope">
            <div v-for="item in cellDataStatus" :key="item.key" @click="rowClick(scope.row)">
              <span v-if="item.key == scope.row.id" :class="[item.status=='Y'?'readed':'unreaded']">
                {{ scope.row.attributes.info }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column min-width="15%">
          <template slot-scope="scope">
            <el-button slot="reference" icon="el-icon-circle-close-outline" size="mini" class="messagedeletebutton" circle @click="deleteClick(scope.row)"/>
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
      </div>
      <div style="float:right;">
        <el-button type="danger" plain size="mini" @click="deleteAll()">{{ $t('buttons.messagemanage.clean_all_message') }}</el-button>
        <el-button type="primary" plain size="mini" @click="readAll()">{{ $t('buttons.messagemanage.read_all_message') }}</el-button>
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
      this.$emit('faultMessagelistPage', this.listQuery.page)
    },
    rowClick(row) {
      console.log('faultMessage row click', row)
      this.$emit('fclickrow', row, this.tableHeight, 'error')
    },
    readAll() {
      this.$emit('freadall', 'error')
    },
    deleteAll() {
      this.$emit('fdeleteall', 'error')
    },
    deleteClick(row) {
      this.$emit('fdeleterow', row.id, 'error')
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
  .messagedeletebutton {
    border: 0px;
  }
  .readed {
    color: #939393;
  }
  .unreaded {
    color: #000;
  }
</style>
