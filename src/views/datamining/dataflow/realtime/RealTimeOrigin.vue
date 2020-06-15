<template>
  <div v-loading="listLoading" :element-loading-text="$t('strings.loading')" class="app_container">
    <el-header class="filter_header" style="text-align: left; font-size: 12px; display: inline-table;">
      <div class="filter-container">
        <el-input v-model="searchstr" :placeholder="$t('labels.modelmanage.model_name')" class="el-fault_device" suffix-icon="el-icon-search" @change="handleFilter(searchstr)"/>
        <el-button type="primary" class="add_realtime_origin" @click="handleAdd">{{ $t('labels.realTime.add_realTime_origin') }}</el-button>
        <el-button type="text" class="period_monitor" @click="monitorFunc">{{ $t('labels.realTime.realtime_monitor') }}</el-button>
      </div>
    </el-header>
    <el-main class="main_container">
      <div style="height: 630px;">
        <el-table
          :data="realTimeOriginData"
          :highlight-current-row="false"
          fit
          style="width: 100%;height:615px;overflow-y: auto;"
          @cell-click="handleCell">
          <el-table-column :label="$t('labels.id')" fixed="left" align="left" width="80%">
            <template slot-scope="scope">
              <span :title="scope.row.id">{{ (listQuery.page - 1)*10 + scope.$index + 1 }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('labels.name')" show-overflow-tooltip fixed="left" align="left" width="200%">
            <template slot-scope="scope">
              <span>{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('labels.desc')" align="left" show-overflow-tooltip width="240%">
            <template slot-scope="scope">
              <span v-if="!scope.row.description">--</span>
              <span v-else>{{ scope.row.description }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('labels.realTime.realtime_flow')" property="realtime_flow" align="left" width="140%" show-overflow-tooltip>
            <template slot-scope="scope">
              <span :class="{ 'noclick': scope.row.realproject === 0 }" class="realproject">{{ scope.row.realproject }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('labels.dfilemanage.origin')" align="left" width="240%" show-overflow-tooltip>
            <template slot-scope="scope">
              <span :title="scope.row.identifier">{{ scope.row.identifier }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('labels.realTime.origin')" align="left" width="240%" show-overflow-tooltip>
            <template slot-scope="scope">
              <span :title="scope.row.schema.name">{{ scope.row.schema.name }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('labels.realTime.add_time')" align="left" width="240%" show-overflow-tooltip>
            <template slot-scope="scope">
              <span>{{ scope.row.create_at }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('labels.realTime.creator')" align="left" min-width="150" show-overflow-tooltip>
            <template slot-scope="scope">
              <span>{{ scope.row.creator.username }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('labels.actions')" align="left" class-name="small-padding fixed-width" min-width="240">
            <template slot-scope="scope">
              <div style="height: 36px">
                <el-button class="relate" style="width: 80px;" @click="moduleFunc(scope.row)">{{ $t('labels.dfilemanage.module') }}</el-button>
                <el-button class="delete" style="margin-left: 16px;" @click="deleteSource(scope.row)">{{ $t('labels.delete') }}</el-button>
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
    <!-- 添加模型 -->
    <el-dialog
      :visible.sync="dialogFormShow"
      :close-on-click-modal="false"
      :title="$t('labels.modelmanage.module')"
      :v-loading="moduleFormLoading"
      width="408px"
      class="relate_model">
      <div style="height: 300px">
        <el-form ref="groupForm" status-icon label-width="100px" class="ruleForm">
          <div class="el-model">
            <span class="el-modelTitle">单独模型</span>
            <el-tree
              ref="modelTreeRef"
              :data="modelArr"
              :expand-on-click-node="true"
              show-checkbox
              node-key="id"
              default-expand-all>
              <span slot-scope="{ node, data }" class="custom-tree-node">
                <span class="el-name">{{ data.name }}</span>
                <span class="el-type">{{ modelMap[data.type] }}</span>
              </span>
            </el-tree>
          </div>
          <div class="el-pipeline">
            <span class="el-pipelineTitle">组合模型</span>
            <el-tree
              ref="pipelineTreeRef"
              :data="pipelineArr"
              :expand-on-click-node="true"
              show-checkbox
              node-key="id"
              default-expand-all>
              <span slot-scope="{ node, data }" class="custom-tree-node">
                <span class="el-name">{{ data.name }}</span>
                <span class="el-type">{{ modelMap[data.type] }}</span>
              </span>
            </el-tree>
          </div>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormShow = false">{{ $t('buttons.cancel') }}</el-button>
        <el-button :loading="moduleFormLoading" type="primary" @click="uploadFunc" >{{ $t('buttons.confirm') }}</el-button>
      </div>
    </el-dialog>
    <!-- 添加实时源 -->
    <el-dialog
      v-loading="listLoading"
      :visible.sync="dialogTableVisible"
      :close-on-click-modal = "false"
      :close-on-press-escape = "false"
      :before-close = "beforeClose"
      :title="$t('labels.realTime.add_realTime_origin')"
      :element-loading-text="$t('strings.dfilemanage.fileuploading')"
      class="addDialog"
      style="margin-top: -10vh">
      <el-form ref="dataForm" :rules="rules" :model="filed" label-width="80px" label-position="left">
        <el-form-item :label="$t('labels.name')" prop="name">
          <el-input v-model="filed.name" style="width: 100%"/>
        </el-form-item>
        <el-form-item :label="$t('labels.desc')" prop="description" class="description">
          <el-input :autosize="{ minRows: 2, maxRows: 4}" v-model="filed.description" type="textarea" style="width: 100%"/>
        </el-form-item>
        <el-form-item :label="$t('labels.dfilemanage.origin')" prop="identifier">
          <el-input v-model="filed.identifier" style="width: 100%"/>
          <span style="font-size: 12px;">{{ $t('strings.dfilemanage.name_rule') }}</span>
        </el-form-item>
        <el-form-item :label="$t('labels.flow.table_structor')" prop="schema_guid" label-width="80px">
          <el-select v-model="filed.schema_guid" :placeholder="$t('labels.choose')">
            <el-option
              v-for="(item, index) in metaData"
              :key="index"
              :label="item.name"
              :value="item.id"/>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="addOriginData">{{ $t('buttons.confirm') }}</el-button>
      </div>
    </el-dialog>
    <!-- 实时流程 -->
    <el-drawer
      v-loading="listLoading"
      :element-loading-text="$t('strings.loading')"
      :visible.sync="table"
      :modal="false"
      :before-close = "getNewData"
      :wrapper-closable="false"
      direction="rtl"
      class="drawerStyle">
      <div class="header_action">
        <h3>
          {{ $t('strings.flow.realtimeflow') }}
          <div class="freshFlow" @mouseenter="showSvg" @mouseleave="hideSvg" @click="getFlowData(currentFlowId, 22)">
            <span>
              <svg-icon class="fresh_default" icon-class="fresh_default"/>
              <svg-icon class="fresh_hover" icon-class="fresh_hover"/>
              <svg-icon class="fresh_click" icon-class="fresh_click"/>
            </span>
          </div>
        </h3>
      </div>
      <el-table
        :data="flowData"
        :default-sort = "{prop: 'date', order: 'descending'}"
        fit
        highlight-current-row
        style="height:600px;overflow-y: auto;">
        <el-table-column :label="$t('labels.flow.model_name')" show-overflow-tooltip align="left">
          <template slot-scope="scope">
            <span>{{ scope.row.streaming_target_name }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.flow.batch')" align="left" width="140%" show-overflow-tooltip>
          <template slot-scope="scope">
            <span>{{ scope.row.livy_batch_id }}</span>
          </template>
        </el-table-column>
        <el-table-column label="模型" align="left" width="140%" show-overflow-tooltip>
          <template slot-scope="scope">
            <span>{{ modelMap[scope.row.type] }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.status')" align="center" width="140%">
          <template slot-scope="scope">
            <svg-icon v-if="scope.row.batch_status === 'error'" icon-class="error" />
            <svg-icon v-if="scope.row.batch_status === 'running'" icon-class="running" />
            <svg-icon v-if="scope.row.batch_status === 'starting'" icon-class="starting" />
            <svg-icon v-if="scope.row.batch_status === 'un_start'" icon-class="un_start" />
            <div class="icon_desc">{{ statusMap[scope.row.batch_status] }}</div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.create_time')" align="left" show-overflow-tooltip>
          <template slot-scope="scope">
            <span>{{ scope.row.create_at }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.actions')" align="left" class-name="small-padding fixed-width" width="200%">
          <template slot-scope="scope">
            <el-button :loading="scope.row.batch_status === 'starting'" @click="handleFlow(scope.row)">{{ btnMap[scope.row.batch_status] }}</el-button>
            <el-button class="delete" @click="deleteOriginFlow(scope.row)" >{{ $t('buttons.delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-drawer>
  </div>
</template>
<script>
import {
  deleteRealTimeOrigin,
  searchRealTimeOrigin,
  getRealTimeOrigin,
  addRealTimeOrigin,
  getRealTimeOriginFlow,
  addRealTimeOriginModel,
  startRealTimeFlow,
  prohibitRealTimeFlow,
  restartRealTimeFlow,
  originRelateModel
} from '@/api/datamining/real/realorigin'
import { deleteRealTimeFlow } from '@/api/datamining/real/realflow'
// import { getHaveGuidModel } from '@/api/datamining/model'
import { validateFileName_ } from '@/utils/validate'
import { getSchemaNameList } from '@/api/datamining/schema'
// import rules from '@/utils/rules'
import debounce from 'lodash/debounce'
export default {
  name: 'RealTimeOrigin',
  data() {
    const validatName = (rule, value, callback) => {
      if (!value) {
        callback(new Error(this.$t('rules.realSrc_name')))
      } else if (!validateFileName_(value)) {
        callback(new Error(this.$t('rules.realSrc_rule')))
      } else {
        callback()
      }
    }
    const validHdfsPath = (rule, value, callback) => {
      if (!value) {
        callback(new Error(this.$t('rules.require_realSrc')))
      } else {
        callback()
      }
    }
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
      realTimeOriginData: [],
      allmodel: [],
      dialogFormShow: false,
      moduleFormLoading: false,
      // 右侧推拉框
      table: false,
      flowData: [],
      // checkBoxStatus: true,
      uploadId: null,
      setId: '',
      // 实时源添加
      dialogTableVisible: false,
      filed: {
        name: '', // 文件名
        identifier: '',
        description: '',
        schema_guid: ''
      },
      rules: {
        name: [{ required: true, trigger: 'blur', validator: validatName }],
        identifier: [{ required: true, trigger: 'blur', validator: validHdfsPath }],
        schema_guid: [{ required: true, trigger: 'change', message: '请选择' }]
      },
      // 临时元数据
      metaData: [],
      colorMap: {
        un_start: 'not_start',
        starting: 'start_up',
        running: 'normal',
        error: 'abnormal'
      },
      statusMap: {
        un_start: this.$t('strings.dataAbout.un_start'),
        starting: this.$t('strings.dataAbout.starting'),
        running: this.$t('strings.dataAbout.running'),
        error: this.$t('strings.dataAbout.error')
      },
      btnMap: {
        un_start: this.$t('strings.dataAbout.start'),
        starting: '',
        running: this.$t('strings.dataAbout.prohibit'),
        error: this.$t('strings.dataAbout.restart')
      },
      currentFlowId: '',
      aRelateModel: [],
      aRelatePipeline: [],
      modelMap: {
        pipeline: '组合',
        model: '单独',
        datasource_to_pipeline: '组合模型',
        datasource_to_model: '单独模型'
      },
      modelArr: [],
      pipelineArr: []
    }
  },
  created() {
    this.getRealTimeOrigin()
  },
  methods: {
    // 获取实时源
    getRealTimeOrigin(p) {
      this.searchstr = ''
      this.searchStatus = false
      const page = p || 1
      this.listQuery.page = page
      this.listLoading = true
      getRealTimeOrigin({ page }).then(res => {
        this.listLoading = false
        this.realTimeOriginData = res.data.data
        this.pageLength = this.realTimeOriginData.length
        this.listQuery.total = res.data.count
      }).catch(() => {
        this.listLoading = false
        this.$message.error(this.$t('messages.get_faild'))
      })
    },
    // 表结构的获取
    async getTheDataOfOrigin() {
      try {
        const result = await getSchemaNameList()
        const data = result.data
        if (Array.isArray(data)) {
          this.metaData = data
        } else {
          this.$message.error(data.message)
        }
      } catch (e) {
        this.$message.error(e.message)
        console.log('getTheDataOfOrigin', e)
      }
    },
    // 分页器切换
    handleCurrentChange(val) {
      this.listLoading = true
      this.listQuery.page = val
      if (this.searchStatus) {
        // 搜索的分页
        this.handleFilter(this.searchstr, val)
      } else {
        this.getRealTimeOrigin(val)
      }
    },
    // 搜索
    handleFilter: debounce(function(val, p) {
      if (!val) {
        this.getRealTimeOrigin()
        return
      }
      this.searchStatus = true
      const page = p || 1
      this.listQuery.page = page
      this.listLoading = true
      searchRealTimeOrigin({ search: val, page }).then(res => {
        this.listLoading = false
        this.realTimeOriginData = res.data.data
        this.listQuery.total = res.data.count
        this.listQuery.pageLength = this.realTimeOriginData.length
      }).catch(e => {
        console.log(e)
        this.listLoading = false
        this.$message.error(this.$t('messages.get_faild'))
      })
    }, 500),
    // 添加实时源
    handleAdd() {
      this.dialogTableVisible = true
      this.getTheDataOfOrigin()
    },
    // 数据源添加
    addOriginData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          this.listLoading = true
          addRealTimeOrigin(this.filed).then(res => {
            this.dialogTableVisible = false
            this.listLoading = false
            this.$refs['dataForm'].resetFields()
            this.$message.success(this.$t('messages.add_success'))
            this.getRealTimeOrigin()
          }).catch(e => {
            this.listLoading = false
            // this.$refs['dataForm'].resetFields()
            this.$message.error(e.message)
          })
        }
      })
    },
    // 重置表单
    beforeClose() {
      this.dialogTableVisible = false
      this.$refs['dataForm'].resetFields()
    },
    // 点击某一表格的事件,查看实时流程
    handleCell(row, column, event, cell) {
      if (!row.realproject) return
      if (column.property === 'realtime_flow') {
        this.table = true
        this.listLoading = true
        this.currentFlowId = row.id
        this.getFlowData(row.id)
      }
    },
    // 实时流程数据的获取
    getFlowData(id, num) {
      // 刷新按钮的操作
      if (num) {
        const fresh_btn = document.getElementsByClassName('freshFlow')[0]
        const defauntEl = fresh_btn.getElementsByClassName('fresh_default')[0]
        const clickEl = fresh_btn.getElementsByClassName('fresh_click')[0]
        const hoverEl = fresh_btn.getElementsByClassName('fresh_hover')[0]
        defauntEl.style.display = 'none'
        hoverEl.style.display = 'none'
        clickEl.style.display = 'inline-block'
      }
      getRealTimeOriginFlow(id).then(res => {
        this.listLoading = false
        this.flowData = res.data
      }).catch(() => {
        this.listLoading = false
        this.$message.error(this.$t('messages.get_faild'))
      })
    },
    // 源对应的流程的操作
    handleFlow(row) {
      this.listLoading = true
      const status = row.batch_status
      const originId = row.datasources.id
      const modelId = row.models.id
      switch (status) {
        case 'running':
          // 禁用的操作
          prohibitRealTimeFlow(originId, modelId).then(res => {
            this.$message.success(this.$t('messages.realtime.prohibitSuccess'))
            this.getFlowData(this.currentFlowId)
          }).catch(() => {
            this.listLoading = false
            this.$message.success(this.$t('messages.realtime.prohibitFaild'))
          })
          break
        case 'error':
          // 重启的操作
          restartRealTimeFlow(originId, modelId).then(res => {
            this.$message.success(this.$t('messages.realtime.restartSuccess'))
            this.getFlowData(this.currentFlowId)
          }).catch(() => {
            this.listLoading = false
            this.$message.success(this.$t('messages.realtime.restartFaild'))
          })
          break
        case 'un_start':
          // 启动的操作
          startRealTimeFlow(originId, modelId).then(res => {
            this.$message.success(this.$t('messages.dataAbout.flow_is_start'))
            this.getFlowData(this.currentFlowId)
          }).catch(() => {
            this.listLoading = false
            this.$message.success(this.$t('messages.realtime.startFaild'))
          })
          break
        default:
          // 启动中的操作
          break
      }
    },
    // 删除当前源的一个流
    deleteOriginFlow(row) {
      console.log(row)
      this.$confirm(this.$t('messages.realtime.confirmDelete'), this.$t('labels.reminder'), {
        confirm: true,
        closeOnClickModal: false
      }).then(() => {
        this.listLoading = true
        const datasource_id = row.datasources.id
        deleteRealTimeFlow(row.id).then(res => {
          this.$message.success(this.$t('messages.realtime.deleteFlowSuccess'))
          this.getFlowData(datasource_id)
        }).catch(() => {
          this.$message.error(this.$t('messages.realtime.deleteFlowFaild'))
          this.listLoading = false
        })
      }).catch((e) => {
        this.listLoading = false
        this.$message({
          message: this.$t('messages.cancel_operate'),
          type: 'info',
          duration: 1000
        })
      })
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
    },
    //
    //
    //
    //
    moduleFunc(val) {
      this.listLoading = true
      this.modelArr = []
      this.aRelateModel = []
      this.pipelineArr = []
      this.aRelatePipeline = []
      originRelateModel(val.id).then(res => {
        this.allmodel = res.data
        this.uploadId = val.id
        const modelTempArr = []
        const pipelineTempArr = []
        this.allmodel.forEach(item => {
          if (item.type === 'pipeline') {
            this.pipelineArr.push(item)
          } else {
            this.modelArr.push(item)
          }
          if (item.checkmark && item.type === 'model') {
            this.aRelateModel.push(Number(item.id))
            modelTempArr.push({ id: Number(item.id) })
          }
          if (item.checkmark && item.type === 'pipeline') {
            this.aRelatePipeline.push(Number(item.id))
            pipelineTempArr.push({ id: Number(item.id) })
          }
        })
        this.dialogFormShow = true
        this.listLoading = false
        this.$nextTick(() => {
          this.$refs.modelTreeRef.setCheckedNodes(modelTempArr)
          this.$refs.pipelineTreeRef.setCheckedNodes(pipelineTempArr)
        })
      })
    },
    monitorFunc() {
      // cyclemonitor,realmoniter
      this.$store.dispatch('changeAction', 'run_platform')
      this.$router.push({ name: 'Realtmonitor', params: { activeTab: 'realmoniter' }})
    },
    // 验证是否增删单独模型的关联
    isRelateModelChange() {
      const modelArr = this.$refs.modelTreeRef.getCheckedNodes().map(item => item.id)
      return JSON.stringify(modelArr.sort((a, b) => a - b)) === JSON.stringify(this.aRelateModel.sort((a, b) => a - b))
    },
    // 验证是否增删单组合模型的关联
    isRelatePipelineChange() {
      const pipelineArr = this.$refs.pipelineTreeRef.getCheckedNodes().map(item => item.id)
      return JSON.stringify(pipelineArr.sort((a, b) => a - b)) === JSON.stringify(this.aRelatePipeline.sort((a, b) => a - b))
    },
    uploadFunc() {
      if (this.isRelateModelChange() && this.isRelatePipelineChange()) {
        this.dialogFormShow = false
        this.aRelateModel = []
        this.aRelatePipeline = []
        return
      }
      // 不同类行的模型分别放置
      const modelArr = []
      const pipelineArr = []
      this.$refs.modelTreeRef.getCheckedNodes().forEach(item => {
        modelArr.push(item.id)
      })
      this.$refs.pipelineTreeRef.getCheckedNodes().forEach(item => {
        pipelineArr.push(item.id)
      })
      this.listLoading = true
      this.dialogFormShow = false
      addRealTimeOriginModel(this.uploadId, { model_ids: modelArr, pipeline_ids: pipelineArr }).then(res => {
        this.$message({
          type: 'success',
          message: this.$t('labels.uploadSuccess'),
          duration: 1000
        })
        this.freshData()
      }).catch(res => {
        this.dialogFormShow = false
        this.listLoading = false
        this.$message.error(this.$t('labels.uploadFaild'))
      })
    },
    // 刷新数据
    freshData() {
      this.getRealTimeOrigin(this.listQuery.page)
    },
    // 重新获取页面的数据
    getNewData(done) {
      this.freshData()
      done()
    },
    // 删除实时数据
    deleteSource: debounce(function(node, status) {
      if (node.realproject) {
        this.$message.error(this.$t('labels.dfilemanage.model_error'))
        return
      }
      this.$confirm(this.$t('strings.dfilemanage.delete_file'), this.$t('labels.reminder'), confirm).then(() => {
        this.listLoading = true
        deleteRealTimeOrigin(node.id).then(res => {
          this.$message.success(this.$t('messages.delete_success'))
          if (this.listQuery.page !== 1 && this.listQuery.pageLength === 1) {
            this.handleCurrentChange(this.listQuery.page - 1)
          } else {
            this.handleCurrentChange(this.listQuery.page)
          }
        }).catch(e => {
          this.listLoading = false
          this.$message.error(this.$t('labels.deleteFaild'))
        })
      }).catch(() => {
        this.$message.info(this.$t('messages.cancel_operate'))
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
.app_container {
  padding: 0;
  .filter_header {
    border-bottom: 1px solid #f2f2f2;
    border-radius: 0;
    padding: 10px 0 30px 0;
    .filter-container {
      margin-left: 16px;
      .el-button {
        width: 80px;
        height: 36px;
        margin-top: 18px;
        border-radius: 14px;
        color: #fff;
        background-color: #3d65c9;
        &:hover {
          background-color: #6484d4;
        }
        &:active {
          background-color: #0f32b5;
        }
      }
      .add_realtime_origin {
        width: 100px;
      }
      .realtime_monitor {
        float: right;
        width: 110px;
        margin-right: 10%;
        background-color: #fff;
        color: #409EFF;
        // font-family: sy_normal;
        &:hover {
          background-color: #fff;
        }
        &:active {
          background-color: #fff;
        }
      }
    }
  }
  .main_container {
    margin-top: 0;
    padding: 0 26px!important;
    .noclick {
      color: #c0c4cc!important;
    }
    // /deep/ .el-table {
    //   .el-table__body-wrapper {
    //     .el-table__body {
    //       .el-table__row {
    //         .is-left {
    //           .cell {
    //             padding-right: 64px;
    //             .relate {
    //               &:hover {
    //                 color: #6484d4;
    //               }
    //               &:active {
    //                 color: #0f32b5;
    //               }
    //             }
    //           }
    //         }
    //       }
    //     }
    //   }
    // }
  }
  .addDialog {
    /deep/ .el-dialog {
      width: 484px;
      height: 424px;
      border-radius: 16px;
      padding: 28px 24px 24px 24px;
      .el-dialog__header {
        padding-top: 0;
        padding-left: 16px;
        border-bottom: 1px solid #e6e6e6;
        font-size: 18px;
        color: #4d4d4d;
        // font-family: sy_regular;
      }
      .el-dialog__body {
        margin-top: 24px;
        padding: 0 16px 0 16px;
        .el-form {
          .el-form-item {
            margin-bottom: 16px;
            .el-form-item__content {
              .el-select {
                margin-top: 0;
                width: 256px;
                .el-input {
                  .el-input__inner {
                    height: 32px;
                    width: 256px;
                    border-radius: 4px;
                  }
                  .el-input__suffix {
                    .el-input__suffix-inner {
                      .el-select__caret {
                        &::before {
                          content: '';
                          position: relative;
                          width: 0;
                          height: 0;
                          top: -10px;
                          border-left: 6px solid transparent;
                          border-right: 6px solid transparent;
                          border-bottom: 6px solid #4d4d4d;
                        }
                      }
                    }
                  }
                }
              }
            }
            .el-form-item__label {
              padding: 0;
            }
          }
          .schema_guid,.description {
            .el-form-item__label {
              padding-left: 10px;
            }
          }
          .file_uuid {
            .el-form-item__content {
              .upload-demo {
                .el-upload {
                  .el-button {
                    text-align: left;
                    background-color: #fff;
                    color: #409eff;
                  }
                }
              }
            }
          }
        }
      }
      .el-dialog__footer {
        margin-top: 8px;
        padding-top: 0;
        padding-right: 8px;
        .dialog-footer {
          .el-button {
            width: 80px;
            font-size: 15px;
            color: #fff;
            // font-family: sy_regular;
          }
          .cancel {
            background-color: #e6e6e6;
            color: #4d4d4d;
            &:hover {
              background-color: #efefef;
            }
            &:active {
              background-color: #ccc;
            }
          }
        }
      }
    }
  }
  .relate_model {
    /deep/ .el-dialog {
      .el-dialog__body {
        padding-top: 10px;
        .el-form  {
          .el-model,.el-pipeline {
            .el-tree {
              margin-top: 10px;
            }
          }
          .el-pipeline {
            margin-top: 10px;
          }
          .el-tree {
            .el-tree-node {
              .el-tree-node__content {
                .custom-tree-node {
                  width: 100%;
                  .el-name {
                    // display: inline-block;
                    margin-left: 10px;
                    // width: 200px;
                    // white-space: nowrap;
                    // text-overflow: ellipsis;
                    // overflow: hidden;
                  }
                  .el-type {
                    float: right;
                    margin-right: 10px;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
.drawerStyle {
  /deep/ .el-drawer__container {
    .el-drawer {
      width: 994px!important;
      .el-drawer__body {
        padding: 0 24px;
        .header_action {
          border-bottom: 1px solid #ebeef5;
          h3 {
            font-size: 18px;
            color: #808080;
            // font-family: sy_regular;
            margin: 0;
            padding: 18px 0;
          }
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
        /deep/ .el-table {
          padding: 0 8px;
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
                    .el-button {
                      width: 48px;
                      height: 28px;
                      padding: 0!important;
                      border-radius: 12px;
                      border: 1px solid #6484d4;
                      background-color: #fff;
                      text-align: center;
                      font-size: 14px;
                      margin-top: 8px;
                      // font-family: sy_regular;
                      &:hover {
                        background-color: #ecf0fa;
                        // color: #4d4d4d;
                        color: #6484d4;
                      }
                      &:active {
                        border-color: #0f32b5;
                        background-color: #ecf0fa;
                        color: #0f32b5;
                      }
                    }
                    .delete {
                      border: 1px solid #dd6c7e;
                      &:hover {
                        border: 1px solid #dd6c7e;
                        background-color: #fcf5f7;
                        color: #dd6c7e;
                      }
                      &:active {
                        border: 1px solid #c60928;
                        background-color: #fcf5f7;
                        color: #c60928;
                      }
                    }
                  }
                }
                .is-center {
                  .cell {
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
  }
}
</style>
