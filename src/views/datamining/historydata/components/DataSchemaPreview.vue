<template>
  <el-dialog
    :visible.sync="outerDialogVisible"
    :close-on-click-modal="false"
    custom-class="wrap-outer-metafield"
    width="80%"
    show-close
    @close="closeContainer">
    <vertical-buttons :cfg-btns="cfgVBtnGroup" @itemClick="toggleActive"/>
    <div v-loading="listLoading" :element-loading-text="$t('strings.loading')" style="height:100%;">
      <!-- 表信息 -->
      <metadata-binding
        v-show="activePanel === '0'"
        ref="metadataBinding"
        :form-metadata="formData"
        :fields-data="fieldsData"
        @changAddDialogStatus="changAddDialogStatus"
        @freshData="freshData"/>
      <!-- 数据预览 -->
      <div v-show="activePanel === '1'" class="preview-upload-data">
        <el-table
          v-if="previewData.head.length>0"
          :data="previewData.value"
          :header-cell-style="{backgroundColor: '#f1f1f1'}">
          <el-table-column
            v-for="col in previewData.head"
            :key="col"
            :prop="col"
            :label="col"
            min-width="120"
            show-overflow-tooltip/>
        </el-table>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import VerticalButtons from '@/components/VButtons'
import MetadataBinding from './metadatabinding'

