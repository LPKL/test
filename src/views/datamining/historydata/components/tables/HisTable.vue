<template>
  <div style="height: 630px;">
    <el-table
      :data="dataList"
      :default-sort = "{prop: 'date', order: 'descending'}"
      :highlight-current-row="false"
      fit
      style="width: 100%;height:625px;overflow-y: auto;">
      <el-table-column :label="$t('labels.id')" fixed="left" align="left" width="80%">
        <template slot-scope="scope">
          <span>{{ (page - 1)*10 + scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('labels.name')" fixed="left" align="left" min-width="180%" show-overflow-tooltip>
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('labels.dfilemanage.fileinfo')" align="left" min-width="240%" show-overflow-tooltip>
        <template slot-scope="scope">
          <span v-if="!scope.row.description">--</span>
          <span v-else>{{ scope.row.description }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="`${$t('labels.devicemanage.database')}/${$t('labels.devicemanage.datatable')}`" show-overflow-tooltip align="left" min-width="250%">
        <template slot-scope="scope">
          <span>{{ `${scope.row.database_name}/${scope.row.table_name}` }}</span>
        </template>
      </el-table-column>
      <el-table-column label="表结构" show-overflow-tooltip align="left" min-width="250%">
        <template slot-scope="scope">
          <span>{{ scope.row.schemas.name }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('labels.dfilemanage.filetype')" align="left" min-width="150%" show-overflow-tooltip>
        <template slot-scope="scope">
          <span>{{ scope.row.type }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('labels.dfilemanage.date')" align="left" min-width="240%" show-overflow-tooltip>
        <template slot-scope="scope">
          <span>{{ scope.row.created_at }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('labels.dfilemanage.creator')" align="left" min-width="200%" show-overflow-tooltip>
        <template slot-scope="scope">
          <span>{{ scope.row.creator.username }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('labels.actions')" align="left" class-name="small-padding fixed-width" min-width="240%">
        <template slot-scope="scope">
          <div style="height: 36px;">
            <el-button v-if="scope.row.type !== 'wav'" class="preview" @click="previewData(scope.row.id,scope.row)">{{ $t('buttons.preview') }}</el-button>
            <!-- <el-button v-is-show="{name:'dataflow'}" class="delete" @click="delFile(scope.row.id, scope.row.src_type)" >{{ $t('buttons.delete') }}</el-button> -->
            <el-button v-if="$store.state.user.name === scope.row.creator.username" class="delete" @click="delFile(scope.row.id, scope.row.src_type)" >{{ $t('buttons.delete') }}</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>

</template>
<script>
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
    }
  },
  props: {
    dataList: {
      type: Array,
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
  mounted() {
  },
  methods: {
    // 删除文件 参数文件id
    delFile(id, type) {
      this.$emit('deleteData', id)
    },
    previewData(id, rowdata) {
      this.$emit('datapreview', id, rowdata)
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
@import "src/assets/styles/new-base.scss";
</style>
