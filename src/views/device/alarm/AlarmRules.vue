<!-- 故障代码功能主界面 -->
<template>
  <div class="app_container">
    <!-- 搜索 -->
    <el-header class="filter_header">
      <div class="filter-container">
        <div class="container">
          <el-input v-model="filter.rulename" :placeholder="$t('labels.alarm.rule_name')" suffix-icon="el-icon-search" class="new-input" style="width: 200px;" @change="handleFilter"/>
          <comp-select-rich
            v-model="filter.datamodel"
            :options="modelsData"
            :option-key="{ value: 'id', label: 'name' }"
            :combind-value="['id','type']"
            :filter-by="filterBy"
            :filterable="true"
            :clearable="true"
            :placeholder="$t('strings.alarm.select_model')"
            class="el-fault_device"
            @input="handleFilter"/>
          <el-select v-model="filter.isshow" :placeholder="$t('strings.alarm.select_status')" class="el-fault_device" filterable clearable @change="handleFilter">
            <el-option v-for="item in showStatus" :key="item.value" :label="item.label" :value="item.value"/>
          </el-select>
          <div class="header-btn">
            <el-button class="new-btn-other normal-btn" @click="restoreTable">{{ $t('buttons.reset') }}</el-button>
            <el-button class="new-btn-other long-btn" @click="openBatchUpdateDialog">{{ $t('buttons.batch_update') }}</el-button>
            <el-button class="new-btn-other long-btn delete-button" @click="openBatchDeleteDialog">{{ $t('buttons.batch_delete') }}</el-button>
          </div>
        </div>
        <!-- 创建新 -->
        <div class="header-btn_creat">
          <el-button icon="el-icon-plus" class="el-add_alarm" @click="openCreateRuleDialog">{{ textMap.created }}</el-button>
        </div>
      </div>
    </el-header>
    <!-- 列表 -->
    <el-main class="main_container">
      <el-table
        v-loading.body="isLoading"
        :data="alarmRuleTableData"
        :element-loading-text="$t('strings.loading')"
        fit
        highlight-current-row
        style="width: 100%;height:615px;overflow-y: auto;"
        @selection-change="handleSelectionChange">
        <el-table-column :selectable="checkbox_select" align="center" type="selection"/>
        <el-table-column :label="$t('labels.alarm.rule_name')" show-overflow-tooltip fixed prop="name"/>
        <el-table-column :label="$t('labels.desc')" show-overflow-tooltip prop="description"/>
        <el-table-column :label="$t('labels.alarm.data_model')" show-overflow-tooltip prop="model.name"/>
        <el-table-column :label="$t('labels.alarm.alarm_rule')" :formatter="alarmruleFormatter" show-overflow-tooltip prop="conditions"/>
        <el-table-column :label="$t('labels.alarm.error_code')" show-overflow-tooltip prop="fault_code.code"/>
        <el-table-column :label="$t('labels.create_time')" show-overflow-tooltip prop="create_time"/>
        <el-table-column :label="$t('labels.alarm.creator')" show-overflow-tooltip prop="creator.username"/>
        <el-table-column :label="$t('labels.alarm.is_show')" prop="closed" align="center">
          <template slot-scope="scope">
            <el-switch
              :active-value="false"
              :inactive-value="true"
              v-model="scope.row.closed"
              active-color="#0f32b5"
              inactive-color="#ccc"
              @change="changeAlarmRuleStatus(scope.$index,scope.row)"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.actions')" prop="is_active" align="center" width="260">
          <template slot-scope="scope">
            <div style="height: 36px;">
              <el-button class="new-btn-other" plain @click="openDetailDialog(scope.row)">{{ $t('buttons.detail') }}</el-button>
              <el-button v-if="currentUserId === scope.row.creator.id" class="new-btn-other" plain @click="openEditRuleDialog(scope.row)">{{ $t('buttons.edit') }}</el-button>
              <el-button v-if="currentUserId === scope.row.creator.id" type="danger" class="new-btn-other" plain @click="openDeleteDialog(scope.row.id)">{{ $t('buttons.delete') }}</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页器 -->
      <div class="pagination-container">
        <el-pagination
          :current-page="alarmRuleTablePage.current"
          :page-size="10"
          :total="alarmRuleTablePage.total"
          layout="total, prev, pager, next, jumper"
          @current-change="handleCurrentChange"/>
      </div>
    </el-main>
    <!-- 预览弹框 -->
    <el-dialog :title="textMap[dialogType]" :visible.sync="detailDialogFormVisible" :close-on-click-modal="false" class="new-dialog" width="400px">
      <table class="dialogDetail">
        <tr style="vertical-align:top"><td><label>{{ $t('labels.alarm.rule_name') }} : </label></td><td>{{ alarmRuleDetailData.name }}</td></tr>
        <tr style="vertical-align:top"><td><label>{{ $t('labels.alarm.rule_desc') }} : </label></td><td>{{ alarmRuleDetailData.description }}</td></tr>
        <tr style="vertical-align:top"><td><label>{{ $t('labels.create_time') }} : </label></td><td>{{ alarmRuleDetailData.create_time }}</td></tr>
        <tr style="vertical-align:top"><td><label>{{ $t('labels.alarm.data_model') }} : </label></td><td>{{ alarmRuleDetailData.data_model }}</td></tr>
        <tr style="vertical-align:top"><td><label>{{ $t('labels.alarm.error_code') }} : </label></td><td>{{ alarmRuleDetailData.error_code }}</td></tr>
        <tr style="vertical-align:top"><td><label>{{ $t('labels.alarm.alarm_rule') }} : </label></td><td><div style="white-space: pre-wrap;" v-html="setNewline(alarmRuleDetailData)"/></td></tr>
        <tr style="vertical-align:top"><td><label>{{ $t('labels.alarm.is_show') }} : </label></td><td>{{ alarmRuleDetailData.closed }}</td></tr>
      </table>
    </el-dialog>
    <!-- 新增或编辑弹框（弹框样表单输入） -->
    <el-dialog :title="textMap[dialogType]" :close-on-click-modal="false" :visible.sync="editDialogFormVisible" class="new-dialog" width="720px">
      <el-form ref="editAlarmRuleForm" :model="editAlarmRuleForm" :rules="rules" :inline="true" status-icon label-position="left" label-width="120px" class="ruleForm">
        <el-form-item :label="$t('labels.alarm.rule_name')" prop="name">
          <el-input v-model="editAlarmRuleForm.name" class="new-input" style="width: 340px"/>
        </el-form-item>
        <el-form-item :label="$t('labels.alarm.rule_desc')" prop="description">
          <el-input v-model="editAlarmRuleForm.description" type="textarea" class="new-input" style="width: 340px"/>
        </el-form-item>
        <el-form-item :label="$t('labels.alarm.data_model')" prop="model_obj">
          <comp-select-rich
            v-model="editAlarmRuleForm.model_obj"
            :options="modelsData"
            :option-key="{ value: 'id', label: 'name' }"
            :combind-value="['id','type']"
            :filter-by="filterBy"
            :filterable="true"
            :clearable="true"
            :placeholder="$t('strings.select')"
            class="new-input"
            style="width: 340px"
            @input="changeModelSelected"/>
        </el-form-item>
        <el-form-item :label="$t('labels.alarm.error_code')" prop="fault_code_id">
          <el-select v-model="editAlarmRuleForm.fault_code_id" :placeholder="$t('strings.select')" filterable clearable class="new-input" style="width: 340px" @change="$set(editAlarmRuleForm, editAlarmRuleForm.fault_code_id, $event)">
            <!-- @change="$set(editAlarmRuleForm, editAlarmRuleForm.fault_code_id, $event)"解决出现过的选中select后，界面没有变更的bug -->
            <!-- <el-option :value="nullvalue" :label="$t('strings.null')"/> -->
            <el-option v-for="item in alarmFaultCodesData" :key="item.value" :label="item.label" :value="item.value"/>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('labels.alarm.alarm_rule')" prop="mode">
          <el-radio-group v-model="editAlarmRuleForm.mode" @change="changeAlarmModeType">
            <el-radio-button label="common">{{ $t('strings.alarm.normal_mode') }}</el-radio-button>
            <el-radio-button label="expert">{{ $t('strings.alarm.expert_mode') }}</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <div v-if="editAlarmRuleForm.mode === 'common'">
          <el-form-item :label="$t('labels.alarm.normal_rules_list')">
            <el-button type="text" icon="el-icon-circle-plus-outline" @click="addCommonConditions">{{ $t("buttons.add") }}</el-button>
          </el-form-item>
          <div v-for="(eachrule, index) in editAlarmRuleForm.conditions" :key="index">
            <el-form-item :prop="'conditions.' + index + '.field'" :rules="{ required: true, message: $t('rules.required_select'), trigger: 'change' }" style="width: 180px">
              <el-select v-model="eachrule.field" :placeholder="$t('strings.select')" filterable class="new-input">
                <el-option v-for="item in modelFieldsData" :key="item.value" :label="item.label" :value="item.value"/>
              </el-select>
            </el-form-item>
            <el-form-item :prop="'conditions.' + index + '.operator'" :rules="{ required: true, message: $t('rules.required_select'), trigger: 'change' }" style="width: 90px">
              <el-select v-model="eachrule.operator" :placeholder="$t('strings.select')" filterable class="new-input">
                <el-option v-for="item in operatorOptions" :key="item.value" :label="item.label" :value="item.value"/>
              </el-select>
            </el-form-item>
            <el-form-item :prop="'conditions.' + index + '.object'" style="width: 110px">
              <el-select v-model="eachrule.object" :placeholder="$t('strings.select')" filterable class="new-input" @change="resetCommonOperator(index)">
                <el-option v-for="item in commonConditionOptionsType" :key="item.value" :label="item.label" :value="item.value"/>
              </el-select>
            </el-form-item>
            <el-form-item :prop="'conditions.' + index + '.value'" :rules="{ required: true, message: $t('rules.not_null') }" style="width: 180px">
              <el-input v-show="eachrule.object==='value'" v-model="eachrule.value" class="new-input"/>
              <el-select v-show="eachrule.object==='model_attribute'" v-model="eachrule.value" :placeholder="$t('strings.select')" filterable class="new-input">
                <el-option v-for="item in modelAttributesData" :key="item.key" :label="item.label" :value="item.value"/>
              </el-select>
              <el-select v-show="eachrule.object==='column_attribute'" v-model="eachrule.value" :placeholder="$t('strings.select')" filterable class="new-input">
                <el-option v-for="item in modelFieldsData" :key="item.value" :label="item.label" :value="item.value"/>
              </el-select>
            </el-form-item>
            <el-button slot="append" icon="el-icon-delete" @click.prevent="removeCommonConditions(index)"/>
          </div>
        </div>
        <div v-else-if="editAlarmRuleForm.mode === 'expert'">
          <el-form-item :label="$t('labels.alarm.normal_rules_list')">
            <el-button type="text" icon="el-icon-circle-plus-outline" @click="addExpertsConditions">{{ $t("buttons.add") }}</el-button>
          </el-form-item>
          <div v-for="(eachrule, index) in editAlarmRuleForm.params" :key="index">
            <el-form-item :prop="'params.' + index + '.name'" :rules="{ required: true, message: $t('rules.not_null') }" style="width: 80px">
              <el-input v-model="eachrule.name" class="new-input"/>
            </el-form-item>
            <el-form-item :prop="'params.' + index + '.object'" style="width: 110px">
              <el-select v-model="eachrule.object" :placeholder="$t('strings.select')" filterable class="new-input">
                <el-option v-for="item in expertConditionOptionsType" :key="item.value" :label="item.label" :value="item.value"/>
              </el-select>
            </el-form-item>
            <el-form-item :prop="'params.' + index + '.field'" :rules="{ required: true, message: $t('rules.not_null') }" style="width: 180px">
              <el-select v-show="eachrule.object==='model_attribute'" v-model="eachrule.field" :placeholder="$t('strings.select')" filterable class="new-input">
                <el-option v-for="item in modelAttributesData" :key="item.key" :label="item.label" :value="item.value"/>
              </el-select>
              <el-select v-show="eachrule.object==='column_attribute'" v-model="eachrule.field" :placeholder="$t('strings.select')" filterable class="new-input">
                <el-option v-for="item in modelFieldsData" :key="item.value" :label="item.label" :value="item.value"/>
              </el-select>
            </el-form-item>
            <el-button slot="append" icon="el-icon-delete" @click.prevent="removeExpertsConditions(index)" />
          </div>
          <comp-mavon-editor v-model="editAlarmRuleForm.function" :toolbars-flag="false" :subfield="false" :placeholder="$t('strings.alarm.custom_rule_editor')" style="min-height: 100px;"/>
        </div>
        <el-form-item :label="$t('labels.alarm.rule_status')">
          <el-switch :active-value="false" :inactive-value="true" v-model="editAlarmRuleForm.closed"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogFormVisible = false">{{ $t('buttons.cancel') }}</el-button>
        <el-button type="primary" @click="updateRuleData">{{ $t('buttons.submit') }}</el-button>
      </div>
    </el-dialog>
    <!-- 批量修改dialog -->
    <el-dialog :title="$t('buttons.batch_update')" :close-on-click-modal="false" :visible.sync="batchUpdateDialogFormVisible" class="new-dialog">
      <el-form :model="batchUpdateForm">
        <el-form-item :label="$t('labels.alarm.rule_status')">
          <el-switch :active-value="false" :inactive-value="true" v-model="batchUpdateForm.closed"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="batchUpdateDialogFormVisible = false">{{ $t('buttons.cancel') }}</el-button>
        <el-button type="primary" @click="batchUpdateRulesData">{{ $t('buttons.submit') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getAlarmRulesData, postAlarmRuleData, patchAlarmRuleData, deleteAlarmRuleData, getFaultCodesData, batchDeleteAlarmRules, batchUpdateAlarmRules } from '@/api/device/alarm'
import { validateInputName } from '@/utils/rules'
import { getAllModel, getAllPipelineModel } from '@/api/datamining/model'
import { getPipeline } from '@/api/experiment/pipelines'
import { newline } from '@/utils/index'
import { mavonEditor } from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'
import SelectRich from '@/components/SelectRich'

export default {
  name: 'AlarmRules',
  components: {
    'comp-mavon-editor': mavonEditor,
    'comp-select-rich': SelectRich
  },
  data() {
    const checkAlarmRuleByAPI = (rules, value, callback) => {
      if (!value) {
        callback(new Error(this.$t('rules.required')))
      } else {
        if (this.editAlarmRuleForm.name === value) {
          callback()
          return
        }
        getAlarmRulesData({ 'name': this.editAlarmRuleForm.name }).then(res => {
          if (res.data.count === 0) {
            callback()
          } else {
            callback(new Error(this.$t('rules.duplicate_name')))
            this.editAlarmRuleForm.name = ''
          }
        }).catch(error => {
          console.log('getAlarmRulesData error', error)
          callback()
        })
      }
    }
    return {
      currentUserId: this.$store.state.user.id,
      // 筛选条件
      filter: {
        rulename: '',
        datamodel: '',
        isshow: ''
      },
      modelsData: [], // 请求获得模型数据
      alarmFaultCodesData: [], // 请求获得故障代码数据
      modelFieldsData: [], // 监控字段 or 列属性
      modelAttributesData: [], // 模型属性
      isLoading: false,
      alarmRuleTableData: [],
      alarmRuleTablePage: {
        current: 1,
        total: 0
      },
      textMap: {
        created: this.$t('buttons.create') + this.$t('route.alarmRules'),
        update: this.$t('buttons.edit') + this.$t('route.alarmRules'),
        detail: this.$t('route.alarmRules') + this.$t('buttons.detail')
      },
      alarmRuleDetailData: { // 详情model
        name: '',
        description: '',
        create_time: '',
        data_model: '',
        error_code: '',
        mode: '',
        conditions: '',
        params: '',
        closed: 'false'
      },
      alarmRuleId: undefined,
      editAlarmRuleForm: {
        name: '',
        description: '',
        model_obj: '',
        fault_code_id: null,
        mode: 'common',
        conditions: [], // 普通模式的规则条目 or 专家模式的变量条目
        params: [],
        function: '', // 专家模式的自定义输出
        closed: 'false'
      },
      rules: {
        name: [
          { required: true, trigger: 'blur', validator: validateInputName },
          { required: true, validator: checkAlarmRuleByAPI, trigger: 'change' }
        ],
        model_obj: [
          { required: true, message: this.$t('rules.required_select'), trigger: 'change' }
        ]
      },
      showStatus: [
        // { label: this.$t('strings.alarm.all_select_status'), value: '' },
        { label: this.$t('labels.alarm.rule_start'), value: false },
        { label: this.$t('labels.alarm.rule_stop'), value: true }
      ],
      operatorOptions: [ // 操作符
        { label: '>', value: '>' },
        { label: '>=', value: '>=' },
        { label: '<', value: '<' },
        { label: '<=', value: '<=' },
        { label: '=', value: '=' },
        { label: 'in', value: 'in' },
        { label: 'not in', value: 'not in' }
      ],
      commonConditionOptionsType: [ // 普通模式条件参数的类型：值、模型属性、列属性
        { label: this.$t('labels.alarm.input_value'), value: 'value' },
        { label: this.$t('labels.alarm.model_prop'), value: 'model_attribute' },
        { label: this.$t('labels.alarm.column_prop'), value: 'column_attribute' }
      ],
      expertConditionOptionsType: [ // 专家模式变量条件参数的类型：模型属性；列属性
        { label: this.$t('labels.alarm.model_prop'), value: 'model_attribute' },
        { label: this.$t('labels.alarm.column_prop'), value: 'column_attribute' }
      ],
      dialogType: 'created',
      editDialogFormVisible: false,
      detailDialogFormVisible: false,
      batchUpdateDialogFormVisible: false,
      batchUpdateForm: {
        closed: 'false'
      },
      multipleSelection: [], // 批量选择
      // nullvalue: null
      filterBy: { key: 'type', value: [{ label: '单独模型', value: 'model' }, { label: '组合模型', value: 'pipeline' }], single: false }
    }
  },
  watch: {
    editDialogFormVisible(val) {
      if (val === false) {
        this.$refs['editAlarmRuleForm'].resetFields()
      }
    }
  },
  mounted() {
    this.initData()
  },
  methods: {
    // 获取数据
    initData(val) {
      this.getPageTable(1)
      //  model data
      getAllPipelineModel().then(res => {
        this.modelsData = res.data
      }).catch(error => {
        console.log('getAllPipelineModel', error)
      })
      //  faultcode data
      getFaultCodesData().then(res => {
        this.alarmFaultCodesData = res.data.data.map((item) => {
          return { 'label': item.name + '/' + item.code, 'value': item.id }
        })
      }).catch(error => {
        console.log('getFaultCodesData error', error)
      })
    },
    getPageTable(cpage) {
      this.isLoading = true
      const newFilter = {
        'fuzzy_name': this.filter.rulename,
        'closed': this.filter.isshow,
        'page': cpage
      }
      newFilter[this.filter.datamodel.type + '_id'] = this.filter.datamodel.id
      getAlarmRulesData(newFilter).then(res => {
        this.alarmRuleTableData = res.data.data
        this.alarmRuleTablePage.total = res.data.count
        this.isLoading = false
      }).catch(error => {
        console.log('getAlarmRulesData', error)
        this.isLoading = false
      })
    },
    // 分页器操作
    handleCurrentChange(val) {
      this.alarmRuleTablePage.current = val
      this.getPageTable(val)
    },
    // 搜索
    handleFilter(val) {
      // console.log('handleFilter', this.filter.rulename, this.filter.datamodel, this.filter.isshow)
      this.getPageTable(1)
    },
    // 筛选条件复位
    restoreTable() {
      this.filter.rulename = ''
      this.filter.datamodel = ''
      this.filter.isshow = ''
      this.getPageTable(1)
    },
    resetCommonOperator(index) {
      // 普通模式，监控条件中operator操作修改，value值需要清空
      this.editAlarmRuleForm.conditions[index].value = ''
    },
    alarmruleFormatter(row, column) {
      if (row.mode === 'expert') {
        return this.expertFormatter(row, column)
      } else {
        return this.commonFormatter(row, column)
      }
    },
    commonFormatter(row, column) {
      if (row.conditions) {
        const rulestring = Object.values(JSON.parse(row.conditions)).map(item => item.field + ' ' + item.operator + ' ' + item.value)
        return rulestring.join(',')
      } else {
        return ''
      }
    },
    expertFormatter(row, column) {
      if (row.params) {
        const rulestring = Object.values(JSON.parse(row.params)).map((item) => {
          if (item.object === 'value') {
            return item.name
          } else {
            return item.name + '=' + item.field
          }
        })
        rulestring.push(row.function)
        return rulestring.join(',')
      } else {
        return ''
      }
    },
    // 新增或编辑告警规则时，选中管理模型，根据管理模型动态更新modelFieldsData（监控字段/列属性）
    setModelDatas(model_data) {
      this.modelFieldsData = []
      if (Object.prototype.hasOwnProperty.call(model_data, 'columns_list_json') && model_data.columns_list_json.length !== 0) {
        this.modelFieldsData = model_data.columns_list_json.map((item) => {
          let show_name = item.name
          if (item.zname) {
            show_name = item.zname
          }
          return { 'value': item.name, 'label': show_name, 'type': item.type }
        })
      }
      this.modelAttributesData = []
      if (Object.prototype.hasOwnProperty.call(model_data, 'attributes') && model_data.attributes.length !== 0) {
        const modelAttrs = model_data.attributes[0] // TODO: pipeline模式的可能有多个attrs, 但1.9.0只考虑单数据集，同原来的model_attributes格式（单模型只有一个，取[0]没有问题）
        for (const model_attr_key in modelAttrs) {
          if (model_attr_key !== 'influenceFields') {
            this.modelAttributesData.push({ 'value': JSON.stringify(modelAttrs[model_attr_key]), 'label': model_attr_key, 'key': model_attr_key })
          }
        }
      }
    },
    getModelColumnData(model) {
      if (model.type === 'model') {
        getAllModel(undefined, model.id).then(res => {
          this.setModelDatas(res.data)
        }).catch(error => {
          console.log('getAllModel', error)
        })
      } else if (model.type === 'pipeline') {
        getPipeline(model.id).then(res => {
          this.setModelDatas(res.data)
        }).catch(error => {
          console.log('getPipeline', error)
        })
      }
    },
    // 修改选择的模型，将执行更新模型参数，已设置的规则信息清空
    changeModelSelected() {
      this.getModelColumnData(this.editAlarmRuleForm.model_obj)
      // 切换了关联模型，已定义的告警规则将清空（告警规则根据模型属性定义）
      this.editAlarmRuleForm.function = ''
      this.editAlarmRuleForm.mode = 'common'
      this.changeAlarmModeType()
    },
    // 新增或编辑告警规则时，切换普通模式或专家模式
    changeAlarmModeType() {
      this.$refs['editAlarmRuleForm'].clearValidate() // 取消已显示的验证规则
      // this.alarmRuleForm.alarm_rule = []
      if (this.editAlarmRuleForm.mode === 'common') {
        this.editAlarmRuleForm.conditions = []
        this.editAlarmRuleForm.conditions = [{
          field: '', // 监控字段
          operator: '', // 操作符
          object: 'value', // 比较项的类型：value值；model_attribute是模型属性；column_attribute是列属性
          value: '' // 比较项的值
        }]
      } else {
        this.editAlarmRuleForm.params = []
        this.editAlarmRuleForm.params = [{
          name: 'x0',
          object: 'model_attribute', // 比较项的类型：model_attribute是模型属性；column_attribute是列属性
          field: '' // 比较项的值
        }]
      }
    },
    openDetailDialog(row) {
      this.dialogType = 'detail'
      this.detailDialogFormVisible = true
      this.alarmRuleDetailData.name = row.name
      this.alarmRuleDetailData.description = row.description
      this.alarmRuleDetailData.create_time = row.create_time
      if (row.model !== null) {
        this.alarmRuleDetailData.data_model = row.model.name
      } else {
        this.alarmRuleDetailData.data_model = this.$t('strings.alarm.missing_model')
      }
      this.alarmRuleDetailData.error_code = ''
      if (row.fault_code !== null) {
        this.alarmRuleDetailData.error_code = row.fault_code.code
      }
      this.alarmRuleDetailData.mode = row.mode
      if (row.mode === 'common') {
        this.alarmRuleDetailData.conditions = this.commonFormatter(row)
      } else {
        this.alarmRuleDetailData.params = this.expertFormatter(row)
      }
      this.alarmRuleDetailData.closed = this.$t('buttons.open')
      if (row.closed === true) {
        this.alarmRuleDetailData.closed = this.$t('buttons.close')
      }
    },
    // 展示添加表单弹框
    openCreateRuleDialog() {
      this.dialogType = 'created'
      this.editDialogFormVisible = true
      this.$nextTick(function() {
        this.$refs['editAlarmRuleForm'].resetFields()
        // this.alarmRuleForm.id = -1
        this.editAlarmRuleForm.closed = false
        this.editAlarmRuleForm.mode = 'common'
        this.editAlarmRuleForm.conditions = [{
          field: '',
          operator: '',
          object: 'value',
          value: ''
        }]
        this.editAlarmRuleForm.function = ''
        this.modelFieldsData = []
        this.modelAttributesData = []
      })
    },
    // 展示编辑表单弹框
    openEditRuleDialog(row) {
      this.dialogType = 'update'
      this.editDialogFormVisible = true
      this.$nextTick(function() {
        this.$refs['editAlarmRuleForm'].resetFields()
        // var rowData = Object.assign({}, row)
        const rowData = { ...row }
        if (rowData.mode === 'common') {
          rowData.conditions = JSON.parse(rowData.conditions)
        } else {
          rowData.params = JSON.parse(rowData.params)
        }
        this.editAlarmRuleForm = rowData
        this.editAlarmRuleForm.model_obj = {
          id: rowData.model.id,
          name: rowData.model.name,
          type: rowData.model.type,
          __combind_key__: rowData.model.id + '_' + rowData.model.type
        }
        if (rowData.fault_code === null) {
          this.editAlarmRuleForm.fault_code_id = null
        } else {
          this.editAlarmRuleForm.fault_code_id = rowData.fault_code.id
        }
        this.alarmRuleId = row.id
        this.getModelColumnData(this.editAlarmRuleForm.model_obj)
      })
    },
    // 添加或编辑的上传操作
    updateRuleData() {
      this.$refs['editAlarmRuleForm'].validate(valid => {
        if (valid) {
          // const tempData = Object.assign({}, this.editAlarmRuleForm)
          const tempData = { ...this.editAlarmRuleForm }
          // model or pipeline
          tempData.type = this.editAlarmRuleForm.model_obj.type
          tempData.model_id = this.editAlarmRuleForm.model_obj.id
          // tempData.is_show = Number(this.editAlarmRuleForm.is_show)
          if (tempData.mode === 'common') {
            tempData.conditions = JSON.stringify(this.editAlarmRuleForm.conditions)
            tempData.params = null
          } else {
            tempData.params = JSON.stringify(this.editAlarmRuleForm.params)
            tempData.conditions = null
          }
          if (this.dialogType === 'created') {
            postAlarmRuleData(tempData).then(res => {
              // this.getPageTable(parseInt(this.alarmRuleTablePage.total / 10) + 1)
              this.getPageTable(1)
              this.editDialogFormVisible = false
            }).catch(error => {
              this.$message({
                type: 'error',
                message: error.message,
                duration: 2000
              })
            })
          } else {
            patchAlarmRuleData(this.alarmRuleId, tempData).then(res => {
              this.getPageTable(this.alarmRuleTablePage.current)
              this.editDialogFormVisible = false
            }).catch(error => {
              this.$message({
                type: 'error',
                message: error.message,
                duration: 2000
              })
            })
          }
        }
      })
    },
    // table上快捷更新启用状态
    changeAlarmRuleStatus(idx, row) {
      // var rowData = Object.assign({}, row)
      const rowData = { ...row }
      rowData.type = rowData.model.type // model or pipeline
      rowData.model_id = rowData.model.id
      // delete rowData['model']
      if (rowData.fault_code === null) {
        rowData.fault_code_id = null
      } else {
        rowData.fault_code_id = rowData.fault_code.id
      }
      patchAlarmRuleData(row.id, rowData).then(res => {
        this.getPageTable(this.alarmRuleTablePage.current)
      }).catch(error => {
        console.log('patchAlarmRuleData error', error)
      })
    },
    // 删除的上传操作
    openDeleteDialog(rowid) {
      this.$confirm(this.$t('strings.alarm.delete_alarmrule'), this.$t('labels.reminder'), confirm).then(() => {
        deleteAlarmRuleData(rowid).then(res => {
          if (res.status === 204) {
            this.$message({
              type: 'success',
              message: this.$t('messages.delete_success'),
              duration: 2000
            })
            this.getPageTable(1) // 删除操作后，暂且返回第一页数据
          } else {
            this.$message({
              type: 'error',
              message: this.$t('messages.delete_failed'),
              duration: 2000
            })
          }
        })
      }).catch(() => {
        this.$message.info(this.$t('messages.cancel_operate'))
      })
    },
    // 动态增加普通模式的规则条件条目
    addCommonConditions() {
      this.editAlarmRuleForm.conditions.push({
        field: '',
        operator: '',
        object: 'value',
        value: ''
      })
    },
    // 动态删除普通模式的规则条件条目
    removeCommonConditions(index) {
      if (this.editAlarmRuleForm.conditions.length === 1) { // 不可以全部删除，至少保留一个
        return
      }
      this.editAlarmRuleForm.conditions.splice(index, 1)
    },
    // 动态增加专家模式的规则条件变量
    addExpertsConditions() {
      this.editAlarmRuleForm.params.push({
        name: 'x' + this.editAlarmRuleForm.params.length,
        object: 'model_attribute',
        field: ''
      })
    },
    // 动态删除专家模式的规则条件变量
    removeExpertsConditions(index) {
      if (this.editAlarmRuleForm.params.length === 1) { // 不可以全部删除，至少保留一个
        return
      }
      this.editAlarmRuleForm.params.splice(index, 1)
    },
    // 根据符号分行
    setNewline: function(content) {
      let contentvalue = ''
      if (content.mode === 'common') {
        contentvalue = content.conditions
      } else {
        contentvalue = content.params
      }
      return newline(contentvalue, ',')
    },
    // 批量更新
    openBatchUpdateDialog() {
      if (this.getBatchSelectByType('id').length !== 0) {
        this.batchUpdateDialogFormVisible = true
      } else {
        this.$message({
          type: 'warning',
          message: this.$t('messages.none_batch'),
          duration: 2000
        })
      }
    },
    batchUpdateRulesData() {
      this.batchUpdateDialogFormVisible = false
      const ids = this.getBatchSelectByType('id').join(',')
      // console.log('batchUpdateRulesData', this.batchUpdateForm.closed)
      batchUpdateAlarmRules({
        'model_type': 'alterrule',
        'id': ids }, { 'closed': this.batchUpdateForm.closed }).then(res => {
        if (res.status === 200) {
          this.getPageTable(this.alarmRuleTablePage.current)
          this.$message({
            type: 'success',
            message: this.$t('messages.batch_update_success'),
            duration: 2000
          })
        } else {
          this.$message({
            type: 'error',
            message: this.$t('messages.batch_update_failed'),
            duration: 2000
          })
        }
      }).catch(error => {
        console.log('batchUpdateAlarmRules error', error)
      })
    },
    // 批量删除
    openBatchDeleteDialog() {
      if (this.getBatchSelectByType('id').length !== 0) {
        this.$confirm(this.$t('strings.alarm.batch_delete_alarmrule'), this.$t('labels.reminder'), confirm).then(() => {
          const ids = this.getBatchSelectByType('id').join(',')
          batchDeleteAlarmRules({
            'model_type': 'alterrule',
            'id': ids }).then(res => {
            if (res.status === 200) {
              this.getPageTable(1)
              this.$message({
                type: 'success',
                message: this.$t('messages.batch_delete_success'),
                duration: 2000
              })
            } else {
              this.$message({
                type: 'error',
                message: this.$t('messages.batch_delete_failed'),
                duration: 2000
              })
            }
          }).catch(error => {
            console.log('batchDeleteAlarmRules error', error)
          })
        }).catch(() => {
          this.$message.info(this.$t('messages.cancel_operate'))
        })
      } else {
        this.$message({
          type: 'warning',
          message: this.$t('messages.none_batch'),
          duration: 2000
        })
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    // 获取批量选中结果中的某一项值集合
    getBatchSelectByType(ctype) {
      const batchList = this.multipleSelection.map(item => item[ctype])
      return batchList
    },
    // 列表多选，只有在是当前登录用户创建的记录下，才可以选中，执行批量操作
    checkbox_select(row, index) {
      if (this.currentUserId === row.creator.id) {
        return 1
      } else {
        return 0
      }
    }
  }
}

</script>
<style rel="stylesheet/scss" lang="scss" scoped>
@import "src/assets/styles/new-base.scss";
.app_container {
  padding: 16px;
  .filter_header{
    .filter-container {
      display: flex;
      .container {
        flex: 1;
      }
      .header-btn{
        display:inline-block;
        margin-right: 10px;
        margin-left: 10px;
        .long-btn{
          width: 95px;
        }
        .normal-btn{
          width: 70px;
        }
      }
      .header-btn_creat {
        width: 145px;
      }
    }
  }
}
.new-btn-other {
  margin-top: 4px;
}
.dialogDetail{
  border-collapse:separate;
  border-spacing:0px 15px;
  padding-left: 30px;
  padding-right: 20px;
  label {
    display: inline-block;
    width: 100px;
    text-align: left;
    margin-right: 15px;
  }
}
.app_container {
  /deep/ .filter_header {
    .filter-container {
      .el-select {
         width: 192px;
         margin-right: 0;
        .el-input {
          .el-input__inner {
            width: 192px;
          }
          .el-input__suffix {
            right: 5px;
            .el-input__suffix-inner {
              .el-select__caret  {
                display: inline-block!important;
              }
              .el-icon-arrow-up:before{
                content:"\e78f";
                font-size: 20px;
              }
              // .el-icon-circle-close:before{
              //   content: "\e79d";
              // }
              &::after {
                display: none;
              }
            }
          }
        }
      }
    }
  }
}
</style>

