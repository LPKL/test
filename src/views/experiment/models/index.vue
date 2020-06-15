<template>
  <div v-loading="listLoading" :element-loading-text="this.$t('labels.loading')" class="app_container">
    <div class="filter_header" style="text-align: left;margin-top:10px; font-size: 12px; display: inline-table;">
      <div class="filter-container">
        <el-input :placeholder="$t('labels.flow.process_name')" v-model="listQuery.title" suffix-icon="el-icon-search" class="el-fault_device" @change="handleFilter(1)"/>
        <router-link :title="$t('buttons.dflowmanage.backflow')" to="/newmodel/index" class="link" >
          <svg-icon icon-class="flow_next_active" class="svg-next" />
        </router-link>
      </div>
    </div>
    <el-main class="main_container">
      <his-table
        :data-list="datalist.dlist"
        :list-loading="listLoading"
        :page="listQuery.page"
        @chenge = "changeData" />
      <div class="pagination-container">
        <el-pagination
          :current-page="listQuery.page"
          :page-size="listQuery.limit"
          :total="listQuery.total"
          layout="total, prev, pager, next, jumper"
          @current-change="handleCurrentChange"/>
      </div>
    </el-main>
  </div>
</template>

<script>
import { getManageModelProjects, filterShiProject, filterDataProject } from '@/api/experiment'
import HisTable from './components/HisTable'
import debounce from 'lodash/debounce'

export default {
  name: 'DflowManage',
  components: {
    HisTable
  },

  data() {
    return {
      tableKey: 0,
      list: null,
      fileList: null,
      datalist: {
        dlist: [],
        listShi: []
      },
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        importance: null,
        title: '',
        type: '',
        sort: '+id',
        total: 0
      },
      dataAllData: [],
      shiAllData: [],
      hisPage: 1,
      shiPage: 1,
      hisTotal: 0,
      shiTotal: 0,
      searchStatus: '',
      hisPageLength: null,
      shiPageLength: null
    }
  },
  created() {
    this.getShowData()
  },
  methods: {
    // 获取数据
    getShowData(p) {
      this.searchStatus = ''
      const page = p || 1
      // 数据流程获取数据
      const tempObj = { page }
      getManageModelProjects(tempObj).then(res => {
        this.returnDataList(res)
      }).catch(() => {
        this.listLoading = false
        this.$message.error(this.$t('labels.getFaild'))
      })
    },
    returnDataList(data) {
      this.dataAllData = data.data.data
      this.hisPageLength = data.data.data.length
      this.hisTotal = data.data.count
      this.defauleShow()
    },
    defauleShow() {
      this.listLoading = true
      const timer = setTimeout(() => {
        this.listLoading = false
        clearTimeout(timer)
      }, 500)
      this.showDefaultData()
    },
    // 数据流程的获取
    getDataProject() {
      this.listLoading = true
      const tempObj = { page: this.hisPage }
      getManageModelProjects(tempObj).then(res => {
        this.listLoading = false
        this.returnDataList(res)
      }).catch(() => {
        this.listLoading = false
        this.$message.error(this.$t('labels.getFaild'))
      })
    },
    // 搜索 1
    handleFilter: debounce(function(node, status) {
      this.listLoading = true
      if (this.listQuery.title === '') {
        this.getDataProject()
        return
      }
      const page = node || 1
      const temp = { search: this.listQuery.title, user: this.$store.state.user.id, page }
      // 数据流程下的搜索
      this.dataSearchFunc(temp)
    }, 500),
    // 数据流程的索操作
    dataSearchFunc(val) {
      this.searchStatus = 'filter'
      filterDataProject(val).then(res => {
        this.returnDataList(res)
      }).catch(() => {
        this.listLoading = false
        this.$message.error(this.$t('labels.getFaild'))
      })
    },
    // 实时流程的搜索操作
    projectSearchFunc(val) {
      this.searchStatus = 'fliter'
      filterShiProject(val).then(res => {
        this.returnDataList(res)
      }).catch(() => {
        this.listLoading = false
        this.$message.error(this.$t('labels.getFaild'))
      })
    },
    // 分页操作
    handleCurrentChange(val) {
      // 搜索的分页
      if (this.searchStatus === 'filter') {
        // 数据流程下搜索的分页
        this.hisPage = val
        this.listQuery.page = val
        this.handleFilter(val)
      } else {
        // 获取数据的分页
        // 执行数据流程的获取数据
        this.listQuery.page = val
        this.hisPage = val
        this.getDataProject()
      }
    },
    // 显示默认页的数据
    showDefaultData() {
      // 数据流程
      this.datalist.dlist = this.dataAllData
      this.listQuery.total = this.hisTotal
      this.listQuery.page = this.hisPage
    },
    // 删除数据时，重新获取当前页的数据
    changeData(msg) {
      if (this.searchStatus === 'filter') {
        this.handleFilter(this.listQuery.page)
      } else {
        // 当删除到当前页只剩下一条的时候，继续删除，跳转到前一页
        if (this.hisPageLength === 1 && this.listQuery.page !== 1) {
          this.listQuery.page = this.listQuery.page - 1
          this.hisPage = this.hisPage - 1
          this.getDataProject()
          return
        }
        this.getDataProject()
      }
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
@import "src/assets/styles/new-base.scss";
  $cpadd:10px;
  $padleft: 20px;
  .app_container{
    .filter_header{
      position: relative;
      .filter-container{
        .link{
          color: #2ca0d7;
          position: absolute;
          right: 30px;
          height: 20px;
          line-height: 20px;
          top: 0;
          bottom:0;
          margin: auto
        }
      }
    }
    .svg-next {
      font-size: 22px;
      cursor: pointer;
    }
  }
</style>
