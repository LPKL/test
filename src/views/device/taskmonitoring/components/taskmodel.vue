<template>
  <div class="app_container">
    <div class="filter_header">
      <div class="filter-container">
        <el-input
          v-model.trim="username"
          :placeholder="$t('rules.require_username')"
          style="width: 200px;"
          suffix-icon="el-icon-search"
          class="el-fault_device"
          clearable
          @change="searchTask"/>
          <!-- <el-button type="primary" @click="searchTask" >{{ $t('buttons.search') }}</el-button> -->
      </div>
    </div>
    <el-main class="main_container">
      <div style="height: 630px">
        <el-table
          v-loading.body="tableLoading"
          :data="tableData"
          :element-loading-text="$t('strings.loading')"
          fit
          highlight-current-row
          style="width: 100%;height:615px;overflow-y: auto;">
          <el-table-column :label="$t('labels.id')" prop="userid" width="80%" >
            <template slot-scope="scope">
              <span>{{ (tablePage.current - 1)*10 + scope.$index + 1 }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('labels.user_id')" prop="owner" >
            <template slot-scope="scope">
              <span v-text="scope.row.owner"/>
            </template>
          </el-table-column>
          <el-table-column :label="$t('labels.username')" prop="username" >
            <template slot-scope="scope">
              <span v-text="scope.row.owner_name"/>
            </template>
          </el-table-column>
          <el-table-column :label="$t('labels.task.application_id')" prop="application-id" width="300%" >
            <template slot-scope="scope">
              <span v-text="scope.row.appId"/>
            </template>
          </el-table-column>
          <el-table-column :label="$t('labels.task.experiment_name')" prop="experiment-name" width="300%" >
            <template slot-scope="scope">
              <span v-text="scope.row.category_name"/>
            </template>
          </el-table-column>
          <el-table-column :label="$t('labels.task.proxy_user')" prop="proxyuser" >
            <template slot-scope="scope">
              <span v-text="scope.row.proxyUser"/>
            </template>
          </el-table-column>
          <el-table-column :label="$t('labels.task.session_kind')" prop="session-kind" >
            <template slot-scope="scope">
              <span v-text="scope.row.kind"/>
            </template>
          </el-table-column>
          <el-table-column :label="$t('labels.status')" prop="state">
            <template slot-scope="scope">
              <span v-text="scope.row.state"/>
            </template>
          </el-table-column>
          <el-table-column :label="$t('labels.actions')" width="150%">
            <template slot-scope="scope">
              <el-tooltip :content="$t('buttons.detail')" placement="top">
                <router-link :to="{path:'/taskmonitoring/taskdetail', query: {id: scope.row.id, userid: scope.row.owner}}"><el-button size="small" type="success" icon="el-icon-tickets" circle plain/></router-link>
              </el-tooltip>
              <el-tooltip :content="$t('buttons.delete')" placement="top">
                <template>
                  <!-- <el-button type="text" @click="open2">点击打开 Message Box</el-button> -->
                  <el-button size="small" type="info" icon="el-icon-delete" circle plain @click="isDelete(scope.$index,scope.row)"/>
                </template>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pagination-container">
        <el-pagination
          :current-page="tablePage.current"
          :page-size="10"
          :total="tablePage.total"
          layout="total, prev, pager, next, jumper"
          @current-change="handleCurrentChange"/>
      </div>
    </el-main>
  </div>
</template>

<script>
import { getTaskData, deleteTaskData } from '@/api/device/taskmonitor'
export default {
  name: 'Taskmodel',
  data() {
    return {
      alltaskdata: [],
      tableData: [],
      tableLoading: false,
      tablePage: {
        current: 1,
        total: null
      },
      datamessage: [],
      device: '',
      username: '',
      count: 1
    }
  },
  created() {
    this.initData()
  },
  methods: {
    // 输入框的筛选
    querySearchAsync() {
    },
    handleSelect() {
    },
    // 初始化页面
    initData() {
      this.getTask()
    },
    //   获取显示得任务信息
    getTask() {
      this.tableLoading = true
      getTaskData().then(res => {
        this.tableLoading = false
        this.alltaskdata = res.data.datas.sessions
        this.tablePage.total = this.alltaskdata.length
        this.tableData = this.alltaskdata.slice(10 * (this.count - 1), 10 * this.count)
      }).catch(error => {
        this.tableLoading = false
        this.$message.error(this.$t('messages.request_error'))
        console.log(error)
      })
    },
    // 搜索用户
    searchTask() {
      this.tableData = []
      if (this.username === '') {
        this.getTask()
        return
      }
      this.alltaskdata.forEach(item => {
        if (item.owner_name.indexOf(this.username) >= 0) {
          this.tableData.push(item)
          return
        }
      })
      // if (this.tableData.length === 0) {
      //   this.$message({
      //     message: this.$t('messages.not_user'),
      //     type: 'error',
      //     duration: 1000
      //   })
      // }
    },
    // 删除任务
    deleteTask(idx, row) {
      console.log(row)
      const { id, session_key } = row
      deleteTaskData(id, { authuser_id: this.$store.getters.id, session_key: session_key }).then(res => {
        console.log(res)
        const { status, message } = res.data
        if (status !== 200) {
          this.$message.error(message)
          return false
        } else {
          this.alltaskdata = this.alltaskdata.filter(item => item.id !== id)
          this.tableData = this.alltaskdata.slice(10 * (this.count - 1), 10 * this.count)
          this.$message.success(message)
        }
      }).catch(error => {
        this.$message.error(this.$t('messages.delete_failed'))
        console.log(error)
      })
    },
    // 分页器页面变化时得操作
    handleCurrentChange() {
      this.count = arguments[0] ? arguments[0] : 1
      this.tablePage.current = this.count
      this.tableData = this.alltaskdata.slice(10 * (this.count - 1), 10 * this.count)
    },
    isDelete(idx, row) {
      this.$confirm(this.$t('strings.dfilemanage.delete_file'), this.$t('labels.reminder'), confirm).then(() => {
        this.deleteTask(idx, row)
      }).catch(() => {
        this.$message({
          type: 'info',
          message: this.$t('messages.cancel_operate'),
          duration: 1000
        })
      })
    }
  }
}

</script>
<style rel="stylesheet/scss" lang="scss" scoped>
@import "src/assets/styles/new-base.scss";
.task-container{
  margin: 0 20px;
  .searchmodel{
    margin: 20px 0 20px 0;
  }
  .table-box {
    min-height: 675px;
  }
  .pagination{
    margin-top: 10px;
  }
}
</style>
