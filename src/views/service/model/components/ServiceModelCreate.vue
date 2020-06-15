<template>
  <div class="app_container">
    <el-dialog
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      :close-on-press-escape = "false"
      :show-close="true"
      :title="$t('labels.service.add')"
      class="addDialog"
      @close="closeDialog">
      <el-form ref="createModelServiceForm" :model="createModelServiceForm" :rules="rules" label-width="100px" label-position="right">
        <el-form-item :label="$t('labels.service.name')+':'" prop="name" style="margin-bottom:26px;">
          <el-input v-model="createModelServiceForm.name" clearable style="width:256px;"/>
        </el-form-item>
        <el-form-item :label="$t('labels.desc')+':'" prop="description">
          <el-input :rows="2" v-model="createModelServiceForm.description" type="textarea" style="width:324px;" clearable />
        </el-form-item>
        <el-form-item :label="$t('labels.service.model.index')+':'" prop="model">
          <comp-select-rich
            v-model="createModelServiceForm.model"
            :options="modelsData"
            :option-key="{ value: 'id', label: 'name' }"
            :combind-value="['id','type']"
            :filter-by="filterBy"
            :filterable="true"
            :clearable="true"
            :placeholder="$t('strings.select')"
            class="new-input"/>
        </el-form-item>
        <el-form-item :label="$t('labels.service.model.is_publish')+':'" prop="enabled">
          <el-radio v-model="createModelServiceForm.enabled" :label="true">{{ $t('strings.yes') }}</el-radio>
          <el-radio v-model="createModelServiceForm.enabled" :label="false">{{ $t('strings.no') }}</el-radio>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button class="cancel" @click="closeDialog">{{ $t('buttons.cancel') }}</el-button>
        <el-button type="primary" @click="createNewModelService">{{ $t('buttons.confirm') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>

import { getAllPipelineModel } from '@/api/datamining/model'
import SelectRich from '@/components/SelectRich'
import { validateModelServiceName } from '@/utils/validate'

export default {
  name: 'ServiceModelCreate',
  components: {
    'comp-select-rich': SelectRich
  },
  props: {
    isVisable: {
      type: Boolean,
      default: null
    }
  },
  data() {
    const serviceName = (rule, value, callback) => {
      if (!value) {
        callback(new Error(this.$t('rules.required')))
      } else if (!validateModelServiceName(value)) {
        callback(new Error(this.$t('rules.service_name')))
      } else {
        callback()
      }
    }
    return {
      modelsData: [],
      createModelServiceForm: {
        name: '', // 模型名称，必填唯一
        description: '', // 描述
        model: '', // 模型，select，必填
        enabled: true // 是否发布
      },
      rules: {
        name: [
          // { required: true, message: this.$t('rules.required'), trigger: 'blur' },
          { required: true, trigger: 'blur', validator: serviceName }
        ],
        model: [
          { required: true, message: this.$t('rules.required'), trigger: 'blur' }
        ]
      },
      filterBy: { key: 'type', value: [{ label: '单独模型', value: 'model' }, { label: '组合模型', value: 'pipeline' }], single: false }
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
    }
  },
  watch: {
    dialogVisible(val) {
      if (val === false) {
        this.$refs['createModelServiceForm'].resetFields()
      }
    }
  },
  mounted() {
    this.initData()
  },
  methods: {
    initData(val) {
      getAllPipelineModel().then(res => {
        this.modelsData = res.data
      }).catch(error => {
        console.log('getAllUsersModel error', error)
      })
    },
    closeDialog() {
      this.$emit('closeDialog', 'create')
    },
    createNewModelService() {
      this.$refs['createModelServiceForm'].validate((valid) => {
        if (!valid) return
        const newCreateFrom = {
          name: this.createModelServiceForm.name,
          description: this.createModelServiceForm.description,
          enabled: this.createModelServiceForm.enabled,
          type: this.createModelServiceForm.model.type
        }
        newCreateFrom[this.createModelServiceForm.model.type] = this.createModelServiceForm.model.id
        this.$emit('createdForm', newCreateFrom)
        this.$emit('closeDialog', 'create')
      })
    }
  }

}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
@import "src/assets/styles/new-base.scss";
.app_container {
  .addDialog {
    /deep/ .el-dialog {
      width: 488px;
      height: 400px;
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
              .el-select {
                margin-top: 0;
                width: 256px;
                .el-input {
                  .el-input__inner {
                    height: 32px;
                    width: 256px;
                    border-radius: 4px;
                  }
                  .el-input__suffix {
                    .el-input__suffix-inner {
                      .el-select__caret {
                        &::before {
                          content: '';
                          position: relative;
                          width: 0;
                          height: 0;
                          top: -10px;
                          border-left: 6px solid transparent;
                          border-right: 6px solid transparent;
                          border-bottom: 6px solid #4d4d4d;
                        }
                      }
                    }
                  }
                }
                // .el-textarea {
                //   .el-textarea__inner {
                //     height: 64px;
                //     width: 324px;
                //   }
                // }
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
        padding-top: 4px;
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
