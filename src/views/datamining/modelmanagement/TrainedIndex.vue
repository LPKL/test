<template>
  <div>
    <el-container v-loading="listLoading" :element-loading-text="this.$t('labels.loading')" class="app_container">
      <el-header class="filter_header" style="text-align: left;margin-top:10px; font-size: 12px; display: inline-table;">
        <div class="filter-container">
          <el-input :placeholder="$t('labels.modelmanage.model_name')" v-model="searchstr" class="el-fault_device" suffix-icon="el-icon-search" @change="handleFilter(searchstr)"/>
          <!-- <el-button type="primary" @click="handleFilter(searchstr)">{{ $t('buttons.search') }}</el-button> -->
        </div>
      </el-header>
      <el-main class="main_container">
        <comp-trainedmodeltable
          :data-list="datalist"
          :list-loading="listLoading"
          :total-count="total"
          :page="listQuery.page"
          :page-length="listQuery.pageLength"
          @change = "changeData"
          @loadingFresh = "loadingFunc"
          @deleteFunc = "handleCurrentChange"/>
        <div class="pagination-container">
          <el-pagination
            :current-page="listQuery.page"
            :page-size="listQuery.limit"
            :total="listQuery.total"
            layout="total, prev, pager, next, jumper"
            @current-change="handleCurrentChange"/>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script>
// 向服务器端请求的API
import { getAllModelData, searchModel } from '@/api/datamining/model'
import TrainedModelTable from './components/TrainedModelTable'
export default {
  name: 'TrainedModel',
  components: {
    'comp-trainedmodeltable': TrainedModelTable
  },
  data() {
    return {
      // 故障列表数据
      total: 0,
      datalist: [],
      listLoading: false,
      searchstr: '',
      authlist: null,
      listQuery: {
        page: 1,
        limit: 10,
        pagelength: 0,
        total: 0
      }
    }
  },
  created() {
    const { params: { page }} = this.$route
    this.getPageTableData(parseInt(page, 10))
  },
  methods: {
    getPageTableData(val) {
      this.searchstr = ''
      const page = val || 1
      this.listQuery.page = page
      this.listLoading = true
      getAllModelData({ page }).then(res => {
        this.listLoading = false
        this.datalist = res.data.data
        this.listQuery.total = res.data.count
        this.listQuery.pagelength = this.datalist.length
        console.log(this.listQuery)
      }).catch(err => {
        console.log(err)
        this.listLoading = false
        const mes = err.response.data.detail
        mes ? this.$message.error(mes) : this.$message.error(err.message)
      })
    },
    loadingFunc(v) {
      this.listLoading = v
    },
    // 搜索
    handleFilter(val, p) {
      if (!this.searchstr) {
        this.getPageTableData()
        return
      }
      const page = p || 1
      this.listLoading = true
      searchModel({ search: this.searchstr, page }).then(res => {
        this.listLoading = false
        this.datalist = res.data.data
        this.listQuery.total = res.data.count
        this.listQuery.pagelength = this.datalist.length
      })
    },
    changeData(msg) {
      this.getPageTableData(msg)
    },
    // 点击下一页和点击页码时执行
    handleCurrentChange(val) {
      if (this.searchstr) {
        this.handleFilter(this.searchstr, val)
      } else {
        // this.getPageTableData(val)
        this.$router.push({ name: 'TrainedModel', params: { page: val }})
      }
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
@import "src/assets/styles/new-base.scss";
.app_container {
  border: 1px solid #eee;
  min-height: calc(100vh - 50px);
  padding: 16px;
  .filter_header {
    padding: 0;
    padding-bottom: 16px;
    background-color: #fff;
    width: 100%;
    height: inherit!important;
    text-align: left;
    border-radius: 16px;
    .filter-container {
      margin-left: 32px;
      padding-bottom: 0;
      .el-fault_device {
        width: 192px;
        margin: 18px 16px 0 0;
        /deep/ .el-input__inner {
          width: 192px;
          height: 36px;
          border-radius: 12px;
          border: 1px solid #e6e6e6;
          &:hover {
            border-color: #ccc;
          }
        }
      }
      .el-button {
        width: 80px;
        height: 36px;
        margin-top: 18px;
        border-radius: 14px;
        color: #fff;
        background-color: #3d65c9;
        &:hover {
          background-color: #6484d4;
        }
        &:active {
          background-color: #0f32b5;
        }
      }
    }
  }
}
</style>
