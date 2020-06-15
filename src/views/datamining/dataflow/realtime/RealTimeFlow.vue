<template>
  <div class="app_container">
    <el-header class="filter_header" style="text-align: left; font-size: 12px; display: inline-table;">
      <div class="filter-container">
        <el-input :placeholder="$t('labels.modelmanage.model_name')" v-model="searchstr" class="el-fault_device" suffix-icon="el-icon-search" @change="handleFilter(searchstr)"/>
      </div>
    </el-header>
    <!-- 实时流程组件 -->
    <el-main class="main_container">
      <!-- <el-button type="primary" size="small" plain class="freshBtn new-btn-other" @click="freshPage">{{ this.$t('labels.fresh') }}</el-button> -->
      <div style="height: 630px;">
        <el-table
          :data="realTimeFlowData"
          :default-sort = "{prop: 'date', order: 'descending'}"
          :highlight-current-row="false"
          fit
          style="width: 100%;height:625px;overflow-y: auto;">
          <el-table-column :label="$t('labels.id')" fixed="left" align="left" width="80%">
            <template slot-scope="scope">
              <span>{{ (listQuery.page - 1)*10 + scope.$index + 1 }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('labels.flow.source')" show-overflow-tooltip fixed="left" align="left" width="200%">
            <template slot-scope="scope">
              <span>{{ scope.row.datasources.name }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('labels.flow.model_name')" show-overflow-tooltip align="left" width="240">
            <template slot-scope="scope">
              <span>{{ scope.row.streaming_target_name }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('labels.flow.batch')" align="left" width="240" show-overflow-tooltip>
            <template slot-scope="scope">
              <span>{{ scope.row.livy_batch_id }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('labels.status')" align="center" min-width="140%">
            <template slot-scope="scope">
              <svg-icon v-if="scope.row.batch_status === 'error'" icon-class="error" />
              <svg-icon v-if="scope.row.batch_status === 'running'" icon-class="running" />
              <svg-icon v-if="scope.row.batch_status === 'starting'" icon-class="starting" />
              <svg-icon v-if="scope.row.batch_status === 'un_start'" icon-class="un_start" />
              <div class="icon_desc">{{ statusMap[scope.row.batch_status] }}</div>
            </template>
          </el-table-column>
          <el-table-column :label="$t('labels.create_time')" align="left" min-width="200" show-overflow-tooltip>
            <template slot-scope="scope">
              <span>{{ scope.row.create_at }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('labels.realTime.recently_time')" align="left" min-width="200" show-overflow-tooltip>
            <template slot-scope="scope">
              <span>{{ scope.row.last_run_at }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('labels.realTime.creator')" align="left" min-width="150" show-overflow-tooltip>
            <template slot-scope="scope">
              <span>{{ scope.row.creator.username }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('labels.actions')" align="left" class-name="small-padding fixed-width" min-width="200%">
            <template slot-scope="scope">
              <div style="height: 36px;">
                <el-button :loading="scope.row.batch_status === 'starting'" @click="handleFlow(scope.row)">{{ btnMap[scope.row.batch_status] }}</el-button>
                <el-button class="delete" @click="deleteProjectFlow(scope.row)" >{{ $t('buttons.delete') }}</el-button>
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
    <!-- 实时流程删除的弹窗 -->
    <el-dialog
      :visible.sync="deleteFlowDataVisible"
      :close-on-click-modal="false"
      class="deletePeriodData">
      <div class="top">
        <svg-icon class="warn_mark" icon-class="warn_mark"/>
        <span class="title">{{ $t('strings.flowAbout.remind') }}</span>
      </div>
      <div class="content">{{ $t('strings.flowAbout.delete_flow_message') }}</div>
      <div slot="footer" class="dialog-footer">
        <el-button class="cancel" @click="deleteFlowDataVisible = false">{{ $t('buttons.cancel') }}</el-button>
        <el-button class="confirm" type="primary" @click="deleteProject(deleteObj)">{{ $t('buttons.confirm') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import {
  deleteRealTimeFlow,
  realtimeFlowSearch,
  getRealtimeFlowData,
  restartRealTimeFlow,
  startRealTimeFlow,
  prohibitRealTimeFlow
} from '@/api/datamining/real/realflow'
import debounce from 'lodash/debounce'
// import { setInterval, clearInterval } from 'timers'
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
      // 轮询定时器
      freshTimer: null,
      deleteFlowDataVisible: false,
      deleteObj: {}
    }
  },
  created() {
    clearInterval(this.freshTimer)
    this.getRealTimeFlow()
    this.getOneFreshData()
  },
  methods: {
    // 获取一个实时流程
    getOneFreshData() {
      this.freshTimer = setInterval(() => {
        for (let i = 0; i < this.realTimeFlowData.length; i++) {
          if (this.realTimeFlowData[i].batch_status !== 'running' && this.realTimeFlowData[i].batch_status !== 'error' && this.realTimeFlowData[i].batch_status !== 'un_start') {
            this.getRealTimeFlow(this.listQuery.page)
            i--
            return
          }
        }
        clearInterval(this.freshTimer)
      }, 5000)
    },
    // 刷新页面
    freshPage: debounce(function() {
      this.getRealTimeFlow(this.listQuery.page)
    }, 500),
    // 获取实时流程
    getRealTimeFlow(p) {
      this.searchstr = ''
      this.searchStatus = false
      this.listLoading = true
      const page = p || 1
      this.listQuery.page = page
      getRealtimeFlowData({ page }).then(res => {
        this.listLoading = false
        this.realTimeFlowData = res.data.data
        this.listQuery.pageLength = this.realTimeFlowData.length
        this.listQuery.total = res.data.count
      })
    },
    // 分页器切换
    handleCurrentChange(val) {
      this.listLoading = true
      this.listQuery.page = val
      clearInterval(this.freshTimer)
      if (this.searchStatus) {
        // 此时是搜索的操作
        this.handleFilter(this.searchstr, val)
      } else {
        this.getRealTimeFlow(val)
      }
      this.getOneFreshData()
    },
    // 搜索
    handleFilter: debounce(function(val, p) {
      if (!val) {
        this.getRealTimeFlow()
        return
      }
      this.searchstr = val
      this.searchStatus = true
      const page = p || 1
      const temp = { search: val, page }
      this.listLoading = true
      realtimeFlowSearch(temp).then(res => {
        this.listLoading = false
        this.realTimeFlowData = res.data.data
        this.listQuery.pageLength = this.realTimeFlowData.length
        this.listQuery.total = res.data.count
      }).catch(() => {
        this.listLoading = false
        this.$message.error(this.$t('labels.getFaild'))
      })
    }, 500),
    handleFlow(row) {
      this.listLoading = true
      const status = row.batch_status
      // const originId = row.datasources.id
      // const modelId = row.models.id
      const id = row.id
      switch (status) {
        case 'running':
          // 禁用的操作
          prohibitRealTimeFlow(id).then(res => {
            this.$message.success(this.$t('messages.realtime.prohibitSuccess'))
            this.freshPage()
          }).catch(() => {
            this.listLoading = false
            this.$message.error(this.$t('messages.realtime.prohibitFaild'))
          })
          break
        case 'error':
          // 重启的操作
          this.getOneFreshData()
          restartRealTimeFlow(id).then(res => {
            this.$message.success(this.$t('messages.realtime.restartSuccess'))
            this.freshPage()
          }).catch(() => {
            this.listLoading = false
            this.$message.error(this.$t('messages.realtime.restartFaild'))
          })
          break
        case 'un_start':
          // 启动的操作
          this.getOneFreshData()
          startRealTimeFlow(id).then(res => {
            this.$message.success(this.$t('messages.realtime.startSuccess'))
            this.freshPage()
          }).catch(() => {
            this.listLoading = false
            this.$message.error(this.$t('messages.realtime.startFaild'))
          })
          break
        default:
          // 启动中的操作
          break
      }
    },
    // 删除操作
    deleteProjectFlow(val) {
      this.deleteFlowDataVisible = true
      this.deleteObj = val
    },
    deleteProject: debounce(function(row) {
      if (row.batch_status === 'starting') {
        this.$message.error(this.$t('strings.flowAbout.start_remind'))
        return
      }
      this.listLoading = true
      deleteRealTimeFlow(row.id).then(res => {
        this.$message.success(this.$t('messages.realtime.deleteFlowSuccess'))
        this.deleteFlowDataVisible = false
        if (this.listQuery.page !== 1 && this.listQuery.pageLength === 1) {
          this.handleCurrentChange(this.listQuery.page - 1)
        } else {
          this.handleCurrentChange(this.listQuery.page)
        }
      }).catch(() => {
        this.deleteFlowDataVisible = false
        this.$message.error(this.$t('messages.realtime.deleteFlowFaild'))
        this.listLoading = false
      })
    }, 500)
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
@import "src/assets/styles/new-base.scss";
.normal{
  background-color: green;
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.abnormal{
  background-color: #6484d4;
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.not_start, .start_up{
  background-color: yellow;
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.not_exit {
  background-color: black;
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.app_container {
  padding: 0;
  .filter_header {
    border-bottom: 1px solid #f2f2f2;
    border-radius: 0;
    padding: 10px 0 30px 0;
    .filter-container {
      margin-left: 16px;
    }
  }
  .main_container {
    position: relative;
    margin-top: 0;
    padding: 0 26px!important;
    /deep/ .el-table {
      .el-table__fixed {
        min-height: 715px;
      }
      .el-table__body-wrapper {
        /deep/ .el-table__body  {
          .el-table__row {
            .is-center {
              .cell {
                padding-right: 10px;
                .icon_desc {
                  font-size: 12px;
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
