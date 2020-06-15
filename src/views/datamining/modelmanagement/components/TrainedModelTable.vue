<template>
  <div style="height: 630px">
    <el-table
      key="aTable"
      :data="dataList"
      :highlight-current-row="false"
      fit
      style="width: 100%;height:615px;overflow-y: auto;">
      <el-table-column :label="$t('labels.id')" fixed="left" align="left" property="id" width="80">
        <template slot-scope="scope">
          <span>{{ (page - 1)*10 + scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('labels.modelmanage.model_name')" show-overflow-tooltip fixed="left" align="left" property="model_name" width="200">
        <template slot-scope="scope">
          <span class="description">{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('labels.modelmanage.model_desc')" show-overflow-tooltip align="left" property="model_desc" min-width="300">
        <template slot-scope="scope">
          <span v-if="!scope.row.description">--</span>
          <span v-else>{{ scope.row.description }}</span>
          <!-- <el-popover v-else placement="top-start" width="200" trigger="hover">
            <p>{{ scope.row.description }}</p>
            <div slot="reference" class="description">
              {{ scope.row.description }}
            </div>
          </el-popover> -->
        </template>
      </el-table-column>
      <el-table-column :label="$t('labels.modelmanage.model_from')" show-overflow-tooltip align="left" property="model_from" width="200">
        <template slot-scope="scope">
          <span>{{ scope.row.experiment }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('labels.modelmanage.create_time')" show-overflow-tooltip align="left" property="create_time" width="200">
        <template slot-scope="scope">
          <span :title="scope.row.create_time">{{ scope.row.created_at }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('labels.modelmanage.creator')" show-overflow-tooltip align="left" width="150">
        <template slot-scope="scope">
          <span>{{ scope.row.creator.username }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column :label="$t('labels.modelmanage.model_origin')" align="center" property="data_src_list">
        <template slot-scope="scope">
          <el-button size="small" type="primary" plain @click="relateData(scope.row)">{{ $t('labels.modelmanage.model_origin') }}</el-button>
        </template>
      </el-table-column> -->
      <el-table-column :label="$t('labels.actions')" align="left" class-name="small-padding fixed-width" width="300">
        <template slot-scope="scope">
          <div style="height: 36px">
            <!-- <el-button v-is-show="{name:'trainedmodeledit'}" type="primary" size="small" plain @click="handlDownload(scope.row)">{{ $t('buttons.downLoad') }}</el-button> -->
            <el-button class="relateData" style="width: 90px;" @click="relateData(scope.row)">{{ $t('labels.modelmanage.model_origin') }}</el-button>
            <el-button style="margin-left: 16px;" @click="handleUpdate(scope.row)">{{ $t('buttons.edit') }}</el-button>
            <el-button style="margin-left: 16px;" @click="handleDelete(scope.row)">{{ $t('buttons.delete') }}</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <!-- 更新模型操作 -->
    <el-dialog :close-on-click-modal="false" :visible.sync="updateDialogFormVisible" :title="$t('labels.edit')" width="408" class="new-dialog">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="center" label-width="70px" style="width: 400px;">
        <el-form-item :label="$t('labels.modelmanage.model_name')" prop="name">
          <el-input v-model="temp.name" class="new-input"/>
        </el-form-item>
        <el-form-item :label="$t('labels.modelmanage.model_desc')" prop="description">
          <el-input v-model="temp.description" class="new-input"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="updateDialogFormVisible = false" >{{ $t('buttons.cancel') }}</el-button>
        <el-button type="primary" @click="updateData">{{ $t('buttons.confirm') }}</el-button>
      </div>
    </el-dialog>
    <!-- 已关联的数据源 -->
    <el-dialog :close-on-click-modal="false" :visible.sync="dialogFormShow" :title="$t('labels.modelmanage.model_origin')" width="408px" class="new-dialog" @close="restData">
      <el-form ref="groupForm" status-icon label-width="100px" class="ruleForm">
        <el-tree
          ref="permTreeRef"
          :data="allOrigin"
          :expand-on-click-node="true"
          show-checkbox
          node-key="id"
          default-expand-all>
          <span slot-scope="{ node, data }" class="custom-tree-node">
            <span>
              <span class="mgl-10" >{{ data.name }}</span>
            </span>
          </span>
        </el-tree>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormShow = false">{{ $t('buttons.cancel') }}</el-button>
        <el-button type="primary" @click="uploadFunc">{{ $t('buttons.confirm') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { uploadModel, deleteModel, getModelCanUseOrigin, getModelRelateOrigin } from '@/api/datamining/model'
// import { getRealTimeOrigin } from '@/api/datamining/real/realorigin'
// import { getToken, getSessionkey } from '@/utils/auth'
// import { JSEncrypt } from 'jsencrypt'
import { getBaseURL } from '@/utils/index.js'
import { validateZName } from '@/utils/validate'
export default {
  props: {
    dataList: {
      type: Array,
      default: null
    },
    authList: {
      type: Array,
      default: null
    },
    listLoading: {
      type: Boolean,
      default: null
    },
    page: {
      type: Number,
      default: 1
    },
    pageLength: {
      type: Number,
      default: 0
    }
  },
  data() {
    const modelname = (rule, value, callback) => {
      if (!value) {
        callback(new Error(this.$t('rules.require_modelname')))
      } else if (!validateZName(value)) {
        callback(new Error(this.$t('rules.invalid_modelname')))
      } else {
        callback()
      }
    }
    return {
      // el-table的 :height="" 根据界面设置表格高度，如果要直接使用定值height:"500"
      tableHeight: window.innerHeight - 390,
      updateDialogFormVisible: false,
      temp: {
        id: null,
        name: '',
        description: ''
      },
      rules: {
        name: [{ required: true, trigger: 'blur', validator: modelname }]
      },
      // 已关联的模型
      dialogFormShow: false,
      allOrigin: [],
      originId: '',
      checkBoxStatus: true,
      setId: '',
      aRelateOrigin: [],
      record_name: '',
      record_description: ''
    }
  },
  // created() {
  //   this.getAllOriginData()
  // },
  methods: {
    // 关闭时重置树型控件
    restData() {
      this.$refs.permTreeRef.setCheckedNodes([])
    },
    // 已关联的数据源
    relateData(val) {
      this.$emit('loadingFresh', true)
      getModelCanUseOrigin(val.id).then(res => { // 获取实时源列表
        this.allOrigin = res.data
      }).then(() => {
        getModelRelateOrigin(val.id).then(res => { // 获取已经关联的
          this.$emit('loadingFresh', false)
          this.dialogFormShow = true
          this.originId = val.id
          const originData = res.data.data
          if (!originData.length) return
          const selfOrigin = originData.map(item => {
            return { id: item.id }
          })
          this.aRelateOrigin = originData.map(item => {
            return item.id
          })
          this.$nextTick(() => {
            this.$refs.permTreeRef.setCheckedNodes(selfOrigin)
          })
        })
      }).catch(err => {
        console.log(err)
        this.$emit('loadingFresh', false)
      })
    },
    // 判断已关联的数据源是否发生了修改
    isRelateOriginChange() {
      const originArr = this.$refs.permTreeRef.getCheckedNodes().map(item => item.id)
      return JSON.stringify(originArr.sort((a, b) => a - b)) === JSON.stringify(this.aRelateOrigin.sort((a, b) => a - b))
    },
    // 已关联数据源的修改
    uploadFunc() {
      if (this.isRelateOriginChange()) {
        this.dialogFormShow = false
        this.aRelateOrigin = []
        return
      }
      const idArr = this.$refs.permTreeRef.getCheckedNodes().map(item => item.id)
      const idStr = idArr.join(',')
      this.$emit('loadingFresh', true)
      this.dialogFormShow = false
      uploadModel(this.originId, { data_src: idStr }).then(res => {
        this.dialogFormShow = false
        this.$emit('loadingFresh', false)
        this.$message.success(this.$t('labels.uploadSuccess'))
        // this.freshData()
      }).catch(e => {
        this.dialogFormShow = false
        this.$emit('loadingFresh', false)
        this.$message.error(this.$t('labels.uploadFaild'))
      })
    },
    // 刷新数据
    freshData() {
      this.$emit('change')
    },
    // 点击列表项按钮查看详情
    handleUpdate(row) {
      const temp = JSON.parse(JSON.stringify(row))
      this.record_name = temp.name
      this.record_description = temp.description
      this.temp.id = row.id
      this.temp.name = row.name
      this.temp.description = row.description
      this.updateDialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          if (this.record_name === this.temp.name && this.record_description === this.temp.description) {
            this.updateDialogFormVisible = false
            return
          }
          this.$emit('loadingFresh', true)
          this.updateDialogFormVisible = false
          uploadModel(this.temp.id, this.temp).then(res => {
            this.$message({
              type: 'success',
              message: this.$t('labels.uploadSuccess'),
              duration: 1000
            })
            this.$emit('change', this.page)
          }).catch(e => {
            this.updateDialogFormVisible = false
            this.$emit('loadingFresh', false)
            this.$message({
              type: 'error',
              message: this.$t('labels.uploadFaild'),
              duration: 1000
            })
          })
        }
      })
    },
    // 导出模型
    handlDownload(val) {
      this.$confirm(this.$t('strings.modelmanage.download'), this.$t('labels.reminder'), confirm).then(() => {
        if (!val.model_input_json) {
          this.$message({
            type: 'error',
            message: this.$t('labels.modelmanage.model_falid'),
            duration: 1000
          })
          return
        }
        const path_str = JSON.parse(val.model_input_json).config_info.model_path.slice()
        // window.open(process.env.BASE_API + '/datamodeldownload/?file_path=' + escape(path_str) + '&download_path=' + val.model_name)
        window.open(`${getBaseURL()}/datamodeldownload/?file_path=${escape(path_str)}&download_path=${val.model_name}`)
      }).catch((e) => {
        this.$message({
          type: 'info',
          message: this.$t('messages.cancel_operate'),
          duration: 1000
        })
      })
    },
    // 删除模型
    handleDelete(val) {
      getModelRelateOrigin(val.id).then(res => {
        const originData = res.data.data
        if (originData.length) {
          this.$message.error(this.$t('strings.modelmanage.delete_model_warning'))
        } else {
          this.$confirm(this.$t('strings.modelmanage.delete_trained'), this.$t('labels.reminder'), confirm).then(() => {
            this.$emit('loadingFresh', false)
            deleteModel(val.id).then(res => {
              this.$message.success(this.$t('messages.delete_success'))
              if (this.page !== 1 && this.pageLength === 1) {
                this.$emit('deleteFunc', this.page - 1)
              } else {
                this.$emit('change', this.page)
              }
            }).catch((e) => {
              this.$message.error(e.message)
              this.listLoading = false
            })
          }).catch(() => {
            this.listLoading = false
          })
        }
      })
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
@import "src/assets/styles/new-base.scss";

.ruleForm {
  margin-left: 40px;
}
.originStyle{
  margin-bottom: 10px;
  font-size: 16px;
  .nameStyle{
    margin-right: 10px;
  }
}
</style>

