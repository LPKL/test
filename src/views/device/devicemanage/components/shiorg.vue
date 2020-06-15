<template>
  <div class="app-container">
    <!--查询  -->
    <el-row>
      <el-input v-model="nodename" :placeholder="$t('labels.devicemanage.origin_name')" style="width:200px;"/>
      <span style="margin-right: 15px;"/>
      <el-tooltip :content="$t('buttons.search')" class="item" placement="top" >
        <!-- <el-button v-is-show="{name:'selectorigin'}" icon="el-icon-search" circle @click="searchorigin(nodename)"/> -->
        <el-button icon="el-icon-search" circle @click="searchorigin(nodename)"/>
      </el-tooltip>
    </el-row>
    <div style="margin-top: 30px; margin-bottom: 30px;">
      <!-- <el-button v-is-show="{name:'addtable'}" type="primary" icon="el-icon-plus" size="mini" @click="handleCreate">{{ addtable }}</el-button> -->
      <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleCreate">{{ textMap.create }}</el-button>
      <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleShiCreate">{{ textMap.shiOperate }}</el-button>
    </div>
    <!--列表-->
    <template>
      <el-table
        v-loading.body="tableLoading"
        :data="tableData"
        :element-loading-text="$t('strings.loading')"
        height="760"
        border
        fit
        highlight-current-row>
        <el-table-column :label="$t('labels.id')" prop="id" width="50" align="center">
          <template slot-scope="scope">
            <span v-text="scope.row.id"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.devicemanage.origin_name')" prop="node_zname" align="center">
          <template slot-scope="scope">
            <span v-text="scope.row.attributes.node_zname"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.devicemanage.ip_port')" prop="ip_port" align="center">
          <template slot-scope="scope">
            <span style="white-space: pre-wrap;" v-html="setNewline(scope.row.attributes.ip_port)"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.devicemanage.kafka_topic')" prop="kafka_topic" align="center">
          <template slot-scope="scope">
            <span v-text="scope.row.attributes.kafka_topic"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.devicemanage.belong_device')" prop="jz_zname" align="center">
          <template slot-scope="scope">
            <span v-text="scope.row.attributes.jz_zname"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.devicemanage.n_input')" prop="n_input" align="center">
          <template slot-scope="scope">
            <span v-text="scope.row.attributes.n_input"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.devicemanage.n_output')" prop="n_output" align="center">
          <template slot-scope="scope">
            <span v-text="scope.row.attributes.n_output"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.devicemanage.slice_time')" prop="slice_time" align="center">
          <template slot-scope="scope">
            <span v-text="scope.row.attributes.slice_time"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.actions')" width="180" align="center">
          <template slot-scope="scope">
            <el-tooltip :content="$t('buttons.edit')" placement="top">
              <!-- <el-button v-is-show="{name:'editjz'}" size="small" type="info" icon="el-icon-edit" circle plain @click="handleUpdate(scope.$index,scope.row)"/> -->
              <el-button size="medium" type="info" icon="el-icon-edit" circle plain @click="handleUpdate(scope.$index,scope.row)"/>
            </el-tooltip>
            <el-tooltip :content="$t('buttons.view')" placement="top">
              <!-- <el-button v-is-show="{name:'detailShi'}" size="small" type="info" icon="el-icon-edit" circle plain @click="handleUpdate(scope.$index,scope.row)"/> -->
              <el-button size="medium" type="success" icon="el-icon-view" circle plain @click="handledetail(scope.$index,scope.row)"/>
            </el-tooltip>
            <el-tooltip v-if="!scope.row.attributes.is_superuser" :content="$t('buttons.delete')" placement="top">
              <!-- <el-button v-is-show="{name:'deletejz'}" size="small" type="danger" icon="el-icon-delete" circle plain @click="handleDelete(scope.$index,scope.row)"/> -->
              <el-button size="medium" type="danger" icon="el-icon-delete" circle plain @click="handleDelete(scope.$index,scope.row)"/>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </template>
    <!--分页-->
    <div class="pagination">
      <el-pagination
        :current-page="tablePage.current"
        :page-size="10"
        :total="tablePage.total"
        layout="total,prev, pager, next, jumper"
        @current-change="handleCurrentChange"/>
    </div>
    <!-- 添加源 -->

    <el-dialog :title="textMap[dialogStatus]" :close-on-click-modal="false" :visible.sync="dialogFormVisible" width="400px" @open="open()">
      <el-form ref="ruleForm" :model="shiForm" :rules="rules" label-position="right" status-icon label-width="95px" class="ruleForm">
        <el-form-item v-if="dialogStatus==='update'" label="id" prop="id">
          <el-input v-model="shiForm.id" disabled auto-complete="off"/>
        </el-form-item>
        <el-form-item :label="$t('labels.devicemanage.origin_name')" prop="node_zname">
          <el-input v-model="shiForm.node_zname" auto-complete="off"/>
        </el-form-item>
        <el-form-item :label="$t('labels.devicemanage.ip_port')">
          <el-button type="text" icon="el-icon-circle-plus-outline" @click="addIpPort">{{ $t("buttons.add") }}</el-button>
        </el-form-item>
        <el-form-item
          v-for="(ipport, index) in shiForm.ip_port"
          :label="'IP&Port_' + (index+1)"
          :key="index"
          :prop="'ip_port.'+index"
          :rules="rules.ip_port">
          <el-input v-model="shiForm.ip_port[index]">
            <el-button slot="append" icon="el-icon-delete" @click.prevent="removeIpPort(index)" />
          </el-input>
        </el-form-item>
        <el-form-item :label="$t('labels.devicemanage.kafka_topic')" prop="kafka_topic">
          <el-input v-model="shiForm.kafka_topic" auto-complete="off"/>
        </el-form-item>
        <el-form-item :label="$t('labels.devicemanage.n_input')" prop="n_input">
          <el-select v-model="shiForm.n_input" :placeholder="$t('strings.select')" auto-complete="off" style="width: 100%">
            <el-option
              v-for="(item, index) in node"
              :key="index"
              :label="item"
              :value="item"/>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('labels.devicemanage.n_output')" prop="n_output">
          <el-select v-model="shiForm.n_output" :placeholder="$t('strings.select')" auto-complete="off" style="width: 100%">
            <el-option
              v-for="(item, index) in node"
              :key="index"
              :label="item"
              :value="item"/>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('labels.devicemanage.belong_device')" prop="jz_id">
          <el-select v-model="shiForm.jz_id" :placeholder="$t('strings.select')" auto-complete="off" style="width: 100%">
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
    <!-- 添加实时数据 -->
    <el-dialog :title="textMap['shiOperate']" :close-on-click-modal="false" :visible.sync="shiVisible" width="400px" @open="open1()">
      <el-form ref="ruleForm2" :model="shiForm1" :rules="rules1" status-icon label-width="80px" class="ruleForm1">
        <el-form-item :label="$t('labels.devicemanage.files')" prop="file_id">
          <el-select v-model="shiForm1.file_id" :placeholder="$t('strings.select')" auto-complete="off" style="width: 100%">
            <el-option
              v-for="(item, index) in shiFileData"
              :key="index"
              :label="item.attributes.etl_file_name"
              :value="item.id"/>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('labels.devicemanage.origin_name')" prop="node_zname" align="center">
          <el-input v-model="shiForm1.node_zname"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="shiVisible = false">{{ $t('buttons.cancel') }}</el-button>
        <el-button type="primary" @click="createShiData">{{ $t('buttons.create') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getallshi, getdeviecinfo, allshiadd, allshichange, allshidelete, getConfigFiles, addConfigFiles } from '@/api/device'
import { isUsableIp_port, validateZName } from '@/utils/validate'
import { newline } from '@/utils/index'
export default {
  name: 'Shimessage',
  data() {
    // 源名称的验证
    const node_zname = (rules, value, callback) => {
      if (!value) {
        callback(new Error(this.$t('rules.required')))
      } else if (!validateZName(value)) {
        callback(new Error(this.$t('rules.invalid_name')))
        this.shiForm.node_zname = ''
      } else {
        callback()
      }
    }
    // IP和端口号的验证
    const ip_port = (rules, value, callback) => {
      // value += ','
      // if (value === ',') {
      // 通过手动输入','方式分割多个ip的方式操作性不好，现改为多个input输入，将收入结果整合成一个string返回
      if (value === '') {
        callback(new Error(this.$t('rules.required')))
      } else if (!isUsableIp_port(value)) {
        callback(new Error(this.$t('rules.invalid_ipport')))
        // this.shiForm.ip_port = ''
      } else {
        callback()
      }
    }
    return {
      rowmsg: '',
      updateid: '',
      routeid: '',
      ishave: '',
      nodename: '',
      addorigin: this.$t('buttons.add') + this.$t('labels.devicemanage.origin'),
      addshiData: this.$t('buttons.add') + this.$t('labels.devicemanage.realtime'),
      tableData: [],
      options: [],
      tableLoading: true,
      tablePage: {
        current: 1,
        total: 0
      },
      dialogFormVisible: false,
      textMap: {
        create: this.$t('buttons.add') + this.$t('labels.devicemanage.origin'),
        update: this.$t('buttons.edit'),
        shiOperate: this.$t('buttons.add') + this.$t('labels.devicemanage.realtime')
      },
      dialogStatus: 'create',
      shiForm: {
        id: '',
        ip_port: [''],
        kafka_topic: '',
        node_zname: '',
        jz_id: '',
        n_input: '',
        n_output: ''
      },
      shiVisible: false,
      shiForm1: {
        file_id: '',
        node_zname: ''
      },
      rules: {
        node_zname: [{ validator: node_zname, trigger: 'blur', required: true }],
        ip_port: [{ validator: ip_port, trigger: 'blur', required: true }],
        kafka_topic: [{ message: this.$t('rules.required'), trigger: 'blur', required: true }],
        jz_id: [{ message: this.$t('rules.required_select'), trigger: 'change', required: true }],
        n_input: [{ message: this.$t('rules.required_select'), trigger: 'change', required: true }],
        n_output: [{ message: this.$t('rules.required_select'), trigger: 'change', required: true }]
      },
      rules1: {
        file_id: [{ message: this.$t('rules.required_select'), trigger: 'change', required: true }],
        node_zname: [{ message: this.$t('rules.required'), trigger: 'blur', required: true }]
      },
      node: [0, 1, 2, 3, 4, 5, 6],
      shiFileData: []
    }
  },
  created() {
    this.init()
  },
  methods: {
    // 为了表单输入时的验证
    open() {
      if (this.dialogStatus === 'create') {
        this.shiForm.id = 1
        this.shiForm.ip_port = ['']
        this.shiForm.kafka_topic = ''
        this.shiForm.node_zname = ''
        this.shiForm.jz_id = ''
        this.shiForm.n_input = ''
        this.shiForm.n_output = ''
        this.$nextTick(() => {
          this.$refs['ruleForm'].clearValidate()
        })
      } else {
        this.shiForm.id = this.rowmsg.id
        var all_ip_port = []
        this.rowmsg.attributes.ip_port.split(',').forEach(function(value) {
          all_ip_port.push(value)
        })
        this.shiForm.ip_port = all_ip_port
        // this.shiForm.ip_port = this.rowmsg.attributes.ip_port
        this.shiForm.kafka_topic = this.rowmsg.attributes.kafka_topic
        this.shiForm.node_zname = this.rowmsg.attributes.node_zname
        this.shiForm.jz_id = this.rowmsg.attributes.jz_zname // 此处应是所属设备的名字
        this.shiForm.n_input = this.rowmsg.attributes.n_input
        this.shiForm.n_output = this.rowmsg.attributes.n_output
        this.$nextTick(() => {
          this.$refs['ruleForm'].clearValidate()
        })
      }
    },
    // 添加实时数据的验证
    open1() {
      this.shiForm.file_id = ''
      this.node_zname = ''
      this.$nextTick(() => {
        this.$refs['ruleForm2'].resetFields() // 重置编辑表单
      })
    },
    // 初始化信息
    init() {
      this.getShidata()
      this.getAllFile()
      this.getAllDevice()
      this.getAllNum()
    },
    // 获取表信息
    getShidata(val) {
      this.routeid = this.$route.query.id ? this.$route.query.id : ''
      this.ishave = this.$route.query.status ? this.$route.query.status : false
      let str = ''
      this.routeid ? str = '?jz_id=' + this.routeid : ''
      let num = null
      val ? num = val : num = 1
      if (str) {
        str += '&page=' + num
      } else {
        str = '?page=' + num
      }
      this.tableLoading = true
      // 获取所有的实时数据
      getallshi(str).then(res => {
        this.tableLoading = false
        this.tableData = res.data.data
      }).catch((error) => {
        console.log(error)
      })
    },
    // 获取所有的设备
    getAllDevice() {
      getdeviecinfo().then(res => {
        this.options = res.data.data.slice()
      })
    },
    // 获取所有的文件
    getAllFile() {
      getConfigFiles().then(res => {
        this.shiFileData = res.data.data
      })
    },
    // 获取所有的实时数据的条数
    getAllNum() {
      let str = ''
      this.ishave ? str = '?jz_id=' + this.routeid : str = ''
      str ? str += '&get_total' : str = '?get_total'
      getallshi(str).then(res => {
        this.tablePage.total = Number(res.data.data)
      }).catch((error) => {
        console.log(error)
      })
    },
    // 搜索对应表
    searchorigin(val) {
      if (!val) {
        this.getShidata()
        return
      }
      let str = ''
      this.routeid ? str = '?jz_id=' + this.routeid : ''
      str ? str += '&node_zname=' + val : str = '?node_zname=' + val
      this.tableLoading = true
      getallshi(str).then(res => {
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
    handleShiCreate() {
      this.shiVisible = true
    },
    createData() {
      this.$refs['ruleForm'].validate(valid => {
        if (!valid) return
        this.dialogFormVisible = false
        this.shiForm.ip_port = this.shiForm.ip_port.join(',')
        allshiadd(this.shiForm).then(res => {
          this.getShidata(this.tablePage.current)
          this.getAllNum()
        })
      })
    },
    // 更新表的操作
    handleUpdate(idx, row) {
      this.dialogFormVisible = true
      this.dialogStatus = 'update'
      this.rowmsg = row
      this.updateid = idx
    },
    updateData() {
      // 若果不做设备的更新操作的话，此时的jz_id为设备的名称
      const temp = this.options.filter((item) => item.attributes.jz_zname === this.shiForm.jz_id)
      temp[0] ? this.shiForm.jz_id = temp[0].id : null
      this.$refs['ruleForm'].validate(valid => {
        if (!valid) return
        this.dialogFormVisible = false
        // ip_port数组转成字符串形式回传
        this.shiForm.ip_port = this.shiForm.ip_port.join(',')
        allshichange(this.shiForm.id, this.shiForm).then(res => {
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
      this.$confirm(this.$t('strings.devicemanage.delete_origin'), this.$t('labels.reminder'), confirm).then(() => {
        if (this.tablePage.current === 1) {
          this.deleteFunc(idx, row, this.tablePage.current)
        } else {
          let str = ''
          this.routeid ? str = '?jz_id=' + this.routeid : ''
          if (str) {
            str += '&page=' + this.tablePage.current
          } else {
            str = '?page=' + this.tablePage.current
          }
          // 获取所有的实时数据
          getallshi(str).then(res => {
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
    // 删除函数
    deleteFunc(idx, row, pageNum) {
      allshidelete(row.id).then(res => {
        this.getShidata(pageNum)
        this.getAllNum()
        this.dialogFormVisible = false
        this.$message({
          message: this.$t('messages.delete_success'),
          type: 'success',
          duration: 1000
        })
      })
    },
    // 分页器的操作
    handleCurrentChange(val) {
      this.tablePage.current = val
      this.getShidata(val)
    },
    // 实时数据的详情
    handledetail(idx, row) {
      this.$router.push({ path: '/deviceManage/tabdetail', query: { id: row.id, isShi: true }})
    },
    // 添加实时数据
    createShiData() {
      this.$refs['ruleForm2'].validate(valid => {
        if (valid) {
          this.shiVisible = false
          addConfigFiles(this.shiForm1).then(res => {
            if (res.status === 201) {
              this.$message({
                type: 'success',
                message: this.$t('messages.create_success'),
                duration: 1000
              })
              this.init()
            } else {
              this.$message({
                type: 'error',
                message: this.$t('messages.create_failed'),
                duration: 1000
              })
            }
          })
        }
      })
    },

    // ip是支持多项的，动态添加ip_port输入框
    removeIpPort(index) {
      if (this.shiForm.ip_port.length === 1) { // 不可以全部删除，至少保留一个
        console.log('only one ip&port')
        return
      }
      this.shiForm.ip_port.splice(index, 1)
    },
    addIpPort() {
      this.shiForm.ip_port.push('')
    },
    setNewline: function(content) {
      return newline(content, ',')
    }
  }
}

</script>
<style rel="stylesheet/scss" lang="scss" scoped>
  .pagination {
    margin-top: 10px;
  }
</style>
