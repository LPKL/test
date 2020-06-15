<!-- 调用信息dialog -->
<template>
  <div class="app_container">
    <el-dialog
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      :close-on-press-escape = "false"
      :show-close="true"
      :title="$t('labels.service.model.callinfo')"
      class="clientDialog"
      @close="closeDialog">
      <el-form :model="clientModelServiceForm" label-width="110px" label-position="right">
        <el-form-item :label="$t('labels.service.model.url')+':'" prop="url">
          <el-input id="curl" :readonly="true" :rows="2" v-model="clientModelServiceForm.service_url" type="textarea" style="float:left;"/>
          <complex-button :css-classes="'svgIconBase plainButton'" :svg-icon-class-name="'service_copy'" style="float:right;" @click="copyText('curl')"/>
        </el-form-item>
        <el-form-item label="Client ID:" prop="id">
          <el-input id="cid" :readonly="true" v-model="clientModelServiceForm.service_url" style="float:left;"/>
          <complex-button :css-classes="'svgIconBase plainButton'" :svg-icon-class-name="'service_copy'" style="float:right;" @click="copyText('cid')"/>
        </el-form-item>
        <el-form-item label="Client Secret:" prop="secret">
          <el-input id="csecret" :readonly="true" v-model="clientModelServiceForm.service_url" style="float:left;"/>
          <complex-button :css-classes="'svgIconBase plainButton'" :svg-icon-class-name="'service_copy'" style="float:right;" @click="copyText('csecret')"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button class="cancel" @click="closeDialog">{{ $t('buttons.cancel') }}</el-button>
        <el-button type="primary" @click="closeDialog">{{ $t('buttons.confirm') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import ComplexButton from '@/components/Button/ComplexButton'

export default {
  name: 'ServiceModelClient',
  components: {
    'complex-button': ComplexButton
  },
  props: {
    isVisable: {
      type: Boolean,
      default: null
    },
    clientData: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
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
    clientModelServiceForm() {
      return this.clientData
    }
  },
  methods: {
    closeDialog() {
      this.$emit('closeDialog', 'client')
    },
    copyText(inputid) {
      console.log('copyText', document.getElementById(inputid).value)
      document.getElementById(inputid).select() // 选择对象
      document.execCommand('Copy')
    }
  }

}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
@import "src/assets/styles/new-base.scss";
.app_container {
  .clientDialog {
    /deep/ .el-dialog {
      width: 576px;
      height: 384px;
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
        padding: 0 8px 0 8px;
        .el-form {
          .el-form-item {
            margin-bottom: 16px;
            .el-form-item__content {
              .el-textarea {
                width: 352px;
                .el-textarea__inner {
                  height: 64px;
                }
              }
              .el-input {
                width: 352px;
                .el-input__inner {
                  height: 32px;
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
        // padding-top: 70px;
        padding-right: 80px;
        padding-top: 64px;
        .dialog-footer {
          // .el-button {
          //   width: 80px;
          //   // height: 32px;
          //   font-size: 15px;
          //   color: #fff;
          //   font-family: sy_regular;
          //   border-radius: 8px;
          //   padding-right: 16px;
          // }
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
