<template>
  <div class="table-container">
    <template>
      <el-table
        v-loading="listLoading"
        key="aTable"
        :data="dataList"
        :row-class-name="tableRowClassName"
        :element-loading-text="$t('strings.loading')"
        border
        fit
        highlight-current-row
        style="width: 100%;height:700px;overflow-y: auto;">
        <el-table-column align="center" type="index" width="65"/>
        <el-table-column :show-overflow-tooltip="true" :label="$t('labels.create_time')" align="center" property="attributes.create_time"/>
        <el-table-column :show-overflow-tooltip="true" :label="$t('labels.messagemanage.distribute')" :formatter="showGroupName" align="center" property="attributes.to_group"/>
        <el-table-column :show-overflow-tooltip="true" :label="$t('labels.messagemanage.title')" align="center" property="attributes.title"/>
        <el-table-column :label="$t('labels.messagemanage.content')" align="center" width="150">
          <template slot-scope="scope">
            <el-popover
              :title="scope.row.attributes.title"
              :content="scope.row.attributes.information"
              placement="left"
              width="400"
              trigger="hover">
              <el-button slot="reference" size="medium" type="success" icon="el-icon-tickets" circle plain />
            </el-popover>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
        <el-pagination
          :current-page="listQuery.page"
          :page-size="listQuery.limit"
          :total="ptotal"
          layout="total, prev, pager, next, jumper"
          @current-change="handleCurrentChange"/>
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
    listLoading: {
      type: Boolean,
      default: null
    },
    ptotal: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      // el-table的 :height="" 根据界面设置表格高度，如果要直接使用定值height:"500"
      tableHeight: window.innerHeight - 200,
      listQuery: {
        page: 1,
        limit: 10
      }
    }
  },
  methods: {
    tableRowClassName({row, rowIndex}) { // eslint-disable-line
      if (row.attributes.to_group == 1) { // eslint-disable-line
        return 'warning-row'
      } else if (row.attributes.to_group == 2) { // eslint-disable-line
        return 'success-row'
      }
      return ''
    },
    showGroupName: function(row, column) {
      var showGroupNameString = ''
      if( row.attributes.to_group == 1 ) { // eslint-disable-line
        showGroupNameString = this.$t('labels.messagemanage.system_users')
      }else if( row.attributes.to_group == 2 ) { // eslint-disable-line
        showGroupNameString = this.$t('labels.messagemanage.company_users')
      }
      return showGroupNameString
    },
    // 点击下一页和点击页码时执行
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.$emit('manageTablePage', this.listQuery.page)
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.table-container {
  height: 800px;
}
  .el-table .warning-row {
    background: oldlace;
  }

  .el-table .success-row {
    background: #f0f9eb;
  }
</style>
