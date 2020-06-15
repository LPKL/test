<template>
  <div>
    <el-container class="app_container">
      <el-main class="main_container" style="padding:0 20px;margin-top:0px;">
        <el-form ref="reportTemplateForm" :model="reportTemplateForm" :rules="rules" label-position="right" label-width="100px" style="margin-top:50px;">
          <el-form-item :label="$t('labels.template.name')" prop="name" >
            <el-input v-model="reportTemplateForm.name"/>
          </el-form-item>
          <el-form-item :label="$t('labels.template.desc')">
            <el-input v-model="reportTemplateForm.description"/>
          </el-form-item>
          <el-form-item :label="$t('labels.template.type')">
            <el-radio-group v-model="reportTemplateForm.type">
              <el-radio label="enterprise">{{ $t('labels.template.share') }}</el-radio>
              <el-radio label="personal">{{ $t('labels.template.personal') }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item :label="$t('labels.template.content')" prop="content"/>
          <TinymceEditor ref="editor" :model="reportTemplateForm.content_html" :content="reportTemplateForm.content_html" :id="tinymceid" :plugins="showPlugins" :toolbar1="showToolbars1" :toolbar2="showToolbars2" :template-data="reportTemplateForm" :template-id="template_id" @changeContent="getContent"/>
        </el-form>
        <div style="float:right; padding:20px 0px">
          <el-button size="small" @click="backToList">{{ $t('buttons.back') }}</el-button>
          <!-- <el-button v-loading.fullscreen.lock="uploadButtonLoading" :loading="buttonLoading" type="primary" size="small" @click="checkSave">{{ $t('buttons.upload') }}</el-button> -->
          <el-button :loading="uploadButtonLoading" type="primary" size="small" @click="checkSave">{{ uploadButton }}</el-button>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import TinymceEditor from './components/tinymceInit'
import { contentToJson } from '@/utils/htmlToJson'
import { addTemplate, updateTemplate, getTemplates } from '@/api/report/template'
import { validateInputName } from '@/utils/rules'
import store from '@/store'
export default {
  name: 'TemplateEditor',
  components: {
    TinymceEditor
  },
  data() {
    const checkTemplateNameByAPI = (rules, value, callback) => {
      if (!value) {
        callback(new Error(this.$t('rules.required')))
      } else {
        if (this.template_id === -1) { // 前端只能在创建的时候进行检验
          if (this.reportTemplateForm.type === 'enterprise') {
          // 公共模板不允许重名
            getTemplates({ 'name': this.reportTemplateForm.name, 'type': 'enterprise' }).then(res => {
              if (res.data.count === 0) {
                callback()
              } else {
                callback(new Error(this.$t('rules.duplicate_name_template_enterprise')))
              }
            }).catch(error => {
              console.log('getTemplates', error)
              callback()
            })
          } else {
          // 个人模板不允许与个人已存在模板重名
            getTemplates({ 'name': this.reportTemplateForm.name, 'type': 'personal', 'auth_user': store.state.user.id }).then(res => {
              if (res.data.count === 0) {
                callback()
              } else {
                callback(new Error(this.$t('rules.duplicate_name_template_personal')))
              }
            }).catch(error => {
              console.log('getTemplates', error)
              callback()
            })
          }
        } else {
          callback()
        }
      }
    }
    var validateContent = (rule, value, callback) => {
      if (typeof this.reportTemplateForm.content_html === 'undefined') {
        callback(new Error(this.$t('rules.required')))
      } else {
        callback()
      }
    }
    return {
      uploadButton: this.$t('buttons.upload'),
      uploadButtonLoading: false,
      // templatelist: [],
      template_id: -1,
      reportTemplateForm: {
        name: '',
        description: '',
        type: 'personal',
        content_html: '',
        content_json: ''
      },
      rules: {
        name: [
          { required: true, message: this.$t('rules.required'), trigger: 'blur' },
          { required: true, trigger: 'blur', validator: validateInputName },
          { required: true, validator: checkTemplateNameByAPI, trigger: 'blur' }
        ],
        content: [
          { required: true, trigger: 'blur', validator: validateContent }
        ]
      },
      tinymceid: 'tinymce1',
      showPlugins: '',
      showToolbars1: '',
      showToolbars2: ''
    }
  },
  created() {
    if (this.$route.params.template !== null && typeof this.$route.params.template !== 'undefined') {
      this.template_id = this.$route.params.template.id
      this.reportTemplateForm.content_html = this.$route.params.template.content_html
      this.reportTemplateForm.content_json = this.$route.params.template.content_json
      this.reportTemplateForm.name = this.$route.params.template.name
      this.reportTemplateForm.description = this.$route.params.template.description
      this.reportTemplateForm.type = this.$route.params.template.type
      // console.log('faultdatafaultdatafaultdata', this.template_id, this.reportTemplateForm.content_html)
    }
    // if (this.$route.query.templates !== null && typeof this.$route.query.templates !== 'undefined') {
    //   this.templatelist = this.$route.query.templates
    //   console.log('templatelist', this.templatelist)
    // }
    this.initData()
  },
  methods: {
    initData() {
      // 获取已存储的配置数据
      this.showPlugins = 'advlist lists pagebreak preview print chartTools code insertDatetime insertErrorDatetime insertModelDataVariable insertOriginDataVariable insertFaultVariable saveEditor insertTemplate uploadImage insertModifiableText insertModifiableTextFaultAnalysis insertSpecialTable insertSpecialChart'
      this.showToolbars1 = 'undo redo| bold italic underline strikethrough | formatselect | alignleft aligncenter alignright alignjustify | outdent indent | numlist bullist | forecolor backcolor removeformat | code'
      this.showToolbars2 = 'insertSpecialChart | uploadImage insertSpecialTable | insertDatetime | insertErrorDatetime insertFaultVariable | insertModelDataVariable insertOriginDataVariable | insertModifiableText insertModifiableTextFaultAnalysis | insertTemplate | saveEditor'
    },
    getContent(data) {
      this.reportTemplateForm.content_html = data
    },
    checkSave() {
      this.$refs['reportTemplateForm'].validate((valid) => {
        if (valid) {
          // console.log('reportTemplateForm', this.reportTemplateForm)
          this.uploadButtonLoading = true
          this.uploadButton = this.$t('strings.saving')
          // 返回列表页
          var _this = this
          contentToJson(this.reportTemplateForm.content_html).then(function(data) {
            _this.reportTemplateForm.content_json = data
            // console.log('reportTemplateForm', _this.reportTemplateForm)
            if (_this.template_id === -1) {
              addTemplate(_this.reportTemplateForm).then(res => {
                setTimeout(() => {
                  _this.uploadButtonLoading = false
                  _this.uploadButton = _this.$t('buttons.upload')
                  _this.$router.push({ path: '/template/index' })
                }, 2000)
              }).catch(error => {
                _this.uploadButtonLoading = false
                _this.uploadButton = _this.$t('buttons.upload')
                _this.$message.error(error.message)
                console.log('addTemplate error', error)
              })
            } else {
              updateTemplate(_this.template_id, _this.reportTemplateForm).then(res => {
                setTimeout(() => {
                  _this.uploadButtonLoading = false
                  _this.uploadButton = _this.$t('buttons.upload')
                  _this.$router.push({ path: '/template/index' })
                }, 2000)
              }).catch(error => {
                _this.uploadButtonLoading = false
                _this.uploadButton = _this.$t('buttons.upload')
                _this.$message.error(error.message)
                console.log('updateTemplate error', error)
              })
            }
          })
        } else {
          console.log('template editor checksave error')
          return false
        }
      })
    },
    backToList() {
      // 返回列表管理页面，提示返回将放弃未保存内容
      this.$confirm(this.$t('strings.template.back_list'), this.$t('labels.reminder'), confirm).then(() => {
        this.$router.push({ path: '/template/index' })
      })
    }
  }
}
</script>

