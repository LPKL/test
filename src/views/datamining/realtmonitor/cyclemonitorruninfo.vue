<template>
  <div class="column-right">
    <div class="content-wrap">
      <el-table
        v-loading="listLoading"
        :data="flowRunData"
        :header-row-style="{textAlign:'center'}"
        row-key="id"
        fit
        style="height:600px;overflow-y: auto;">
        <el-table-column
          :label="$t('labels.period.data_capture_region')"
          show-overflow-tooltip>
          <template slot-scope="scope">
            <span>{{ scope.row.data_started_at ? scope.row.data_started_at + ' - ' + scope.row.data_ended_at : scope.row.data_ended_at }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('labels.period.excutetime')"
          prop="run_at"
          show-overflow-tooltip/>
        <el-table-column
          :label="$t('labels.period.status')">
          <template slot-scope="scope">
            <!-- <i v-if="scope.row.state === 'success'" class="el-icon-circle-check"/>
            <i v-else-if="scope.row.state === 'error'" class="el-icon-circle-close"/>
            -->
            <svg-icon v-if="scope.row.state === 'success'" icon-class="search_success" class="search_success"/>
            <svg-icon v-else-if="scope.row.state === 'error'" icon-class="search_faild" class="search_faild"/>
            <svg-icon v-else icon-class="flow_running" class="search_success"/>
            <span style="margin-left: 10px">{{ searchState[scope.row.state] }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('labels.actions')"
          align="center"
          width="100">
          <template slot-scope="scope">
            <!-- <i v-if="scope.row.state === 'error'" :title="$t('labels.period.restart')" class="btn-operate el-icon-refresh-left" @click="restart(scope.row,$event)"/>
            <i v-if="scope.row.state === 'success'" :title="$t('labels.period.data_explorer')" class="btn-operate el-icon-document" @click="showDetail(scope.row,$event)"/> -->
            <!-- <i v-if="scope.row.state === 'success' || scope.row.state === 'error' " class="btn-operate el-icon-delete" @click="removeItem(scope.row,$event)"/> -->
            <el-tooltip :content="$t('labels.period.data_explorer')" class="item" placement="top">
              <div v-if="scope.row.state === 'success'" class="successBox" @click="showDetail(scope.row,$event)">
                <svg-icon icon-class="dataSearch_d" class="dataSearch_d"/>
                <svg-icon icon-class="dataSearch_h" class="dataSearch_h"/>
                <svg-icon icon-class="dataSearch_c" class="dataSearch_c"/>
              </div>
            </el-tooltip>
            <el-tooltip :content="$t('labels.period.restart')" class="item" placement="top">
              <div v-if="scope.row.state === 'error'" class="restartBox" @click="restart(scope.row,$event)">
                <svg-icon icon-class="searchRestart_d" class="searchRestart_d"/>
                <svg-icon icon-class="searchRestart_h" class="searchRestart_h"/>
                <svg-icon icon-class="searchRestart_c" class="searchRestart_c"/>
              </div>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
        <el-pagination
          :current-page="listQuery.page"
          :page-size="listQuery.limit"
          :total="listQuery.total"
          layout="total, prev, pager, next, jumper"
          @current-change="handleCurrentChange"/>
      </div>
    </div>
    <el-dialog
      v-el-drag-dialog.fullscreen
      :close-on-click-modal="false"
      :title="$t('strings.flow.set_chart')"
      :visible.sync="dialogCascade"
      :before-close="beforecloseCasc"
      append-to-body
      class="modelflow-datasnooping">

      <data-explorer
        ref="compChart"
        :periodic-datasource-id="datasourceId"
        :streaming-id="flowId"
        :run-id="crntRunId"
        :periodic-data-started-at="crntDataStartedAt"
        :periodic-data-ended-at="crntDataEndedAt"
        explorer-type="periodMonitorRun"/>
    </el-dialog>
  </div>
</template>
<script>
import { getPeriodMonitorDetails, restartPeriodRun, getPeriodMonitorRunDataExperiments } from '@/api/datamining/period/periodMonitor'
// import testdata from './cyclemonitor_testdata'
import DataExplorer from '@/components/DataExplorer'
// import { filterResponse } from '@/utils/index'

export default {
  name: 'CycleMonitorRunInfo',
  components: { DataExplorer },
  props: {
    flowId: {
      type: Number,
      default: null
    },
    datasourceId: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      flowRunData: [],
      listQuery: {
        page: 1,
        limit: 10,
        total: 0,
        pageLength: 0
      },
      searchstr: '',
      searchStatus: false,
      listLoading: false,
      dialogCascade: false,
      crntDataStartedAt: '1970-01-01 00:00',
      crntDataEndedAt: null,
      crntRunId: null,
      searchState: {
        error: this.$t('labels.monitorAbout.failed'),
        success: this.$t('labels.monitorAbout.success'),
        executing: this.$t('labels.monitorAbout.executing')
      }
    }
  },
  computed: {
    flowInfo() {
      const { flowId, datasourceId } = this
      return {
        flowId,
        datasourceId
      }
    }
  },
  watch: {
    flowInfo: {
      handler: function(newer, older) {
        this.getPeriodRunInfo(newer)
      },
      deep: true,
      immediate: true
    }
  },
  mounted() {
    this.getPeriodRunInfo(this.flowInfo)
  },
  methods: {
    handleCurrentChange(val) {
      this.listLoading = true
      this.listQuery.page = val
      this.getPeriodRunInfo(this.flowInfo)
    },
    restart(row, event) {
      if (event) event.stopPropagation()
      restartPeriodRun(row.periodic_datasource.id, row.periodic_datasource_streaming, row.id).then(res => {
        const index = this.flowRunData.findIndex(c => c.id === row.id)
        row.state = 'executing'
        if (index >= 0) {
          this.$set(this.flowRunData, index, row)
        }
      })
    },
    // 获取周期流运行详情
    getPeriodRunInfo(info) {
      this.listLoading = true
      getPeriodMonitorDetails(info.datasourceId, info.flowId, { page: this.listQuery.page }).then(res => {
        this.listLoading = false
        this.flowRunData = res.data.results
        this.listQuery.pageLength = this.flowRunData.length
        this.listQuery.total = res.data.count
      })
    },
    parseToTableData(data) {
      console.log(data)
    },
    showDetail(row) {
      if (event) event.stopPropagation()
      this.dialogCascade = true
      this.crntRunId = row.id
      if (row.data_started_at !== null) {
        this.crntDataStartedAt = row.data_started_at
        if (('' + this.crntDataStartedAt).length === 10) {
          this.crntDataStartedAt = this.crntDataStartedAt + ' 00:00'
        }
      } else {
        this.crntDataStartedAt = '1970-01-01 00:00'
      }
      this.crntDataEndedAt = row.data_ended_at
      if (('' + this.crntDataEndedAt).length === 10) {
        this.crntDataEndedAt = this.crntDataEndedAt + ' 23:59'
      }
      this.tagglePreview(this.datasourceId, this.flowId, this.crntRunId).then(res => {
        const result = res.data.datas
        console.log(res)
        const { output_columns, dataset_id, chart_conf } = result
        setTimeout(() => {
          this.$refs.compChart.loadCharts(output_columns, chart_conf, dataset_id)
        }, 500)
      })
    },
    beforecloseCasc() {
      this.dialogCascade = false
      this.$refs.compChart.reset()
    },
    removeItem(row) {
      if (event) event.stopPropagation()
      this.$confirm(this.$t('confirm.message'), this.$t('labels.reminder'), {
        confirmButtonText: this.$t('buttons.confirm'),
        cancelButtonText: this.$t('buttons.cancel'),
        type: 'warning'
      }).then(() => {
        if (row.children) {
          const index = this.tableData.findIndex(c => c.id === row.id)
          const firstChild = row.children.shift()
          Object.assign(row, firstChild)
          delete row.parentid
          if (row.children.length === 0) {
            delete row.children
          } else {
            row.children.forEach(element => {
              element.parentid = firstChild.id
            })
          }
          this.$set(this.tableData, index, row)
        } else {
          // 有parentId说明是children中的项
          if (row.parentid) {
            const parent = this.tableData.find(c => c.id === row.parentid)
            const childIndex = parent.children.findIndex(c => c.id === row.id)
            parent.children.splice(childIndex, 1)
          } else {
            // 没有parentId是单独的项
            const index = this.tableData.findIndex(c => c.id === row.id)
            this.tableData.splice(index, 1)
          }
        }
      })
    },
    getArrowWrapClass(expanded) {
      if (expanded) {
        return { 'arrow-wrap': true, 'rotated': true }
      }
      return { 'arrow-wrap': true, 'rotated': false }
    },
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0) {
        if (rowIndex % 2 === 0) {
          return {
            rowspan: 2,
            colspan: 1
          }
        } else {
          return {
            rowspan: 0,
            colspan: 0
          }
        }
      }
    },
    tagglePreview(datasourceId, streamingId, runId) {
      return new Promise((resolve, reject) => {
        getPeriodMonitorRunDataExperiments(datasourceId, streamingId, runId).then(res => {
          if (res.data.status !== 200) {
            reject('error')
          }
          resolve(res)
        }).catch(error => {
          this.$message.error('请求错误!')
          reject(error)
        })
      })
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>

  $elementGap:24px;
  $boxLeft:48px;
  .column-right {
    .content-wrap {
      /deep/ .el-table {
        padding: 0 8px;
        /deep/ tr td .cell {
          display:flex; // 带icon的cell，icon与文本对齐
        }
        .el-table__header-wrapper {
          border-top: none;
          .el-table__header {
            .has-gutter {
              .is-leaf {
                height: 53px;
                color: #808080;
                // font-family: sy_regular;
                font-size: 15px;
              }
            }
          }
        }
        .el-table__body-wrapper {
          /deep/ .el-table__body  {
            .el-table__row {
              .is-left {
                .cell {
                  padding-right: 44px;
                  .delete_btn {
                    svg{
                      width: 24px;
                      height: 24px;
                    }
                    text-align: center;
                    cursor: pointer;
                    .hoverS {
                      display: none;
                    }
                    .clickS {
                      display: none;
                    }
                  }
                }
              }
            }
          }
        }
      }
      .search_success,.search_faild {
        width: 16px;
        height: 16px;
        display: inline-block;
        vertical-align: middle;
      }
      .successBox {
        .dataSearch_d,.dataSearch_h,.dataSearch_c {
          width: 16px;
          height: 16px;
        }
        .dataSearch_d {
          display: inline-block;
        }
        .dataSearch_h {
          display: none;
        }
        .dataSearch_c {
          display: none;
        }
        &:hover {
          .dataSearch_d {
            display: none;
          }
          .dataSearch_h {
            display: inline-block;
          }
          .dataSearch_c {
            display: none;
          }
        }
        &:active {
          .dataSearch_d {
            display: none;
          }
          .dataSearch_h {
            display: none;
          }
          .dataSearch_c {
            display: inline-block;
          }
        }
      }
      .restartBox {
        .searchRestart_d,.searchRestart_h,.searchRestart_c {
          width: 16px;
          height: 16px;
        }
        .searchRestart_d {
          display: inline-block;
        }
        .searchRestart_h {
          display: none;
        }
        .searchRestart_c {
          display: none;
        }
        &:hover {
          .searchRestart_d {
            display: none;
          }
          .searchRestart_h {
            display: inline-block;
          }
          .searchRestart_c {
            display: none;
          }
        }
        &:active {
          .searchRestart_d {
            display: none;
          }
          .searchRestart_h {
            display: none;
          }
          .searchRestart_c {
            display: inline-block;
          }
        }
      }
    }
  }
</style>
