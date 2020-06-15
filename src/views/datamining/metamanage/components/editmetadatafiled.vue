<template>
  <div class="el-dialogBox">
    <el-dialog
      v-loading="loading"
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      :show-close="false"
      :title="$t('strings.metadataManage.edit_field')"
      width="450px"
      class="el-addDialog"
      @close="handleClose">
      <span class="el-delete_btn el-icon-close" @click="handleClose"/>
      <el-form ref="editForm" :model="editForm" :rules="rules" label-position="left" label-width="75px">
        <el-form-item :label="$t('labels.metadataManage.field_name')" prop="name">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item :label="$t('labels.metadataManage.display_name')" prop="display_name">
          <el-input v-model="editForm.display_name" />
        </el-form-item>
        <el-form-item :label="$t('labels.metadataManage.field_type')" prop="type">
          <el-select v-model="editForm.type" class="new-input" @change="clearBefore">
            <el-option
              v-for="(item, index) in typeSelect"
              :key="index"
              :label="item.name"
              :value="item.type"/>
          </el-select>
        </el-form-item>
        <!-- 浮点型 -->
        <div v-if="editForm.type === 'double' || editForm.type === 'bigint' || editForm.type === 'string'" class="float_area">
          <el-form-item v-if="editForm.type !== 'bigint' && editForm.type !== 'string'" :label="$t('labels.metadataManage.decimal')" prop="precision">
            <el-input v-model="editForm.other.precision" />
          </el-form-item>
          <el-form-item v-if="editForm.type !== 'string'" :label="$t('labels.metadataManage.unit')" prop="unit">
            <el-input v-model="editForm.other.unit" />
          </el-form-item>
          <el-form-item label="标准值:" prop="standard_value">
            <el-radio-group v-model="float_standard">
              <el-radio :label="true" >有</el-radio>
              <el-radio :label="false" >无</el-radio>
            </el-radio-group>
            <div v-if="float_standard" class="el-standard_value_area">
              <div v-for="(item, index) in editForm.other.standard_value" :key="index">
                <label>
                  <span>{{ item.name }}:</span>
                  <el-input v-model="item.value" style="display: inline-block"/>
                  <el-button v-if="!item.forbid_delete" type="text" @click="deleteStandard(item.name)"><svg-icon icon-class="metadatadelete_c"/></el-button>
                </label>
              </div>
            </div>
            <div v-if="add_standard_value_show" class="el-add-standard_value">
              <label><span>属性名:</span><el-input v-model="add_standard_value_name" /></label>
              <label><span>属性值:</span><el-input v-model="add_standard_value_value" /></label>
              <el-button type="text" @click="saveCurrent">保存</el-button>
              <el-button type="text" class="el-cancel" @click="cancelStandardAdd">{{ $t('buttons.cancel') }}</el-button>
            </div>
            <el-button
              v-if="float_standard"
              :disabled="add_standard_value_show"
              type="text"
              class="el-add-btn"
              @click="showAddCurrent">
              <svg-icon icon-class="metadataadd_d" class="metadataadd_d"/>
              添加标准值
            </el-button>
          </el-form-item>
          <el-form-item label="允许值:" prop="allowable_value">
            <el-radio-group v-model="float_allow">
              <el-radio :label="false" >全部</el-radio>
              <el-radio :label="true" >范围</el-radio>
            </el-radio-group>
            <div v-if="float_allow" class="el-allowable_value">
              <div v-for="(item, index) in editForm.other.allowable_value" :key="index">
                <label>
                  <span>{{ item.name }}:</span>
                  <el-input v-model="item.value" style="display: inline-block"/>
                  <!-- <el-button type="text" @click="deleteStandard(item.name)">删除</el-button> -->
                </label>
              </div>
            </div>
          </el-form-item>
        </div>
        <!-- 日期型 -->
        <el-form-item v-if="editForm.type === 'date'" label="显示格式:" prop="format">
          <el-select v-model="editForm.other.format" class="new-input">
            <el-option
              v-for="(item, index) in formatSelect"
              :key="index"
              :label="item.type"
              :value="item.type"/>
          </el-select>
        </el-form-item>
        <!-- 日期时间型 -->
        <el-form-item v-if="editForm.type === 'timestamp'" label="显示格式:" prop="format">
          <el-select v-model="editForm.other.format" class="new-input">
            <el-option
              v-for="(item, index) in formatSelect1"
              :key="index"
              :label="item.type"
              :value="item.type"/>
          </el-select>
        </el-form-item>
        <!-- 枚举值 -->
        <el-form-item label="是否枚举">
          <el-radio-group v-model="is_enum">
            <el-radio :label="false" >{{ $t('strings.no') }}</el-radio>
            <el-radio :label="true" >{{ $t('strings.yes') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="is_enum" label="枚举值">
          <el-input v-model="editForm.other.range" placeholder="英文逗号分隔"/>
        </el-form-item>
        <!-- 自定义属性的显示 -->
        <div v-if="isOtherAttributesSHow" class="el-customizes">
          <el-form-item v-for="(item, index) in editForm.other.customizes" :key="index" :label="item.name + ':'">
            <!-- <el-input v-model="item.name" /> -->
            <el-input v-model="item.value" />
            <el-button type="text" @click="deleteSelfAttributes(item.name)"><svg-icon icon-class="metadatadelete_c"/></el-button>
          </el-form-item>
        </div>
        <!-- 添加自定义属性的操作 -->
        <div v-if="showAddSelfInput" class="el-addSelfAttributes">
          <label><span>属性名:</span><el-input v-model="selfAttributeName" /></label>
          <label><span>属性值:</span><el-input v-model="selfAttributeValue" /></label>
          <el-button type="text" @click="saveSelfAdd">保存</el-button>
          <el-button type="text" class="el-cancel" @click="cancelSelfAdd">{{ $t('buttons.cancel') }}</el-button>
        </div>
        <el-button
          :disabled="showAddSelfInput"
          type="text"
          class="addCustomizes"
          @click="AddSelfAttributeFunc">
          <svg-icon icon-class="metadataadd_d" class="metadataadd_d"/>
          添加自定义属性
        </el-button>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button class="cancel" @click="hideDialogVisible">{{ $t('buttons.cancel') }}</el-button>
        <el-button type="primary" @click="submitEdit">{{ $t('buttons.confirm') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { editFields } from '@/api/datamining/metadata'
export default {
  name: 'EditMetadataField',
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    fieldData: {
      type: Object,
      default: () => {}
    },
    currentMetadata: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      editForm: {},
      // 浮点型时，用来处理标准值和允许值的字段
      float_standard: false,
      float_allow: false,
      loading: false,
      rules: {
        name: [{ trigger: 'blur', required: true, message: '请输入名称' }],
        display_name: [{ trigger: 'blur', required: true, message: '请输入显示名' }]
      },
      typeSelect: [
        { name: '浮点型', type: 'double' },
        { name: '整型', type: 'bigint' },
        { name: '字符串', type: 'string' },
        { name: '布尔型', type: 'boolean' },
        { name: '时间型', type: 'date' },
        { name: '日期时间型', type: 'timestamp' }
      ],
      formatSelect1: [
        { type: 'yyyy/mm/dd hh:mm:ss' },
        { type: 'yyyy/mm/dd hh:mm' },
        { type: 'yyyy-mm-dd hh:mm:ss' },
        { type: 'yyyy-mm-dd hh:mm' }
      ],
      formatSelect: [
        { type: 'yyyy/mm/dd' },
        { type: 'yyyy-mm-dd' },
        { type: 'yyyymmdd' },
        { type: 'yyyy年mm月dd日' }
      ],
      // 添加标准值的两个临时字段
      add_standard_value_show: false,
      add_standard_value_name: '',
      add_standard_value_value: '',
      // 添加自定义属性
      isOtherAttributesSHow: false,
      // 用来控制添加自定义属性按钮的禁用
      idAddBtnDisabled: false,
      // 自定义属性输入框的控制
      showAddSelfInput: false,
      selfAttributeName: '',
      selfAttributeValue: '',
      standard_value_record: [],
      allowable_value_record: [],
      editObj: {},
      stringArr: ['string', 'varchar', 'char', 'bigary', 'array', 'map', 'struct', 'union'],
      intArr: ['tinyint', 'smallint', 'int', 'bigint'],
      doubleArr: ['float', 'double', 'decimal'],
      timeArr: ['timestamp'],
      dataArr: ['date'],
      boolArr: ['boolean'],
      tempobj: {},
      is_enum: false,
      enum_recodor: ''
    }
  },
  watch: {
    '$props.fieldData': {
      handler: function(newer, older) {
        this.editForm = JSON.parse(JSON.stringify(newer))
        this.editObj = this.editForm
        this.is_enum = !!this.editForm.other.is_enum
        this.enum_recodor = this.editForm.other.range
        this.float_standard = !!this.editForm.other.standard_value.length
        this.float_allow = !!this.editForm.other.allowable_value.length
        this.isOtherAttributesSHow = !!this.editForm.other.customizes.length
        try {
          this.tempobj.type = JSON.parse(JSON.stringify(newer)).type
          Object.freeze(this.tempobj)
        } catch (e) {
          console.log(e)
        }
        this.editForm.recordorType = this.tempobj.type
        // 对类型的操作
        switch (true) {
          case this.stringArr.indexOf(this.editForm.type.slice(0, this.editForm.type.indexOf('(') === -1 ? this.editForm.type.length : this.editForm.type.indexOf('('))) >= 0:
            this.editForm.type = 'string'
            this.editForm.firstType = 'string'
            break
          case this.intArr.indexOf(this.editForm.type) >= 0:
            this.editForm.type = 'bigint'
            this.editForm.firstType = 'bigint'
            break
          case this.doubleArr.indexOf(this.editForm.type.slice(0, this.editForm.type.indexOf('(') === -1 ? this.editForm.type.length : this.editForm.type.indexOf('('))) >= 0:
            this.editForm.type = 'double'
            this.editForm.firstType = 'double'
            break
          case this.timeArr.indexOf(this.editForm.type) >= 0:
            this.editForm.type = 'timestamp'
            this.editForm.firstType = 'timestamp'
            break
          case this.dataArr.indexOf(this.editForm.type) >= 0:
            this.editForm.type = 'date'
            this.editForm.firstType = 'date'
            break
          case this.boolArr.indexOf(this.editForm.type) >= 0:
            this.editForm.type = 'boolean'
            this.editForm.firstType = 'boolean'
            break
          default:
            break
        }
      },
      deep: true
    },
    float_standard(newer, older) {
      if (newer) {
        if (this.standard_value_record.length) {
          this.editForm.other.standard_value = this.standard_value_record
        } else {
          if (this.editObj.other.standard_value.length) {
            this.editForm.other.standard_value = this.editObj.other.standard_value
          } else {
            this.editForm.other.standard_value = [
              { name: '国标', value: null },
              { name: '厂标', value: null },
              { name: '行标', value: null }
            ]
          }
        }
      } else {
        this.standard_value_record = this.editForm.other.standard_value
        this.editForm.other.standard_value = []
      }
    },
    float_allow(newer, older) {
      if (newer) {
        if (this.allowable_value_record.length) {
          this.editForm.other.allowable_value = this.allowable_value_record
        } else {
          if (this.editObj.other.allowable_value.length) {
            this.editForm.other.allowable_value = this.editObj.other.allowable_value
          } else {
            this.editForm.other.allowable_value = [
              { name: 'max', value: null },
              { name: 'min', value: null }
            ]
          }
        }
      } else {
        this.allowable_value_record = this.editForm.other.allowable_value
        this.editForm.other.allowable_value = []
      }
    },
    is_enum(newer, older) {
      if (newer) {
        this.editForm.other.range = this.enum_recodor
      } else {
        this.editForm.other.range = ''
      }
    }
  },
  methods: {
    // 编辑表单内容的提交
    submitEdit() {
      const temp = JSON.parse(JSON.stringify(this.editForm))
      temp.other = JSON.stringify(temp.other)
      if (temp.type === temp.firstType) {
        temp.type = temp.recordorType
      }
      editFields(this.currentMetadata, this.editForm.id, temp).then(res => {
        this.$emit('visibleChange', false)
        this.$emit('handleFresh')
      })
    },
    hideDialogVisible() {
      this.$emit('visibleChange', false)
    },
    handleClose() {
    //   关闭按钮重写
      this.$emit('visibleChange', false)
      this.$refs['editForm'].resetFields()
      this.showAddSelfInput = false
    },
    // 显示添加标准的输入框
    showAddCurrent() {
      this.add_standard_value_name = ''
      this.add_standard_value_value = ''
      this.add_standard_value_show = true
    },
    // 当前本次添加在表单中的其它标准
    saveCurrent() {
      this.add_standard_value_show = false
      if (!this.add_standard_value_name) return
      const temp = {
        name: this.add_standard_value_name,
        value: this.add_standard_value_value
      }
      this.editForm.other.standard_value.push(temp)
    },
    cancelStandardAdd() {
      this.add_standard_value_show = false
    },
    // 删除表单中的某个行标
    deleteStandard(val) {
      this.editForm.other.standard_value = this.editForm.other.standard_value.filter(item => item.name !== val)
    },
    // 添加自定义属性的操作
    AddSelfAttributeFunc() {
      this.showAddSelfInput = true
      this.selfAttributeName = ''
      this.selfAttributeValue = ''
    },
    // 自定义属性添加得保存
    saveSelfAdd() {
      this.isOtherAttributesSHow = true
      this.showAddSelfInput = false
      if (!this.selfAttributeName) return
      const temp = {
        name: this.selfAttributeName,
        value: this.selfAttributeValue
      }
      this.editForm.other.customizes.push(temp)
    },
    cancelSelfAdd() {
      this.selfAttributeShow = false
      this.showAddSelfInput = false
    },
    // 自定义属性的删除
    deleteSelfAttributes(val) {
      this.editForm.other.customizes = this.editForm.other.customizes.filter(item => item.name !== val)
      if (!this.editForm.other.customizes.length) {
        this.isOtherAttributesSHow = false
      }
    },
    // 切换类型时，将之前的设置清空
    clearBefore() {
      this.$emit('resetFieldData', this.editForm)
    }
  }
}

</script>
<style rel="stylesheet/scss" lang="scss" scoped>
  .el-dialogBox {
    .el-addDialog {
      /deep/ .el-dialog {
        border-radius: 16px;
        position: relative;
        .el-dialog__header {
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
          .el-delete_btn {
            position: absolute;
            top: 25px;
            right: 25px;
            cursor: pointer;
          }
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
                      font-size: 12px;
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
                    font-size: 12px;
                    span {
                      display: inline-block;
                      width: 50px;
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
                    font-size: 12px;
                    color: #2b5bd6;
                    &:hover,&:active {
                      color: #123ecc;
                    }
                  }
                  .el-cancel {
                    margin-right: 10px;
                  }
                }
                .el-add-btn {
                  margin-left: 62px;
                  color: #123ecc;
                  .metadataadd_d {
                    width: 20px;
                    height: 20px;
                    vertical-align: text-bottom;
                  }
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
                font-size: 12px;
                color: #123ecc;
              }
              .el-cancel {
                margin-right: 10px;
              }
            }
            .addCustomizes {
              position: absolute;
              bottom: 0;
              left: 40%;
              transform: translateX(-50%);
              color: #123ecc;
              .metadataadd_d {
                width: 20px;
                height: 20px;
                vertical-align: text-bottom;
              }
            }
          }
        }
      }
    }
  }
</style>
