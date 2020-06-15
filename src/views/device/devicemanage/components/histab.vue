<template>
  <div class="app-container">
    <!--查询  -->
    <el-row>
      <el-input v-model="tablename" :placeholder="$t('labels.devicemanage.datatable_name')" style="width:200px;"/>
      <span style="margin-right: 15px;"/>
      <el-tooltip :content="$t('table.search')" class="item" placement="top" >
        <!-- <el-button v-is-show="{name:'selecttable'}" icon="el-icon-search" circle @click="searchtable(tablename)"/> -->
        <el-button icon="el-icon-search" circle @click="searchtable(tablename)"/>
      </el-tooltip>
    </el-row>
    <div style="margin-bottom: 30px;"/>
    <!-- <el-button v-is-show="{name:'addtable'}" type="primary" icon="el-icon-plus" size="mini" @click="handleCreate">{{ addtable }}</el-button> -->
    <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleCreate">{{ addtable }}</el-button>
    <div style="margin-bottom: 30px;"/>
    <!--列表-->
    <div class="tabtableBox">
      <el-table
        v-loading.body="tableLoading"
        :data="tableData"
        :element-loading-text="$t('strings.loading')"
        style="width: 100%"
        height="760"
        border
        fit
        highlight-current-row>
        <el-table-column :label="$t('labels.id')" prop="id" width="50%" align="center">
          <template slot-scope="scope">
            <span v-text="scope.row.id"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.devicemanage.datatable_name')" prop="table_zname" align="center">
          <template slot-scope="scope">
            <span v-text="scope.row.attributes.table_zname"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.devicemanage.datatable_name_en')" prop="table_name" width="250%" align="center">
          <template slot-scope="scope">
            <span v-text="scope.row.attributes.table_name"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.devicemanage.datatable_type')" prop="table_datatype" align="center">
          <template slot-scope="scope">
            <span v-text="scope.row.attributes.table_datatype"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.devicemanage.belong_database')" prop="db_zname" align="center">
          <template slot-scope="scope">
            <span v-text="scope.row.attributes.db_zname"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.devicemanage.table_datanums')" prop="table_datanums" align="center">
          <template slot-scope="scope">
            <span v-text="scope.row.attributes.table_datanums"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.devicemanage.table_datatype')" prop="table_datatype" align="center">
          <template slot-scope="scope">
            <span v-text="scope.row.attributes.table_datatype"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.devicemanage.table_yszid')" prop="table_yszid" align="center">
          <template slot-scope="scope">
            <span v-text="scope.row.attributes.table_yszid"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.devicemanage.workcon_fieldids')" prop="workcon_fieldids" align="center">
          <template slot-scope="scope">
            <span v-text="scope.row.attributes.workcon_fieldids"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.actions')" width="200%" align="center">
          <template slot-scope="scope">
            <el-tooltip :content="$t('buttons.edit')" placement="top">
              <!-- <el-button v-is-show="{name:'editjz'}" size="small" type="info" icon="el-icon-edit" circle plain @click="handleUpdate(scope.$index,scope.row)"/> -->
              <el-button size="medium" type="info" icon="el-icon-edit" circle plain @click="handleUpdate(scope.$index,scope.row)"/>
            </el-tooltip>
            <el-tooltip :content="$t('buttons.detail')" placement="top">
              <!-- <el-button v-is-show="{name:'tabdetail'}" size="small" type="success" icon="el-icon-tickets" circle plain @click="handleDetail(scope.$index,scope.row)"/> -->
              <el-button size="medium" type="success" icon="el-icon-view" circle plain @click="handleDetail(scope.$index,scope.row)"/>
            </el-tooltip>
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
    <!-- 添加数据表 -->
    <el-dialog :title="textMap[dialogStatus]" :close-on-click-modal="false" :visible.sync="dialogFormVisible" width="400px" @open="open()">
      <el-form ref="ruleForm" :model="tableForm" :rules="rules" status-icon label-width="135px" class="ruleForm">
        <el-form-item v-if="dialogStatus==='update'" label="id" prop="id">
          <el-input v-model="tableForm.id" disabled auto-complete="off"/>
        </el-form-item>
        <el-form-item :label="$t('labels.devicemanage.datatable_name')" prop="table_zname">
          <el-input v-model="tableForm.table_zname" auto-complete="off"/>
        </el-form-item>
        <el-form-item :label="$t('labels.devicemanage.datatable_name_en')" prop="table_name">
          <el-input v-model="tableForm.table_name" auto-complete="off"/>
        </el-form-item>
        <el-form-item :label="$t('labels.devicemanage.belong_database')" prop="db_id" >
          <el-select v-model="tableForm.db_id" :placeholder="$t('strings.select')" style="width: 100%">
            <el-option
              v-for="(item, index) in options"
              :key="index"
              :label="item.attributes.db_zname"
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
import { getallshitab, addtab, getallhisdb, changetab, deletetab, testtableEname } from '@/api/device'
import { validateZName, validateEName } from '@/utils/validate'
export default {
  name: 'Tableinfo',
  data() {
    // 数据表名的验证
    const checktabzname = (rule, value, callback) => {
      if (!value) {
        callback(new Error(this.$t('rules.required')))
      } else if (!validateZName(value)) {
        callback(new Error(this.$t('rules.invalid_datatable')))
        this.tableForm.table_zname = ''
      } else {
        callback()
      }
    }
    // 数据表英文名的验证
    const checktabname = (rule, value, callback) => {
      if (!value) {
        callback(new Error(this.$t('rules.required')))
      } else if (!validateEName(value)) {
        callback(new Error(this.$t('rules.invalid_name_en')))
        this.tableForm.table_name = ''
      } else if (value === this.defaultName) {
        callback()
      } else {
        testtableEname(value).then(res => {
          if (res.status === 202) {
            callback(new Error(this.$t('rules.duplicate_name')))
            this.tableForm.table_name = ''
          } else if (res.status === 200) {
            callback()
          }
        })
      }
    }
    const checktabdb = (rule, value, callback) => {
      if (!value) {
        callback(new Error(this.$t('rules.required_select')))
      } else {
        callback()
      }
    }
    return {
      rowmsg: [],
      updateid: '',
      routeid: '',
      dbDetail: '',
      ishave: '',
      tablename: '',
      defaultName: '',
      addtable: this.$t('buttons.add') + this.$t('labels.devicemanage.datatable'),
      tableData: [],
      options: [],
      tableLoading: true,
      tablePage: {
        current: 1,
        total: 0
      },
      dialogmessage: '',
      dialogFormVisible: false,
      dialogStatus: 'create',
      textMap: {
        create: this.$t('buttons.add') + this.$t('labels.devicemanage.datatable'),
        update: this.$t('buttons.update') + this.$t('labels.devicemanage.datatable')
      },
      tableForm: {
        id: '',
        table_name: '',
        table_zname: '',
        db_zname: '',
        db_id: ''
      },
      rules: {
        table_zname: [{ validator: checktabzname, trigger: 'blur', required: true }],
        table_name: [{ validator: checktabname, trigger: 'blur', required: true }],
        db_id: [{ validator: checktabdb, trigger: 'change', required: true }]
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
        this.tableForm.id = 1
        this.tableForm.table_name = ''
        this.tableForm.table_zname = ''
        this.tableForm.db_zname = ''
        this.tableForm.db_id = ''
        this.$nextTick(() => {
          this.$refs['ruleForm'].clearValidate()
        })
      } else {
        this.tableForm.id = this.rowmsg.id
        this.tableForm.db_zname = this.rowmsg.attributes.db_zname
        this.tableForm.db_id = this.rowmsg.attributes.db_id
        this.tableForm.table_name = this.rowmsg.attributes.table_name
        this.tableForm.table_zname = this.rowmsg.attributes.table_zname
        this.defaultName = this.rowmsg.attributes.table_name
        this.$nextTick(() => {
          this.$refs['ruleForm'].clearValidate()
        })
      }
    },
    // 初始化信息
    init() {
      this.gettabledata()
      this.getAll()
      this.getTotal()
    },
    // 获取表信息
    gettabledata(val) {
      this.routeid = this.$route.query.id ? this.$route.query.id : ''
      this.ishave = this.$route.query.status ? this.$route.query.status : false
      this.dbDetail = this.$route.query.isdetail ? this.$route.query.isdetail : ''
      let str = ''
      if (this.dbDetail) {
        str = '?database_id=' + this.routeid
      } else {
        this.ishave ? str = '?jz_id=' + this.routeid : str = ''
      }
      let num = null
      val ? num = val : num = 1
      if (str) {
        str += '&page=' + num
      } else {
        str = '?page=' + num
      }
      this.tableLoading = true
      getallshitab(str).then(res => {
        this.tableLoading = false
        this.tableData = res.data.data
      }).catch((error) => {
        console.log(error)
      })
    },
    // 为下拉框准备
    getAll() {
      getallhisdb().then(res => {
        this.options = res.data.data.slice()
      })
    },
    // 获取所有的数据的条数
    getTotal() {
      let str = ''
      if (this.dbDetail) {
        str = '?database_id=' + this.routeid
      } else {
        this.ishave ? str = '?jz_id=' + this.routeid : str = ''
      }
      str ? str += '&get_total' : str = '?get_total'
      getallshitab(str).then(res => {
        this.tablePage.total = Number(res.data.data)
      }).catch((error) => {
        console.log(error)
      })
    },
    // 搜索对应表
    searchtable(val) {
      if (!val) {
        this.gettabledata()
        return
      }
      let str = ''
      if (this.dbDetail) {
        str = '?database_id=' + this.routeid
      } else {
        this.ishave ? str = '?jz_id=' + this.routeid : str = ''
      }
      str ? str += '&table_zname=' + val : str = '?table_zname=' + val
      this.tableLoading = true
      getallshitab(str).then(res => {
        this.tableLoading = false
        this.tableData = res.data.data
      })
      this.tablePage.total = 1
    },
    // 添加表的操作
    handleCreate() {
      this.dialogFormVisible = true
      this.dialogStatus = 'create'
    },
    createData() {
      const temp = this.options.filter((item) => item.id === this.tableForm.db_id)
      temp[0] ? this.tableForm.db_zname = temp[0].db_zname : null
      this.$refs['ruleForm'].validate(valid => {
        if (!valid) return
        addtab(this.tableForm).then(res => {
          if (res.status === 201) {
            this.dialogFormVisible = false
            this.gettabledata(this.tablePage.current)
            this.getTotal()
          }
        })
      })
    },
    // 更新表的操作
    handleUpdate(idx, row) {
      this.rowmsg = row
      this.dialogFormVisible = true
      this.dialogStatus = 'update'
      this.updateid = idx
    },
    updateData() {
      const temp = this.options.filter((item) => item.id === this.tableForm.db_id)
      this.tableData[this.updateid].attributes.db_zname = temp.db_zname
      this.$refs['ruleForm'].validate(valid => {
        if (!valid) return
        this.dialogFormVisible = false
        changetab(this.tableForm.id, this.tableForm).then(res => {
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
    // 删除表的操作
    handleDelete(idx, row) {
      // 历史数据下对其数据库信息做的操作
      this.$confirm(this.$t('strings.devicemanage.delete_datatable'), this.$t('labels.reminder'), confirm).then(() => {
        if (this.tablePage.current === 1) {
          this.deleteFunc(idx, row, this.tablePage.current)
        } else {
          let str = ''
          if (this.dbDetail) {
            str = '?database_id=' + this.routeid
          } else {
            this.ishave ? str = '?jz_id=' + this.routeid : str = ''
          }
          if (str) {
            str += '&page=' + this.tablePage.current
          } else {
            str = '?page=' + this.tablePage.current
          }
          getallshitab(str).then(res => {
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
      deletetab(row.id).then(res => {
        if (res.status === 204) {
          this.dialogFormVisible = false
          this.gettabledata(pageNum)
          this.getTotal()
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
      this.gettabledata(val)
    },
    // 数据表的详情
    handleDetail(idx, row) {
      this.$router.push({ path: '/deviceManage/tabdetail', query: { id: row.id }})
    }
  }
}

</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.tabtableBox {
  width: 100%;
  height: 770px;
}
</style>
