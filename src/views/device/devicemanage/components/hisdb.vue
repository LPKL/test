
<template>
  <div class="app-container">
    <!--查询  -->
    <el-row>
      <el-input v-model="dbname" :placeholder="$t('labels.devicemanage.database_name')" style="width:200px;"/>
      <span style="margin-right: 15px;"/>
      <el-tooltip :content="$t('buttons.search')" class="item" placement="top" >
        <!-- <el-button v-is-show="{name:'selectdb'}" icon="el-icon-search" circle @click="searchdb(dbname)"/> -->
        <el-button icon="el-icon-search" circle @click="searchdb(dbname)"/>
      </el-tooltip>
    </el-row>
    <div style="margin-bottom: 30px;"/>
    <!-- <el-button v-is-show="{name:'adddevice'}" type="primary" icon="el-icon-plus" size="mini" @click="handleCreate">{{ adddevice }}</el-button> -->
    <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleCreate">{{ adddb }}</el-button>
    <div style="margin-bottom: 30px;"/>
    <!--列表-->
    <div class="tableBox">
      <el-table
        v-loading.body="tableLoading"
        :data="tableData"
        :element-loading-text="$t('strings.loading')"
        style="width: 100%"
        height="775"
        border
        fit
        highlight-current-row>
        <el-table-column :label="$t('labels.id')" prop="db_id" width="50%" align="center">
          <template slot-scope="scope">
            <span v-text="scope.row.id"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.devicemanage.database_name')" prop="db_zname" align="center">
          <template slot-scope="scope">
            <span v-text="scope.row.attributes.db_zname"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.devicemanage.database_name_en')" prop="db_name" align="center">
          <template slot-scope="scope">
            <span v-text="scope.row.attributes.db_name"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.devicemanage.ip')" prop="db_ip" align="center">
          <template slot-scope="scope">
            <span v-text="scope.row.attributes.db_ip"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.devicemanage.port')" prop="db_port" align="center">
          <template slot-scope="scope">
            <span v-text="scope.row.attributes.db_port"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.devicemanage.belong_device')" prop="jz_zname" width="150%" align="center">
          <template slot-scope="scope">
            <span v-text="scope.row.attributes.jz_zname"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.actions')" align="center">
          <template slot-scope="scope">
            <el-tooltip :content="$t('buttons.edit')" placement="top">
              <!-- <el-button v-is-show="{name:'editjz'}" size="small" type="info" icon="el-icon-edit" circle plain @click="handleUpdate(scope.$index,scope.row)"/> -->
              <el-button size="medium" type="info" icon="el-icon-edit" circle plain @click="handleUpdate(scope.$index,scope.row)"/>
            </el-tooltip>
            <el-tooltip :content="$t('buttons.detail')" placement="top">
              <!-- <el-button v-is-show="{name:'jzdetail'}" size="small" type="success" icon="el-icon-tickets" circle plain @click="handleDetail(scope.$index,scope.row)"/> -->
              <el-button size="medium" type="success" icon="el-icon-tickets" circle plain @click="handleDetail(scope.$index,scope.row)"/>
            </el-tooltip>
            <el-tooltip v-if="!scope.row.is_superuser" :content="$t('buttons.delete')" placement="top">
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
    <!-- 添加数据库 -->
    <el-dialog :title="dialogmessage" :close-on-click-modal="false" :visible.sync="dialogFormVisible" width="400px" @open="open()">
      <el-form ref="ruleForm" :model="dbForm" :rules="rules" status-icon label-width="135px" class="ruleForm">
        <el-form-item v-if="dialogStatus==='update'" :label="$t('labels.id')" prop="id">
          <el-input v-model="dbForm.id" disabled auto-complete="off"/>
        </el-form-item>
        <!-- <el-form-item label="设备名" prop="jz_id">
          <el-input v-model="dbForm.jz_id"/>
        </el-form-item> -->
        <el-form-item :label="$t('labels.devicemanage.database_name')" prop="db_zname">
          <el-input v-model="dbForm.db_zname" auto-complete="off"/>
        </el-form-item>
        <el-form-item :label="$t('labels.devicemanage.database_name_en')" prop="db_name">
          <el-input v-model="dbForm.db_name" auto-complete="off"/>
        </el-form-item>
        <el-form-item :label="$t('labels.devicemanage.ip')" prop="db_ip">
          <el-input v-model="dbForm.db_ip" auto-complete="off"/>
        </el-form-item>
        <el-form-item :label="$t('labels.devicemanage.port')" prop="db_port">
          <el-input v-model="dbForm.db_port" auto-complete="off"/>
        </el-form-item>
        <el-form-item :label="$t('labels.username')" prop="db_user_name">
          <el-input v-model="dbForm.db_user_name" auto-complete="off"/>
        </el-form-item>
        <el-form-item :label="$t('labels.password')" prop="db_user_pwd">
          <el-input v-model="dbForm.db_user_pwd" onfocus="this.type='db_user_pwd'" auto-complete="off"/>
        </el-form-item>
        <el-form-item :label="$t('labels.devicemanage.database_type')" prop="db_type">
          <el-select v-model="dbForm.db_type" :placeholder="$t('strings.select')" auto-complete="off" style="width: 100%">
            <el-option
              v-for="(item, index) in dbtype"
              :key="index"
              :label="item"
              :value="item"/>
          </el-select>
        </el-form-item>
        <el-form-item v-if="!ishave" :label="$t('labels.devicemanage.belong_device')" prop="jz_id">
          <el-select v-model="dbForm.jz_id" :placeholder="$t('strings.select')" auto-complete="off" style="width: 100%">
            <el-option
              v-for="(item, index) in options"
              :key="index"
              :label="item.attributes.jz_zname"
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
import { getallhisdb, addhisdb, deletedb, changedb, getdeviecinfo, testdbEname } from '@/api/device'
import { isUsableIp, isUsableport, validateZName, validateEName } from '@/utils/validate'
import { checkPassword } from '@/utils/rules'
export default {
  name: 'Databaseinfo',
  data() {
    // 用户名的验证
    const validateusername = (rule, value, callback) => {
      if (!value) {
        callback(new Error(this.$t('rules.required')))
      } else if (!validateZName(value)) {
        callback(new Error(this.$t('rules.invalid_username')))
        this.dbForm.db_user_name = ''
      } else {
        callback()
      }
    }
    // 数据库名的验证
    const validatedbname = (rule, value, callback) => {
      if (!value) {
        callback(new Error(this.$t('rules.required')))
      } else if (!validateZName(value)) {
        callback(new Error(this.$t('rules.invalid_database')))
        this.dbForm.db_zname = ''
      } else {
        callback()
      }
    }
    // 数据库英文名的验证
    const validatedbEname = (rule, value, callback) => {
      if (!value) {
        callback(new Error(this.$t('rules.required')))
      } else if (!validateEName(value)) {
        callback(new Error(this.$t('rules.invalid_name_en')))
        this.dbForm.db_name = ''
      } else if (value === this.defaulename) {
        callback()
      } else {
        testdbEname(value).then(res => {
          if (res.status === 202) {
            callback(new Error(this.$t('rules.duplicate_name')))
            this.dbForm.db_name = ''
          } else if (res.status === 200) {
            callback()
          }
        })
      }
    }
    // 数据库类型的验证
    const validatedbtype = (rule, value, callback) => {
      if (!value) {
        callback(new Error(this.$t('rules.required_select')))
      } else {
        callback()
      }
    }
    const validatedbjz = (rule, value, callback) => {
      if (!value) {
        callback(new Error(this.$t('rules.required_select')))
      } else {
        callback()
      }
    }
    // 端口号的验证
    const validatedbport = (rule, value, callback) => {
      if (!value) {
        callback(new Error(this.$t('rules.required')))
      } else if (!isUsableport(value)) {
        callback(new Error(this.$t('rules.invalid_port')))
        this.dbForm.db_port = ''
      } else if (value > 0 && value < 1023) {
        callback(new Error(this.$t('rules.invalid_port_symbol')))
      } else {
        callback()
      }
    }
    // // 密码的验证
    // const validatePass = (rule, value, callback) => {
    //   if (!value) {
    //     callback(this.$t('rules.required'))
    //   } else if (!/^[a-zA-Z\d]{6,18}$/.test(value)) {
    //     callback(new Error('请输入6-18位字母数字!'))
    //     this.dbForm.db_user_pwd = ''
    //   } else {
    //     callback()
    //   }
    // }
    // ip的验证
    const validateip = (rule, value, callback) => {
      if (!value) {
        callback(new Error(this.$t('rules.required')))
      } else if (!isUsableIp(value)) {
        callback(new Error(this.$t('rules.invalid_ip')))
        this.dbForm.db_ip = ''
      } else {
        callback()
      }
    }
    return {
      rowmsg: '',
      routeid: '',
      ishave: '',
      updateid: '',
      defaulename: '',
      dbname: '',
      adddb: this.$t('buttons.add') + this.$t('labels.devicemanage.database'),
      tableLoading: true,
      tableData: [],
      dialogStatus: 'create',
      dbForm: {
        id: '',
        jz_id: '',
        db_zname: '',
        db_name: '',
        db_ip: '',
        db_port: '',
        db_type: '',
        db_user_name: '',
        db_user_pwd: '',
        jz: ''
      },
      dialogFormVisible: false,
      dialogmessage: this.$t('buttons.add') + this.$t('labels.devicemanage.database'),
      options: [],
      tablePage: {
        current: 1,
        total: 0
      },
      dbtype: ['mysql', 'oracle', 'sql server', 'amazon redshift', 'azure', 'clickhouse', 'db2', 'derby', 'exasol', 'h2', 'hsqldb', 'marladb', 'postgresql', 'sqlite', 'sybase'],
      rules: {
        db_user_pwd: [{ validator: checkPassword, trigger: 'blur', required: true }],
        jz_id: [{ validator: validatedbjz, trigger: 'change', required: true }],
        db_zname: [{ validator: validatedbname, trigger: 'blur', required: true }],
        db_name: [{ validator: validatedbEname, trigger: 'blur', required: true }],
        db_ip: [{ validator: validateip, trigger: 'blur', required: true }],
        db_port: [{ validator: validatedbport, trigger: 'blur', required: true }],
        db_type: [{ validator: validatedbtype, trigger: 'change', required: true }],
        db_user_name: [{ validator: validateusername, trigger: 'blur', required: true }]
      }
    }
  },
  created() {
    this.init()
  },
  methods: {
    // 为了表单输入时的验证
    open() {
      if (this.dialogStatus === 'create') {
        this.dbForm.id = 1
        this.dbForm.jz_id = ''
        this.dbForm.jz = ''
        this.dbForm.db_zname = ''
        this.dbForm.db_name = ''
        this.dbForm.db_ip = ''
        this.dbForm.db_port = ''
        this.dbForm.db_type = ''
        this.dbForm.db_user_name = ''
        this.dbForm.db_user_pwd = ''
        this.$nextTick(() => {
          this.$refs['ruleForm'].clearValidate()
        })
      } else {
        this.dbForm.id = this.rowmsg.id
        this.dbForm.jz_id = this.rowmsg.attributes.jz_zname
        this.dbForm.db_zname = this.rowmsg.attributes.db_zname
        this.dbForm.db_name = this.rowmsg.attributes.db_name
        this.dbForm.db_ip = this.rowmsg.attributes.db_ip
        this.dbForm.db_port = this.rowmsg.attributes.db_port
        this.dbForm.db_type = this.rowmsg.attributes.db_type
        this.dbForm.db_user_name = this.rowmsg.attributes.db_user_name
        this.dbForm.db_user_pwd = this.rowmsg.attributes.db_user_pwd
        this.dbForm.jz = this.rowmsg.attributes.jz_id
        this.defaulename = this.rowmsg.attributes.db_name
        this.$nextTick(() => {
          this.$refs['ruleForm'].clearValidate()
        })
      }
    },
    // 初始化获取数据
    init() {
      this.getdbdata()
      this.getAllDevice()
      this.getTotal()
    },
    // 获取数据
    getdbdata(val) {
      this.routeid = this.$route.query.id ? this.$route.query.id : ''
      this.ishave = this.$route.query.status ? this.$route.query.status : false
      let str = ''
      this.routeid ? str = '?jz_id=' + this.routeid : ''
      if (str) {
        val ? str += '&page=' + val : str += '&page=1'
      } else {
        val ? str = '?page=' + val : str = '?page=1'
      }
      this.tableLoading = true
      getallhisdb(str).then(res => {
        this.tableLoading = false
        this.tableData = res.data.data
      }).catch(error => {
        console.log(error)
      })
    },
    // 获取所有群组
    getAllDevice() {
      if (this.$route.query.id) return
      // 为了用户选择下拉设备
      getdeviecinfo().then(res => {
        this.options = res.data.data.slice()
      })
    },
    // 获取所有的数据条数
    getTotal() {
      let str = ''
      this.routeid ? str = '?jz_id=' + this.routeid : ''
      str ? str += '&get_total' : str = '?get_total'
      getallhisdb(str).then(res => {
        this.tablePage.total = Number(res.data.data)
      }).catch((error) => {
        console.log(error)
      })
    },
    // 搜索设备
    searchdb(val) {
      if (!val) {
        this.getdbdata()
        return
      }
      let str = ''
      this.routeid ? str = '?jz_id=' + this.routeid : ''
      str ? str += '&db_zname=' + val : str = '?db_zname=' + val
      this.tableLoading = true
      getallhisdb(str).then(res => {
        this.tableLoading = false
        this.tableData = res.data.data
      })
      this.tablePage.total = 1
    },
    // 添加设备
    handleCreate() {
      this.dialogFormVisible = true
      this.dialogStatus = 'create'
      this.dialogmessage = this.$t('buttons.add') + this.$t('labels.devicemanage.database')
    },
    createData() {
      if (this.ishave) {
        // 为了在设备下操作的时候这两项不为空
        this.dbForm.jz = 1
        this.dbForm.jz_id = 1
      } else {
        this.dbForm.jz = this.dbForm.jz_id
      }
      this.$refs['ruleForm'].validate(valid => {
        if (!valid) return
        addhisdb(this.dbForm).then(res => {
          if (res.status === 201) {
            this.dialogFormVisible = false
            this.getdbdata(this.tablePage.current)
            this.getTotal()
          }
        })
      })
    },
    // 更新设备信息
    handleUpdate(idx, row) {
      this.rowmsg = row
      this.dialogFormVisible = true
      this.dialogStatus = 'update'
      this.dialogmessage = this.$t('buttons.update') + this.$t('labels.devicemanage.database')
      this.updateid = idx
    },
    updateData() {
      // 设备下的数据库是不显示所属设备的
      if (!this.ishave) {
        const temp = this.options.filter((item) => item.attributes.jz_zname === this.dbForm.jz_id)
        temp[0] ? this.dbForm.jz_id = temp[0].id : null
      }
      this.dbForm.jz = this.dbForm.jz_id
      this.$refs['ruleForm'].validate(valid => {
        if (!valid) return
        this.dialogFormVisible = false
        changedb(this.dbForm.id, this.dbForm).then(res => {
          if (res.status === 200) {
            this.tableData.splice(this.updateid, 1, res.data.data)
            this.$message({
              message: this.$t('messages.update_success'),
              type: 'success',
              duration: 1000
            })
          }
        }).catch(error => {
          console.log(error)
        })
      })
    },
    // 删除设备
    handleDelete(idx, row) {
      // 设备下历史数据下数据库信息做的操作
      this.$confirm(this.$t('strings.devicemanage.delete_database'), this.$t('labels.reminder'), confirm).then(() => {
        this.dialogFormVisible = false
        if (this.tablePage.current === 1) {
          this.deleteFunc(idx, row, this.tablePage.current)
        } else {
          let str = ''
          this.routeid ? str = '?jz_id=' + this.routeid : ''
          if (str) {
            str += '&page=' + this.tablePage.current
          } else {
            str = 'page=' + this.tablePage.current
          }
          getallhisdb(str).then(res => {
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
          message: this.$t('messages.cancel_operate'),
          type: 'info',
          duration: 1000
        })
      })
    },
    // 删除的函数
    deleteFunc(idx, row, pageNum) {
      deletedb(row.id).then(res => {
        this.getTotal()
        this.getdbdata(pageNum)
        this.$message({
          message: this.$t('messages.delete_success'),
          type: 'success',
          duration: 1000
        })
      })
    },
    // 分页器的操作
    handleCurrentChange(val) {
      this.getdbdata(val)
      this.tablePage.current = val
    },
    // 查看数据库信息详情
    handleDetail(idx, row) {
      let data = {}
      data = this.$route.query.status ? { id: row.id, status: true, isdetail: true } : { id: row.id, isdetail: true }
      this.$router.push({ path: '/deviceManage/tablemes', query: data })
    }
  }
}

</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.app-container {
  .tableBox {
    // border: 1px solid #000;
    width: 100%;
    height: 785px;
  }
}
</style>
