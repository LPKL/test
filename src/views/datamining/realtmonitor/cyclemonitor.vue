<template>
  <div v-loading="listLoading" :element-loading-text="$t('strings.loading')" class="app_container">
    <el-header class="filter_header" style="text-align: left; font-size: 12px; display: inline-table;">
      <div class="filter-container">
        <el-input v-model="searchstr" :placeholder="$t('labels.period.task_name')" suffix-icon="el-icon-search" class="el-fault_device" @change="handleFilter"/>
        <el-select v-model="searchDatasourceId" :placeholder="$t('labels.period.data_name')" class="el-fault_device" auto-complete="off" clearable @change="handleFilter">
          <el-option
            v-for="item in datasources"
            :key="item.id"
            :label="item.name"
            :value="item.id"/>
        </el-select>
      </div>
    </el-header>
    <el-main class="main_container">
      <div style="height: 630px;">
        <el-table
          ref="refTable"
          :data="tableData"
          :row-class-name="tableRowClassName"
          :highlight-current-row="false"
          fit
          row-key="id"
          style="width: 100%;height:615px;overflow-y: auto;"
          @cell-click="showDrawer">
          <el-table-column
            type="index"
            width="50"
            fixed="left"/>
          <el-table-column
            :label="$t('labels.period.task_name')"
            show-overflow-tooltip
            prop="name"
            width="230"
            fixed="left"/>
          <el-table-column
            :label="$t('labels.period.period_data')"
            show-overflow-tooltip
            prop="datasource.name"
            width="160"/>
          <el-table-column
            :label="$t('labels.period.model_name')"
            show-overflow-tooltip
            prop="models.name"
            width="180"/>
          <el-table-column
            :label="$t('labels.period.data_capture_region')"
            show-overflow-tooltip
            width="150">
            <template slot-scope="scope">
              <span>{{ scope.row.is_total ? $t('labels.period.is_total') : $t('labels.period.is_increasement') }}</span>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('labels.period.operate_cycle')"
            width="100">
            <template slot-scope="scope">
              <span style="margin-left: 10px">{{ periodflowTypeNameMapping[scope.row.periodic_type] }}</span>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('labels.period.recent_execute')"
            show-overflow-tooltip
            width="180"
            prop="last_run_at"/>
          <el-table-column
            :label="$t('labels.period.data_base_name')"
            show-overflow-tooltip
            prop="result_db"
            width="150" />
          <el-table-column
            :label="$t('labels.period.data_table_name')"
            show-overflow-tooltip
            prop="result_table"
            width="190" />
          <el-table-column
            :label="$t('labels.period.operate_state')"
            width="130">
            <template slot-scope="scope">
              <span class="work_num">{{ scope.row.run_state.success + '/' + scope.row.run_state.total }}</span>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('labels.actions')"
            width="90">
            <template slot-scope="scope">
              <el-tooltip :content="$t('labels.period.flow_run_info')" class="item" placement="top">
                <div v-if="scope.row.run_state.total > 0" style="height: 36px;" class="action_box" @click="showRunHistory(scope.row,$event)">
                  <svg-icon icon-class="monitorPreview_d" class="monitorPreview_d"/>
                  <svg-icon icon-class="monitorPreview_h" class="monitorPreview_h"/>
                  <svg-icon icon-class="monitorPreview_c" class="monitorPreview_c"/>
                </div>
              </el-tooltip>
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
    <el-drawer
      v-loading="listLoading"
      :element-loading-text="$t('strings.loading')"
      :visible.sync="isDrawerShow"
      :modal="false"
      :wrapper-closable="false"
      direction="rtl"
      class="drawerStyle"
      size="50%">
      <div class="header_action">
        <h3>
          {{ $t('labels.period.flow_run_info') + ' - ' + crntFlowName }}
          <div class="freshFlow" @mouseenter="showSvg" @mouseleave="hideSvg" @click="getPeriodRunInfo(crntFlowId)">
            <span>
              <svg-icon class="fresh_default" icon-class="fresh_default"/>
              <svg-icon class="fresh_hover" icon-class="fresh_hover"/>
              <svg-icon class="fresh_click" icon-class="fresh_click"/>
            </span>
          </div>
        </h3>
        <!-- <el-button type="text" class="freshFlow" @click="getPeriodRunInfo(crntFlowId)">刷新</el-button> -->
      </div>
      <CycleMonitorRunInfo ref="cyclemnitordetail" :flow-id="crntFlowId" :datasource-id="crntDatasourceId"/>
    </el-drawer>
  </div>
</template>
<script>
import { getPeriodStreamings, getDatasources } from '@/api/datamining/period/periodMonitor'
// import testdata from './cyclemonitor_testdata'
import CycleMonitorRunInfo from './cyclemonitorruninfo'
import _throttle from 'lodash/throttle'

