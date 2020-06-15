<template>
  <div class="app-container">
    <!--查询-->
    <el-row>
      <el-input v-model="tableQuery.group_zname" :placeholder="$t('labels.group.group_name')" style="width:200px;"/>
      <span style="margin-right: 15px;"/>
      <el-tooltip :content="$t('buttons.search')" class="item" placement="top">
        <el-button v-is-show="{name:'selectgroup'}" icon="el-icon-search" circle @click="searchGroup(tableQuery.group_zname)"/>
      </el-tooltip>
    </el-row>
    <div style="margin-bottom: 30px;"/>
    <el-button v-is-show="{name:'addgroup'}" type="primary" icon="el-icon-plus" size="mini" @click="handleCreate">{{ textMap.create }}</el-button>
    <!--列表-->
    <div class="tableBox">
      <el-table
        v-loading.body="tableLoading"
        :data="tableData"
        height="600"
        style="width: 100%;"
        element-loading-text="Loading"
        border
        fit
        highlight-current-row>
        <el-table-column :label="$t('labels.id')" width="50%" align="center">
          <template slot-scope="scope">
            <span v-text="scope.row.id"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.name')" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.attributes.group_zname }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.name_en')" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.attributes.group_name }}</span>
          </template>
        </el-table-column>

        <el-table-column :label="$t('labels.parent_name')" width="100%" align="center">
          <template slot-scope="scope">
            <span >{{ scope.row.attributes.parent_id }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.group.group_level')" align="center">
          <template slot-scope="scope">
            <span v-if="scope.row.attributes.parent_id===-1">无</span>
            <span v-else-if="scope.row.attributes.parent_id===0"><el-tag type="success">{{ $t('strings.group.super_group') }}</el-tag></span>
            <span v-else-if="scope.row.attributes.parent_id===2"><el-tag type="info">{{ $t('strings.group.company_group') }}</el-tag></span>
            <span v-else>{{ $t('strings.group.common_group') }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.create_time')" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.attributes.create_time }}</span>
          </template>
        </el-table-column>

        <el-table-column :label="$t('labels.desc')" align="center">
          <template slot-scope="scope">
            <span>{{ $t('strings.no_desc') }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.actions')" align="center">
          <template slot-scope="scope">
            <el-tooltip v-is-show="{name:'groupadduser'}" v-if="scope.row.attributes.parent_id!==0 && scope.row.attributes.parent_id!==-1" :content="$t('strings.group.add_user')" placement="top">
              <el-button size="small" type="info" icon="el-icon-plus" circle plain @click="addUser(scope.$index,scope.row)"/>
            </el-tooltip>
            <el-tooltip v-is-show="{name:'editgroup'}" v-if="scope.row.attributes.parent_id!==0 && scope.row.attributes.parent_id!==-1" :content="$t('buttons.edit')" placement="top">
              <el-button size="small" type="info" icon="el-icon-edit" circle plain @click="handleUpdate(scope.$index,scope.row)"/>
            </el-tooltip>
            <el-tooltip v-is-show="{name:'changeperm'}" v-if="scope.row.attributes.parent_id!==0 && Number(scope.row.id)!==fatherid" :content="$t('strings.group.update_perm')" placement="top">
              <el-button size="small" type="warning" icon="el-icon-view" circle plain @click="changeGroupPerms(scope.$index,scope.row)"/>
            </el-tooltip>
            <el-tooltip v-is-show="{name:'deletegroup'}" v-if="scope.row.attributes.parent_id!==0 && scope.row.attributes.parent_id!==-1 && Number(scope.row.id)!==fatherid" :content="$t('buttons.delete')" placement="top">
              <el-button size="small" type="danger" icon="el-icon-delete" circle plain @click="handleDelete(scope.$index,scope.row)"/>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!--分页-->
    <el-pagination
      :current-page="tablePage.current"
      :page-size="10"
      :total="tablePage.total"
      layout="total, prev, pager, next, jumper"
      @current-change="handleCurrentChange"/>
    <!--弹出窗口：新增编辑群组-->
    <el-dialog :title="textMap[dialogStatus]" :close-on-click-modal="false" :visible.sync="dialogFormVisible" width="449px">
      <el-form ref="dataForm" :rules="rules" :model="temp" status-icon label-width="95px" >
        <el-form-item :label="$t('labels.name')" prop="group_zname" >
          <el-input v-model="temp.group_zname"/>
        </el-form-item>
        <el-form-item :label="$t('labels.name_en')" prop="group_name" >
          <el-input v-model="temp.group_name"/>
        </el-form-item>
        <el-form-item :label="$t('labels.parent_name')" prop="parent_id">
          <el-select v-model="temp.parent_id" :placeholder="$t('strings.select')" filterable style="width: 100%">
            <el-option
              v-for="(item, index) in groups"
              :key="index"
              :label="item.attributes.group_zname"
              :value="item.id"/>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('labels.desc')" prop="group_desc">
          <el-input :autosize="{ minRows: 2, maxRows: 4}" :placeholder="$t('strings.input')" v-model="temp.group_desc" type="textarea"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{ $t('buttons.cancel') }}</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">{{ $t('buttons.create') }}</el-button>
        <el-button v-else type="primary" @click="updateData">{{ $t('buttons.confirm') }}</el-button>
      </div>
    </el-dialog>
    <!--弹出弹窗：编辑权限-->
    <el-dialog :visible.sync="dialogFormShow" :close-on-click-modal="false" :title="$t('strings.group.perms')" width="408px">
      <el-form ref="groupForm" status-icon label-width="100px" class="ruleForm">
        <el-tree
          ref="permTreeRef"
          :data="allPerms"
          :expand-on-click-node="true"
          show-checkbox
          node-key="id"
          default-expand-all
          @check-change="handleUpdateApiPermForRole">
          <span slot-scope="{ node, data }" class="custom-tree-node">
            <span>
              <span class="mgl-10" >{{ data.attributes.perm_zname }}</span>
            </span>
          </span>
        </el-tree>
      </el-form>
    </el-dialog>
    <!--弹出弹框：添加用户-->
    <el-dialog :visible.sync="addUserFormShow" :close-on-click-modal="false" :title="$t('strings.group.add_user')" width="680px">
      <el-form v-loading="searchLoading" :model="userTemp" :inline="true">
        <el-row :gutter="20" class="space">
          <el-col :span="20"><el-input :placeholder="$t('strings.group.user_placeholder')" v-model="userTemp.random_code" autofocus="true"/></el-col>
          <el-col :span="4"><el-button type="primary" @click="search(userTemp.random_code)">{{ $t('buttons.search') }}</el-button></el-col>
        </el-row>
        <el-table
          v-loading.body="tableLoading"
          :data="userMessage"
          :element-loading-text="$t('strings.loading')"
          style="width: 100%"
          border
          fit
          highlight-current-row>
          <el-table-column :label="$t('labels.user.random_code')" prop="random_code">
            <template slot-scope="scope">
              <span v-text="scope.row.attributes.random_code"/>
            </template>
          </el-table-column>
          <el-table-column :label="$t('labels.username')" prop="username">
            <template slot-scope="scope">
              <span v-text="scope.row.attributes.username"/>
            </template>
          </el-table-column>
          <el-table-column :label="$t('labels.actions')">
            <template slot-scope="scope">
              <el-tooltip :content="$t('buttons.add')" placement="none">
                <!--<el-button v-if="isExist" size="medium" type="success" icon="el-icon-plus" circle plain @click="changeUserGroup(scope.$index, scope.row)"/>-->
                <el-button v-if="isExist" type="primary" @click="changeUserGroup(scope.$index, scope.row)">{{ $t('strings.group.add_user') }}</el-button>
                <el-button v-else type="info">{{ $t('strings.group.has_group') }}</el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { updateRole, deleteRole, addRole, getAllPerms, updateGroupPerms, deleteroleperm, updatePerms, searchRoleMessage, checkName, getselfPerms } from '@/api/system/role'
import { searchUserMessage, updateUserRoles } from '@/api/system/user'
import { parseTime, resetTemp } from '@/utils'
import { validateZName, validateEName } from '@/utils/validate'
import { confirm, root } from '@/utils/constants'
import debounce from 'lodash/debounce'
import { queryRole } from '@/api/system/role'
import _ from 'lodash'
export default {
  name: 'RoleManage',
  data() {
    // 群组名验证
    const testGroupZName = (rule, value, callback) => {
      if (!value) {
        callback(new Error(this.$t('rulse.require_name')))
      } else if (!validateZName(value)) {
        callback(new Error(this.$t('rules.invalid_name')))
        this.temp.group_zname = ''
      } else if (value === this.basezname) {
        callback()
      } else {
        const str = '?group_zname=' + value
        checkName(str).then(res => {
          if (res.data.message) {
            callback(new Error(res.data.message))
            this.temp.group_zname = ''
          } else {
            callback()
          }
        })
      }
    }
    // 群组英文名验证
    const testGroupName = (rule, value, callback) => {
      if (!value) {
        callback(new Error(this.$t('rulse.require_name')))
      } else if (!validateEName(value)) {
        callback(new Error(this.$t('rulse.invalid_name_en')))
        this.temp.group_name = ''
      } else if (value === this.basename) {
        callback()
      } else {
        const str = '?group_name=' + value
        checkName(str).then(res => {
          if (res.data.message) {
            callback(new Error(res.data.message))
            this.temp.group_name = ''
          } else {
            callback()
          }
        })
      }
    }
    return {
      permStatus: false,
      oldPerms: [],
      checkList: [],
      id: '',
      tableLoading: false,
      searchLoading: false,
      tableData: [],
      tableQuery: {
        group_zname: null
      },
      tablePage: {
        current: 1,
        pages: null,
        size: null,
        total: 0
      },
      dialogFormVisible: false,
      dialogStatus: '',
      idx: null, // 表格的下标
      rid: null,
      temp: {
        group_zname: null,
        group_name: null,
        group_desc: null,
        parent_id: null,
        group_id: null
      },
      textMap: {
        update: this.$t('buttons.update') + this.$t('labels.group.group'),
        create: this.$t('buttons.add') + this.$t('labels.group.group')
      },
      rules: {
        group_zname: [{ validator: testGroupZName, trigger: 'blur', required: true }],
        group_name: [{ validator: testGroupName, trigger: 'blur', required: true }],
        parent_id: [{ required: true, message: this.$t('strings.select'), trigger: 'change' }]
      },
      dialogFormShow: false,
      formLabelWidth: '30%',
      allPerms: [],
      permModel: {
        auth_perm: []
      },
      groupRules: {
        parent_id: [{ required: true, message: this.$t('rules.required_select'), trigger: 'change' }]
      },
      rolePermUpdateSum: 0,
      roleApiPvals: [],
      roleGroupSum: 0,
      roleGroupTest: 0,
      searchGroupList: [],
      addUserFormShow: false,
      userTemp: {
        random_code: null
      },
      userMessage: [],
      // isShow: false,
      isExist: true,
      childGroup: [],
      nameStr: '',
      fatherName: '',
      deleteid: '',
      basename: '',
      basezname: '',
      // 第一次默认勾选展示的时候不会发送请求
      updatestatus: false,
      fatherid: null,
      groups: []
    }
  },
  watch: {
    addUserFormShow: function(val, oldval) {
      if (val === false) {
        this.userMessage = []
        this.userTemp.random_code = ''
      }
    }
  }, // watch
  created() {
    this.fatherid = this.$store.state.user.group_id
    this.fetchData()
    this.getTotal()
  },
  methods: {
    parseTime,
    hasAdminRole(row) {
      return row && row.rval === root.rval
    },
    // 分页
    handleCurrentChange(val) {
      this.tablePage.current = val
      const str = '?page=' + val
      this.tableLoading = true
      searchRoleMessage(str).then(res => {
        this.tableLoading = false
        this.tableData = res.data.data
      }).catch((error) => {
        console.log(error)
      })
    },
    // 查询
    fetchData(val) {
      let temp = ''
      val ? temp = val : temp = 1
      this.tableLoading = true
      const str = '?page=' + temp
      searchRoleMessage(str).then(res => {
        this.tableData = res.data.data
        this.tableLoading = false
      }).catch((error) => {
        console.log(error)
      })
      // 获取所有群组
      queryRole().then(res => {
        this.groups = res.data.data ? res.data.data.filter(item => item.attributes.parent_id !== -1) : []
      })
    },
    // 获取群组的所有条数
    getTotal() {
      const str1 = '?get_total'
      searchRoleMessage(str1).then(res => {
        this.tablePage.total = Number(res.data.data)
      }).catch((error) => {
        console.log(error)
      })
    },
    // 更新
    handleUpdate(idx, row) {
      const temp = row.attributes
      this.basezname = temp.group_zname
      this.basename = temp.group_name
      this.temp.group_name = temp.group_name
      this.temp.group_zname = temp.group_zname
      this.temp.parent_id = temp.parent_id
      this.temp.group_id = row.id
      this.idx = idx
      this.id = row.id
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => this.$refs['dataForm'].clearValidate())
    },
    updateData() {
      // 修改时，删除那一条，然后再添加进去
      this.$refs['dataForm'].validate((valid) => {
        if (!valid) return
        const tempData = this.temp
        updateRole(this.id, tempData).then(res => {
          const temp = this.tableData[this.idx].attributes
          this.tableData[this.idx].attributes = _.assign({}, temp, tempData)
          this.dialogFormVisible = false
          this.$message({
            type: 'success',
            message: this.$t('messages.update_success'),
            duration: 1000
          })
          this.fetchData(this.tablePage.current)
        })
      })
    },
    // 更新用户的群组
    handleUpdateRolePerms(idx, row) {
      this.$router.push({ path: '/system/role_manage/' + row.id + '/assign_perm' })
    },
    // 删除
    handleDelete(idx, row) {
      this.deleteid = row.id
      this.childGroup = row.attributes.childs_group ? row.attributes.childs_group.split(',') : []
      this.fatherName = row.attributes.group_zname
      const len = this.childGroup.length
      this.$confirm(this.$t('strings.group.delete_group'), this.$t('labels.reminder'), confirm).then(() => {
        if (!len) {
          this.deleteGroup(this.deleteid)
          return
        } else {
          this.nameStr = this.handelArr(this.childGroup)
        }
        this.$confirm(this.$t('strings.group.delete') + this.fatherName + this.$t('strings.group.delete_children') + this.nameStr + ' )', this.$t('labels.reminder'), confirm).then(() => {
          this.deleteGroup(this.deleteid)
        }).catch(() => {
          this.$message.info(this.$t('messages.cancel_operate'))
        })
      }).catch(() => {
        this.$message.info(this.$t('messages.cancel_operate'))
      })
    },
    // 删除群组时页面跳转的操作
    deleteGroup(val) {
      const str = '?page=' + this.tablePage.current
      searchRoleMessage(str).then(res => {
        if (res.data.data.length > 1) {
          this.deleteFunc(val, this.tablePage.current)
        } else {
          this.deleteFunc(val, this.tablePage.current - 1)
          this.tablePage.current = this.tablePage.current - 1
        }
      }).catch((error) => {
        console.log(error)
      })
    },
    // 删除群组的函数
    deleteFunc(value, pageNum) {
      deleteRole({ id: value, status: 1 }).then(res => {
        if (res.status === 204) {
          this.fetchData(pageNum)
          this.getTotal()
          this.$message({
            type: 'success',
            mesage: this.$t('messages.delete_success'),
            duration: 1000
          })
        }
      })
    },
    // 删除所属子组时信息提示的操作
    handelArr(val) {
      let nameStr = ''
      if (val.length <= 3) {
        nameStr = val.join(',')
      } else {
        nameStr = val.slice(0, 3).join(',') + '等'
      }
      return nameStr
    },
    // 新增
    handleCreate() {
      resetTemp(this.temp)
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => this.$refs['dataForm'].clearValidate())
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (!valid) return
        this.temp.parent_id = Number(this.temp.parent_id)
        addRole(this.temp).then((res) => {
          this.dialogFormVisible = false
          if (res.data.data.message) {
            this.$message({
              message: res.data.data.message,
              type: 'error',
              duration: 1000
            })
            return
          } else {
            this.fetchData(this.tablePage.current)
            this.getTotal()
            this.$message({
              message: this.$t('messages.create_success'),
              type: 'success',
              duration: 1000
            })
          }
        }).catch((error) => {
          console.log(error)
        })
      })
    },
    // 打开权限
    changeGroupPerms(idx, row) {
      this.updatestatus = true
      // 显示用户的群组
      this.idx = idx
      this.id = row.id
      // 需要获取this.tableData 后面会更改this.tableData的值
      const oldperm = this.tableData[this.idx].relationships.auth_perm.data
      // 显示弹窗
      this.dialogFormShow = true
      if (this.fatherid === 2) {
        getAllPerms().then(res => {
          this.allPerms = res.data.data
        }).then(() => {
          const m = oldperm.map((item) => {
            return { id: item.id }
          })
          this.oldPerms = m
          this.permStatus = true
          this.$refs.permTreeRef.setCheckedNodes(m)
        }).catch(error => {
          console.log(error)
          this.$message.error('error')
        })
      } else {
        getselfPerms().then(res => {
          this.allPerms = res.data.data
        }).then(() => {
          const m = oldperm.map((item) => {
            return { id: item.id }
          })
          this.oldPerms = m
          this.permStatus = true
          this.$refs.permTreeRef.setCheckedNodes(m)
        }).catch(error => {
          console.log(error)
          this.$message.error('error')
        })
      }
    },
    checkUpdateGroupPermData() {
      updateGroupPerms(this.id, this.permModel).then(res => {
        const data = res.data.data
        this.tableData[this.idx].attributes.perm_zname = data.attributes.perm_zname
        this.dialogFormShow = false
        this.$message.success(this.$t('messages.update_success'))
      })
    },
    // 群组权限的勾选状态
    handleUpdateApiPermForRole: debounce(function(node, status) {
      // 获取到当前点击的那个元素
      if (this.updatestatus) {
        this.updatestatus = false
        return
      }
      if (status) {
        const data = {
          perm: node.id
        }
        updatePerms(this.id, data).then(res => {
          this.$message({
            message: this.$t('messages.group.update_perm_success'),
            type: 'success',
            duration: 1000
          })
          this.fetchData(this.tablePage.current)
        }).catch(error => {
          console.log(error)
          this.$refs.permTreeRef.setCheckedNodes(this.oldPerms)
        })
      } else {
        const data = {
          perm: node.id
        }
        deleteroleperm(this.id, data).then(res => {
          this.$message({
            type: 'success',
            message: this.$t('messages.group.update_perm_success'),
            duration: 1000
          })
          this.fetchData(this.tablePage.current)
        })
      }
    }, 500),
    // 搜索群组
    searchGroup(data) {
      if (!data) {
        this.fetchData()
      }
      const str = '?group_zname=' + data
      this.tableLoading = true
      searchRoleMessage(str).then(res => {
        this.tableLoading = false
        this.tableData = res.data.data
        this.tablePage.current = 1
        this.tablePage.total = this.tableData.length
      }).catch((error) => {
        console.log(error)
      })
    },
    // 添加用户
    search(data) {
      this.searchLoading = true
      data = data.trim()
      let str = ''
      if (data.length < 16) {
        str = '?addguser=1' + '&username=' + data
      } else {
        str = '?addguser=1' + '&random_code=' + data
      }
      searchUserMessage(str).then(res => {
        // this.isShow = true
        this.searchLoading = false
        if (res.data.data.length === 0) return
        this.userMessage = res.data.data
        if (res.data.data[0].relationships.auth_group.data.id !== '1') {
          this.isExist = false
        }
      })
    },
    addUser(idx, row) {
      this.id = row.id
      this.addUserFormShow = true
    },
    // 往群组添加用户
    changeUserGroup(idx, row) {
      const data = {
        auth_group: this.id
      }
      updateUserRoles(row.id, data).then((res) => {
        this.addUserFormShow = false
        this.$message.success(this.$t('messages.add_success'))
      }).catch((error) => {
        console.log(error)
      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.space{
  text-align: center;
  margin-bottom: 15px;
}
.tableBox {
  margin: 30px 0;
}
</style>
