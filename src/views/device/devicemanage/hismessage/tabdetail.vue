<template>
  <div class="app-container">
    <div class="tabtableBox">
      <el-table
        v-loading.body="tableLoading"
        :data="tableData"
        :element-loading-text="$t('strings.loading')"
        style="width: 100%"
        height="600"
        border
        fit
        highlight-current-row>
        <el-table-column :label="$t('labels.devicemanage.field_zname')" prop="field_zname" align="center">
          <template slot-scope="scope">
            <span v-text="scope.row.attributes.field_zname"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.devicemanage.field_name')" prop="field_name" align="center">
          <template slot-scope="scope">
            <span v-text="scope.row.attributes.field_name"/>
          </template>
        </el-table-column>
        <el-table-column v-if="!isShi" :label="$t('labels.devicemanage.field_chart')" prop="field_chart" align="center">
          <template slot-scope="scope">
            <span v-text="scope.row.attributes.field_chart"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.devicemanage.field_datanum')" prop="field_datanum" align="center">
          <template slot-scope="scope">
            <span v-text="scope.row.attributes.field_datanum"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.devicemanage.field_empty')" prop="field_empty" align="center">
          <template slot-scope="scope">
            <span v-text="scope.row.attributes.field_empty"/>
          </template>
        </el-table-column>
        <el-table-column v-if="!isShi" :label="$t('labels.devicemanage.field_groundthd')" prop="field_groundthd" align="center">
          <template slot-scope="scope">
            <span v-text="scope.row.attributes.field_groundthd"/>
          </template>
        </el-table-column>
        <el-table-column v-if="!isShi" :label="$t('labels.devicemanage.field_monitorids')" prop="field_monitorids" align="center">
          <template slot-scope="scope">
            <span v-text="scope.row.attributes.field_monitorids"/>
          </template>
        </el-table-column>
        <el-table-column v-if="!isShi" :label="$t('labels.devicemanage.table_datatype')" prop="table_datatype" align="center">
          <template slot-scope="scope">
            <span v-text="scope.row.attributes.table_datatype"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.devicemanage.field_period')" prop="field_period" align="center">
          <template slot-scope="scope">
            <span v-text="scope.row.attributes.field_period"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.devicemanage.field_tableno')" prop="field_tableno" align="center">
          <template slot-scope="scope">
            <span v-text="scope.row.attributes.field_tableno"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.devicemanage.field_type')" prop="field_type" align="center">
          <template slot-scope="scope">
            <span v-text="scope.row.attributes.field_type"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.devicemanage.field_unit')" prop="field_unit" align="center">
          <template slot-scope="scope">
            <span v-text="scope.row.attributes.field_unit"/>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!--分页-->
    <el-pagination
      :current-page="tablePage.current"
      :page-size="12"
      :total="tablePage.total"
      layout="total,prev, pager, next, jumper"
      @current-change="handleCurrentChange"/>
  </div>
</template>

<script>
import { getTabDetail, getShiDetail } from '@/api/device'
export default {
  name: 'Tabdetail',
  data() {
    return {
      detail: '',
      routeid: '',
      isShi: false,
      allData: [],
      tableData: [],
      tableLoading: false,
      tablePage: {
        current: 1,
        total: 0
      }
    }
  },
  created() {
    this.initData()
  },
  methods: {
    // 获取数据
    initData() {
      if (this.$route.query.isShi) {
        // 实时数据的详情
        this.routeid = this.$route.query.id
        this.isShi = this.$route.query.isShi
        const str = '?config_kafka_id=' + this.routeid
        this.tableLoading = true
        getShiDetail(str).then(res => {
          this.tableLoading = false
          this.allData = res.data.data
          this.tablePage.total = this.allData.length
          this.showDefault()
        })
      } else {
        // 数据表的详情
        this.routeid = this.$route.query.id
        const str = '?table_id=' + this.routeid
        this.tableLoading = true
        getTabDetail(str).then(res => {
          this.tableLoading = false
          this.allData = res.data.data
          this.tablePage.total = this.allData.length
          this.showDefault()
        })
      }
    },
    // 默认展示
    showDefault() {
      this.tableData = this.allData.slice(0, 12)
    },
    // 分页器的功能
    handleCurrentChange(val) {
      this.tablePage.current = val
      this.tableLoading = true
      setTimeout(() => {
        this.tableLoading = false
        this.tableData = this.allData.slice(12 * (val - 1), 12 * val)
      }, 500)
    }
  }
}

</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.app-container{
  height: 917px;
  .tabtableBox{
    height: 553px;
    margin-bottom: 70px;
  }
}
</style>
