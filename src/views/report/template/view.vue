<!-- 故障报告显示界面  故障信息结合选择的模板完成故障报告的显示 -->
<template>
  <div>
    <el-container class="app_container" style="border: 1px solid #eee; min-height: calc(100vh - 50px);">
      <el-main class="main_container" style="padding:0 20px;margin-top:0;">
        <div id="pdfDom" style="padding:60px 40px 60px 40px;background-color:#fff;">
          <div v-for="(item, k) in templateJSONData" :key="k">
            <comp-fixedcolumntable v-if="item.type == 'fixedcolumn_table'" :table-attributes="item.hasOwnProperty('attributes') ? item.attributes : {}" :tgroup-data="item.children" :fault-config-data="faultConfigData" report-type="faultreport"/>
            <comp-table v-else-if="item.type == 'TABLE'" :tgroup-data="item.children" :table-attributes="item.hasOwnProperty('attributes') ? item.attributes : {}" :fault-config-data="faultConfigData"/>
            <comp-modifiabletext v-else-if="item.type == 'PRE'" :block-data="item.children" :block-attributes="item.hasOwnProperty('attributes') ? item.attributes : {}" :fault-config-data="faultConfigData"/>
            <component v-else-if="item.text" :is="item.type" :style="item.style">{{ item.text }}</component>
            <comp-commonblock v-else :data-type="item.type" :block-data="item.children" :block-attributes="item.hasOwnProperty('attributes') ? item.attributes : {}" :fault-config-data="faultConfigData"/>
          </div>
        </div>
        <div style="float:right; padding:20px;">
          <!-- templatedata ==''表示显示的preview界面 -->
          <!-- 上传并导出PDF -->
          <el-button v-show="templatedata==null" type="primary" @click="downloadAndUploadPDF()">{{ $t('buttons.template.uploadPdf') }}</el-button>
        </div>
      </el-main>
    </el-container>
  </div>
</template>
<script>

import { faultDataId, handelFaultData } from '@/api/device/fault'
import { getTemplateId, deleteTemplateAttachment, getTemplateAttachmentList } from '@/api/report/template'
import { postTemplateAttachmentFile, postTemplateAttachment, showStateString } from '@/views/report/components/editorCommonMethod.js'
import showFixedColumnTable from '@/views/report/components/showFixedColumnTable'
import showTable from '@/views/report/components/showTable'
import showCommonBlock from '@/views/report/components/showCommonBlock'
import showModifiableText from '@/views/report/components/showModifiableText'

export default {
  name: 'FaultReportView',
  components: {
    'comp-fixedcolumntable': showFixedColumnTable,
    'comp-commonblock': showCommonBlock,
    'comp-table': showTable,
    'comp-modifiabletext': showModifiableText
  },
  props: {
    templatedata: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      templateJSONData: [],
      nlists: [],
      htmlTitle: this.$t('strings.faultmanage.fault_report'),
      faultdata: null,
      faultConfigData: {},
      faultId: this.$route.query.fault !== null ? this.$route.query.fault : 0,
      faultPDFUrl: ''
    }
  },
  watch: {
    templatedata(val) {
      this.templateJSONData = []
      if (val.hasOwnProperty('content')) {
        this.templateJSONData = val.content.blocks
      }
    }
  },
  created() {
    // 模板编辑完，存储两个参数，html和json
    // 故障数据+basepreview = 故障报表  ，内部的模型请求等在json each过程中执行，获得变量传入各种组件
    // console.log('base privew created', this.$route)
    this.$store.dispatch('changeAction', 'runplatform')
    this.templateJSONData = []
    if (this.$route.query.fault !== null && typeof this.$route.query.fault !== 'undefined') {
      this.faultId = this.$route.query.fault
      faultDataId(this.$route.query.fault).then(res => {
        // console.log('faultDataId', res.data, res.data.content.faulted_at, res.data.content.device.name)
        this.faultdata = res.data
        this.faultConfigData = {
          'error_time': this.faultdata.content.generated_at, // generated_at是数据实际故障时间，collected_at是故障数据采集时间，fault_at是故障的发现时间
          'device_uuid': this.faultdata.content.device.name,
          'model': this.faultdata.content.model,
          'alert_rule': this.faultdata.content.alert_rule.name + '(' + this.faultdata.content.alert_rule.fault_code.name + ')',
          'state': showStateString(this.faultdata.content.state),
          'handle_info': this.faultdata.content.handled_at + '由用户  ' + this.faultdata.content.handler.username + '  进行处理',
          'alert_rule_info': this.faultdata.content.alert_rule
        }
        this.faultPDFUrl = this.faultdata.content.url
        if (this.$route.query.template !== null && typeof this.$route.query.template !== 'undefined') {
          getTemplateId(this.$route.query.template).then(res => {
            const data = res.data
            if (data.hasOwnProperty('content_json')) {
              this.templateJSONData = JSON.parse(data['content_json']).content.blocks
            }
            // console.log('getTemplates', this.templateJSONData)
          }).catch(error => {
            console.log('getTemplate error', error)
          })
        }
      }).catch(e => {
        console.log('faultDataId', e)
      })
    } else {
      // preview
      if (this.templatedata.hasOwnProperty('content')) {
        this.templateJSONData = this.templatedata.content.blocks
      }
    }
  },
  methods: {
    downloadAndUploadPDF() {
      this.getPdf(this, this.savePDF)
    },
    savePDF(uplload_pdf, pdftitle) {
      const _this = this
      if (this.currenFaultId !== 0) {
        // console.log('exist url', currentFaultPDFUrl)
        // 如果该故障已经导出过PDF，在重新下载时，先删除旧PDF记录
        var currenFaultId = this.faultId
        var currentFaultPDFUrl = this.faultPDFUrl
        if (currentFaultPDFUrl !== '' && currentFaultPDFUrl !== null) {
          getTemplateAttachmentList({ 'type': 'pdf', 'url': currentFaultPDFUrl }).then(res => {
            // console.log('getTemplateFileId', res, res.data.results[0].id)
            if (res.data.count !== 0) {
              deleteTemplateAttachment(res.data.results[0].id).then(res1 => {
                console.log('deleteTemplateFile success')
              }).catch(() => {
                console.log('deleteTemplateFile error')
              })
            }
          }).catch(error => {
            console.log('getTemplateFileId', error)
          })
        }

        const loading = this.$loading({
          lock: true,
          text: this.$t('strings.faultmanage.fault_report_uploading'),
          spinner: 'el-icon-loading'
        })
        const formData = new FormData()
        // formData.append('type', 'pdf')
        formData.append('file', uplload_pdf)
        // formData.append('title', pdftitle)
        // formData.append('uri', pdftitle)
        // TODO: 是否替换新的上传pdf附件接口
        postTemplateAttachmentFile(formData, function(data) {
          // console.log('callback postTemplateAttachment', data)
          if (data.result === 'success') {
            var postdata = {
              'file_uuid': data.data,
              'name': pdftitle,
              'type': 'pdf'
            }
            postTemplateAttachment(postdata, function(data) {
              handelFaultData(currenFaultId, { 'url': data.url }).then(res => {
                loading.close()
                // console.log('handelFaultData url success', res)
                _this.$message.success(_this.$t('messages.upload_success'))
              }).catch(() => {
                loading.close()
                console.log('handelFaultData url error')
                _this.$message.error(_this.$t('messages.upload_failed'))
              })
            })
          } else if (data.result === 'failed') {
            loading.close()
            _this.$message.error(data.data)
          }
        })
      }
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
