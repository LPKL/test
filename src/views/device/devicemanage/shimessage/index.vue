<template>
  <div class="app-container">
    <!--查询  -->
    <el-row>
      <el-input v-model="nodename" style="width:200px;" placeholder="源名称"/>
      <span style="margin-right: 15px;"/>
      <el-tooltip :content="$t('table.search')" class="item" placement="top" >
        <!-- <el-button v-is-show="{name:'selectorigin'}" icon="el-icon-search" circle @click="searchorigin(nodename)"/> -->
        <el-button icon="el-icon-search" circle @click="searchorigin(nodename)"/>
      </el-tooltip>
    </el-row>
    <div style="margin-bottom: 30px;"/>
    <!-- <el-button v-is-show="{name:'addtable'}" type="primary" icon="el-icon-plus" size="mini" @click="handleCreate">{{ addtable }}</el-button> -->
    <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleCreate">{{ addorigin }}</el-button>
    <div style="margin-bottom: 30px;"/>
    <!--列表-->
    <el-table
      v-loading.body="tableLoading"
      :data="tableData"
      :element-loading-text="$t('strings.loading')"
      style="width: 100%"
      border
      fit
      highlight-current-row>
      <el-table-column prop="id" label="id" width="50%" align="center">
        <template slot-scope="scope">
          <span v-text="scope.row.id"/>
        </template>
      </el-table-column>
      <el-table-column prop="node_zname" label="源名称" align="center">
        <template slot-scope="scope">
          <span v-text="scope.row.attributes.node_zname"/>
        </template>
      </el-table-column>
      <el-table-column prop="ip_port" label="ip_port" width="300%" align="center">
        <template slot-scope="scope">
          <span v-text="scope.row.attributes.ip_port"/>
        </template>
      </el-table-column>
      <el-table-column prop="kafka_topic" label="kafka_topic" align="center">
        <template slot-scope="scope">
          <span v-text="scope.row.attributes.kafka_topic"/>
        </template>
      </el-table-column>
      <el-table-column prop="jz_id" label="所属设备" align="center">
        <template slot-scope="scope">
          <span v-text="scope.row.attributes.jz_id"/>
        </template>
      </el-table-column>
      <el-table-column prop="n_input" label="n_input" align="center">
        <template slot-scope="scope">
          <span v-text="scope.row.attributes.n_input"/>
        </template>
      </el-table-column>
      <el-table-column prop="n_output" label="n_output" align="center">
        <template slot-scope="scope">
          <span v-text="scope.row.attributes.n_output"/>
        </template>
      </el-table-column>
      <el-table-column prop="slice_time" label="slice_time" align="center">
        <template slot-scope="scope">
          <span v-text="scope.row.attributes.slice_time"/>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.actions')" align="center">
        <template slot-scope="scope">
          <el-tooltip :content="$t('table.edit')" placement="top">
            <!-- <el-button v-is-show="{name:'editjz'}" size="small" type="info" icon="el-icon-edit" circle plain @click="handleUpdate(scope.$index,scope.row)"/> -->
            <el-button size="medium" type="info" icon="el-icon-edit" circle plain @click="handleUpdate(scope.$index,scope.row)"/>
          </el-tooltip>
          <el-tooltip v-if="!scope.row.attributes.is_superuser" content="删除" placement="top">
            <!-- <el-button v-is-show="{name:'deletejz'}" size="small" type="danger" icon="el-icon-delete" circle plain @click="handleDelete(scope.$index,scope.row)"/> -->
            <el-button size="medium" type="danger" icon="el-icon-delete" circle plain @click="handleDelete(scope.$index,scope.row)"/>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <!--分页-->
    <el-pagination
      :current-page="tablePage.current"
      :page-size="10"
      :total="tablePage.total"
      layout="total,prev, pager, next, jumper"
      @current-change="handleCurrentChange"/>
    <!-- 添加数据表 -->
    <el-dialog :close-on-click-modal="false" :title="dialogmessage" :visible.sync="dialogFormVisible" width="20%">
      <el-form ref="ruleForm2" :model="shiForm" status-icon label-width="100px" class="ruleForm">
        <el-form-item v-if="dialogStatus==='update'" label="id" prop="id">
          <el-input v-model="shiForm.id" disabled auto-complete="off"/>
        </el-form-item>
        <el-form-item label="实时源名称" prop="node_zname">
          <el-input v-model="shiForm.node_zname"/>
        </el-form-item>
        <el-form-item label="ip及端口号" prop="ip_port">
          <el-input v-model="shiForm.ip_port"/>
        </el-form-item>
        <el-form-item label="kafka_topic" prop="kafka_topic">
          <el-input v-model="shiForm.kafka_topic"/>
        </el-form-item>
        <el-form-item prop="jz_id" label="所属设备" >
          <el-select v-model="shiForm.jz_id" placeholder="请选择所属数据库">
            <el-option
              v-for="item in options"
              :key="item.id"
              :label="item.attributes.jz_id"
              :value="item.jz_id"/>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{ $t('table.cancel') }}</el-button>
        <el-button v-if="dialogStatus==='create'" type="primary" @click="createData">{{ $t('table.create') }}</el-button>
        <el-button v-else type="primary" @click="updateData">{{ $t('table.confirm') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getallshi } from '@/api/device'
export default {
  name: 'Shimessage',
  data() {
    return {
      nodename: '',
      addorigin: '添加源',
      allData: [],
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
      shiForm: {
        id: '',
        ip_port: '',
        kafka_topic: '',
        node_zname: '',
        jz_id: ''
      }
    }
  },
  created() {
    this.init()
  },
  methods: {
    // 初始化信息
    init() {
      this.gettabledata()
    },
    // 获取表信息
    gettabledata() {
      getallshi().then(res => {
        this.tableLoading = false
        this.allData = res.data.data
        this.options = res.data.data.slice()
        this.showdeault()
      }).catch((error) => {
        console.log(error)
      })
    },
    // 初始页面的显示
    showdeault() {
      this.tableData = this.allData.slice(0, 10)
      this.tablePage.total = this.allData.length
    },
    // 搜索对应表
    searchtorigin() {
      console.log('search')
    },
    // 添加表的操作
    handleCreate() {
      this.dialogFormVisible = true
      this.dialogStatus = 'create'
    },
    createData() {
      console.log('create')
    },
    // 更新表的操作
    handleUpdate(idx, row) {
      this.dialogFormVisible = true
      this.dialogStatus = 'update'
    },
    updateData() {
      console.log('update')
    },
    // 删除表的操作
    handleDelete(idx, row) {
      console.log(row)
    },
    // 分页器的操作
    handleCurrentChange(val) {
      console.log(val)
    }
  }
}

</script>
