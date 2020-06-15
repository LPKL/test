<template>
  <div class="app_container">
    <el-header class="filter_header" style="text-align: left; font-size: 12px; display: inline-table;">
      <div class="filter-container">
        <el-input :placeholder="$t('labels.modelmanage.model_name')" v-model="searchstr" class="el-fault_device" suffix-icon="el-icon-search" @change="handleFilter(searchstr)"/>
      </div>
    </el-header>
    <!-- 实时流程组件 -->
    <el-main class="main_container">
      <div style="height: 630px;">
        <el-table
          :data="periodData"
          :default-sort = "{prop: 'date', order: 'descending'}"
          :highlight-current-row="false"
          fit
          style="width: 100%;height:625px;overflow-y: auto;">
          <el-table-column :label="$t('labels.id')" fixed="left" align="left" width="80">
            <template slot-scope="scope">
              <span style="display: inline-block;width:80px">{{ (listQuery.page - 1)*10 + scope.$index + 1 }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('labels.period.task_name')" show-overflow-tooltip fixed="left" align="left" width="200%">
            <template slot-scope="scope">
              <span>{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('labels.period.data_name')" show-overflow-tooltip align="left" width="200%">
            <template slot-scope="scope">
              <span>{{ scope.row.datasource.name }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('labels.period.model_name')" show-overflow-tooltip align="left" width="200%">
            <template slot-scope="scope">
              <span>{{ scope.row.models.name }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('labels.period.operate_cycle')" show-overflow-tooltip align="left" width="240%">
            <template slot-scope="scope">
              <span v-if="scope.row.periodic_type === 'day'">{{ `${workPeriod[scope.row.periodic_type]} ${scope.row.run_at}` }}</span>
              <span v-if="scope.row.periodic_type === 'week'">{{ `${workPeriod[scope.row.periodic_type]} ${scope.row.periodStr} ${scope.row.run_at}` }}</span>
              <span v-if="scope.row.periodic_type === 'month'">{{ `${workPeriod[scope.row.periodic_type]} ${scope.row.periodStr} ${scope.row.run_at}` }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('labels.period.data_capture_region')" align="left" width="200%" show-overflow-tooltip>
            <template slot-scope="scope">
              <span>{{ scope.row.is_total? $t('labels.period.is_total_capture') : $t('labels.period.is_increasement_capture') }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('labels.period.time_capture')" show-overflow-tooltip align="left" width="200%">
            <template slot-scope="scope">
              <span>{{ scope.row.time_field }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('labels.period.operate_state')" align="left" width="200%">
            <template slot-scope="scope">
              <span class="work_num">{{ `${scope.row.run_state.success}/${scope.row.run_state.total}` }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('labels.period.operate_state')" align="left" width="240%">
            <template slot-scope="scope">
              <span>{{ scope.row.started_at }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('labels.period.enable')" align="left" width="200%">
            <template slot-scope="scope">
              <el-switch
                v-model="scope.row.is_enabled"
                active-color="#0f32b5"
                inactive-color="#ccc"
                @change="disableFlow(scope.row)"/>
            </template>
          </el-table-column>
          <el-table-column :label="$t('labels.period.creator')" align="left" show-overflow-tooltip min-width="200">
            <template slot-scope="scope">
              <span>{{ scope.row.creator.username }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('labels.actions')" align="left" class-name="small-padding fixed-width" min-width="80%">
            <template slot-scope="scope">
              <div style="height: 36px;">
                <div class="delete_btn" @mousemove="showSvg(scope.$index)" @mouseout="hideSvg(scope.$index)" @click="deleteDialogFunc(scope.row, scope.$index)" >
                  <span>
                    <svg-icon icon-class="delete_d" class="defaultS" />
                    <svg-icon icon-class="delete_h" class="hoverS" />
                    <svg-icon icon-class="delete_c" class="clickS" />
                  </span>
                </div>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pagination-container">
        <el-pagination
          :current-page="listQuery.page"
          :page-size="listQuery.limit"
          :total="listQuery.total"
          layout="total, prev, pager, next, jumper"
          @current-change="handleCurrentChange"/>
      </div>
    </el-main>
    <!-- 周期流程删除的弹窗 -->
    <el-dialog
      :visible.sync="deletePeriodDataVisible"
      :close-on-click-modal="false"
      class="deletePeriodData">
      <div class="top">
        <svg-icon class="warn_mark" icon-class="warn_mark"/>
        <span class="title">{{ $t('strings.remind') }}</span>
      </div>
      <div class="content">{{ deleteContent.content }}</div>
      <div class="delete_warning">{{ deleteContent.warning }}</div>
      <div slot="footer" class="dialog-footer">
        <el-button class="cancel" @click="deletePeriodDataVisible = false">{{ $t('buttons.cancel') }}</el-button>
        <el-button class="confirm" type="primary" @click="deletePeriodFlowData(deleteObj.row, deleteObj.index)">{{ $t('buttons.confirm') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { getPeriodFlowList, banPeriodFlow, deletePeriodFlow, searchPeriodFlow, runPeriodFlow } from '@/api/datamining/period/periodListUrl'
//
//
//
//
// import {
//   deleteRealTimeFlow,
//   realtimeFlowSearch,
//   getRealtimeFlowData,
//   restartRealTimeFlow,
//   startRealTimeFlow,
//   prohibitRealTimeFlow
// } from '@/api/experiment'
import debounce from 'lodash/debounce'
export default {
  name: 'RealTimeFlow',
  data() {
    return {
      searchstr: '',
      searchStatus: false,
      listQuery: {
        page: 1,
        limit: 10,
        total: 0,
        pageLength: 0
      },
      listLoading: false,
      // 实时流程
      realTimeFlowData: [],
      statusMap: {
        un_start: this.$t('strings.dataAbout.un_start'),
        starting: this.$t('strings.dataAbout.starting'),
        running: this.$t('strings.dataAbout.running'),
        error: this.$t('strings.dataAbout.error')
      },
      colorMap: {
        un_start: 'not_start',
        starting: 'start_up',
        running: 'normal',
        error: 'abnormal'
      },
      btnMap: {
        un_start: this.$t('strings.dataAbout.start'),
        starting: '',
        running: this.$t('strings.dataAbout.prohibit'),
        error: this.$t('strings.dataAbout.restart')
      },
      //
      //
      //
      //
      periodData: [],
      workPeriod: {
        day: this.$t('strings.flowAbout.everyday'),
        week: this.$t('strings.flowAbout.everyweek'),
        month: this.$t('strings.flowAbout.everymonth')
      },
      num_week: {
        0: this.$t('strings.flowAbout.day'),
        1: this.$t('strings.flowAbout.one'),
        2: this.$t('strings.flowAbout.two'),
        3: this.$t('strings.flowAbout.three'),
        4: this.$t('strings.flowAbout.four'),
        5: this.$t('strings.flowAbout.five'),
        6: this.$t('strings.flowAbout.six')
      },
      workPeriodStr: '',
      deletePeriodDataVisible: false,
      deleteObj: {},
      deleteContent: {
        content: '确定删除该周期流吗?',
        warning: '(该操作将同时删除相应的周期流监测，请谨慎操作!)'
      }
    }
  },
  created() {
    this.getperiodFlowList()
  },
  methods: {
    showSvg(index) {
      const defauntEl = document.getElementsByClassName('defaultS')[index]
      const clickEl = document.getElementsByClassName('clickS')[index]
      const hoverEl = document.getElementsByClassName('hoverS')[index]
      defauntEl.style.display = 'none'
      hoverEl.style.display = 'inline-block'
      clickEl.style.display = 'none'
    },
    hideSvg(index) {
      const defauntEl = document.getElementsByClassName('defaultS')[index]
      const clickEl = document.getElementsByClassName('clickS')[index]
      const hoverEl = document.getElementsByClassName('hoverS')[index]
      defauntEl.style.display = 'inline-block'
      hoverEl.style.display = 'none'
      clickEl.style.display = 'none'
    },
    // 刷新页面
    freshPage: debounce(function() {
      this.getperiodFlowList(this.listQuery.page)
    }, 500),
    // 获取实时流程
    getperiodFlowList(p) {
      this.searchstr = ''
      this.searchStatus = false
      this.listLoading = true
      const page = p || 1
      this.listQuery.page = page
      getPeriodFlowList({ page }).then(res => {
        this.listLoading = false
        const tempData = res.data.results
        let periodStr = ''
        tempData.forEach(item => {
          periodStr = ''
          if (item.periodic_type === 'week') {
            const tempArr = item.day_of_week.split(',').sort()
            if (tempArr.indexOf('0') === 0) {
              tempArr.push(tempArr.shift())
            }
            for (let i = 0; i < tempArr.length; i++) {
              periodStr += `周${this.num_week[tempArr[i]]}`
            }
          } else if (item.periodic_type === 'month') {
            const tempArr = item.day_of_month.split(',').sort()
            if (tempArr.indexOf('-1') === 0) {
              tempArr.shift()
              for (let i = 0; i < tempArr.length; i++) {
                periodStr += `${tempArr[i]}号,`
              }
              periodStr += '最后一天'
            } else {
              for (let i = 0; i < tempArr.length; i++) {
                periodStr += `${tempArr[i]}号,`
              }
              periodStr = periodStr.slice(0, -1)
            }
          }
          item.periodStr = periodStr
        })
        this.periodData = tempData
        this.listQuery.pageLength = this.periodData.length
        this.listQuery.total = res.data.count
      })
    },
    // 禁用/启用开关的操作
    disableFlow(row) {
      if (row.is_enabled) {
        runPeriodFlow(row.datasource.id, row.id).then(res => {
          console.log()
        })
      } else {
        banPeriodFlow(row.datasource.id, row.id).then(res => {
          console.log()
        })
      }
    },
    // 删除周期数据
    deleteDialogFunc(row, index) {
      this.deleteObj = {}
      this.deletePeriodDataVisible = true
      this.deleteObj.row = row
      this.deleteObj.index = index
    },
    // 删除某个周期流程
    deletePeriodFlowData(row, index) {
      // 为了操作svg图
      const defauntEl = document.getElementsByClassName('defaultS')[index]
      const clickEl = document.getElementsByClassName('clickS')[index]
      const hoverEl = document.getElementsByClassName('hoverS')[index]
      defauntEl.style.display = 'none'
      hoverEl.style.display = 'none'
      clickEl.style.display = 'inline-block'
      this.listLoading = true
      deletePeriodFlow(row.datasource.id, row.id).then(res => {
        this.$message.success(this.$t('messages.delete_success'))
        this.deletePeriodDataVisible = false
        if (this.listQuery.page !== 1 && this.listQuery.pageLength === 1) {
          this.handleCurrentChange(this.listQuery.page - 1)
        } else {
          this.handleCurrentChange(this.listQuery.page)
        }
      }).catch(() => {
        this.$message.error(this.$t('messages.delete_failed'))
        this.listLoading = false
        this.deletePeriodDataVisible = false
      })
    },
    // 搜索周期流程
    handleFilter: debounce(function(val, p) {
      if (!val) {
        this.getperiodFlowList()
        return
      }
      this.searchstr = val
      this.searchStatus = true
      const page = p || 1
      const temp = { q: val, page }
      this.listLoading = true
      searchPeriodFlow(temp).then(res => {
        this.listLoading = false
        this.periodData = res.data.results
        this.listQuery.pageLength = this.periodData.length
        this.listQuery.total = res.data.count
      }).catch(() => {
        this.listLoading = false
        this.$message.error(this.$t('labels.getFaild'))
      })
    }, 500),
    // 分页器切换
    handleCurrentChange(val) {
      this.listLoading = true
      this.listQuery.page = val
      if (this.searchStatus) {
        // 此时是搜索的操作
        this.handleFilter(this.searchstr, val)
      } else {
        this.getperiodFlowList(val)
      }
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
@import "src/assets/styles/new-base.scss";
.app_container {
  .main_container {
    position: relative;
    margin-top: 0;
    padding: 0 26px!important;
    .el-table {
      // body部分
      /deep/ .el-table__body-wrapper  {
        .el-table__body {
          .el-table__row {
            td {
              .cell {
                padding-right: 106px;
                .work_num {
                  display: inline-block;
                  width: 100%;
                  text-align: center;
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
