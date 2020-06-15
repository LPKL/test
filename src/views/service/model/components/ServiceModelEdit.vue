<template>
  <div class="app_container">
    <el-dialog
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      :close-on-press-escape = "false"
      :show-close="true"
      :title="$t('labels.service.edit')"
      class="editDialog"
      @close="closeDialog">
      <el-form ref="editModelServiceForm" :model="editModelServiceForm" :rules="rules" label-width="95px" label-position="right">
        <el-form-item :label="$t('labels.service.name')+':'" prop="name">
          <el-input v-model="editModelServiceForm.name" clearable style="width:256px;" />
        </el-form-item>
        <el-form-item :label="$t('labels.desc')+':'" prop="description">
          <el-input :rows="2" v-model="editModelServiceForm.description" type="textarea" style="width:324px;" clearable />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button class="cancel" @click="closeDialog">{{ $t('buttons.cancel') }}</el-button>
        <el-button type="primary" @click="editModelService">{{ $t('buttons.confirm') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>

export default {
  name: 'ServiceModelEdit',
  props: {
    isVisable: {
      type: Boolean,
      default: null
    },
    toEditData: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      rules: {
        // name: [
        //   { required: true, message: this.$t('rules.required'), trigger: 'blur' }
        // ]
      }
    }
  },
  computed: {
    dialogVisible: {
      get: function() {
        return this.isVisable
      },
      set: function() {
        //
      }
    },
    editModelServiceForm() {
      return this.toEditData
    }
  },
  watch: {
    dialogVisible(val) {
      if (val === false) {
        this.$refs['editModelServiceForm'].resetFields()
      }
    }
  },
  methods: {
    closeDialog() {
      this.$emit('closeDialog', 'edit')
    },
    editModelService() {
      // TODO: API，传回index写，还是在此处写？倾向于传回去写
      this.$refs['editModelServiceForm'].validate((valid) => {
        if (!valid) return
        this.$emit('editedForm', this.editModelServiceForm)
        this.$emit('closeDialog', 'edit')
      })
    }
  }

}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
@import "src/assets/styles/new-base.scss";
.app_container {
  .editDialog {
    /deep/ .el-dialog {
      width: 488px;
      height: 274px;
      border-radius: 16px;
      padding: 24px 24px 24px 24px;
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
            margin-bottom: 16px;
            .el-form-item__content {
              .el-textarea {
                padding-top: 10px;
                .el-textarea__inner {
                  height: 64px;
                  width: 324px;
                }
              }
            }
            .el-form-item__label {
              padding-right: 16px;
            }
          }
          .schema_guid,.description {
            .el-form-item__label {
              padding-left: 10px;
            }
          }
          .file_uuid {
            .el-form-item__content {
              .upload-demo {
                .el-upload {
                  .el-button {
                    text-align: left;
                    background-color: #fff;
                    color: #409eff;
                  }
                }
              }
            }
          }
        }
      }
      .el-dialog__footer {
        // margin-top: -10px;
        padding-top: 4PX;
        padding-right: 12px;
        .dialog-footer {
          .el-button {
            padding: 0;
            span {
              display: block!important;
              width: 56px;
              height: 32px;
              border-radius: 8px;
              line-height: 32px;
              text-align: center;
            }
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
}
</style>
