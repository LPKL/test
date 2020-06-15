<template>
  <div v-loading="loading" :element-loading-text="$t('strings.loading')" class="el-add_field_container">
    <header class="el-add_field_header">
      <div class="el-title">{{ $t('strings.metadataManage.add_field') }}</div>
      <el-dropdown class="el-filter-item" trigger="click" @command="addCommand">
        <el-button type="primary">
          {{ $t('strings.metadataManage.csvUpload') }}
          <i class="el-icon-caret-bottom el-icon--right"/>
        </el-button>
        <el-dropdown-menu slot="dropdown" class="el-field_dropdown">
          <el-dropdown-item name="cover" class="clearfix" command="handCover">
            {{ $t('strings.metadataManage.upload_cover') }}
          </el-dropdown-item>
          <el-dropdown-item name="add" class="clearfix" command="handAdd">
            {{ $t('strings.metadataManage.upload_add') }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <div class="el-line"/>
    </header>
    <main class="el-add_field_content">
      <div>
        <el-form ref="metadataData" :model="formData" class="formData">
          <el-table
            ref="multipleTable"
            :data="formData.metadataData"
            :cell-style="setCellStyle"
            fit
            tooltip-effect="dark"
            style="width: 100%;"
            @select="handleCheckoutSelect"
            @select-all="handleCheckoutSelect">
            <el-table-column type="selection" width="55"/>
            <el-table-column :label="$t('labels.metadataManage.field_name')" prop="name">
              <template slot-scope="scope">
                <el-form-item :prop="`metadataData[${scope.$index}].name`" :rules="rules.name">
                  <el-input v-model="scope.row.name" :disabled="!!scope.row.useNum"/>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column :label="$t('labels.metadataManage.display_name')">
              <template slot-scope="scope">
                <el-form-item :prop="`metadataData[${scope.$index}].display_name`" :rules="rules.display_name" >
                  <el-input v-model="scope.row.display_name"/>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column :label="$t('labels.metadataManage.field_type')" prop="type">
              <template slot-scope="scope">
                <el-form-item :prop="`metadataData[${scope.$index}].type`" :rules="rules.type">
                  <el-select v-model="scope.row.type" :disabled="!!scope.row.useNum" @change="clearBefore(scope.row)">
                    <el-option
                      v-for="(item, index) in typeSelect"
                      :key="index"
                      :label="item.name"
                      :value="item.type"/>
                  </el-select>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column :label="$t('labels.metadataManage.decimal_place')" prop="other.precision">
              <template slot-scope="scope">
                <el-form-item v-if="scope.row.type === 'double'" :prop="`metadataData[${scope.$index}].other.precision`" :rules="rules.precision">
                  <el-input v-model="scope.row.other.precision" />
                </el-form-item>
                <!-- <el-form-item v-if="scope.row.type === 'enumeration'" :prop="`metadataData[${scope.$index}].other.enumeration_value`" :rules="rules.enumeration_value">
                  <el-input v-model="scope.row.other.enumeration_value" />
                </el-form-item> -->
              </template>
            </el-table-column>
            <el-table-column prop="precision" label="是否枚举/枚举值">
              <template slot-scope="scope">
                <el-form-item :rules="rules.precision" class="el-enumeration">
                  <el-checkbox v-model="scope.row.other.is_enum"/>
                  <el-input v-if="!scope.row.other.is_enum" disabled/>
                  <el-input v-else v-model="scope.row.other.range" placeholder="英文逗号分隔"/>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column :label="$t('labels.metadataManage.display_format')" prop="other.format">
              <template slot-scope="scope">
                <el-form-item :prop="`metadataData[${scope.$index}].display_format`" :rules="rules.display_format">
                  <el-select v-if="scope.row.type === 'date'" v-model="scope.row.other.format">
                    <el-option
                      v-for="(item, index) in formatSelect"
                      :key="index"
                      :label="item.type"
                      :value="item.type"/>
                  </el-select>
                  <el-select v-if="scope.row.type === 'timestamp'" v-model="scope.row.other.format">
                    <el-option
                      v-for="(item, index) in formatSelect1"
                      :key="index"
                      :label="item.type"
                      :value="item.type"/>
                  </el-select>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column :label="$t('labels.metadataManage.other_attributes')" prop="other">
              <template slot-scope="scope">
                <div
                  class="el-config_container"
                  @mouseenter="showFieldIcon(scope.$index, true)"
                  @mouseleave="hideFieldIcon(scope.$index, true)"
                  @click="handleFields(scope.row, scope.$index)">
                  <svg-icon icon-class="field_config_d" class="field_config_d"/>
                  <svg-icon icon-class="field_config_h" class="field_config_h"/>
                  <svg-icon icon-class="field_config_c" class="field_config_c"/>
                </div>
              </template>
            </el-table-column>
            <el-table-column :label="$t('labels.actions')" min-width="200">
              <template slot-scope="scope">
                <div
                  class="el-svg_container"
                  @mouseenter="showFieldIcon(scope.$index)"
                  @mouseleave="hideFieldIcon(scope.$index)"
                  @click="handleDelete(scope.row, scope.$index)">
                  <svg-icon icon-class="field_big_delete_d" class="field_big_d"/>
                  <svg-icon icon-class="field_big_delete_h" class="field_big_h"/>
                  <svg-icon icon-class="field_big_delete_c" class="field_big_c"/>
                </div>
              </template>
            </el-table-column>
          </el-table>
          <el-button plain class="el-addFields" @click="addFields"><svg-icon icon-class="metadataadd_d"/>{{ $t('strings.metadataManage.add_field') }}</el-button>
          <el-button
            :disabled="!checkboxSelected.length"
            :class="{ 'activeColor': checkboxSelected.length }"
            plain
            class="el-batch_delete"
            @mouseenter.native="showSmallDelete"
            @mouseleave.native="hideSmallDelete"
            @click="handleFieldsDelete">
            <svg-icon icon-class="field_delete_disabled" class="field_delete_disabled"/>
            <svg-icon icon-class="field_delete_small_d" class="field_delete_small_d"/>
            <svg-icon icon-class="field_delete_small_h" class="field_delete_small_h"/>
            <svg-icon icon-class="field_delete_small_c" class="field_delete_small_c"/>
            {{ $t('strings.metadataManage.batch_delete') }}
          </el-button>
        </el-form>
      </div>
      <el-button class="el-save" type="primary" @click="saveEditFields">{{ $t('buttons.confirm') }}</el-button>
      <el-button class="el-back" @click="backTo">{{ $t('buttons.back') }}</el-button>
    </main>
    <!-- 字段的编辑或设置 -->
    <el-dialog
      v-loading="loading"
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      :title="$t('strings.metadataManage.other_attributes')"
      class="el-addDialog"
      @close="handleClose">
      <el-form ref="fieldData" :model="currentChangeForm" label-position="left" label-width="75px">
        <el-form-item :label="$t('labels.metadataManage.field_type')" prop="type">
          <el-select v-model="currentChangeForm.type" class="new-input" @change="clearBefore(currentChangeForm)">
            <el-option
              v-for="(item, index) in typeSelect"
              :key="index"
              :label="item.name"
              :value="item.type"/>
          </el-select>
        </el-form-item>
        <!-- 浮点型/整型 -->
        <div v-if="fieldData.type === 'double' || fieldData.type === 'bigint' || fieldData.type === 'string'" class="float_area">
          <el-form-item v-if="fieldData.type !== 'string'" :label="$t('labels.metadataManage.unit')" prop="unit">
            <el-input v-model="currentChangeForm.other.unit"/>
          </el-form-item>
          <el-form-item :label="$t('labels.metadataManage.standard_value')" prop="standard_value">
            <el-radio-group v-model="float_standard">
              <el-radio :label="true" >{{ $t('labels.metadataManage.have') }}</el-radio>
              <el-radio :label="false" >{{ $t('labels.metadataManage.nothing') }}</el-radio>
            </el-radio-group>
            <div v-if="float_standard" class="el-standard_value_area">
              <div v-for="(item, index) in currentChangeForm.other.standard_value" :key="index">
                <label>
                  <span>{{ item.name }}:</span>
                  <el-input v-model="item.value" style="display: inline-block"/>
                  <el-button v-if="!item.forbid_delete" type="text" @click="deleteStandard(item.name)"><svg-icon icon-class="metadatadelete_c"/></el-button>
                </label>
              </div>
            </div>
            <div v-if="add_standard_value_show" class="el-add-standard_value">
              <label><span>{{ $t('labels.metadataManage.attribute_name') }}:</span><el-input v-model="add_standard_value_name" /></label>
              <label><span>{{ $t('labels.metadataManage.attribute_value') }}:</span><el-input v-model="add_standard_value_value" /></label>
              <el-button type="text" @click="saveCurrent">{{ $t('buttons.save') }}</el-button>
              <el-button type="text" class="el-cancel" @click="cancelStandardAdd">{{ $t('buttons.cancel') }}</el-button>
            </div>
            <el-button v-if="float_standard" :disabled="add_standard_value_show" type="text" class="el-add-btn" @click="showAddCurrent"><svg-icon icon-class="metadataadd_d"/>{{ $t('strings.metadataManage.add_allow_value') }}</el-button>
          </el-form-item>
          <el-form-item :label="$t('labels.metadataManage.allow_value')" prop="allowable_value">
            <el-radio-group v-model="float_allow">
              <el-radio :label="false" >{{ $t('labels.metadataManage.all') }}</el-radio>
              <el-radio :label="true" >{{ $t('labels.metadataManage.range') }}</el-radio>
            </el-radio-group>
            <div v-if="float_allow" class="el-standard_value_area">
              <div v-for="(item, index) in currentChangeForm.other.allowable_value" :key="index">
                <label>
                  <span>{{ item.name }}:</span>
                  <el-input v-model="item.value" style="display: inline-block"/>
                  <!-- <el-button type="text" @click="deleteStandard(item.name)">删除</el-button> -->
                </label>
              </div>
            </div>
          </el-form-item>
          <el-form-item label="是否枚举">
            <el-radio-group v-model="is_enum">
              <el-radio :label="false" >{{ $t('strings.no') }}</el-radio>
              <el-radio :label="true" >{{ $t('strings.yes') }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="is_enum" label="枚举值">
            <el-input v-model="currentChangeForm.other.range" placeholder="英文逗号分隔"/>
          </el-form-item>
        </div>
        <!-- 自定义属性的显示 -->
        <div v-if="isOtherAttributesSHow">
          <el-form-item v-for="(item, index) in currentChangeForm.other.customizes" :key="index" :label="item.name + ':'">
            <!-- <el-input v-model="item.name" /> -->
            <el-input v-model="item.value" />
            <el-button type="text" @click="deleteSelfAttr(item.name)"><svg-icon icon-class="metadatadelete_c"/></el-button>
          </el-form-item>
        </div>
        <!-- 添加自定义属性的操作 -->
        <div v-if="selfAttributeShow" class="el-addSelfAttributes">
          <label>
            <span>{{ $t('labels.metadataManage.attribute_name') }}:</span><el-input v-model="selfAttributeName" />
            <!-- <span>属性名已经存在!</span> -->
          </label>
          <label><span>{{ $t('labels.metadataManage.attribute_value') }}:</span><el-input v-model="selfAttributeValue" /></label>
          <el-button type="text" @click="saveSelfAdd">{{ $t('buttons.save') }}</el-button>
          <el-button type="text" class="el-cancel" @click="cancelSelfAdd">{{ $t('buttons.cancel') }}</el-button>
        </div>
        <el-button :disabled="showAddSelfInput" type="text" class="addCustomizes" @click="AddSelfAttributeFunc"><svg-icon icon-class="metadataadd_d"/>{{ $t('labels.metadataManage.add_self_attribute') }}</el-button>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button class="cancel" @click="dialogVisible = false">{{ $t('buttons.cancel') }}</el-button>
        <el-button type="primary" @click="dialogVisible = false">{{ $t('buttons.confirm') }}</el-button>
      </div>
    </el-dialog>
    <!-- 回退弹窗 -->
    <el-dialog
      :visible.sync="dialogBackRemind"
      :close-on-click-modal="false"
      title="提示"
      width="408px"
      class="el-back-remind">
      <span>{{ this.$t('messages.metadataManage.back_message') }}</span>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogBackRemind = false">{{ $t('buttons.cancel') }}</el-button>
        <el-button class="delete" @click="handleBack">{{ this.$t('buttons.metadataManage.still_back') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { addFieldsData, getallFields } from '@/api/datamining/metadata'
import { setTimeout } from 'timers'
export default {
  name: 'AddField',
  data() {
    // 字段名重复的验证
    const validateName = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入字段名!'))
        return
      }
      const len = this.formData.metadataData.filter(item => item.name === value).length
      // 对元数据已有字段名的重复的验证
      const flag = this.validateNameArr.some(item => item.name === value)
      if (len > 1 || flag) {
        callback(new Error(this.$t('messages.metadataManage.field_already_have')))
      } else {
        callback()
      }
    }
    const validatePrecision = (rule, value, callback) => {
      if (value === '' || value === 0) {
        callback()
        return
      }
      const reg = /^[1-9][0-9]*$/
      if (!reg.test(value)) {
        callback(new Error(this.$t('messages.metadataManage.add_int_value')))
      } else {
        callback()
      }
    }
    return {
      loading: true,
      formData: {
        metadataData: [
          {
            name: '',
            display_name: '',
            type: '',
            other: {
              is_enum: false,
              format: '',
              precision: '',
              unit: '',
              // enumeration_value: '',
              standard_value: [],
              allowable_value: [],
              customizes: [],
              range: ''
            }
          }
        ]
      },
      tempData: {
        is_enum: false,
        name: '',
        display_name: '',
        type: '',
        other: {
          format: '',
          precision: '',
          // enumeration_value: '',
          standard_value: [],
          allowable_value: [],
          customizes: [],
          range: ''
        }
      },
      dialogVisible: false,
      rules: {
        name: [{ required: true, validator: validateName, trigger: 'blur' }],
        type: [{ required: true, message: this.$t('messages.please_input'), trigger: 'change' }],
        precision: [{ required: false, trigger: 'change', validator: validatePrecision }]
        // enumeration_value: [{ required: false, trigger: 'change', message: this.$t('messages.metadataManage.enumeration_limit') }]
      },
      // { name: 'enumeration', type: 'enumeration' },
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
      fieldData: {},
      // 是否显示其它属性
      float_allow: false,
      // 是否有标准值
      float_standard: false,
      // 添加标准值
      add_standard_value_show: false,
      add_standard_value_name: '',
      add_standard_value_value: '',
      add_standard_state: false,
      // 其它属性的操作
      showAddSelfInput: false,
      selfAttributeName: '',
      selfAttributeValue: '',
      selfAttributeShow: false,
      currentChangeForm: {},
      // 自定义属性的显示
      isOtherAttributesSHow: false,
      checkboxSelected: [],
      dialogBackRemind: false,
      standard_value_record: [],
      allowable_value_record: [],
      validateNameArr: [],
      editObj: {},
      stringArr: ['string', 'varchar', 'char', 'bigary', 'array', 'map', 'struct', 'union'],
      intArr: ['tinyint', 'smallint', 'int', 'bigint'],
      doubleArr: ['float', 'double', 'decimal'],
      timeArr: ['timestamp'],
      dataArr: ['date'],
      boolArr: ['boolean'],
      is_enum: false,
      enum_recordor: ''
    }
  },
  watch: {
    checkboxSelected(newer, length) {
      if (newer.length) {
        const box = document.getElementsByClassName('el-batch_delete')[0]
        const svgArr = box.getElementsByTagName('svg')
        svgArr[0].style.display = 'none'
        svgArr[1].style.display = 'inline-block'
        svgArr[2].style.display = 'none'
        svgArr[3].style.display = 'none'
      }
    },
    float_standard(newer, older) {
      if (newer) {
        if (this.standard_value_record.length) {
          this.currentChangeForm.other.standard_value = this.standard_value_record
        } else {
          if (this.editObj.other.standard_value.length) {
            this.currentChangeForm.other.standard_value = this.editObj.other.standard_value
          } else {
            this.currentChangeForm.other.standard_value = [
              { name: '国标', value: null },
              { name: '厂标', value: null },
              { name: '行标', value: null }
            ]
          }
        }
      } else {
        this.standard_value_record = this.currentChangeForm.other.standard_value
        this.currentChangeForm.other.standard_value = []
      }
    },
    float_allow(newer, older) {
      if (newer) {
        if (this.allowable_value_record.length) {
          this.currentChangeForm.other.allowable_value = this.allowable_value_record
        } else {
          if (this.editObj.other.allowable_value.length) {
            this.currentChangeForm.other.allowable_value = this.editObj.other.allowable_value
          } else {
            this.currentChangeForm.other.allowable_value = [
              { name: 'max', value: null },
              { name: 'min', value: null }
            ]
          }
        }
      } else {
        this.allowable_value_record = this.currentChangeForm.other.allowable_value
        this.currentChangeForm.other.allowable_value = []
      }
    },
    is_enum(newer, older) {
      if (newer) {
        this.currentChangeForm.other.range = this.enum_recordor
        this.currentChangeForm.other.is_enum = newer
      } else {
        this.currentChangeForm.other.range = ''
        this.currentChangeForm.other.is_enum = false
      }
    }
  },
  created() {
    if (this.$route.params.schema.length) {
      this.loading = true
      this.formData.metadataData = this.$route.params.schema.map(item => {
        const temp = JSON.parse(JSON.stringify(this.tempData))
        temp.name = item.name
        if (this.$route.params.type === 'csv') {
          temp.display_name = item.display_name
          temp.other.is_enum = !!item.range.length
          temp.other.range = item.range.join(',')
        } else {
          temp.display_name = item.name
        }
        switch (true) {
          case this.stringArr.indexOf(item.type.slice(0, item.type.indexOf('(') === -1 ? item.type.length : item.type.indexOf('('))) >= 0:
            temp.type = 'string'
            temp.firstType = 'string'
            break
          case this.intArr.indexOf(item.type) >= 0:
            temp.type = 'bigint'
            temp.firstType = 'bigint'
            break
          case this.doubleArr.indexOf(item.type.slice(0, item.type.indexOf('(') === -1 ? item.type.length : item.type.indexOf('('))) >= 0:
            temp.type = 'double'
            temp.firstType = 'double'
            break
          case this.timeArr.indexOf(item.type) >= 0:
            temp.type = 'timestamp'
            temp.firstType = 'timestamp'
            break
          case this.dataArr.indexOf(item.type) >= 0:
            temp.type = 'date'
            temp.firstType = 'date'
            break
          case this.boolArr.indexOf(item.type) >= 0:
            temp.type = 'boolean'
            temp.firstType = 'boolean'
            break
          default:
            break
        }
        temp.recordorType = item.type
        // temp.type = item.type
        return temp
      })
    }
    this.getCurrentMetadataFields()
  },
  mounted() {
    setTimeout(() => {
      this.loading = false
    }, 1000)
  },
  methods: {
    // 大删除按钮的操作
    showFieldIcon(index, flag) {
      if (flag) {
        const box = document.getElementsByClassName('el-config_container')[index]
        const svgArr = box.getElementsByTagName('svg')
        svgArr[0].style.display = 'none'
        svgArr[1].style.display = 'block'
      } else {
        const box = document.getElementsByClassName('el-svg_container')[index]
        const svgArr = box.getElementsByTagName('svg')
        svgArr[0].style.display = 'none'
        svgArr[1].style.display = 'block'
      }
    },
    hideFieldIcon(index, flag) {
      if (flag) {
        const box = document.getElementsByClassName('el-config_container')[index]
        const svgArr = box.getElementsByTagName('svg')
        svgArr[0].style.display = 'block'
        svgArr[1].style.display = 'none'
        svgArr[2].style.display = 'none'
      } else {
        const box = document.getElementsByClassName('el-svg_container')[index]
        const svgArr = box.getElementsByTagName('svg')
        svgArr[0].style.display = 'block'
        svgArr[1].style.display = 'none'
        svgArr[2].style.display = 'none'
      }
    },
    // 小删除按钮
    showSmallDelete() {
      if (this.checkboxSelected.length) {
        const box = document.getElementsByClassName('el-batch_delete')[0]
        const svgArr = box.getElementsByTagName('svg')
        svgArr[0].style.display = 'none'
        svgArr[1].style.display = 'none'
        svgArr[2].style.display = 'inline-block'
        svgArr[3].style.display = 'none'
      }
    },
    hideSmallDelete() {
      if (this.checkboxSelected.length) {
        const box = document.getElementsByClassName('el-batch_delete')[0]
        const svgArr = box.getElementsByTagName('svg')
        svgArr[0].style.display = 'none'
        svgArr[1].style.display = 'inline-block'
        svgArr[2].style.display = 'none'
        svgArr[3].style.display = 'none'
      }
    },
    // 单元格样式的修改
    setCellStyle() {
      return {
        height: '56px',
        border: 'none'
      }
    },
    addCommand(val) {
      console.log(val)
    },
    // 返回到元数据管理页面
    backTo() {
      if (!this.formData.metadataData.length) {
        this.$router.go(-1)
      } else {
        this.dialogBackRemind = true
      }
    },
    // 获取当前元数据的所有字段
    getCurrentMetadataFields() {
      getallFields(this.$route.params.id).then(res => {
        this.validateNameArr = res.data
      })
    },
    handleBack() {
      this.dialogBackRemind = false
      this.$router.go(-1)
    },
    // 编辑弹窗关闭时
    handleClose() {
      // this.$refs['fieldData'].resetFields()
      // this.float_standard = false
      // this.float_allow = false
      // this.showAddSelfInput = false
      // this.currentChangeForm = this.editObj
      this.add_standard_value_show = false
      this.add_standard_value_show = false
    },
    handleFields(val, index) {
      this.editObj = val
      const box = document.getElementsByClassName('el-config_container')[index]
      const svgArr = box.getElementsByTagName('svg')
      svgArr[0].style.display = 'none'
      svgArr[1].style.display = 'none'
      svgArr[2].style.display = 'block'
      this.currentChangeForm = val
      this.dialogVisible = true
      this.currentChangeForm = val
      this.is_enum = val.other.is_enum
      this.enum_recordor = val.other.range
      this.fieldData = {}
      this.fieldData = val
      this.float_standard = !!val.other.standard_value.length
      this.float_allow = !!val.other.allowable_value.length
      // this.add_standard_state = !!val.other.standard_value.length
      this.isOtherAttributesSHow = !!val.other.customizes.length
    },
    // 添加标字段
    showAddCurrent() {
      this.add_standard_value_name = ''
      this.add_standard_value_value = ''
      this.add_standard_value_show = true
    },
    // 保存标准字段
    saveCurrent() {
      this.add_standard_value_show = false
      if (!this.add_standard_value_name) return
      const temp = {
        name: this.add_standard_value_name,
        value: this.add_standard_value_value
      }
      this.currentChangeForm.other.standard_value.push(temp)
    },
    // 取消
    cancelStandardAdd() {
      this.add_standard_value_show = false
    },
    // 删除标准字段
    deleteStandard(val) {
      this.currentChangeForm.other.standard_value = this.currentChangeForm.other.standard_value.filter(item => item.name !== val)
    },
    // 其它属性的添加
    AddSelfAttributeFunc() {
      this.showAddSelfInput = true
      this.selfAttributeShow = true
      this.selfAttributeName = ''
      this.selfAttributeValue = ''
    },
    saveSelfAdd() {
      this.showAddSelfInput = false
      this.selfAttributeShow = false
      this.isOtherAttributesSHow = true
      if (!this.selfAttributeName) return
      const temp = {
        name: this.selfAttributeName,
        value: this.selfAttributeValue
      }
      this.currentChangeForm.other.customizes.push(temp)
    },
    cancelSelfAdd() {
      this.selfAttributeShow = false
      this.showAddSelfInput = false
    },
    deleteSelfAttributes(val) {
      this.currentChangeForm.other.customizes = this.currentChangeForm.other.customizes.filter(item => item.name !== val)
      if (!this.currentChangeForm.other.customizes.length) {
        this.selfAttributeShow = false
      }
    },
    // 添加字段的整体保存
    saveEditFields() {
      if (!this.formData.metadataData.length) {
        this.$router.push({ path: '/manageCenter/metadatamanage/index', query: { id: this.$store.state.metadata.metadataId }})
        return
      }
      this.$refs['metadataData'].validate(valid => {
        this.loading = true
        if (!valid) return
        const temp = JSON.parse(JSON.stringify(this.formData.metadataData))
        temp.forEach(item => {
          if (!item.display_name) {
            item.display_name = item.name
          }
          if (item.type === item.firstType) {
            item.type = item.recordorType
          }
          item.other = JSON.stringify(item.other)
        })
        addFieldsData(this.$route.params.id, temp).then(res => {
          this.$router.push({ path: '/manageCenter/metadatamanage/index', query: { id: this.$store.state.metadata.metadataId }})
        })
      })
    },
    // 底部添加按钮
    addFields() {
      this.formData.metadataData.unshift(JSON.parse(JSON.stringify(this.tempData)))
    },
    // 删除字段按钮
    handleDelete(val, index) {
      const box = document.getElementsByClassName('el-svg_container')[index]
      const svgArr = box.getElementsByTagName('svg')
      svgArr[0].style.display = 'none'
      svgArr[1].style.display = 'none'
      svgArr[2].style.display = 'block'
      this.formData.metadataData = this.formData.metadataData.filter(item => item.name !== val.name)
    },
    // 自定义属性的删除
    deleteSelfAttr(val) {
      this.currentChangeForm.other.customizes = this.currentChangeForm.other.customizes.filter(item => item.name !== val)
      if (!this.currentChangeForm.other.customizes.length) {
        this.isOtherAttributesSHow = false
      }
    },
    // 表单中复选框的选择
    handleCheckoutSelect(selection) {
      this.checkboxSelected = selection
    },
    // 批量删除的操作
    handleFieldsDelete() {
      const box = document.getElementsByClassName('el-batch_delete')[0]
      const svgArr = box.getElementsByTagName('svg')
      if (this.checkboxSelected.length) {
        svgArr[0].style.display = 'none'
        svgArr[1].style.display = 'none'
        svgArr[2].style.display = 'none'
        svgArr[3].style.display = 'inline-block'
      }
      // 删除完时记得清空复选框数组
      this.checkboxSelected.forEach(item => {
        this.formData.metadataData = this.formData.metadataData.filter(val => val.name !== item.name)
      })
      if (!this.formData.metadataData.length) {
        this.checkboxSelected = []
      }
      if (!this.checkboxSelected.length) {
        svgArr[0].style.display = 'inline-block'
        svgArr[3].style.display = 'none'
      }
    },
    // 改变类型时，将其他属性清空
    clearBefore(row) {
      row.other = {
        is_enum: false,
        format: '',
        precision: '',
        unit: '',
        standard_value: [],
        allowable_value: [],
        customizes: [],
        range: ''
      }
    }
  }
}

</script>
<style rel="stylesheet/scss" lang="scss" scoped>
  .el-add_field_container {
    padding: 16px;
    // background-color: #fff;
    .el-add_field_header {
      height: 80px;
      line-height: 80px;
      border-top-left-radius: 16px;
      border-top-right-radius: 16px;
      background-color: #fff;
      padding: 0 16px;
      position:relative;
      .el-line {
        position: absolute;
        bottom: 10px;
        width: 98%;
        height: 1px;
        background-color: #ccc;
      }
      .el-title {
        display: inline-block;
        margin-left: 20px;
        font-size: 18px;
        color: #4d4d4d;
        font-family: sy_regular;
      }
      .el-filter-item {
        float: right;
        margin-right: 30px;
        .el-button {
          width: 130px;
          height: 36px;
          border-radius: 14px;
          color: #fff;
          background-color: #3d65c9;
          font-family: sy_regular;
          &:hover {
            background-color: #6484d4;
          }
          &:active {
            background-color: #0f32b5;
          }
        }
      }
    }
    .el-add_field_content {
      background-color: #fff;
      height: 800px;
      padding: 0 36px;
      border-bottom-left-radius: 16px;
      border-bottom-right-radius: 16px;
      /deep/ .el-form {
        /deep/ .el-form-item {
          // margin-bottom: 0;
        }
        .el-table {
          .el-table__header-wrapper {
            border-top: none;
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
            height: 600px;
            overflow-y: auto;
            margin-top: 10px;
            .el-table__body {
              .el-table__row {
                .el-table-column--selection {
                  .cell {
                    height: 56px;
                    .el-checkbox {
                      margin-top: 5px;
                    }
                  }
                }
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
                  .el-svg_container {
                    display: inline-block;
                    svg {
                      width: 22px;
                      height: 22px;
                      cursor: pointer;
                    }
                    .field_big_h,.field_big_c {
                      display: none;
                    }
                  }
                  .el-config_container {
                    display: inline-block;
                    svg {
                      width: 24px;
                      height: 24px;
                      cursor: pointer;
                    }
                    .field_config_h,.field_config_c {
                      display: none;
                    }
                  }
                }
              }
            }
          }
        }
        .el-addFields {
          width: 100px;
          height: 32px;
          padding: 0;
          margin-top: 16px;
          font-size: 14px;
          font-family: sy_regular;
          color: #4d4d4d;
          border-radius: 30px;
          border: 1px solid #2b5bd6;
          background-color: #fff;
          span {
            svg {
              width: 20px;
              height: 20px;
              vertical-align: text-bottom;
            }
            display: inline-block;
            height: 32px;
            line-height: 32px;
          }
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
        .el-batch_delete {
          margin-left: 16px;
          width: 100px;
          height: 32px;
          padding: 0;
          border-radius: 30px;
          border: 1px solid #ccc;
          font-size: 14px;
          font-family: sy_regular;
          span {
            svg {
              vertical-align: top;
            }
            .field_delete_small_d,.field_delete_small_h,.field_delete_small_c {
              display: none;
            }
          }
        }
        .activeColor {
          span {
            .field_delete_small_d {
              display: inline-block;
            }
            .field_delete_disabled,.field_delete_small_h,.field_delete_small_c {
              display: none;
            }
          }
          color: #4d4d4d;
          border: 1px solid #d82145;
          background-color: #fff;
          &:hover {
            border-color: #e53c65;
            background-color: #f9f2f4;
            color: #e53c65;
          }
          &:active {
            border-color: #c60928;
            background-color: #f9f2f4;
            color: #c60928;
          }
        }
      }
      .el-back {
        float: right;
        margin-right: 16px;
      }
      .el-save {
        float: right;
      }
    }
    .el-addDialog {
      /deep/ .el-dialog {
        width: 450px;
        border-radius: 16px;
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
          /deep/ .el-form {
            margin-left: 30px!important;
            padding-bottom: 20px;
            position: relative;
            .el-form-item {
              .el-form-item__label {
                font-size: 14px;
                font-weight: 600;
                font-family: sy_regular;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
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
                    // &::before {
                    //   content: '';
                    //   display: block;
                    //   width: 100%;
                    //   height: 0;
                    //   border-bottom: 1px solid #ccc;
                    // }
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
                    // font-family: sy_regular;
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
                  color: #2b5bd6;
                  &:hover,&:active {
                    color: #123ecc;
                  }
                  span {
                    svg {
                      width: 20px;
                      height: 20px;
                      vertical-align: text-bottom;
                    }
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
              color: #2b5bd6;
              &:hover,&:active {
                color: #123ecc;
              }
              span {
                svg {
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
    .el-back-remind {
      /deep/ .el-dialog {
        margin-top: 25vh!important;
        border-radius: 16px;
        .el-dialog__header {
          .el-dialog__title {
            margin-left: 15px;
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
          padding: 10px 0;
          padding-left: 65px;
          font-size: 16px;
          font-family: sy_regular;
        }
        .el-dialog__footer {
          .dialog-footer {
            .el-button {
              font-family: sy_regular;
            }
            .delete {
              background-color: #3d65c9;
              color: #fff;
            }
          }
        }
      }
    }
  }
</style>
