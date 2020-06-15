<!--原生el-table组件-->
<template>
  <div class="baseel-table-wrapper">
    <p class="baseel-table-header">{{ tableTitle }}</p>
    <el-table
      :data="tableData"
      :height="height"
      style="width: 100%;">
      <el-table-column
        v-for="(item,key) in headerData"
        :key="key"
        :prop="item.prop"
        :label="item.label"
        :width="item.width"
        show-overflow-tooltip/>
    </el-table>
  </div>
</template>

<script>
export default {
  name: 'BaseElTable',
  props: {
    tableData: {
      type: Array,
      default: null
    },
    headerData: {
      type: Array,
      default: null
    },
    tableTitle: {
      type: String,
      default: ''
    },
    height: {
      type: String,
      default: '400px'
    }
  },
  data() {
    return {
      // todo test
      // headerData: [{ prop: 'date', label: '日期11', width: '180' }, { prop: 'name', label: '姓名11', width: '180' }, { prop: 'address', label: '地址11' }],
      // tableData: [{
      //   date: '2016-05-02',
      //   name: '王小虎',
      //   address: '上海市普陀区金沙江路 1518 弄'
      // }, {
      //   date: '2016-05-04',
      //   name: '王小虎',
      //   address: '上海市普陀区金沙江路 1517 弄'
      // }, {
      //   date: '2016-05-01',
      //   name: '王小虎',
      //   address: '上海市普陀区金沙江路 1519 弄'
      // }, {
      //   date: '2016-05-03',
      //   name: '王小虎',
      //   address: '上海市普陀区金沙江路 1516 弄'
      // }]
    }
  },
  created() {
    console.log(this.$props)
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
  .baseel-table-wrapper{
    background: #f1f1f1;
    padding:8px;
    .baseel-table-header{
      text-align: center;
      width:100%;
      font-weight: bold;
    }
    .el-table__body-wrapper{
      background: #f1f1f1;
    }
  }
</style>