export default {
  name: 'DataSchemaPreview',
  components: { VerticalButtons, MetadataBinding },
  props: {
    containerDialogVisible: {
      type: Boolean,
      default: false
    },
    tableData: {
      type: Object,
      default: () => { return { schema: [], data: { head: [], value: [] }} }
    },
    fieldsData: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      listLoading: false,
      cfgVBtnGroup: [
        { key: '0', type: 'primary', label: '表信息' },
        { key: '1', type: 'normal', label: '数据预览' }],
      activePanel: '0',
      outerDialogVisible: false,
      formData: [],
      previewData: { head: [], value: [] }
    }
  },
  watch: {
    '$props.containerDialogVisible': {
      handler: function(newer, old) {
        this.outerDialogVisible = newer
        this.activePanel = '0'
        this.cfgVBtnGroup = [
          { key: '0', type: 'primary', label: '表信息' },
          { key: '1', type: 'normal', label: '数据预览' }]
      },
      immediate: true
    },
    tableData: {
      handler: function(newer, old) {
        // 此处将上传的数据拿到并处理好
        // 表结构
        const newformData = []
        newer.schema.forEach(element => {
          newformData.push({ ...element })
        })
        this.formData = newformData
        console.log('newer.schema', newer)

        // 历史数据
        if (!newer.data || !newer.data.head || !newer.data.value) {
          return
        }
        const fields = [...newer.data.head]
        this.$set(this.previewData, 'head', fields)
        this.$set(this.previewData, 'value', newer.data.value.map(v => {
          const item = {}
          for (let i = 0; i < v.length; i++) {
            item[fields[i]] = v[i]
          }
          return item
        }))
      },
      deep: true,
      immediate: true
    }
  },
  mounted() {
  },
  methods: {
    toggleActive(key) {
      this.listLoading = true
      this.activePanel = key
      setTimeout(() => {
        this.listLoading = false
      }, 800)
    },
    // 页面关闭的时候
    closeContainer() {
      this.$refs.metadataBinding.closeContainer()
      this.activePanel = '0'
      this.$emit('changAddDialogStatus', false)
      this.$emit('handleLoading', false)
      if (this.fieldsData.file_uuid) {
        this.$parent.$refs['addF'].removeUploadFile()
      }
    },
    changAddDialogStatus(v) {
      if (!v) { this.activePanel = '0' }
      this.$emit('changAddDialogStatus', v)
    },
    freshData() {
      this.$emit('freshData')
    }
  }
}
</script>
<style rel="stylesheet" lang="scss" scoped>
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
.el-add_field_container {
  .el-add_field_header {
    padding-left: 36px;
    .el-add_to_metadata {
      width: 115px;
      height: 32px;
      border-radius: 8px;
      padding: 0;
      border: 1px solid #2b5bd6;
      background-color: #fff;
      &:hover {
        border-color: #4773e2;
        background-color: #f4f5fb;
        color: #4773e2;
      }
      &:active {
        border-color: #123ecc;
        background-color: #f4f5fb;
        color: #123ecc;
      }
    }
    .is-disabled {
      color: #ccc;
      border: 1px solid #ccc;
      background-color: #fff;
      &:hover {
        color: #ccc;
        border: 1px solid #ccc;
        background-color: #fff;
      }
    }
    .reAnalysis {
      margin-right: 40px;
      color: #2b5bd6;
      &:hover {
        color: #2b5bd6;
      }
      &:active {
        color: #123ecc;
      }
    }
    .isNotAnalysis {
      margin-right: 20px;
    }
    .analysising,.analysised {
      background-color: #6484d4;
      margin-right: 30px;
      &:hover {
        background-color: #6484d4;
      }
    }
    .analysised {
      margin-right: 0;
    }
  }
  .el-add_field_content {
    width: 100%;
    height: calc(100% - 140px);
    padding: 0 20px;
    background-color: #fff;
    border-bottom-left-radius: 16px;
    border-bottom-right-radius: 16px;
    /deep/ .el-form {
      height: 100%;
      /deep/ .el-form-item {
        margin-bottom: 0;
      }
      /deep/ .el-table {
        margin-top: 10px;
        height:100%;
        &::before {
          display: none;
        }
        .el-table__header-wrapper {
          .el-table__header {
            .has-gutter {
              th {
                .cell {
                  font-size: 14px;
                  color: #808080;
                  .el-checkbox {
                    .el-checkbox__inner {
                      display: inline-block;
                      width: 18px;
                      height: 18px;
                      border-radius: 6px;
                      &::before {
                        top: 7px;
                      }
                      &::after {
                        left: 6px;
                        top: 3px;
                      }
                    }
                  }
                }
              }
            }
          }
        }
        /deep/ .el-table__body-wrapper {
          height: calc(100% - 60px);
          overflow-y: auto;
          .el-table__body {
            .el-table__row {
              .cell {
                font-size: 14px;
                color: #4d4d4d;
                .el-checkbox {
                  .el-checkbox__inner {
                    display: inline-block;
                    width: 18px;
                    height: 18px;
                    border-radius: 6px;
                    &::before {
                      top: 7px;
                    }
                    &::after {
                      left: 6px;
                      top: 3px;
                    }
                  }
                }
                .el-form-item {
                  .el-form-item__content {
                    .el-input {
                      .el-input__inner {
                        height: 32px;
                        line-height: 32px;
                      }
                    }
                  }
                }
                .el-enumeration {
                  .el-form-item__content {
                    .el-input {
                      width: 80%;
                    }
                  }
                }
                // .otherAttributes,.metadataBinding {
                //   color: #2b5bd6;
                //   &:hover {
                //     color: #2b5bd6;
                //   }
                //   &:active {
                //     color: #123ecc;
                //   }
                // }
                .otherAttributes {
                  .attribute_config {
                    svg {
                      width: 24px;
                      height: 24px;
                    }
                    .field_config_h,.field_config_c {
                      display: none;
                    }
                  }
                  .attributes_edit {
                    svg {
                      width: 24px;
                      height: 24px;
                    }
                    .field_edit_h,.field_edit_c {
                      display: none;
                    }
                  }
                }
                .metadataBinding {
                  .bingding {
                    svg {
                      width: 24px;
                      height: 24px;
                    }
                    .field_binding_h,.field_binding_c {
                      display: none;
                    }
                  }
                  .unbinding {
                    svg {
                      width: 24px;
                      height: 24px;
                    }
                    .field_unbinding_h,.field_unbinding_c {
                      display: none;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  .el-schema {
    width: 100%;
    display: inline-block;
    margin-top:16px;
    label {
      display: inline-block;
      margin-bottom: 20px;
      margin-left: 40px;
    }
  }

  .el-putUp {
    float: right;
    margin: 30px 40px 20px 0;
  }
}
.preview-upload-data{
  padding:20px 50px;
  height:100%;
  /deep/ .el-table{
    width: 100%;
    height:100%;
    border: 1px solid #f1f1f1;
    .el-table__body-wrapper{
      height: calc(100% - 150px);
      overflow: auto;
    }
  }
}
.el-addDialog {
  /deep/ .el-dialog {
    width: 450px;
    border-radius: 16px;
    .el-dialog__header {
      display: block;
      .el-dialog__title {
        margin-left: 10px;
      }
      &::after {
        content: '';
        display: block;
        width: 100%;
        height: 0;
        margin-top: 10px;
        border-bottom: 1px solid #ccc;
      }
    }
    .el-dialog__body {
      padding: 0;
      padding-top: 10px;
      /deep/ .el-form {
        margin-left: 30px!important;
        padding-bottom: 20px;
        position: relative;
        .el-form-item {
          .el-form-item__label {
            font-size: 14px;
            font-weight: 600;
            font-family: sy_regular;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .el-form-item__content {
            .el-select {
              .el-input {
                .el-input__inner {
                  border-radius: 4px;
                }
              }
            }
            .el-input {
              width: 65%;
            }
            .el-standard_value_area,.el-allowable_value {
                margin-top: 10px;
                padding-right: 65px;
                &::before {
                  content: '';
                  display: block;
                  width: 100%;
                  height: 0;
                  border-bottom: 1px solid #ccc;
                }
              label {
                display: block;
                margin-bottom: 22px;
                margin-left: 10px;
                margin-top: 8px;
                span {
                  display: inline-block;
                  width: 50px;
                  font-size: 12px!important;
                }
                .el-input {
                  display: inline-block;
                  width: 50%;
                  .el-input__inner {
                    height: 30px;
                  }
                }
                .el-button {
                  span {
                    width: 20px;
                    svg {
                      width: 18px;
                      height: 18px;
                    }
                  }
                }
              }
              label:last-child {
                margin-bottom: 0;
              }
            }
            .el-add-standard_value {
              margin-top: 10px;
              padding-right: 65px;
              overflow: hidden;
              &::before {
                content: '';
                display: block;
                width: 100%;
                height: 0;
                border-bottom: 1px solid #ccc;
              }
              label {
                display: block;
                margin-bottom: 10px;
                margin-left: 10px;
                margin-top: 8px;
                span {
                  display: inline-block;
                  width: 50px;
                  font-size: 12px;
                }
                .el-input {
                  display: inline-block;
                  width: 60%;
                  margin-left: 3px;
                  .el-input__inner {
                    height: 32px;
                  }
                }
                svg {
                  width: 18px;
                  height: 18px;
                }
              }
              label:nth-child(2) {
                margin-bottom: 0;
              }
              .el-button {
                float: right;
                margin-right: 60px;
              }
            }
            .el-add-btn {
              margin-left: 62px;
              color: #123ecc;
            }
          }
        }
        .el-customizes {
          .el-form-item {
            margin-bottom: 10px;
            .el-form-item__label {
              font-size: 14px;
              font-weight: 600;
              font-family: sy_regular;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
            .el-form-item__content {
              .el-button {
                margin-top: -2px;
                svg {
                  width: 18px;
                  height: 18px;
                }
              }
            }
          }
          .el-form-item:last-child {
            margin-bottom: 20px;
          }
        }
        .el-addSelfAttributes {
          padding-left: 78px;
          overflow: hidden;
          label {
            display: block;
            margin-bottom: 10px;
            span {
              display: inline-block;
              width: 62px;
              font-size: 12px;
              font-family: sy_regular;
            }
            .el-input {
              display: inline-block;
              width: 47%;
              .el-input__inner {
                height: 30px;
              }
            }
          }
          label:nth-child(2) {
            margin-bottom: 0;
          }
          .el-button {
            float: right;
            margin-right: 120px;
            color: #123ecc;
          }
        }
        .addCustomizes {
          position: absolute;
          bottom: 0;
          left: 40%;
          transform: translateX(-50%);
          color: #123ecc;
        }
      }
    }
  }
}
.el-metadataSave {
  /deep/ .el-dialog {
    width: 450px;
    border-radius: 16px;
    .el-dialog__header {
      display: block;
      .el-dialog__title {
        margin-left: 10px;
        font-size: 16px;
        font-family: sy_regular;
      }
      &::after {
        content: '';
        display: block;
        width: 100%;
        height: 0;
        margin-top: 10px;
        border-bottom: 1px solid #ccc;
      }
    }
    .el-dialog__body {
      .el-form {
        padding-left: 70px;
        overflow: hidden;
        .el-form-item {
          margin-bottom: 0;
        }
        .el-metadata {
          margin-top: 10px;
          margin-bottom: 30px;
          .el-form-item__label {
            color: #333;
            font-weight: 400!important;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .el-form-item__content {
            .el-input {
              .el-input__inner {
                width: 190px;
                height: 32px;
              }
            }
          }
        }
        .el-button {
          float: right;
        }
        .confirm {
          margin: 20px 20px 20px 16px;
        }
        .cancel {
          margin-top: 20px;
        }
      }
    }
  }
}
</style>
