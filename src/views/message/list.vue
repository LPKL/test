<template>
  <div class="app-container">
    <el-container>
      <el-main style="padding: 0">
        <el-button type="primary" size="small" icon="el-icon-plus" style="margin-bottom: 30px" @click="dialogFormVisible = true">{{ $t('buttons.add') + $t('labels.messagemanage.message') }}</el-button>
        <comp-managetable
          :data-list="datalist"
          :list-loading="listLoading"
          :ptotal="totalCount"
          @chenge = "changeData"
          @manageTablePage="getManageTablePage"/>
      </el-main>
    </el-container>
    <!-- 创建消息 -->
    <el-dialog :close-on-click-modal="false" :visible.sync="dialogFormVisible" :title="$t('buttons.add') + $t('labels.messagemanage.message')" width="400px">
      <el-form ref="ruleForm" :model="messageForm" :rules="rules" status-icon label-width="80px" class="ruleForm">
        <el-form-item :label="$t('labels.messagemanage.title')" prop="title" >
          <el-input v-model="messageForm.title"/>
        </el-form-item>
        <el-form-item :label="$t('labels.messagemanage.distribute')" prop="users">
          <el-select v-model="messageForm.users" :placeholder="$t('strings.select')" style="width: 100%">
            <el-option :label="$t('labels.messagemanage.system_users')" value="1"/>
            <el-option :label="$t('labels.messagemanage.company_users')" value="2"/>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('labels.messagemanage.content')" prop="content">
          <el-input v-model="messageForm.content" type="textarea" rows="5" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{ $t('buttons.cancel') }}</el-button>
        <el-button type="primary" @click="createData">{{ $t('buttons.create') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// 向服务器端请求的API
import { getAuthInfos, getAuthInfosCount } from '@/api/message'
import ManageTable from './components/ManageTable'
import { authInfos } from '@/api/message'
export default {
  name: 'AllMessage',
  components: {
    'comp-managetable': ManageTable
  },
  data() {
    const validateTitle = (rule, value, callbacks) => {
      if (!value) {
        callbacks(new Error(this.$t('rules.required')))
      } else {
        callbacks()
      }
    }
    const validateContent = (rule, value, callbacks) => {
      if (!value) {
        callbacks(new Error(this.$t('rules.required')))
      } else {
        callbacks()
      }
    }
    return {
      sTitle: '',
      sInfo: '',
      sGroup: '1', // 企业用户获得所有系统和企业消息
      datalist: null,
      // hud
      listLoading: true,
      page: 1,
      totalCount: 0,
      dialogFormVisible: false,
      messageForm: {
        title: '',
        users: '1',
        content: ''
      },
      rules: {
        title: [{ validator: validateTitle, trigger: 'blur', required: true }],
        content: [{ validator: validateContent, trigger: 'blur', required: true }]
      }
    }
  },
  created() {
    // 加载界面后向服务器请求获取所有故障列表
    this.authInfosData(this.page, this.sTitle, this.sInfo, this.sGroup)
  },
  updated() {
    console.log('messagemanagement index update')
  },
  methods: {
    authInfosData(PageNum, Title, Informantion, Group) {
      getAuthInfos({
        'page': PageNum,
        'title': Title,
        'informantion': Informantion,
        'to_group': Group }).then(res => {
        const data = res.data.data
        this.datalist = data
        this.listLoading = false
      }).catch(error => {
        console.log(error)
        this.listLoading = false
      })
      getAuthInfosCount({
        'page': PageNum,
        'title': Title,
        'informantion': Informantion,
        'to_group': Group
      }).then(res => {
        const data = res.data.data
        this.totalCount = Number(data)
      }).catch(error => {
        console.log(error)
      })
    },
    getManageTablePage: function(pagen) {
      console.log('getManageTablePage', pagen)
      this.page = pagen
      this.authInfosData(this.page, this.sTitle, this.sInfo, this.sGroup)
    },
    changeData(msg) {
      this.authInfosData(this.page, this.sTitle, this.sInfo, this.sGroup)
    },
    // 创建消息
    createData() {
      this.$refs['ruleForm'].validate((valid) => {
        if (valid) {
          authInfos({
            title: this.messageForm.title,
            information: this.messageForm.content,
            to_group: this.messageForm.users
          }).then(res => {
            console.log(res)
            this.dialogFormVisible = false
            this.messageForm.title = ''
            this.messageForm.content = ''
            this.messageForm.users = '1'
            this.$refs['ruleForm'].resetFields()
            this.$message({
              message: this.$t('messages.publish_success'),
              type: 'success',
              duration: 1000
            })
            this.authInfosData(this.page, this.sTitle, this.sInfo, this.sGroup)
          }).catch(() => {
            this.$message({
              message: this.$t('messages.publish_failed'),
              type: 'error',
              duration: 1000
            })
          })
        }
      })
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
</style>

