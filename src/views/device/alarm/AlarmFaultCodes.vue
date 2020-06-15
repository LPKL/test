<!-- 故障代码功能主界面 -->
<template>
  <div class="app_container">
    <!-- 搜索 -->
    <el-header class="filter_header">
      <div class="filter-container">
        <el-input v-model="filter.faultcode" :placeholder="$t('labels.alarm.fault_code')" suffix-icon="el-icon-search" class="new-input" style="width: 200px;" @change="handleFilter"/>
        <el-input v-model="filter.faultname" :placeholder="$t('labels.alarm.fault_name')" suffix-icon="el-icon-search" class="new-input" style="width: 200px;" @change="handleFilter"/>
        <div class="header-btn">
          <el-button class="new-btn-other normal-btn" @click="restoreTable">{{ $t('buttons.reset') }}</el-button>
        </div>
        <!-- 创建 -->
        <div class="header-btn_creat">
          <el-button class="el-add_alarm" icon="el-icon-plus" @click="openCreateFaultCodeDialog">{{ textMap.created }}</el-button>
        </div>
      </div>
    </el-header>
    <!-- 列表 -->
    <el-main class="main_container">
      <el-table
        v-loading.body="isLoading"
        :data="faultCodeTableData"
        :element-loading-text="$t('strings.loading')"
        fit
        highlight-current-row
        style="width: 100%;height:615px;overflow-y: auto;">
        <el-table-column :label="$t('labels.numb')" align="center" type="index" width="65"/>
        <el-table-column :label="$t('labels.alarm.fault_code')" show-overflow-tooltip property="code"/>
        <el-table-column :label="$t('labels.alarm.fault_name')" show-overflow-tooltip property="name"/>
        <!-- <el-table-column :label="$t('labels.alarm.fault_kind')" property="fault_kind"/> -->
        <el-table-column :label="$t('labels.alarm.fault_desc')" show-overflow-tooltip property="description"/>
        <el-table-column :label="$t('labels.create_time')" show-overflow-tooltip property="create_time"/>
        <el-table-column :label="$t('labels.alarm.creator')" show-overflow-tooltip prop="creator.username"/>
        <el-table-column :label="$t('labels.actions')" prop="is_active" align="center" width="260">
          <template slot-scope="scope">
            <div style="height: 36px;">
              <el-button class="new-btn-other" @click="openDetailDialog(scope.row)">{{ $t('buttons.detail') }}</el-button>
              <el-button v-if="$store.state.user.id === scope.row.creator.id" class="new-btn-other" @click="openUpdateFaultCodeDialog(scope.row)">{{ $t('buttons.edit') }}</el-button>
              <el-button v-if="$store.state.user.id === scope.row.creator.id" class="new-btn-other delete" @click="openDeleteDialog(scope.row)">{{ $t('buttons.delete') }}</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页器 -->
      <div class="pagination-container">
        <el-pagination
          :current-page="faultCodeTablePage.current"
          :page-size="10"
          :total="faultCodeTablePage.total"
          layout="total, prev, pager, next, jumper"
          @current-change="handleCurrentChange"/>
      </div>
    </el-main>
    <!-- 预览弹框 -->
    <el-dialog :title="textMap[dialogType]" :visible.sync="detailDialogFormVisible" :close-on-click-modal="false" width="400px" class="new-dialog">
      <table class="dialogDetail">
        <tr style="vertical-align:top"><td><label>{{ $t('labels.alarm.fault_code') }} : </label></td><td>{{ faultCodeDetailData.code }}</td></tr>
        <tr style="vertical-align:top"><td><label>{{ $t('labels.alarm.fault_name') }} : </label></td><td>{{ faultCodeDetailData.name }}</td></tr>
        <!-- <tr style="vertical-align:top"><td><label>{{ $t('labels.alarm.fault_kind') }} : </label></td><td>{{ faultCodeDetailData.fault_kind }}</td></tr> -->
        <tr style="vertical-align:top"><td><label>{{ $t('labels.alarm.fault_desc') }} : </label></td><td>{{ faultCodeDetailData.description }}</td></tr>
        <tr style="vertical-align:top"><td><label>{{ $t('labels.alarm.fault_origin') }} : </label></td><td>{{ faultCodeDetailData.reason }}</td></tr>
        <tr style="vertical-align:top"><td><label>{{ $t('labels.alarm.action_opinion1') }} : </label></td><td><div style="white-space: pre-wrap;" v-html="faultCodeDetailData.opinion"/></td></tr>
        <tr style="vertical-align:top"><td><label>{{ $t('labels.alarm.run_trips') }} : </label></td><td>{{ faultCodeDetailData.other }}</td></tr>
      </table>
    </el-dialog>
    <!-- 新增或编辑（弹框样表单输入） -->
    <el-dialog :title="textMap[dialogType]" :close-on-click-modal="false" :visible.sync="editDialogFormVisible" width="500px" class="new-dialog">
      <el-form ref="editFaultCodeForm" :model="editFaultCodeForm" :rules="rules" label-position="left" status-icon label-width="120px" class="ruleForm">
        <el-form-item :label="$t('labels.alarm.fault_code')" prop="code">
          <el-input v-model="editFaultCodeForm.code" :disabled="dialogType==='update'?true:false" class="new-input"/>
        </el-form-item>
        <el-form-item :label="$t('labels.alarm.fault_name')" prop="name">
          <el-input v-model="editFaultCodeForm.name" class="new-input"/>
        </el-form-item>
        <!-- <el-form-item :label="$t('labels.alarm.fault_kind')" prop="fault_kind">
          <el-input v-model="editFaultCodeForm.fault_kind"/>
        </el-form-item> -->
        <el-form-item :label="$t('labels.alarm.fault_desc')" prop="description">
          <el-input v-model="editFaultCodeForm.description" type="textarea" class="new-input"/>
        </el-form-item>
        <el-form-item :label="$t('labels.alarm.fault_origin')" prop="reason">
          <el-input v-model="editFaultCodeForm.reason" class="new-input"/>
        </el-form-item>
        <el-form-item :label="$t('labels.alarm.action_opinion1')" prop="opinion">
          <comp-mavon-editor v-model="editFaultCodeForm.opinion" :subfield="false" :toolbars="actionoptiontool" :placeholder="$t('strings.alarm.action_opinion_text')" style="min-height: 200px;"/>
        </el-form-item>
        <el-form-item :label="$t('labels.alarm.other_info1')" prop="other">
          <el-input v-model="editFaultCodeForm.other" class="new-input" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogFormVisible = false">{{ $t('buttons.cancel') }}</el-button>
        <el-button type="primary" @click="updateFaultCodeData">{{ $t('buttons.submit') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getFaultCodesData, postFaultCodeData, patchFaultCodeData, deleteFaultCodeData } from '@/api/device/alarm'
import { validateInputName } from '@/utils/rules'
import { mavonEditor } from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'
export default {
  name: 'AlarmFaultCodes',
  components: {
    'comp-mavon-editor': mavonEditor
  },
  data() {
    const checkFaultCodeByAPI = (rules, value, callback) => {
      if (!value) {
        callback(new Error(this.$t('rules.required')))
      } else {
        if (this.dialogType === 'created') {
          getFaultCodesData({ 'code': this.editFaultCodeForm.code }).then(res => {
            if (res.data.count === 0) {
              callback()
            } else {
              callback(new Error(this.$t('rules.duplicate_name')))
              this.editFaultCodeForm.code = ''
            }
          }).catch(error => {
            console.log('getFaultCodesData', error)
            callback()
          })
        } else {
          callback()
        }
      }
    }
    return {
      editid: 0,
      filter: { // 条件筛选
        faultcode: '',
        faultname: ''
      },
      isLoading: false,
      faultCodeTableData: [],
      faultCodeTablePage: {
        current: 1,
        total: 0
      },
      textMap: {
        created: this.$t('buttons.create') + this.$t('route.faultCodes'),
        update: this.$t('buttons.edit') + this.$t('route.faultCodes'),
        detail: this.$t('route.faultCodes') + this.$t('buttons.detail')
      },
      faultCodeDetailData: { // 详情预览model
        code: '',
        name: '',
        // fault_kind: '',
        description: '',
        reason: '',
        opinion: '',
        other: ''
      },
      editFaultCodeForm: { // 创建/编辑表单model
        id: undefined,
        code: '',
        name: '',
        // fault_kind: '',
        description: '',
        reason: '',
        opinion: '',
        other: ''
      },
      rules: {
        code: [
          { required: true, validator: checkFaultCodeByAPI, trigger: 'change' },
          { required: true, trigger: 'blur', validator: validateInputName }
        ],
        name: [
          { required: true, message: this.$t('rules.required'), trigger: 'blur' },
          { required: true, trigger: 'blur', validator: validateInputName }
        ]
      },
      dialogType: 'created',
      editDialogFormVisible: false,
      detailDialogFormVisible: false,
      actionoptiontool: { // markdown编辑器的toolbar定义
        ol: true // 有序列表
      }
    }
  },
  created() {
    this.getPageTable(1)
  },
  methods: {
    // 获取列表数据
    getPageTable(cpage) {
      this.isLoading = true
      getFaultCodesData({
        'fuzzy_code': this.filter.faultcode,
        'fuzzy_name': this.filter.faultname,
        'page': cpage }).then(res => {
        this.faultCodeTableData = res.data.data
        this.faultCodeTablePage.total = res.data.count
        this.isLoading = false
      }).catch(error => {
        console.log('getFaultCodesData error ', error)
        this.isLoading = false
      })
    },
    // 分页器当前页val
    handleCurrentChange(val) {
      this.faultCodeTablePage.current = val
      this.getPageTable(val)
    },
    // 搜索
    handleFilter() {
      this.getPageTable(1)
    },
    // 搜索复位
    restoreTable() {
      this.filter.faultcode = ''
      this.filter.faultname = ''
      this.getPageTable(1)
    },
    // 展示预览界面
    openDetailDialog(row) {
      this.dialogType = 'detail'
      this.detailDialogFormVisible = true
      this.faultCodeDetailData.code = row.code
      this.faultCodeDetailData.name = row.name
      // this.faultCodeDetailData.fault_kind = row.fault_kind
      this.faultCodeDetailData.description = row.description
      this.faultCodeDetailData.reason = row.reason
      // 将↵转为换行符，并用v-html显示出来
      this.faultCodeDetailData.opinion = row.opinion.replace(/↵/g, '\n').replace(/ /g, ' ')
      this.faultCodeDetailData.other = row.other
    },
    // 展示添加表单
    openCreateFaultCodeDialog() {
      this.dialogType = 'created'
      this.editDialogFormVisible = true
      this.$nextTick(function() {
        this.$refs['editFaultCodeForm'].resetFields()
        this.editFaultCodeForm.id = -1
      })
    },
    // 展示编辑表单
    openUpdateFaultCodeDialog(row) {
      this.dialogType = 'update'
      this.editDialogFormVisible = true
      this.$nextTick(function() {
        this.$refs['editFaultCodeForm'].resetFields()
        // this.editFaultCodeForm = Object.assign({}, row)
        this.editFaultCodeForm = { ...row }
      })
    },
    // 添加或编辑的操作
    updateFaultCodeData() {
      this.$refs['editFaultCodeForm'].validate(valid => {
        if (valid) {
          // const tempData = Object.assign({}, this.editFaultCodeForm)
          const tempData = { ...this.editFaultCodeForm }
          if (this.dialogType === 'created') {
            postFaultCodeData(tempData).then(res => {
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
            patchFaultCodeData(tempData.id, tempData).then(res => {
              this.getPageTable(this.faultCodeTablePage.current)
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
    // 删除
    openDeleteDialog(row) {
      this.$confirm(this.$t('strings.alarm.delete_faultcode'), this.$t('labels.reminder'), confirm).then(() => {
        deleteFaultCodeData(row.id).then(res => {
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
      .header-btn{
        display:inline-block;
        margin-right:30px;
        margin-left: 10px;
        .long-btn{
          width: 95px;
        }
        .normal-btn{
          width: 70px;
        }
      }
    }
  }
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
</style>

