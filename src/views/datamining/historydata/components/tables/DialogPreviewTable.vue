<!--数据预览弹窗组建-->
<!--使用方式如下-->
<!-- table-visible 弹窗显示与否 fileup-end-data数据list table-header表头list -->
<!--<DialogPreviewTable :dialog-visible="tablevisible" :fileup-end-data = "fileupEndData" :table-header="tableHeader" @setDialog="setDialog" />-->

<template>
  <el-dialog
    :visible.sync="isShowDialogPreview"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    element-loading-text="正在获取数据"
    custom-class="wrap-outer-metafield"
    width="80%"
    show-close
    @close="setDialogVisible">
    <vertical-buttons :cfg-btns="cfgVBtnGroup" @itemClick="toggleActive" />
    <div v-loading="isLoadingPreview" :element-loading-text="textLoadingPreview" style="height:100%;">
      <!-- 表信息 -->
      <metadata-binding
        v-show="activePanel === '0'"
        ref="metadataBinding"
        :form-metadata="formData"
        :fields-data="fieldsData"
        @changAddDialogStatus="setDialogVisible"/>
      <!-- 数据预览与统计 -->
      <el-tabs v-show="activePanel === '1'" v-model="activeTabData" class="preview-statistic-data" @tab-click="togglePreviewStat">
        <el-tab-pane v-loading="isLoadingStatisPreview" :element-loading-text="textLoadingStatisPreview" label="数据预览" name="preview">
          <preview-table :fileup-end-data="previewData" :table-header="tableHeader" v-bind="$attrs" height="92%" />
        </el-tab-pane>
        <el-tab-pane v-loading="isLoadingStatisPreview" v-if="schema" :element-loading-text="textLoadingStatisPreview" label="统计信息" name="statistic" >
          <el-button v-if="statState!='idle' && statState!='executing'" type="primary" size="small" @click="reStatistic">重新统计</el-button>
          <statistic-table :stactic-state="statState" :stactic-data="statData" :schema="schema" />
        </el-tab-pane>
      </el-tabs>
    </div>
  </el-dialog>
</template>
<script>
// 弹窗
import PreviewTable from '@/components/Table/PreviewTable'
import StatisticTable from '@/components/Table/StatisticTable'
import VerticalButtons from '@/components/VButtons'
import MetadataBinding from '../metadatabinding'

export default {
  name: 'DialogPreviewTable',
  components: { PreviewTable, StatisticTable, VerticalButtons, MetadataBinding },
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    fileupEndData: {
      type: Array,
      default: null
    },
    statisticData: {
      type: Object,
      default: null
    },
    stacticState: {
      type: String,
      default: 'idle'
    },
    tableHeader: {
      type: Array,
      default: null
    },
    datasetInfo: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      // previewDialogLoading: false,
      isShowDialogPreview: false,
      cfgVBtnGroup: [
        { key: '0', type: 'normal', label: '表信息' },
        { key: '1', type: 'primary', label: '数据预览' }],
      activePanel: '1',
      formData: [],
      fieldsData: {
        data: { head: [], value: [] },
        database_name: '',
        description: '',
        name: '',
        private: true,
        schema: [],
        schema_guid: [],
        table_name: [],
        type: []
      },
      isLoadingPreview: false,
      isLoadingStatisPreview: false,
      previewData: [],
      activeTabData: 'preview',
      statData: null,
      statState: 'idle',
      schema: null,
      textLoadingPreview: '正在加载数据',
      textLoadingStatisPreview: '正在获取预览数据'
    }
  },
  watch: {
    '$props.dialogVisible': {
      handler(newer, older) {
        this.isShowDialogPreview = newer
        this.isLoadingPreview = newer
        this.isLoadingStatisPreview = newer
      }
    },
    '$props.fileupEndData': {
      handler(newer, older) {
        this.previewData = newer
        this.removeStatisPreviewLoading()
      },
      deep: true
    },
    '$props.statisticData': {
      handler(newer, older) {
        this.statData = newer
        this.removeStatisPreviewLoading()
      },
      deep: true
    },
    '$props.stacticState': {
      handler(newer) {
        this.statState = newer
      }
    },
    '$props.datasetInfo': {
      handler(newer) {
        if (newer) {
          console.log('预览schema信息', newer)
          this.fieldsData = newer
          this.schema = newer.schema
          this.formData = newer.schema ? [...newer.schema] : []
          if (!this.schema) {
            this.cfgVBtnGroup = [{ key: '1', type: 'primary', label: '数据预览' }]
            this.activePanel = '1'
          } else {
            this.cfgVBtnGroup = [
              { key: '0', type: 'normal', label: '表信息' },
              { key: '1', type: 'primary', label: '数据预览' }]
            this.activePanel = '1'
          }
        }
        if (this.activePanel === '0') {
          this.isLoadingPreview = false
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    toggleActive(key) {
      this.isLoadingPreview = true
      this.$nextTick(() => {
        setTimeout(() => {
          this.activePanel = key
          this.isLoadingPreview = false
        }, 1000)
      })
    },
    removeStatisPreviewLoading() {
      this.isLoadingStatisPreview = false
      if (this.activePanel === '1') {
        this.isLoadingPreview = false
      }
    },
    setDialogVisible(b) {
      if (!b) {
        this.isLoadingStatisPreview = false
        this.isLoadingPreview = false
      }
      this.$emit('setDialog', b)
      this.activeTabData = 'preview'
    },
    togglePreviewStat(tab) {
      this.isLoadingStatisPreview = true
      this.textLoadingStatisPreview = tab.name === 'statistic' ? '正在统计...' : '正在获取预览数据'
      this.$emit('previewTabChanged', tab.name)
      setTimeout(() => {
        this.isLoadingStatisPreview = false
      }, 2000)
    },
    reStatistic() {
      this.isLoadingStatisPreview = true
      this.$emit('restatistic')
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
/deep/ .el-dialog.wrap-outer-metafield {
  border-left:5px solid #3d65c9;
  border-radius: 16px;
  margin-top: 6vh !important;
  height: 90vh;
  .el-dialog__header {
    height:40px;
    padding: 0;
    .el-dialog__headerbtn{
      top:16px;
    }
  }
  .el-dialog__body {
    padding: 0;
    height: calc(100% - 60px);
    .vertical-button-group {
      position: absolute;
      width: 40px;
      top: 40px;
    }
    .el-add_field_container {
      padding: 10px 30px;
      height: 100%;
    }
  }
}
.preview-statistic-data{
  padding:20px 50px;
  height:100%;
  /deep/ .el-tabs__content{
    height: calc(100% - 40px);
    .el-tab-pane{
      height:100%;
        .el-row,.el-col{
          height:100%;
        }
        .el-table{
        width: 100%;
        height:100%;
        border: 1px solid #f1f1f1;
        .el-table__body-wrapper{
          height: calc(100% - 40px);
          overflow: auto;
        }
      }
    }
  }
}
</style>
