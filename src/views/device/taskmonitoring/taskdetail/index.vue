<template>
  <div class="detail_contain">
    <div class="detail_box">
      <el-table
        v-loading.body="tableLoading"
        :data="detailData"
        :element-loading-text="$t('strings.loading')"
        border
        fit
        show-header
        highlight-current-row>
        <el-table-column prop="id" label="id" width="50%">
          <template slot-scope="scope">
            <span v-text="scope.row.id"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.task.command')" prop="code">
          <template slot-scope="scope">
            <el-popover
              :content="scope.row.code"
              trigger="hover"
              placement="bottom"
              style="display: inline-block;margin-left: 20px"
              width="400">
              <!-- <el-alert :closable="false" type="message" title="code详情">
                <div class="tripMessage">{{ scope.row.code }}</div>
              </el-alert> -->
              <div slot="reference" >
                <el-tag style="margin-left: -20px;">{{ $t('labels.task.view_command') }}</el-tag>
              </div>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.dfilemanage.file')" prop="file_name">
          <template slot-scope="scope">
            <span v-text="scope.row.file_name"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.dfilemanage.file_id')" prop="file_id">
          <template slot-scope="scope">
            <span v-text="scope.row.file_id?scope.row.file_id:'无'"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.devicemanage.device_id')" prop="jz_id">
          <template slot-scope="scope">
            <span v-text="scope.row.jz_id?scope.row.jz_id:'无'"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.devicemanage.device_name')" prop="jz_name">
          <template slot-scope="scope">
            <span v-text="scope.row.jz_name"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.status')" prop="state">
          <template slot-scope="scope">
            <span v-text="scope.row.state"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.task.progress')" prop="progress">
          <template slot-scope="scope">
            <!-- <span v-text="scope.row.output.data.text/plain"/> -->
            <el-progress :text-inside="true" :stroke-width="18" :percentage="Number((100*scope.row.progress).toFixed(2))"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.task.result_state')" prop="status">
          <template slot-scope="scope">
            <span v-if="scope.row.output" v-text="scope.row.output.status"/>
            <span v-else >-</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('labels.task.result')" prop="output">
          <template slot-scope="scope">
            <el-button type="text" @click="dialogOutput(scope.$index)">{{ $t('labels.task.view_results') }}</el-button>
            <el-dialog
              :visible.sync="dialogOutputVisible"
              :title="$t('labels.task.result')"
              :close-on-click-modal="false"
              width="60%"
              class="new-dialog">
              <div v-for="(item, index) in scopeoutput" :key="index"><div>{{ index }}:</div><el-tag style="height: inherit;"><div style="white-space:normal">{{ item }}</div></el-tag></div>
              <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="dialogOutputVisible = false">{{ $t('buttons.confirm') }}</el-button>
              </span>
            </el-dialog>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-pagination
      :current-page="tablePage.current"
      :page-size.sync="tablePage.pagesize"
      :total="tablePage.total"
      layout="total, prev, pager, next, jumper"
      class="pagination"
      @current-change="handleCurrentChange"/>
    <div style="margin-top:10px"/>
  </div>
</template>

<script>

import { getTaskData } from '@/api/device/taskmonitor'
export default {
  name: 'Taskdetail',
  data() {
    return {
      allData: [],
      detailData: [],
      tablePage: {
        current: 1,
        total: null,
        pagesize: 10 // 分页数
      },
      scopeoutput: null,
      tableLoading: false,
      count: 1,
      timer: null,
      dialogOutputVisible: false,
      pgTimer: null
    }
  },
  created() {
    this.initData()
  },
  beforeDestroy() {
    clearInterval(this.timer)
    this.timer = null
  },
  methods: {
    // 初始化数据
    initData() {
      this.getDataDetail()
    },
    // 获取详情信息
    getDataDetail() {
      this.tableLoading = true
      this.progressNow()
    },
    // 分页器换页按钮
    handleCurrentChange() {
      this.count = arguments[0] ? arguments[0] : 1
      this.tablePage.current = this.count

      this.tableLoading = true
      this.pgTimer = setTimeout(() => {
        this.tableLoading = false
        this.detailData = this.allData.slice(this.tablePage.pagesize * (this.count - 1), this.tablePage.pagesize * this.count)
        clearTimeout(this.pgTimer)
      }, 500)
    },
    // 实时跟新进度条变化
    progressNow() {
      const { id, userid } = this.$route.query
      this.timer = setInterval(() => {
        getTaskData(id, { authuser_id: userid }).then(res => {
        // getTaskDetail(id, userid).then(res => {
          this.tableLoading = false
          const { status, datas: { statements }} = res.data
          if (status === 200) {
            this.allData = statements
            this.tablePage.total = this.allData.length ? this.allData.length : 0
            this.detailData = this.allData.slice(this.tablePage.pagesize * (this.count - 1), this.tablePage.pagesize * this.count)
            this.progressNow()
          }
        }).catch(error => {
          this.tableLoading = false
          clearInterval(this.timer)
          console.log(error)
        })
        // 清除定时器
        clearInterval(this.timer)
      }, 2000)
    },
    dialogOutput(index) {
      this.dialogOutputVisible = true
      const count = this.tablePage.pagesize * (this.tablePage.current - 1) + index
      this.scopeoutput = this.allData[count].output
    }
  }
}

</script>
<style rel="stylesheet/scss" lang="scss" scoped>
@import "src/assets/styles/new-base.scss";
.detail_contain{
  padding: 20px;
  .detail_box {
    margin-bottom: 10px;
    min-height: 600px;
  }
  .tripMessage{
    white-space: break-word;
    width:200px!important;
  }
}
</style>
