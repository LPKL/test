<template>
  <div class="app_container">
    <el-dialog
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      :close-on-press-escape = "false"
      :show-close="true"
      :title="$t('strings.alg.custom_alg_code')"
      class="testDialog"
      @close="closeDialog">
      <div slot="footer" class="dialog-footer">
        <div v-show="showType !== 'view'" style="margin-top:5px;float:right;">
          <el-tooltip content="Ctrl + Z" placement="top" effect="light">
            <el-button icon="el-icon-arrow-left" style= "width: 40px;height: 40px;background-color: #fff;" @click="undoEditor"/>
          </el-tooltip>
          <el-tooltip content="Ctrl + Y" placement="top" effect="light">
            <el-button icon="el-icon-arrow-right" style= "width: 40px;height: 40px;background-color: #fff;" @click="redoEditor"/>
          </el-tooltip>
        </div>
        <div style="width: 100%; overflow-y: auto;">
          <textarea ref="mycode" v-model="oJsonData" class="code"/>
        </div>
        <div v-show="showType !== 'view'" style="margin-top:16px;float:right;">
          <el-button type="default" @click="resetCustomCode">{{ $t('buttons.reset') }}</el-button>
          <el-button type="primary" @click="submitCustomCode">{{ $t('buttons.save') }}</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script>

import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/material.css'
import 'codemirror/mode/python/python'
import 'codemirror/addon/fold/foldgutter'
import 'codemirror/addon/selection/active-line'
// require('codemirror/addon/lint/lint')
// require('codemirror/addon/lint/javascript-lint')
// require('codemirror/addon/lint/json-lint')
// require('codemirror/addon/lint/css-lint')
const CodeMirror = require('codemirror/lib/codemirror')
import { commonConfirm } from '@/utils/actions'

export default {
  name: 'CustomCodeEditor',
  props: {
    isVisable: {
      type: Boolean,
      default: null
    },
    savedCode: {
      type: String,
      default: ''
    },
    showType: {
      type: String,
      default: ''
    },
    initPython: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      schema: {
        'title': this.$t('strings.alg.custom_alg_code'),
        'type': 'string',
        'format': 'python'
      },
      // initPython: '', // 初始代码
      // schema: require('../customalgschema'),
      oJsonData: null,
      pythonEditor: null
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
        if (this.showType === 'view') {
          this.pythonEditor.setOption('readOnly', true)
        } else {
          this.pythonEditor.setOption('readOnly', false)
        }
        if (this.savedCode !== '') {
          this.oJsonData = this.savedCode
          this.pythonEditor.setValue(this.savedCode)
        } else {
          this.oJsonData = this.initPython
          this.pythonEditor.setValue(this.initPython)
        }
        setTimeout(() => {
          this.pythonEditor.refresh()
        }, 1)
        // this.pythonEditor.setValue(this.initPython) // 初始模板，是忘了请求，还是本地存储？
      } else if (this.isVisable === false) {
        if (this.pythonEditor !== null) {
          // this.pythonEditor.toTextArea()
          // this.pythonEditor = null
        }
      }
    }
  },
  mounted() {
    this.pythonEditor = CodeMirror.fromTextArea(this.$refs.mycode, {
      mode: 'python', // 选择对应代码编辑器的语言，我这边选的是数据库，根据个人情况自行设置即可
      theme: 'default', // material
      indentWithTabs: true,
      matchBrackets: true, // 括号匹配
      readOnly: false,
      indentUnit: 2, // 缩进单位
      smartIndent: true, // 自动缩进
      tabSize: 4, // tab缩进
      showCursorWhenSelecting: true,
      lineNumbers: true, // 行号
      firstLineNumber: 1,
      styleActiveLine: true, // 高亮选中行
      lineWrapping: true, // 长文换行  滚动使用scroll
      fixexGutter: true,
      autofocus: true
      // lintOnChange: true,
      // gutters: ['CodeMirror-lint-markers'],
      // lint: true
    })
    // this.oJsonData = this.initPython
    // this.pythonEditor.setValue(this.initPython)
    // this.pythonEditor.on('cursorActivity', function() {
    //   console.log('eeewwww')
    // })
  },
  methods: {
    // 重置按钮
    resetCustomCode() {
      commonConfirm(this, () => {
        // 代码编辑初始界面
        this.oJsonData = this.initPython
        this.pythonEditor.setValue(this.oJsonData)
        setTimeout(() => { // 赋值的代码会及时显示，否则需要点击面板才显示
          this.pythonEditor.refresh()
        }, 1)
      }, this.$t('messages.alg.reset_original_template_code'), this.$t('labels.reminder'))
    },
    // 保存按钮
    submitCustomCode() {
      if (this.pythonEditor.getValue() !== null) {
        this.oJsonData = this.pythonEditor.getValue()
        // console.log('oJsonData', this.oJsonData)
        // TODO: 检验代码，保存代码
        this.$emit('getCustomCode', this.oJsonData)
      }
    },
    closeDialog() {
      this.$emit('closeCodeEditorDialog')
    },
    undoEditor() { // 编辑内容undo
      this.pythonEditor.undo()
    },
    redoEditor() { // 编辑妮儿redo
      this.pythonEditor.redo()
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
@import "src/assets/styles/new-base.scss";
.app_container {
  .testDialog {
    /deep/ .el-dialog {
      height: 550px;
      width: 80%;
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
      }
    }
  }
}
</style>
