<!-- tinymce可视化编辑的初始化，tinymce基本配置，引入自定义插件，自定义插件的部分初始化配置等 -->
<template>
  <div :id="id"/>
</template>

<script>
import Tinymce from 'tinymce/tinymce'
import 'tinymce/themes/silver/theme'
// import 'tinymce/skins/ui/oxide/skin.min.css'
import 'tinymce/plugins/image'
import 'tinymce/plugins/imagetools'
import 'tinymce/plugins/print'
import 'tinymce/plugins/advlist'
import 'tinymce/plugins/lists'
import 'tinymce/plugins/pagebreak'
import 'tinymce/plugins/preview'
import 'tinymce/plugins/insertdatetime'
// import 'tinymce/plugins/table'
import 'tinymce/plugins/code'
import 'tinymce/plugins/contextmenu'
import 'tinymce/plugins/colorpicker'
import 'tinymce/plugins/textcolor'
import 'tinymce/plugins/searchreplace'
import '@/components/CustomTinymce/plugins/insertDatetime'
import '@/components/CustomTinymce/plugins/insertErrorDatetime'
import '@/components/CustomTinymce/plugins/chartTools'
// import '@/components/CustomTinymce/plugins/insertTable'
import '@/components/CustomTinymce/plugins/insertSpecialTable' // 特定表格组件
import '@/components/CustomTinymce/plugins/insertSpecialChart' // 插入echart组件
import '@/components/CustomTinymce/plugins/insertModelDataVariable' // 模型参数作为变量
import '@/components/CustomTinymce/plugins/insertOriginDataVariable' // 元数据属性作为变量
import '@/components/CustomTinymce/plugins/insertFaultVariable'
import '@/components/CustomTinymce/plugins/uploadImage'
import '@/components/CustomTinymce/plugins/saveEditor'
import '@/components/CustomTinymce/plugins/insertTemplate'
import '@/components/CustomTinymce/plugins/insertModifiableText' // 在导出报告时可被更改的文本
import '@/components/CustomTinymce/plugins/insertModifiableTextFaultAnalysis'
import '@/components/CustomTinymce/langs/zh_CN.js'
import '@/components/CustomTinymce/langs/en_US.js'
// import { getBaseURL } from '@/utils/index.js'
import { getTemplatesList, postTemplateAttachmentFile, autoSaveTemplate, getModelInfoData, setSpecialTable, getOriginDataItems } from '@/views/report/components/editorCommonMethod.js'
import { getTemplateAttachmentList } from '@/api/report/template'
// import user from '@/store/modules/user'
import store from '@/store'

