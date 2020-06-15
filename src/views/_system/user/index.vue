<template>
  <div v-loading="listLoading" :element-loading-text="this.$t('labels.loading')" class="app_container">
    <!--查询  -->
    <div class="filter_header">
      <div class="filter-container">
        <el-input v-model="tableQuery.nick" :placeholder="$t('messages.name_message')" suffix-icon="el-icon-search" class="el-fault_device" @change="searchUser(1, tableQuery.nick)"/>
        <div class="el-search-reset">
          <!-- <el-button type="primary" @click="searchUser(1, tableQuery.nick)">{{ $t('buttons.search') }}</el-button> -->
          <el-button type="primary" class="addUserBtn" @click="handleCreate">{{ textMap.create }}</el-button>
        </div>
      </div>
    </div>
    <!--列表-->
    <el-main class="main_container">
      <el-table
        :data="tableData"
        fit
        highlight-current-row
        style="width: 100%;height:616px;overflow-y: auto;">
        <el-table-column :label="$t('labels.id')" prop="userid" width="60" >
          <template slot-scope="scope">
            <span>{{ (tablePage.current - 1)*10 + scope.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.username')" show-overflow-tooltip prop="username">
          <template slot-scope="scope">
            <span v-text="scope.row.username"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.user.name')" show-overflow-tooltip>
          <template slot-scope="scope">
            <span v-text="scope.row.name"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.user.email')" show-overflow-tooltip prop="email">
          <template slot-scope="scope">
            <span v-text="scope.row.email"/>
          </template>
        </el-table-column>
        <!-- <el-table-column :label="$t('labels.user.belong_group')" prop="group_zname" align="center">
          <template slot-scope="scope">
            <span v-text="scope.row.attributes.group_zname"/>
          </template>
        </el-table-column> -->
        <el-table-column :label="$t('labels.create_time')" prop="join-time" >
          <template slot-scope="scope">
            <span v-text="scope.row.date_joined"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.user.last_login')" prop="last-login">
          <template slot-scope="scope">
            <span v-text="scope.row.last_login"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.actions')" width="250">
          <template slot-scope="scope">
            <el-button @click="handleEdit(scope.row)">{{ $t('buttons.edit') }}</el-button>
            <el-button class="resetPsd" @click="handleReset(scope.row)">{{ $t('buttons.resetPad') }}</el-button>
            <el-button v-if="Number(self_id)!==Number(scope.row.id)" @click="handleDelete(scope.row)">{{ $t('buttons.delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--分页-->
      <div class="pagination-container">
        <el-pagination
          :current-page="tablePage.current"
          :page-size="10"
          :total="tablePage.total"
          layout="total, prev, pager, next, jumper"
          @current-change="handleCurrentChange"/>
      </div>
    </el-main>
    <!--弹出窗口：新增/编辑用户-->
    <el-dialog :visible.sync="dialogFormVisible" :close-on-click-modal="false" :title="textMap[mapStatus]" width="449px" class="new-dialog">
      <el-form ref="ruleForm2" :model="userForm" :rules="rules" label-width="80px" class="ruleForm">
        <el-form-item :label="$t('labels.username')" prop="username">
          <el-input v-model="userForm.username" :disabled="editStatus" auto-complete="off" class="new-input"/>
        </el-form-item>
        <el-form-item :label="$t('labels.user.name')" prop="name">
          <el-input v-model="userForm.name" :disabled="editStatus" auto-complete="off" class="new-input"/>
        </el-form-item>
        <el-form-item v-if="!editStatus" :label="$t('labels.password')" prop="password" >
          <el-input v-model="userForm.password" auto-complete="off" class="new-input"/>
        </el-form-item>
        <el-form-item :label="$t('labels.user.email')" prop="email">
          <el-input v-model="userForm.email" auto-complete="off" class="new-input"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{ $t('buttons.cancel') }}</el-button>
        <el-button v-if="!editStatus" type="primary" @click="createData">{{ $t('buttons.confirm') }}</el-button>
        <el-button v-else type="primary" @click="editUser">{{ $t('buttons.confirm') }}</el-button>
        <!-- <el-button v-else type="primary" @click="updateData">{{ $t('table.confirm') }}</el-button> -->
      </div>
    </el-dialog>
    <!-- 修改密码 -->
    <el-dialog :title="$t('buttons.resetPad')" :close-on-click-modal="false" :visible.sync="resetFormVisible" width="449px" class="new-dialog">
      <el-form ref="resetForm" :model="psdForm" :rules="rules" status-icon label-width="80px">
        <el-form-item :label="$t('labels.password')" prop="password">
          <el-input v-model="psdForm.password" type="password" show-password auto-complete="new-password" class="new-input"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetFormVisible = false">{{ $t('buttons.cancel') }}</el-button>
        <el-button type="primary" @click="resetPut">{{ $t('buttons.confirm') }}</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>

import { queryUser, addUser, deleteUser, searchUserMessage, updateUser, resetUserPsd } from '@/api/system/user'
import { parseTime } from '@/utils'
import { confirm } from '@/utils/constants'
// import { checkUsername, checkEmail, checkPassword, checkUserByAPI, checkEmailbyAPI, validatePassword, checkEmail } from '@/utils/rules'
// import { validatePassword, checkEmail } from '@/utils/rules'
import { validatePassword } from '@/utils/rules'
// 表单的验证
import { validateLowerAlphanum, validateOnlyZName } from '@/utils/validate'

export default {
  name: 'UserManage',
  data() {
    const checkUserName = (rule, value, callback) => {
      if (!value) {
        callback(new Error(this.$t('rules.require_username')))
      } else if (!validateLowerAlphanum(value)) {
        callback(new Error(this.$t('rules.username')))
      } else {
        callback()
      }
    }
    const checkUserEName = (rule, value, callback) => {
      if (!value) {
        callback(new Error(this.$t('rules.require_userEName')))
      } else if (!validateOnlyZName(value)) {
        callback(new Error(this.$t('rules.userEname')))
      } else {
        callback()
      }
    }
    return {
      self_id: '',
      group_id: '',
      defaultemail: '',
      defaultname: '',
      id: '',
      idx: '', // 当前修改的列下标
      count: 120,
      status: false,
      timer: null,
      userForm: {
        username: '',
        name: '',
        password: '',
        email: ''
      },
      // groupModel: {
      //   auth_group: null
      // },
      // 用户详情
      // curRow: {
      //   date_joined: '',
      //   email: '',
      //   group_zname: '',
      //   last_login: '',
      //   password: '',
      //   random_code: '',
      //   username: ''
      // },
      rules: {
        username: [
          { validator: checkUserName, trigger: 'blur', required: true }
          // { validator: checkUserByAPI, trigger: 'blur', required: true }
        ],
        name: [
          { validator: checkUserEName, trigger: 'blur', required: true }
        ],
        password: [
          { validator: validatePassword, trigger: 'blur', required: true }
        ]
        // email: [
        //   { validator: checkEmail, trigger: 'blur', required: false }
        //   // { validator: checkEmailbyAPI, trigger: 'blur', required: true }
        // ]
        // checkPass: [
        //   { validator: checkPassword_sec, trigger: 'blur', required: true }
        // ],
        // group: [
        //   { message: this.$t('rules.required_select'), trigger: 'change', required: true }
        // ]
      },
      // groupRules: {
      //   auth_group: [{ required: true, message: this.$t('rules.required_select'), trigger: 'change' }]
      // },
      // groups: [],
      parseTime: parseTime,
      listLoading: false,
      tableData: [],
      tableQuery: {
        nick: null
      },
      textMap: {
        create: this.$t('buttons.add') + this.$t('labels.user.user'),
        update: this.$t('buttons.edit') + this.$t('labels.user.user')
      },
      mapStatus: '',
      tablePage: {
        current: 1,
        pages: 1,
        size: null,
        total: 0,
        pageLength: null
      },
      dialogFormVisible: false,
      editRolesDialogVisible: false,
      detailDialog: false,
      checkAll: false,
      isIndeterminate: true,
      // 所有群组(管理员除外)
      roleOptions: [],
      roleMap: new Map(),
      searchUserList: [],
      //
      editStatus: false,
      // 重置密码
      psdForm: {
        password: ''
      },
      resetFormVisible: false,
      searchStatus: false,
      searchRecord: ''
    }
  },
  created() {
    this.initData()
    // this.group_id = this.$store.state.user.group_id
    this.self_id = this.$store.state.user.id
  },

  methods: {
    initData() {
      // 所有群组选项
      // queryRole().then(res => {
      //   this.groups = res.data.data
      // })
      this.fetchData(1)
    },
    // hasAdminRole(row) {
    //   if (row && row.roleList) {
    //     return row.roleList.some(role => role.rval === root.rval)
    //   }
    //   return false
    // },
    // 查询
    fetchData(p) {
      this.tableLoading = true
      this.searchStatus = false
      const page = p || 1
      this.tablePage.current = page
      const str = '?page=' + page
      queryUser(str).then(res => {
        this.tableData = res.data.results
        this.tablePage.pageLength = this.tableData.length
        this.tablePage.total = res.data.count
        this.tableLoading = false
      }).catch((error) => {
        console.log(error)
      })
    },
    // 详情信息
    // handleDetail(idx, row) {
    //   this.detailDialog = true
    //   this.id = idx
    //   this.curRow = row.attributes
    // },
    // 更新用户的群组
    // handleUpdateUserRoles(idx, row) {
    //   // 显示用户的群组
    //   this.idx = idx
    //   this.id = row.id
    //   this.groupModel.auth_group = row.relationships.auth_group.data.id
    //   // 显示弹窗
    //   this.editRolesDialogVisible = true
    // },
    // checkUpdateUserRolesData() {
    //   updateUserRoles(this.id, this.groupModel).then(res => {
    //     const data = res.data.data
    //     this.tableData[this.idx].attributes.group_zname = data.attributes.group_zname
    //     this.editRolesDialogVisible = false
    //     this.$message.success(this.$t('messages.update_success'))
    //   })
    // },
    // 删除
    handleDelete(row) {
      this.$confirm(this.$t('strings.user.delete_user'), this.$t('labels.reminder'), confirm).then(() => {
        if (this.tablePage.current === 1) {
          this.deleteFunc(row, this.tablePage.current)
        } else {
          if (this.tablePage.pageLength > 1) {
            this.deleteFunc(row, this.tablePage.current)
          } else {
            this.deleteFunc(row, this.tablePage.current - 1)
            this.tablePage.current = this.tablePage.current - 1
          }
        }
      }).catch(() => {
        this.$message({
          message: this.$t('messages.cancel_operate'),
          type: 'info',
          duration: 1000
        })
      })
    },
    // 删除数据的函数
    deleteFunc(row, pageNum) {
      deleteUser(row.id).then(res => {
        this.dialogFormVisible = false
        this.fetchData(pageNum)
        this.$message.success(this.$t('messages.delete_success'))
      }).catch((e) => {
        console.log(e)
        this.$message.error(this.$t('messages.delete_failed'))
      })
    },
    // 新增
    handleCreate() {
      this.dialogFormVisible = true
      this.mapStatus = 'create'
      this.editStatus = false
      this.userForm.username = ''
      this.userForm.name = ''
      this.userForm.password = ''
      this.userForm.email = ''
      // 清空错误提示
      this.$nextTick(() => {
        this.$refs['ruleForm2'].clearValidate()
      })
    },
    createData() {
      this.$refs['ruleForm2'].validate((valid) => {
        if (!valid) return
        addUser(this.userForm).then((res) => {
          this.fetchData(this.tablePage.current)
          this.dialogFormVisible = false
          this.$message.success(this.$t('messages.create_success'))
        }).catch(e => {
          this.$message.error(e.message)
        })
      })
    },
    // 编辑用户
    handleEdit(row) {
      this.dialogFormVisible = true
      this.mapStatus = 'update'
      this.editStatus = true
      this.id = row.id
      this.userForm.username = row.username
      this.userForm.name = row.name
      this.userForm.email = row.email
      this.$nextTick(() => {
        this.$refs['ruleForm2'].clearValidate()
      })
    },
    editUser() {
      this.$refs['ruleForm2'].validate((valid) => {
        if (!valid) return
        updateUser(this.id, this.userForm).then(res => {
          this.dialogFormVisible = false
          this.fetchData(this.tablePage.current)
          this.$message.success(this.$t('messages.update_success'))
        }).catch(e => {
          console.log(e)
          this.$message.error(this.$t('messages.update_failed'))
        })
      })
    },
    // 重置密码
    handleReset(row) {
      this.resetFormVisible = true
      this.psdForm.password = ''
      this.id = row.id
      this.$nextTick(() => {
        this.$refs['resetForm'].clearValidate()
      })
    },
    resetPut() {
      this.$refs['resetForm'].validate((valid) => {
        if (!valid) return
        resetUserPsd(this.id, this.psdForm).then(res => {
          this.fetchData(this.tablePage.current)
          this.resetFormVisible = false
          this.$message.success(this.$t('messages.changepsd_success'))
        }).catch(e => {
          console.log(e)
          this.$message.error(this.$t('messages.changepsd_faild'))
        })
      })
    },
    // 搜索用户
    searchUser(page, data) {
      this.searchStatus = true
      this.searchRecord = data || this.searchRecord
      // 避免不传时的undefined
      if (data === '') {
        this.fetchData(page)
        return
      }
      let str = ''
      str = '?q=' + this.searchRecord + '&page=' + page
      this.tableLoading = true
      searchUserMessage(str).then(res => {
        this.tableLoading = false
        this.tableData = res.data.results
        this.tablePage.total = res.data.count
        this.tablePage.current = page
      }).catch((error) => {
        console.log(error)
      })
    },
    // 分页
    handleCurrentChange(val) {
      this.tablePage.current = val
      if (this.searchStatus) {
        this.searchUser(val)
      } else {
        this.fetchData(val)
      }
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>

@import "src/assets/styles/new-base.scss";
.role-checkbox{
  margin-left: 0px;
  margin-right: 15px;
}
.show-password{
  cursor: pointer;
}
.dialogDetail{
  padding-left: 30px;
  label {
    display: inline-block;
    width: 80px;
    text-align: right;
    margin-right: 15px;
  }
}
</style>
