<!--
 * @author cuichuanwa
 * @date 19-11-27 上午11:20
 * @description 拓展el-transfer 组件 以支持多种数据的传入
 -->
<template>
  <div class="customTransfer">
    <el-transfer v-model="dvalue" :props="{ key: 'name',label: 'zname'}" :titles="fieldTitles" :data="data" filterable/>
  </div>
</template>

<script>
export default {
  name: 'Transfer',
  props: {
    list: {
      type: Array,
      default: () => { return [] }
    },
    valued: {
      type: Array,
      default: () => { return [] }
    }
  },
  data() {
    return {
      dvalue: [],
      data: [{ 'name': 'test1', 'zname': 'test1', 'type': 'string', 'index': 1 }, { 'name': 'test2', 'zname': 'test2', 'type': 'string', 'index': 2 }],
      fieldTitles: [this.$t('labels.comp_transfer.availableColumns'), this.$t('labels.comp_transfer.selectedColumns')]
    }
  },
  watch: {
    dvalue(newer) {
      this.$emit('callback', newer)
    },
    '$props.valued': {
      handler: function(newer) {
        this.dvalue = newer
      },
      immediate: true
    },
    '$props.list': {
      handler: function(newer) {
        const list = newer
        if (list && typeof list[0] !== 'object') {
          this.data = list.map(item => { return { name: item + '', zname: item + '' } })
        } else {
          this.data = list
        }
      },
      immediate: true
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.customTransfer {
  /deep/ .el-transfer {
    .el-transfer-panel__filter {
      .el-input__inner {
        border-radius: 6px;
      }
    }
  }
}
</style>
