<template>
  <div v-loading="listLoading" :element-loading-text="$t('strings.loading')" class="app_container">
    <el-header class="filter_header" style="text-align: left; font-size: 12px; display: inline-table;">
      <div class="filter-container">
        <el-input :placeholder="$t('labels.modelmanage.model_name')" v-model="searchstr" class="el-fault_device" suffix-icon="el-icon-search" @change="handleFilter(searchstr)"/>
        <el-button type="primary" class="add_realtime_origin" @click="periodAdd">{{ $t('labels.period.add_period_data') }}</el-button>
        <el-button type="text" class="period_monitor" @click="handleMonitor">{{ $t('labels.period.period_monitor') }}</el-button>
      </div>
    </el-header>
    <el-main class="main_container">
      <div style="height: 630px;">
        <el-table
          :data="periodData"
          :highlight-current-row="false"
          fit
          style="width: 100%;height:615px;overflow-y: auto;"
          @cell-click="handleCell">
          <el-table-column :label="$t('labels.id')" fixed="left" align="left" width="84">
            <template slot-scope="scope">
              <span>{{ (listQuery.page - 1)*10 + scope.$index + 1 }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('labels.name')" show-overflow-tooltip fixed="left" align="left" width="184">
            <template slot-scope="scope">
              <span>{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('labels.desc')" show-overflow-tooltip align="left" min-width="224">
            <template slot-scope="scope">
              <span v-if="!scope.row.description">--</span>
              <span v-else>{{ scope.row.description }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('labels.period.period_flow')" align="left" width="94" show-overflow-tooltip>
            <template slot-scope="scope">
              <span :class="{ 'noclick': scope.row.streamings_count === 0, 'realproject': true }">{{ scope.row.streamings_count }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('labels.period.data_base')" align="left" width="184" show-overflow-tooltip>
            <template slot-scope="scope">
              <span>{{ scope.row.database_name }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('labels.period.data_sheet')" align="left" width="184" show-overflow-tooltip>
            <template slot-scope="scope">
              <span>{{ scope.row.table_name }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('labels.period.structure')" align="left" width="184" show-overflow-tooltip>
            <template slot-scope="scope">
              <span>{{ scope.row.schema.name }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('labels.period.add_time')" align="left" width="200" show-overflow-tooltip>
            <template slot-scope="scope">
              <span>{{ scope.row.created_at }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('labels.period.recent_update')" align="left" width="200" show-overflow-tooltip>
            <template slot-scope="scope">
              <span>{{ scope.row.updated_at }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('labels.period.creator')" align="left" min-width="150" show-overflow-tooltip>
            <template slot-scope="scope">
              <span>{{ scope.row.creator.username }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('labels.actions')" align="left" class-name="small-padding fixed-width" width="184">
            <template slot-scope="scope">
              <div style="height: 36px">
                <el-button class="relate" style="width: 80px;" @click="periodFlowAdd(scope.row)">{{ $t('labels.period.add_period_flow') }}</el-button>
                <el-button class="delete" style="margin-left: 16px;" @click="deleteDialogFunc(scope.row)">{{ $t('labels.delete') }}</el-button>
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
    <el-dialog :visible.sync="dialogFormShow" :close-on-click-modal="false" :title="$t('labels.modelmanage.module')" :v-loading="moduleFormLoading" width="408px">
      <el-form ref="groupForm" status-icon label-width="100px" class="ruleForm" style="margin-left:30px;">
        <el-tree
          ref="permTreeRef"
          :data="allmodel"
          :expand-on-click-node="true"
          show-checkbox
          node-key="id"
          default-expand-all>
          <span slot-scope="{ node, data }" class="custom-tree-node">
            <span>
              <span class="mgl-10" >{{ data.model_name }}</span>
            </span>
          </span>
        </el-tree>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormShow = false">{{ $t('buttons.cancel') }}</el-button>
        <el-button :loading="moduleFormLoading" type="primary" @click="uploadFunc" >{{ $t('buttons.confirm') }}</el-button>
      </div>
    </el-dialog>
    <!-- 添加周期数据 -->
    <el-dialog
      :visible.sync="dialogHiveVisible"
      :close-on-click-modal="false"
      :title="$t('labels.period.add_period_data')"
      class="addDialog"
      @close="clearField">
      <el-form ref="hiveForm" :model="hiveFile" :rules="rules" label-position="left">
        <el-form-item :label="$t('strings.dataAbout.name')" label-width="80px" prop="name">
          <el-input v-model="hiveFile.name" class="new-input" auto-complete="off"/>
        </el-form-item>
        <el-form-item :label="$t('strings.dataAbout.desc')" prop="description" label-width="80px" class="description">
          <el-input :autosize="{ minRows: 2, maxRows: 4}" v-model="hiveFile.description" type="textarea" placeholder="Please input" class="new-input" style="width: 100%"/>
        </el-form-item>
        <el-form-item :label="$t('strings.dataAbout.data_base_name')" prop="database_name" label-width="80px">
          <el-select v-model="hiveFile.database_name" :placeholder="$t('labels.choose')" class="new-input" @change="choseData(hiveFile.database_name)">
            <el-option
              v-for="(item, index) in dbSelect"
              :key="index"
              :label="item.name"
              :value="item.name"/>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('strings.dataAbout.data_table_name')" prop="table_name" label-width="80px">
          <el-select v-model="hiveFile.table_name" :loading="hiveLoading" :placeholder="$t('labels.choose')" class="new-input" @change="choseDataFile(hiveFile.table_name)">
            <el-option
              v-for="(item, index) in tableSelect"
              :key="index"
              :label="item.name"
              :value="item.name"/>
          </el-select>
        </el-form-item>
        <!-- class="schema_guid" -->
        <el-form-item :label="$t('strings.dataAbout.table_structor')" prop="schema_id" label-width="80px">
          <el-select v-model="hiveFile.schema_id" :placeholder="$t('labels.choose')" class="new-input" @change="choseStructure(hiveFile)">
            <el-option
              v-for="(item, index) in tempMetaData"
              :key="index"
              :label="item.name"
              :value="item.id"/>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogHiveVisible = false">{{ $t('buttons.cancel') }}</el-button>
        <el-button type="primary" @click="periodPut">{{ $t('buttons.confirm') }}</el-button>
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
      class="drawerStyle"
      direction="rtl">
      <div class="header_action">
        <h3>{{ $t('strings.dataAbout.period_flow') }}</h3>
        <!-- <el-button type="text" class="freshFlow" @click="getFlowData(currentFlowId)">刷新</el-button> -->
      </div>
      <el-table
        :data="flowData"
        :default-sort = "{prop: 'date', order: 'descending'}"
        fit
        highlight-current-row
        style="height:600px;overflow-y: auto;">
        <el-table-column :label="$t('labels.period.task_name')" align="left" width="166" show-overflow-tooltip>
          <template slot-scope="scope">
            <span>{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.period.model_name')" align="left" width="166" show-overflow-tooltip>
          <template slot-scope="scope">
            <span>{{ scope.row.models.name }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.period.operate_cycle')" show-overflow-tooltip align="left" width="148">
          <template slot-scope="scope">
            <span v-if="scope.row.periodic_type === 'day'">{{ `${workPeriod[scope.row.periodic_type]} ${scope.row.run_at}` }}</span>
            <span v-if="scope.row.periodic_type === 'week'">{{ `${workPeriod[scope.row.periodic_type]} ${scope.row.periodStr} ${scope.row.run_at}` }}</span>
            <span v-if="scope.row.periodic_type === 'month'">{{ `${workPeriod[scope.row.periodic_type]} ${scope.row.periodStr} ${scope.row.run_at}` }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.period.data_capture_region')" align="left" width="154" show-overflow-tooltip>
          <template slot-scope="scope">
            <span>{{ scope.row.is_total? $t('labels.period.is_total_capture') : $t('labels.period.is_increasement_capture') }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.period.operate_state')" align="center" width="144">
          <template slot-scope="scope">
            <span class="work_num">{{ `${scope.row.run_state.success}/${scope.row.run_state.total}` }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.period.enable')" align="left" width="104">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.is_enabled"
              active-color="#0f32b5"
              inactive-color="#ccc"
              @change="disableFlow(scope.row)"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.actions')" align="left" class-name="small-padding fixed-width" width="80">
          <template slot-scope="scope">
            <div class="delete_btn" @mousemove="showSvg(scope.$index)" @mouseout="hideSvg(scope.$index)" @click="deleteDialogDrawerFunc(scope.row, scope.$index)" >
              <span>
                <svg-icon icon-class="delete_d" class="defaultS" />
                <svg-icon icon-class="delete_h" class="hoverS" />
                <svg-icon icon-class="delete_c" class="clickS" />
              </span>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-drawer>
    <!-- 添加周期流 -->
    <el-dialog
      :visible.sync="dialogPeriodVisible"
      :close-on-click-modal="false"
      :class="{ 'dialog-width': periodFlowLength }"
      class="new-dialog"
      @opened="openDialogFunc"
      @close="closeDialogFunc">
      <AddPeriodFlow
        ref="addperiodflow"
        :all-model="modelData"
        :add-id="currentId"
        :count="watchCount"
        :current-period="addPeriodFlowData"
        @fresh="freshData"
        @loading="loadingFunc"
        @changeState="changeSubmitState"
        @periodLengthChange="changePeriodLength"
        @dialogOperation="changeDialogStatus"/>
    </el-dialog>
    <!-- 周期数据删除的弹窗 -->
    <el-dialog
      :visible.sync="deletePeriodDataVisible"
      :close-on-click-modal="false"
      class="deletePeriodData">
      <div class="top">
        <svg-icon class="warn_mark" icon-class="warn_mark"/>
        <span class="title">{{ $t('strings.remind') }}</span>
      </div>
      <div class="content">{{ deleteDialogContent[deletePeriodState] }}</div>
      <div v-if="deletePeriodState === 'periodFlow'" class="delete_warning">{{ deleteDialogContent.warning }}</div>
      <div slot="footer" class="dialog-footer">
        <el-button class="cancel" @click="deletePeriodDataVisible = false">{{ $t('buttons.cancel') }}</el-button>
        <el-button v-if="deletePeriodState === 'periodData'" class="confirm" type="primary" @click="deleteSource(deleteObj)">{{ $t('buttons.confirm') }}</el-button>
        <el-button v-else class="confirm" type="primary" @click="deletePeriodFlowData(deleteObj.row, deleteObj.index)">{{ $t('buttons.confirm') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { getSchemaName, getDataFile, getDataBase, getOneSchema, getSchemaById } from '@/api/datamining/historydata'
import { getPeriodData, addPeriodData, deletePeriodData, searchPeriodData, getPeriodDataFlow } from '@/api/datamining/period/periodDataUrl'
import { getPeriodFlowList, banPeriodFlow, deletePeriodFlow, runPeriodFlow } from '@/api/datamining/period/periodListUrl'
import rules from '@/utils/rules'
import AddPeriodFlow from './component/addperiodflow'
import debounce from 'lodash/debounce'

import {
  addRealTimeOrigin,
  realTimeOriginHaveModel,
  addRealTimeOriginModel,
  startRealTimeFlow,
  prohibitRealTimeFlow,
  restartRealTimeFlow,
  deleteRealTimeFlow
} from '@/api/datamining/real/realorigin'
import { getAllUsersModel } from '@/api/datamining/model'
export default {
  name: 'PeriodData',
  components: {
    AddPeriodFlow
  },
  data() {
    // 添加周期数据
    const validateStructor = (rule, value, callback) => {
      if (!value) {
        callback(new Error(this.$t('strings.dataAbout.choose_table_structor')))
        return
      }
      this.validatePromise.then(val => {
        console.log(this.schemaStr1, '我是分割线', this.schemaStr2)
        if (this.schemaStr1 !== this.schemaStr2) {
          callback(new Error(this.$t('strings.dataAbout.table_structor_error')))
        } else {
          // this.tempObj.schema = this.tempArr
          callback()
        }
      })
    }
    //
    //
    //
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
      periodData: [],
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
      //
      //
      //
      //
      // 添加周期数据
      dialogHiveVisible: false,
      hiveFile: {
        name: '', // 文件名
        description: '', // 描述
        private: false,
        type: 'hive',
        database_name: '',
        table_name: '',
        schema_id: ''
        // schema: ''
      },
      hiveLoading: false,
      tableSelect: [],
      tempMetaData: [],
      rules: {
        name: rules.project_zname,
        file_uuid: [{ required: true, trigger: 'change', message: this.$t('strings.dataAbout.choose_file') }],
        schema_id: [{ required: true, trigger: 'change', validator: validateStructor }],
        isheader: rules.isheader,
        encoding: rules.encoding,
        private: rules.isprivate,
        type: [{ required: true, trigger: 'blur', message: this.$t('strings.dataAbout.input_name') }],
        database_name: [{ required: true, trigger: 'change', message: this.$t('strings.dataAbout.choose_database_name') }],
        table_name: [{ required: true, trigger: 'change', message: this.$t('strings.dataAbout.choose_table_name') }]
      },
      dbSelect: [],
      dialogPeriodVisible: false,
      structorState: false,
      // 通过库名表明获取的schema
      schemaStr1: '',
      // 通过schemaid获取的schema
      schemaStr2: '',
      data: [
        {
          id: 1,
          name: 1,
          description: 33,
          table_name: 22,
          database_name: 777,
          create_at: 22,
          schema: {
            name: 12
          }
        }
      ],
      modelData: [],
      currentId: '',
      watchCount: 0,
      currentFlowId: '',
      workPeriod: {
        day: this.$t('strings.flowAbout.everyday'),
        week: this.$t('strings.flowAbout.everyweek'),
        month: this.$t('strings.flowAbout.everymonth'),
        year: this.$t('strings.flowAbout.everyquarter')
      },
      validatePromise: null,
      periodFlowLength: 0,
      // 删除周期数据
      deletePeriodDataVisible: false,
      deleteObj: null,
      addPeriodFlowData: null,
      num_week: {
        0: this.$t('strings.flowAbout.day'),
        1: this.$t('strings.flowAbout.one'),
        2: this.$t('strings.flowAbout.two'),
        3: this.$t('strings.flowAbout.three'),
        4: this.$t('strings.flowAbout.four'),
        5: this.$t('strings.flowAbout.five'),
        6: this.$t('strings.flowAbout.six')
      },
      deletePeriodState: 'periodData',
      deleteDialogContent: {
        periodData: this.$t('strings.flowAbout.delete_message'),
        periodFlow: this.$t('strings.flowAbout.delete_period_message'),
        warning: this.$t('strings.flowAbout.warning')
      },
      submitState: false,
      tempObj: {}
      // tempArr: []
    }
  },
  created() {
    this.getperiodtabledata()
    // 添加周期数据
    this.getTheDataOfOrigin()
    this.dataOfHive()
    this.getModelList()
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
    // 获取周期数据
    getperiodtabledata(p) {
      this.searchstr = ''
      this.searchStatus = false
      const page = p || 1
      this.listQuery.page = page
      this.listLoading = true
      getPeriodData({ page }).then(res => {
        this.listLoading = false
        this.periodData = res.data.results
        this.listQuery.pageLength = this.periodData.length
        this.listQuery.total = res.data.count
      }).catch(() => {
        this.listLoading = false
        this.$message.error(this.$t('messages.get_faild'))
      })
    },
    // loading的加载
    loadingFunc(val) {
      this.listLoading = val
    },
    // 获取模型
    getModelList() {
      getAllUsersModel().then(res => {
        this.modelData = res.data
      })
    },
    // 获取周期流程
    getPeriodList() {
      getPeriodFlowList().then(res => {
        console.log(res)
      })
    },
    // 添加周期数据的操作console.log(23)
    periodAdd() {
      this.dialogHiveVisible = true
    },
    // 表结构的获取
    getTheDataOfOrigin() {
      getSchemaName().then(res => {
        this.tempMetaData = res.data
      })
    },
    // hive表中数据库的获取
    dataOfHive() {
      getDataBase().then(res => {
        this.dbSelect = res.data
      }).catch(e => {
        this.$message({
          type: 'error',
          message: this.$t('strings.dataAbout.database_get_faild'),
          duration: 1000
        })
      })
    },
    // 数据搜索时筛选出数据表的数据
    choseData(val) {
      this.hiveFile.table_name = ''
      this.hiveFile.schema_id = ''
      getDataFile(val).then(res => {
        this.tableSelect = res.data
      }).catch(() => {
        this.$message.error(this.$t('strings.dataAbout.table_get_faild'))
      })
    },
    // 数据表的内容改变时，提取出schemas
    choseDataFile(val) {
      this.hiveFile.schema_id = ''
      this.structorState = false
      this.schemaStr1 = ''
      let tempObj = []
      if (!val) return
      getOneSchema({ database_name: this.hiveFile.database_name, table_name: this.hiveFile.table_name }).then(res => {
        tempObj = res.data.schema || []
        tempObj.forEach(item => {
          this.schemaStr1 += item.type
        })
        this.structorState = true
      })
    },
    // 表结构选择时内容的提取
    choseStructure(form) {
      // 记录当前的表单
      this.tempObj = {}
      // 记录当前的schema
      // this.tempArr = []
      this.schemaStr2 = ''
      let ArrSchema = []
      // 记录下选取的表结构的schema，以及schema的type组成的字符串
      this.validatePromise = new Promise((resolve, reject) => {
        getSchemaById(form.schema_id).then(res => {
          ArrSchema = res.data.schema
          // this.tempArr = res.data.schema
          ArrSchema.forEach(item => {
            this.schemaStr2 += item.type
          })
          resolve(this.schemaStr2)
        })
      })
      // })
      this.tempObj = form
    },
    // 提交hive表单(此处即为添加数据)
    periodPut() {
      this.$refs['hiveForm'].validate(valid => {
        if (!valid) return
        this.listLoading = true
        addPeriodData(this.hiveFile).then(res => {
          this.$refs['hiveForm'].resetFields()
          this.dialogHiveVisible = false
          this.$message({
            type: 'success',
            message: this.$t('messages.add_success'),
            duration: 1000
          })
          this.listLoading = false
          this.getperiodtabledata(this.listQuery.page)
        }).catch(e => {
          this.listLoading = false
          // this.$refs['hiveForm'].resetFields()
          // this.dialogHiveVisible = false
          this.$message.error(e.message)
        })
      })
    },
    // 清空创建hive表的表单
    clearField() {
      this.dialogStatus = ''
      this.$refs['hiveForm'].resetFields()
      for (const key in this.hiveFile) {
        if (key !== 'private' && key !== 'type') {
          this.hiveFile[key] = ''
        }
      }
    },
    periodFlowAdd(val) {
      this.addPeriodFlowData = val
      this.listLoading = true
      this.watchCount++
      this.currentId = val.id
      this.dialogPeriodVisible = true
    },
    // 添加周期流弹窗关闭
    handlePeriodClose(val) {
      this.dialogPeriodVisible = val
    },
    changeDialogStatus(val) {
      this.dialogPeriodVisible = val
    },
    // 删除周期数据
    deleteDialogFunc(row) {
      if (row.streamings_count > 0) {
        this.$message.error(this.$t('strings.dataAbout.have_periodflow'))
        return
      }
      this.deletePeriodState = 'periodData'
      this.deleteObj = {}
      this.deletePeriodDataVisible = true
      this.deleteObj = row
    },
    deleteSource(row) {
      deletePeriodData(row.id).then(res => {
        this.deletePeriodDataVisible = false
        this.$message.success(this.$t('messages.delete_success'))
        if (this.listQuery.page !== 1 && this.listQuery.pageLength === 1) {
          this.handleCurrentChange(this.listQuery.page - 1)
        } else {
          this.handleCurrentChange(this.listQuery.page)
        }
      }).catch(e => {
        this.deletePeriodDataVisible = false
        this.$message.error(this.$t('messages.delete_failed'))
      })
    },
    // 重置表单
    beforeClose() {
      this.dialogTableVisible = false
      this.$refs['dataForm'].resetFields()
    },
    // 点击某一表格的事件,查看实时流程
    handleCell(row, column, event, cell) {
      if (!row.streamings_count) return
      if (event.getElementsByClassName('realproject').length) {
        this.table = true
        this.listLoading = true
        this.currentFlowId = row.id
        this.getFlowData(row.id)
      }
    },
    // 周期流程数据的获取
    getFlowData: debounce(function(id) {
      getPeriodDataFlow(id).then(res => {
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
        this.flowData = tempData
      }).catch((e) => {
        console.log(e)
        this.listLoading = false
        this.$message.error(this.$t('messages.get_faild'))
      })
    }, 500),
    // 禁用/启用周期流开关的操作
    disableFlow(row) {
      if (row.is_enabled) {
        runPeriodFlow(row.datasource.id, row.id).then(res => {})
      } else {
        banPeriodFlow(row.datasource.id, row.id).then(res => {})
      }
    },
    deleteDialogDrawerFunc(row, index) {
      this.deletePeriodState = 'periodFlow'
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
        this.deletePeriodDataVisible = false
        this.getperiodtabledata(this.listQuery.page)
        this.getFlowData(this.currentFlowId)
      })
    },
    // 打开添加周期流弹窗的操作
    openDialogFunc() {
      // this.$nextTick(() => {
      //   console.log(this.$refs['addperiodflow'].$refs['periodPutForm'])
      // })
    },
    // 关闭添加周期数据时对表单的操作
    closeDialogFunc() {
      this.$refs['addperiodflow'].$refs['periodPutForm'].clearValidate()
      this.$refs['addperiodflow'].$refs['periodPutForm'].resetFields()
      if (this.submitState) {
        this.submitState = false
        this.getperiodtabledata(this.listQuery.page)
      }
    },
    // 当没有实时流时，弹窗宽度变小
    changePeriodLength(val) {
      this.periodFlowLength = val
    },
    // 当周期流没成功执行时，页面不刷新
    changeSubmitState(val) {
      this.submitState = val
    },
    //
    //
    //
    //
    //
    //
    // 分页器切换
    handleCurrentChange(val) {
      this.listLoading = true
      this.listQuery.page = val
      if (this.searchStatus) {
        // 搜索的分页
        this.handleFilter(this.searchstr, val)
      } else {
        this.getperiodtabledata(val)
      }
    },
    // 搜索
    handleFilter: debounce(function(val, p) {
      if (!val) {
        this.getperiodtabledata()
        return
      }
      this.searchStatus = true
      const page = p || 1
      this.listQuery.page = page
      this.listLoading = true
      searchPeriodData({ q: val, page }).then(res => {
        this.listLoading = false
        this.periodData = res.data.results
        this.listQuery.total = res.data.count
        this.listQuery.pageLength = this.periodData.length
      }).catch(e => {
        console.log(e)
        this.listLoading = false
        this.$message.error(this.$t('messages.get_faild'))
      })
    }, 500),
    // 添加实时源
    // handleAdd() {
    //   this.dialogTableVisible = true
    //   this.getTheDataOfOrigin()
    // },
    // 数据源添加
    addOriginData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          this.listLoading = true
          this.dialogTableVisible = false
          addRealTimeOrigin(this.filed).then(res => {
            this.listLoading = false
            this.$refs['dataForm'].resetFields()
            if (res.status === 201) {
              this.$message.success(this.$t('messages.add_success'))
              this.getperiodtabledata()
            } else {
              this.$message.error(res.data.message)
              this.$refs['dataForm'].resetFields()
            }
          }).catch(error => {
            console.log(error)
            this.listLoading = false
            this.$refs['dataForm'].resetFields()
            this.dialogTableVisible = false
            this.$message({
              type: 'error',
              message: this.$t('messages.add_failed'),
              duration: 1000
            })
          })
        }
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
            this.$message.success(this.$t('messages.realtime.startSuccess'))
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
      this.$confirm(this.$t('messages.realtime.confirmDelete'), this.$t('labels.reminder'), {
        confirm: true,
        closeOnClickModal: false
      }).then(() => {
        this.listLoading = true
        const datasource_id = row.datasources.id
        deleteRealTimeFlow(row.datasources.id, row.models.id).then(res => {
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
    // 查看周期流监测
    handleMonitor() {
      // cyclemonitor,realmoniter
      this.$store.dispatch('changeAction', 'run_platform')
      this.$router.push({ name: 'Realtmonitor', params: { activeTab: 'cyclemonitor' }})
    },
    //
    //
    //
    //
    moduleFunc(val) {
      this.uploadId = val.id
      Promise.all([getAllUsersModel(), realTimeOriginHaveModel(this.uploadId)]).then(res => {
        this.dialogFormShow = true
        this.allmodel = res[0].data.data.map((item) => {
          return { id: item.id, model_name: item.name }
        })
        const tempArr = res[1].data.models_ids.map((item) => {
          return { id: Number(item) }
        })
        this.$nextTick(() => {
          this.$refs.permTreeRef.setCheckedNodes(tempArr)
        })
      })
    },
    uploadFunc() {
      const modelArr = this.$refs.permTreeRef.getCheckedNodes().map(item => item.id)
      // const modelStr = modelArr.join(',')
      this.listLoading = true
      this.dialogFormShow = false
      addRealTimeOriginModel(this.uploadId, { models_ids: modelArr }).then(res => {
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
      this.getperiodtabledata(this.listQuery.page)
    },
    // 重新获取页面的数据
    getNewData(done) {
      // this.freshData()
      done()
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
@import "src/assets/styles/new-base.scss";
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
  }
  .new-dialog {
    /deep/ .el-dialog {
      width: 540px;
      padding: 0px 24px 0px 24px;
      .el-dialog__header {
        padding: 0;
      }
      .el-dialog__body {
        padding: 0;
      }
    }
  }
  .dialog-width {
    /deep/ .el-dialog {
      min-width: 915px;
    }
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
                        position: relative;
                        top: -10px;
                        content: '';
                        width: 0;
                        height: 0;
                        border-left: 6px solid transparent;
                        border-right: 6px solid transparent;
                        border-bottom: 6px solid #4d4d4d;
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
        }
      }
      .el-dialog__footer {
        margin-top: 8px;
        padding-top: 0;
        padding-right: 8px;
        .dialog-footer {
          .el-button {
            // font-family: sy_regular;
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
          }
          border-bottom: 1px solid #ebeef5;
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
      }
    }
  }
}
</style>
