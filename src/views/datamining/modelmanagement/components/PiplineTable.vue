<template>
  <div style="height: 630px">
    <el-table
      :data="dataList"
      :highlight-current-row="false"
      style="width: 100%;height:615px;overflow-y: auto;"
      @cell-click="cellClick">
      <el-table-column :label="$t('labels.id')" fixed="left" align="left" property="id" width="60">
        <template slot-scope="scope">
          <span>{{ (page - 1)*10 + scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('labels.modelmanage.model_name')" prop="name" show-overflow-tooltip fixed="left" align="left" property="model_name" width="150">
        <template slot-scope="scope">
          <el-input v-focus v-if="scope.row.editname" ref="name" v-model="scope.row.name" @blur="lostFcous(scope.row,'name', 'editname')"/>
          <span v-else>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('labels.modelmanage.model_desc')" prop="description" show-overflow-tooltip align="left" property="model_desc">
        <template slot-scope="scope">
          <el-input v-focus v-if="scope.row.editdescription" ref="description" v-model="scope.row.description" @blur="lostFcous(scope.row, 'description', 'editdescription')"/>
          <span v-else >{{ scope.row.description }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('labels.modelmanage.model_from')" show-overflow-tooltip align="left" property="model_from" width="200">
        <template slot-scope="scope">
          <span>{{ scope.row.experiment ? scope.row.experiment.name : '已删除' }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('labels.create_time')" align="left" property="create_time" width="200">
        <template slot-scope="scope">
          <span :title="scope.row.created_at">{{ scope.row.created_at }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('labels.update_time')" align="left" property="create_time" width="200">
        <template slot-scope="scope">
          <span :title="scope.row.updated_at">{{ scope.row.updated_at }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('labels.modelmanage.creator')" show-overflow-tooltip align="left" width="150">
        <template slot-scope="scope">
          <span>{{ scope.row.creator ? scope.row.creator.username: '旧模型' }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('labels.actions')" align="left" class-name="small-padding fixed-width" width="300">
        <template slot-scope="scope">
          <div style="height: 36px">
            <el-button class="relateData" style="width: 90px;" @click="relateData(scope.row)">{{ $t('labels.modelmanage.model_origin') }}</el-button>
            <el-button style="margin-left: 16px;" @click="handleUpdate(scope.row)">{{ $t('buttons.edit') }}</el-button>
            <el-button style="margin-left: 16px;" @click="handleDelete(scope.row)">{{ $t('buttons.delete') }}</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <!-- 更新模型操作 -->
    <el-dialog :close-on-click-modal="false" :visible.sync="updateDialogFormVisible" :title="$t('labels.edit')" width="550" class="new-dialog">
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
import { uploadModel, getDataSourceOrigin } from '@/api/datamining/model'
import { getBaseURL } from '@/utils/index.js'
import { validateZName } from '@/utils/validate'
import { deletePipeline, updatePipeline, getPipeline, pipelineWithSource, getPipelineForSource } from '@/api/experiment/pipelines'
export default {
  directives: {
    focus: {
      inserted: function(el) {
        el.querySelector('input').focus()
      }
    }
  },
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
      treedata: [{
        label: '一级 1'
      }, {
        label: '一级 2'
      }, {
        label: '一级 3'
      }],
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      listSelects: [{ value: 22, label: 1 }, { value: 22, label: 1 }, { value: 22, label: 1 }],
      recordStr: ''
    }
  },
  methods: {
    // 关闭时重置树型控件
    restData() {
      this.$refs.permTreeRef.setCheckedNodes([])
    },
    // 已关联的数据源
    async relateData(val) {
      console.log(val)
      const { in_degrees, out_degrees, id } = val
      if (in_degrees > 1) {
        this.$message.error('暂不支持多输入关联实时源')
        return false
      }
      if (out_degrees > 1) {
        this.$message.error('暂不支持多输出关联实时源')
        return false
      }
      this.$emit('loadingFresh', true)
      try {
        const origin = await getDataSourceOrigin()
        const origined = await getPipelineForSource(id)
        this.allOrigin = origin.data.data
        this.$emit('loadingFresh', false)
        this.dialogFormShow = true
        this.originId = id
        const originData = origined.data
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
      } catch (e) {
        this.$emit('loadingFresh', false)
        console.log(e)
      }
    },
    // 判断已关联的数据源是否发生了修改
    isRelateOriginChange() {
      const originArr = this.$refs.permTreeRef.getCheckedNodes().map(item => item.id)
      return JSON.stringify(originArr.sort((a, b) => a - b)) === JSON.stringify(this.aRelateOrigin.sort((a, b) => a - b))
    },
    // 已关联数据源的修改
    async uploadFunc() {
      if (this.isRelateOriginChange()) {
        this.dialogFormShow = false
        this.aRelateOrigin = []
        return
      }
      const idArr = this.$refs.permTreeRef.getCheckedNodes().map(item => item.id)
      const idStr = idArr.join(',')
      this.$emit('loadingFresh', true)
      this.dialogFormShow = false
      try {
        const res = await pipelineWithSource(this.originId, { datasource_ids: idStr })
        console.log(res)
        this.$emit('loadingFresh', false)
      } catch (e) {
        console.log(e)
        this.$emit('loadingFresh', false)
      }
    },
    // 刷新数据
    freshData() {
      this.$emit('change')
    },
    // 点击列表项按钮查看详情
    handleUpdate(row) {
      const { name, id } = row
      this.$router.push({ path: '/newmodel/pipeline', query: { id: id, name: name }})
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
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
      this.$confirm(this.$t('strings.modelmanage.delete_trained'), this.$t('labels.reminder'), confirm).then(() => {
        this.$emit('loadingFresh', false)
        deletePipeline(val.id).then(res => {
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
      // getModelRelateOrigin(val.id).then(res => {
      //   const originData = res.data.data
      //   if (originData.length) {
      //     this.$message.error(this.$t('strings.modelmanage.delete_model_warning'))
      //   } else {
      //     this.$confirm(this.$t('strings.modelmanage.delete_trained'), this.$t('labels.reminder'), confirm).then(() => {
      //       this.$emit('loadingFresh', false)
      //       deleteModel(val.id).then(res => {
      //         this.$message.success(this.$t('messages.delete_success'))
      //         if (this.page !== 1 && this.pageLength === 1) {
      //           this.$emit('deleteFunc', this.page - 1)
      //         } else {
      //           this.$emit('change', this.page)
      //         }
      //       }).catch((e) => {
      //         this.$message.error(e.message)
      //         this.listLoading = false
      //       })
      //     }).catch(() => {
      //       this.listLoading = false
      //     })
      //   }
      // })
    },
    cellClick(row, column, cell, event) {
      console.log(row)
      const { property } = column
      if (property === 'name' || property === 'description') {
        if (property === 'name') {
          this.$set(row, 'editname', true)
        }
        if (property === 'description') {
          this.$set(row, 'editdescription', true)
        }
        // todo input获取焦点 由于dom渲染原理 页面只能获取一次input焦点 实验$nextTick不能解决问题 如果多次获取需要使用指令
        // this.$nextTick(function() {
        //   console.log(this.$refs[property])
        //   this.$refs[property].focus()
        // })
        if (property === 'name') {
          this.recordStr = row.name
        }
        if (property === 'description') {
          this.recordStr = row.description
        }
      }
    },
    lostFcous(row, name, prop) {
      this.$set(row, prop, false)
      if (prop === 'editname') {
        if (row.name === this.recordStr) return
      } else if (prop === 'editdescription') {
        if (row.description === this.recordStr) return
      }
      const a = {} // 更新
      a[name] = row[name]
      updatePipeline(row.id, { ...a }).then(res => {
        console.log(res)
        this.$message.success('修改成功!')
      }).catch(err => {
        console.log(err)
        this.$message.error(err.message)
        getPipeline(row.id).then(res => {
          console.log(res)
          row[name] = res.data[name]
        })
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

