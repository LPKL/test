<!-- 条件筛选 -->
<template>
  <div class="filter-container">
    <div class="container">
      <el-input v-model="filterForm.fault_device" :placeholder="$t('strings.faultmanage.fault_device')" class="el-fault_device" suffix-icon="el-icon-search" @change="handleFilter"/>
      <el-select v-model="filterForm.state" :placeholder="$t('strings.faultmanage.fault_status')" @change="handleFilter">
        <el-option
          v-for="(item, index) in faultState"
          :key="index"
          :label="item.label"
          :value="item.value"/>
      </el-select>
      <!-- 时间过滤 -->
      <el-date-picker
        v-is-show="{name:'timemodel'}"
        v-model="fault_at"
        :picker-options="pickerOptions"
        :start-placeholder="$t('strings.start_time')"
        :end-placeholder="$t('strings.end_time')"
        :range-separator="$t('strings.to')"
        align="right"
        type="datetimerange"
        format="yyyy-MM-dd HH:mm"
        value-format="yyyy-MM-dd HH:mm:ss"
        @change="dateChange"/>
      <div class="search-reset" >
        <!-- <el-button v-is-show="{name:'faultsearch'}" class="search" @click="handleFilter">{{ $t('buttons.search') }}</el-button> -->
        <el-button v-is-show="{name:'faultreset'}" class="clear" @click="restoreTable">{{ $t('buttons.faultmanage.reset') }}</el-button>
        <!-- <el-button v-is-show="{name:'printpdf'}" type="primary" size="mini" @click="printReport">{{ $t('table.report') }}</el-button> -->
      </div>
    </div>
    <div class="select-template">
      <el-button class="outputPdf" type="primary" plain @click="showTemplateSelectDialog">{{ $t('strings.faultmanage.fault_report_download') }}</el-button>
    </div>
    <!-- <div class="print-report">
      <el-button type="primary" plain @click="printReport">{{ $t('buttons.faultmanage.report') }}</el-button>
    </div> -->
    <el-dialog :close-on-click-modal="false" :visible.sync="dialogFormVisible" :title="$t('strings.faultmanage.download_report')" width="40%">
      <el-form ref="ruleForm2" :model="form" :rules="rules" status-icon label-width="100px" label-position="right">
        <el-form-item :label="$t('labels.faultmanage.device')" prop="devicename">
          <el-select v-model="form.devicename" :placeholde="$t('strings.select')">
            <el-option
              v-for="item in dataDevice"
              :label="item.attributes.jz_zname"
              :key="item.id"
              :value="item.id"/>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('labels.faultmanage.error_type')" prop="faultType">
          <el-select v-model="form.faultType" :placeholde="$t('strings.select')">
            <el-option :label="$t('labels.faultmanage.personalization_threshold')" value="个性化阈值"/>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('labels.faultmanage.time')" prop="time">
          <el-date-picker
            v-model="form.time"
            :picker-options="pickerOptions2"
            :start-placeholder="$t('strings.start_time')"
            :end-placeholder="$t('strings.end_time')"
            :range-separator="$t('strings.to')"
            type="datetimerange"
            value-format="yyyy-M-d HH:mm:ss"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{ $t('buttons.cancel') }}</el-button>
        <el-button type="primary" @click="downloadpdf">{{ $t('buttons.confirm') }}</el-button>
      </div>
    </el-dialog>
    <el-dialog :close-on-click-modal="false" :visible.sync="templateSelectDialogVisible" :title="$t('strings.faultmanage.report_title')" width="400px" label-width="80px" class="report_template">
      <div class="handel_box">
        <el-select v-model="template" :placeholder="$t('strings.select')" style="width:96%;" @change="templateChange">
          <el-option v-for="(item,key) in templateList" :key="key" :label="item.label" :value="item.value"/>
        </el-select>
        <el-dialog :visible.sync="templateSelectDialogVisibleInnerVisible" :title="previewTemplateName" append-to-body >
          <template-view v-show="previewTemplateJson!=={}" :templatedata="previewTemplateJson"/>
        </el-dialog>
      </div>
      <div slot="footer" class="dialog-footer" style="margin-top: -10px">
        <el-button type="success" @click="previewSelectedTemplate">{{ $t('buttons.preview') }}</el-button>
        <el-button @click="templateSelectDialogVisible = false">{{ $t('labels.cancel') }}</el-button>
        <el-button type="primary" @click="setDefaultReportTemplate">{{ $t('labels.confirm') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { getBaseURL } from '@/utils/index.js'
import { getTemplateId } from '@/api/report/template'
import templateView from '@/views/report/template/view'
export default {
  components: {
    'template-view': templateView
  },
  props: {
    // 所有设备
    dataDevice: {
      type: Array,
      default: null
    },
    templateList: {
      type: Array,
      default: null
    },
    faultState: {
      type: Array,
      default: () => {
        return [
          { label: this.$t('strings.faultmanage.unprocessed'), value: 'unprocessed' },
          { label: this.$t('strings.faultmanage.processing'), value: 'processing' }
        ]
      }
    }
  },
  data() {
    // 时间跨度太大会影响导出效率，此处约定一个最大时间范围
    const validateDataRange = (rules, value, callback) => {
      const temp = (new Date(value[1]).getTime() - new Date(value[0]).getTime()) / (24 * 3600000)
      if (temp > 22) {
        callback(new Error(this.$t('strings.faultmanage.date_max')))
      } else {
        callback()
      }
    }
    return {
      filterForm: {
        state: '',
        fault_device: '',
        fault_at_begin: '',
        fault_at_end: ''
      },
      fault_at: '',
      // 时间空间快捷操作
      pickerOptions: {
        shortcuts: [{
          text: this.$t('strings.faultmanage.latest_week'),
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: this.$t('strings.faultmanage.latest_one_month'),
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: this.$t('strings.faultmanage.latest_three_month'),
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            picker.$emit('pick', [start, end])
          }
        }]
      },
      // 故障报告弹窗
      form: {
        devicename: '',
        time: [],
        faultType: ''
      },
      dialogFormVisible: false,
      formLabelWidth: '200',
      pickerOptions2: {
        shortcuts: [{
          text: this.$t('strings.faultmanage.latest_week'),
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        }]
      },
      rules: {
        devicename: [
          { required: true, message: this.$t('rules.required'), trigger: 'change' }
        ],
        time: [
          { required: true, message: this.$t('rules.required'), trigger: 'change' },
          { required: true, validator: validateDataRange, trigger: 'change' }
        ],
        faultType: [
          { required: true, message: this.$t('rules.required'), trigger: 'change' }
        ]
      },
      checkUrl: '',
      // faultState: [
      //   { label: '未处理', value: 'unprocessed' },
      //   { label: '进行中', value: 'processing' },
      //   { label: '已处理', value: 'processed' },
      //   { label: '无故障', value: 'fault_free' }
      // ],
      templateSelectDialogVisible: false, // 选择模板
      templateSelectDialogVisibleInnerVisible: false, // 预览模板
      // defaultTemp: '{"content":{"blocks":[{"type":"P","text":"空模板"}]}}',
      previewTemplateName: '',
      previewTemplateJson: {},
      template: {} // 模板
    }
  },
  created() {
    // this.template = this.defaultTemp
    if (this.templateList.length > 0) {
      this.template = this.templateList[0].value
    }
  },
  mounted() {
  },
  methods: {
    dateChange(val) {
      this.filterForm.fault_at_begin = val[0]
      this.filterForm.fault_at_end = val[1]
      this.handleFilter()
    },
    handleFilter() {
      // let status = ''
      // switch (this.filterForm.state) {
      //   case 'unprocessed':
      //   case 'processing':
      //     status = 'Unresolved'
      //     break
      //   default :
      //     status = 'resolved'
      // }
      // 调用父组件方法
      // this.$emit('changeStatus', status)
      this.$emit('search', this.filterForm)
    },
    showTemplateSelectDialog() {
      this.templateSelectDialogVisible = true
      this.$nextTick(() => {
        this.template = ''
      })
    },
    restoreTable() {
      this.fault_at = ''
      this.filterForm.fault_at_begin = ''
      this.filterForm.fault_at_end = ''
      this.filterForm.fault_device = ''
      this.filterForm.state = ''
      this.$emit('restore')
    },
    printReport() {
      this.dialogFormVisible = true
      try {
        if (this.$refs['ruleForm2'] !== undefined) {
          this.$refs['ruleForm2'].resetFields()
        }
      } catch (e) {
        console.log(e)
      }
    },
    // 下载pdf文件
    downloadpdf() {
      this.$refs['ruleForm2'].validate((valid) => {
        if (!valid) return
        this.dialogFormVisible = false
        const data = {
          jz_id: this.form.devicename,
          error_type: this.form.faultType,
          start_time: this.form.time[0],
          end_time: this.form.time[1]
        }
        const str = JSON.stringify(data)
        window.open(`${getBaseURL()}/getfaultreport/?data=${str}`)
      })
    },
    setDefaultReportTemplate() {
      // obj是已选中的默认模板
      let obj = {}
      obj = this.templateList.find((item) => {
        return item.value === this.template
      })
      if (obj) {
        this.$emit('settemplate', obj.value)
      }
      this.templateSelectDialogVisible = false
    },
    // 将搜索提交的form表单初始化
    resetForm() {
      this.filterForm.fault_at_begin = ''
      this.filterForm.fault_at_end = ''
      this.filterForm.fault_device = ''
      this.filterForm.state = ''
    },
    previewSelectedTemplate() {
      console.log('template preview', this.template)
      getTemplateId(this.template).then(res => {
        const data = res.data
        this.previewTemplateName = data['name']
        if (data.hasOwnProperty('content_json')) {
          this.previewTemplateJson = JSON.parse(data['content_json'])
        }
        this.templateSelectDialogVisibleInnerVisible = true
      }).catch(error => {
        console.log('getTemplate', error)
      })
    },
    templateChange() {
      console.log('template change', this.template)
      this.previewTemplateJson = {}
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .filter-container{
    display: flex;
    padding-bottom: 0;
    .container {
      flex: 1;
    }
    .search-reset,.print-report, .el-input{
      display: inline-block;
    }
    .search-reset{
      margin-right: 30px;
    }
    //
    .el-fault_device {
      margin-top: 18px;
      width: 192px;
      margin: 0 16px 0 0;
      /deep/ .el-input__inner {
        width: 192px;
        height: 36px;
        border-radius: 12px;
        border: 1px solid #e6e6e6;
        // font-family: sy_light;
        font-weight: lighter;
        &:hover {
          border-color: #ccc;
        }
      }
    }
    .el-select {
      margin-top: 18px;
      min-width: 112px;
      margin-right: 8px;
      /deep/ .el-input {
        /deep/ .el-input__inner {
          width: 112px;
          height: 36px;
          border-radius: 12px;
          border: 1px solid #e6e6e6;
          // font-family: sy_light;
          font-weight: lighter;
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
               border-left: 8px solid transparent;
               border-right: 8px solid transparent;
               border-top: 8px solid #606266;
               position: relative;
               top: 23px;
            }
          }
        }
      }
    }
    .el-date-editor {
      margin-top: 18px;
      // border: none;
      border: 1px solid #e6e6e6;
      border-radius: 12px;
      margin-right: 16px;
      /deep/ .el-input__icon {
        display: none;
      }
      /deep/ .el-range-input {
        width: 160px;
        height: 34px;
        // border: 1px solid #e6e6e6;
        border-radius: 12px;
        // font-family: sy_light;
        font-weight: lighter;
        // &:focus {
        //   border-color: #666;
        // }
      }
      /deep/ .el-range-separator {
        margin: 0 12px 0 8px;
      }
    }
    .search-reset {
      // margin-top: 18px;
      .el-button {
        width: 80px;
        height: 36px;
        border-radius: 14px;
        // font-family: sy_regular;
        color: #fff;
        background-color: #3d65c9;
        &:hover {
          background-color: #6484d4;
        }
        &:active {
          background-color: #0f32b5;
        }
      }
    }
    .select-template {
      width: 125px;
      // margin-top: 18px;
      // margin-right: 30px;
      .el-button {
        width: 125px!important;
        height: 36px;
        border-radius: 14px;
        color: #fff;
        background-color: #3d65c9;
        // font-family: sy_regular;
        &:hover {
          background-color: #6484d4;
        }
        &:active {
          background-color: #0f32b5;
        }
      }
    }
    .report_template {
      /deep/ .el-dialog {
      height: 224px;
      border-radius: 16px;
      padding: 24px 16px;
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
                width: 100%;
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
  }

</style>
