<template>
  <div class="app_container">
    <el-header class="filter_header">
      <div class="service-model-filter">
        <el-input v-model="filter.name" :placeholder="$t('labels.service.filter_name_placehold')" suffix-icon="el-icon-search" class="prepend-select-input" @change="getTableSearchData(1, true)">
          <el-select slot="prepend" v-model="filter.nameType" :placeholder="$t('labels.select')" class="el-prepend-select" @change="getTableSearchData(1, true)">
            <el-option :label="$t('labels.service.name')" value="serviceName" />
            <el-option :label="$t('labels.service.model.name')" value="modelName" />
          </el-select>
        </el-input>
        <el-select v-model="filter.enable" :placeholder="$t('strings.alarm.select_model')" class="normal-select" filterable @change="getTableSearchData(1, true)">
          <el-option v-for="item in enableStatus" :key="item.value" :label="item.label" :value="item.value"/>
        </el-select>
        <!-- 创建 -->
        <div class="header-btn_creat">
          <el-button ref="addServiceButton" icon="el-icon-plus" @click="openDialog('create')">{{ $t('labels.service.add') }}</el-button>
        </div>
      </div>
    </el-header>
    <el-main class="main_container">
      <div v-for="button in batchButtons" :key="button.id" class="main-top-btn">
        <complex-button :disabled="batchObjectsList.length === 0 ? true : false" :svg-icon-class-name="button.iconClass" css-classes="svgIconBase borderButton" @click="button.method">{{ button.text }}</complex-button>
      </div>
      <el-divider />
      <div style="height: 630px;">
        <smodel-table
          :data-list="serviceModelDataList"
          :table-loading="isLoading"
          :page="listQuery.page"
          :show-model-detail-data="modelDetailData"
          @editedTableCell="getEditedFormData"
          @openDialog="openDialog"
          @enabledStatus="getToChangeEnabledStatus"
          @selectedModelId="getSelectedModelData"
          @toEditData="getToEditData"
          @clientData="getClientData"
          @toTestData="getToTestData"
          @toUpdateModelData="getToUpdateModelData"
          @toDeleteId="getToDeleteId"
          @multipleSelection="getMultipleSelection"/>
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
    <smodel-create :is-visable="showCreateComp" @createdForm="getCreatedFormData" @closeDialog="closeDialog"/>
    <smodel-edit :is-visable="showEditComp" :to-edit-data="toEditData" @editedForm="getEditedFormData" @closeDialog="closeDialog"/>
    <smodel-client :is-visable="showClientComp" :client-data="clientData" @closeDialog="closeDialog"/>
    <smodel-test :is-visable="showTestComp" :modelid="selectedModelId" :model-input-schema="selectedModelInputSchema" :model-path="selectedModelPath" @closeDialog="closeDialog"/>
    <simple-dialog :is-visable="showDeleteComp" :dialog-key="'delete'" :css-classes="'deletePeriodData'" :svg-icon-class-name="'warn_mark'" :title="$t('labels.delete')" :message="$t('strings.service.model.delete_confirm')" @closeDialog="closeDialog" @confirmClick="deleteDialogConfirmClick"/>
    <simple-dialog :is-visable="showUpdateComp" :dialog-key="'update'" :css-classes="'messageReminder'" :title="$t('labels.update')" :message="$t('strings.service.model.update_confirm')" @closeDialog="closeDialog" @confirmClick="updateDialogConfirmClick"/>
    <simple-dialog :is-visable="showBatchUpdateComp" :dialog-key="'batch_update'" :css-classes="'messageReminder'" :title="$t('labels.update')" :message="$t('strings.service.model.batch_update_confirm')" @closeDialog="closeDialog" @confirmClick="batchUpdateDialogConfirmClick"/>
  </div>
</template>

<script>
import ServiceModelTable from './components/ServiceModelTable'
import ServiceModelCreate from './components/ServiceModelCreate'
import ServiceModelEdit from './components/ServiceModelEdit'
import ServiceModelClient from './components/ServiceModelClient'
import ServiceModelTest from './components/ServiceModelTest'
import { getServicesData, postServiceData, patchServiceData, deleteServiceData, putServiceEnable, putServiceDisable, putServiceRedeploy, putBatchServicesEnable, putBatchServicesDisable, putBatchServicesRedeploy } from '@/api/service/model'
import { getAllModel } from '@/api/datamining/model'
import { getPipeline } from '@/api/experiment/pipelines'
import debounce from 'lodash/debounce'
// import { commonConfirm } from '@/utils/actions'
import ComplexButton from '@/components/Button/ComplexButton'
import SimpleDialog from '@/components/Dialog'

