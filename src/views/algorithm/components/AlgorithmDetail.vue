<template>
  <div>
    <el-container class="app_container">
      <el-main class="main_container">
        <div id="editor_holder"/>
        <div style="float:right; padding-top:20px; padding-bottom:30px;">
          <el-button v-if="onlyRead === false" type="primary" @click="submit">{{ $t('buttons.submit') }}</el-button>
        </div>
        <div style="display:none;">
          <textarea id="output" style="width: 100%; height: 300px; font-family: monospace;" class="form-control"/>
        </div>
      </el-main>
    </el-container>
  </div>
</template>
<script>
import JSONEditor from 'json-editor-elementui'
import { postAlgorithmData, getAlgorithmData } from '@/api/algorithm'

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
  name: 'AlgorithmDetail',
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
      algJsonEditor: null, // 算法编辑器实例
      schema: require('../algschema'),
      iAlgId: null,
      iAlgConfig: '',
      sAlgZname: '',
      iModelId: 0,
      oAlgData: null,
      oOutputJsonData: null,
      algdata: null
    }
  },
  created() {
    console.log('algmanagement index created', this.$route)
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
        console.log('getAlgorithmData', data)
        if (data) {
          // 既有算法缺少ppython_editor属性值,界面不会出现编辑器
          if (data[0] && !data[0].content.hasOwnProperty('python_editor')) {
            data[0].content.python_editor = ''
          }
          this.algdata = data
          this.sAlgZname = data[0].zname
          this.iModelId = data[0].model_id
          this.oAlgData = data[0].content
          if (this.oAlgData.hasOwnProperty('node_zname')) {
            if (!this.oAlgData.hasOwnProperty('func_zname')) {
              this.oAlgData['func_zname'] = data[0].content['node_zname']
            }
            delete this.oAlgData['node_zname']
          }
          if (!this.oAlgData['del_type'] && this.oAlgData['del_type'] !== 0) {
            this.oAlgData['del_type'] = 0 // todo 默认节点在预测实验不可删除 为了兼容之前算法节点设置 后期算法都有这个属性之后可以删除此处条件
          }
          if (!this.oAlgData['func_description']) {
            this.oAlgData['func_description'] = '' // todo 为了兼容之前算法节点设置 后期算法都有这个属性之后可以删除此处条件
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
      if (!editor_value.func_zname) {
        this.$message.error(this.$t('messages.alg.required_algorithm_name'))
        return false
      }
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
      if (this.algdata) {
        if (!this.algdata[0].node_zname) { // 为了兼容老算法配置内容
          this.$message.error(this.$t('messages.alg.required_algorithm_name_error'))
          return false
        } else {
          // editor_value.node_zname = this.algdata[0].node_zname
        }
      }
      operations['content'] = editor_value
      const { func_args } = editor_value
      for (let i = 0, len = func_args.length; i < len; i++) { // todo 这里有必要把输入的JSON字符串提前解析成Object 等待后期优化
        const temp = func_args[i]
        if (temp.arg_type === 'lists') { // 提前解析下lists组件arg_value 因为在使用时需要array类型 todo 其他类型有待添加
          editor_value.func_args[i].arg_value = temp.arg_value ? typeof temp.arg_value === 'string' ? JSON.parse(temp.arg_value) : temp.arg_value : []
        }
      }
      console.log('postAlgorithmData', editor_value)
      // // python校验
      if (!editor_value.python_editor || /^[\s\t\r\n]+$/g.test(editor_value.python_editor)) {
        // 输入: 如果只包含空格、换行、制表符等，置空
        editor_value.python_editor = ''
        // 不校验，直接执行postAlgorithmData
      } else {
        console.log('postAlgorithmData', editor_value)
        // 发送校验参数{ pythoncode:editor_value.python_editor }
        // 校验失败提示
        // 校验成功执行postAlgorithmData
      }

      postAlgorithmData(operations).then(() => {
        this.$message.success(messagetype + this.$t('messages.success'))
        this.$router.go(-1)
      }).catch(error => {
        console.log('alg detail operate error:', error)
        this.$message.error(messagetype + this.$t('messages.failed'))
      })
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
  /deep/ #editor_holder .el-form.el-card.box-card.el-card__body{
    overflow: auto;
    width: 100%;
    table tr th{
      min-width: 150px;
    }
    table > tbody > tr > div{
      min-width: 200px;
    }
  }
</style>
