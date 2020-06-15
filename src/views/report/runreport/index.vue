<template>
  <div class="app_container">
    <el-header class="filter_header" style="text-align: left;margin-top:10px; font-size: 12px; display: inline-table;">
      <operation
        ref="filter"
        :template-list="templateList"
        @searchReports="getReports"
        @createreport="createNewReport"/>
    </el-header>
    <el-main class="main_container">
      <div style="height: 630px;">
        <el-table
          v-loading="listLoading"
          :data="dataList"
          highlight-current-row
          fit
          style="width: 100%;height: 615px;overflow-y: auto;">
          <!-- <el-table-column align="center" type="index" width="65"/> -->
          <el-table-column :label="$t('labels.numb')" fixed="left" align="center" type="index" width="80"/>
          <el-table-column :label="$t('labels.runreport.name')" show-overflow-tooltip fixed="left" align="left" min-width="250">
            <template slot-scope="scope">
              <span>{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('labels.runreport.monitor_device')" show-overflow-tooltip min-width="120">
            <template slot-scope="scope">
              <span>{{ scope.row.datasource ? scope.row.datasource.name : 'xxx' }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('labels.runreport.report_type')" min-width="100">
            <template slot-scope="scope">
              <span>{{ gerReportTypeName(scope.row.type) }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('labels.runreport.period')" show-overflow-tooltip min-width="320">
            <template slot-scope="scope">
              <span class="nowrap-ellipsis">{{ scope.row.started_at + $t('strings.to') + scope.row.ended_at }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('labels.runreport.create_time')" min-width="180" show-overflow-tooltip>
            <template slot-scope="scope">
              <span>{{ scope.row.created_at }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('labels.runreport.creator')" min-width="160" show-overflow-tooltip>
            <template slot-scope="scope">
              <span>{{ scope.row.creator.username }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('labels.actions')" align="center" min-width="160">
            <template slot-scope="scope">
              <div style="height: 36px;">
                <el-button @click="openDetailWindow(scope.row)">{{ $t('buttons.detail') }}</el-button>
                <el-button v-if="$store.state.user.name === scope.row.creator.username" @click="openDeleteDetailConfirm(scope.row)">{{ $t('buttons.delete') }}</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pagination-container">
        <el-pagination
          :current-page="listQuery.page"
          :page-size="listQuery.limit"
          :total="listQuery.totalCount"
          layout="total, prev, pager, next, jumper"
          @current-change="handleCurrentChange"/>
      </div>
    </el-main>
  </div>
</template>

<script>
import { getTemplates } from '@/api/report/template'
import { getRunReports, createRunReport, deleteRunReport } from '@/api/report/runreport'
import Operation from './components/Operations'
import debounce from 'lodash/debounce'
export default {
  name: 'RunReport',
  components: {
    'operation': Operation
  },
  data() {
    return {
      dataList: [],
      listLoading: false,
      // 分页
      listQuery: {
        page: 1,
        limit: 10,
        sort: '+id',
        totalCount: 0
      },
      templateList: [], // 模板列表
      selected_template: 0,
      reportTypes: {
        'week': this.$t('strings.runreport.week_report'),
        'month': this.$t('strings.runreport.month_report'),
        'quarter': this.$t('strings.runreport.quarter_report'),
        'custom': this.$t('strings.runreport.customize')
      },
      searchCondition: ''
    }
  },
  created() {
    this.getReports('')
    this.getTemplatesData()
  },
  methods: {
    gerReportTypeName(type) {
      return this.reportTypes[type]
    },
    openDetailWindow(detail) {
      const { href } = this.$router.resolve({
        name: 'RunReportView',
        query: {
          name: detail.name,
          type: detail.type,
          typename: this.reportTypes[detail.type],
          datasource: JSON.stringify(detail.datasource),
          template: JSON.stringify(detail.template),
          started_at: detail.started_at,
          ended_at: detail.ended_at
        }
      })
      window.open(href, '_blank')
    },
    openDeleteDetailConfirm(detail) {
      this.$confirm(this.$t('confirm.message'), this.$t('labels.reminder'), {
        confirmButtonText: this.$t('buttons.confirm'),
        cancelButtonText: this.$t('buttons.cancel'),
        type: 'warning'
      }).then(() => {
        deleteRunReport(detail.id).then(res => {
          this.$message.success(this.$t('messages.delete_success'))
          this.listQuery.page = 1
          this.getReports(this.searchCondition)
        })
      })
    },
    getTemplatesData() {
      // 模板列表
      getTemplates({ 'type': 'enterprise' }).then(res => {
        const data = res.data.data
        this.templateList = []
        for (var each_template of data) {
          // console.log('getTemplates', each_template)
          this.templateList.push({ 'value': each_template.id, 'label': each_template.name })
        }
      }).catch(error => {
        console.log('getTemplate', error)
      })
    },
    createNewReport(newReport) {
      createRunReport({
        name: newReport.name,
        type: newReport.dateRange,
        datasource_id: newReport.datasource_id,
        template_id: newReport.template_id,
        started_at: newReport.period[0],
        ended_at: newReport.period[1]
      }).then(res => {
        this.$refs['filter'].$data.dialogFormVisible = false
        this.listQuery.totalCount += 1
        this.dataList.unshift(res.data)
        this.openDetailWindow(res.data)
      }).catch(e => {
        console.log('createReport', e)
        this.$message.error(e.message)
      })
    },
    getReports: debounce(function(condition) {
      this.searchCondition = condition
      this.listLoading = true
      getRunReports({ q: this.searchCondition, page: this.listQuery.page }).then(res => {
        const data = res.data
        this.dataList = data.result
        this.listQuery.totalCount = data.count
        this.listLoading = false
      }).catch(error => {
        console.log('getReports', error)
      })
    }),
    // 点击下一页和点击页码时执行
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.getReports(this.searchCondition)
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>

  .nowrap-ellipsis{
    white-space: nowrap;
    text-overflow: ellipsis;
  }
</style>