export default {
  name: 'ServiceModel',
  components: {
    'smodel-table': ServiceModelTable,
    'smodel-create': ServiceModelCreate,
    'smodel-edit': ServiceModelEdit,
    'smodel-client': ServiceModelClient,
    'smodel-test': ServiceModelTest,
    'complex-button': ComplexButton,
    'simple-dialog': SimpleDialog
  },
  data() {
    return {
      isLoading: true,
      serviceModelDataList: [], // 模型服务表格数据，通过API请求获得
      listQuery: {
        page: 1,
        limit: 10,
        total: 0
      },
      filter: {
        name: '', // 服务名称/模型名称模糊筛选
        nameType: 'serviceName', // 名称筛选类型
        enable: -1 // 发布状态0 false 1 true
      },
      enableStatus: [
        { label: this.$t('labels.all'), value: -1 },
        { label: this.$t('labels.service.publish_on'), value: 1 },
        { label: this.$t('labels.service.publish_off'), value: 0 }
      ],
      showCreateComp: false,
      showEditComp: false,
      showClientComp: false,
      showTestComp: false,
      showDeleteComp: false,
      showUpdateComp: false,
      showBatchUpdateComp: false,
      modelDetailData: {
        'name': '',
        'description': '',
        'create_time': '',
        'updated_time': ''
      },
      toEditData: {},
      clientData: {},
      selectedModelId: 0,
      selectedModelInputSchema: null,
      selectedModelPath: '',
      batchObjectsList: [], // 多选的id集合
      freshTimer: null, // 轮询定时器
      batchButtons: [{ id: 1, text: this.$t('buttons.service.model.batch_publish_on'), iconClass: 'service_batch_on', method: () => { this.batchPublishOperation('on') } },
        { id: 2, text: this.$t('buttons.service.model.batch_publish_off'), iconClass: 'service_batch_off', method: () => { this.batchPublishOperation('off') } }
        // { id: 3, text: this.$t('buttons.service.model.batch_update'), iconClass: 'service_batch_update', method: () => { this.batchUpdateModelData() } }
      ], // 批量按钮组,,TODO: 1.9.0版本隐藏‘更新’与‘批量更新操作’
      actionServiceID: null
    }
  },
  created() {
    this.getTableInitData()
  },
  destroyed() { // 离开当前页面后需要停止轮询定时器
    clearInterval(this.freshTimer)
  },
  methods: {
    // 定时刷新table列表，不会产生刷新效果
    intervalFreshPage() {
      this.freshTimer = setInterval(() => {
        for (let i = 0; i < this.serviceModelDataList.length; i++) {
          if (this.serviceModelDataList[i].state === 'deploying') {
            this.freshPage(false)
            i--
            return
          }
        }
        clearInterval(this.freshTimer)
      }, 5000)
    },
    freshPage: debounce(function(interval) { // 防抖刷新
      this.getTableSearchData(this.listQuery.page, interval)
    }, 0),
    // 无额外参数配置，获取数据
    getTableInitData() {
      this.isLoading = true
      this.listQuery.page = 1
      getServicesData().then(res => {
        this.isLoading = false
        this.listQuery.total = res.data.count
        this.serviceModelDataList = []
        const resultsData = res.data.results
        resultsData.forEach(item => {
          const eachServiceModelDataListObject = item
          eachServiceModelDataListObject['editname'] = false
          eachServiceModelDataListObject['editdescription'] = false
          this.serviceModelDataList.push(eachServiceModelDataListObject)
        })
        // 初始化，删除，新增操作都需要回到无条件筛选的第一页，第一页可能存在需要轮询的状态，所以都进行重新轮询操作
        clearInterval(this.freshTimer)
        this.intervalFreshPage()
      }).catch(error => {
        console.log('getServicesData error:', error)
        this.isLoading = false
      })
      // this.$store.state.user.id
    },
    getTableSearchData(page, interval) {
      // this.isLoading = true
      this.listQuery.page = page // 搜索时页码置为1
      // todo: this.filter
      const searchFilter = {}
      if (this.filter.name !== '') {
        if (this.filter.nameType === 'serviceName') {
          searchFilter['name'] = this.filter.name
        } else if (this.filter.nameType === 'modelName') {
          searchFilter['model_name'] = this.filter.name
        }
      }
      if (this.filter.enable !== -1) {
        searchFilter['enabled'] = this.filter.enable
      }
      searchFilter['page'] = this.listQuery.page
      getServicesData(searchFilter).then(res => {
        // console.log('getServicesSearchData', res)
        // this.isLoading = false
        this.listQuery.total = res.data.count
        this.serviceModelDataList = []
        const resultsData = res.data.results
        resultsData.forEach(item => {
          const eachServiceModelDataListObject = item
          eachServiceModelDataListObject['editname'] = false
          eachServiceModelDataListObject['editdescription'] = false
          this.serviceModelDataList.push(eachServiceModelDataListObject)
        })
        if (interval) { // 新获取的serviceModelDataList数据，需要进行部署中状态轮询时，将getTableSearchData()第二个参数设为true
          // console.log('interval')
          clearInterval(this.freshTimer)
          this.intervalFreshPage()
        }
      }).catch(error => {
        console.log('getServicesSearchData error:', error)
        // this.isLoading = false
      })
    },
    handleCurrentChange(val) {
      // 翻页后，对新获取的当前界面上表格数据的部署中状态条目进行状态轮询
      this.getTableSearchData(val, true)
    },
    closeDialog(val) {
      if (val === 'create') {
        this.showCreateComp = false
      } else if (val === 'edit') {
        this.showEditComp = false
      } else if (val === 'client') {
        this.showClientComp = false
      } else if (val === 'test') {
        this.showTestComp = false
      } else if (val === 'delete') {
        this.showDeleteComp = false
      } else if (val === 'update') {
        this.showUpdateComp = false
      } else if (val === 'batch_update') {
        this.showBatchUpdateComp = false
      }
    },
    openDialog(val) {
      // TODO: switch
      if (val === 'create') {
        this.showCreateComp = true
      } else if (val === 'edit') {
        this.showEditComp = true
      } else if (val === 'client') {
        this.showClientComp = true
      } else if (val === 'test') {
        this.showTestComp = true
      }
    },
    getCreatedFormData(val) {
      // DONE: 创建API
      // this.isLoading = true
      postServiceData(val).then(res => {
        this.getTableInitData() // 创建后，回到无条件筛选第一页数据，可见第一行为新增数据
      }).catch(error => {
        console.log('getServicesData error:', error)
        // this.isLoading = false
        this.$message({
          type: 'error',
          message: this.$t('messages.create_failed'),
          duration: 2000
        })
      })
    },
    getToChangeEnabledStatus(val, enable) {
      // val: rowid;  enable: true/false
      console.log('getToChangeEnabledStatus', val, enable)
      if (enable === true) {
        // 发布, 需要定时更新列表以获取最新状态
        putServiceEnable(val).then(res => {
          // console.log('enable', res)
          // 重新获得分页数据， 刷新table
          this.freshPage(true) // 只有当serviceModelDataList中state改变为deploying的情况下（原有的变更为deploying，或者新增列表项是deploying），刷新的时候重新启动新的状态轮询
        }).catch(error => {
          this.freshPage(false)
          console.log('putServiceEnable error', error)
        })
      } else if (enable === false) {
        // 停用
        putServiceDisable(val).then(res => {
          // console.log('disabled', res)
          this.freshPage(false)
        }).catch(error => {
          this.freshPage(false)
          console.log('putServiceDisable error', error)
        })
      }
    },
    getSelectedModelData(modelid, modeltype) {
      const that = this
      if (modeltype === 'model') {
        getAllModel(undefined, modelid).then(res => {
          const modelData = res.data
          that.modelDetailData = {
            'name': modelData.name,
            'description': modelData.description,
            'create_time': modelData.created_at,
            'updated_time': modelData.updated_at
          }
        }).catch(error => {
          that.modelDetailData = {
            'name': '',
            'description': '',
            'create_time': '',
            'updated_time': ''
          }
          console.log('getAllModel error', error)
        })
      } else if (modeltype === 'pipeline') {
        getPipeline(modelid).then(res => {
          const modelData = res.data
          that.modelDetailData = {
            'name': modelData.name,
            'description': modelData.description,
            'create_time': modelData.created_at,
            'updated_time': modelData.updated_at
          }
        }).catch(error => {
          that.modelDetailData = {
            'name': '',
            'description': '',
            'create_time': '',
            'updated_time': ''
          }
          console.log('getPipeline error', error)
        })
      }
    },
    getToEditData(val) {
      this.toEditData = val
    },
    getClientData(val) {
      this.clientData = val
    },
    getEditedFormData(val) {
      // 编辑服务，可以从table项的编辑按钮进入，或点击name，description的table cell，进行局部编辑
      patchServiceData(val.id, { 'name': val.name, 'description': val.description }).then(res => {
        this.freshPage(false)
      }).catch(error => {
        console.log('patchServicesData error:', error)
        this.$message({
          type: 'error',
          message: this.$t('messages.edit_failed'),
          duration: 2000
        })
      })
    },
    getToTestData(serviceid, model, path) {
      // TODO: 获取模型保存的算法参数
      this.selectedModelId = Number(model.id)
      this.selectedModelInputSchema = null
      if (Object.prototype.hasOwnProperty.call(model, 'input_schema')) {
        const schema = model.input_schema
        const new_input_schema_obj = []
        schema.map(item => {
          if (item instanceof Array) {
            item.map(c_item => {
              new_input_schema_obj.push(c_item)
              // Object.assign(new_input_schema_obj, c_item)
            })
          } else {
            new_input_schema_obj.push(item)
          }
        })
        this.selectedModelInputSchema = new_input_schema_obj
      }
      this.selectedModelPath = path
    },
    updateDialogConfirmClick() {
      // 单选在此处进行API交互
      // console.log('updateDialogConfirmClick', this.actionServiceID)
      this.showUpdateComp = false
      // 单独行 操作
      putServiceRedeploy(this.actionServiceID).then(res => {
        if (res.status === 204) {
          // this.$message({
          //   type: 'success',
          //   message: this.$t('messages.service.update_success'),
          //   duration: 2000
          // })
          this.freshPage(true)
        } else {
          this.$message({
            type: 'error',
            message: this.$t('messages.service.update_failed'),
            duration: 2000
          })
        }
      }).catch(error => {
        this.$message({
          type: 'error',
          message: error.response.data.detail,
          duration: 2000
        })
      })
    },
    batchUpdateDialogConfirmClick() {
      // 多选都在此处进行API交互
      // console.log('batchUpdateDialogConfirmClick', this.batchObjectsList)
      this.showBatchUpdateComp = false
      // 批量操作
      const batchIds = []
      this.batchObjectsList.map(item => {
        batchIds.push(item.id)
      })
      putBatchServicesRedeploy({ 'service_ids': batchIds }).then(res => {
        // console.log('redeploy', res)
        if (res.status === 204) {
          // this.$message({
          //   type: 'success',
          //   message: this.$t('messages.service.batch_update_success'),
          //   duration: 2000
          // })
          this.freshPage(true)
        } else {
          this.$message({
            type: 'error',
            message: this.$t('messages.service.batch_update_failed'),
            duration: 2000
          })
        }
      }).catch(error => {
        console.log('putBatchServicesRedeploy error', error)
        this.$message({
          type: 'error',
          message: error.response.data.detail,
          duration: 2000
        })
      })
    },
    getToUpdateModelData(serviceid, modelid) {
      // 单列表项update
      this.showUpdateComp = true
      this.actionServiceID = serviceid
    },
    deleteDialogConfirmClick() {
      // console.log('getToDeleteId', this.actionServiceID)
      this.showDeleteComp = false
      // API
      deleteServiceData(this.actionServiceID).then(res => {
        if (res.status === 204) {
          this.isLoading = false
          this.$message({
            type: 'success',
            message: this.$t('messages.delete_success'),
            duration: 2000
          })
          this.getTableInitData() // 删除操作后，暂且返回第一页数据
        } else {
          this.$message({
            type: 'error',
            message: this.$t('messages.delete_failed'),
            duration: 2000
          })
        }
      }).catch(error => {
        this.$message({
          type: 'error',
          message: error.response.data.detail,
          duration: 2000
        })
      })
    },
    getToDeleteId(val) {
      this.showDeleteComp = true
      this.actionServiceID = val
    },
    getMultipleSelection(val) {
      // 全选列表的时候，要停止进行间隔状态轮询，否则会刷新界面。选中会清零；当已选中的都取消后，可恢复轮询
      // console.log('item', val.length)
      if (val.length !== 0) {
        clearInterval(this.freshTimer)
      } else {
        clearInterval(this.freshTimer)
        this.intervalFreshPage()
      }
      this.batchObjectsList = val.map(item => item)
      // console.log('batchObjectsList', this.batchObjectsList)
    },
    batchUpdateModelData() {
      if (this.batchObjectsList.length !== 0) {
        this.showBatchUpdateComp = true
      }
    },
    batchPublishOperation(type) {
      // console.log('321', type)
      if (this.batchObjectsList.length !== 0) {
        const batchIds = []
        this.batchObjectsList.map(item => {
          if (item.state !== 'deploying') { // TODO: ??是否需要
            // deploying的禁用状态更改操作
            if (item.enabled === false && type === 'on') {
              batchIds.push(item.id)
            } else if (item.enabled === true && type === 'off') {
              batchIds.push(item.id)
            }
          }
        })
        // console.log('batchPublishOperation', type, batchIds)
        if (type === 'on') {
          putBatchServicesEnable({ 'service_ids': batchIds }).then(res => {
            // console.log('enable', res)
            // 重新获得分页数据， 刷新table
            // this.$message({
            //   type: 'success',
            //   message: this.$t('messages.service.batch_enabled_success'),
            //   duration: 2000
            // })
            this.freshPage(true)
          }).catch(error => {
            this.$message({
              type: 'error',
              message: this.$t('messages.service.batch_enabled_failed'),
              duration: 2000
            })
            this.freshPage(false)
            console.log('putBatchServicesEnable error', error)
          })
        } else if (type === 'off') {
          // 批量停用
          putBatchServicesDisable({ 'service_ids': batchIds }).then(res => {
            // console.log('disabled', res)
            // this.$message({
            //   type: 'success',
            //   message: this.$t('messages.service.batch_disabled_success'),
            //   duration: 2000
            // })
            this.freshPage(false)
          }).catch(error => {
            this.$message({
              type: 'error',
              message: this.$t('messages.service.batch_disabled_failed'),
              duration: 2000
            })
            this.freshPage(false)
            console.log('putBatchServicesDisable error', error)
          })
        }
      }
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
@import "src/assets/styles/new-base.scss";
  $cpadd:10px;
  $padleft: 20px;
  .app_container{
    /deep/ .filter_header{
      position: relative;
      .service-model-filter {
      margin-left: 32px;
      padding-bottom: 0;
      .el-button {
        width: 132px;
        height: 40px;
        margin-top: 18px;
        border-radius: 12px;
        color: #fff;
        background-color: #3d65c9;
        &:hover {
          background-color: #6484d4;
        }
        &:active {
          background-color: #0f32b5;
        }
      }
      .header-btn_creat{
        float: right;
        margin-right: 30px;
        display:inline-block;
      }
      .el-input-group__append, .el-input-group__prepend {
        width: 120px;
        border-radius: 12px 0px 0px 12px;
        background-color: #fff;
      }
      .el-input-group--prepend .el-input__inner {
        height: 40px;
        border-radius: 0px 12px 12px 0px;
      }
      .el-input-group.prepend-select-input {
        width: 344px;
        height: 40px;
      }
      .el-select.normal-select {
        margin-top: 18px;
        width: 152px;
        height: 40px;
        margin-right: 8px;
        padding-left: 16px;
         .el-input {
           .el-input__inner {
            width: 152px;
            height: 40px;
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
    }
      // .service-model-filter{
      //   .link{
      //     color: #2ca0d7;
      //     position: absolute;
      //     right: 30px;
      //     height: 20px;
      //     line-height: 20px;
      //     top: 0;
      //     bottom:0;
      //     margin: auto
      //   }
      // }
    }
    .main_container{
      .el-divider--horizontal {
        margin: 56px 0;
      }
      .main-top-btn{
        float: left;
        display:inline-block;
        margin-left: 16px;
        // height: 56px;
      }
    }
    .svg-next {
      font-size: 22px;
      cursor: pointer;
    }
  }
</style>
