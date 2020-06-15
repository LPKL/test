<template>
  <div style="height: 630px;">
    <!--设备实时流程列表-->
    <el-table
      :data="dataList"
      :highlight-current-row="false"
      fit
      style="width: 100%;height:615px;overflow-y: auto;">
      <el-table-column :label="$t('labels.id')" fixed="left" align="left" width="80">
        <template slot-scope="scope">
          <span>{{ (page - 1)*10 + scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('labels.flow.process_name')" show-overflow-tooltip fixed="left" align="left" width="140">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('labels.desc')" show-overflow-tooltip align="left" >
        <template slot-scope="scope">
          <span v-if="!scope.row.description">-</span>
          <span v-else :title="scope.row.description">{{ scope.row.description }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('labels.create_time')" align="left" width="300" show-overflow-tooltip>
        <template slot-scope="scope">
          <span>{{ scope.row.created_at }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('labels.experiment.recently_run')" align="left" width="300" show-overflow-tooltip>
        <template slot-scope="scope">
          <span>{{ scope.row.last_run_at }}</span>
        </template>
      </el-table-column>
      <!--      实验面板结构json-->
      <!--      <el-table-column :label="$t('labels.flow.panel_json')" show-overflow-tooltip align="left" width="200">-->
      <!--        <template slot-scope="scope">-->
      <!--          <el-tooltip placement="right">-->
      <!--            <div v-if="scope.row.panel" slot="content" style="width: 400px;overflow:auto;max-height: 400px;">{{ scope.row.panel }}</div>-->
      <!--            <div v-else slot="content" style="width: 400px;" >-</div>-->
      <!--            <el-button>{{ $t('buttons.detail') }}</el-button>-->
      <!--          </el-tooltip>-->
      <!--        </template>-->
      <!--      </el-table-column>-->
      <el-table-column :label="$t('labels.actions')" align="left" class-name="small-padding fixed-width" width="200">
        <template slot-scope="scope">
          <div style="height: 36px;">
            <el-button v-is-show="{name:'dfedit'}" size="mini" plain @click="toModelFLow(scope.row.id)">{{ $t('buttons.view') }}</el-button>
            <el-button v-is-show="{name:'dfdelete'}" size="mini" plain @click="deleteHandle(scope.row.id, scope.$index)" >{{ $t('buttons.delete') }}</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>

import { deleteManageProject } from '@/api/experiment'
// import { deleteConfirm } from '@/utils/actions'
const calendarTypeOptions = [
  { key: 'CN', display_name: 'CSV' },
  { key: 'US', display_name: 'XML' },
  { key: 'JP', display_name: 'MySql' },
  { key: 'EU', display_name: 'Postgre' }
]
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})
export default {
  name: 'HisTable',
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type]
    },
    jsonparse(json) {
      console.log(json)
      return JSON.parse(json)
    }
  },
  props: {
    dataList: {
      type: Array,
      default: null
    },
    type: {
      type: String,
      default: null
    },
    listLoading: {
      type: Boolean,
      default: null
    },
    page: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      showReviewer: false
    }
  },
  methods: {
    deleteHandle(msg, index) {
      const proid = this.$store.getters.curProId
      this.$confirm(this.$t('strings.flow.delete_flow'), this.$t('labels.reminder'), confirm).then(() => {
        deleteManageProject(msg).then(res => {
          this.$message.success(this.$t('messages.delete_success'))
          parseInt(proid) === parseInt(msg) ? this.$store.dispatch('setProid', null) : null // 去掉store中的curProId
          this.$emit('chenge')
        })
      }).catch(() => {
        this.$message.info(this.$t('messages.cancel_operate'))
      })
    },
    toModelFLow(id) {
      this.$store.dispatch('setProid', parseInt(id, 10))
      this.$router.push({ path: '/newmodel/' })
    }
  }

}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
@import "src/assets/styles/new-base.scss";
</style>
