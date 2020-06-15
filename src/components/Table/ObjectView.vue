<template>
  <div :style="'width:'+width+';height:'+height+';display: inline-block;overflow-y: scroll;position: relative;'">
    <div style="position: absolute;bottom: 6px;width: 100%;">
      <el-row v-for="(item,key) in showData" :key="key" class="tablerow">
        <el-col :span="6"><div style="border-right: 1px solid #ccc;padding:10px 5px;">{{ key }}</div></el-col>
        <el-col :span="18"><div style="padding: 10px 5px;">{{ item.toString() }}</div></el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ObjectView',
  props: {
    showData: {
      type: Object,
      default: null
    },
    width: {
      type: String,
      default: '400px'
    },
    height: {
      type: String,
      default: '400px'
    }
  },
  data() {
    return {
      testdata: {}
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .tablerow:first-child{
    border-top: 1px solid #ccc;
  }
  .tablerow{
    border-right: 1px solid #ccc;
    border-bottom: 1px solid #ccc;
    .el-col:first-child{
      border-left: 1px solid #ccc;
    }

  }
</style>
