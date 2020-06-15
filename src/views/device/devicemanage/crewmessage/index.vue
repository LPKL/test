<template>
  <div class="app-container">
    <!--查询  -->
    <el-row>
      <el-input v-model="dbname" :placeholder="$t('labels.devicemanage.device_name')" style="width:200px;"/>
      <span style="margin-right: 15px;"/>
      <el-tooltip :content="$t('buttons.search')" class="item" placement="top" >
        <!-- <el-button v-is-show="{name:'selectcrew'}" icon="el-icon-search" circle @click="searchcrew(dbname)"/> -->
        <el-button icon="el-icon-search" circle @click="searchdb(dbname)"/>
      </el-tooltip>
    </el-row>
    <div style="margin-bottom: 30px;"/>
    <!-- <el-button v-is-show="{name:'addcrew'}" type="primary" icon="el-icon-plus" size="mini" @click="handleCreate">{{ addcrew }}</el-button> -->
    <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleCreate">{{ addcrew }}</el-button>
    <div style="margin-bottom: 30px;"/>
    <!--列表-->
    <div class="crewtableBox">
      <el-table
        v-loading.body="tableLoading"
        :data="tableData"
        :element-loading-text="$t('strings.loading')"
        style="width: 100%"
        border
        fit
        highlight-current-row>
        <el-table-column prop="jz_id" label="id" width="50%" align="center">
          <template slot-scope="scope">
            <span v-text="scope.row.id"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.devicemanage.device_name')" prop="jz_zname" align="center">
          <template slot-scope="scope">
            <span v-text="scope.row.attributes.jz_zname"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.devicemanage.device_name_en')" prop="jz_name" align="center">
          <template slot-scope="scope">
            <span v-text="scope.row.attributes.jz_name"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.devicemanage.group')" prop="group_zname" width="150%" align="center">
          <template slot-scope="scope">
            <span v-text="scope.row.attributes.auth_group_zname"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.devicemanage.history')" prop="history" align="center">
          <template slot-scope="scope">
            <el-button type="text" @click="histroycrew(scope.$index,scope.row)">{{ $t('buttons.devicemanage.database') }}</el-button>
            <el-button type="text" @click="tabcrew(scope.$index,scope.row)">{{ $t('buttons.devicemanage.datatable') }}</el-button>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.devicemanage.realtime')" prop="realtime" align="center">
          <template slot-scope="scope">
            <el-button type="text" @click="crewshi(scope.$index,scope.row)">{{ $t('buttons.view') }}</el-button>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.create_time')" prop="create_time" align="center">
          <template slot-scope="scope">
            <span v-text="scope.row.attributes.new_create_time"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('buttons.actions')" align="center">
          <template slot-scope="scope">
            <!-- <el-tooltip :content="$t('table.detail')" placement="top">
              <el-button v-is-show="{name:'jzdetail'}" size="small" type="success" icon="el-icon-tickets" circle plain @click="handleDetail(scope.$index,scope.row)"/>
              <el-button size="medium" type="success" icon="el-icon-tickets" circle plain @click="handleDetail(scope.$index,scope.row)"/>
            </el-tooltip> -->
            <el-tooltip :content="$t('buttons.edit')" placement="top">
              <!-- <el-button v-is-show="{name:'editjz'}" size="small" type="info" icon="el-icon-edit" circle plain @click="handleUpdate(scope.$index,scope.row)"/> -->
              <el-button size="medium" type="info" icon="el-icon-edit" circle plain @click="handleUpdate(scope.$index,scope.row)"/>
            </el-tooltip>
            <!-- <el-tooltip v-if="!scope.row.attributes.is_superuser" content="修改群组" placement="top">
              <el-button v-is-show="{name:'changeuser'}" size="small" type="warning" icon="el-icon-star-off" circle plain @click="handleUpdateUserRoles(scope.$index,scope.row)"/>
              <el-button size="medium" type="warning" icon="el-icon-star-off" circle plain @click="handleUpdatecrewRoles(scope.$index,scope.row)"/>
            </el-tooltip> -->
            <el-tooltip v-if="!scope.row.attributes.is_superuser" :content="$t('buttons.delete')" placement="top">
              <!-- <el-button v-is-show="{name:'deletejz'}" size="small" type="danger" icon="el-icon-delete" circle plain @click="handleDelete(scope.$index,scope.row)"/> -->
              <el-button size="medium" type="danger" icon="el-icon-delete" circle plain @click="handleDelete(scope.$index,scope.row)"/>
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
      layout="total,prev, pager, next, jumper"
      @current-change="handleCurrentChange"/>
    <!-- 添加设备 -->
    <el-dialog :close-on-click-modal="false" :title="dialogmessage" :visible.sync="dialogFormVisible" width="380px" @open="open">
      <el-form ref="ruleForm" :model="crewForm" :rules="rules" status-icon label-width="125px" class="ruleForm">
        <el-form-item v-if="dialogStatus==='update'" label="id" prop="id">
          <el-input v-model="crewForm.id" disabled auto-complete="off"/>
        </el-form-item>
        <el-form-item :label="$t('labels.devicemanage.device_name')" prop="jz_zname">
          <el-input v-model="crewForm.jz_zname"/>
        </el-form-item>
        <el-form-item :label="$t('labels.devicemanage.device_name_en')" prop="jz_name">
          <el-input v-model="crewForm.jz_name"/>
        </el-form-item>
        <el-form-item :label="$t('labels.devicemanage.group')" prop="group">
          <el-select v-model="crewForm.group_id" style="width: 100%">
            <el-option
              v-for="(item, index) in options"
              :key="index"
              :label="item.attributes.group_zname"
              :value="item.id"/>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{ $t('buttons.cancel') }}</el-button>
        <el-button v-if="dialogStatus==='create'" type="primary" @click="createData">{{ $t('buttons.create') }}</el-button>
        <el-button v-else type="primary" @click="updateData">{{ $t('buttons.confirm') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'
import { getdeviecinfo, addcrew, deletecrew, updatacrew, allgroup, testJZname } from '@/api/device'
import { validateZName, validateEName } from '@/utils/validate'
export default {
  name: 'Crewmessage',
  data() {
    const testname = (rules, value, callback) => {
      if (!value) {
        callback(new Error(this.$t('rules.require_name')))
      } else if (!validateEName(value)) {
        callback(new Error(this.$t('rules.invalid_name')))
        this.crewForm.jz_name = ''
      } else if (value === this.basename) {
        callback()
      } else {
        const str = '?jz_name=' + value
        testJZname(str).then(res => {
          if (res.status === 200) {
            callback()
          } else {
            callback(new Error(this.$t('rules.duplicate_name')))
            this.crewForm.jz_name = ''
          }
        })
      }
    }
    const testzname = (rules, value, callback) => {
      if (!value) {
        callback(new Error(this.$t('rules.require_name')))
      } else if (!validateZName(value)) {
        callback(new Error(this.$t('rules.invalid_name')))
        this.crewForm.jz_zname = ''
      } else if (value === this.basezname) {
        callback()
      } else {
        const str = '?jz_zname=' + value
        testJZname(str).then(res => {
          if (res.status === 200) {
            callback()
          } else {
            callback(new Error(this.$t('rules.duplicate_name')))
            this.crewForm.jz_zname = ''
          }
        })
      }
    }
    return {
      basename: '',
      basezname: '',
      rowmsg: [],
      ishave: '',
      dbname: '',
      tableData: [],
      tableLoading: true,
      addcrew: this.$t('buttons.add') + this.$t('labels.devicemanage.title'),
      dialogStatus: 'create',
      tablePage: {
        current: 1,
        total: 0
      },
      dialogmessage: '',
      dialogFormVisible: false,
      crewForm: {
        id: '',
        jz_zname: '',
        jz_name: '',
        group_id: ''
      },
      updateid: null,
      options: [],
      rules: {
        jz_name: [{ validator: testname, trigger: 'blur', required: true }],
        jz_zname: [{ validator: testzname, trigger: 'blur', required: true }]
      }
    }
  },
  created() {
    this.init()
  },
  methods: {
    // 去除表单的验证残留
    open() {
      if (this.dialogStatus === 'create') {
        this.crewForm.id = 1
        this.crewForm.group_id = ''
        this.crewForm.jz_name = ''
        this.crewForm.jz_zname = ''
        this.$nextTick(() => {
          this.$refs['ruleForm'].clearValidate()
        })
      } else {
        this.crewForm.id = this.rowmsg.id
        this.crewForm.jz_zname = this.rowmsg.attributes.jz_zname
        this.crewForm.group_id = this.rowmsg.attributes.auth_group_zname
        this.crewForm.jz_name = this.rowmsg.attributes.jz_name
        this.basename = this.rowmsg.attributes.jz_name
        this.basezname = this.rowmsg.attributes.jz_zname
        this.$nextTick(() => {
          this.$refs['ruleForm'].clearValidate()
        })
      }
    },

    // 初始化数据
    init() {
      this.getcrewdata()
      this.getAllGroup()
      this.getTotal()
    },
    // 获取数据
    getcrewdata(val) {
      let num = null
      val ? num = val : num = 1
      this.tableLoading = true
      getdeviecinfo('page=' + num).then(res => {
        this.tableLoading = false
        this.tableData = res.data.data
      }).catch(error => {
        console.log(error)
      })
    },
    // 获取所有群组
    getAllGroup() {
      allgroup().then(res => {
        this.options = res.data.data.slice()
      })
    },
    // 获取所有数据的条数
    getTotal() {
      getdeviecinfo('get_total').then(res => {
        this.tablePage.total = Number(res.data.data)
      })
    },
    // 搜索设备
    searchdb(val) {
      if (!val) {
        this.getcrewdata()
        return
      }
      this.tableLoading = true
      getdeviecinfo('zname=' + val).then(res => {
        this.tableLoading = false
        this.tableData = res.data.data
      })
      this.tablePage.total = 1
    },
    // 添加设备
    handleCreate() {
      this.dialogFormVisible = true
      this.dialogStatus = 'create'
      this.dialogmessage = this.addcrew
    },
    createData() {
      this.$refs['ruleForm'].validate((valid) => {
        if (!valid) return
        this.dialogFormVisible = false
        addcrew(this.crewForm).then(res => {
          if (res.status === 201) {
            this.getcrewdata(this.tablePage.current)
            this.getTotal()
            this.$message({
              message: this.$t('messages.create_success'),
              type: 'success',
              duration: 1000
            })
          }
        }).catch(error => {
          console.log(error)
        })
      })
    },
    handleUpdate(idx, row) {
      this.dialogFormVisible = true
      this.updateid = idx
      this.dialogStatus = 'update'
      this.dialogmessage = this.$t('strings.devicemanage.update_device')
      this.rowmsg = row
    },
    updateData() {
      this.$refs['ruleForm'].validate(valid => {
        if (!valid) return
        const tempData = _.pickBy(_.clone(this.crewForm), _.identity)
        this.crewForm.group_id = this.tableData[this.updateid].attributes.auth_group_id
        this.dialogFormVisible = false
        updatacrew(this.crewForm.id, this.crewForm).then(res => {
          if (res.status === 200) {
            const temp = this.tableData[this.updateid].attributes
            this.tableData[this.updateid].attributes = _.assign({}, temp, tempData)
            this.$message({
              message: this.$t('messages.update_success'),
              type: 'success',
              duration: 1000
            })
          }
        })
      })
    },
    // 删除设备
    handleDelete(idx, row) {
      this.$confirm(this.$t('strings.devicemanage.delete_device'), this.$t('labels.reminder'), confirm).then(() => {
        if (this.tablePage.current === 1) {
          this.deleteFunc(idx, row, this.tablePage.current)
        } else {
          const str = 'page=' + this.tablePage.current
          getdeviecinfo(str).then(res => {
            if (res.data.data.length > 1) {
              this.deleteFunc(idx, row, this.tablePage.current)
            } else {
              this.deleteFunc(idx, row, this.tablePage.current - 1)
              this.tablePage.current = this.tablePage.current - 1
            }
          }).catch(error => {
            console.log(error)
          })
        }
      }).catch(() => {
        this.$message({
          message: this.$t('messages.delete_cancelled'),
          type: 'info',
          duration: 1000
        })
      })
    },
    // 删除的函数
    deleteFunc(idx, row, pageNum) {
      deletecrew(row.id).then(res => {
        if (res.status === 204) {
          this.getcrewdata(pageNum)
          this.getTotal()
          this.dialogFormVisible = false
          this.$message({
            message: this.$t('messages.delete_success'),
            type: 'success',
            duration: 1000
          })
        }
      })
    },
    // 分页器的操作
    handleCurrentChange(val) {
      this.tablePage.current = val
      this.getcrewdata(val)
    },
    // 历史数据库表
    histroycrew(idx, row) {
      this.$router.push({ path: '/manageCenter/history', query: { id: row.id, status: true }})
    },
    // 历史数据表信息
    tabcrew(idx, row) {
      this.$router.push({ path: '/manageCenter/tablemes', query: { id: row.id, status: true }})
    },
    // 实时数据
    crewshi(idx, row) {
      this.$router.push({ path: '/manageCenter/crewshi', query: { id: row.id, status: true }})
    }
  }
}

</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.crewtableBox {
  width: 100%;
  height: 630px;
}
</style>
