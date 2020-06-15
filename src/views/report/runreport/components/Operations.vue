<!-- 条件筛选 -->
<template>
  <div class="filter-container">
    <el-input :placeholder="$t('strings.runreport.name')" v-model="reportQueryCondition" suffix-icon="el-icon-search" class="el-fault_device" @change="handleFilter"/>
    <div class="header-btn_creat">
      <el-button class="el-add_alarm" icon="el-icon-plus" @click="dialogFormVisible=true">{{ $t('strings.runreport.create_report') }}</el-button>
    </div>
    <el-dialog :close-on-click-modal="false" :visible.sync="dialogFormVisible" :title="$t('strings.runreport.create_report')" class="new-dialog" width="40%" @closed="dialogCreateNewClosed">
      <el-form ref="formrunreport" :model="newReport" :rules="rules" label-width="100px" label-position="right">
        <el-form-item :label="$t('strings.runreport.name')" prop="name">
          <el-input v-model="newReport.name" style="width:90%;" clearable />
        </el-form-item>
        <el-form-item :label="$t('strings.runreport.device')" prop="datasource_id">
          <el-select v-model="newReport.datasource_id" :placeholde="$t('strings.select')" style="width:90%;">
            <el-option v-for="(item,key) in devices" :key="key" :label="item.label" :value="item.value"/>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('strings.runreport.period')" prop="period">
          <el-button :type="dateRangeHighlight('week')" size="small" @click="daterangeSelected('week')">{{ $t('strings.runreport.week') }}</el-button>
          <el-button :type="dateRangeHighlight('month')" size="small" @click="daterangeSelected('month')">{{ $t('strings.runreport.month') }}</el-button>
          <el-button :type="dateRangeHighlight('quarter')" size="small" @click="daterangeSelected('quarter')">{{ $t('strings.runreport.quarter') }}</el-button>
          <!-- <el-button>{{ $t('strings.runreport.customize') }}</el-button> -->
          <br>
          <el-date-picker
            v-model="newReport.period"
            :start-placeholder="$t('strings.start_time')"
            :end-placeholder="$t('strings.end_time')"
            :range-separator="$t('strings.to')"
            :default-time="['00:00:00','23:59:59']"
            style="margin-top:12px;width:90%;"
            type="datetimerange"
            value-format="yyyy-MM-dd HH:mm:ss"
            format="yyyy-MM-dd HH:mm"
            @change="updateDateRangeHighlight"/>
        </el-form-item>
        <el-form-item :label="$t('strings.runreport.select_template')" prop="template_id">
          <el-select v-model="newReport.template_id" :placeholde="$t('strings.select')" style="width:90%;">
            <el-option v-for="(item,key) in templateList" :key="key" :label="item.label" :value="item.value"/>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="createNewReport">{{ $t('buttons.generate') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import moment from 'moment'
import { getDatasources } from '@/api/report/runreport'

export default {
  props: {
    // 所有设备
    dataDevice: {
      type: Array,
      default: null
    },
    templateList: {
      type: Array,
      default: null
    }
  },
  data() {
    return {
      reportQueryCondition: '',
      devices: [],
      // 新建报告弹窗变量
      newReport: {
        name: '',
        dateRange: 'custom', // 类型，取值为week、month、quarter、custom
        datasource_id: '',
        period: '', // started_at end_at
        template_id: ''
      },
      dialogFormVisible: false,
      formLabelWidth: '200',
      rules: {
        name: [
          { required: true, message: this.$t('rules.required'), trigger: 'change' }
        ],
        datasource_id: [
          { required: true, message: this.$t('rules.required'), trigger: 'change' }
        ],
        period: [
          { required: true, message: this.$t('rules.required'), trigger: 'change' }
        ],
        template_id: [
          { required: true, message: this.$t('rules.required'), trigger: 'change' }
        ]
      },
      checkUrl: ''
    }
  },
  mounted() {
    getDatasources().then(res => {
      const data = res.data.data
      for (var d of data) {
        // console.log('getTemplates', each_template)
        this.devices.push({ 'value': d.id, 'label': d.name })
      }
      // console.log(this.devices)
    }).catch(error => {
      console.error('getTemplate', error)
    })
  },
  methods: {
    getDateRange(range) {
      let start, end
      if (range === 'week') {
        start = moment().week(moment().week() - 1).startOf('week').add(1, 'd').format('YYYY-MM-DD HH:mm:ss')
        end = moment().week(moment().week() - 1).endOf('week').add(1, 'd').format('YYYY-MM-DD HH:mm:ss')
      } else if (range === 'month') {
        start = moment().month(moment().month() - 1).startOf('month').format('YYYY-MM-DD HH:mm:ss')
        end = moment().month(moment().month() - 1).endOf('month').format('YYYY-MM-DD HH:mm:ss')
      } else if (range === 'quarter') {
        start = moment().quarter(moment().quarter() - 1).startOf('quarter').format('YYYY-MM-DD HH:mm:ss')
        end = moment().quarter(moment().quarter() - 1).endOf('quarter').format('YYYY-MM-DD HH:mm:ss')
      }
      return [start, end]
    },
    daterangeSelected(range) {
      this.newReport.dateRange = range
      this.newReport.period = this.getDateRange(range)
    },
    dateRangeHighlight(range) {
      return this.newReport.dateRange === range ? 'primary' : ''
    },
    updateDateRangeHighlight(v) {
      var matchedRange = 'custom'
      if (Array.isArray(v) && v.length === 2) {
        const weekRange = this.getDateRange('week')
        const monthRange = this.getDateRange('month')
        const seasonRange = this.getDateRange('quarter')

        if (weekRange[0] === v[0] && weekRange[1] === v[1]) {
          matchedRange = 'week'
        } else if (monthRange[0] === v[0] && monthRange[1] === v[1]) {
          matchedRange = 'month'
        } else if (seasonRange[0] === v[0] && seasonRange[1] === v[1]) {
          matchedRange = 'quarter'
        }
      }
      this.newReport.dateRange = matchedRange
    },
    createNewReport() {
      this.$refs['formrunreport'].validate((valid) => {
        if (!valid) return
        this.$emit('createreport', this.newReport)
        // this.dialogFormVisible = false
      })
    },
    dialogCreateNewClosed() {
      this.$refs['formrunreport'].resetFields()
      this.newReport.dateRange = 'custom'
    },
    handleFilter() {
      this.$emit('searchReports', this.reportQueryCondition)
    }
  }
}
</script>
