<template>
  <div style="padding: 0 18px;margin-top: 10px;">
    <el-table
      v-loading="listLoading"
      id="ppp"
      key="aTable"
      :data="dataList"
      :default-sort = "{prop: 'name', order: 'ascending'}"
      highlight-current-row
      fit
      style="width: 100%;height: 615px;overflow-y: auto;"
      @sort-change="handleSortChange">
      <!-- <el-table-column align="center" type="index" width="65"/> -->
      <el-table-column :label="$t('labels.id')" fixed="left" align="left" width="80%">
        <template slot-scope="scope">
          <span>{{ (page - 1)*10 + scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('labels.faultmanage.fault_device')" show-overflow-tooltip fixed="left" align="left">
        <template slot-scope="scope">
          <span>{{ scope.row.content.device.name }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('labels.faultmanage.fault_model')" show-overflow-tooltip align="left" min-width="200%">
        <template slot-scope="scope">
          <span>{{ scope.row.content.model.name }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('labels.faultmanage.rule_code')" show-overflow-tooltip align="left" min-width="250%">
        <template slot-scope="scope">
          <span v-if="!scope.row.content.alert_rule.name && !scope.row.content.alert_rule.fault_code.code && !scope.row.content.alert_rule.fault_code.name">{{ $t('strings.faultmanage.rule_deleted') }}</span>
          <div v-else>
            <span>{{ scope.row.content.alert_rule.name }}</span>
            <span>({{ scope.row.content.alert_rule.fault_code.code }}</span>
            <span>{{ scope.row.content.alert_rule.fault_code.name }})</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('labels.faultmanage.error_time')" align="left" min-width="170%" show-overflow-tooltip>
        <template slot-scope="scope">
          <span>{{ scope.row.content.faulted_at }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('labels.faultmanage.fault_status')" align="left" min-width="100%" show-overflow-tooltip>
        <template slot-scope="scope">
          <i :class="colorMap[scope.row.content.state]" />
          <span>{{ stateMap[scope.row.content.state] }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('labels.actions')" align="left" min-width="270%">
        <template slot-scope="scope">
          <div style="height: 36px">
            <el-button @click="checkDetail(scope.row)">{{ $t('buttons.detail') }}</el-button>
            <el-button style="margin-left: 16px;" @click="handleFault(scope.row)">{{ $t('buttons.handle') }}</el-button>
            <!-- <el-button v-is-show="{name:'faultdetail'}" type="text" @click="handleDownload(scope.row)">{{ $t('buttons.download') }}</el-button> -->
            <!-- <el-button v-is-show="{name:'faultdetail'}" type="text" @click="handleClose(scope.row)">{{ $t('buttons.close') }}</el-button> -->
            <el-button class="report" style="margin-left: 16px; width: 80px;" @click="handleSelectReport(scope.row)">分析报告</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <!-- 详情 -->
    <el-dialog :close-on-click-modal="false" :visible.sync="dialogdetailVisible" :title="$t('labels.faultmanage.fault_detail')" class="fault_detail" width="736px" label-width="80px">
      <div class="scoll_container">
        <div class="message_container">
          <div class="top_title">{{ $t('labels.faultmanage.fault_message') }}</div>
          <div class="label_box">
            <el-row class="first_line">
              <el-col :span="12"><div><label>{{ $t('labels.faultmanage.fault_device') }}:</label>{{ detailData.content.device.name }}</div></el-col>
              <el-col :span="12"><div><label>{{ $t('labels.faultmanage.fault_model') }}:</label>{{ detailData.content.model.name }}</div></el-col>
            </el-row>
            <el-row class="second_line">
              <el-col :span="12"><div><label>{{ $t('labels.faultmanage.error_time') }}:</label>{{ detailData.content.faulted_at }}</div></el-col>
              <el-col :span="12"><div><label>{{ $t('labels.faultmanage.fault_status') }}:</label>{{ stateMap[detailData.content.state] }}</div></el-col>
            </el-row>
            <!-- <el-row class="third_line">
              <el-col :span="24">
                <div>
                  <el-row>
                    <el-col :span="3"><label>{{ $t('labels.faultmanage.error_summary') }}:</label></el-col>
                    <el-col :span="21" class="explanation"><div>xxx</div></el-col>
                  </el-row>
                </div>
              </el-col>
            </el-row> -->
          </div>
        </div>
        <!-- 未处理 -->
        <div v-if="detailData.content.state === 'unprocessed' || detailData.content.state === 'processing'" class="diagnosis_container">
          <div class="top_title">{{ $t('labels.faultmanage.fault_diagnosis') }}</div>
          <div class="label_box">
            <!-- <div class="padding_style"><label>{{ $t('labels.faultmanage.warning_message') }}:</label>{{ detailData.content.alert_rule.conditions[0].field + detailData.content.alert_rule.conditions[0].operator + detailData.content.alert_rule.conditions[0].value }}</div> -->
            <!-- <div class="padding_style"><label>{{ $t('labels.faultmanage.warning_message') }}:</label>
              <span>{{ detailData.content.alert_rule.conditions[0].field }}</span>
              <span style="margin-left: 5px; margin-right: 5px;">{{ detailData.content.alert_rule.conditions[0].operator }}</span>
              <span>{{ detailData.content.alert_rule.conditions[0].value }}</span>
            </div> -->
            <div class="padding_style"><label>{{ $t('labels.faultmanage.warning_message') }}:</label>
              <span>{{ alarmruleFormatter }}</span>
            </div>
            <div class="padding_style"><label>{{ $t('labels.faultmanage.alert_rule') }}:</label>{{ detailData.content.alert_rule.name }}</div>
            <div class="padding_style">
              <label>{{ $t('labels.faultmanage.fault_code') }}:</label>
              <span>{{ detailData.content.alert_rule.fault_code.code }}</span>
              <span>{{ detailData.content.alert_rule.fault_code.name }}</span>
            </div>
            <div class="padding_style">
              <el-row>
                <el-col :span="3"><label>{{ $t('labels.faultmanage.fault_reason') }}:</label></el-col>
                <el-col :span="21" class="more"><div>{{ detailData.content.alert_rule.fault_code.reason }}</div></el-col>
              </el-row>
            </div>
            <div class="padding_style">
              <el-row>
                <el-col :span="3"><label>{{ $t('labels.faultmanage.handel_trip') }}:</label></el-col>
                <el-col :span="21" class="more"><div>{{ detailData.content.alert_rule.fault_code.opinion }}</div></el-col>
              </el-row>
            </div>
            <div class="padding_style">
              <el-row>
                <el-col :span="3"><label>{{ $t('labels.faultmanage.run_trip') }}:</label></el-col>
                <el-col :span="21" class="more"><div>xxx</div></el-col>
              </el-row>
            </div>
          </div>
        </div>
        <!-- 已处理 -->
        <div v-if="detailData.content.state === 'processed'">
          <div class="diagnosis_container">
            <div class="top_title">{{ $t('labels.faultmanage.fault_diagnosis') }}</div>
            <div class="processed_style label_box">
              <div class="padding_style"><label>{{ $t('labels.faultmanage.warning_message') }}:</label>
                <span>{{ alarmruleFormatter }}</span>
              </div>
              <div class="padding_style"><label>{{ $t('labels.faultmanage.alert_rule') }}:</label>{{ detailData.content.alert_rule.name }}</div>
              <div class="padding_style"><label>{{ $t('labels.faultmanage.fault_code') }}:</label>{{ detailData.content.alert_rule.fault_code.code }}</div>
            </div>
          </div>
          <div class="diagnosis_container">
            <div class="top_title">{{ $t('labels.faultmanage.handle_record') }}</div>
            <div class="processed_style label_box">
              <div class="padding_style"><label>{{ $t('labels.faultmanage.handler') }}:</label>{{ detailData.content.handler.name }}</div>
              <div class="padding_style"><label>{{ $t('labels.faultmanage.handle_at') }}:</label>{{ detailData.content.handled_at }}</div>
              <div class="padding_style">
                <label>{{ $t('labels.faultmanage.actual_code') }}:</label>
                <span>{{ detailData.content.actual_fault.code }}</span>
                <span>{{ detailData.content.actual_fault.name }}</span>
              </div>
              <!-- <div class="padding_style"><label>{{ $t('labels.faultmanage.fault_reason') }}:</label>{{ detailData.content.actual_fault.reason }}</div> -->
              <!-- <div class="padding_style"><label>{{ $t('labels.faultmanage.handle_method') }}:</label>{{ detailData.content.actual_fault.opinion }}</div> -->
              <div class="padding_style">
                <el-row>
                  <el-col :span="3"><label>{{ $t('labels.faultmanage.fault_reason') }}:</label></el-col>
                  <el-col :span="21" class="more"><div>{{ detailData.content.alert_rule.fault_code.reason }}</div></el-col>
                </el-row>
              </div>
              <div class="padding_style">
                <el-row>
                  <el-col :span="3"><label>{{ $t('labels.faultmanage.handel_trip') }}:</label></el-col>
                  <el-col :span="21" class="more"><div>{{ detailData.content.actual_fault.opinion }}</div></el-col>
                </el-row>
              </div>
            </div>
          </div>
        </div>
        <!-- 无故障 -->
        <div v-if="detailData.content.state === 'fault_free'">
          <div class="diagnosis_container">
            <div class="top_title">{{ $t('labels.faultmanage.fault_diagnosis') }}</div>
            <div class="label_box">
              <div class="padding_style"><label>{{ $t('labels.faultmanage.warning_message') }}:</label>
                <span>{{ alarmruleFormatter }}</span>
              </div>
              <div class="padding_style"><label>{{ $t('labels.faultmanage.alert_rule') }}:</label>{{ detailData.content.alert_rule.name }}</div>
              <div class="padding_style"><label>{{ $t('labels.faultmanage.fault_code') }}:</label>{{ detailData.content.alert_rule.fault_code.code }}</div>
            </div>
          </div>
          <div class="diagnosis_container">
            <div class="top_title">{{ $t('labels.faultmanage.handle_record') }}</div>
            <div class="label_box">
              <div class="padding_style"><label>{{ $t('labels.faultmanage.handler') }}:</label>{{ detailData.content.handler.name }}</div>
              <div class="padding_style"><label>{{ $t('labels.faultmanage.handle_at') }}:</label>{{ detailData.content.handled_at }}</div>
              <!-- <div class="padding_style"><label>{{ $t('labels.faultmanage.explain') }}:</label>xxx</div> -->
              <div class="padding_style">
                <el-row>
                  <el-col :span="3"><label>{{ $t('labels.faultmanage.handel_trip') }}:</label></el-col>
                  <el-col :span="21" class="more"><div>xxx</div></el-col>
                </el-row>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
    <!-- 故障处理 -->
    <el-dialog :close-on-click-modal="false" :title="$t('labels.faultmanage.fault_handle')" :visible.sync="dialoghandleVisible" width="440px" class="handle_dialog">
      <div class="handel_box">
        <el-form ref="handleForm" :model="handleForm" :rules="rules" label-width="100px" label-position="left">
          <el-form-item :label="$t('labels.faultmanage.handler')" prop="handler">
            <el-input v-model="handleForm.handler" :disabled="true" width="30%"/>
          </el-form-item>
          <el-form-item :label="$t('labels.faultmanage.fault_status')" prop="state">
            <el-select v-model="handleForm.state" :placeholder="$t('labels.select')" @change="handleSelect">
              <el-option
                v-for="(item, index) in statusArr"
                :key="index"
                :label="item.value"
                :value="item.status"/>
            </el-select>
          </el-form-item>
          <el-form-item v-if="otherShow==='fault_free'" :label="$t('labels.faultmanage.explain')" prop="explanation">
            <el-input :autosize="{ minrows: 2, maxrows: 4 }" v-model="handleForm.explanation" type="textarea"/>
          </el-form-item>
          <el-form-item v-if="otherShow==='processed'" :label="$t('labels.faultmanage.releate_fault_code')" :disabled="true" prop="releate_code">
            <el-input v-model="handleForm.releate_code" :disabled="true"/>
          </el-form-item>
          <el-form-item v-if="otherShow==='processed'" :label="$t('labels.faultmanage.actual_fault_code')" prop="actual_fault_code_id">
            <el-select v-model="handleForm.actual_fault_code_id" @change="handleAlarmSelect">
              <el-option
                v-for="(item, index) in alarmArr"
                :key="index"
                :label="item.name"
                :value="item.id"/>
            </el-select>
          </el-form-item>
          <el-form-item v-if="otherShow==='processed'" :label="$t('labels.faultmanage.fault_reason')" prop="actual_fault_reason">
            <el-input :row="4" v-model="handleForm.actual_fault_reason" type="textarea"/>
          </el-form-item>
          <el-form-item v-if="otherShow==='processed'" :label="$t('labels.faultmanage.handle_method')" prop="actual_fault_opinion">
            <el-input :row="4" v-model="handleForm.actual_fault_opinion" type="textarea"/>
          </el-form-item>
          <el-form-item v-if="otherShow==='processed'" :label="$t('labels.faultmanage.run_trip')" prop="run_trip">
            <el-input :row="4" v-model="handleForm.run_trip" type="textarea"/>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer" style="margin-top: -10px">
        <el-button class="cancel" @click="dialoghandleVisible = false">{{ $t('labels.cancel') }}</el-button>
        <el-button class="confirm" @click="handelUpdate">{{ $t('labels.confirm') }}</el-button>
      </div>
    </el-dialog>
    <el-dialog :close-on-click-modal="false" :visible.sync="templateSelectDialogVisible" title="选择报告模板" width="440px" label-width="80px" class="report_template">
      <div class="handel_box">
        <el-select v-model="template" placeholder="请选择">
          <el-option v-for="(item,key) in templateList" :key="key" :label="item.label" :value="item.value"/>
        </el-select>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button class="cancel" @click="templateSelectDialogVisible = false">{{ $t('buttons.cancel') }}</el-button>
        <el-button class="confirm" @click="handleShowReport">{{ $t('buttons.confirm') }}</el-button>
      </div>
    </el-dialog>
    <!-- 故障报告导出 -->
    <!-- <el-dialog :title="$t('labels.faultmanage.handle_download')" :visible.sync="dialogdownloadVisible" width="595px">
      <el-form ref="downloadForm" v-model="downloadForm" label-width="80px">
        <el-form-item :label="$t('labels.faultmanage.report_name')" prop="report_name">
          <el-input v-model="downloadForm.report_name" style="width: 50%;"/>
        </el-form-item>
        <el-form-item :label="$t('labels.faultmanage.fault_device')" prop="fault_device">
          <el-input v-model="downloadForm.fault_device" :disabled="true" style="width: 50%;"/>
        </el-form-item>
        <el-form-item :label="$t('labels.faultmanage.fault_model')" prop="fault_model">
          <el-input v-model="downloadForm.fault_model" :disabled="true" style="width: 50%;"/>
        </el-form-item>
        <el-form-item :label="$t('labels.faultmanage.fault_model')" prop="fault_model">
          <el-input v-model="downloadForm.fault_model" :disabled="true" style="width: 50%;"/>
        </el-form-item>
        <el-form-item :label="$t('labels.faultmanage.compare_model')" prop="compare_model">
          <el-select v-model="handleForm.fault_status" :placeholder="$t('labels.select')" multiple @change="handleSelect">
            <el-option
              v-for="(item, index) in modelArr"
              :key="index"
              :label="item.value"
              :value="item.value"/>
          </el-select>
        </el-form-item>
        <div class="transferBox">
          <p class="transfer-title">选择监测字段</p>
          <el-transfer
            v-model="downloadForm.monitor_key"
            :data="data"
            :titles="['可选字段', '已选字段']"
            :button-texts="['删除<<', '添加>>']"
            :left-default-checked="[1]"
            :format="{
              noChecked: '${total}',
              hasChecked: '${checked}/${total}'
            }"
            filterable
            style="text-align: left; display: inline-block;"
            @change="handleChange"/>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer" style="margin-top: -10px">
        <el-button @click="dialogdownloadVisible = false">{{ $t('labels.cancel') }}</el-button>
        <el-button type="primary">{{ $t('labels.confirm') }}</el-button>
      </div>
    </el-dialog> -->
  </div>

</template>
<script>
import { handelFaultData } from '@/api/device/fault'
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
    alarmArr: {
      type: Array,
      default: null
    },
    templateData: {
      type: Number,
      default: 0
    },
    templateList: {
      type: Array,
      default: null
    },
    page: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      // el-table的 :height="" 根据界面设置表格高度，如果要直接使用定值height:"500"
      tableHeight: window.innerHeight - 200,
      infoTableTitle: [],
      infoDataTable: [],
      dialogdetailVisible: false,
      dialoghandleVisible: false,
      dialogdownloadVisible: false,
      handleForm: {
        handler: '',
        state: '未处理',
        actual_fault_reason: '',
        actual_fault_opinion: '',
        actual_fault_code_id: '',
        releate_code: '',
        explanation: '',
        run_trip: ''
      },
      alarmCodeId: '',
      stateMap: {
        unprocessed: this.$t('strings.faultmanage.unprocessed'),
        processing: this.$t('strings.faultmanage.processing'),
        processed: this.$t('strings.faultmanage.processed'),
        fault_free: this.$t('strings.faultmanage.fault_free')
      },
      colorMap: {
        unprocessed: 'unprocessed',
        processing: 'processing',
        processed: 'processed',
        fault_free: 'fault_free'
      },
      statusArr: [
        { status: 'unprocessed', value: '未处理' },
        { status: 'processing', value: '处理中' },
        { status: 'processed', value: '已处理' },
        { status: 'fault_free', value: '无故障' }
      ],
      downloadForm: {
        report_name: '',
        fault_device: '',
        fault_model: '',
        compare_model: '',
        monitor_key: []
      },
      handelId: '',
      modelArr: [],
      otherShow: false,
      deviceData: [],
      detailData: {
        content: {
          device: { id: '', name: '' },
          model: { id: '', name: '' },
          faulted_at: '',
          state: '',
          alert_rule: { id: '', name: '', fault_code: { id: '', code: '' }},
          handler: { id: '', username: '', name: '' },
          handled_at: '',
          actual_fault: { id: '', code: '', reason: '', opinion: '' },
          explanation: ''
        }
      },
      fault_table_row: null,
      templateSelectDialogVisible: false, // 选择模板
      template: '', // 模板,
      rules: {
        actual_fault_code_id: [{ required: true, trigger: 'change', message: this.$t('labels.choose') }]
      },
      alarmruleFormatter: ''
    }
  },
  watch: {
    templateData: function(val) {
      this.template = val
    }
  },
  created() {
    this.template = this.templateData === 0 ? '' : this.templateData
  },
  methods: {
    handleChange(val) {
    },
    // 故障状态的选择
    handleSelect(val) {
      if (val === 'processed') {
        this.otherShow = 'processed'
      } else if (val === 'fault_free') {
        this.otherShow = 'fault_free'
      } else {
        this.otherShow = ''
      }
    },
    // 故障代码的选择
    handleAlarmSelect(val) {
      this.alarmCodeId = val
      this.alarmArr.forEach(item => {
        if (item.id === val) {
          this.handleForm.actual_fault_code_id = item.name
          this.handleForm.actual_fault_reason = item.reason
          this.handleForm.actual_fault_opinion = item.opinion
        }
      })
    },
    commonFormatter(row) {
      var rulestring = []
      for (const v of Object.values(row.conditions)) {
        rulestring.push(`${v.field} ${v.operator} ${v.value}`)
      }
      return rulestring.join(',')
    },
    expertFormatter(row) {
      var rulestring = []
      for (const v of Object.values(row.params)) {
        if (v.object === 'value') {
          rulestring.push(v.name)
        } else {
          rulestring.push(`${v.name}=${v.field}`)
        }
      }
      rulestring.push(row.function)
      return rulestring.join(',')
    },
    // 点击列表项按钮查看详情
    checkDetail(row) {
      this.dialogdetailVisible = true
      this.detailData = row
      if (row.content.alert_rule.conditions.length !== 0) {
        this.alarmruleFormatter = this.commonFormatter(row.content.alert_rule)
      } else if (row.content.alert_rule.params !== 0) {
        // 专家模式
        this.alarmruleFormatter = this.expertFormatter(row.content.alert_rule)
      }
      // console.log('table cell info object', row)
      // // 此方法方便显示多行tablebody的解析
      // this.infoTableTitle = row.attributes.details_menu.split(',')
      // var selectedRowInfoBodyArr = row.attributes.details_value.split(',')
      // var selectedRowInfoArr = []
      // var bodyArr = []
      // for (let i = 0; i < selectedRowInfoBodyArr.length; i++) {
      //   var cellValue = { value: selectedRowInfoBodyArr[i] }
      //   bodyArr.push(cellValue)
      // }
      // var newlist = { list: bodyArr }
      // selectedRowInfoArr.push(newlist)
      // this.infoDataTable = selectedRowInfoArr
      // console.log('infoTable', selectedRowInfoArr)
    },
    // 排序
    handleSortChange(val) {
    },
    // 处理
    handleFault(val) {
      this.dialoghandleVisible = true
      this.clearForm()
      this.handelId = val.id
      this.handleForm.releate_code = val.content.alert_rule.fault_code.code
      this.handleForm.actual_fault_code_id = val.content.alert_rule.fault_code.code
      this.handleForm.actual_fault_reason = val.content.alert_rule.fault_code.reason
      this.handleForm.actual_fault_opinion = val.content.alert_rule.fault_code.opinion
      this.handleForm.handler = this.$store.state.user.name
    },
    handelUpdate(row) {
      this.$confirm(this.$t('strings.faultmanage.handle_confirm'), this.$t('labels.reminder'), confirm).then(() => {
        this.dialoghandleVisible = false
        this.$emit('loading', true)
        this.handleForm.handler = this.$store.state.user.id
        this.handleForm.actual_fault_code_id = this.alarmCodeId
        handelFaultData(this.handelId, this.handleForm).then(res => {
          this.$emit('freshData', false)
          this.$message.success(this.$t('messages.handle_success'))
        }).catch(() => {
          this.$emit('freshData', false)
          this.$message.error(this.$t('messages.handle_faild'))
        })
      }).catch(() => {
        this.$message.info(this.$t('messages.cancel_operate'))
      })
    },
    // 清空
    clearForm() {
      this.$nextTick(() => {
        this.$refs['handleForm'].resetFields()
        this.otherShow = ''
      })
    },
    // 下载
    handleDownload(val) {
      this.dialogdownloadVisible = true
    },
    // 关闭
    handleClose(val) {
      this.$confirm(this.$t('labels.faultmanage.close_message'), this.$t('labels.reminder'), confirm).then(() => {

      }).catch(() => {
        this.$message.info(this.$t('labels.faultmanage.handel_cancel'))
      })
    },
    // TODO: 选择模板，查看故障报告
    handleSelectReport(val) {
      this.fault_table_row = val.id
      this.template = this.templateData === 0 ? '' : this.templateData
      this.templateSelectDialogVisible = true
      // this.$router.push({ path: '/templateConfig/basepreview', query: { faultdata: this.fault_table_row, contentjson: this.templateData }})
      // this.$router.push({ name: 'ReportBasePreview', params: { faultdata: this.fault_table_row, contentjson: this.templateData }})
      // var routeData = this.$router.resolve({
      //   name: 'ReportBasePreview',
      //   params: { faultdata: this.fault_table_row, contentjson: this.templateData }
      // })
      // window.open(routeData.href, '_blank')
    },
    handleShowReport() {
      if (!this.template) {
        this.$message.error(this.$t('messages.choose_mould'))
        return
      }
      console.log('handelShowReport', this.template, this.fault_table_row)
      this.templateSelectDialogVisible = false
      // TODO: params方式无效
      const { href } = this.$router.resolve({
        name: 'FaultReportView',
        // name: 'FaultReport', // TODO: 可保存修改的预览
        query: {
          fault: JSON.stringify(this.fault_table_row),
          template: this.template
        }
      })
      window.open(href, '_blank')
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
@import "src/assets/styles/new-base.scss";
.unprocessed{
  background-color: #dd6c7e;
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.processing{
  background-color: #6484d4;
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.processed{
  background-color: #57bb7f;
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.fault_free{
  background-color: #f2d527;
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.fault_detail {
  /deep/ .el-dialog {
    padding: 40px 28px 24px 28px;
    border-radius: 16px;
    margin-top: 60px!important;
    /deep/ .el-dialog__header {
      border-bottom: 1px solid #e6e6e6;
      padding: 0 0 12px 20px;
      span {
        color: #1e1e1e;
        font-size: 18px;
        font-weight: 600;
      }
    }
    /deep/ .el-dialog__body {
      padding: 0;
      .scoll_container {
        height: 488px;
        overflow: auto;
        .message_container {
          .top_title {
            padding: 12px 20px 12px 20px;
            color: #333;
            font-size: 16px;
            border-bottom: 1px solid #e6e6e6;
            font-weight: 600;
          }
          .label_box {
            padding: 12px 20px 24px 20px;
            label {
              margin-right: 8px;
              font-weight: 600;
            }
            .first_line {
              padding-bottom: 8px;
            }
            .second_line {
              padding: 8px 0;
            }
            .third_line {
              padding-top: 8px;
              .explanation {
                margin-left: -10px;
                line-height: 20px;
              }
            }
          }
        }
        .diagnosis_container {
          .top_title {
            padding: 12px 20px 12px 20px;
            color: #333;
            font-size: 16px;
            border-bottom: 1px solid #e6e6e6;
            font-weight: 600;
          }
          .label_box {
            padding: 4px 20px 0 20px;
            .padding_style {
              padding: 8px 0;
              label {
                margin-right: 8px;
                font-weight: 600;
              }
              .more {
                margin-left: -10px;
                div {
                  line-height: 20px;
                }
              }
            }
          }
        }
      }
    }
  }
}
.handle_dialog {
  /deep/ .el-dialog {
    // height: 224px;
    margin-top: 60px!important;
    border-radius: 16px;
    padding: 24px 16px 32px 16px;
    .el-dialog__header {
      padding: 0  0 16px 8px;
      border-bottom: 1px solid #e6e6e6;
      .el-dialog__title {
        font-size: 18px;
        color: #333;
      }
    }
    .el-dialog__body {
      padding: 0;
      padding-top: 24px;
      padding-left: 20px;
      .handel_box {
        .el-form {
          .el-form-item {
            .el-form-item__label {
              font-size: 14px;
              color: #333;
              font-weight: 600;
            }
            .el-form-item__content {
              .el-input {
                .el-input__inner {
                  width: 256px;
                  height: 24px;
                  border: 1px solid #e6e6e6;
                  border-radius: 8px;
                  font-size: 13px;
                  color: #999;
                }
              }
              .el-select {
                .el-input {
                  .el-input__inner {
                    width: 256px;
                    height: 24px;
                    border: 1px solid #e6e6e6;
                    border-radius: 8px;
                    font-size: 13px;
                    color: #4d4d4d;
                  }
                  .el-input__suffix {
                    .el-input__suffix-inner {
                      .el-select__caret  {
                        display: none;
                      }
                      &::after {
                        content: '';
                        width: 0px;
                        height: 0px;
                        border-left: 5px solid transparent;
                        border-right: 5px solid transparent;
                        border-top: 5px solid #606266;
                        position: relative;
                        top: 10px;
                      }
                    }
                  }
                }
              }
              .el-textarea {
                .el-textarea__inner {
                  width: 256px;
                  height: 74px;
                  border: 1px solid #e6e6e6;
                  border-radius: 8px;
                  font-size: 13px;
                }
              }
            }
          }
        }
      }
    }
    .el-dialog__footer {
      padding: 24px 24px 0 24px;
      .el-button {
        width: 56px;
        height: 24px;
        border-radius: 8px;
        padding: 0;
        span {
          font-size: 13px;
        }
      }
      .confirm {
        color: #fff;
        background-color: #3d65c9;
        &:hover {
          background-color: #6484d4;
        }
        &:active {
          background-color: #0f32b5;
        }
      }
      .cancel {
        color: #4d4d4d;
        background-color: #e6e6e6;
        &:hover {
          background-color: #ebeff9;
          color: #4d4d4d;
        }
        &:active {
          color: #4d4d4d;
          background-color: #ebeff9;
        }
      }
    }
  }
}
.report_template {
  /deep/ .el-dialog {
    height: 224px;
    border-radius: 16px;
    padding: 24px 16px 32px 16px;
    .el-dialog__header {
      padding: 0  0 16px 8px;
      // border-bottom: 1px solid #e6e6e6;
      .el-dialog__title {
        font-size: 18px;
        color: #333;
      }
    }
    .el-dialog__body {
      padding: 0;
      padding-top: 24px;
      padding-left: 20px;
      overflow: hidden;
      .handel_box {
        .el-select {
          .el-input {
            .el-input__inner {
              width: 256px;
              height: 24px;
              border: 1px solid #e6e6e6;
              border-radius: 8px;
              font-size: 13px;
              color: #4d4d4d;
            }
            .el-input__suffix {
              .el-input__suffix-inner {
                .el-select__caret  {
                  display: none;
                }
                &::after {
                  content: '';
                  width: 0px;
                  height: 0px;
                  border-left: 5px solid transparent;
                  border-right: 5px solid transparent;
                  border-top: 5px solid #606266;
                  position: relative;
                  top: 15px;
                }
              }
            }
          }
        }
      }
    }
    .el-dialog__footer {
      padding: 24px 24px 0 24px;
      .el-button {
        width: 56px;
        height: 24px;
        border-radius: 8px;
        padding: 0;
        span {
          font-size: 13px;
        }
      }
      .confirm {
        color: #fff;
        background-color: #3d65c9;
        &:hover {
          background-color: #6484d4;
        }
        &:active {
          background-color: #0f32b5;
        }
      }
      .cancel {
        color: #4d4d4d;
        background-color: #e6e6e6;
        &:hover {
          background-color: #ebeff9;
          color: #4d4d4d;
        }
        &:active {
          color: #4d4d4d;
          background-color: #ebeff9;
        }
      }
    }
  }
}
.transferBox {
  margin-left: 10px;
  .transfer-title {
    text-align: right;
    vertical-align: middle;
    float: left;
    font-size: 14px;
    color: #606266;
    line-height: 40px;
    padding: 0 12px 0 0;
    box-sizing: border-box;
    font-weight: 700;
  }
}
</style>