export default {
  model: {
    prop: 'content',
    event: 'changeContent'
  },
  props: {
    content: {
      type: String,
      default: ''
    },
    id: {
      type: String,
      default: '#'
    },
    menubar: {
      type: [String, Array],
      default: 'file edit view format'
      // default: ''
    },
    plugins: {
      type: [String, Array],
      default: 'lists image media table textcolor wordcount contextmenu'
    },
    toolbar1: {
      type: [String, Array],
      default: 'undo redo | formatselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | lists image media table | removeformat'
    },
    toolbar2: {
      type: [String, Array],
      default: ''
    },
    templateData: {
      type: Object,
      default: null
    },
    templateId: {
      type: Number,
      default: -1
    }
  },
  data() {
    return {
      filesList: [],
      templateList: []
    }
  },
  created() {
    // 模板复用功能
    var _this = this
    getTemplatesList(function(lists) {
      if (Object.prototype.toString.call(lists).indexOf('Array') !== -1) {
        for (var each_temp of lists) {
          _this.templateList.push({ title: each_temp.name, description: each_temp.description, content: each_temp.content_html })
        }
      }
    })

    getTemplateAttachmentList({ 'type': 'img' }).then(res => {
      for (var each_file of res.data.results) {
        _this.filesList.push({ title: each_file.name, value: each_file.file })
      }
    }).catch(error => {
      console.log('getTemplateAttachmentList error', error)
    })
  },
  mounted() {
    const vm = this
    Tinymce.init({
      // selector: '#${this.id}',
      selector: '#' + this.id,
      language_url: store.state.app.language ? '@/components/CustomTinymce/langs/zh_CN.js' : '@/components/CustomTinymce/langs/en_US.js',
      language: store.state.app.language ? 'zh_CN' : 'en_US', // 系统的语言一致
      skin_url: '/static/tinymce/skins/ui/oxide',
      content_css: '/static/tinymce/skins/content/default/content.css',
      height: 700,
      plugins: this.plugins,
      toolbar1: this.toolbar1,
      toolbar2: this.toolbar2,
      // menubar: this.menubar, // 隐藏最上方menu用false
      menubar: false,
      block_formats: 'Heading 1=h1;Heading 2=h2;Heading 3=h3;Heading 4=h4;Heading 5=h5;Heading 6=h6;Paragraph=p;', // 段落功能的自定义，此处设置的意义是去除pre功能
      branding: false, // 去水印
      browser_spellcheck: true, // 拼写检查
      elementpath: false, // 禁用编辑器底部的状态栏
      statusbar: false, // 隐藏编辑器底部的状态栏
      paste_data_images: true, // 允许粘贴图像
      templates: this.templateList,
      current_template: this.templateData,
      current_template_id: this.templateId,
      // autosave_interval: '60s', // 自动保存的时间间隔
      image_list: this.filesList,
      // upload_base_url: getBaseURL(), // 开启此处，getFilesList的value选择url,可隐藏域名
      images_upload_handler(blobInfo, success, failure) {
        const formData = new FormData()
        console.log(blobInfo.filename())
        formData.append('file', blobInfo.blob())
        postTemplateAttachmentFile(formData, function(data) {
          // console.log('callback postTemplateAttachment', data)
          if (data.result === 'success') {
            success(data.data)
          } else if (data.result === 'failed') {
            failure(data.data)
          }
        })
      },
      save_editor_callback(editor) {
        // 此处为saveEditor自动保存插件的保存处理
        // 需要html转json操作，并将数据内容上传到服务器
        autoSaveTemplate(editor, editor.settings.current_template, editor.settings.current_template_id)
      },
      get_modelitems_callback(editor, sType, modelid, modeltype, paramkey) {
        console.log('get_modelitems_callback', sType, modelid, modeltype)
        getModelInfoData(sType, editor, modelid, modeltype, paramkey)
      },
      get_modelattrs_callback(editor, sType, modelid, modeltype, paramkey) {
        getModelInfoData(sType, editor, modelid, modeltype, paramkey)
      },
      set_specialtable_callback(editor) {
        setSpecialTable(editor)
      },
      get_originitems_callback(editor, sType, zName) {
        getOriginDataItems(sType, zName, editor)
      },
      setup: function(editor) {
        editor.ui.registry.addIcon(
          'editable-text',
          '<svg t="1574298599143" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1290" width="20" height="20"><path d="M85.333333 170.666667v682.666666h853.333334V170.666667H85.333333zM0 85.333333h1024v853.333334H0V85.333333z m298.666667 640h42.666666v42.666667H213.333333v-42.666667h42.666667V298.666667H213.333333V256h128v42.666667H298.666667v426.666666z" fill="#2c2c2c" p-id="1291"></path></svg>'
        )
        editor.ui.registry.addIcon(
          'insert-echart',
          '<svg t="1576138270359" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="10911" width="18" height="18"><path d="M788.7 52.7l41.2 41.2c12 12 12 31.6 0 43.6L574.8 392.6c-12 12-31.6 12-43.6 0L346.9 208.3c-12-12-31.6-12-43.6 0L48.5 463c-5.8 5.8-9 13.6-9 21.8v25.9c0 27.5 33.2 41.2 52.7 21.8l211.1-211.1c12-12 31.6-12 43.6 0L496.5 471l34.8 34.8c12 12 31.6 12 43.6 0l34.8-34.8 276.9-276.9c12-12 31.6-12 43.6 0l41.2 41.2c19.4 19.4 52.7 5.7 52.7-21.8V30.8c0-17-13.8-30.8-30.8-30.8H810.5c-27.5 0-41.2 33.2-21.8 52.7z" p-id="10912"></path><path d="M984.5 349c0-8.2-3.2-16-9-21.8l-40.7-40.7c-12-12-31.6-12-43.6 0l-64.6 64.6c-5.8 5.8-9 13.6-9 21.8v616.3c0 19.2 15.6 34.8 34.8 34.8h97.4c19.2 0 34.8-15.6 34.8-34.8V349h-0.1zM725.2 526.9c0-27.5-33.2-41.2-52.7-21.8L567.2 610.4c-5.8 5.8-9 13.6-9 21.8v357c0 19.2 15.6 34.8 34.8 34.8h97.4c19.2 0 34.8-15.6 34.8-34.8V526.9zM465.9 541c0-8.2-3.2-16-9-21.8L351.5 413.8c-12-12-31.6-12-43.6 0-5.8 5.8-9 13.6-9 21.8v553.6c0 19.2 15.6 34.8 34.8 34.8h97.4c19.2 0 34.8-15.6 34.8-34.8V541zM206.5 589.6c0-27.5-33.2-41.2-52.7-21.8L48.5 673.1c-5.8 5.8-9 13.6-9 21.8v294.2c0 19.2 15.6 34.8 34.8 34.8h97.4c19.2 0 34.8-15.6 34.8-34.8V589.6z" fill="#070102" p-id="10913"></path></svg>'
        )
        editor.ui.registry.addIcon(
          'insert-error-time',
          '<svg t="1576114906844" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4454" width="28" height="28"><path d="M759.5 253.1C691.2 184.8 601.6 150.6 512 150.6s-179.2 34.2-247.5 102.5c-136.7 136.7-136.7 358.3 0 495 68.3 68.4 157.9 102.5 247.5 102.5s179.2-34.2 247.5-102.5c136.7-136.7 136.7-358.3 0-495z m-38.7 456.3C665 765.2 590.9 795.9 512 795.9c-67.1 0-130.8-22.3-182.7-63.3l92.1-80.6c-22.9-15-41.9-35.4-55.1-59.5l-93.2 81.6c-83.9-115.4-73.9-278.4 30.1-382.4 55.8-55.8 129.9-86.5 208.8-86.5 76.5 0 148.5 28.9 203.7 81.5l-104.5 91.4c22 16.2 39.8 37.6 51.7 62.4l103.3-90.4c26.8 45.1 41 96.6 41 150.4 0.1 79-30.6 153.1-86.4 208.9z" fill="#2c2c2c" p-id="4455"></path><path d="M666.9 554.2H480.4V365.3c0-15.9-15-28.8-33.4-28.8s-33.4 12.9-33.4 28.8v242.4c0 15.9 14.9 28.8 33.4 28.8 4.3 0 8.3-0.8 12-2 1 0.1 2 0.3 3 0.3h204.9c25.8 0 46.7-18 46.7-40.3 0-22.3-20.9-40.3-46.7-40.3z" fill="#2c2c2c" p-id="4456"></path></svg>'
        )
        editor.ui.registry.addIcon(
          'insert-fault-variable',
          '<svg t="1566462891518" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="16177" width="24" height="24"><path d="M509.994667 85.333333C275.84 85.333333 85.333333 276.736 85.333333 512s191.402667 426.666667 426.666667 426.666667 426.666667-191.402667 426.666667-426.666667S746.368 85.333333 509.994667 85.333333zM512 853.333333c-188.202667 0-341.333333-153.130667-341.333333-341.333333s152.192-341.333333 339.328-341.333333C699.349333 170.666667 853.333333 323.797333 853.333333 512s-153.130667 341.333333-341.333333 341.333333z" fill="" p-id="16178"></path><path d="M469.333333 298.666667h85.333334v256h-85.333334z m0 341.333333h85.333334v85.333333h-85.333334z" fill="" p-id="16179"></path></svg>'
        )
        editor.ui.registry.addIcon(
          'insert-data-variable',
          '<svg t="1567059913701" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="18714" width="20" height="20"><path d="M755.712 204.8H268.288c-34.816 0-63.488 28.672-63.488 63.488v487.424c0 34.816 28.672 63.488 63.488 63.488h487.424c34.816 0 63.488-28.672 63.488-63.488V268.288c0-34.816-28.672-63.488-63.488-63.488z m-30.72 504.832h-1.024c0 8.192-8.192 14.336-16.384 14.336H311.296c-8.192 0-14.336-8.192-14.336-16.384V314.368c0-8.192 8.192-14.336 16.384-14.336h397.312c8.192 0 14.336 8.192 14.336 16.384v393.216z m-122.88-242.688c13.312 0 39.936-11.264 39.936-46.08s-25.6-36.864-32.768-36.864c-15.36 0-30.72 11.264-44.032 34.816-13.312 23.552-28.672 50.176-28.672 50.176h-1.024c-3.072-16.384-6.144-30.72-7.168-36.864-3.072-14.336-19.456-46.08-54.272-46.08s-66.56 20.48-66.56 20.48c-6.144 4.096-10.24 10.24-10.24 18.432 0 11.264 9.216 21.504 21.504 21.504 3.072 0 6.144-1.024 9.216-2.048 0 0 26.624-14.336 31.744 0 2.048 4.096 3.072 9.216 5.12 14.336 7.168 22.528 13.312 50.176 18.432 74.752L460.8 566.272s-25.6-9.216-38.912-9.216-39.936 11.264-39.936 46.08 25.6 36.864 32.768 36.864c15.36 0 30.72-11.264 44.032-34.816 13.312-23.552 28.672-50.176 28.672-50.176 4.096 21.504 8.192 38.912 10.24 46.08 9.216 24.576 28.672 39.936 55.296 39.936 0 0 27.648 0 59.392-18.432 8.192-3.072 13.312-11.264 13.312-19.456 0-11.264-9.216-21.504-21.504-21.504-3.072 0-6.144 1.024-9.216 2.048 0 0-23.552 13.312-30.72 3.072-6.144-10.24-10.24-24.576-14.336-43.008-3.072-15.36-7.168-33.792-11.264-52.224l23.552-33.792c1.024 0 26.624 9.216 39.936 9.216z" p-id="18715"></path></svg>'
        )
        editor.ui.registry.addIcon(
          'insert-template',
          '<svg t="1574298938579" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4290" width="20" height="20"><path d="M832.170667 968.248889H192c-58.88 0-106.666667-50.062222-106.666667-111.616V168.504889C85.333333 106.894222 133.12 56.888889 192 56.888889h640c58.88 0 106.666667 50.005333 106.666667 111.616v688.128c0.170667 61.44-47.786667 111.616-106.496 111.616zM208.440889 145.180444c-19.456 0-35.555556 16.782222-35.555556 37.205334V844.231111c0 20.593778 16.099556 37.205333 35.555556 37.205333h609.393778a36.352 36.352 0 0 0 35.555555-37.205333V182.385778c0-20.423111-15.872-37.205333-35.555555-37.205334H208.440889z" fill="#000000" p-id="4291"></path><path d="M676.181333 597.333333H290.929778c-19.342222 0-34.929778-19.057778-34.929778-42.666666S271.587556 512 290.929778 512h385.251555c19.342222 0 34.929778 19.057778 34.929778 42.666667s-15.587556 42.666667-34.929778 42.666666zM735.971556 768H288.028444c-17.749333 0-32.028444-19.057778-32.028444-42.666667s14.279111-42.666667 32.028444-42.666666h447.943112c17.749333 0 32.028444 19.057778 32.028444 42.666666s-14.279111 42.666667-32.028444 42.666667zM256 284.444444a56.888889 56.888889 0 1 0 113.777778 0 56.888889 56.888889 0 0 0-113.777778 0zM455.111111 284.444444a56.888889 56.888889 0 1 0 113.777778 0 56.888889 56.888889 0 0 0-113.777778 0zM654.222222 284.444444a56.888889 56.888889 0 1 0 113.777778 0 56.888889 56.888889 0 0 0-113.777778 0z" fill="#000000" p-id="4292"></path></svg>'
        )
        editor.ui.registry.addIcon(
          'insert-histogram',
          '<svg t="1566279896184" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5284" width="24" height="24"><path d="M99.58015625 147.39411458c0-1.22878125 0.46846875-2.456625 1.40540625-3.39459375 0.937875-0.9369375 2.16571875-1.40540625 3.39459375-1.40540625h30.36768c1.22878125 0 2.456625 0.46846875 3.39459375 1.40540625 0.9369375 0.937875 1.40540625 2.16571875 1.40540625 3.39459375v741.26784h807.88128c1.22784375 0 2.4575625 0.46846875 3.3935625 1.4064375 0.937875 0.9369375 1.4064375 2.16571875 1.4064375 3.3935625v30.36768c0 1.22784375-0.46846875 2.4575625-1.4064375 3.3935625-0.9369375 0.937875-2.16571875 1.4064375-3.3935625 1.4064375H99.58016V147.39413333z" p-id="5285"></path><path d="M192.34898634 303.23937256c0-3.03668118 1.15801907-6.0734396 3.47575665-8.38947774 2.31688786-2.31688786 5.35356904-3.47575664 8.38947772-3.47575664H312.21393233c3.03668118 0 6.0734396 1.15801907 8.38947773 3.47575664 2.31688786 2.31688786 3.47575664 5.35356904 3.47575664 8.38947773v558.96486329H192.34896162V303.23938801z" p-id="5286"></path><path d="M586.35308197 467.90194351c0-3.03668118 1.15801907-6.0734396 3.47575664-8.38947773 2.31688786-2.31688786 5.35356904-3.47575664 8.38947773-3.47575665h107.99973633c3.03668118 0 6.0734396 1.15801907 8.38947773 3.47575665 2.31688786 2.31688786 3.47575664 5.35356904 3.47575664 8.38947773v394.3030957H586.35306961V467.9019466z" p-id="5287"></path><path d="M348.10204064 617.84741718c0-3.23912659 1.23612671-6.47833557 3.70747376-8.94877625s5.71047364-3.70747375 8.94877624-3.70747375h115.19971875c3.23912659 0 6.47833557 1.23612671 8.94877625 3.70747375s3.70747375 5.71047364 3.70747375 8.94877625v244.9490625H348.10202087V617.84742707z" p-id="5288"></path><path d="M745.67490069 797.2278579c0-3.03668118 1.15886879-6.0734396 3.47575665-8.38947774s5.35356904-3.47575664 8.38947773-3.47575664h107.99973632c3.03668118 0 6.0734396 1.15886879 8.38947773 3.47575664s3.47575664 5.35356904 3.47575665 8.38947774v64.97797851H745.67486979V797.2278548z" p-id="5289"></path></svg>'
        )
        editor.ui.registry.addIcon(
          'icon-chart-at',
          '<svg t="1576139248331" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="17184" width="20" height="20"><path d="M512 199.6c53.5 0 105.3 8.7 153.9 25.8 46.4 16.4 88 39.7 123.5 69.3 70.5 58.7 109.3 135.9 109.3 217.3s-38.8 158.5-109.3 217.3c-35.5 29.6-77.1 52.9-123.5 69.3-48.6 17.1-100.4 25.8-153.9 25.8s-105.3-8.7-153.9-25.8c-46.4-16.4-88-39.7-123.5-69.3-70.5-58.8-109.4-135.9-109.4-217.3S164 353.5 234.5 294.7c35.5-29.6 77.1-52.9 123.5-69.3 48.7-17.1 100.5-25.8 154-25.8m0-59.5C265.5 140.1 65.7 306.6 65.7 512c0 205.4 199.8 371.9 446.3 371.9S958.3 717.4 958.3 512c0-205.4-199.8-371.9-446.3-371.9z" p-id="17185"></path></svg>'
        )
        editor.ui.registry.addIcon(
          'insert-line',
          '<svg t="1566270145718" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3204" width="24" height="24"><path d="M888 792H200V168c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v688c0 4.4 3.6 8 8 8h752c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8z" p-id="3205"></path><path d="M305.8 637.7c3.1 3.1 8.1 3.1 11.3 0l138.3-137.6L583 628.5c3.1 3.1 8.2 3.1 11.3 0l275.4-275.3c3.1-3.1 3.1-8.2 0-11.3l-39.6-39.6c-3.1-3.1-8.2-3.1-11.3 0l-230 229.9L461.4 404c-3.1-3.1-8.2-3.1-11.3 0L266.3 586.7c-3.1 3.1-3.1 8.2 0 11.3l39.5 39.7z" p-id="3206"></path></svg>'
        )
        editor.ui.registry.addIcon(
          'insert-scatter',
          '<svg t="1566271427215" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7949" width="24" height="24"><path d="M888 792H200V168c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v688c0 4.4 3.6 8 8 8h752c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8z" p-id="7950"></path><path d="M352 604m-64 0a64 64 0 1 0 128 0 64 64 0 1 0-128 0Z" p-id="7951"></path><path d="M454 380m-48 0a48 48 0 1 0 96 0 48 48 0 1 0-96 0Z" p-id="7952"></path><path d="M660 608m-96 0a96 96 0 1 0 192 0 96 96 0 1 0-192 0Z" p-id="7953"></path><path d="M768 294m-56 0a56 56 0 1 0 112 0 56 56 0 1 0-112 0Z" p-id="7954"></path></svg>'
          // 'insertScatter', './src/icons/svg/bug.svg'
        )
        editor.ui.registry.addIcon(
          'icon-chart-adapt',
          '<svg t="1576573300726" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1320" width="20" height="20"><path d="M288 928h-96c-52.8 0-96-43.2-96-96v-96c0-17.6 14.4-32 32-32s32 14.4 32 32v96c0 17.6 14.4 32 32 32h96c17.6 0 32 14.4 32 32s-14.4 32-32 32zM832 928h-96c-17.6 0-32-14.4-32-32s14.4-32 32-32h96c17.6 0 32-14.4 32-32v-96c0-17.6 14.4-32 32-32s32 14.4 32 32v96c0 52.8-43.2 96-96 96zM896 320c-17.6 0-32-14.4-32-32v-96c0-17.6-14.4-32-32-32h-96c-17.6 0-32-14.4-32-32s14.4-32 32-32h96c52.8 0 96 43.2 96 96v96c0 17.6-14.4 32-32 32zM128 320c-17.6 0-32-14.4-32-32v-96c0-52.8 43.2-96 96-96h96c17.6 0 32 14.4 32 32s-14.4 32-32 32h-96c-17.6 0-32 14.4-32 32v96c0 17.6-14.4 32-32 32zM672 768H352c-52.8 0-96-43.2-96-96V352c0-52.8 43.2-96 96-96h320c52.8 0 96 43.2 96 96v320c0 52.8-43.2 96-96 96zM352 320c-17.6 0-32 14.4-32 32v320c0 17.6 14.4 32 32 32h320c17.6 0 32-14.4 32-32V352c0-17.6-14.4-32-32-32H352z" p-id="1321"></path></svg>'
        )
        editor.ui.registry.addIcon(
          'table-model',
          '<svg t="1566954985270" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7741" width="20" height="20"><path d="M511.9250126 961.84999971l-3.5997003-1.7998497-446.40029355-222.69393897V286.49378867L511.9250126 62.03749678l3.59970029 1.79984971 446.40029356 222.65644218v450.86242237l-449.99999385 224.49378867zM116.70795283 703.57152675l367.80684434 183.50970468v-358.0951535L116.70795283 349.67602286v353.8955039z m395.21705977-580.4516206L148.61779297 304.37979805l363.30721963 177.13523672 363.30721963-177.13523672-363.30721963-181.2598919z m395.21705977 226.5561167l-367.80684435 179.31005508v358.09515352l367.80684435-183.5097047V349.67602286z m-270.87742354 219.58169853l184.82209629-90.14248651a27.74768731 27.74768731 0 0 1 36.67194316 12.56145292 27.37271865 27.37271865 0 0 1-12.56145292 36.55945283l-184.85959307 90.14248652a27.56020254 27.56020254 0 0 1-36.63444639-12.52395615 27.37271865 27.37271865 0 0 1 12.56145293-36.59694961zM375.5488792 621.11589893a27.37271865 27.37271865 0 0 1-11.96150274-2.73727178l-184.93458663-90.1799833a27.33522187 27.33522187 0 0 1-12.56145292-36.55945283 27.89767442 27.89767442 0 0 1 36.63444639-12.56145293l184.89708985 90.14248652a27.37271865 27.37271865 0 0 1-12.07399395 51.89567432z" p-id="7742"></path></svg>'
        )
        editor.ui.registry.addIcon(
          'insert-table',
          '<svg t="1573007342991" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1140" width="20" height="20"><path d="M870.4 65.1H153.6c-48.9 0-88.7 39.8-88.7 88.7v716.3c0 48.9 39.8 88.7 88.7 88.7h716.8c48.9 0 88.7-39.8 88.7-88.7V153.8c0-48.9-39.8-88.7-88.7-88.7z m-454 542.5V416.4h191.2v191.2H416.4z m191.2 80v191.2H416.4V687.6h191.2zM144.9 416.4h191.5v191.2H144.9V416.4z m542.7 0h191.5v191.2H687.6V416.4z m-534-271.3h716.8c4.8 0 8.7 3.9 8.7 8.7v182.6H144.9V153.8c0-4.8 3.9-8.7 8.7-8.7z m-8.7 725.1V687.6h191.5v191.2H153.6c-4.8 0.1-8.7-3.8-8.7-8.6z m725.5 8.7H687.6V687.6h191.5v182.6c0 4.8-3.9 8.7-8.7 8.7z" p-id="1141"></path></svg>'
        )
        editor.on('change keyup', () => {
          const content = editor.getContent()
          // 更新文本
          vm.$emit('changeContent', content)
        })
      }
    }).then(editors => {
      this.editor = editors[0]
      // 载入初始文本
      this.editor.setContent(this.content)
    })
  },
  beforeDestroy() {
    // 销毁
    this.editor.remove('#' + this.id)
    this.editor.destroy()
  },
  methods: {
  }
}
</script>
