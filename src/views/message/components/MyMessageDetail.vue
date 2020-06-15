<template>
  <div>
    <template>
      <el-row :gutter="20" class="detailbox">
        <el-col :span="23" :offset="1">
          <div class="bbd ptb20">
            <span v-if="detailData != null" style="font-weight:bold">{{ detailData.attributes.title }}</span>
            <div>
              <time v-if="detailData != null" class="time">{{ detailData.attributes.create_time }}</time>
            </div>
          </div>
          <div class="ptb20">
            <span v-if="detailData != null && detailData.attributes.to_group === 1">{{ $t('labels.messagemanage.to') + $t('labels.messagemanage.system_users') }}:</span>
            <span v-else-if="detailData != null && detailData.attributes.to_group === 2">{{ $t('labels.messagemanage.to') + $t('labels.messagemanage.company_users') }}:</span>
            <div style="margin-top: 20px">
              <span v-if="detailData != null">{{ detailData.attributes.information }}</span>
            </div>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="20" style="margin-top: 30px">
        <el-col>
          <el-button type="primary" icon="el-icon-arrow-left" style="float:right;" plain size="mini" @click="backList()">{{ $t('buttons.messagemanage.backToList') }}</el-button>
        </el-col>
      </el-row>
    </template>
  </div>

</template>
<script>
export default {
  props: {
    viewStyle: {
      type: Object,
      default: null
    },
    detailData: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      detail: this.detailData,
      tableHeight: window.innerHeight * 0.5
    }
  },
  watch: {
    detail: function(newValue) {
      console.log(newValue)
    }
  },
  methods: {
    backList: function() {
      this.$emit('backtolist', 0)
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
