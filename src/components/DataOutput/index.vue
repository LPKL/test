<template>
  <el-dialog
    v-loading="isLoading"
    :visible.sync="dialogVisible"
    :close-on-click-modal="false"
    :title="title"
    :width="width"
    class="outputDialog">
    <el-form ref="formOutput" :model="output" :rules="rules" label-position="left" label-width="100px">
      <el-form-item v-if="output.type === 'historydata'" :label="$t('strings.dataoutput.name')" prop="name">
        <el-input v-model="output.name" class="new-input" auto-complete="off"/>
      </el-form-item>
      <el-form-item v-if="output.type === 'historydata'" :label="$t('strings.dataoutput.desc')" class="description">
        <el-input :autosize="{ minRows: 2, maxRows: 4}" v-model="output.description" type="textarea" class="new-input" />
      </el-form-item>
      <el-form-item v-if="source.fromChart === 'line_chart'" :label="$t('strings.dataoutput.xrange')" prop="x_axis_min">
        <el-col :span="11">
          <el-input v-model.trim="output.x_axis_min" />
        </el-col>
        <el-col :span="1" style="text-align:center;">至</el-col>
        <el-col :span="11">
          <el-input ref="inputXAxisMax" v-model.trim="output.x_axis_max"/>
        </el-col>
      </el-form-item>
      <el-form-item :label="$t('strings.dataoutput.selFields')" prop="field_names">
        <el-transfer v-model="output.field_names" :props="fieldProps" :titles="fieldTitles" :data="source.fields" filterable/>
      </el-form-item>
      <el-form-item v-if="output.type === 'historydata'" :label="$t('strings.dataoutput.is_private')" prop="private">
        <el-radio-group v-model="output.private">
          <el-radio :label="false" >{{ $t('strings.no') }}</el-radio>
          <el-radio :label="true" >{{ $t('strings.yes') }}</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button class="cancel" @click="dialogVisible = false">{{ $t('buttons.cancel') }}</el-button>
      <el-button :disabled="isSaving" type="primary" @click="save">{{ $t('buttons.confirm') }}</el-button>
    </div>
  </el-dialog>
</template>

<script>
import _throttle from 'lodash/throttle'
export default {
  name: 'DataOutput',
  props: {
    width: {
      type: String,
      default: '484px'
    },
    fieldProps: {
      type: Object,
      default: () => { return { key: 'name', label: 'zname' } }
    }
  },
  data() {
    var checkSelFields = (rule, value, callback) => {
      if (!value || value.length === 0) {
        return callback(new Error(this.$t('strings.dataoutput.validator.fieldEmpty')))
      }
      callback()
    }
    var CheckXRange = (rule, value, callback) => {
      if (value == null || this.$refs.inputXAxisMax.value == null) {
        return callback(new Error(this.$t('strings.dataoutput.validator.xrangeEmpty')))
      }
      callback()
    }
    return {
      isLoading: false,
      isSaving: false,
      title: 'Output',
      dialogVisible: false,
      source: {
        type: 'experiment', // 数据实验、实时数据、周期数据
        fromChart: false, // false:非探查图表，'line','bar','scatter'
        fields: [], // 穿梭框可选字段集
        filterFields: [], // 过滤字段，探查图表中使用的字段
        scatter_data: [] // 散点图，圈选点数据
      },
      output: {
        name: '', // 导出数据集的名称
        description: '', // 导出数据集的说明
        type: 'historydata', // 数据集：historydata,本地下载：csv
        x_axis_min: '', // 折线图x轴范围min
        x_axis_max: '', // 折线图x轴范围max
        field_names: [], // 已选字段
        private: false // 数据集是否私有
      },
      rules: {
        name: [{ required: true, trigger: 'blur', message: this.$t('strings.dataoutput.validator.nameEmpty') }],
        field_names: [{ validator: checkSelFields, trigger: 'change' }],
        x_axis_min: [{ validator: CheckXRange, trigger: 'blur' }, { required: true, trigger: 'blur', message: this.$t('strings.dataoutput.validator.xrangeEmpty') }]
      },
      fieldTitles: [this.$t('labels.comp_transfer.availableColumns'), this.$t('labels.comp_transfer.selectedColumns')]
    }
  },
  methods: {
    // 打卡窗体，外部通过this.$refs.dataOutput.open调用
    open(title, source, output) {
      this.resetFields()
      this.title = title
      Object.keys(source).forEach(k => {
        this.$set(this.source, k, source[k])
      })
      Object.keys(output).forEach(k => {
        this.$set(this.output, k, output[k])
      })
      this.dialogVisible = true
      this.$emit('open')
    },
    // 关闭弹窗,外部通过context.dialog.close()调用
    close(success) {
      // this.resetFields()
      if (success) {
        this.$message.success('保存成功！')
      }
      this.isSaving = false
      this.dialogVisible = false
    },
    // 显示错误，context.dialog.error()调用, 在close之前使用
    error(err) {
      this.isSaving = false
      this.$message.error(err)
    },
    // 保存
    save: _throttle(function() {
      if (this.isSaving) return
      this.isSaving = true
      this.$refs['formOutput'].validate(valid => {
        if (!valid) {
          this.isSaving = false
          return
        }
        this.$emit('save', { data: this.output, source: this.source, dialog: this })
        // this.dialogVisible = false
      })
    }, 3000),
    // 重置表单
    resetFields() {
      this.source = {
        type: 'experiment',
        fromChart: false,
        fields: [],
        filterFields: []
      }
      this.output = {
        name: '',
        description: '',
        type: 'historydata',
        x_axis_min: '',
        x_axis_max: '',
        field_names: [],
        private: false
      }
      this.$nextTick(() => {
        this.$refs['formOutput'] && this.$refs['formOutput'].clearValidate()
      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.outputDialog {
  /deep/ .el-dialog {
    border-radius: 16px;
    padding: 28px 24px 24px 24px;
    .el-dialog__header {
      padding-top: 0;
      padding-left: 16px;
      border-bottom: 1px solid #e6e6e6;
      font-size: 18px;
      color: #4d4d4d;
      // font-family: sy_regular;
    }
    .el-dialog__body {
      margin-top: 24px;
      padding: 0 16px 0 16px;
      .el-form {
        .el-form-item {
          margin-bottom: 2em;
          .el-form-item__label {
            padding: 0;
          }
        }
        .schema_guid,.description {
          .el-form-item__label {
            padding-left: 10px;
          }
        }
      }
      .el-transfer {
          .el-transfer-panel {
          width:43%;
          .el-transfer-panel__filter {
            .el-input__inner{
              border-radius: 6px;
            }
          }
          .el-transfer-panel__list {
            .el-transfer-panel__item.el-checkbox {
              display: block;
              .el-checkbox__label{
                display:inline;
              }
            }
          }
        }
        .el-transfer__buttons {
          .el-transfer__button.is-disabled, .el-transfer__button.is-disabled:hover {
            border:none;
          }
        }
      }
    }
    .el-dialog__footer {
      margin-top: 8px;
      padding-top: 0;
      padding-right: 8px;
      .dialog-footer {
        .el-button {
          width: 80px;
          font-size: 15px;
          color: #fff;
          // font-family: sy_regular;
        }
        .cancel {
          background-color: #e6e6e6;
          color: #4d4d4d;
          &:hover {
            background-color: #efefef;
          }
          &:active {
            background-color: #ccc;
          }
        }
      }
    }
  }
}
</style>
