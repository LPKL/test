<template>
  <div class="app_container">
    <!--<div class="el-top_title">{{ $t('strings.faultmanage.fault_center') }}</div>-->
    <el-header class="filter_header">
      <!-- 与子组件filter.vue交互传值 -->
      <comp-filter
        ref="filter"
        :template-list="templateList"
        :fault-state="faultStatusData"
        @search="getFilterData"
        @settemplate="setDefaultReportTemplate"
        @restore="restoreTable"
        @changeStatus="changeTabStatus"/>
    </el-header>
    <el-main class="main_container">
      <el-tabs v-model="tabStatus" @tab-click="tabChange">
        <!-- 全部 -->
        <el-tab-pane :label="$t('labels.faultmanage.un_resolve')" name="unresolved">
          <comp-logtable
            :data-list="datalist"
            :list-loading="listLoading"
            :alarm-arr="alarmCodeArr"
            :template-list="templateList"
            :template-data="selected_template"
            :page="listQuery.page"
            @chenge = "changeData"
            @freshData="fresh"
            @loading="loadingFunc"/>
        </el-tab-pane>
        <el-tab-pane :label="$t('labels.faultmanage.resolved')" name="resolved">
          <comp-logtable
            :data-list="datalist"
            :list-loading="listLoading"
            :alarm-arr="alarmCodeArr"
            :template-list="templateList"
            :template-data="selected_template"
            @chenge = "changeData"
            @freshData="fresh"
            @loading="loadingFunc"/>
        </el-tab-pane>
        <el-tab-pane :label="$t('labels.faultmanage.all')" name="all">
          <comp-logtable
            :data-list="datalist"
            :list-loading="listLoading"
            :alarm-arr="alarmCodeArr"
            :template-list="templateList"
            :template-data="selected_template"
            @chenge = "changeData"
            @freshData="fresh"
            @loading="loadingFunc"/>
        </el-tab-pane>
      </el-tabs>
      <div class="pagination-container">
        <el-pagination
          :current-page="listQuery.page"
          :page-size="listQuery.limit"
          :total="listQuery.totalCount"
          layout="total, prev, pager, next, jumper"
          @current-change="handleCurrentChange"/>
      </div>
    </el-main>
  </div>
</template>

