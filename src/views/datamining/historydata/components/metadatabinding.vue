<template>
  <div class="el-add_field_container">
    <header class="el-add_field_header">
      <el-button :disabled="!recordSelectedDatas.length" plain class="el-add_to_metadata" @click="handleFieldsSave">添加至元数据</el-button>
      <div style="float: right">
        <el-button v-if="!checkedFileds && !loadingFieldData" type="primary" class="isNotAnalysis" @click="analysisFields">解析字段元数据</el-button>
        <el-button v-if="loadingFieldData && !checkedFileds" :disabled="loadingFieldData" type="primary" class="analysising" icon="el-icon-loading">解析中</el-button>
        <el-button v-if="checkedFileds" :disabled="checkedFileds" type="primary" class="analysised">已解析</el-button>
        <el-button v-if="checkedFileds" class="reAnalysis" type="text" @click="analysisFields">重新解析</el-button>
      </div>
    </header>
    <main class="el-add_field_content">
      <div style="height:100%;">
        <el-form ref="metadataData" :model="formData" class="formData">
          <el-table
            ref="multipleTable"
            :data="formData.metadataData"
            fit
            tooltip-effect="dark"
            style="width: 100%;"
            @select="handleCheckboxSelect"
            @select-all="handleCheckboxSelect">
            <el-table-column :selectable="handleDisabled" type="selection" width="55"/>
            <el-table-column label="字段名" prop="name" show-overflow-tooltip>
              <template slot-scope="scope">
                <el-form-item :prop="`metadataData[${scope.$index}].name`" :rules="rules.name">
                  <!-- <el-input v-model="scope.row.name" disabled/> -->
                  <span>{{ scope.row.name }}</span>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="显示名" show-overflow-tooltip>
              <template slot-scope="scope">
                <el-form-item :prop="`metadataData[${scope.$index}].display_name`" :rules="rules.display_name" >
                  <el-input v-model="scope.row.display_name" :disabled="scope.row.bindingState"/>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column prop="type" label="数据类型">
              <template slot-scope="scope">
                <el-form-item :prop="`metadataData[${scope.$index}].type`" :rules="rules.type">
                  <el-select v-model="scope.row.type" :disabled="scope.row.bindingState" @change="clearBefore(scope.row)">
                    <el-option
                      v-for="(item, index) in scope.row.typeSelect"
                      :key="index"
                      :label="item.name"
                      :value="item.type"/>
                  </el-select>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column prop="precision" label="小数位">
              <template slot-scope="scope">
                <!-- <el-form-item v-if="scope.row.type === 'double' || scope.row.type === 'enumeration'" :prop="`metadataData[${scope.$index}].precision`" :rules="scope.row.type === 'float' ? rules.precision : rules.precision1">
                    <el-input v-model="scope.row.other.precision" :disabled="scope.row.bindingState" />
                  </el-form-item> -->
                <el-form-item v-if="scope.row.type === 'double'" :prop="`metadataData[${scope.$index}].precision`" :rules="rules.precision">
                  <el-input v-model="scope.row.other.precision" :disabled="scope.row.bindingState" />
                </el-form-item>
                <!-- <el-form-item v-if="scope.row.type === 'enumeration'" :prop="`metadataData[${scope.$index}].precision`" :rules="rules.precision1">
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
            <el-table-column prop="useNum" label="显示格式">
              <template slot-scope="scope">
                <el-form-item :prop="`metadataData[${scope.$index}].display_format`" :rules="rules.display_format">
                  <el-select v-if="scope.row.type === 'date'" v-model="scope.row.other.format" :disabled="scope.row.bindingState">
                    <el-option
                      v-for="(item, index) in formatSelect"
                      :key="index"
                      :label="item.type"
                      :value="item.type"/>
                  </el-select>
                  <el-select v-if="scope.row.type === 'timestamp'" v-model="scope.row.other.format" :disabled="scope.row.bindingState">
                    <el-option
                      v-for="(item, index) in formatSelect1"
                      :key="index"
                      :label="item.type"
                      :value="item.type"/>
                  </el-select>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column prop="otherAttributes" label="其他属性">
              <template slot-scope="scope">
                <!-- <el-button v-if="!!scope.row.other.standard_value.length || !!scope.row.other.others.length" type="text" @click="handleFields(scope.row)">编辑</el-button>
                  <el-button v-else type="text" @click="handleFields(scope.row)">设置</el-button> -->
                <el-button
                  :disabled="scope.row.bindingState"
                  type="text"
                  class="otherAttributes"
                  @mouseenter.native="showEditAttribute(scope.row, !!handleOtherData(scope.row.other).length)"
                  @mouseleave.native="hideEditAttribute(scope.row, !!handleOtherData(scope.row.other).length)"
                  @click="handleFields(scope.row, !!handleOtherData(scope.row.other).length, scope.$index)">
                  <span v-if="!handleOtherData(scope.row.other).length" :class="`attribute_config${scope.row.id}`" class="attribute_config">
                    <svg-icon icon-class="field_config_d" class="field_config_d"/>
                    <svg-icon icon-class="field_config_h" class="field_config_h"/>
                    <svg-icon icon-class="field_config_c" class="field_config_c"/>
                  </span>
                  <span v-else :class="`attributes_edit${scope.row.id}`" class="attributes_edit">
                    <svg-icon icon-class="field_edit_d" class="field_edit_d"/>
                    <svg-icon icon-class="field_edit_h" class="field_edit_h"/>
                    <svg-icon icon-class="field_edit_c" class="field_edit_c"/>
                  </span>
                </el-button>
              </template>
            </el-table-column>
            <el-table-column v-if="checkedFileds" prop="useNum" label="来源元数据">
              <template slot-scope="scope">
                <el-form-item :rules="rules.display_format" prop="metadataOrigin">
                  <el-select v-model="scope.row.metadataId" :disabled="scope.row.metadatas.length === 0" @change="getBindField(scope.row, scope.row.metadataId)">
                    <el-option
                      v-for="(item, index) in scope.row.metadatas"
                      :key="index"
                      :label="item.metadata_name"
                      :value="item.field_id"/>
                  </el-select>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column v-if="checkedFileds" prop="useNum" label="关联元数据">
              <template slot-scope="scope">
                <el-form-item :rules="rules.display_format" prop="metadataOrigin">
                  <el-button
                    :disabled="scope.row.metadatas.length === 0"
                    type="text"
                    class="metadataBinding"
                    @mouseenter.native="showBindingIcon(scope.row, scope.row.bindingState)"
                    @mouseleave.native="hideBindingIcon(scope.row, scope.row.bindingState)"
                    @click="handleBind(scope.row, scope.$index)">
                    <span v-if="scope.row.bindingState" :class="`binding${scope.row.id}`" class="bingding">
                      <svg-icon icon-class="field_binding_d" class="field_binding_d"/>
                      <svg-icon icon-class="field_binding_h" class="field_binding_h"/>
                      <svg-icon icon-class="field_binding_c" class="field_binding_c"/>
                    </span>
                    <span v-else :class="`unbinding${scope.row.id}`" class="unbinding">
                      <svg-icon icon-class="field_unbinding_d" class="field_unbinding_d"/>
                      <svg-icon icon-class="field_unbinding_h" class="field_unbinding_h"/>
                      <svg-icon icon-class="field_unbinding_c" class="field_unbinding_c"/>
                    </span>
                  </el-button>
                </el-form-item>
              </template>
            </el-table-column>
            <!-- <el-table-column :label="$t('labels.actions')" min-width="200">
                <template slot-scope="scope">
                  <el-button type="primary" @click="handleDelete(scope.row)">{{ $t('buttons.delete') }}</el-button>
                </template>
              </el-table-column> -->
          </el-table>
          <!-- <el-button type="text" @click="addFields">添加字段</el-button> -->
        </el-form>
      </div>
    </main>
    <div class="el-schema">
      <label>
        <span>
          表结构
          <el-tooltip placement="top">
            <div slot="content">
              当训练的模型供实时源使用时,<br>
              需要保存表结构;<br>
              表结构只保存字段名和字段类型
            </div>
            <i class="el-icon-question"/>
          </el-tooltip>
          :
        </span>
      </label>
      <el-select v-model="schemaId" clearable placeholder="请选择" @clear="clearSchemaName">
        <span v-if="addSchemaShow" class="el-addName">
          <el-input v-model="schemaName" @blur="useNewSchemaName(schemaName)"/>
          <el-button type="text" class="cancel" @click="addSchemaShow=false">取消</el-button>
          <el-button type="text" class="save" @click="addSchemaShow=false">保存</el-button>
        </span>
        <el-button v-if="!addSchemaShow" class="el-addSchemaBtn" type="text" @click="addNewSchema">新建</el-button>
        <el-option
          v-for="(item, index) in schemaList"
          :key="index"
          :label="item.name"
          :value="item.id"/>
      </el-select>
      <el-button type="primary" class="el-putUp" @click="saveFieldData">完成</el-button>
    </div>
    <!-- 字段的编辑或设置 -->
    <el-dialog
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      append-to-body
      title="其它属性"
      class="el-addDialog"
      @close="handleClose">
      <el-form ref="fieldData" :model="currentChangeForm" label-position="left" label-width="75px">
        <el-form-item label="字段类型" prop="type">
          <el-select v-model="currentChangeForm.type" class="new-input">
            <el-option
              v-for="(item, index) in currentChangeForm.typeSelect"
              :key="index"
              :label="item.name"
              :value="item.type"/>
          </el-select>
        </el-form-item>
        <div v-if="fieldData.type === 'double' || fieldData.type === 'bigint' || fieldData.type === 'string'" class="float_area">
          <el-form-item v-if="fieldData.type !== 'string'" label="单位" prop="unit">
            <el-input v-model="currentChangeForm.other.unit"/>
          </el-form-item>
          <el-form-item label="标准值" prop="standard_value">
            <el-radio-group v-model="float_standard">
              <el-radio :label="true" >有</el-radio>
              <el-radio :label="false" >无</el-radio>
            </el-radio-group>
            <div v-if="float_standard" class="el-standard_value_area">
              <div v-for="(item, index) in currentChangeForm.other.standard_value" :key="index">
                <label>
                  <span>{{ item.name }}:</span>
                  <el-input v-model="item.value" style="display: inline-block"/>
                  <!-- <el-button v-if="!item.forbid_delete" type="text" @click="deleteStandard(item.name)"><svg-icon icon-class="metadatadelete_c"/></el-button> -->
                  <el-button type="text" @click="deleteStandard(item.name)"><svg-icon icon-class="metadatadelete_c"/></el-button>
                </label>
              </div>
            </div>
            <div v-if="add_standard_value_show" class="el-add-standard_value">
              <label><span>属性名:</span><el-input v-model="add_standard_value_name" /></label>
              <label><span>属性值:</span><el-input v-model="add_standard_value_value" /></label>
              <el-button type="text" @click="saveCurrent">保存</el-button>
            </div>
            <el-button v-if="float_standard" :disabled="add_standard_value_show" type="text" class="el-add-btn" @click="showAddCurrent">添加标准值</el-button>
          </el-form-item>
          <el-form-item label="允许值" prop="allowable_value">
            <el-radio-group v-model="float_allow">
              <el-radio :label="false" >全部</el-radio>
              <el-radio :label="true" >范围</el-radio>
            </el-radio-group>
            <div v-if="float_allow" class="el-standard_value_area">
              <div v-for="(item, index) in currentChangeForm.other.allowable_value" :key="index">
                <label>
                  <span>{{ item.name }}:</span>
                  <el-input v-model="item.value" style="display: inline-block"/>
                </label>
              </div>
            </div>
          </el-form-item>
        </div>
        <!-- 枚举 -->
        <el-form-item label="是否枚举">
          <el-radio-group v-model="is_enum">
            <el-radio :label="false" >{{ $t('strings.no') }}</el-radio>
            <el-radio :label="true" >{{ $t('strings.yes') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="is_enum" label="枚举值">
          <el-input v-model="currentChangeForm.other.range" placeholder="英文逗号分隔"/>
        </el-form-item>
        <div v-if="isOtherAttributesSHow">
          <el-form-item v-for="(item, index) in currentChangeForm.other.customizes" :key="index" :label="item.name + ':'">
            <!-- <el-input v-model="item.name" /> -->
            <el-input v-model="item.value" />
            <el-button type="text" @click="deleteSelfAttr(item.name)"><svg-icon icon-class="metadatadelete_c"/></el-button>
          </el-form-item>
        </div>
        <div v-if="selfAttributeShow" class="el-addSelfAttributes">
          <label><span>属性名:</span><el-input v-model="selfAttributeName" /></label>
          <label><span>属性值:</span><el-input v-model="selfAttributeValue" /></label>
          <el-button type="text" @click="saveSelfAdd">保存</el-button>
        </div>
        <el-button :disabled="showAddSelfInput" type="text" class="addCustomizes" @click="AddSelfAttributeFunc">添加自定义属性</el-button>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button class="cancel" @click="dialogVisible = false">{{ $t('buttons.cancel') }}</el-button>
        <el-button type="primary" @click="dialogVisible = false">{{ $t('buttons.confirm') }}</el-button>
      </div>
    </el-dialog>
    <!-- 勾选数据保存至元数据 -->
    <el-dialog
      :visible.sync="dialogMetadataVisible"
      :close-on-click-modal="false"
      append-to-body
      title="添加元数据至"
      class="el-metadataSave">
      <el-form :model="metadataForm" label-position="left" label-width="60px">
        <el-form-item>
          <el-radio-group v-model="metadataForm.isNew">
            <el-radio :label="true">保存为新</el-radio>
            <el-radio :label="false">选择已有</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="metadataForm.isNew" label="元数据:" class="el-metadata">
          <el-input v-model="metadataForm.name"/>
        </el-form-item>
        <el-form-item v-else label="元数据:" class="el-metadata">
          <el-select v-model="metadataForm.name">
            <el-option
              v-for="(item, index) in metaDataList"
              :key="index"
              :label="item.name"
              :value="item.id"/>
          </el-select>
        </el-form-item>
        <el-button type="primary" size="small" class="confirm" @click="saveFieldsToMeta">确定</el-button>
        <el-button size="small" class="cancel" @click="dialogMetadataVisible = false">取消</el-button>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { addFieldsData, getMetadata, addMetadata, getFieldsInSchema, getOneFieldData } from '@/api/datamining/metadata'
import { getSchemaNameList, addDataList, remoteCsvFile } from '@/api/datamining/historydata'
import { addSchemaData } from '@/api/datamining/schema'
import debounce from 'lodash/debounce'
export default {
  name: 'MetadataBinding',
  props: {
    fieldsData: {
      type: Object,
      default: () => {}
    },
    formMetadata: {
      type: Array,
      default: () => { return [] }
    }
  },
  data() {
    return {
      formData: {
        metadataData: []
      },
      tempData: {
        name: '',
        display_name: '',
        type: '',
        other: {
          is_enum: false,
          format: '',
          precision: '',
          // enumeration_value: '',
          standard_value: [],
          allowable_value: [],
          metadataOrigin: '',
          relateMetadata: '',
          customizes: [],
          range: ''
        }
      },
      dataOfFields: [],
      rules: {
        name: [{ required: true, message: '请输入', trigger: 'change' }],
        type: [{ required: true, message: '请输入', trigger: 'change' }],
        precision: [{ required: false, trigger: 'change', message: '整数' }],
        precision1: [{ required: false, trigger: 'change', message: '枚举数用,分隔' }]
      },
      // typeSelect: [
      //   { name: '浮点型', type: 'double' },
      //   { name: '整型', type: 'bigint' },
      //   { name: '字符串', type: 'string' },
      //   { name: '布尔型', type: 'boolean' },
      //   { name: '日期型', type: 'date' },
      //   { name: '日期时间型', type: 'timestamp' }
      // ],
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
      dialogVisible: false,
      // 是否有标准值
      float_standard: false,
      // 添加标准值
      add_standard_value_show: false,
      add_standard_value_name: '',
      add_standard_value_value: '',
      // 其它属性的操作
      showAddSelfInput: false,
      selfAttributeName: '',
      selfAttributeValue: '',
      selfAttributeShow: false,
      currentChangeForm: {},
      // 自定义属性的显示
      isOtherAttributesSHow: false,
      // 记录被勾选的数据
      recordSelectedDatas: [],
      dialogMetadataVisible: false,
      metadataForm: {
        name: '',
        isNew: true
      },
      metaDataList: [],
      // 存储表结构的的id
      schemaId: null,
      schemaList: [],
      schemaName: '',
      addSchemaShow: false,
      // 暂时没用到
      analysis_fields: true,
      // 解析字段元数据
      checkedFileds: false,
      loadingFieldData: false,
      // 用于解析后的数据存储
      metadataStorage: [],
      standard_value_record: [],
      allowable_value_record: [],
      editObj: {},
      is_enum: false,
      enum_recordor: '',
      stringArr: ['string', 'varchar', 'char', 'bigary', 'array', 'map', 'struct', 'union'],
      intArr: ['tinyint', 'smallint', 'int', 'bigint'],
      doubleArr: ['float', 'double', 'decimal'],
      timeArr: ['timestamp'],
      dataArr: ['date'],
      boolArr: ['boolean']
    }
  },
  watch: {
    '$props.formMetadata': {
      handler(newer, older) {
        console.log('元数据', newer)
        this.formData.metadataData = newer.map(item => {
          const temp = JSON.parse(JSON.stringify(this.tempData))
          temp.name = item.name
          switch (true) {
            case this.stringArr.indexOf(item.type.slice(0, item.type.indexOf('(') === -1 ? item.type.length : item.type.indexOf('('))) >= 0:
              temp.type = 'string'
              temp.firstType = 'string'
              temp.typeSelect = [
                { name: '字符串', type: 'string' }
              ]
              break
            case this.intArr.indexOf(item.type) >= 0:
              temp.type = 'bigint'
              temp.firstType = 'bigint'
              temp.typeSelect = [
                { name: '字符串', type: 'string' },
                { name: '整型', type: 'bigint' },
                { name: '浮点型', type: 'double' }
              ]
              break
            case this.doubleArr.indexOf(item.type.slice(0, item.type.indexOf('(') === -1 ? item.type.length : item.type.indexOf('('))) >= 0:
              temp.type = 'double'
              temp.firstType = 'double'
              temp.typeSelect = [
                { name: '字符串', type: 'string' },
                { name: '整型', type: 'bigint' },
                { name: '浮点型', type: 'double' }
              ]
              break
            case this.timeArr.indexOf(item.type) >= 0:
              temp.type = 'timestamp'
              temp.firstType = 'timestamp'
              temp.typeSelect = [
                { name: '字符串', type: 'string' },
                { name: '日期时间型', type: 'timestamp' }
              ]
              break
            case this.dataArr.indexOf(item.type) >= 0:
              temp.type = 'date'
              temp.firstType = 'date'
              temp.typeSelect = [
                { name: '字符串', type: 'string' },
                { name: '日期型', type: 'date' }
              ]
              break
            case this.boolArr.indexOf(item.type) >= 0:
              temp.type = 'boolean'
              temp.firstType = 'boolean'
              temp.typeSelect = [
                { name: '字符串', type: 'string' },
                { name: '布尔型', type: 'boolean' }
              ]
              break
            default:
              break
          }
          temp.recordorType = item.type
          if (newer.type) {
            temp.display_name = item.display_name
            temp.other.is_enum = !!item.range.length
            temp.other.range = item.range.join(',')
          } else {
            temp.display_name = item.name
          }
          return temp
        })
      },
      deep: true,
      immediate: true
    },
    metadataForm: {
      handler: function(newer, old) {
        if (!newer.isNew && !this.metaDataList.length) {
          getMetadata().then(res => {
            this.metaDataList = res.data.results
          })
        }
      },
      deep: true
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
    // 获取schema
    getSchemaNameList().then(res => {
      this.schemaList = res.data.length ? res.data : [{ name: '', id: '' }]
    })
  },
  mounted() {
  },
  methods: {
    // 绑定图标的切换
    showBindingIcon(row, flag) {
      let box = null
      if (flag) {
        const className = `binding${row.id}`
        box = document.getElementsByClassName(className)[0]
      } else {
        const className = `unbinding${row.id}`
        box = document.getElementsByClassName(className)[0]
      }
      const svgArr = box.getElementsByTagName('svg')
      svgArr[0].style.display = 'none'
      svgArr[1].style.display = 'block'
      svgArr[2].style.display = 'none'
    },
    toggleActive(key) {
      this.listLoading = true
      const self = this
      this.$nextTick(() => {
        setTimeout(() => {
          self.activePanel = key
          self.listLoading = false
        }, 800)
      })
    },
    hideBindingIcon(row, flag) {
      let box = null
      if (flag) {
        const className = `binding${row.id}`
        box = document.getElementsByClassName(className)[0]
      } else {
        const className = `unbinding${row.id}`
        box = document.getElementsByClassName(className)[0]
      }
      const svgArr = box.getElementsByTagName('svg')
      svgArr[0].style.display = 'block'
      svgArr[1].style.display = 'none'
      svgArr[2].style.display = 'none'
    },
    // 其它属性图标的设置
    showEditAttribute(row, flag) {
      let box = null
      if (flag) {
        const className = `attributes_edit${row.id}`
        box = document.getElementsByClassName(className)[0]
      } else {
        const className = `attribute_config${row.id}`
        box = document.getElementsByClassName(className)[0]
      }
      const svgArr = box.getElementsByTagName('svg')
      svgArr[0].style.display = 'none'
      svgArr[1].style.display = 'block'
      svgArr[2].style.display = 'none'
    },
    hideEditAttribute(row, flag) {
      let box = null
      if (flag) {
        const className = `attributes_edit${row.id}`
        box = document.getElementsByClassName(className)[0]
      } else {
        const className = `attribute_config${row.id}`
        box = document.getElementsByClassName(className)[0]
      }
      const svgArr = box.getElementsByTagName('svg')
      svgArr[0].style.display = 'block'
      svgArr[1].style.display = 'none'
      svgArr[2].style.display = 'none'
    },
    // 页面关闭的时候
    closeContainer() {
      this.checkedFileds = false
      this.loadingFieldData = false
      this.formData.metadataData = []
      if (this.fieldsData.file_uuid) {
        remoteCsvFile(this.fieldsData.file_uuid)
      }
    },
    // 返回到元数据管理页面
    backTo() {
      this.$router.go(-1)
    },
    // 复选框禁用得问题
    handleDisabled(row, index) {
      return !row.bindingState
    },
    // 编辑弹窗关闭时
    handleClose() {
      // this.$refs['fieldData'].resetFields()
      // this.float_standard = false
      // this.float_allow = false
      // this.showAddSelfInput = false
      this.add_standard_value_show = false
      this.add_standard_value_show = false
    },
    handleFields(val, flag, index) {
      this.editObj = val
      let box = null
      if (flag) {
        const className = `attributes_edit${val.id}`
        box = document.getElementsByClassName(className)[0]
      } else {
        const className = `attribute_config${val.id}`
        box = document.getElementsByClassName(className)[0]
      }
      const svgArr = box.getElementsByTagName('svg')
      svgArr[0].style.display = 'none'
      svgArr[1].style.display = 'none'
      svgArr[2].style.display = 'block'
      this.currentChangeForm = val
      this.dialogVisible = true
      this.fieldData = {}
      this.fieldData = val
      this.is_enum = val.other.is_enum
      this.enum_recordor = val.other.range
      this.float_standard = !!val.other.standard_value.length
      this.float_allow = !!val.other.allowable_value.length
      this.isOtherAttributesSHow = !!val.other.customizes.length
      svgArr[0].style.display = 'block'
      svgArr[2].style.display = 'none'
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
    // 删除标准字段
    deleteStandard(val) {
      this.currentChangeForm.other.standard_value = this.currentChangeForm.other.standard_value.filter(item => item.name !== val)
      if (!this.currentChangeForm.other.standard_value.length) {
        this.add_standard_value_show = false
      }
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
    deleteSelfAttributes(val) {
      // 删除其它属性
      this.fieldData.others = this.fieldData.others.filter(item => item.name !== val)
      if (!this.fieldData.others) {
        this.selfAttributeShow = false
      }
    },
    // 添加字段的整体保存
    saveEditFields(val) {
      const temp = JSON.parse(JSON.stringify(this.formData.metadataData))
      temp.forEach(item => {
        item.other = JSON.stringify(item.other)
      })
      addFieldsData(this.$route.params.id, temp).then(res => {
        this.$router.go(-1)
      })
    },
    // 底部添加按钮
    addFields() {
      this.formData.metadataData.push(JSON.parse(JSON.stringify(this.tempData)))
    },
    // 删除字段按钮
    handleDelete(val) {
      this.formData.metadataData = this.formData.metadataData.filter(item => item.name !== val.name)
    },
    // 自定义属性的删除
    deleteSelfAttr(val) {
      this.currentChangeForm.other.customizes = this.currentChangeForm.other.customizes.filter(item => item.name !== val)
      if (!this.currentChangeForm.other.customizes.length) {
        this.isOtherAttributesSHow = false
      }
    },
    // 复选框点击的操作
    handleCheckboxSelect(selection) {
      this.recordSelectedDatas = selection
    },
    // 勾选字段保存至按钮操作
    handleFieldsSave() {
      if (!this.recordSelectedDatas.length) return
      this.dialogMetadataVisible = true
    },
    // 当清空表结构名称时
    clearSchemaName() {
      this.schemaId = null
    },
    // 确定保存数据
    saveFieldsToMeta() {
      // 先把otherjson化
      const temp = this.recordSelectedDatas.map(item => {
        item.other = JSON.stringify(item.other)
        return item
      })
      // 先创建元数据
      if (this.metadataForm.isNew) {
        addMetadata({ name: this.metadataForm.name, description: '' }).then(res => {
          addFieldsData(res.data.id, temp).then(res => {
            this.metadataForm.name = ''
            this.metadataForm.isNew = true
            this.dialogMetadataVisible = false
            this.$message.success('添加成功')
            this.$refs['multipleTable'].clearSelection()
          })
        })
      } else {
        addFieldsData(this.metadataForm.name, temp).then(res => {
          this.metadataForm.name = ''
          this.metadataForm.isNew = true
          this.dialogMetadataVisible = false
          this.$message.success('添加成功')
          this.$refs['multipleTable'].clearSelection()
        }).catch(e => {
          this.$message.error('存在同名字段,不可添加!')
        })
      }
    },
    // 数据集的保存
    saveFieldData() {
      const schema = this.formData.metadataData.map(item => {
        if (item.type === item.firstType) {
          return {
            name: item.name,
            type: item.recordorType
          }
        } else {
          return {
            name: item.name,
            type: item.type
          }
        }
      })
      // 当需要创建表结构的时候
      if (this.schemaName) {
        const temp = {
          name: this.schemaName,
          schema: schema
        }
        addSchemaData(temp).then(res => {
          this.schemaName = ''
          // 添加成功获取到schemaId才可以添加数据集
          const temp = {}
          temp.name = this.fieldsData.name
          temp.description = this.fieldsData.description
          temp.private = this.fieldsData.private
          temp.type = this.fieldsData.type
          temp.schema_id = res.data.id
          if (this.fieldsData.type === 'csv') {
            temp.file_uuid = this.fieldsData.file_uuid
          } else if (this.fieldsData.type === 'hive') {
            temp.database_name = this.fieldsData.database_name
            temp.table_name = this.fieldsData.table_name
          }
          // 关于schema
          temp.schema = this.formData.metadataData.map(item => {
            if (item.bindingState) {
              let tempObj = {}
              // 有值说明发生了绑定
              // 当绑定的时候
              if (typeof item.metadataId === 'string') {
                const oBind = item.metadatas.filter(val => val.metadata_name === item.metadataId)[0]
                tempObj = {
                  field_id: oBind.field_id
                }
              } else {
                tempObj = {
                  field_id: item.metadataId
                }
              }
              return tempObj
            } else {
              // 当没发生值的绑定的时候，JSON化item的other数据
              const obj = {}
              obj.name = item.name
              obj.display_name = item.display_name
              obj.type = item.type
              obj.range = item.range
              obj.other = JSON.stringify(item.other)
              return obj
            }
          })
          addDataList(temp).then(res => {
            this.$emit('freshData')
            this.$emit('changAddDialogStatus', false)
            this.$messge.success('数据集创建成功')
            if (this.fieldsData.file_uuid) {
              remoteCsvFile(this.fieldsData.file_uuid)
            }
          })
        })
        // 先去创建schema
      } else {
        // 当不需要创建表结构的时候
        const temp = {}
        temp.name = this.fieldsData.name
        temp.description = this.fieldsData.description
        temp.private = this.fieldsData.private
        temp.type = this.fieldsData.type
        temp.schema_id = this.schemaId
        if (this.fieldsData.type === 'csv') {
          temp.file_uuid = this.fieldsData.file_uuid
        } else if (this.fieldsData.type === 'hive') {
          temp.database_name = this.fieldsData.database_name
          temp.table_name = this.fieldsData.table_name
        }
        // 关于schema
        temp.schema = this.formData.metadataData.map(item => {
          let obj = {}
          if (item.bindingState) {
            if (typeof item.metadataId === 'string') {
              const oBind = item.metadatas.filter(val => val.metadata_name === item.metadataId)[0]
              obj = {
                field_id: oBind.field_id
              }
            } else {
              obj = {
                field_id: item.metadataId
              }
            }
            return obj
          } else {
            const obj = {}
            obj.name = item.name
            obj.display_name = item.display_name
            obj.type = item.type
            obj.range = item.range
            obj.other = JSON.stringify(item.other)
            return obj
          }
        })
        addDataList(temp).then(res => {
          this.schemaId = null
          this.$emit('freshData')
          this.$emit('changAddDialogStatus', false)
          this.$message.success('数据集创建成功')
          if (this.fieldsData.file_uuid) {
            remoteCsvFile(this.fieldsData.file_uuid)
          }
        })
      }
    },
    // 添加schema
    addNewSchema() {
      this.schemaName = ''
      this.addSchemaShow = true
    },
    useNewSchemaName(val) {
      this.schemaId = val
      this.addSchemaShow = false
    },
    // 关于绑定和解绑的操作
    handleBind(val, index) {
      let box = null
      if (val.bindingState) {
        const className = `binding${val.id}`
        box = document.getElementsByClassName(className)[0]
      } else {
        // 解绑后再次绑定的时候，需要将当前这条数据替换为绑定的这条元数据的数据
        let metadataId = null
        if (typeof val.metadataId === 'string') {
          metadataId = val.metadatas.filter(item => item.metadata_name === val.metadataId)[0].field_id
        } else {
          metadataId = val.metadataId
        }
        this.getBindField(val, metadataId)
        const className = `unbinding${val.id}`
        box = document.getElementsByClassName(className)[0]
      }
      const svgArr = box.getElementsByTagName('svg')
      svgArr[0].style.display = 'none'
      svgArr[1].style.display = 'none'
      svgArr[2].style.display = 'block'
      val.bindingState = !val.bindingState
    },
    // 元数据来源的切换
    getBindField(val, field_id) {
      getOneFieldData(field_id).then(res => {
        const tempData = res.data
        tempData.other = JSON.parse(tempData.other)
        tempData.metadatas = val.metadatas
        tempData.metadataId = val.metadataId
        tempData.bindingState = val.bindingState
        this.formData.metadataData.forEach((item, index) => {
          if (item.id === val.id) {
            this.formData.metadataData.splice(index, 1, tempData)
          }
        })
      })
    },
    // 解析元数据
    analysisFields: debounce(function(val) {
      const schema = this.formData.metadataData.map(item => {
        return {
          name: item.name,
          type: item.type
        }
      })
      this.listLoading = true
      this.loadingFieldData = true
      getFieldsInSchema({ schema }).then(async(res) => {
        const tempObj = res.data.schema.map(async(item) => {
          // 当有绑定值得时候
          if (item.metadatas.length) {
            const p = await getOneFieldData(item.metadatas[0].field_id).then(res => {
              const tempObj = res.data
              tempObj.other = JSON.parse(tempObj.other)
              tempObj.metadatas = item.metadatas
              // 如果能找到对应的绑定数据
              tempObj.metadataId = tempObj.metadatas.length ? tempObj.metadatas[0].metadata_name : ''
              tempObj.bindingState = !!tempObj.metadataId
              return tempObj
            })
            return p
          } else {
            return new Promise((resolve, reject) => {
              const temp = JSON.parse(JSON.stringify(this.tempData))
              temp.name = item.name
              temp.display_name = item.display_name ? item.display_name : item.name
              temp.type = item.type
              temp.metadatas = item.metadatas
              // 如果能找到对应的绑定数据
              temp.metadataId = item.metadatas.length ? item.metadatas[0].metadata_name : ''
              temp.bindingState = !!temp.metadataId
              resolve(temp)
            })
          }
        })
        this.formData.metadataData = await Promise.all(tempObj)
        this.listLoading = false
        this.$nextTick(() => {
          this.checkedFileds = true
        })
      })
    }, 500),
    // 对于其它属性的处理
    handleOtherData(val) {
      // 对other数据进行处理
      const temp = []
      for (const key in val) {
        if (val[key] instanceof Array && val[key].length) {
          temp.push(...val[key])
        } else if (!(val[key] instanceof Array) && val[key]) {
          temp.push({
            name: key,
            value: val[key]
          })
        }
      }
      return temp
    },
    // 改变类型时，将其他属性清空
    clearBefore(row) {
      row.other = {
        format: '',
        precision: '',
        unit: '',
        standard_value: [],
        allowable_value: [],
        customizes: []
      }
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
