<template>
  <div v-loading="listLoading" :element-loading-text="this.$t('labels.loading')" class="app_container">
    <div class="filter_header">
      <div class="filter-container">
        <el-input :placeholder="$t('labels.name')" v-model="searchList.name" suffix-icon="el-icon-search" class="el-fault_device" @change="handleFilter()"/>
        <el-select v-if="tabStatus === 'publicData'" v-model="searchList.creator_id" :placeholder="$t('labels.historydata.data_attribute')" @change="handleFilter()">
          <el-option
            v-for="(item, index) in attributesData"
            :key="index"
            :label="item.label"
            :value="item.value"/>
        </el-select>
        <div class="el-search-reset">
          <add-file ref="addF" @refreshData = "freshData" @loadFunc="loadingFunction" @getFieldsData = "getUploadData"/>
        </div>
      </div>
    </div>
    <div class="tab_container">
      <el-tabs v-model="tabStatus" @tab-click="showHisData">
        <el-tab-pane :label="$t('labels.dfilemanage.publicData')" name="publicData">
          <el-main class="main_container">
            <HisTable
              :data-list="listHisData"
              :page="listQuery.page"
              @deleteData="handleDelete"
              @datapreview="previewData"/>
            <div class="pagination-container">
              <el-pagination
                :current-page="listQuery.page"
                :page-size="listQuery.limit"
                :total="listQuery.total"
                layout="total, prev, pager, next, jumper"
                @current-change="handleCurrentChange"/>
            </div>
          </el-main>
        </el-tab-pane>
        <el-tab-pane :label="$t('labels.dfilemanage.privateData')" name="privateData">
          <el-main class="main_container">
            <HisTable
              :data-list="listHisData"
              :page="listQuery.page"
              @deleteData="handleDelete"
              @datapreview="previewData"/>
            <div class="pagination-container">
              <el-pagination
                :current-page="listQuery.page"
                :page-size="listQuery.limit"
                :total="listQuery.total"
                layout="total, prev, pager, next, jumper"
                @current-change="handleCurrentChange"/>
            </div>
          </el-main>
        </el-tab-pane>
      </el-tabs>
    </div>
    <!-- 数据预览 -->
    <dialog-preview-table
      :dialog-visible="dataPreviewVisilbe"
      :r="fileupEndData.length"
      :c="colNum"
      :fileup-end-data = "fileupEndData"
      :dataset-info="crntDataSetInfo"
      :stactic-state="stacticState"
      :statistic-data="statisticData"
      :table-header="tableHeader"
      @restatistic="runStatistic"
      @previewTabChanged="onPreviewTabChanged"
      @setDialog="setDialog" />
    <!-- 数据上传 -->
    <data-schema-preview
      :container-dialog-visible="dialogStatus"
      :table-data="fieldDatas"
      :fields-data="formDatas"
      @freshData = "freshData"
      @handleLoading = "loadingFunction"
      @changAddDialogStatus = "showAddDialog"/>
  </div>
</template>

<script>
import { getAlldataFile, deleteDataFile, previewFileData, statisticFileData, statisticRun } from '@/api/datamining/historydata'
import AddFile from './components/AddFile'
import HisTable from './components/tables/HisTable'
import DataSchemaPreview from './components/DataSchemaPreview'
import debounce from 'lodash/debounce'
import DialogPreviewTable from './components/tables/DialogPreviewTable'

