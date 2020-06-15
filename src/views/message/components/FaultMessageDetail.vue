<template>
  <div>
    <template>
      <el-row :gutter="20" class="detailbox">
        <el-col :span="23" :offset="1">
          <div class="ptb20">
            <el-table
              ref="refTable"
              :data="detailData"
              fit
              border
              style="width: 100%;overflow-y: auto;"
              @expand-change="checkDetail">
              <el-table-column type="expand">
                <template slot-scope="props">
                  <el-form label-position="left" inline class="demo-table-expand">
                    <el-form-item :label="$t('labels.faultmanage.error_summary')">
                      <span>{{ props.row.attributes.error_summary }}</span>
                    </el-form-item>
                    <el-form-item :label="$t('labels.faultmanage.error_time')">
                      <span>{{ props.row.attributes.error_time }}</span>
                    </el-form-item>
                    <el-form-item :label="$t('labels.faultmanage.error_level')">
                      <span>{{ props.row.attributes.level_name }}</span>
                    </el-form-item>
                    <el-form-item v-for="(item, index) in infoData" :key="index" :label="item.title">
                      <span>{{ item.value }}</span>
                    </el-form-item>
                  </el-form>
                </template>
              </el-table-column>
              <el-table-column :show-overflow-tooltip="true" :label="$t('labels.faultmanage.error_type')" align="center" property="attributes.type_name"/>
              <el-table-column :show-overflow-tooltip="true" :label="$t('labels.faultmanage.error_summary')" property="attributes.error_summary"/>
            </el-table>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="20" style="margin-top: 30px">
        <el-col>
          <div style="float:right;">
            <el-button type="danger" plain size="mini" @click="deleteData()">{{ $t('buttons.delete') }}</el-button>
            <el-button type="primary" icon="el-icon-arrow-left" plain size="mini" @click="backList()">{{ $t('buttons.messagemanage.backToList') }}</el-button>
          </div>
        </el-col>
      </el-row>
    </template>
  </div>

</template>
<script>
import { faultDataList } from '@/api/device/fault'
export default {
  props: {
    viewStyle: {
      type: Object,
      default: null
    },
    detailData: {
      type: Array,
      default: null
    },
    detailDataId: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      tableHeight: window.innerHeight * 0.5,
      infoData: []
    }
  },
  methods: {
    getErrorInfoTableData: function(errorinfo) {
      faultDataList({
        'error_info': errorinfo }).then(res => {
        const data = res.data.data
        console.log('faultmanagement created faultDataList data', data)
        this.datalist = data
        this.listLoading = false
      }).catch(error => {
        console.log(error)
        this.listLoading = false
      })
    },
    backList: function() {
      this.$emit('backtolist', 0)
    },
    checkDetail(row, expandedRows) {
      // 此方法方便显示多行tablebody的解析
      const infoTitle = row.attributes.details_menu.split(',')
      const infoBody = row.attributes.details_value.split(',')
      this.infoData = []
      for (var i = 0; i < infoTitle.length; i++) {
        this.infoData.push({ 'title': infoTitle[i], 'value': infoBody[i] })
      }
      // this.$refs.refTable.toggleRowExpansion(row)
    },
    deleteData() {
      this.$emit('fddeleterow', this.detailDataId, 'error')
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
  .detailbox {
    height: 50vh;
    border-bottom:1px solid #ddd;
  }
  .ptb20 {
    padding-top: 20px;
    padding-bottom: 20px;
  }
  .bbd {
    border-bottom:1px solid #ddd;
  }
  .time {
    font-size: 13px;
    color: #999;
  }
  .grid-content {
    border-radius: 4px;
    min-height: 36px;
  }
  .el-table .warning-row {
    background: oldlace;
  }

  .el-table .success-row {
    background: #f0f9eb;
  }
  .messagedeletebutton {
    border: 0px;
  }
</style>
