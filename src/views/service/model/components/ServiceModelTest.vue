<!-- test界面, 由普通视图/json视图两项tab组成 -->
<!-- 构造可视化json编辑器的schema格式
schema: {
  'title': '字段',
  'type': 'object',
  'properties': {
    'name1': {
      'type': 'string',
      default': 'one'
    },...
  }
} -->
<!-- 面板上json的可编辑格式
this.oJsonData = {
  'name1': 'one',
  'name2': 2,
  'name3': 'three'
} -->
<!-- api  post 约定的data格式
{
  "data": {
    "names": [
      "sep_len",
      "sep_wid",
      "pet_len",
      "pet_wid"
    ],
    "ndarray": [
      [
        5.1,
        3.5,
        1.4,
        0.2
      ]
    ]
  }
} -->
<!-- 界面放在dialog的footer是因为elementui文档上说”Dialog 的内容是懒渲染的，即在第一次被打开之前，传入的默认 slot 不会被渲染到 DOM 上。“, 而dialog打开后需要通过DOM获得editor_holder进行初始化json编辑器的操作。为解决首次找不到DOM会报错无法正确显示编辑器的问题，将内容放在了footer下，因为footer是实时渲染的 -->
<template>
  <div class="app_container">
    <el-dialog
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      :close-on-press-escape = "false"
      :show-close="true"
      class="testDialog"
      @close="closeDialog">
      <div slot="footer" class="dialog-footer">
        <el-tabs :before-leave="beforeLeaveTab" type="card" class="testTabs">
          <el-tab-pane :label="$t('labels.service.model.test_normal_tab')">
            <div class="left-tab">
              <div id="editor_holder" style="height: 540px;overflow-y: auto;"/>
              <div style="margin-top:16px;float:right;">
                <el-button type="primary" @click="submitWysiwygTabTest">{{ $t('buttons.test') }}</el-button>
              </div>
            </div>
            <!-- <el-divider direction="vertical"/> -->
            <div class="right-tab">
              <h3>{{ $t('labels.service.output') }}</h3>
              <!-- <el-card class="box-card" shadow="never">
                {{ sTestResult }}
              </el-card> -->
              <textarea cols="50" rows="25" class="form-control normal-textarea outputresult"/>
            </div>
          </el-tab-pane>
          <el-tab-pane :label="$t('labels.service.model.test_json_tab')">
            <div class="left-tab">
              <h3>{{ $t('labels.service.input') }}</h3>
              <div style="height: 500px;">
                <textarea id="output" cols="50" rows="25" class="form-control json-textarea"/>
              </div>
              <div style="margin-top:16px;float:right;">
                <el-button type="primary" @click="jsonTabCopy">{{ $t('buttons.copy') }}</el-button>
                <el-button type="primary" @click="submitJsonTabTest">{{ $t('buttons.test') }}</el-button>
              </div>
            </div>
            <div class="right-tab">
              <h3>{{ $t('labels.service.output') }}</h3>
              <!-- <el-card class="box-card json-textarea" shadow="never">
                {{ sTestResult }}
              </el-card> -->
              <textarea cols="50" rows="25" class="form-control json-textarea outputresult"/>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-dialog>
  </div>
</template>
<script>

// import { getAllModel } from '@/api/datamining/model'
import JSONEditor from 'json-editor-elementui'
import { stringParseNumber } from '@/utils/index'
JSONEditor.defaults.options['disable_edit_json'] = true
JSONEditor.defaults.options['disable_properties'] = true
JSONEditor.defaults.options['disable_collapse'] = true
JSONEditor.defaults.options['show_errors'] = 'always'
JSONEditor.defaults.language = 'zh' // 提示词中文
// JSONEditor.defaults.required_by_default = true
import $ from 'jquery'

