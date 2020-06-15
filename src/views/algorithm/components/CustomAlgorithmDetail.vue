<template>
  <div>
    <div style="margin: 30px 0px -30px 20px;">
      <h2>
        <span>{{ $t('strings.alg.custom_alg') }}</span>
        <el-link type="primary" icon="el-icon-question" href="/static/alg/customcodehelp.pdf" target="_blank">
          <span>{{ $t('strings.alg.download_help') }}</span>
        </el-link>
      </h2>
    </div>
    <el-container class="app_container">
      <el-main class="main_container">
        <h3>
          <span>{{ $t('strings.alg.edit_custom_alg_python_code') }}</span>
          <el-button :type="codeButtonType === 'edit' ? 'default' : 'primary'" @click="openCodeEditorDialog">{{ codeButtonTitle }}</el-button>
          <el-link type="primary" href="/static/alg/custom_pattern.py"><span>{{ $t('strings.alg.download_example') }}</span></el-link>
        </h3>
        <div id="editor_holder"/>
        <div style="float:right; padding-top:20px; padding-bottom:30px;">
          <el-button v-if="onlyRead === false" type="default" @click="back">{{ $t('buttons.cancel') }}</el-button>
          <el-button v-if="onlyRead === false" type="primary" @click="submit">{{ $t('buttons.submit') }}</el-button>
        </div>
        <div style="display:none;">
          <textarea id="output" style="width: 100%; height: 300px; font-family: monospace;" class="form-control"/>
        </div>
        <editor-create :is-visable="showCodeEditorComp" :saved-code="customCode" :show-type="codeButtonType" :init-python="initPython" @getCustomCode="getCustomCode" @closeCodeEditorDialog="closeCodeEditorDialog"/>
      </el-main>
    </el-container>
  </div>
</template>
<script>
import JSONEditor from 'json-editor-elementui'
import { postAlgorithmData, getAlgorithmData } from '@/api/algorithm'
import CustomCodeEditor from './CustomCodeEditor'
// import $ from 'jquery'

