<template>
  <div class="drop_container">
    <el-dropdown class="filter-item" trigger="click" @command="uploadCommand">
      <el-button v-is-show="{name:'adddata'}" type="primary">
        {{ $t('strings.dfilemanage.addCsv') }}<i class="el-icon-caret-bottom el-icon--right"/>
      </el-button>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item v-is-show="{name:'uploadfiles'}" name="uploadfiles" class="clearfix" command="csv">
          {{ $t('strings.dfilemanage.fileCsv') }}
        </el-dropdown-item>
        <el-dropdown-item v-is-show="{name:'uploadfiles'}" name="uploadwav" class="clearfix" command="wav">
          {{ $t('strings.dfilemanage.wav') }}
        </el-dropdown-item>
        <el-dropdown-item v-is-show="{name:'hiveData'}" name="hiveData" class="clearfix" command="Hive">
          {{ $t('strings.dfilemanage.fileHive') }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <!-- 文件上传 -->
    <el-dialog
      v-loading="loading"
      :visible.sync="dialogTableVisible"
      :close-on-click-modal = "false"
      :close-on-press-escape = "false"
      :before-close = "beforeClose"
      :title="textMap[dialogStatus]"
      :element-loading-text="$t('strings.dfilemanage.fileuploading')"
      :class="{ 'csvDialog': dialogStatus !=='wav' }"
      style="margin-top: -10vh"
      class="addDialog"
      @open="beforeUpload">
      <template v-if="fileupNext">
        <el-form ref="dataForm" :rules="rules" :model="filed" label-width="80px" label-position="left">
          <el-form-item :label="$t('labels.name')" prop="name">
            <el-input v-model.trim="filed.name" class="new-input" width="80%"/>
          </el-form-item>
          <el-form-item :label="$t('labels.desc')" prop="description" class="description">
            <el-input :autosize="{ minRows: 2, maxRows: 4}" v-model="filed.description" type="textarea" class="new-input" style="width: 100%"/>
          </el-form-item>
          <el-form-item :label="$t('labels.dfilemanage.upload_file')" prop="file_uuid" class="file_uuid">
            <el-upload
              ref="upload"
              v-model="filed.file_uuid"
              :action="uploadUrl"
              :multiple="false"
              :limit="1"
              :on-success="fileupSuccess"
              :on-remove="fileupRemove"
              :on-progress="fileUpProgress"
              :on-error="fileUpError"
              :headers="{ 'Authorization': token }"
              :accept="`.${dialogStatus}`"
              class="upload-demo">
              <el-button v-if="btnIsShow" slot="trigger" type="text">{{ $t('buttons.dfilemanage.selectFile') }}</el-button>
              <br>
              <span v-if="dialogStatus === 'csv'" slot="tip" class="el-upload__tip">{{ $t('strings.dfilemanage.fileupload_csv') }}</span>
              <span v-else slot="tip" class="el-upload__tip">{{ $t('strings.dfilemanage.fileupload_wav') }}</span>
            </el-upload>
          </el-form-item>
          <!-- <el-form-item v-if="dialogStatus !=='wav'" :label="$t('labels.dfilemanage.table_structor')" class="schema_guid" prop="schema_guid" label-width="80px">
            <el-select v-model="filed.schema_guid" :placeholder="$t('labels.choose')" class="new-input" @change="choseStructure(filed)">
              <el-option
                v-for="(item, index) in tempMetaData"
                :key="index"
                :label="item.name"
                :value="item.guid"/>
            </el-select>
          </el-form-item> -->
          <el-form-item :label="$t('strings.dfilemanage.is_private')" prop="private">
            <el-radio-group v-model="filed.private" @change="toValidateForm">
              <el-radio :label="false" >{{ $t('strings.no') }}</el-radio>
              <el-radio :label="true" >{{ $t('strings.yes') }}</el-radio>
            </el-radio-group>
            <br>
            <span style="font-size: 12px;">{{ $t('strings.dfilemanage.private_desc') }}</span>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer" style="margin-top:-20px;">
          <el-button v-if="confirmBtnShow" type="primary" @click="updateData">{{ btnMap[filed.type] }}</el-button>
        </div>
      </template>

      <template v-else>
        <PreviewTable :fileup-end-data="fileupEndData" :table-header="tableHeader" />
      </template>
    </el-dialog>
    <!-- hive表的添加 -->
    <el-dialog
      v-loading="hiveLoading"
      :visible.sync="dialogHiveVisible"
      :close-on-click-modal="false"
      :title="$t('strings.dfilemanage.Hive')"
      class="addDialog"
      @open="clearField">
      <el-form ref="hiveForm" :model="hiveFile" :rules="rules" label-position="left">
        <el-form-item :label="$t('strings.dfilemanage.hive')" label-width="80px" prop="name">
          <el-input v-model="hiveFile.name" class="new-input" auto-complete="off"/>
        </el-form-item>
        <el-form-item :label="$t('strings.dfilemanage.desc')" prop="description" label-width="80px" class="description">
          <el-input :autosize="{ minRows: 2, maxRows: 4}" v-model="hiveFile.description" type="textarea" placeholder="Please input" class="new-input" style="width: 100%"/>
        </el-form-item>
        <el-form-item :label="$t('strings.dfilemanage.database_name')" prop="database_name" label-width="80px">
          <el-select v-model="hiveFile.database_name" :placeholder="$t('strings.select')" class="new-input" @change="choseData(hiveFile.database_name)">
            <el-option
              v-for="(item, index) in dbSelect"
              :key="index"
              :label="item.name"
              :value="item.name"/>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('strings.dfilemanage.datatable_name')" prop="table_name" label-width="80px">
          <el-select v-model="hiveFile.table_name" :loading="hiveLoading" :placeholder="$t('strings.select')" class="new-input" @change="choseDataFile(hiveFile.table_name)">
            <el-option
              v-for="(item, index) in tableSelect"
              :key="index"
              :label="item.name"
              :value="item.name"/>
          </el-select>
        </el-form-item>
        <!-- <el-form-item :label="$t('strings.dfilemanage.table_structor')" prop="schema_guid" label-width="80px" class="schema_guid">
          <el-select v-model="hiveFile.schema_guid" :disabled="structorState === false" :placeholder="$t('strings.select')" class="new-input" @change="choseStructure(hiveFile)">
            <el-option
              v-for="(item, index) in tempMetaData"
              :key="index"
              :label="item.name"
              :value="item.guid"/>
          </el-select>
        </el-form-item> -->
        <el-form-item :label="$t('strings.dfilemanage.is_private')" label-width="80px" prop="private">
          <el-radio-group v-model="hiveFile.private" @change="toValidateForm">
            <el-radio :label="false" >{{ $t('strings.no') }}</el-radio>
            <el-radio :label="true" >{{ $t('strings.yes') }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button class="cancel" @click="dialogHiveVisible = false">{{ $t('buttons.cancel') }}</el-button>
        <el-button :disabled="nextBtnStatus || hiveLoading" type="primary" @click="hivePut">下一步</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { addDataList, remoteCsvFile, getDataFile, getOneSchema, dataList, getDataBase, nameIsUsed } from '@/api/datamining/historydata'
import { getToken, setNewTokenWithExpire } from '@/utils/auth'
import { getTokenNew } from '@/api/system/login'
// 以上是新的部分
import PreviewTable from '@/components/Table/PreviewTable'
import waves from '@/directive/waves' // 水波纹指令
import XLSX from 'xlsx'
import rules from '@/utils/rules'
import { validateZName } from '@/utils/validate'
export default {
  directives: {
    waves
  },
  components: { PreviewTable },
  props: {
    dataOrg: {
      type: String,
      default: '0'
    },
    hiveShow: {
      type: String,
      default: ''
    }
  },
  data() {
    // const validateStructor = (rule, value, callback) => {
    //   if (value === '') {
    //     callback()
    //     return
    //   }
    //   this.validatePromise.then(val => {
    //     if (this.schemaStr1 !== this.schemaStr2) {
    //       callback(new Error(this.$t('messages.dfilemanage.table_structor_error')))
    //     } else {
    //       this.tempObj.schema = this.tempArr
    //       callback()
    //     }
    //   })
    // }
    const validateName = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入'))
      } else if (!validateZName(value)) {
        callback(new Error(this.$t('rules.invalid_name')))
      } else {
        const temp = {}
        temp.name = value
        if (this.dialogStatus) {
          temp.type = this.dialogStatus
          temp.private = this.filed.private
        } else {
          temp.type = 'hive'
          temp.private = this.hiveFile.private
        }
        nameIsUsed(temp).then(res => {
          callback()
        }).catch(e => {
          callback(new Error(e.message))
        })
      }
    }
    return {
      window: window,
      uploadUrl: '',
      token: '',
      dialogTableVisible: false,
      dialogFormVisible: false,
      shiDialogFormVisible: false,
      dialogStatus: '',
      tableHeader: null,
      fileupNext: true,
      fileupEndData: null,
      filed: {
        name: '', // 文件名
        description: '', // 描述
        private: true,
        type: '',
        file_uuid: '',
        // schema_guid: '',
        schema: ''
      },
      hiveFile: {
        name: '', // 文件名
        description: '', // 描述
        private: false,
        type: 'hive',
        database_name: '',
        table_name: '',
        // schema_guid: '',
        schema: ''
      },
      dialogHiveVisible: false,
      dbSelect: [],
      tableSelect: [],
      hiveLoading: false,
      active: 0,
      rules: {
        name: [{ required: true, trigger: 'blur', validator: validateName }],
        // csv_file: [{ required: true, trigger: 'change', validator: validatefile }],
        file_uuid: [{ required: true, trigger: 'change', message: this.$t('messages.dfilemanage.chooseFile') }],
        // schema_guid: [{ required: false, trigger: 'change', validator: validateStructor }],
        isheader: rules.isheader,
        encoding: rules.encoding,
        private: rules.isprivate,
        // name: [{ required: true, trigger: 'blur', validator: validateFilezname }],
        type: [{ required: true, trigger: 'blur', message: this.$t('messages.dfilemanage.input_name') }],
        database_name: [{ required: true, trigger: 'change', message: this.$t('messages.dfilemanage.choose_database') }],
        table_name: [{ required: true, trigger: 'change', message: this.$t('messages.dfilemanage.choose_table_name') }]
      },
      textMap: {
        csv: this.$t('strings.dfilemanage.fileCsv'),
        preview: this.$t('labels.dfilemanage.data_preview'),
        wav: this.$t('strings.dfilemanage.wav')
      },
      btnMap: {
        csv: '下一步',
        wav: '确定'
      },
      loading: false,
      btnIsShow: true,
      dialogTypes: '',
      uploadStatus: false,
      baseURL: '',
      // 表结构数据
      // tempMetaData: [],
      // 选择的数据的类型字符串
      schemaStr1: '', // 表名的schema字段类型的字符串
      schemaStr2: '', // 表结构的schema字段类型的字符串
      tempArr: [], // 用来存储临时筛选出的那个schema
      typeObj: {},
      structorState: false,
      validatePromise: null,
      confirmBtnShow: true,
      // 用来记录文件上传成功后返回的数据
      uploadRecord: {},
      // hive数据没获取成功之前，不可进行下一步
      nextBtnStatus: false
    }
  },
  created() {
    this.dataOfHive()
    if (process.env.NODE_ENV === 'package') {
      this.baseURL = window.serverConfig.baseURL
    } else {
      this.baseURL = process.env.BASE_API
    }
    this.uploadUrl = `${this.baseURL}/datasets/files/`
    // this.getTheDataOfOrigin()
  },
  methods: {
    // 上传文件的移除
    removeUploadFile() {
      this.$refs.upload.clearFiles()
    },
    // 公有私有切换时，名称验证
    toValidateForm() {
      if (this.dialogStatus) {
        this.$refs['dataForm'].validate()
      } else {
        this.$refs['hiveForm'].validate()
      }
    },
    updateData() {
      /**
       * 上传操作
       */
      this.$refs['dataForm'].validate(valid => {
        // 验证规则
        if (valid) {
          this.uploadStatus = false
          if (this.filed.type === 'csv') {
            this.dialogTableVisible = false
            this.$emit('loadFunc', true)
            this.btnIsShow = true
            this.$emit('getFieldsData', this.uploadRecord, this.filed)
            return
          }
          // 组织数据
          const da = {}
          for (const key in this.filed) {
            if (this.filed[key] || this.filed[key] === false) {
              da[key] = this.filed[key]
            }
          }
          // 上传
          this.$emit('loadFunc', true)
          addDataList(da).then(v => {
            this.dialogTableVisible = false
            this.$emit('loadFunc', false)
            this.$refs['dataForm'].resetFields()
            this.btnIsShow = true
            //
            this.$refs.upload.clearFiles()
            this.$message({
              type: 'success',
              message: this.$t('messages.add_success'),
              duration: 1000
            })
            this.$emit('refreshData')
          }).catch(e => {
            this.$emit('loadFunc', false)
            this.btnIsShow = true
            this.loading = false
            this.$message.error(e.message)
          })
        }
      })
    },
    fixData(data) {
      let o = ''
      let l = 0
      const w = 10240
      for (; l < data.byteLength / w; ++l) o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w, l * w + w)))
      o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)))
      return o
    },
    getHeaderRow(sheet) {
      const headers = []
      const range = XLSX.utils.decode_range(sheet['!ref'])
      let C
      const R = range.s.r
      /* start in the first row */
      for (C = range.s.c; C <= range.e.c; ++C) { /* walk every column in the range */
        const cell = sheet[XLSX.utils.encode_cell({ c: C, r: R })]
        /* find the cell in the first row */
        let hdr = `${C}` // <-- replace with your desired default
        if (cell && cell.t) hdr = XLSX.utils.format_cell(cell)
        headers.push(hdr)
      }
      return headers
    },
    // fileupPreview(data) {
    //   console.log(data)
    //   this.filed.uuid = data.response.uuid
    //   this.btnIsShow = false
    //   this.uploadStatus = true
    // },
    // 上传之前的
    async beforeUpload() {
      await this.freshTokenFunc()
      this.token = getToken('a_t')
      // this.$nextTick(() => {
      //   this.$refs['dataForm'].resetFields()
      //   this.$refs.upload.clearFiles()
      // })
    },
    // csv文件的操作
    // 文件移除
    fileupRemove(data) {
      this.btnIsShow = true
      remoteCsvFile(this.filed.file_uuid)
      this.uploadStatus = false
      this.filed.file_uuid = null
    },
    // 文件上传成功
    fileupSuccess(data) {
      this.uploadRecord = data
      this.schemaStr1 = ''
      this.filed.file_uuid = data.uuid
      this.uploadStatus = true
      if (this.dialogStatus === 'wav') {
        this.confirmBtnShow = true
        return
      }
      this.filed.schema = data.schema
      data.schema.forEach(item => {
        this.schemaStr1 += item.type
      })
      this.confirmBtnShow = true
    },
    // 文件上传失败
    fileUpError() {
      this.$message.error(this.$t('messages.dfilemanage.upload_file_faild'))
      this.confirmBtnShow = true
    },
    // 文件上传时的钩子
    fileUpProgress(event, file, fileList) {
      // console.log(event, file, fileList)
      // file.size可以拿到byte的文件大小
      this.confirmBtnShow = false
    },
    //
    // 下一步
    next() {
      const data = { is_private: this.dataOrg }
      dataList(data).then(res => {
        // this.$emit('returnData', { 'listHis': res.data.data, 'listShi': null, type: 'f' })
      })
    },
    // 上传和数据链接操作分发
    uploadCommand(type) {
      if (type === 'upservice') {
        this.notRun()
      } else if (type === 'Hive') {
        this.dialogHiveVisible = true
      } else if (type === 'wav') {
        this.filed.type = 'wav'
        this.dialogTableVisible = true
        this.dialogStatus = type
      } else {
        this.filed.type = 'csv'
        this.dialogTypes = type
        this.dialogTableVisible = true
        this.dialogStatus = type
        this.active = 0
        this.$nextTick(() => {
          this.$refs['dataForm'].resetFields()
          this.$refs.upload.clearFiles()
        })
      }
    },
    // 数据搜索时筛选出数据表的数据
    choseData(val) {
      // this.hiveLoading = true
      this.hiveFile.table_name = ''
      this.hiveFile.schema_guid = ''
      this.tableSelect = []
      getDataFile(val).then(res => {
        // this.hiveLoading = false
        this.tableSelect = res.data
      }).catch(() => {
        // this.hiveLoading = false
        this.$message.error(this.$t('strings.dfilemanage.get_table_name_faild'))
      })
    },
    // 数据表的内容改变时，提取出schemas
    choseDataFile(val) {
      this.nextBtnStatus = true
      this.structorState = false
      this.hiveFile.schema_guid = ''
      this.schemaStr1 = ''
      let tempObj = []
      let previewData = {}
      if (!val) return
      getOneSchema({ database_name: this.hiveFile.database_name, table_name: this.hiveFile.table_name }).then(res => {
        tempObj = res.data.schema || []
        previewData = res.data.data || {}
        this.hiveFile.schema = tempObj
        this.hiveFile.data = previewData
        tempObj.forEach(item => {
          this.schemaStr1 += item.type
        })
        this.structorState = true
        this.nextBtnStatus = false
      })
    },
    // 表结构选择时内容的提取
    // choseStructure(form) {
    //   this.tempObj = {}
    //   this.tempArr = []
    //   this.schemaStr2 = ''
    //   let objSchema = []
    //   let objTable = []
    //   // 记录下选取的表结构的schema，以及schema的type组成的字符串
    //   objTable = this.tempMetaData.filter(item => item.guid === form.schema_guid)[0]
    //   this.validatePromise = new Promise((resolve, reject) => {
    //     getOneSchema({ database_name: objTable.database_name, table_name: objTable.table_name }).then(res => {
    //       objSchema = res.data.schema || []
    //       this.tempArr = objSchema
    //       objSchema.forEach(item => {
    //         this.schemaStr2 += item.type
    //       })
    //       resolve(this.schemaStr2)
    //     })
    //   })
    //   this.tempObj = form
    // },
    // 提交hive表单
    hivePut() {
      this.$refs['hiveForm'].validate(valid => {
        if (!valid) return
        this.$emit('loadFunc', true)
        this.$emit('getFieldsData', { schema: this.hiveFile.schema, data: this.hiveFile.data }, this.hiveFile)
        this.dialogHiveVisible = false

        // addDataList(this.hiveFile).then(res => {
        //   this.$emit('loadFunc', false)
        //   this.$refs['hiveForm'].resetFields()
        //   this.dialogHiveVisible = false
        //   this.$message({
        //     type: 'success',
        //     message: this.$t('messages.add_success'),
        //     duration: 1000
        //   })
        //   this.$emit('refreshData')
        // }).catch(e => {
        //   // this.$refs['hiveForm'].resetFields()
        //   // this.dialogHiveVisible = false
        //   this.$emit('loadFunc', false)
        //   this.$message.error(e.message)
        // })
      })
    },
    // 清空创建hive表的表单
    clearField() {
      this.structorState = false
      this.tableSelect = []
      this.dialogStatus = ''
      for (const key in this.hiveFile) {
        if (key !== 'private' && key !== 'type') {
          this.hiveFile[key] = ''
        }
      }
      this.$nextTick(() => {
        this.$refs['hiveForm'].resetFields()
      })
    },
    /**
     * 重置表单
     */
    beforeClose() {
      this.confirmBtnShow = true
      this.dialogTableVisible = false
      // 如果文件上传成功了,没点创建,这时要删除
      if (this.uploadStatus) {
        remoteCsvFile(this.filed.file_uuid)
        this.uploadStatus = false
      }
      this.$refs['dataForm'].resetFields()
      if (this.$refs.upload) {
        this.$refs.upload.clearFiles()
      }
    },
    // 暂未开放
    notRun() {
      this.$message.warning(this.$t('messages.not_open'))
    },
    // hive表中数据库的获取
    dataOfHive() {
      getDataBase().then(res => {
        this.dbSelect = res.data
      }).catch(e => {
        this.$message({
          type: 'error',
          message: this.$t('messages.dfilemanage.database_get_faild'),
          duration: 1000
        })
      })
    },
    // 为上传刷新token
    freshTokenFunc() {
      const access_token = getToken('a_t')
      const refresh_token = getToken('f_t')
      if (!refresh_token) {
        this.doLogout()
      } else if (!access_token) {
        // isRefreshingToken = true
        const data = {
          refresh: getToken('f_t')
        }
        return new Promise(resolve => {
          getTokenNew(data).then(res => {
            const access = `Bearer${res.data.data.access}`
            const refresh = res.data.data.refresh
            setNewTokenWithExpire(access, refresh)
            this.$store.commit('SET_TOKEN', access)
            this.$store.commit('SET_FRESH_TOKEN', refresh)
            // isRefreshingToken = false
          }).catch(() => {
            this.doLogout()
          })
        })
      }
    },
    doLogout() {
      this.$store.dispatch('FedLogOut').then(() => {
        this.$store.dispatch('SetName', '')
        this.$store.dispatch('SetStatus', '')
        this.$store.dispatch('changeAction', 'dev_platform')
        localStorage.clear()
        sessionStorage.clear()
        sessionStorage.setItem('islogout', '1')
        location.reload()// In order to re-instantiate the vue-router object to avoid bugs
      })
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
  @import "src/assets/styles/new-base.scss";
  .el-table .cell {
    white-space:nowrap;
    text-overflow:ellipsis;
    overflow:hidden;
  }
  .drop_container {
    display:inline-block;
    margin-left: 20px;
    .filter-item {
      padding-top: 5px;
      .el-button {
        width: 130px;
        height: 36px;
        border-radius: 14px;
        color: #fff;
        background-color: #3d65c9;
        // font-family: sy_regular;
        &:hover {
          background-color: #6484d4;
        }
        &:active {
          background-color: #0f32b5;
        }
        .el-icon-caret-bottom {
          &::before {
            display: none;
          }
          &::after {
            content: '';
              width: 0px;
              height: 0px;
              border-left: 8px solid transparent;
              border-right: 8px solid transparent;
              border-top: 8px solid #fff;
              position: relative;
              top: 9px;
              left: 8px;
          }
        }
      }
    }
    // 添加hive表
    .addDialog {
      /deep/ .el-dialog {
        width: 484px;
        // height: 424px;
        border-radius: 16px;
        padding: 28px 24px 24px 24px;
        .el-dialog__header {
          padding-top: 0;
          padding-left: 16px;
          border-bottom: 1px solid #e6e6e6;
          font-size: 18px;
          color: #4d4d4d;
          // font-family: sy_regular;
        }
        .el-dialog__body {
          margin-top: 24px;
          padding: 0 16px 0 16px;
          .el-form {
            .el-form-item {
              margin-bottom: 16px;
              .el-form-item__content {
                .el-select {
                  margin-top: 0;
                  width: 256px;
                  .el-input {
                    .el-input__inner {
                      height: 32px;
                      width: 256px;
                      border-radius: 4px;
                    }
                    .el-input__suffix {
                      .el-input__suffix-inner {
                        &::after {
                          top: 15px;
                          border-left: 6px solid transparent;
                          border-right: 6px solid transparent;
                          border-top: 6px solid #4d4d4d;
                        }
                      }
                    }
                  }
                }
              }
              .el-form-item__label {
                padding: 0;
              }
            }
            .schema_guid,.description {
              .el-form-item__label {
                padding-left: 10px;
              }
            }
            .file_uuid {
              .el-form-item__content {
                .upload-demo {
                  .el-upload {
                    .el-button {
                      text-align: left;
                      background-color: #fff;
                      color: #409eff;
                    }
                  }
                }
              }
            }
          }
        }
        .el-dialog__footer {
          margin-top: 8px;
          padding-top: 0;
          padding-right: 8px;
          .dialog-footer {
            .el-button {
              width: 80px;
              font-size: 15px;
              color: #fff;
              // font-family: sy_regular;
            }
            .cancel {
              background-color: #e6e6e6;
              color: #4d4d4d;
              &:hover {
                background-color: #efefef;
              }
              &:active {
                background-color: #ccc;
              }
            }
          }
        }
      }
    }
    // .csvDialog {
    //   /deep/ .el-dialog {
    //     height: 480px;
    //   }
    // }
  }
</style>