export default {
  name: 'ServiceModelTest',
  props: {
    isVisable: {
      type: Boolean,
      default: null
    },
    modelid: {
      type: Number,
      default: 0
    },
    modelInputSchema: {
      type: Array,
      default: null
    },
    modelPath: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      jsonEditor: null, // json编辑器实例
      oOutputJsonData: null,
      oOutputResultJsonData: null,
      schema: null,
      oJsonData: null,
      sTestResult: '',
      startvalObjectData: {}
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
      if (this.isVisable === true) {
        if (this.modelInputSchema !== null) {
          const propertiesObjectData = {}
          this.startvalObjectData = {}
          this.modelInputSchema.forEach(item => {
            let item_type = 'string'
            let item_default = ''
            if (item.type === 'int' || item.type === 'bigint') {
              item_type = 'integer'
              item_default = 0
            } else if (item.type === 'double' || item.type === 'float') {
              item_type = 'number'
              item_default = 0
            }
            propertiesObjectData[item.name] = { type: item_type, default: item_default }
            this.startvalObjectData[item.name] = item_default // 各个参数初始化值
          })
          this.schema = {
            'title': this.$t('labels.service.input'),
            'type': 'object',
            'properties': propertiesObjectData,
            'required': Object.keys(propertiesObjectData) // 必填提示
          }
          this.oJsonData = this.startvalObjectData
          const jsonEditorConfig = {
            schema: this.schema,
            theme: 'elementui',
            iconlib: 'elementui'
          }
          // jsonEditorConfig['startval'] = this.oJsonData
          if (this.jsonEditor === null) {
            this.jsonEditor = new JSONEditor(window.document.getElementById('editor_holder'), jsonEditorConfig)
          }
          // this.jsonEditor.schema = this.schema
          // this.jsonEditor.startval = this.oJsonData
          this.jsonEditor.setValue(this.oJsonData)
          this.oOutputJsonData = window.document.getElementById('output')
          this.oOutputJsonData.value = JSON.stringify(this.oJsonData, null, 2)
          this.oOutputResultJsonData = window.document.getElementsByClassName('outputresult')
          for (let i = 0; i < this.oOutputResultJsonData.length; i++) {
            this.oOutputResultJsonData[i].value = ''
          }
          // this.oOutputResultJsonData.value = ''
        }
      } else if (this.isVisable === false) {
        if (this.jsonEditor !== null) {
          this.jsonEditor.destroy()
          this.jsonEditor = null
          this.startvalObjectData = {}
        }
      }
    }
  },
  methods: {
    postDataByAPI(baseData) { // 将编辑后的json转换为API约定的json格式
      const apiFormatJson = {}
      const apiFormatJsonData = {}
      apiFormatJsonData['names'] = Object.keys(JSON.parse(baseData))
      apiFormatJsonData['ndarray'] = [Object.values(JSON.parse(baseData))]
      apiFormatJson['data'] = apiFormatJsonData
      // api注意：URL上不指定ip和端口，会自动使用前端系统的ip和端口
      const _this = this
      // this.sTestResult = {
      //   'meta': {
      //     'puid': 'd2p0rpvpvguulpi2dn91uol8ed',
      //     'tags': {
      //     },
      //     'routing': {
      //     },
      //     'requestPath': {
      //       'classifier': '10.28.0.39:8888/css-ai/mlflowserver_rest:1.0'
      //     },
      //     'metrics': []
      //   },
      //   'data': {
      //     'names': [],
      //     'ndarray': [{
      //       'features': {
      //         'type': 1,
      //         'values': [5.1, 3.5, 1.4, 0.2]
      //       },
      //       'pet_len': 1.4,
      //       'pet_wid': 0.2,
      //       'prediction': 1,
      //       'sep_len': 5.1,
      //       'sep_wid': 3.5
      //     }]
      //   }
      // }
      // // this.oOutputResultJsonData.value = JSON.stringify(_this.sTestResult, null, 2) // 格式化显示json数据
      // for (let i = 0; i < this.oOutputResultJsonData.length; i++) {
      //   this.oOutputResultJsonData[i].value = JSON.stringify(_this.sTestResult, null, 2)
      // }
      for (let i = 0; i < this.oOutputResultJsonData.length; i++) {
        this.oOutputResultJsonData[i].value = ''
      }
      $.ajax({
        // url: 'http://10.28.0.39:31284/seldon/default/test8/api/v1.0/predictions',
        url: _this.modelPath,
        type: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        data: JSON.stringify(apiFormatJson),
        success: function(data) {
          _this.sTestResult = data.data // TODO：输出结果显示的优化
          // this.oOutputResultJsonData.value = JSON.stringify(_this.sTestResult, null, 2) // 格式化显示json数据
          for (let i = 0; i < _this.oOutputResultJsonData.length; i++) {
            _this.oOutputResultJsonData[i].value = JSON.stringify(_this.sTestResult, null, 2)
          }
        },
        error: function(error) {
          console.log('service model test post api error', error)
          _this.$message({
            type: 'error',
            message: _this.$t('messages.service.test_failed'),
            duration: 2000
          })
        }
      })
    },
    // tab切换前需要校验json格式
    beforeLeaveTab(activeName, oldActiveName) {
      // 可视化界面不会造成json格式错误问题，只有在json编辑界面转可视化界面时需要进行格式校验，反之不必
      if (oldActiveName === '1') {
        // json tab to wysiwyg tab
        try {
          const outputJsonObject = JSON.parse(this.oOutputJsonData.value)
          // if (this.oOutputJsonData.value.split(',').length > Object.keys(outputJsonObject).length) {
          //   // 存在重复的key
          //   this.$message.error(this.$t('messages.service.json_duplicate_key_error'))
          //   return false
          // }
          const newOutputJsonObject = {}
          let hasAutoJsonKey = false
          Object.keys(outputJsonObject).forEach(item => {
            if (Object.prototype.hasOwnProperty.call(this.startvalObjectData, item)) {
              // json中新增了初始化时不存在的key, 结果是false, 不转化在可视化面板显示，并给出提示”普通视图只显示默认字段信息“
              newOutputJsonObject[item] = outputJsonObject[item]
            } else {
              hasAutoJsonKey = true
            }
          })
          this.jsonEditor.setValue(newOutputJsonObject)
          this.oJsonData = newOutputJsonObject
          if (hasAutoJsonKey) {
            this.$message.error(this.$t('messages.service.only_show_the_default_key'))
          }
          // this.jsonEditor.setValue(JSON.parse(this.oOutputJsonData.value))
          // this.oJsonData = JSON.parse(this.oOutputJsonData.value)
        } catch (e) {
          // json 格式错误提醒
          this.$message.error(this.$t('messages.service.json_format_error'))
          return false
        }
      } else if (oldActiveName === '0') {
        // wysiwyg tab to json tab
        this.oJsonData = {}
        for (const itemkey in this.jsonEditor.getValue()) {
          if (this.jsonEditor.getValue()[itemkey] === undefined) { // 如果oJsonData中value是underfined的话，可视化转json，会不再显示这条记录，为避免丢失输入项，将此情况下value置为初始值
            this.oJsonData[itemkey] = 0
            const schemakeytype = this.jsonEditor.schema.properties[itemkey]['type']
            if (schemakeytype === 'integer' || schemakeytype === 'number') {
              this.oJsonData[itemkey] = 0
            } else if (schemakeytype === 'string') {
              this.oJsonData[itemkey] = ''
            } else {
              this.oJsonData[itemkey] = ''
            }
          } else {
            this.oJsonData[itemkey] = this.jsonEditor.getValue()[itemkey]
          }
        }
        this.oOutputJsonData.value = JSON.stringify(this.oJsonData, null, 2)
      }
    },
    // 可视化界面上”测试“按钮
    submitWysiwygTabTest() {
      if (this.jsonEditor.getValue() !== null) {
        this.oJsonData = this.jsonEditor.getValue()
        // 把输入的数字字符串转换成number类型
        for (const key in this.oJsonData) {
          this.oJsonData[key] = stringParseNumber(this.oJsonData[key])
        }
        console.log(this.oJsonData, JSON.stringify(this.oJsonData))
        this.postDataByAPI(JSON.stringify(this.oJsonData))
      }
    },
    // json编辑界面上”测试“按钮
    submitJsonTabTest() {
      // json格式校验
      try {
        this.oJsonData = JSON.parse(this.oOutputJsonData.value)
        // if (this.oOutputJsonData.value.split(',').length > Object.keys(this.oJsonData).length) {
        //   // 存在重复的key
        //   this.$message.error(this.$t('messages.service.json_duplicate_key_error'))
        // } else {
        this.postDataByAPI(this.oOutputJsonData.value)
        // }
      } catch (e) {
        this.$message.error(this.$t('messages.service.json_format_error'))
      }
    },
    jsonTabCopy() {
      document.getElementById('output').select() // 复制文本，选择对象
      document.execCommand('Copy')
    },
    closeDialog() {
      this.$emit('closeDialog', 'test')
    }
  }

}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
@import "src/assets/styles/new-base.scss";
.app_container {
  .testDialog {
    /deep/ .el-dialog {
      height: 750px;
      width: 1076px;
      border-radius: 16px;
      padding: 24px 24px 24px 24px;
      .el-dialog__body {
        padding: 0px 0px;
      }
      .el-dialog__footer {
        // margin-top: 24px;
        text-align: left;
        padding: 0 16px 0 16px;
        .dialog-footer {
          .el-button {
            z-index:80;
            padding: 0px;
            span {
              display: block!important;
              width: 56px;
              height: 32px;
              border-radius: 8px;
              line-height: 32px;
              text-align: center;
            }
          }
        }
        #editor_holder .el-form-item__label {
          width: 30%;
        }
        #editor_holder .el-input__inner {
          width: 50%;
          float: left;
        }
        .el-tabs--card>.el-tabs__header .el-tabs__nav {
          border: 0px solid #E4E7ED;
        }
        .testTabs {
          .el-tabs--card>.el-tabs__header .el-tabs__nav {
            border: 0px solid #E4E7ED;
          }
           /deep/ .el-tabs__item.is-top {
            padding: 0 10px 0 10px;
            width: 82px;
          }
           /deep/ .el-tabs__item.is-top.is-active {
            border: 3px solid #fff;
            border-top-color: #0f32b5;
          }
        }
        .json-textarea {
          resize: none; // 禁止拉伸
          width: 100%;
          height: 500px;
          font-family: monospace;
          background-color: #001b34;
          color: #fff
        }
        .normal-textarea {
          resize: none; // 禁止拉伸
          width: 100%;
          height: 500px;
          font-family: monospace;
        }
        .left-tab {
          float: left;
          width: 48%;
          height: 610px;
          overflow-y: auto;
        }
        .right-tab {
          width: 48%;
          float: right;
          overflow-y: auto;
        }
        .form-group {
          padding-bottom: 56px;
        }
      }
    }
  }
}
</style>