export default{
  name: 'CycleMonitor',
  components: { CycleMonitorRunInfo },
  data: function() {
    return {
      tableData: [],
      crntFlowId: null,
      crntFlowName: '',
      searchDatasourceId: '',
      datasources: [],
      crntDatasourceId: null,
      treeFilterConditiion: '',
      tableFilterConditiion: '',
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      listQuery: {
        page: 1,
        limit: 10,
        total: 0,
        pageLength: 0
      },
      periodflowTypeNameMapping: {
        'day': this.$t('strings.flowAbout.everyday'),
        'week': this.$t('strings.flowAbout.everyweek'),
        'month': this.$t('strings.flowAbout.everymonth')
      },
      searchstr: '',
      isDrawerShow: false,
      searchStatus: false,
      listLoading: false
    }
  },
  mounted() {
    this.getPeriodDatasources()
    this.getCycledtreamings(this.listQuery.page)
  },
  methods: {
    getDatasourceInfo(id) {
      const datasourceInfo = this.datasources.find(c => c.id === id)
      if (datasourceInfo) {
        return {
          databaseName: datasourceInfo.database_name,
          datatableName: datasourceInfo.table_name
        }
      }
      return { databaseName: '', datatableName: '' }
    },
    handleFilter() {
      this.getCycledtreamings()
    },
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.getCycledtreamings()
    },
    // 获取周期数据源下拉绑定数据
    getPeriodDatasources() {
      const sLabelsAll = this.$t('labels.all')
      getDatasources().then(res => {
        const ds = res.data.results
        if (ds && ds.length > 0) {
          //  ds.unshift({ id: -999, name: this.$t('labels.all') }) 这样写会出现找不到$t的bug 需要提前获取
          ds.unshift({ id: -999, name: sLabelsAll })
        }
        this.datasources = ds
      }).catch((err) => {
        this.$message.error(err.message)
      })
    },
    // 获取周期流列表
    getCycledtreamings: _throttle(function() {
      this.listLoading = true
      const params = {
        page: this.listQuery.page,
        periodic_datasource: this.searchDatasourceId === -999 ? '' : this.searchDatasourceId,
        name: this.searchstr
      }
      getPeriodStreamings(params).then(res => {
        this.listLoading = false
        this.tableData = res.data.results
        this.listQuery.pageLength = this.tableData.length
        this.listQuery.total = res.data.count
      })
    }),
    showRunHistory(row) {
      if (row.run_state.total > 0) {
        if (event) event.stopPropagation()
        this.crntFlowId = row.id
        this.crntFlowName = row.name
        this.crntDatasourceId = row.datasource.id
        this.isDrawerShow = true
      }
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
    showDrawer(row, column, cell, event) {
      if (column.label === this.$t('labels.period.task_name')) {
        this.showRunHistory(row)
      }
    },
    getPeriodRunInfo() {
      const flowInfo = {
        flowId: this.crntFlowId,
        datasourceId: this.crntDatasourceId
      }
      this.$refs.cyclemnitordetail.getPeriodRunInfo(flowInfo)
    },
    tableRowClassName({ row, rowIndex }) {
      if (row.model) {
        return 'top-row'
      }
      return ''
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
    // 抽屉刷新按钮的操作
    showSvg() {
      const fresh_btn = document.getElementsByClassName('freshFlow')[0]
      const defauntEl = fresh_btn.getElementsByClassName('fresh_default')[0]
      const clickEl = fresh_btn.getElementsByClassName('fresh_click')[0]
      const hoverEl = fresh_btn.getElementsByClassName('fresh_hover')[0]
      defauntEl.style.display = 'none'
      hoverEl.style.display = 'inline-block'
      clickEl.style.display = 'none'
    },
    hideSvg(event) {
      const fresh_btn = document.getElementsByClassName('freshFlow')[0]
      const defauntEl = fresh_btn.getElementsByClassName('fresh_default')[0]
      const clickEl = fresh_btn.getElementsByClassName('fresh_click')[0]
      const hoverEl = fresh_btn.getElementsByClassName('fresh_hover')[0]
      defauntEl.style.display = 'inline-block'
      hoverEl.style.display = 'none'
      clickEl.style.display = 'none'
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>

  $elementGap:24px;
  $boxLeft:48px;
  .drawerStyle {
    /deep/ .el-drawer__container {
      .el-drawer {
        width: 994px!important;
        .el-drawer__header {
          margin-bottom: 0;
        }
        .el-drawer__body {
          padding: 0 24px;
          .header_action {
            h3 {
              font-size: 18px;
              color: #808080;
              // font-family: sy_regular;
              margin: 0;
              padding: 18px 0 18px 0;
              .freshFlow {
                float: right;
                margin-right: 20px;
                cursor: pointer;
                .fresh_default {
                  width: 20px;
                  height: 20px;
                  display: inline-block;
                }
                .fresh_click,.fresh_hover {
                  width: 20px;
                  height: 20px;
                  display: none;
                }
              }
            }
            border-bottom: 1px solid #ebeef5;
          }
        }
      }
    }
  }
  // 改
  .app_container {
  .main_container {
    margin-top: 0;
    padding: 0 26px!important;
    .realproject {
      color: #0f32b5;
    }
    .noclick {
      color: #c0c4cc!important;
    }
    .action_box {
      .monitorPreview_d,.monitorPreview_h,.monitorPreview_c {
        width: 16px;
        height: 16px;
        vertical-align: middle;
      }
      .monitorPreview_d {
        display: inline-block;
      }
      .monitorPreview_h {
        display: none;
      }
      .monitorPreview_c {
        display: none;
      }
      &:hover {
        .monitorPreview_d {
          display: none;
        }
        .monitorPreview_h {
          display: inline-block;
        }
        .monitorPreview_c {
          display: none;
        }
      }
      &:active {
        .monitorPreview_d {
          display: none;
        }
        .monitorPreview_h {
          display: none;
        }
        .monitorPreview_c {
          display: inline-block;
        }
      }
    }
  }
}

.app_container {
  /deep/ .filter_header {
    .filter-container {
      .el-select {
        .el-input {
          min-width: 120px;
          width: auto;
          .el-input__inner {
            width: auto;
            min-width: 120px;
          }
          // .el-input__suffix {
          //   .el-input__suffix-inner {
          //     .el-select__caret  {
          //       display: inline-block!important;
          //     }
          //     .el-icon-arrow-up:before{
          //       content:"\e78f";
          //       font-size: 20px;
          //     }
          //     // .el-icon-circle-close:before{
          //     //   content: "\e79d";
          //     // }
          //     &::after {
          //       display: none;
          //     }
          //   }
          // }
        }
      }
    }
  }
}
</style>
