<template>
  <div class="drop_container" style="display: inline-block;">
    <el-dropdown class="filter-item" trigger="click" @command="uploadCommand">
      <el-button type="primary">
        {{ $t('strings.metadataManage.add_metadata') }}<i class="el-icon-caret-bottom el-icon--right"/>
      </el-button>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item name="handAdd" class="clearfix" command="handAdd">
          {{ $t('strings.metadataManage.handAdd') }}
        </el-dropdown-item>
        <el-dropdown-item name="uploadfiles" class="clearfix" command="csv">
          {{ $t('strings.metadataManage.addCsv') }}
        </el-dropdown-item>
        <el-dropdown-item name="hiveData" class="clearfix" command="Hive">
          {{ $t('strings.metadataManage.addHive') }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <!-- hive表添加元数据字段 -->
    <el-dialog
      v-loading="loading"
      :visible.sync="dialogHiveVisible"
      :close-on-click-modal="false"
      :title="$t('strings.dfilemanage.Hive')"
      class="el-addDialog"
      @open="handleOpen">
      <el-form ref="hiveForm" :model="hiveFile" :rules="rules" label-position="left">
        <el-form-item :label="$t('strings.dfilemanage.database_name')" prop="database_name" label-width="80px">
          <el-select v-model="hiveFile.database_name" :placeholder="$t('strings.select')" @change="choseData(hiveFile.database_name)">
            <el-option
              v-for="(item, index) in dbSelect"
              :key="index"
              :label="item.name"
              :value="item.name"/>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('strings.dfilemanage.datatable_name')" prop="table_name" label-width="80px">
          <el-select v-model="hiveFile.table_name" :placeholder="$t('strings.select')" @change="getSchema">
            <el-option
              v-for="(item, index) in tableSelect"
              :key="index"
              :label="item.name"
              :value="item.name"/>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button class="cancel" @click="dialogHiveVisible = false">{{ $t('buttons.cancel') }}</el-button>
        <el-button :disabled="hiveNextState" type="primary" @click="toMetadataField">{{ $t('buttons.next') }}</el-button>
      </div>
    </el-dialog>
    <!-- csv文件添加的 -->
    <el-dialog
      v-loading="loading"
      :visible.sync="dialogCsvVisible"
      :close-on-click-modal="false"
      :close-on-press-escape = "false"
      :title="$t('strings.metadataManage.addCsv')"
      class="el-csvAddDialog"
      @open="beforeUpload"
      @close="beforeClose">
      <el-upload
        v-model="file_uuid"
        :action="uploadUrl"
        :multiple="false"
        :limit="1"
        :on-progress="fileUpProgress"
        :on-success="fileUpSuccess"
        :on-remove="fileupRemove"
        :on-error="fileUpError"
        :before-upload="fileUploadBefore"
        :headers="{ 'Authorization': token }"
        accept=".csv"
        class="upload-demo">
        <el-button v-if="isBtnShow" type="text">{{ $t('strings.metadataManage.click_to_upload') }}</el-button>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button class="cancel" @click="dialogCsvVisible = false">{{ $t('buttons.cancel') }}</el-button>
        <el-button :disabled="isNextBtnEnable" type="primary" @click="toMetadataField">{{ $t('buttons.next') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getDataBase, getDataFile, remoteCsvFile, getOneSchema } from '@/api/datamining/historydata'
import { getToken } from '@/utils/auth'
export default {
  name: 'UploadFile',
  props: {
    id: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      uploadUrl: '',
      hiveFile: {
        database_name: '',
        table_name: ''
      },
      dialogHiveVisible: false,
      dialogCsvVisible: false,
      loading: false,
      rules: {
        database_name: [{ required: true, trigger: 'change', message: this.$t('messages.dfilemanage.choose_database') }],
        table_name: [{ required: true, trigger: 'change', message: this.$t('messages.dfilemanage.choose_table_name') }]
      },
      dbSelect: [],
      tableSelect: [],
      isNextBtnEnable: false,
      isBtnShow: true,
      file_uuid: '',
      token: '',
      schema: [],
      uploadType: '',
      hiveNextState: false
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
  },
  methods: {
    // 文件上传之前
    beforeUpload() {
      this.token = getToken('a_t')
    },
    // 窗口关闭之前
    beforeClose() {
      remoteCsvFile(this.file_uuid)
      this.file_uuid = null
    },
    // hive窗口打开时
    handleOpen() {
      this.hiveFile.database_name = ''
      this.hiveFile.table_name = ''
    },
    uploadCommand(type) {
      this.uploadType = type
      if (type === 'Hive') {
        this.dialogHiveVisible = true
      } else if (type === 'handAdd') {
        this.$router.push({ name: 'AddField', params: { id: this.id, schema: this.schema, type: '' }})
      } else {
        this.dialogCsvVisible = true
        this.isNextBtnEnable = true
      }
    },
    // hive表上传的时候数据库的获取
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
    // 获取数据表的数据
    choseData(val) {
      this.hiveFile.table_name = ''
      this.tableSelect = []
      getDataFile(val).then(res => {
        this.tableSelect = res.data
      }).catch(() => {
        this.$message.error(this.$t('strings.dfilemanage.get_table_name_faild'))
      })
    },
    // 获取shchemad的数据
    getSchema() {
      this.hiveNextState = true
      getOneSchema(this.hiveFile).then(res => {
        this.schema = res.data.schema
        this.hiveNextState = false
      })
    },
    // 切换到元数据字段管理的页面
    toMetadataField(val) {
      this.isBtnShow = true
      if (this.uploadType === 'csv') {
        remoteCsvFile(this.file_uuid)
      }
      // 这里要传入当前元数据的id
      this.$router.push({ name: 'AddField', params: { id: this.id, schema: this.schema, type: this.uploadType }})
    },
    // 文件上传之前的钩子
    fileUploadBefore() {
      this.isBtnShow = false
    },
    // 文件移除操作
    fileupRemove(data) {
      this.btnIsShow = true
      remoteCsvFile(this.file_uuid)
      this.file_uuid = null
    },
    // 文件上传过程中的钩子
    fileUpProgress(event, file, fileList) {},
    // 文件上传成功
    fileUpSuccess(data) {
      this.file_uuid = data.uuid
      this.isNextBtnEnable = false
      this.schema = data.schema
    },
    // 文件上传失败
    fileUpError() {
      this.btnIsShow = true
      this.isNextBtnEnable = false
      this.$message.error(this.$t('messages.upload_failed'))
    }
  }
}

</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.drop_container {
  margin-left: 11px;
  .filter-item {
    .el-button {
      width: 116px;
    }
  }
  .el-csvAddDialog {
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
        padding: 10px 20px 20px 20px;
        .upload-demo {
          margin-left: 40px;
        }
      }
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
        .el-form {
          .el-form-item {
            .el-form-item__content {
              .el-select {
                margin-top: 0;
                .el-input {
                  width: 222px;
                  position: relative;
                  .el-input__inner {
                    width: 222px;
                    border-radius: 8px;
                  }
                  .el-input__suffix {
                    right: 10px;
                    .el-input__suffix-inner {
                      &::after {
                        top: 16px;
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
  }
}
</style>
