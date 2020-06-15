<template>
  <el-tabs type="card" v-model="pgTable" class="evaluation-wrap">
    <div v-for="(item,key) in datalist" :key="key">
      <el-tab-pane :label="item.title" :name="key.toString()">
        <div v-for="tb in item.value" :key="tb.title" class="pgTable">
          <!-- <h6>{{ tb.title }}</h6> -->
          <el-table :header-row-style="{textAlign:'center'}" :data="tb.value">
            <el-table-column
              v-for="col in tb.cols"
              :key="col.prop"
              :min-width="col.width"
              :prop="col.prop"
              :label="col.label"
            />
          </el-table>
        </div>
      </el-tab-pane>
    </div>
  </el-tabs>
</template>

<script>
export default {
  name: "Evaluation",
  props: {
    lists: {
      type: Array,
      default: null
    }
  },
  data() {
    return {
      pgTable: "0",
      datalist: []
    }
  },
  watch:{
  '$props.lists':{
    handler:function(newer,older){
      this.datalist  = this.parseData(newer)
    },
    deep:true
    }
  },
  methods: {
    /**
       * 将数据转换成可渲染格式
       * rawdata：
       * {
            compname: "arima",
            title: "评估指标",
            value: [
              {
                type: "table",
                title: "有效性指标",
                cols: ["模型有效性指标", "值"],
                value: [
                  ["AIC", 3.827],
                  ["BIC", 0.322]
                ]
              },
              {
                type: "table",
                title: "T检验",
                cols: ["模型参数", "T检验统计量", "p-value"],
                value: [
                  ["const", 0.3227236116378389, 0.7474075769488868],
                  ["ar2", 0.3227236116378389, 0.7474075769488868]
                ]
              }
            ]
          }
       */
    parseData(data) {
      let result = []
      console.log("评估预览初始数据,", data)
      data.forEach(el => {
        let group = { compname: el.compname, title: el.title }
        group.value = []
        for (let i = 0; i < el.value.length; i++) {
          let rawItem = el.value[i]
          let item = { type: rawItem.type, title: rawItem.title }
          let len = rawItem.cols.length
          //表格列信息（宽度按列数平分）
          item.cols = rawItem.cols.map((col, k) => {
            return {
              seq: k,
              prop: `prop${k}`,
              label: col,
              width: `${Math.floor(100 / len)}%`
            };
          });
          item.value = []
          //表格数据
          rawItem.value.forEach(row => {
            let rowdata = {}
            item.cols.map(c => {
              rowdata[c.prop] = row[c.seq]
            });
            item.value.push(rowdata)
          })
          group.value.push(item)
        }
        result.push(group)
      })
      console.log("评估预览转换数据,", result)
      return result;
    }
  },
  mounted() {
    this.datalist = this.parseData(this.$props.lists)
  }
};
</script>

<style  rel="stylesheet/scss" lang="scss" scoped>
.evaluation-wrap{
  min-height: 400px;
  max-height: 70vh;
  overflow: auto;
  .pgTable {
  margin: 0 20px 30px 10px;
    /deep/ .el-table {
      margin: 0 20px;
      width:98%;
      border: 1px solid #eee;
    }
  }
}
</style>