<script>
// 向服务器端请求的API
// import { faultDataList, faultDataListCount, faultTypeList, faultModelList, faultData } from '@/api/device/fault'
import { getRealTimeOrigin } from '@/api/datamining/real/realorigin'
import { faultData, faultSearch } from '@/api/device/fault'
import waves from '@/directive/waves' // 水波纹指令
import LogTable from './components/tables/LogTable'
import Filter from './components/tables/Filter'
// import { getdeviecinfo } from '@/api/device'
import { getFaultCodesData } from '@/api/device/alarm'
import { getTemplates } from '@/api/report/template'
import debounce from 'lodash/debounce'
export default {
  name: 'FaultManagement',
  directives: {
    waves
  },
  components: {
    // 故障数据表格
    'comp-logtable': LogTable,
    'comp-filter': Filter
  },
  data() {
    return {
      // 筛选中故障类型筛选项
      faultTypes: [],
      selectFaultType: '',
      // 筛选中故障模型筛选项
      faultModels: [],
      selectFaultModel: '',
      // 筛选汇总设备索引项
      devices: [],
      selectDevice: '',
      selectFaultDateTime: [],
      // 故障列表数据
      datalist: [],
      // hud
      listLoading: false,
      // 分页
      listQuery: {
        page: 1,
        limit: 10,
        sort: '+id',
        totalCount: 0
      },
      // 未解决
      unresolved_page: 1,
      unresolved_total: 0,
      // 已解决
      resolved_page: 1,
      resolved_total: 0,
      // 全部
      all_page: 1,
      all_total: 0,
      allDevice: [],
      // 修改开始
      tabStatus: 'unresolved',
      alarmCodeArr: [],
      searchForm: {},
      searchStatus: false,
      templateList: [], // 模板列表
      selected_template: 0,
      faultStatusData: [
        { label: this.$t('strings.faultmanage.unprocessed'), value: 'unprocessed' },
        { label: this.$t('strings.faultmanage.processing'), value: 'processing' }
      ]
    }
  },
  created() {
    this.getAlarmCodeData()
    this.getData(1, 'unresolved')
    this.getTemplatesData()
    // 加载界面后向服务器请求获取所有故障列表
    // this.getPageTableData(this.listQuery.page, this.selectDevice, this.selectFaultType, this.selectFaultModel, this.selectFaultDateTime[0], this.selectFaultDateTime[1])

    // // 加载界面后向服务器请求获取故障类型列表
    // faultTypeList({ 'user_name': this.username }).then(res => {
    //   const faultTypeData = res.data.data
    //   this.faultTypes = faultTypeData
    // })
    // // 加载界面后向服务器请求获取故障模型列表
    // faultModelList({ 'user_name': this.username }).then(res => {
    //   const faultModelData = res.data.data
    //   this.faultModels = faultModelData
    // })
    // // 加载界面后向服务器请求获取设备
    // dataJzList({ 'user_name': this.username }).then(res => {
    //   debugger
    //   const jzdata = res.data.data
    //   this.devices = jzdata
    // })
    // // 获取所有的机组信息
    // getdeviecinfo().then(res => {
    //   this.allDevice = res.data.data
    // })
    // 获取源数据用作故障设备
    getRealTimeOrigin().then(res => {
      this.devices = res.data.data
    })
  },
  methods: {
    // 获取数据
    getData(p, resolve) {
      this.listLoading = true
      const page = p || 1
      const temp = `&resolve=${resolve}`
      const str = `?page=${page + temp}`
      faultData(str).then(res => {
        this.listLoading = false
        this.datalist = res.data.data
        this.listQuery.totalCount = res.data.count
      }).catch(e => {
        console.log(e)
        this.$message.error(this.$t('labels.getFaild'))
      })
    },
    // 获取故障代码
    getAlarmCodeData() {
      getFaultCodesData().then(res => {
        const data = res.data.data || []
        this.alarmCodeArr = data.map(item => {
          const str = [item.code, ' ', item.name].join('')
          return {
            id: item.id,
            name: str,
            opinion: item.opinion,
            reason: item.reason
          }
        })
      }).catch(e => {
        console.log(e)
        this.$message.error(this.$t('labels.faultmanage.get_alarmCode_arror'))
      })
    },
    getTemplatesData() {
      // 模板列表，模板列表显示的是所有公共模板和个人模板
      this.templateList = []
      getTemplates({ 'type': 'enterprise' }).then(res => {
        const data = res.data.data
        for (var each_template of data) {
          this.templateList.push({ 'value': each_template.id, 'label': each_template.name })
        }
        if (this.templateList.length > 0 && this.selected_template === 0) {
          this.selected_template = this.templateList[0].value
        }
      }).catch(error => {
        console.log('getTemplate enterprise', error)
      })
      getTemplates({ 'type': 'personal', 'auth_user': this.$store.state.user.id }).then(res => {
        const data1 = res.data.data
        for (var each_template1 of data1) {
          this.templateList.push({ 'value': each_template1.id, 'label': each_template1.name })
        }
      }).catch(error => {
        console.log('getTemplate personal error', error)
      })
    },
    // 搜索下拉框改变的时候，改变tab状态
    changeTabStatus(val) {
      this.tabStatus = val
    },
    // 搜索数据
    searchData(p, resolve) {
      this.searchStatus = true
      this.listLoading = true
      const page = p || 1
      const temp = `&resolve=${resolve}`
      const str = `?page=${page + temp}`
      faultSearch(str).then(res => {
        this.listLoading = false
        this.datalist = res.data.data
        this.listQuery.totalCount = res.data.count
      }).catch(e => {
        console.log(e)
        this.$message.error(this.$t('labels.getFaild'))
      })
    },
    // 页面loading
    loadingFunc(val) {
      this.listLoading = val
    },
    fresh() {
      this.getData(1, this.tabStatus)
    },
    // 向服务器请求故障列表代码封装在函数内，方便调用
    // getPageTableData: function(PageNum, JzId, LevelId, ModelId, StartTime, EndTime) {
    //   faultDataList({
    //     'user_name': this.username,
    //     'page': PageNum,
    //     'jz': JzId,
    //     'level': LevelId,
    //     'model': ModelId,
    //     'start_time': StartTime,
    //     'end_time': EndTime }).then(res => {
    //     const data = res.data.data
    //     this.datalist = data
    //     this.listLoading = false
    //   }).catch(error => {
    //     console.log(error)
    //     this.listLoading = false
    //   })
    //   faultDataListCount({
    //     'user_name': this.username,
    //     'page': PageNum,
    //     'jz': JzId,
    //     'level': LevelId,
    //     'model': ModelId,
    //     'start_time': StartTime,
    //     'end_time': EndTime }).then(res => {
    //     const data = res.data.data
    //     // console.log('faultmanagement created faultDataList data count', data)
    //     this.totalCount = Number(data)
    //   }).catch(error => {
    //     console.log(error)
    //     this.listLoading = false
    //   })
    // },
    // 子组件向父组件传多值
    getFilterData: debounce(function(node, status) {
      const page = status || 1
      this.searchForm = JSON.parse(JSON.stringify(node))
      const state = node.state
      this.listQuery.page = page
      let str = ''
      for (const key in node) {
        str += `&${key}=${node[key]}`
      }
      // 未解决unresolved
      if (!state) {
        const temp = this.tabStatus + str
        this.searchData(this.listQuery.page, temp)
      } else if (state === 'unprocessed' || state === 'processing') {
        const temp = `unresolved${str}`
        this.searchData(this.unresolved_page, temp)
      // 已解决resolved
      } else if (state === 'processed' || state === 'fault_free') {
        const temp = `resolved${str}`
        this.searchData(this.resolved_page, temp)
      }
    }),
    // 清空的时候重新获取当前页的数据
    restoreTable: debounce(function() {
      this.listLoading = true
      this.searchStatus = false
      this.searchForm = {}
      this.tabStatus = 'unresolved'
      this.fresh()
    }, 500),
    // 点击下一页和点击页码时执行
    handleCurrentChange(val) {
      this.listQuery.page = val
      // 未解决
      if (this.tabStatus === 'unresolved') {
        this.unresolved_page = val
        if (this.searchStatus) {
          this.getFilterData(this.searchForm, val)
          return
        }
        this.getData(this.unresolved_page, 'unresolved')
      // 已解决
      } else if (this.tabStatus === 'resolved') {
        this.resolved_page = val
        if (this.searchStatus) {
          this.getFilterData(this.searchForm, val)
          return
        }
        this.getData(this.resolved_page, 'resolved')
      } else {
      // 全部
        this.all_page = val
        if (this.searchStatus) {
          this.getFilterData(this.searchForm, val)
          return
        }
        this.getData(this.all_page, 'all')
      }
    },
    changeData(msg) {
      this.getPageTableData(this.listQuery.page, this.selectDevice, this.selectFaultType, this.selectFaultModel, this.selectFaultDateTime[0], this.selectFaultDateTime[1])
    },
    // tab切换的时候触发
    tabChange(tab, event) {
      this.listQuery.page = 1
      this.tabStatus = tab.name
      this.listLoading = true
      this.$refs['filter'].resetForm()
      if (this.tabStatus === 'unresolved') {
        this.faultStatusData = [
          { label: this.$t('strings.faultmanage.unprocessed'), value: 'unprocessed' },
          { label: this.$t('strings.faultmanage.processing'), value: 'processing' }
        ]
        if (this.searchStatus) {
          this.getFilterData(this.searchForm)
          return
        }
        this.listQuery.page = 1
        this.unresolved_page = 1
        this.getData(this.unresolved_page, 'unresolved')
      } else if (this.tabStatus === 'resolved') {
        this.faultStatusData = [
          { label: this.$t('strings.faultmanage.processed'), value: 'processed' },
          { label: this.$t('strings.faultmanage.fault_free'), value: 'fault_free' }
        ]
        if (this.searchStatus) {
          this.getFilterData(this.searchForm)
          return
        }
        this.listQuery.page = 1
        this.resolved_page = 1
        this.getData(this.resolved_page, 'resolved')
      } else {
        this.faultStatusData = [
          { label: this.$t('strings.faultmanage.unprocessed'), value: 'unprocessed' },
          { label: this.$t('strings.faultmanage.processing'), value: 'processing' },
          { label: this.$t('strings.faultmanage.processed'), value: 'processed' },
          { label: this.$t('strings.faultmanage.fault_free'), value: 'fault_free' }
        ]
        if (this.searchStatus) {
          this.getFilterData(this.searchForm)
          return
        }
        this.listQuery.page = 1
        this.all_page = 1
        this.getData(this.all_page, 'all')
      }
    },
    setDefaultReportTemplate: debounce(function(data) {
      this.selected_template = data
    })
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
@import "src/assets/styles/new-base.scss";
.app_container {
  .el-top_title {
    padding-left: 20px;
    padding-top: 4px;
    margin-bottom: 14px;
    font-size: 22px;
    // font-family: sy_regular;
  }
}
</style>

