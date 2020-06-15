<template>
  <div class="app-container">
    <!--查询-->
    <el-row>
      <el-input v-model="tableQuery.group_zname" :placeholder="$t('labels.perm.perm')" style="width:200px;"/>
      <span style="margin-right: 15px;"/>
      <el-tooltip v-is-show="{name:'selectperm'}" :content="$t('buttons.search')" class="item" placement="top">
        <el-button icon="el-icon-search" circle @click="searchPerm(tableQuery.group_zname)"/>
      </el-tooltip>
    </el-row>
    <div style="margin-bottom: 30px;"/>
    <el-button v-is-show="{name:'addperm'}" type="primary" icon="el-icon-plus" size="mini" @click="handleCreate">{{ textMap.create }}</el-button>
    <!--列表-->
    <div class="tableBox">
      <el-table
        v-loading.body="tableLoading"
        :data="tableData"
        style="width: 100%"
        height="600"
        element-loading-text="Loading"
        border
        fit
        highlight-current-row>
        <el-table-column label="id" align="center" width="50%">
          <template slot-scope="scope" >
            <span v-text="scope.row.id"/>
          </template>
        </el-table-column>
        <el-table-column label="权限名称" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.attributes.perm_zname }}</span>
          </template>
        </el-table-column>

        <el-table-column label="权限英文名" align="center">
          <template slot-scope="scope">
            <span >{{ scope.row.attributes.perm_name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.attributes.create_time }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.actions')" align="center" width="250%">
          <template slot-scope="scope">
            <el-tooltip v-is-show="{name:'editperm'}" :content="$t('labels.edit')" placement="top">
              <el-button size="small" type="info" icon="el-icon-edit" circle plain @click="handleUpdate(scope.$index,scope.row)"/>
            </el-tooltip>
            <el-tooltip v-is-show="{name:'permdetail'}" v-if="scope.row.id!=='0'" :content="$t('labels.detail')" placement="top">
              <el-button size="small" type="warning" icon="el-icon-view" circle plain @click="changeGroupPerms(scope.$index,scope.row)"/>
            </el-tooltip>
            <el-tooltip v-is-show="{name:'deleteperm'}" v-if="scope.row.id!=='1'" :content="$t('labels.delete')" placement="top">
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
    <!--弹出窗口：新增权限-->
    <el-dialog :title="textMap[dialogStatus]" :close-on-click-modal="false" :visible.sync="dialogFormVisible" width="408px">
      <el-form ref="dataForm" :rules="rules" :model="temp" status-icon label-width="95px" >
        <el-form-item label="权限名" prop="perm_zname" >
          <el-input v-model="temp.perm_zname"/>
        </el-form-item>
        <el-form-item label="权限英文名" prop="perm_name" >
          <el-input v-model="temp.perm_name"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{ $t('buttons.cancel') }}</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">{{ $t('buttons.create') }}</el-button>
        <el-button v-else type="primary" @click="updateData">{{ $t('buttons.confirm') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { updateperms, deleteperms, addPerms, checkName } from '@/api/system/role'
import { searchPermMessage } from '@/api/system/perm'
import { parseTime, resetTemp } from '@/utils'
import { confirm, root } from '@/utils/constants'
import { validateZName, validateEName } from '@/utils/validate'
// import _ from 'lodash'
export default {
  name: 'RoleManage',
  data() {
    // 权限名验证
    const testPermZName = (rule, value, callback) => {
      if (!value) {
        callback(new Error(this.$t('rules.require_name')))
      } else if (!validateZName(value)) {
        callback(new Error(this.$t('rules.invalid_name_en')))
        this.temp.perm_zname = ''
      } else if (value === this.basezname) {
        callback()
      } else {
        const str = '?perm_zname=' + value
        checkName(str).then(res => {
          if (res.data.message) {
            callback(new Error(res.data.message))
            this.temp.perm_zname = ''
          } else {
            callback()
          }
        })
      }
    }
    // 权限英文名验证
    const testPermName = (rule, value, callback) => {
      if (!value) {
        callback(new Error(this.$t('rules.require_name')))
      } else if (!validateEName(value)) {
        callback(new Error(this.$t('rules.invalid_name_en')))
        this.temp.perm_name = ''
      } else if (value === this.basename) {
        callback()
      } else {
        const str = '?perm_name=' + value
        checkName(str).then(res => {
          if (res.data.message) {
            callback(new Error(res.data.message))
            this.temp.perm_name = ''
          } else {
            callback()
          }
        })
      }
    }
    return {
      id: '',
      tableLoading: false,
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
        perm_zname: null,
        perm_name: null,
        perms_id: null
      },
      textMap: {
        update: this.$t('buttons.update') + this.$t('labels.perm.perm'),
        create: this.$t('buttons.add') + this.$t('labels.perm.perm')
      },
      rules: {
        perm_zname: [{ validator: testPermZName, trigger: 'blur', required: true }],
        perm_name: [{ validator: testPermName, trigger: 'blur', required: true }],
        perms_id: [{ required: true, message: this.$t('rules.required_select'), trigger: 'change' }]
      },
      basename: '',
      basezname: ''
    }
  },
  created() {
    this.fetchData()
    this.gettotal()
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
      searchPermMessage(str).then(res => {
        this.tableLoading = false
        this.tableData = res.data.data
      }).catch((error) => {
        console.log(error)
      })
    },
    // 查询
    fetchData(val) {
      let num = null
      val ? num = val : num = 1
      this.tableLoading = true
      const str = '?page=' + num
      searchPermMessage(str).then(res => {
        this.tableData = res.data.data
        this.tableLoading = false
      }).catch((error) => {
        console.log(error)
      })
    },
    // 获取所有用户
    gettotal() {
      const str1 = '?get_total'
      searchPermMessage(str1).then(res => {
        this.tablePage.total = Number(res.data.data)
      }).catch((error) => {
        console.log(error)
      })
    },
    // 更新
    handleUpdate(idx, row) {
      const temp = row.attributes
      this.basename = temp.perm_name
      this.basezname = temp.perm_zname
      this.temp.perm_name = temp.perm_name
      this.temp.perm_zname = temp.perm_zname
      this.temp.perm_id = row.id
      this.idx = idx
      this.id = row.id
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => this.$refs['dataForm'].clearValidate())
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (!valid) return
        const tempData = this.temp
        updateperms(this.id, tempData).then(res => {
          this.fetchData(this.tablePage.current)
          this.dialogFormVisible = false
          this.$message({
            type: 'success',
            message: this.$t('messages.update_success'),
            duration: 1000
          })
        })
      })
    },

    // 更新用户的权限
    handleUpdateRolePerms(idx, row) {
      this.$router.push({ path: '/system/role_manage/' + row.id + '/assign_perm' })
    },
    // 删除
    handleDelete(idx, row) {
      this.$confirm(this.$t('strings.perm.delete_perm'), this.$t('labels.reminder'), confirm).then(() => {
        if (this.tablePage.current === 1) {
          this.deleteFunc(idx, row, this.tablePage.current)
        } else {
          const str = '?page=' + this.tablePage.current
          searchPermMessage(str).then(res => {
            if (res.data.data.length > 1) {
              this.deleteFunc(idx, row, this.tablePage.current)
            } else {
              this.deleteFunc(idx, row, this.tablePage.current - 1)
              this.tablePage.current = this.tablePage.current - 1
            }
          }).catch((error) => {
            console.log(error)
          })
        }
      })
    },
    // 删除数据函数
    deleteFunc(idx, row, pageNum) {
      deleteperms({ id: row.id }).then(res => {
        this.dialogFormVisible = false
        this.$message({
          type: 'success',
          message: this.$t('messages.delete_success'),
          duration: 1000
        })
        this.fetchData(pageNum)
        this.gettotal()
      }).catch(() => {
        this.$message({
          type: 'info',
          message: this.$t('messages.cancel_operate'),
          duration: 1000
        })
      })
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
        addPerms(this.temp).then((res) => {
          if (res.data.message) {
            this.$message({
              type: 'error',
              message: this.$t('messages.perm.none'),
              duration: 1000
            })
          } else {
            this.dialogFormVisible = false
            // this.fetchData(this.tablePage.current)
            this.tableData.unshift(res.data.data)
            this.gettotal()
            this.$message({
              type: 'success',
              message: this.$t('messages.add_success'),
              duration: 1000
            })
          }
        })
      })
    },
    // 权限详情
    changeGroupPerms(idx, row) {
      // // 显示弹窗
      this.$router.push({ path: '/system/role_manage/' + row.id + '/' + row.attributes.perm_zname })
    },
    // 搜索权限
    searchPerm(data) {
      if (!data) {
        this.fetchData()
      }
      const str = '?perm_zname=' + data
      this.tableLoading = true
      searchPermMessage(str).then(res => {
        this.tableLoading = false
        this.tableData = res.data.data
        this.tablePage.current = 1
        this.tablePage.total = this.tableData.length
      }).catch((error) => {
        console.log(error)
      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.tableBox {
  margin: 30px 0;
}
</style>