// JSONEditor的配置项，主要是操作按钮的显示与隐藏，默认都是显示，根据项目需要隐藏以下
// 不显示列表项移动
// JSONEditor.defaults.options['disable_array_reorder'] = true //显示移动按钮
// JSONEditor.defaults.options['disable_collapse'] = true
JSONEditor.defaults.options['disable_edit_json'] = true
JSONEditor.defaults.options['disable_properties'] = true
JSONEditor.defaults.options['disable_array_delete_all_rows'] = true
JSONEditor.defaults.options['disable_array_delete_last_row'] = true
JSONEditor.defaults.language = 'zh' // 提示词中文
// 删除节点，不显示cpnfirm提示
JSONEditor.defaults.options.prompt_before_delete = false
export default {
  name: 'CustomAlgorithmDetail',
  components: {
    'editor-create': CustomCodeEditor
  },
  props: {
    canEdit: {
      type: Boolean,
      default: false
    },
    onlyRead: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      currentUserId: this.$store.state.user.id,
      algJsonEditor: null, // 算法编辑器实例
      schema: require('../customalgschema'),
      iAlgId: null,
      iAlgConfig: '',
      sAlgZname: '',
      iModelId: 0,
      oAlgData: null,
      oOutputJsonData: null,
      algdata: null,
      showCodeEditorComp: false,
      codeButtonType: 'create', // 首次编辑为create，已编辑过（代码内容与初始模板不同）为edit
      codeButtonTitle: this.$t('strings.alg.create_custom_alg_code'),
      customCode: '',
      initPython: ''
    }
  },
  created() {
    // console.log('custom algmanagement index created')
    this.initPython = this.readFile('/static/alg/custom_pattern.py')
    if (this.canEdit) {
      this.iAlgId = this.$route.query && this.$route.query.id
      this.iAlgConfig = this.$route.query && this.$route.query.config
      this.getOneAlgorithmDetailData()
    } else {
      // 创建时使用跟随列表一起获得deschema
      // if (this.$route.query.schema !== null && typeof this.$route.query.schema !== undefined) {
      //   this.schema = this.$route.query.schema
      // }
      // 获取树形结构的parentid
      if (this.$route.query.modelid !== null) {
        this.iModelId = this.$route.query.modelid
      }
      this.iAlgConfig = this.$route.query && this.$route.query.config
    }
    if (this.onlyRead) {
      this.codeButtonType = 'view'
      this.codeButtonTitle = this.$t('strings.alg.view_custom_alg_code')
    }
  },
  mounted() {
    this.oOutputJsonData = window.document.getElementById('output') // 上传json内容检查框，因功能不需要暂时隐藏
    const element = window.document.getElementById('editor_holder')
    const config = {
      schema: this.schema,
      theme: 'elementui',
      iconlib: 'elementui'
    }
    if (this.canEdit) {
      // 每个算法的配置json在这里赋值给编辑器
      config['startval'] = this.oAlgData
      this.oOutputJsonData.value = JSON.stringify(this.oAlgData, null, 2)
      if (this.onlyRead) {
        // 预览模式下，禁止显示操作按钮
        config['disable_array_add'] = true
        config['disable_array_delete'] = true
        config['disable_array_delete_all_rows'] = true
      }
    } else {
      this.oOutputJsonData.value = JSON.stringify(this.schema, null, 2)
    }
    // 根据配置，初始化jsoneditor
    if (!this.algJsonEditor) {
      this.algJsonEditor = new JSONEditor(element, config)
    }
    // this.algJsonEditor = new JSONEditor(element, config)
    // if (this.onlyRead) {
    //   this.algJsonEditor.disable()
    // }
  },
  destroyed() {
    // 离开界面时候销毁editor
    if (this.algJsonEditor !== null) {
      this.algJsonEditor.destroy()
    }
  },
  methods: {
    // 获取每一个指定的算法数据，更新jsoneditor
    getOneAlgorithmDetailData() {
      getAlgorithmData({ 'id': this.iAlgId, 'config': this.iAlgConfig }).then(res => {
        const data = res.data.data
        // console.log('getAlgorithmData', data[0].creator_id, this.currentUserId)
        if (data) {
          this.algdata = data
          this.sAlgZname = data[0].zname
          this.iModelId = data[0].model_id
          this.oAlgData = data[0].content
          if (this.oAlgData.hasOwnProperty('custom_python')) {
            this.customCode = this.oAlgData['custom_python']
            // if (this.customCode !== this.initPython) {
            //   this.codeButtonType = 'edit'
            //   this.codeButtonTitle = this.$t('strings.alg.edit_custom_alg_code')
            // }
            delete this.oAlgData['custom_python']
          }
          // 非创建者看到的公共自定义算法，不可以修改公有私有属性, 在算法配置界面去掉module_permission设置
          if (data[0].creator_id !== this.currentUserId) {
            delete this.oAlgData['module_permission']
          }
          this.algJsonEditor.setValue(this.oAlgData)
          if (this.onlyRead) {
            this.algJsonEditor.disable()
          }
          this.oOutputJsonData.value = JSON.stringify(this.oAlgData, null, 2)
        }
      }).catch(error => {
        console.log('getAlgorithmData', error)
      })
    },

    // 创建或提交修改到服务器后台
    submit(_e) {
      const editor_value = this.algJsonEditor.getValue()
      const operations = {
        op: 'C',
        zname: editor_value.func_zname,
        config: this.iAlgConfig
      }
      let messagetype = ''
      if (this.canEdit) {
        operations['op'] = 'U'
        operations['id'] = this.iAlgId
        // operations['model_id'] = this.iModelId
        messagetype = this.$t('buttons.update')
      } else {
        operations['model_id'] = this.iModelId
        messagetype = this.$t('buttons.create')
      }
      this.oOutputJsonData.value = JSON.stringify(editor_value, null, 2)
      operations['content'] = editor_value
      const { func_args } = editor_value
      for (let i = 0, len = func_args.length; i < len; i++) { // todo 这里有必要把输入的JSON字符串提前解析成Object 等待后期优化
        const temp = func_args[i]
        if (temp.arg_type === 'lists') { // 提前解析下lists组件arg_value 因为在使用时需要array类型 todo 其他类型有待添加
          editor_value.func_args[i].arg_value = temp.arg_value ? JSON.parse(temp.arg_value) : []
        }
      }
      // console.log('postAlgorithmData edit_value', editor_value)
      // // python校验
      if (!this.customCode || /^[\s\t\r\n]+$/g.test(this.customCode)) {
        // 输入: 如果只包含空格、换行、制表符等，置空
        this.customCode = ''
        // 不校验，直接执行postAlgorithmData
      }
      operations['content']['custom_python'] = this.customCode // 自定义的代码

      // 非创建者在编辑他人创建的公开算法时，提交中默认module_permission都是公开
      if (!editor_value.hasOwnProperty('module_permission')) {
        operations['content']['module_permission'] = '公开'
      }

      postAlgorithmData(operations).then(() => {
        this.$message.success(messagetype + this.$t('messages.success'))
        this.$router.go(-1)
      }).catch(error => {
        console.log('alg detail operate error:', error)
        this.$message.error(messagetype + this.$t('messages.failed'))
      })
    },
    back() { // 取消按钮 返回上一页
      this.$router.go(-1)
    },
    openCodeEditorDialog() {
      this.showCodeEditorComp = true
    },
    getCustomCode(val) {
      // console.log('getCustomCode', val)
      this.customCode = val
      this.codeButtonType = 'edit'
      this.codeButtonTitle = this.$t('strings.alg.edit_custom_alg_code')
      // if (this.customCode !== this.initPython) {
      //   this.codeButtonType = 'edit'
      //   this.codeButtonTitle = this.$t('strings.alg.edit_custom_alg_code')
      // } else {
      //   this.codeButtonType = 'create'
      //   this.codeButtonTitle = this.$t('strings.alg.create_custom_alg_code')
      // }
      this.closeCodeEditorDialog()
    },
    closeCodeEditorDialog() {
      this.showCodeEditorComp = false
    },
    readFile(filePath) {
      // 创建一个新的xhr对象
      let xhr = null
      if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest()
      } else {
      // eslint-disable-next-line
      xhr = new ActiveXObject('Microsoft.XMLHTTP')
      }
      const okStatus = document.location.protocol === 'file' ? 0 : 200
      xhr.open('GET', filePath, false)
      xhr.overrideMimeType('text/html;charset=utf-8')
      xhr.send(null)
      return xhr.status === okStatus ? xhr.responseText : null
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
  /deep/ .row{
    table tr td{
      el-button-group{
        display: inline-block;
        width: 165px;
      }
    }
  }
</style>