export default {
  name: 'DfileManage',
  components: {
    AddFile,
    HisTable,
    DialogPreviewTable,
    DataSchemaPreview
  },
  data() {
    return {
      listHisData: [],
      listLoading: false,
      listQuery: {
        page: 1,
        limit: 10,
        total: 0,
        pageLength: 0
      },
      searchList: {
        name: '',
        creator_id: ''
      },
      searchStatus: false,
      // 属性
      attributesData: [
        { label: this.$t('labels.historydata.all'), value: '' },
        { label: this.$t('labels.historydata.addSelf'), value: this.$store.state.user.id }
      ],
      attrList: [],
      tableHeader: [],
      fileupEndData: [],
      dataPreviewVisilbe: false,
      colNum: 0,
      tabStatus: 'publicData',
      dataStatus: 0,
      crntDSId: null,
      crntDataSetInfo: null,
      statisticData: null,
      stacticState: 'idle',
      looptimmerStatistic: null,
      // 是用来接收文件上传后返回的数据
      fieldDatas: { schema: [], data: { head: [], value: [] }},
      // 上传表单中的数据
      formDatas: {},
      dialogStatus: false
    }
  },
  created() {
    this.getListData()
  },
  methods: {
    // 上传成功以后的刷新数据
    freshData() {
      this.getListData(this.listQuery.page)
    },
    showHisData() {
      this.searchList.name = ''
      this.searchList.creator_id = ''
      this.listQuery.page = 1
      this.getListData()
    },
    // 获取数据
    getListData(p) {
      const page = p || 1
      this.listLoading = true
      this.searchStatus = false
      if (this.tabStatus === 'publicData') {
        this.dataStatus = 0
      } else {
        this.dataStatus = 1
      }
      getAlldataFile({ private: this.dataStatus, page }).then(res => {
        this.listLoading = false
        this.listHisData = res.data.results
        this.listQuery.total = res.data.count
        this.listQuery.pageLength = this.listHisData ? this.listHisData.length : 10
      }).catch((err) => {
        console.log(err)
        this.listLoading = false
        this.$message.error(this.$t('labels.getFaild'))
      })
    },
    // 页面的刷新
    loadingFunction(v) {
      this.listLoading = v
    },
    // 设置预览组件的显示隐藏
    setDialog(val) {
      this.dataPreviewVisilbe = val
      if (!this.val && this.looptimmerStatistic) {
        clearInterval(this.looptimmerStatistic)
      }
    },
    // 搜索操作
    handleFilter: debounce(function(val, p) {
      this.listLoading = true
      if (!this.searchList.name && !this.searchList.creator_id) {
        this.getListData(this.listQuery.page)
        return
      }
      const da = {}
      let privateStatus = ''
      if (this.tabStatus === 'publicData') {
        privateStatus = 0
        if (this.searchList.creator_id) {
          da.creator_id = this.searchList.creator_id
        }
      } else {
        privateStatus = 1
      }
      this.searchStatus = true
      const page = p || 1
      this.listQuery.page = page
      da.page = page
      da.private = privateStatus
      this.searchList.name ? da.name = this.searchList.name : da
      getAlldataFile(da).then(res => {
        this.listHisData = res.data.results
        this.listQuery.total = res.data.count
        this.listQuery.pageLength = this.listHisData ? this.listHisData.length : 10
        this.listLoading = false
      }).catch(() => {
        this.listLoading = false
        this.$message.error(this.$t('labels.getFaild'))
      })
    }, 500),
    // 切换页面的操作
    handleCurrentChange(val) {
      this.listLoading = true
      this.listQuery.page = val
      if (this.searchStatus) {
        this.handleFilter('', val)
      } else {
        this.getListData(val)
      }
    },
    // 删除数据
    handleDelete: debounce(function(id) {
      this.$confirm(this.$t('strings.dfilemanage.delete_file'), this.$t('labels.reminder'), confirm).then(() => {
        this.listLoading = true
        deleteDataFile(id).then(res => {
          if (res.status === 204) {
            if (this.listQuery.page !== 1 && this.listQuery.pageLength === 1) {
              this.handleCurrentChange(this.listQuery.page - 1)
            } else {
              this.handleCurrentChange(this.listQuery.page)
            }
            this.listLoading = false
            this.$message({
              type: 'success',
              message: this.$t('messages.delete_success'),
              duration: 1000
            })
          }
        }).catch((e) => {
          this.listLoading = false
          this.$message({
            type: 'error',
            message: this.$t('messages.delete_failed'),
            duration: 1000
          })
        })
      }).catch(() => {
        this.$message.info(this.$t('messages.cancel_operate'))
      })
    }, 500),
    // 预览统计
    onPreviewTabChanged(tabname) {
      if (tabname === 'statistic') {
        statisticFileData(this.crntDSId).then(res => {
          console.log('统计数据DSID:' + this.crntDSId, res)
          this.statisticData = res.data
          this.stacticState = this.statisticData.statistical_status
          if (this.stacticState === 'idle') {
            this.runStatistic()
          } else if (this.stacticState === 'executing') {
            this.loopQueryStatistic()
          }
        }).catch((e) => {
          this.$message({
            type: 'error',
            message: e.message,
            duration: 1000
          })
        })
      }
    },
    // 执行统计
    runStatistic() {
      if (this.stacticState === 'executing') return
      this.stacticState = 'executing'
      statisticRun(this.crntDSId).then(res => {
        console.log('运行返回数据', res.data)
        this.loopQueryStatistic()
      }).catch((e) => {
        this.$message({
          type: 'error',
          message: e.message,
          duration: 1000
        })
      })
    },
    // 轮询统计--临时方案，后台不能提供socket通知
    loopQueryStatistic() {
      this.looptimmerStatistic && clearInterval(this.looptimmerStatistic)
      this.looptimmerStatistic = setInterval(() => {
        statisticFileData(this.crntDSId).then(res => {
          this.statisticData = res.data
          this.stacticState = this.statisticData.statistical_status
          if (this.stacticState !== 'executing') {
            clearInterval(this.looptimmerStatistic)
          }
        }).catch((e) => {
          console.log('获取统计信息出错', e.message)
        })
      }, 3000)
    },
    // 文件预览
    previewData(id, rowdata) {
      this.dataPreviewVisilbe = true
      this.$nextTick(() => {
        this.tableHeader = []
        this.crntDSId = id
        this.crntDataSetInfo = {
          data: { head: [], value: [] },
          database_name: rowdata.database_name,
          description: rowdata.description,
          name: rowdata.name,
          private: rowdata.private,
          schema: rowdata.schema,
          schema_guid: '',
          table_name: rowdata.table_name,
          type: rowdata.type
        }
        previewFileData(id).then(res => {
          console.log('表格内预览数据', res)
          this.tableHeader = res.data.head
          this.colNum = this.tableHeader.length
          this.fileupEndData = res.data.value
        }).catch((e) => {
          this.$message({
            type: 'error',
            message: this.$t('messages.priview_faild'),
            duration: 1000
          })
        })
      })
    },
    // 获取文件上传成功后的数据
    // val1:上传文件返回的数据
    // val2:表单中的数据
    getUploadData(val1, val2) {
      this.listLoading = true
      this.fieldDatas = val1
      this.formDatas = val2
      console.log('预览数据', this.fieldDatas)
      console.log('表单数据', this.formDatas)
      setTimeout(() => {
        this.dialogStatus = true
        this.listLoading = false
      }, 2000)
    },
    // 关闭添加弹窗
    showAddDialog(val) {
      this.dialogStatus = val
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
@import "src/assets/styles/new-base.scss";
.app_container {
  .filter_header {
    margin-top:10px;
    font-size: 12px;
  }
  .tab_container {
    padding-left: 0;
    padding-right: 0;
  }
}
</style>
