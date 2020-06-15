<!-- 运行报告显示界面  配置的运行报告信息结合选择的模板完成运行报告的显示，统计的是时间范围内所有故障信息 -->
<template>
  <div>
    <el-container class="app_container" style="border: 1px solid #eee; min-height: calc(100vh - 80px);">
      <el-main class="main_container" style="padding:0 20px;margin-top:0;">
        <div id="pdfDom" style="padding:60px;background-color:#fff;">
          <el-row :gutter="20">
            <el-col :span="10"><h4> {{ $t('labels.runreport.runreport') + reportname }}</h4></el-col>
            <el-col :span="10"><p>{{ reporttype === 'custom' ? $t('strings.runreport.period') : reporttypeName }} {{ started_at + $t('strings.to') + ended_at }}</p></el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="10"><p>{{ $t('labels.runreport.monitor_device') + ':' + datasource.name }}</p></el-col>
            <el-col :span="10"><p>{{ $t('labels.runreport.template') + ':' + template.name }}</p></el-col>
          </el-row>
          <div v-for="(item, k) in templateJSONData" :key="k">
            <comp-fixedcolumntable v-if="item.type == 'fixedcolumn_table'" :table-attributes="item.hasOwnProperty('attributes') ? item.attributes : {}" :tgroup-data="item.children" :fault-config-data="faultConfigData" report-type="runreport"/>
            <comp-table v-else-if="item.type == 'TABLE'" :tgroup-data="item.children" :table-attributes="item.hasOwnProperty('attributes') ? item.attributes : {}"/>
            <component v-else-if="item.text" :is="item.type" :style="item.style">{{ item.text }}</component>
            <comp-commonblock v-else :data-type="item.type" :block-data="item.children" :block-attributes="item.hasOwnProperty('attributes') ? item.attributes : {}" :fault-config-data="faultConfigData"/>
          </div>
        </div>
        <div style="float:right; padding:20px;">
          <el-button type="primary" @click="onlyDownloadPDF()">{{ $t('buttons.downLoad') + 'PDF' }}</el-button>
        </div>
      </el-main>
    </el-container>
  </div>
</template>
<script>
// import JSONEditor from 'json-editor-elementui'
// import $ from 'jquery'
import showFixedColumnTable from '@/views/report/components/showFixedColumnTable'
import showTable from '@/views/report/components/showTable'
import showCommonBlock from '@/views/report/components/showCommonBlock'
// import { getTemplateId } from '@/api/report/template'
export default {
  name: 'RunReportView',
  components: {
    'comp-fixedcolumntable': showFixedColumnTable,
    'comp-commonblock': showCommonBlock,
    'comp-table': showTable
  },
  data() {
    return {
      templateJSONData: [],
      htmlTitle: this.$t('labels.runreport.runreport'),
      template: { name: '' },
      datasource: { name: '' },
      started_at: '',
      ended_at: '',
      reporttype: '',
      reporttypeName: '',
      reportname: '',
      faultConfigData: {},
      faultId: 0 // 用于是否将导出的PDF上传
    }
  },
  mounted() {
    this.templateJSONData = []
    const $q = this.$route.query
    this.reportname = $q.name
    this.template = JSON.parse($q.template)
    this.datasource = JSON.parse($q.datasource)
    this.started_at = $q.started_at
    this.ended_at = $q.ended_at
    this.reporttype = $q.type
    this.reporttypeName = $q.typename
    // console.log('month variable', this.template, this.datasource)
    if (this.template !== null && typeof this.template !== 'undefined') {
      this.templateJSONData = JSON.parse(this.template['content']).content.blocks
      // console.log('getTemplates', this.templateJSONData)
      this.faultConfigData = {
        'start_time': this.started_at,
        'end_time': this.ended_at,
        'device_uuid': this.datasource.name
      }
    }
  },
  created: function() {
    // 使用window.open 打开的本界面，始终在‘运行平台’tab
    this.$store.dispatch('changeAction', 'runplatform')
  },
  updated: function() {
    console.log('runreport_preview updated', this.started_at, this.ended_at)
  },
  methods: {
    onlyDownloadPDF() {
      this.getPdf(this)
    }
  }
}
</script>
<style lang="scss" scoped>
@import "src/assets/styles/new-base.scss";
#pdfDom{
  .el-table td, .el-table th.is-leaf{
    border: 1px solid #EBEEF5
  }
  .el-table--border th, .el-table__fixed-right-patch{
    border: 1px solid #EBEEF5
  }
}
</style>
