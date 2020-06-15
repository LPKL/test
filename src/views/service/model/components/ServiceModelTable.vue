<template>
  <div style="height: 630px;">
    <!--设备实时流程列表-->
    <el-table
      v-loading="tableLoading"
      ref="serviceModelTable"
      :data="dataList"
      :highlight-current-row="false"
      style="width: 100%;height:615px;overflow-y: auto;"
      @cell-click="clickCellData"
      @selection-change="handleSelectionChange">
      <el-table-column align="center" type="selection" />
      <el-table-column :label="$t('labels.service.name')" show-overflow-tooltip fixed align="left" prop="name" min-width="156px">
        <template slot-scope="scope">
          <el-input v-focus v-if="scope.row.editname && scope.row.creator.id === currentUser" ref="name" v-model="scope.row.name" @change="changeAndLoseFcous('name', scope.$index, scope.row)" @blur="lostFcous('name', scope.row)"/>
          <span v-else>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('labels.desc')" show-overflow-tooltip align="left" prop="description" min-width="180px">
        <template slot-scope="scope">
          <el-input v-focus v-if="scope.row.editdescription && scope.row.creator.id === currentUser" ref="description" v-model="scope.row.description" @change="changeAndLoseFcous('description', scope.$index, scope.row)" @blur="lostFcous('description', scope.row)"/>
          <span v-else>{{ scope.row.description }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('labels.service.model.callmodel')" show-overflow-tooltip align="left" min-width="180px">
        <template slot-scope="scope">
          <el-popover
            :title="$t('labels.service.model.detail')"
            placement="bottom"
            width="488"
            trigger="click"
            class="realproject">
            <el-divider />
            <table class="dialogDetail">
              <tr style="vertical-align:top"><td><label>{{ $t('labels.service.model.index') + $t('labels.name') }} : </label></td><td>{{ modelDetailData.name }}</td></tr>
              <tr style="vertical-align:top"><td><label>{{ $t('labels.service.model.index') + $t('labels.desc') }} : </label></td><td>{{ modelDetailData.description }}</td></tr>
              <tr style="vertical-align:top"><td><label>{{ $t('labels.create_time') }} : </label></td><td>{{ modelDetailData.create_time }}</td></tr>
              <tr style="vertical-align:top"><td><label>{{ $t('labels.update_time') }} : </label></td><td>{{ modelDetailData.updated_time }}</td></tr>
            </table>
            <span slot="reference" @click="getModelDataById(scope.row.model.id, scope.row.type)">{{ scope.row.model.name }}</span>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column :label="$t('labels.create_time')" align="left" show-overflow-tooltip min-width="185px" prop="created_at" />
      <el-table-column :label="$t('labels.update_time')" align="left" show-overflow-tooltip min-width="185px" prop="updated_at" />
      <el-table-column :label="$t('labels.creator')" align="left" show-overflow-tooltip min-width="132px" prop="creator.username" />
      <el-table-column :label="$t('labels.status')" align="left" min-width="114px" style="display: flex;">
        <template slot-scope="scope">
          <svg-icon v-if="scope.row.state === 'error'" icon-class="service_error" style="height:24px; width:24px;"/>
          <svg-icon v-if="scope.row.state === 'running'" icon-class="service_running" style="height:24px; width:24px;"/>
          <svg-icon v-if="scope.row.state === 'stop'" icon-class="service_stop" style="height:24px; width:24px;"/>
          <svg-icon v-if="scope.row.state === 'deploying'" icon-class="service_deploying" style="height:24px; width:24px;"/>
          {{ statusMap[scope.row.state] }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('labels.service.publish')" prop="enabled" align="center" min-width="52px">
        <template slot-scope="scope">
          <el-switch
            :active-value="true"
            :inactive-value="false"
            :disabled="scope.row.state === 'deploying' ? true : false"
            v-model="scope.row.enabled"
            active-color="#0f32b5"
            inactive-color="#ccc"
            @change="changeEnabledStatus(scope.$index, scope.row)"/>
        </template>
      </el-table-column>
      <el-table-column :label="$t('labels.actions')" prop="is_active" align="center" min-width="264px">
        <template slot-scope="scope">
          <div style="height: 36px; display:flex;">
            <el-button size="small" style="width: 96px; margin-top: 4px;" plain @click="openClientDialog(scope.row)">{{ $t('buttons.service.model.callinfo') }}</el-button>
            <el-button :disabled="scope.row.state === 'running' ? false : true" size="small" style="width: 64px; margin-top: 4px;" plain @click="openTestDialog(scope.row.id, scope.row.model, scope.row.path)">{{ $t('buttons.service.model.test') }}</el-button>
            <!-- <el-button size="small" style="width: 64px; margin-top: 4px;" plain @click="openUpdateDialog(scope.row.id, scope.row.model.id)">{{ $t('buttons.update') }}</el-button> -->
            <el-dropdown v-show="scope.row.creator.id === currentUser" trigger="click" @command="handleCommand">
              <span>
                <el-button size="small" circle class="moreOperator" style="width:28px; border-radius:14px; margin-top: 4px;"><svg-icon icon-class="ellipsis_32" style="height:24px; width:24px;" /></el-button>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item ref="editServiceButton" :command="composeValue('edit', scope.row)">{{ $t('buttons.edit') }}</el-dropdown-item>
                <el-dropdown-item :command="composeValue('delete',scope.row)" divided>{{ $t('buttons.delete') }}</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>

export default {
  name: 'ServiceModelTable',
  directives: {
    focus: {
      inserted: function(el) {
        el.querySelector('input').focus()
      }
    }
  },
  props: {
    dataList: {
      type: Array,
      default: null
    },
    tableLoading: {
      type: Boolean,
      default: null
    },
    page: {
      type: Number,
      default: 1
    },
    showModelDetailData: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      currentUser: this.$store.state.user.id,
      statusMap: {
        deploying: this.$t('labels.service.model.status_deploying'),
        stop: this.$t('labels.service.model.status_stop'),
        running: this.$t('labels.service.model.status_running'),
        error: this.$t('labels.service.model.status_error')
      },
      multipleSelection: [] // 批量选择
    }
  },
  computed: {
    modelDetailData() {
      return this.showModelDetailData
    }
  },
  methods: {
    // 对table cell 单击进行编辑
    clickCellData(row, column, cell, event) {
      if (column.property === 'name' || column.property === 'description') {
        if (column.property === 'name') {
          row.editname = true
        } if (column.property === 'description') {
          row.editdescription = true
        }
        // input获取焦点 todo 多次聚焦这里使用指令
        // this.$nextTick(function() {
        //   this.$refs[column.property].focus()
        // })
      }
    },
    lostFcous(columnprop, row) {
      // 未修改的失去焦点
      if (columnprop === 'name') {
        row.editname = false
      } else if (columnprop === 'description') {
        row.editdescription = false
      }
      this.$emit('editedTableCell', row)
    },
    changeAndLoseFcous(columnprop, index, row) {
      // console.log('changeAndLoseFcous', index, row)
      this.lostFcous(columnprop, row)
    },
    // 改变个体发布状态
    changeEnabledStatus(idx, row) {
      // const rowData = { ...row }
      // console.log('rowData', idx, row)
      this.$refs.serviceModelTable.clearSelection() // 单独和批量都有更改发布状态操作
      this.$emit('enabledStatus', row.id, row.enabled)
    },
    getModelDataById(modelid, modeltype) {
      this.$emit('selectedModelId', modelid, modeltype)
    },
    openClientDialog(row) {
      // console.log('openClientDialog', row)
      // TODO: 怎样获得client信息，API？ service里面自带？
      this.$emit('openDialog', 'client')
      this.$emit('clientData', row)
    },
    openTestDialog(serviceid, model, path) {
      // console.log('openTestDialog', serviceid, model, path)
      this.$emit('openDialog', 'test')
      this.$emit('toTestData', serviceid, model, path)
    },
    openUpdateDialog(serviceid, modelid) {
      // 在此之前，如果已经进行过多选列表操作，需要取消全部选择, 因单独和批量都有更新操作
      this.$refs.serviceModelTable.clearSelection()
      this.$emit('toUpdateModelData', serviceid, modelid)
    },
    // 展开更多操作
    handleCommand(command) {
      if (command.type === 'edit') {
        this.$emit('openDialog', 'edit')
        this.$emit('toEditData', { 'id': command.row.id, 'name': command.row.name, 'description': command.row.description })
      } else if (command.type === 'delete') {
        this.$emit('toDeleteId', command.row.id)
      }
    },
    composeValue(type, row) {
      return {
        'type': type,
        'row': row
      }
    },
    // 多选
    handleSelectionChange(val) {
      this.multipleSelection = val
      this.$emit('multipleSelection', this.multipleSelection)
    }
  }

}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
@import "src/assets/styles/new-base.scss";

/deep/.el-table tr td .cell {
  display:flex;
}
.moreOperator {
  // width:28px;
  // height:28px;
  // border-radius:14px;
  margin-left: 8px;
}
</style>
